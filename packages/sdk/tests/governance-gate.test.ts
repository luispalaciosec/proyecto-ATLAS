import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { DomainEvent } from '@atlas/events';
import { describe, expect, it } from 'vitest';

import {
  AtlasContextBuilder,
  createAtlas,
  createAtlasToolExecutors,
  createOrgLlmToolExecutors,
  GOVERNANCE_RECORD_TYPE_APPROVED_DISCOUNT,
  GovernanceActionBlockedEvent,
  GovernanceActionExecutedEvent,
  listAtlasOrgToolNames,
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
import { readEntityPayload } from '../src/org/entity-resolver.js';
import { seedCase1DiscountGraph, seedCase2WarrantyPolicy } from '../src/org/fixtures.js';
import { parseDecision } from '../src/org/schemas/decision.js';
import type {
  GovernanceActionBlockedPayload,
  GovernanceActionExecutedPayload,
} from '../src/governance/governance-events.js';

function createWorkspaceAtlas(workspaceName: string) {
  const dir = mkdtempSync(join(tmpdir(), `atlas-int006-${workspaceName}-`));

  return Object.freeze({
    dir,
    atlas: createAtlas({
      workspace: { name: workspaceName },
      memory: { storageFilePath: join(dir, 'memory.json') },
    }),
  });
}

async function seedConstructoraAndesViaOrgApi(
  atlas: ReturnType<typeof createAtlas>,
): Promise<void> {
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

describe('INT-006 Governance Gate + Controlled Internal Action', () => {
  it('INT-006-A: an action without required approval executes autonomously', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');

    await seedCase1DiscountGraph(atlas);

    const blockedEvents: DomainEvent<GovernanceActionBlockedPayload>[] = [];
    const executedEvents: DomainEvent<GovernanceActionExecutedPayload>[] = [];

    atlas.events.subscribe(GovernanceActionBlockedEvent, (event) => {
      blockedEvents.push(event);
    });
    atlas.events.subscribe(GovernanceActionExecutedEvent, (event) => {
      executedEvents.push(event);
    });

    const result = await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 8,
    });

    expect(result.executed).toBe(true);
    expect(result.authorization.allowed).toBe(true);
    expect(result.authorization.policyId).toBe('DISCOUNT-VIP-2026');
    expect(result.execution?.recordId).toBeTruthy();
    expect(blockedEvents).toHaveLength(0);
    expect(executedEvents).toHaveLength(1);
    expect(executedEvents[0]?.payload.requestedPercent).toBe(8);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-006-B: 12% with 10% autonomy limit is blocked without approval', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');

    await seedCase1DiscountGraph(atlas);

    const result = await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    expect(result.executed).toBe(false);
    expect(result.authorization.allowed).toBe(false);
    expect(result.authorization.requiredApprovalRole).toBe('SalesDirector');
    expect(result.authorization.reason).toContain('Requiere aprobación de SalesDirector');

    const approvedRecords = await atlas.memory.listRecords({
      recordType: GOVERNANCE_RECORD_TYPE_APPROVED_DISCOUNT,
    });
    expect(approvedRecords.total).toBe(0);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-006-C: block reason is traceable to policy and decision context', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');

    await seedCase1DiscountGraph(atlas);

    const authorization = await atlas.governance.authorize({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    expect(authorization.allowed).toBe(false);
    expect(authorization.policyId).toBe('DISCOUNT-VIP-2026');
    expect(authorization.requiredApprovalRole).toBe('SalesDirector');
    expect(authorization.evaluationTrace?.some((line) => line.includes('DISCOUNT-VIP-2026'))).toBe(
      true,
    );
    expect(authorization.evaluationTrace?.some((line) => line.includes('SalesDirector'))).toBe(
      true,
    );
    expect(authorization.decisionId).toBeUndefined();

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-006-D: valid SalesDirector approval allows execution', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');

    await seedCase1DiscountGraph(atlas);

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

    const result = await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
      requestId: 'req.andes-discount-2026-08',
    });

    expect(result.executed).toBe(true);
    expect(result.authorization.allowed).toBe(true);
    expect(result.authorization.decisionId).toBe('record.decision.andes-discount-2026-08-15');
    expect(result.authorization.evidenceIds).toEqual(['record.evidence.andes-renewal-2023']);
    expect(result.execution?.recordId).toBeTruthy();

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-006-E: workspace A approval does not authorize workspace B', async () => {
    const geeks = createWorkspaceAtlas('geeks');
    const revital = createWorkspaceAtlas('revital');

    await seedCase1DiscountGraph(geeks.atlas);
    await seedCase1DiscountGraph(revital.atlas);

    await geeks.atlas.org.recordDecision(
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

    const geeksResult = await geeks.atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    const revitalResult = await revital.atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    expect(geeksResult.executed).toBe(true);
    expect(revitalResult.executed).toBe(false);
    expect(revitalResult.authorization.workspace).toBe('revital');

    rmSync(geeks.dir, { recursive: true, force: true });
    rmSync(revital.dir, { recursive: true, force: true });
  });

  it('INT-006-F: LLM cannot force execution by sending approved=true', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');

    await seedCase1DiscountGraph(atlas);

    const orgTool = createOrgLlmToolExecutors(atlas).find(
      (tool) => tool.definition.name === 'org_execute_record_approved_discount',
    );

    expect(orgTool).toBeDefined();

    const toolResult = await orgTool!.execute({
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
      approved: true,
      forceExecute: true,
    });

    expect(toolResult).toContain('Acción bloqueada por gobernanza');

    const directResult = await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    expect(directResult.executed).toBe(false);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-006-G: executed action generates Event + Result', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');

    await seedCase1DiscountGraph(atlas);

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

    const events: DomainEvent<GovernanceActionExecutedPayload>[] = [];

    atlas.events.subscribe(GovernanceActionExecutedEvent, (event) => {
      events.push(event);
    });

    const result = await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    expect(result.executed).toBe(true);
    expect(result.eventId).toBeTruthy();
    expect(events).toHaveLength(1);
    expect(events[0]?.payload.recordId).toBe(result.execution?.recordId);
    expect(events[0]?.payload.workspace).toBe('geeks');

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-006-H: blocked action produces governance result without executing capability', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');

    await seedCase1DiscountGraph(atlas);

    const blockedEvents: DomainEvent<GovernanceActionBlockedPayload>[] = [];

    atlas.events.subscribe(GovernanceActionBlockedEvent, (event) => {
      blockedEvents.push(event);
    });

    const result = await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    expect(result.executed).toBe(false);
    expect(result.execution).toBeUndefined();
    expect(result.eventId).toBeTruthy();
    expect(blockedEvents).toHaveLength(1);
    expect(blockedEvents[0]?.payload.reason).toContain('SalesDirector');

    const approvedRecords = await atlas.memory.listRecords({
      recordType: GOVERNANCE_RECORD_TYPE_APPROVED_DISCOUNT,
    });
    expect(approvedRecords.total).toBe(0);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-006-I: existing Decision/Evidence remain traceable after governed execution', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');

    await seedCase1DiscountGraph(atlas);

    await atlas.org.storeEvidence('record.evidence.andes-renewal-2023', {
      content: 'cliente en renovación continua desde 2023',
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
      },
      'record.client.constructora-andes',
      ['record.evidence.andes-renewal-2023'],
    );

    const result = await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    const resolved = await atlas.org.resolveDecisionWithEvidence(
      'Constructora Andes S.A.',
      'discount_request',
    );

    expect(resolved).toBeDefined();
    const decision = parseDecision(readEntityPayload(resolved!.decision));
    expect(decision.outcome).toBe('approved');
    expect(decision.decidedBy).toBe('SalesDirector');
    expect(resolved!.evidence).toHaveLength(1);
    expect(result.authorization.decisionId).toBe('record.decision.andes-discount-2026-08-15');
    expect(result.authorization.evidenceIds).toEqual(['record.evidence.andes-renewal-2023']);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-006-J: regression — knowledge, context builder, org tools, warranty versioning', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int006-j-'));
    const atlas = createAtlas({ memory: { storageFilePath: join(dir, 'memory.json') } });

    await seedCase2WarrantyPolicy(atlas);

    const history = await atlas.org.resolvePolicyHistory('record.policy.warranty.standard');
    expect(history).toHaveLength(1);
    expect(history[0]?.revision).toBe(1);

    const ingested = prepareIngestedDocumentKnowledge({
      documentId: 'doc.int006.j',
      fileName: 'regression.txt',
      fileType: 'text/plain',
      folder: 'General',
      workspace: 'default',
      uploadedAt: '2026-09-08T12:00:00.000Z',
    });

    await storeIngestedDocumentKnowledgeObject(atlas.memory, ingested);

    const context = await AtlasContextBuilder.build({
      goal: 'Consulta de regresión INT-006-J',
      atlas,
      workspace: 'default',
      contextPrompt: 'Marca demo',
    });

    expect(context.systemPrompt.length).toBeGreaterThan(0);
    expect(context.orgToolsAvailable.length).toBeGreaterThan(0);

    const toolNames = createAtlasToolExecutors(atlas).map((tool) => tool.definition.name);
    expect(toolNames).toEqual(expect.arrayContaining([...listAtlasOrgToolNames()]));

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-006 integration: Constructora Andes 12% block → approval → allow → action → event → result', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');

    await seedConstructoraAndesViaOrgApi(atlas);

    const blocked = await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
      requestId: 'req.andes-discount-2026-08',
    });

    expect(blocked.executed).toBe(false);
    expect(blocked.authorization.requiredApprovalRole).toBe('SalesDirector');
    expect(blocked.authorization.policyId).toBe('DISCOUNT-VIP-2026');

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

    const executedEvents: DomainEvent<GovernanceActionExecutedPayload>[] = [];
    atlas.events.subscribe(GovernanceActionExecutedEvent, (event) => {
      executedEvents.push(event);
    });

    const allowed = await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
      requestId: 'req.andes-discount-2026-08',
    });

    expect(allowed.executed).toBe(true);
    expect(allowed.authorization.decisionId).toBe('record.decision.andes-discount-2026-08-15');
    expect(allowed.execution?.recordId).toBeTruthy();
    expect(executedEvents).toHaveLength(1);

    const stored = await atlas.memory.listRecords({
      recordType: GOVERNANCE_RECORD_TYPE_APPROVED_DISCOUNT,
    });
    expect(stored.total).toBe(1);

    rmSync(dir, { recursive: true, force: true });
  });
});
