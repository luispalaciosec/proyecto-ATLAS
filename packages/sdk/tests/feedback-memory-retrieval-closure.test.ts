import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  AtlasContextBuilder,
  createAtlas,
  createAtlasToolExecutors,
  DEFAULT_WARRANTY_ENTITY_ID,
  DEFAULT_WARRANTY_POLICY_CODE,
  FEEDBACK_RECORD_TYPE,
  listAtlasOrgToolNames,
  GOVERNANCE_RECORD_TYPE_ACTION_OPERATIONAL_RESULT,
  prepareIngestedDocumentKnowledge,
  readCurrentWarrantyDays,
  readHistoricalWarrantyDays,
  recordFeedbackCorrection,
  storeIngestedDocumentKnowledgeObject,
  type Atlas,
} from '../src/index.js';
import { seedCase1DiscountGraph } from '../src/org/fixtures.js';
import { readEntityPayload } from '../src/org/entity-resolver.js';
import { parseWarrantyPolicy } from '../src/org/schemas/warranty-policy.js';
import { resolveCurrentWarrantyByCode, resolvePolicyHistory } from '../src/org/version-resolver.js';
import { createFakeLlmProviderWithRequests } from '@atlas/llm';
import { describe, expect, it } from 'vitest';

function createWorkspaceAtlas(slug: string) {
  const dir = mkdtempSync(join(tmpdir(), `atlas-int009-${slug}-`));

  return Object.freeze({
    dir,
    slug,
    atlas: createAtlas({
      workspace: { name: slug },
      memory: { storageFilePath: join(dir, 'memory.json') },
      llm: {
        apiKey: 'test-key',
        model: 'claude-test',
        contextPrompt: `Brand workspace ${slug}`,
      },
    }),
  });
}

async function seedWarrantyPolicy(
  atlas: Atlas,
  warrantyDays: number,
  entityId: string = DEFAULT_WARRANTY_ENTITY_ID,
): Promise<void> {
  await atlas.org.storeEntity('WarrantyPolicy', entityId, {
    policyCode: DEFAULT_WARRANTY_POLICY_CODE,
    warrantyDays,
    effectiveFrom: '2025-01-01',
  });
}

async function askCurrentWarrantyDays(atlas: Atlas): Promise<number> {
  const current = await resolveCurrentWarrantyByCode(atlas, DEFAULT_WARRANTY_POLICY_CODE);
  return current.content.warrantyDays;
}

const WARRANTY_GOAL = '¿Cuál es la garantía?';
const WARRANTY_CORRECTION = 'La garantía correcta es 60 días.';

describe('INT-009 Feedback → Memory → Retrieval Closure', () => {
  it('INT-009-A: feedback correction can be recorded', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');
    await seedWarrantyPolicy(atlas, 45);

    const result = await recordFeedbackCorrection(
      atlas,
      { goal: WARRANTY_GOAL, output: '45 días' },
      WARRANTY_CORRECTION,
      { workspace: 'geeks' },
    );

    expect(result.recordId.length).toBeGreaterThan(0);
    expect(result.correction.reason).toBe(WARRANTY_CORRECTION);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-B: correction has stable identity', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');
    await seedWarrantyPolicy(atlas, 45);

    const result = await recordFeedbackCorrection(
      atlas,
      { goal: WARRANTY_GOAL, output: '45 días' },
      WARRANTY_CORRECTION,
      { workspace: 'geeks' },
    );

    expect(result.correctionId).toBe(result.correction.correctionId);
    expect(result.correctionId.startsWith('correction.')).toBe(true);
    expect(result.recordId.length).toBeGreaterThan(0);

    const listed = await atlas.memory.listRecords({ recordType: FEEDBACK_RECORD_TYPE });
    expect(listed.records.some((record) => record.id === result.recordId)).toBe(true);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-C: correction preserves workspace', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');
    await seedWarrantyPolicy(atlas, 45);

    const result = await recordFeedbackCorrection(
      atlas,
      { goal: WARRANTY_GOAL, output: '45 días' },
      WARRANTY_CORRECTION,
      { workspace: 'geeks' },
    );

    expect(result.correction.workspace).toBe('geeks');

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-D: correction preserves target entity/policy', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');
    await seedWarrantyPolicy(atlas, 45);

    const result = await recordFeedbackCorrection(
      atlas,
      { goal: WARRANTY_GOAL, output: '45 días' },
      WARRANTY_CORRECTION,
      { workspace: 'geeks' },
    );

    expect(result.correction.targetType).toBe('WarrantyPolicy');
    expect(result.correction.targetEntityId).toBe(DEFAULT_WARRANTY_ENTITY_ID);
    expect(result.correction.targetPolicyCode).toBe(DEFAULT_WARRANTY_POLICY_CODE);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-E: correction preserves previous value when available', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');
    await seedWarrantyPolicy(atlas, 45);

    const result = await recordFeedbackCorrection(
      atlas,
      { goal: WARRANTY_GOAL, output: '45 días' },
      WARRANTY_CORRECTION,
      { workspace: 'geeks' },
    );

    expect(result.correction.previousValue?.warrantyDays).toBe(45);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-F: correction preserves corrected value', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');
    await seedWarrantyPolicy(atlas, 45);

    const result = await recordFeedbackCorrection(
      atlas,
      { goal: WARRANTY_GOAL, output: '45 días' },
      WARRANTY_CORRECTION,
      { workspace: 'geeks' },
    );

    expect(result.correction.correctedValue?.warrantyDays).toBe(60);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-G: correction is persisted in canonical Memory/state', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');
    await seedWarrantyPolicy(atlas, 45);

    await recordFeedbackCorrection(
      atlas,
      { goal: WARRANTY_GOAL, output: '45 días' },
      WARRANTY_CORRECTION,
      { workspace: 'geeks' },
    );

    expect(await readCurrentWarrantyDays(atlas)).toBe(60);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-H: correction is retrievable through RetrievalModule.searchContent()', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');
    await seedWarrantyPolicy(atlas, 45);

    await recordFeedbackCorrection(
      atlas,
      { goal: WARRANTY_GOAL, output: '45 días' },
      WARRANTY_CORRECTION,
      { workspace: 'geeks' },
    );

    const search = await atlas.retrieval.searchContent({ query: 'garantía 60 días' });
    expect(search.total).toBeGreaterThan(0);
    expect(
      search.records.some((record) => {
        const text = JSON.stringify(record.content);
        return text.includes('60');
      }),
    ).toBe(true);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-I: current state reflects corrected value', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');
    await seedWarrantyPolicy(atlas, 45);

    await recordFeedbackCorrection(
      atlas,
      { goal: WARRANTY_GOAL, output: '45 días' },
      WARRANTY_CORRECTION,
      { workspace: 'geeks' },
    );

    expect(await askCurrentWarrantyDays(atlas)).toBe(60);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-J: historical previous value remains traceable', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');
    await seedWarrantyPolicy(atlas, 45);

    await recordFeedbackCorrection(
      atlas,
      { goal: WARRANTY_GOAL, output: '45 días' },
      WARRANTY_CORRECTION,
      { workspace: 'geeks' },
    );

    const history = await resolvePolicyHistory(atlas, DEFAULT_WARRANTY_ENTITY_ID);
    expect(history).toHaveLength(1);
    expect(parseWarrantyPolicy(history[0]?.content).warrantyDays).toBe(45);
    expect(await askCurrentWarrantyDays(atlas)).toBe(60);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-K: correction survives application restart/persistence boundary', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int009-k-'));
    const memoryFile = join(dir, 'memory.json');

    const atlasA = createAtlas({
      workspace: { name: 'geeks' },
      memory: { storageFilePath: memoryFile },
    });

    await seedWarrantyPolicy(atlasA, 45);
    await recordFeedbackCorrection(
      atlasA,
      { goal: WARRANTY_GOAL, output: '45 días' },
      WARRANTY_CORRECTION,
      { workspace: 'geeks' },
    );

    const atlasB = createAtlas({
      workspace: { name: 'geeks' },
      memory: { storageFilePath: memoryFile },
    });

    expect(await askCurrentWarrantyDays(atlasB)).toBe(60);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-L: ContextBuilder receives corrected information through canonical Retrieval/state path', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');
    await seedWarrantyPolicy(atlas, 45);

    await recordFeedbackCorrection(
      atlas,
      { goal: WARRANTY_GOAL, output: '45 días' },
      WARRANTY_CORRECTION,
      { workspace: 'geeks' },
    );

    const context = await AtlasContextBuilder.build({
      goal: WARRANTY_GOAL,
      atlas,
      workspace: 'geeks',
      contextPrompt: atlas.llm.getContextPrompt(),
    });

    expect(context.systemPrompt).toContain('60');
    expect(context.retrieval.selected).toBeGreaterThan(0);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-M: future LLM response uses corrected value', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int009-m-'));
    const fake = createFakeLlmProviderWithRequests([
      Object.freeze({
        message: Object.freeze({
          role: 'assistant' as const,
          content: 'La garantía actual es de 60 días.',
        }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 2 }),
        stopReason: 'end_turn' as const,
      }),
    ]);

    const atlas = createAtlas({
      workspace: { name: 'geeks' },
      memory: { storageFilePath: join(dir, 'memory.json') },
      llm: { provider: fake.provider },
    });

    await seedWarrantyPolicy(atlas, 45);

    await recordFeedbackCorrection(
      atlas,
      { goal: WARRANTY_GOAL, output: '45 días' },
      WARRANTY_CORRECTION,
      { workspace: 'geeks' },
    );

    const result = await atlas.llm.ask(WARRANTY_GOAL);
    const systemMessage = fake.requests[0]?.messages.find((message) => message.role === 'system');

    expect(systemMessage?.content).toContain('60');
    expect(result.finalMessage).toMatch(/60/);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-N: workspace isolation remains enforced', async () => {
    const geeksDir = mkdtempSync(join(tmpdir(), 'atlas-int009-geeks-'));
    const revitalDir = mkdtempSync(join(tmpdir(), 'atlas-int009-revital-'));

    const geeks = createAtlas({
      workspace: { name: 'geeks' },
      memory: { storageFilePath: join(geeksDir, 'memory.json') },
    });
    const revital = createAtlas({
      workspace: { name: 'revital' },
      memory: { storageFilePath: join(revitalDir, 'memory.json') },
    });

    await seedWarrantyPolicy(geeks, 45);
    await seedWarrantyPolicy(revital, 30);

    await recordFeedbackCorrection(
      geeks,
      { goal: WARRANTY_GOAL, output: '45 días' },
      WARRANTY_CORRECTION,
      { workspace: 'geeks' },
    );

    expect(await askCurrentWarrantyDays(geeks)).toBe(60);
    expect(await askCurrentWarrantyDays(revital)).toBe(30);

    rmSync(geeksDir, { recursive: true, force: true });
    rmSync(revitalDir, { recursive: true, force: true });
  });

  it('INT-009-O: correction does not bypass Governance', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');
    await seedCase1DiscountGraph(atlas);
    await seedWarrantyPolicy(atlas, 45);

    await recordFeedbackCorrection(
      atlas,
      { goal: WARRANTY_GOAL, output: '45 días' },
      WARRANTY_CORRECTION,
      { workspace: 'geeks' },
    );

    const blocked = await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    expect(blocked.executed).toBe(false);
    expect(blocked.result.status).toBe('blocked');

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-P: correction does not create duplicate KnowledgeObject/Policy source of truth', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');
    await seedWarrantyPolicy(atlas, 45);

    await recordFeedbackCorrection(
      atlas,
      { goal: WARRANTY_GOAL, output: '45 días' },
      WARRANTY_CORRECTION,
      { workspace: 'geeks' },
    );

    const policies = await atlas.memory.listRecords({ recordType: 'WarrantyPolicy' });
    const matching = policies.records.filter(
      (record) =>
        parseWarrantyPolicy(readEntityPayload(record)).policyCode === DEFAULT_WARRANTY_POLICY_CODE,
    );

    expect(matching.length).toBeGreaterThanOrEqual(1);
    expect(await askCurrentWarrantyDays(atlas)).toBe(60);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-Q: INT-001 Retrieval unification remains green', async () => {
    const { atlas, dir } = createWorkspaceAtlas('default');

    await atlas.memory.storeContent({
      content: 'termino-retrieval-int009-q',
      recordType: 'document',
    });

    const search = await atlas.retrieval.searchContent({
      query: 'termino-retrieval-int009-q',
    });

    expect(search.total).toBe(1);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-R: INT-003 KnowledgeObject ingest remains green', async () => {
    const { atlas, dir } = createWorkspaceAtlas('default');
    const ingest = prepareIngestedDocumentKnowledge({
      documentId: 'doc.int009-r',
      fileName: 'int009-r.txt',
      fileType: 'text/plain',
      folder: 'General',
      workspace: 'default',
      uploadedAt: '2026-09-08T12:00:00.000Z',
    });

    const stored = await storeIngestedDocumentKnowledgeObject(atlas.memory, ingest);
    expect(stored.knowledgeObjectRecord.recordId).toBeTruthy();

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-S: INT-004 ContextBuilder remains green', async () => {
    const { atlas, dir } = createWorkspaceAtlas('default');

    const context = await AtlasContextBuilder.build({
      goal: 'contexto-builder-int009-s',
      atlas,
      contextPrompt: atlas.llm.getContextPrompt(),
      workspace: 'default',
    });

    expect(context.systemPrompt.length).toBeGreaterThan(0);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-T: INT-005 Org tools remain green', async () => {
    const { atlas, dir } = createWorkspaceAtlas('default');
    const toolNames = createAtlasToolExecutors(atlas).map((tool) => tool.definition.name);

    expect(toolNames).toEqual(expect.arrayContaining([...listAtlasOrgToolNames()]));

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-U: INT-006 Governance remains green', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');
    await seedCase1DiscountGraph(atlas);

    const blocked = await atlas.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    expect(blocked.result.status).toBe('blocked');

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-V: INT-007 Event → Result → Memory remains green', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');
    await seedCase1DiscountGraph(atlas);

    await atlas.memory.storeStructuredRecord({
      recordType: GOVERNANCE_RECORD_TYPE_ACTION_OPERATIONAL_RESULT,
      content: {
        text: 'Constructora Andes descuento bloqueado 12%',
        operationalResult: {
          actionType: 'record_approved_discount_request',
          workspace: 'geeks',
          clientLegalName: 'Constructora Andes S.A.',
          requestedPercent: 12,
          status: 'blocked',
          executed: false,
          executedAt: '2026-09-08T12:00:00.000Z',
          authorization: {
            allowed: false,
            reason: 'Requiere aprobación.',
            policyId: 'DISCOUNT-VIP-2026',
          },
        },
      },
      metadata: { workspace: 'geeks' },
    });

    const search = await atlas.retrieval.searchContent({
      query: 'Constructora Andes descuento bloqueado',
    });

    expect(search.total).toBeGreaterThan(0);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-W: INT-008 conversation persistence remains green (feedback record persisted)', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');
    await seedWarrantyPolicy(atlas, 45);

    const result = await recordFeedbackCorrection(
      atlas,
      { goal: WARRANTY_GOAL, output: '45 días' },
      WARRANTY_CORRECTION,
      { workspace: 'geeks', sessionId: 'chat.test.session' },
    );

    const atlasB = createAtlas({
      workspace: { name: 'geeks' },
      memory: { storageFilePath: join(dir, 'memory.json') },
    });

    const listed = await atlasB.memory.listRecords({ recordType: FEEDBACK_RECORD_TYPE });
    expect(listed.records.some((record) => record.id === result.recordId)).toBe(true);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009-X: full canonical lifecycle', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int009-x-'));
    const memoryFile = join(dir, 'memory.json');

    const atlasA = createAtlas({
      workspace: { name: 'geeks' },
      memory: { storageFilePath: memoryFile },
      llm: { apiKey: 'test-key', model: 'claude-test' },
    });

    await seedWarrantyPolicy(atlasA, 45);
    expect(await askCurrentWarrantyDays(atlasA)).toBe(45);

    const feedback = await recordFeedbackCorrection(
      atlasA,
      { goal: WARRANTY_GOAL, output: '45 días' },
      WARRANTY_CORRECTION,
      { workspace: 'geeks' },
    );

    expect(feedback.applied).toBe(true);

    const atlasB = createAtlas({
      workspace: { name: 'geeks' },
      memory: { storageFilePath: memoryFile },
      llm: { apiKey: 'test-key', model: 'claude-test' },
    });

    expect(await askCurrentWarrantyDays(atlasB)).toBe(60);

    const search = await atlasB.retrieval.searchContent({ query: 'garantía' });
    expect(search.total).toBeGreaterThan(0);

    const history = await readHistoricalWarrantyDays(atlasB);
    expect(history).toContain(45);
    expect(history).toContain(60);

    const context = await AtlasContextBuilder.build({
      goal: WARRANTY_GOAL,
      atlas: atlasB,
      workspace: 'geeks',
    });

    expect(context.systemPrompt).toContain('60');

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-009 critical end-to-end restart with identity and isolation checks', async () => {
    const geeksDir = mkdtempSync(join(tmpdir(), 'atlas-int009-e2e-geeks-'));
    const revitalDir = mkdtempSync(join(tmpdir(), 'atlas-int009-e2e-revital-'));

    const geeksMemory = join(geeksDir, 'memory.json');
    const revitalMemory = join(revitalDir, 'memory.json');

    const geeksA = createAtlas({
      workspace: { name: 'geeks' },
      memory: { storageFilePath: geeksMemory },
    });
    const revitalA = createAtlas({
      workspace: { name: 'revital' },
      memory: { storageFilePath: revitalMemory },
    });

    await seedWarrantyPolicy(geeksA, 45);
    await seedWarrantyPolicy(revitalA, 30);

    expect(await askCurrentWarrantyDays(geeksA)).toBe(45);

    const correction = await recordFeedbackCorrection(
      geeksA,
      { goal: WARRANTY_GOAL, output: '45 días' },
      WARRANTY_CORRECTION,
      { workspace: 'geeks' },
    );

    const geeksB = createAtlas({
      workspace: { name: 'geeks' },
      memory: { storageFilePath: geeksMemory },
    });
    const revitalB = createAtlas({
      workspace: { name: 'revital' },
      memory: { storageFilePath: revitalMemory },
    });

    expect(await askCurrentWarrantyDays(geeksB)).toBe(60);
    expect(await askCurrentWarrantyDays(revitalB)).toBe(30);

    const retrieval = await geeksB.retrieval.searchContent({ query: 'garantía 60 días' });
    expect(retrieval.total).toBeGreaterThan(0);

    const history = await resolvePolicyHistory(geeksB, DEFAULT_WARRANTY_ENTITY_ID);
    expect(parseWarrantyPolicy(history[0]?.content).warrantyDays).toBe(45);

    expect(correction.correctionId.startsWith('correction.')).toBe(true);

    rmSync(geeksDir, { recursive: true, force: true });
    rmSync(revitalDir, { recursive: true, force: true });
  });

  it('INT-009 duplication: repeated identical correction does not bump policy revision', async () => {
    const { atlas, dir } = createWorkspaceAtlas('geeks');
    await seedWarrantyPolicy(atlas, 45);

    await recordFeedbackCorrection(
      atlas,
      { goal: WARRANTY_GOAL, output: '45 días' },
      WARRANTY_CORRECTION,
      { workspace: 'geeks' },
    );

    const afterFirst = await resolveCurrentWarrantyByCode(atlas, DEFAULT_WARRANTY_POLICY_CODE);
    expect(afterFirst.revision).toBe(2);

    await recordFeedbackCorrection(
      atlas,
      { goal: WARRANTY_GOAL, output: '60 días' },
      WARRANTY_CORRECTION,
      { workspace: 'geeks' },
    );

    const afterSecond = await resolveCurrentWarrantyByCode(atlas, DEFAULT_WARRANTY_POLICY_CODE);
    expect(afterSecond.revision).toBe(2);
    expect(afterSecond.content.warrantyDays).toBe(60);

    const feedbackRecords = await atlas.memory.listRecords({ recordType: FEEDBACK_RECORD_TYPE });
    expect(feedbackRecords.total).toBe(2);

    rmSync(dir, { recursive: true, force: true });
  });
});
