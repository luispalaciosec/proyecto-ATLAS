import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { DomainEvent } from '@atlas/events';
import { describe, expect, it } from 'vitest';

import {
  AtlasContextBuilder,
  createAtlas,
  createAtlasToolExecutors,
  GOVERNANCE_RECORD_TYPE_ACTION_OPERATIONAL_RESULT,
  GOVERNANCE_RECORD_TYPE_APPROVED_DISCOUNT,
  GovernanceActionBlockedEvent,
  GovernanceActionExecutedEvent,
  listAtlasOrgToolNames,
  parseActionOperationalResultFromRecord,
  prepareIngestedDocumentKnowledge,
  storeIngestedDocumentKnowledgeObject,
} from '../src/index.js';
import {
  ORG_RECORD_TYPE_APPROVAL_RULE,
  ORG_RECORD_TYPE_CLIENT,
  ORG_RECORD_TYPE_DISCOUNT_POLICY,
  ORG_RELATIONSHIP_DEPENDENCY,
  ORG_RELATIONSHIP_REFERENCE,
} from '../src/org/constants.js';
import { seedCase1DiscountGraph } from '../src/org/fixtures.js';
import type {
  GovernanceActionBlockedPayload,
  GovernanceActionExecutedPayload,
} from '../src/governance/governance-events.js';

function createWorkspaceAtlas(workspaceName: string) {
  const dir = mkdtempSync(join(tmpdir(), `atlas-int007-${workspaceName}-`));

  return Object.freeze({
    dir,
    atlas: createAtlas({
      workspace: { name: workspaceName },
      memory: { storageFilePath: join(dir, 'memory.json') },
    }),
  });
}

async function seedConstructoraAndesGraph(atlas: ReturnType<typeof createAtlas>): Promise<void> {
  await atlas.org.storeEntity(ORG_RECORD_TYPE_CLIENT, 'record.client.constructora-andes', {
    legalName: 'Constructora Andes S.A.',
    segment: 'VIP',
    renewalActive: true,
  });

  await atlas.org.storeEntity(
    ORG_RECORD_TYPE_DISCOUNT_POLICY,
    'record.policy.discount.autonomous',
    {
      policyCode: 'DISCOUNT-VIP-2026',
      autonomousMaxPercent: 10,
      currency: 'USD',
    },
  );

  await atlas.org.storeEntity(ORG_RECORD_TYPE_APPROVAL_RULE, 'record.rule.discount-approval', {
    appliesWhen: 'discountPercent > autonomousMaxPercent',
    approverRole: 'SalesDirector',
    approverQueue: 'sales-directors',
  });

  await atlas.org.linkEntities(
    'record.client.constructora-andes',
    'record.policy.discount.autonomous',
    ORG_RELATIONSHIP_REFERENCE,
  );

  await atlas.org.linkEntities(
    'record.policy.discount.autonomous',
    'record.rule.discount-approval',
    ORG_RELATIONSHIP_DEPENDENCY,
  );
}

async function registerSalesDirectorApproval(atlas: ReturnType<typeof createAtlas>): Promise<void> {
  await atlas.org.storeEvidence('record.evidence.andes-renewal-2023', {
    content: 'cliente en renovación continua desde 2023, sin incidentes de pago',
    sourceType: 'manual',
    recordedBy: 'SalesDirector',
    recordedAt: '2026-08-15',
  });

  await atlas.org.recordDecision(
    'record.decision.andes-discount-2026-08-15',
    {
      subjectType: 'discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
      outcome: 'approved',
      approvedPercent: 12,
      decidedBy: 'SalesDirector',
      decidedAt: '2026-08-15',
      requestId: 'req.andes-discount-2026-08',
    },
    'record.client.constructora-andes',
    ['record.evidence.andes-renewal-2023'],
  );
}

describe('INT-007 Event → Result → Memory Closure', () => {
  it('INT-007-A: executed action produces canonical Result', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');

    await seedConstructoraAndesGraph(atlas);
    await registerSalesDirectorApproval(atlas);

    const outcome = await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
      requestId: 'req.andes-discount-2026-08',
    });

    expect(outcome.executed).toBe(true);
    expect(outcome.result.status).toBe('executed');
    expect(outcome.result.executed).toBe(true);
    expect(outcome.result.actionType).toBe('record_approved_discount_request');
    expect(outcome.result.workspace).toBe('geeks');
    expect(outcome.result.clientLegalName).toBe('Constructora Andes S.A.');
    expect(outcome.result.requestedPercent).toBe(12);
    expect(outcome.result.authorization.decisionId).toBe(
      'record.decision.andes-discount-2026-08-15',
    );
    expect(outcome.result.authorization.policyId).toBe('DISCOUNT-VIP-2026');
    expect(outcome.result.authorization.evidenceIds).toEqual([
      'record.evidence.andes-renewal-2023',
    ]);
    expect(outcome.resultRecordId).toBeTruthy();

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-007-B: executed action produces corresponding Event', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');

    await seedConstructoraAndesGraph(atlas);
    await registerSalesDirectorApproval(atlas);

    const events: DomainEvent<GovernanceActionExecutedPayload>[] = [];
    atlas.events.subscribe(GovernanceActionExecutedEvent, (event) => {
      events.push(event);
    });

    const outcome = await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    expect(events).toHaveLength(1);
    expect(events[0]?.payload.resultRecordId).toBe(outcome.resultRecordId);
    expect(events[0]?.payload.recordId).toBe(outcome.execution?.recordId);
    expect(outcome.eventId).toBe(events[0]?.id);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-007-C: executed action persists Result into Memory', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');

    await seedConstructoraAndesGraph(atlas);
    await registerSalesDirectorApproval(atlas);

    const outcome = await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    const stored = await atlas.memory.listRecords({
      recordType: GOVERNANCE_RECORD_TYPE_ACTION_OPERATIONAL_RESULT,
    });

    expect(stored.total).toBe(1);
    expect(stored.records[0]?.id).toBe(outcome.resultRecordId);

    const parsed = parseActionOperationalResultFromRecord(stored.records[0]!);
    expect(parsed.status).toBe('executed');
    expect(parsed.capabilityRecordId).toBe(outcome.execution?.recordId);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-007-D: persisted Result is retrievable through RetrievalModule.searchContent()', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');

    await seedConstructoraAndesGraph(atlas);
    await registerSalesDirectorApproval(atlas);

    await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    const search = await atlas.retrieval.searchContent({
      query: 'Constructora Andes descuento aprobado 12%',
    });

    expect(search.total).toBeGreaterThan(0);
    const match = search.records.find(
      (record) => record.type === GOVERNANCE_RECORD_TYPE_ACTION_OPERATIONAL_RESULT,
    );
    expect(match).toBeDefined();

    const parsed = parseActionOperationalResultFromRecord(match!);
    expect(parsed.status).toBe('executed');
    expect(parsed.requestedPercent).toBe(12);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-007-E: retrieved Result preserves workspace isolation', async () => {
    const geeks = createWorkspaceAtlas('geeks');
    const revital = createWorkspaceAtlas('revital');

    await seedConstructoraAndesGraph(geeks.atlas);
    await registerSalesDirectorApproval(geeks.atlas);

    await geeks.atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    const geeksSearch = await geeks.atlas.retrieval.searchContent({
      query: 'Constructora Andes descuento aprobado 12%',
    });
    const revitalSearch = await revital.atlas.retrieval.searchContent({
      query: 'Constructora Andes descuento aprobado 12%',
    });

    expect(
      geeksSearch.records.some(
        (record) => record.type === GOVERNANCE_RECORD_TYPE_ACTION_OPERATIONAL_RESULT,
      ),
    ).toBe(true);
    expect(
      revitalSearch.records.some(
        (record) => record.type === GOVERNANCE_RECORD_TYPE_ACTION_OPERATIONAL_RESULT,
      ),
    ).toBe(false);

    rmSync(geeks.dir, { recursive: true, force: true });
    rmSync(revital.dir, { recursive: true, force: true });
  });

  it('INT-007-F: retrieved Result preserves actionType/target/requestedPercent', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');

    await seedConstructoraAndesGraph(atlas);
    await registerSalesDirectorApproval(atlas);

    await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    const search = await atlas.retrieval.searchContent({
      query: 'Constructora Andes descuento aprobado',
    });
    const record = search.records.find(
      (entry) => entry.type === GOVERNANCE_RECORD_TYPE_ACTION_OPERATIONAL_RESULT,
    );

    expect(record).toBeDefined();
    const parsed = parseActionOperationalResultFromRecord(record!);
    expect(parsed.actionType).toBe('record_approved_discount_request');
    expect(parsed.clientLegalName).toBe('Constructora Andes S.A.');
    expect(parsed.requestedPercent).toBe(12);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-007-G: retrieved Result preserves decisionId/policyId/evidenceIds', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');

    await seedConstructoraAndesGraph(atlas);
    await registerSalesDirectorApproval(atlas);

    await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    const search = await atlas.retrieval.searchContent({
      query: 'Constructora Andes descuento aprobado DISCOUNT-VIP-2026',
    });
    const record = search.records.find(
      (entry) => entry.type === GOVERNANCE_RECORD_TYPE_ACTION_OPERATIONAL_RESULT,
    );

    expect(record).toBeDefined();
    const parsed = parseActionOperationalResultFromRecord(record!);
    expect(parsed.authorization.decisionId).toBe('record.decision.andes-discount-2026-08-15');
    expect(parsed.authorization.policyId).toBe('DISCOUNT-VIP-2026');
    expect(parsed.authorization.evidenceIds).toEqual(['record.evidence.andes-renewal-2023']);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-007-H: blocked action produces governance result/event but no executed capability result', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');

    await seedConstructoraAndesGraph(atlas);

    const blockedEvents: DomainEvent<GovernanceActionBlockedPayload>[] = [];
    atlas.events.subscribe(GovernanceActionBlockedEvent, (event) => {
      blockedEvents.push(event);
    });

    const outcome = await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    expect(outcome.executed).toBe(false);
    expect(outcome.result.status).toBe('blocked');
    expect(outcome.result.executed).toBe(false);
    expect(outcome.execution).toBeUndefined();
    expect(blockedEvents).toHaveLength(1);
    expect(blockedEvents[0]?.payload.resultRecordId).toBe(outcome.resultRecordId);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-007-I: blocked action does not create ApprovedDiscountRequest', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');

    await seedConstructoraAndesGraph(atlas);

    await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    const capabilityRecords = await atlas.memory.listRecords({
      recordType: GOVERNANCE_RECORD_TYPE_APPROVED_DISCOUNT,
    });
    const operationalResults = await atlas.memory.listRecords({
      recordType: GOVERNANCE_RECORD_TYPE_ACTION_OPERATIONAL_RESULT,
    });

    expect(capabilityRecords.total).toBe(0);
    expect(operationalResults.total).toBe(1);
    expect(operationalResults.records[0]?.metadata.status).toBe('blocked');

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-007-J: full end-to-end chain through Retrieval', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');

    await seedConstructoraAndesGraph(atlas);
    await registerSalesDirectorApproval(atlas);

    const executedEvents: DomainEvent<GovernanceActionExecutedPayload>[] = [];
    atlas.events.subscribe(GovernanceActionExecutedEvent, (event) => {
      executedEvents.push(event);
    });

    const outcome = await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
      requestId: 'req.andes-discount-2026-08',
    });

    expect(outcome.executed).toBe(true);
    expect(executedEvents).toHaveLength(1);

    const search = await atlas.retrieval.searchContent({
      query: 'Constructora Andes descuento aprobado 12%',
    });
    const retrieved = search.records.find((record) => record.id === outcome.resultRecordId);

    expect(retrieved).toBeDefined();
    const parsed = parseActionOperationalResultFromRecord(retrieved!);
    expect(parsed.authorization.decisionId).toBe('record.decision.andes-discount-2026-08-15');
    expect(parsed.authorization.policyId).toBe('DISCOUNT-VIP-2026');
    expect(parsed.authorization.evidenceIds).toEqual(['record.evidence.andes-renewal-2023']);
    expect(parsed.capabilityRecordId).toBe(outcome.execution?.recordId);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-007-K: regression — KnowledgeObject ingest remains green', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int007-k-'));
    const atlas = createAtlas({ memory: { storageFilePath: join(dir, 'memory.json') } });

    const ingest = prepareIngestedDocumentKnowledge({
      documentId: 'doc.int007.k',
      fileName: 'regression.txt',
      fileType: 'text/plain',
      folder: 'General',
      workspace: 'default',
      uploadedAt: '2026-09-08T12:00:00.000Z',
    });

    const stored = await storeIngestedDocumentKnowledgeObject(atlas.memory, ingest);
    expect(stored.knowledgeObjectRecord.recordId).toBeTruthy();

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-007-L: regression — AtlasContextBuilder remains green', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int007-l-'));
    const atlas = createAtlas({
      workspace: { name: 'geeks' },
      memory: { storageFilePath: join(dir, 'memory.json') },
    });

    const context = await AtlasContextBuilder.build({
      goal: 'Consulta INT-007-L',
      atlas,
      workspace: 'geeks',
      contextPrompt: 'Marca demo',
    });

    expect(context.systemPrompt.length).toBeGreaterThan(0);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-007-M: regression — INT-001 Retrieval unification remains green', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int007-m-'));
    const atlas = createAtlas({ memory: { storageFilePath: join(dir, 'memory.json') } });

    await atlas.memory.storeContent({
      content: 'termino-retrieval-unificacion-int007',
      recordType: 'document',
    });

    const search = await atlas.retrieval.searchContent({
      query: 'termino-retrieval-unificacion-int007',
    });

    expect(search.total).toBe(1);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-007-N: regression — INT-005 Org tools remain green', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int007-n-'));
    const atlas = createAtlas({ memory: { storageFilePath: join(dir, 'memory.json') } });

    const toolNames = createAtlasToolExecutors(atlas).map((tool) => tool.definition.name);
    expect(toolNames).toEqual(expect.arrayContaining([...listAtlasOrgToolNames()]));

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-007-O: regression — INT-006 Governance gate remains green', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');

    await seedCase1DiscountGraph(atlas);

    const blocked = await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    expect(blocked.executed).toBe(false);
    expect(blocked.result.status).toBe('blocked');

    await atlas.org.recordDecision(
      'record.decision.andes-discount-2026-08-15',
      {
        subjectType: 'discount_request',
        clientLegalName: 'Constructora Andes S.A.',
        requestedPercent: 12,
        outcome: 'approved',
        approvedPercent: 12,
        decidedBy: 'SalesDirector',
        decidedAt: '2026-08-15',
      },
      'record.client.constructora-andes',
    );

    const allowed = await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    expect(allowed.executed).toBe(true);
    expect(allowed.result.status).toBe('executed');

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-007 integration: approved path then blocked path without approval', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');

    await seedConstructoraAndesGraph(atlas);
    await registerSalesDirectorApproval(atlas);

    const allowed = await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    expect(allowed.executed).toBe(true);
    expect(allowed.result.status).toBe('executed');

    const approvedRecords = await atlas.memory.listRecords({
      recordType: GOVERNANCE_RECORD_TYPE_APPROVED_DISCOUNT,
    });
    expect(approvedRecords.total).toBe(1);

    const geeksAtlas2 = createAtlas({
      workspace: { name: 'geeks' },
      memory: { storageFilePath: join(dir, 'memory-blocked.json') },
    });

    await seedConstructoraAndesGraph(geeksAtlas2);

    const blocked = await geeksAtlas2.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    expect(blocked.executed).toBe(false);
    expect(blocked.result.status).toBe('blocked');

    const blockedCapability = await geeksAtlas2.memory.listRecords({
      recordType: GOVERNANCE_RECORD_TYPE_APPROVED_DISCOUNT,
    });
    expect(blockedCapability.total).toBe(0);

    rmSync(dir, { recursive: true, force: true });
  });
});
