import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { loadOrCreateBrandProfile, resolveWorkspacePaths } from '@atlas/cli';
import {
  GOVERNANCE_RECORD_TYPE_ACTION_OPERATIONAL_RESULT,
  parseActionOperationalResultFromRecord,
  AtlasContextBuilder,
  createAtlasToolExecutors,
  listAtlasOrgToolNames,
} from '@atlas/sdk';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  resolveActivityFilePath,
  resolveConversationFilePath,
} from '../src/lib/web-persistence/workspace-storage-paths.js';
import { createWebServer } from '../src/server.js';
import { SessionStore } from '../src/session-store.js';
import { readFixture } from './fixtures/fixture-utils.js';

async function seedMinimalDiscountGraph(
  org: Awaited<ReturnType<SessionStore['getOrCreate']>>['client']['org'],
): Promise<void> {
  await org.storeEntity('Client', 'record.client.constructora-andes', {
    legalName: 'Constructora Andes S.A.',
    segment: 'VIP',
    renewalActive: true,
  });

  await org.storeEntity('DiscountPolicy', 'record.policy.discount.autonomous', {
    policyCode: 'DISCOUNT-VIP-2026',
    autonomousMaxPercent: 10,
    currency: 'USD',
  });

  await org.storeEntity('ApprovalRule', 'record.rule.discount-approval', {
    appliesWhen: 'discountPercent > autonomousMaxPercent',
    approverRole: 'SalesDirector',
    approverQueue: 'sales-directors',
  });

  await org.linkEntities(
    'record.client.constructora-andes',
    'record.policy.discount.autonomous',
    'reference',
  );

  await org.linkEntities(
    'record.policy.discount.autonomous',
    'record.rule.discount-approval',
    'dependency',
  );
}

const originalFetch = globalThis.fetch;
const originalMemoryFile = process.env.ATLAS_MEMORY_FILE;
const originalWorkspacesRoot = process.env.ATLAS_WORKSPACES_ROOT;
const originalLlmApiKey = process.env.ATLAS_LLM_API_KEY;
const originalLlmModel = process.env.ATLAS_LLM_MODEL;

function stubLlmFetch(
  impl: (url: string, init?: RequestInit) => Response | Promise<Response>,
): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      const urlString = String(url);

      if (urlString.includes('anthropic.com')) {
        return impl(urlString, init);
      }

      return originalFetch(url, init);
    }),
  );
}

async function withServer<T>(
  app: ReturnType<typeof createWebServer>,
  run: (baseUrl: string) => Promise<T>,
): Promise<T> {
  let server: Server | undefined;

  try {
    const baseUrl = await new Promise<string>((resolve, reject) => {
      server = createServer(app);
      server.once('error', reject);
      server.listen(0, '127.0.0.1', () => {
        const address = server?.address();

        if (address === null || typeof address !== 'object') {
          reject(new Error('Unable to resolve test server port'));
          return;
        }

        resolve(`http://127.0.0.1:${address.port}`);
      });
    });

    return await run(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => {
      if (server === undefined) {
        resolve();
        return;
      }

      server.close((error) => {
        if (error !== undefined) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

describe('INT-008 Conversation + Activity Persistence', () => {
  let tempRoot: string;
  let workspacesRoot: string;
  let memoryFile: string;

  beforeEach(() => {
    tempRoot = mkdtempSync(join(tmpdir(), 'atlas-int008-'));
    workspacesRoot = join(tempRoot, 'workspaces');
    memoryFile = join(tempRoot, 'memory.json');
    process.env.ATLAS_WORKSPACES_ROOT = workspacesRoot;
    process.env.ATLAS_MEMORY_FILE = memoryFile;
  });

  afterEach(() => {
    vi.unstubAllGlobals();

    if (originalMemoryFile === undefined) {
      delete process.env.ATLAS_MEMORY_FILE;
    } else {
      process.env.ATLAS_MEMORY_FILE = originalMemoryFile;
    }

    if (originalWorkspacesRoot === undefined) {
      delete process.env.ATLAS_WORKSPACES_ROOT;
    } else {
      process.env.ATLAS_WORKSPACES_ROOT = originalWorkspacesRoot;
    }

    if (originalLlmApiKey === undefined) {
      delete process.env.ATLAS_LLM_API_KEY;
    } else {
      process.env.ATLAS_LLM_API_KEY = originalLlmApiKey;
    }

    if (originalLlmModel === undefined) {
      delete process.env.ATLAS_LLM_MODEL;
    } else {
      process.env.ATLAS_LLM_MODEL = originalLlmModel;
    }

    rmSync(tempRoot, { recursive: true, force: true });
  });

  it('INT-008-A: create conversation persists successfully', async () => {
    loadOrCreateBrandProfile(resolveWorkspacePaths('geeks', workspacesRoot), 'Geeks');

    const store = new SessionStore();
    store.recordDeterministicExchange('geeks', 'Hola ATLAS', 'Respuesta inicial');
    await store.getOrCreate('geeks');

    const conversationPath = resolveConversationFilePath('geeks');
    expect(existsSync(conversationPath)).toBe(true);

    const raw = JSON.parse(readFileSync(conversationPath, 'utf8')) as { workspace: string };
    expect(raw.workspace).toBe('geeks');
  });

  it('INT-008-B: conversation turns persist in exact order', async () => {
    loadOrCreateBrandProfile(resolveWorkspacePaths('geeks', workspacesRoot), 'Geeks');

    const store = new SessionStore();

    store.recordDeterministicExchange('geeks', 'Primera pregunta', 'Primera respuesta');
    store.recordDeterministicExchange('geeks', 'Segunda pregunta', 'Segunda respuesta');

    const session = await store.getOrCreate('geeks');
    const history = store.getConversationHistory(session, 'geeks');

    expect(history.messages.map((message) => message.content)).toEqual([
      'Primera pregunta',
      'Primera respuesta',
      'Segunda pregunta',
      'Segunda respuesta',
    ]);
  });

  it('INT-008-C: conversation survives Web/application instance restart', async () => {
    loadOrCreateBrandProfile(resolveWorkspacePaths('geeks', workspacesRoot), 'Geeks');

    const storeA = new SessionStore();
    storeA.recordDeterministicExchange('geeks', 'Persistir conversación', 'Confirmado');
    await storeA.getOrCreate('geeks');

    const storeB = new SessionStore();
    const sessionB = await storeB.getOrCreate('geeks');
    const history = storeB.getConversationHistory(sessionB, 'geeks');

    expect(history.messages).toHaveLength(2);
    expect(history.messages[0]?.content).toBe('Persistir conversación');
    expect(history.messages[1]?.content).toBe('Confirmado');
  });

  it('INT-008-D: restored conversation can continue through executeChatTurn path', async () => {
    process.env.ATLAS_LLM_API_KEY = 'test-key';
    process.env.ATLAS_LLM_MODEL = 'claude-test-model';

    stubLlmFetch(
      () =>
        new Response(
          JSON.stringify({
            content: [{ type: 'text', text: 'Continuación restaurada.' }],
            stop_reason: 'end_turn',
            usage: { input_tokens: 1, output_tokens: 2 },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
    );

    const storeA = new SessionStore();
    const sessionA = await storeA.getOrCreate(undefined);
    sessionA.history.push({ role: 'user', content: 'Mensaje previo' });
    sessionA.history.push({ role: 'assistant', content: 'Respuesta previa' });
    sessionA.turnBoundaries.push(0);
    sessionA.lastTurn = { goal: 'Mensaje previo', output: 'Respuesta previa' };
    storeA.persistSession(undefined, sessionA);

    const app = createWebServer(new SessionStore());
    await withServer(app, async (baseUrl) => {
      const historyBefore = await fetch(`${baseUrl}/api/history`).then((response) =>
        response.json(),
      );
      expect(historyBefore.messages).toHaveLength(2);

      const chatResponse = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: 'Siguiente mensaje' }),
      });

      expect(chatResponse.ok).toBe(true);

      const historyAfter = await fetch(`${baseUrl}/api/history`).then((response) =>
        response.json(),
      );
      expect(historyAfter.messages.length).toBeGreaterThanOrEqual(4);
    });
  });

  it('INT-008-E: conversation workspace isolation', async () => {
    loadOrCreateBrandProfile(resolveWorkspacePaths('geeks', workspacesRoot), 'Geeks');
    loadOrCreateBrandProfile(resolveWorkspacePaths('revital', workspacesRoot), 'Revital');

    const store = new SessionStore();
    store.recordDeterministicExchange('geeks', 'Solo geeks', 'Respuesta geeks');
    store.recordDeterministicExchange('revital', 'Solo revital', 'Respuesta revital');

    const geeksSession = await store.getOrCreate('geeks');
    const revitalSession = await store.getOrCreate('revital');

    const geeksHistory = store.getConversationHistory(geeksSession, 'geeks');
    const revitalHistory = store.getConversationHistory(revitalSession, 'revital');

    expect(geeksHistory.messages.some((message) => message.content.includes('geeks'))).toBe(true);
    expect(geeksHistory.messages.some((message) => message.content.includes('revital'))).toBe(
      false,
    );
    expect(revitalHistory.messages.some((message) => message.content.includes('revital'))).toBe(
      true,
    );
  });

  it('INT-008-F: brand isolation where applicable', async () => {
    loadOrCreateBrandProfile(resolveWorkspacePaths('geeks', workspacesRoot), 'Geeks');

    const store = new SessionStore();
    store.recordDeterministicExchange('geeks', 'Marca geeks', 'OK geeks');

    expect(existsSync(resolveConversationFilePath('geeks'))).toBe(true);
    expect(existsSync(join(workspacesRoot, 'revital', 'conversation.json'))).toBe(false);
  });

  it('INT-008-G: activity survives Web/application restart', async () => {
    loadOrCreateBrandProfile(resolveWorkspacePaths('geeks', workspacesRoot), 'Geeks');

    const storeA = new SessionStore();
    storeA.recordConversationActivity('geeks', {
      goal: 'Consulta persistida',
      mode: 'deterministic',
      success: true,
    });

    const storeB = new SessionStore();
    const activity = storeB.getActivity('geeks');

    expect(activity.items.some((item) => item.quote?.includes('Consulta persistida'))).toBe(true);
    expect(existsSync(resolveActivityFilePath('geeks'))).toBe(true);
  });

  it('INT-008-H: executed governance action remains represented as executed', async () => {
    loadOrCreateBrandProfile(resolveWorkspacePaths('geeks', workspacesRoot), 'Geeks');

    const storeA = new SessionStore();
    const session = await storeA.getOrCreate('geeks');

    await session.client.memory.storeStructuredRecord({
      recordType: GOVERNANCE_RECORD_TYPE_ACTION_OPERATIONAL_RESULT,
      content: {
        text: 'Constructora Andes descuento aprobado 12%',
        operationalResult: {
          actionType: 'record_approved_discount_request',
          workspace: 'geeks',
          clientLegalName: 'Constructora Andes S.A.',
          requestedPercent: 12,
          status: 'executed',
          executed: true,
          executedAt: '2026-09-08T12:00:00.000Z',
          authorization: {
            allowed: true,
            reason: 'Aprobación organizacional registrada por SalesDirector.',
            decisionId: 'record.decision.andes',
            policyId: 'DISCOUNT-VIP-2026',
            evidenceIds: ['record.evidence.andes'],
          },
          capabilityRecordId: 'capability.1',
        },
      },
      metadata: { workspace: 'geeks', status: 'executed', source: 'atlas-governance' },
    });

    const storeB = new SessionStore();
    const activity = await storeB.getActivityWithGovernance('geeks');
    const governanceItem = activity.items.find((item) =>
      item.quote?.includes('Constructora Andes'),
    );

    expect(governanceItem).toBeDefined();
    expect(governanceItem?.status).toBe('success');
  });

  it('INT-008-I: blocked governance action remains represented as blocked', async () => {
    loadOrCreateBrandProfile(resolveWorkspacePaths('geeks', workspacesRoot), 'Geeks');

    const storeA = new SessionStore();
    const session = await storeA.getOrCreate('geeks');

    await session.client.memory.storeStructuredRecord({
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
          executedAt: '2026-09-08T12:01:00.000Z',
          authorization: {
            allowed: false,
            reason: 'Requiere aprobación de SalesDirector.',
            policyId: 'DISCOUNT-VIP-2026',
          },
        },
      },
      metadata: { workspace: 'geeks', status: 'blocked', source: 'atlas-governance' },
    });

    const storeB = new SessionStore();
    const activity = await storeB.getActivityWithGovernance('geeks');
    const blockedItem = activity.items.find((item) => item.type === 'error');

    expect(blockedItem).toBeDefined();
    expect(blockedItem?.status).toBe('warning');
  });

  it('INT-008-J: activity preserves references to Event/Result/Decision where applicable', async () => {
    loadOrCreateBrandProfile(resolveWorkspacePaths('geeks', workspacesRoot), 'Geeks');

    const store = new SessionStore();
    const session = await store.getOrCreate('geeks');

    const stored = await session.client.memory.storeStructuredRecord({
      recordType: GOVERNANCE_RECORD_TYPE_ACTION_OPERATIONAL_RESULT,
      content: {
        text: 'Constructora Andes descuento aprobado 12% DISCOUNT-VIP-2026',
        operationalResult: {
          actionType: 'record_approved_discount_request',
          workspace: 'geeks',
          clientLegalName: 'Constructora Andes S.A.',
          requestedPercent: 12,
          status: 'executed',
          executed: true,
          executedAt: '2026-09-08T12:02:00.000Z',
          authorization: {
            allowed: true,
            reason: 'Aprobado',
            decisionId: 'record.decision.andes',
            policyId: 'DISCOUNT-VIP-2026',
            evidenceIds: ['record.evidence.andes'],
          },
          capabilityRecordId: 'capability.2',
          eventId: 'event.1',
        },
      },
      metadata: { workspace: 'geeks', status: 'executed' },
    });

    const parsed = parseActionOperationalResultFromRecord(stored.record);
    expect(parsed.authorization.decisionId).toBe('record.decision.andes');
    expect(parsed.authorization.policyId).toBe('DISCOUNT-VIP-2026');

    const activity = await store.getActivityWithGovernance('geeks');
    expect(activity.items.some((item) => item.quote?.includes('Constructora Andes'))).toBe(true);
  });

  it('INT-008-K: no duplicated Activity after restore', async () => {
    loadOrCreateBrandProfile(resolveWorkspacePaths('geeks', workspacesRoot), 'Geeks');

    const storeA = new SessionStore();
    storeA.recordConversationActivity('geeks', { goal: 'Unica actividad', mode: 'deterministic' });

    const storeB = new SessionStore();
    const activity = storeB.getActivity('geeks');

    expect(activity.items.filter((item) => item.quote === 'Unica actividad')).toHaveLength(1);
  });

  it('INT-008-L: no duplicated conversation turns after restore', async () => {
    loadOrCreateBrandProfile(resolveWorkspacePaths('geeks', workspacesRoot), 'Geeks');

    const storeA = new SessionStore();
    storeA.recordDeterministicExchange('geeks', 'Turno único', 'Respuesta única');

    const storeB = new SessionStore();
    const session = await storeB.getOrCreate('geeks');
    const history = storeB.getConversationHistory(session, 'geeks');

    expect(history.messages).toHaveLength(2);
  });

  it('INT-008-M: persistence read failure does not corrupt existing state', async () => {
    loadOrCreateBrandProfile(resolveWorkspacePaths('geeks', workspacesRoot), 'Geeks');

    const store = new SessionStore();
    store.recordDeterministicExchange('geeks', 'Estado estable', 'OK');

    const conversationPath = resolveConversationFilePath('geeks');
    writeFileSync(conversationPath, '{ invalid json', 'utf8');

    const session = await store.getOrCreate('geeks');
    session.history.push({ role: 'user', content: 'Nuevo mensaje en memoria' });
    const history = store.getConversationHistory(session, 'geeks');

    expect(history.messages.some((message) => message.content.includes('Nuevo mensaje'))).toBe(
      true,
    );
  });

  it('INT-008-N: INT-007 ActionOperationalResult remains retrievable', async () => {
    const store = new SessionStore();
    const session = await store.getOrCreate('geeks');

    await session.client.memory.storeStructuredRecord({
      recordType: GOVERNANCE_RECORD_TYPE_ACTION_OPERATIONAL_RESULT,
      content: {
        text: 'Constructora Andes descuento aprobado 12%',
        operationalResult: {
          actionType: 'record_approved_discount_request',
          workspace: 'geeks',
          clientLegalName: 'Constructora Andes S.A.',
          requestedPercent: 12,
          status: 'executed',
          executed: true,
          executedAt: '2026-09-08T12:03:00.000Z',
          authorization: {
            allowed: true,
            reason: 'Aprobado',
            policyId: 'DISCOUNT-VIP-2026',
          },
        },
      },
      metadata: { workspace: 'geeks' },
    });

    const search = await session.client.retrieval.searchContent({
      query: 'Constructora Andes descuento aprobado 12%',
    });

    expect(search.total).toBeGreaterThan(0);
  });

  it('INT-008-O: INT-001 canonical Retrieval remains unchanged', async () => {
    const store = new SessionStore();
    const session = await store.getOrCreate(undefined);

    await session.client.memory.storeContent({
      content: 'termino-retrieval-int008-o',
      recordType: 'document',
    });

    const search = await session.client.retrieval.searchContent({
      query: 'termino-retrieval-int008-o',
    });

    expect(search.total).toBe(1);
  });

  it('INT-008-T: real lifecycle create → persist → destroy → restore → continue', async () => {
    loadOrCreateBrandProfile(resolveWorkspacePaths('geeks', workspacesRoot), 'Geeks');

    const storeA = new SessionStore();
    storeA.recordDeterministicExchange('geeks', 'Inicio lifecycle', 'Paso 1');
    storeA.recordConversationActivity('geeks', {
      goal: 'Inicio lifecycle',
      mode: 'deterministic',
      success: true,
    });

    const storeB = new SessionStore();
    const sessionB = await storeB.getOrCreate('geeks');
    const history = storeB.getConversationHistory(sessionB, 'geeks');
    const activity = storeB.getActivity('geeks');

    expect(history.messages).toHaveLength(2);
    expect(activity.items.length).toBeGreaterThan(0);

    storeB.recordDeterministicExchange('geeks', 'Continuación lifecycle', 'Paso 2');
    const continued = storeB.getConversationHistory(sessionB, 'geeks');
    expect(continued.messages).toHaveLength(4);
  });

  it('INT-008-P: INT-004 AtlasContextBuilder remains unchanged semantically', async () => {
    const store = new SessionStore();
    const session = await store.getOrCreate(undefined);

    await session.client.memory.storeContent({
      content: 'contexto-builder-int008-p',
      recordType: 'document',
    });

    const contextPackage = await AtlasContextBuilder.build({
      goal: 'contexto-builder-int008-p',
      atlas: session.client,
      contextPrompt: session.client.llm.getContextPrompt(),
      workspace: session.client.llm.getWorkspaceName(),
      history: [],
    });

    expect(contextPackage.retrieval.totalCandidates).toBeGreaterThanOrEqual(0);
    expect(contextPackage.systemPrompt.length).toBeGreaterThan(0);
  });

  it('INT-008-Q: INT-005 Org tools remain green', async () => {
    const store = new SessionStore();
    const session = await store.getOrCreate(undefined);
    const toolNames = createAtlasToolExecutors(session.client).map((tool) => tool.definition.name);

    expect(toolNames).toEqual(expect.arrayContaining([...listAtlasOrgToolNames()]));
  });

  it('INT-008-R: INT-006 Governance remains green', async () => {
    loadOrCreateBrandProfile(resolveWorkspacePaths('geeks', workspacesRoot), 'Geeks');

    const store = new SessionStore();
    const session = await store.getOrCreate('geeks');

    await seedMinimalDiscountGraph(session.client.org);

    const blocked = await session.client.governance.execute({
      actionType: 'record_approved_discount_request',
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    expect(blocked.executed).toBe(false);
    expect(blocked.result.status).toBe('blocked');
  });

  it('INT-008-S: KnowledgeObject ingestion remains green', async () => {
    const store = new SessionStore();
    const upload = await store.uploadKnowledgeDocument(
      undefined,
      'int008-s.txt',
      readFixture('sample.txt'),
    );
    const session = await store.getOrCreate(undefined);
    const records = await session.client.memory.listRecords();
    const knowledgeObject = records.records.find((record) => record.type === 'KnowledgeObject');

    expect(upload.chunks).toBeGreaterThan(0);
    expect(knowledgeObject).toBeDefined();
    expect(knowledgeObject?.metadata.knowledgeObjectId).toBe(upload.documentId);
  });
});
