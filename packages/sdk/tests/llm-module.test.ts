import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createFakeLlmProvider, createFakeLlmProviderWithRequests } from '@atlas/llm';
import { describe, expect, it, vi } from 'vitest';

import { createArtifact, createAtlas, planExecuteAndRemember } from '../src/index.js';
import { seedCase1DiscountGraph } from '../src/org/fixtures.js';

function createTestAtlas(options?: {
  readonly fakeScript?: Parameters<typeof createFakeLlmProvider>[0];
}) {
  const dir = mkdtempSync(join(tmpdir(), 'atlas-llm-module-'));

  return Object.freeze({
    dir,
    atlas: createAtlas({
      memory: { storageFilePath: join(dir, 'memory.json') },
      llm: {
        provider: createFakeLlmProvider(options?.fakeScript ?? []),
      },
      compiler: {
        generators: () => [
          {
            id: 'summary-generator',
            supported_formats: ['summary'],
            generate: (graph) => [
              createArtifact({
                id: 'artifact.llm-module',
                kind: 'summary',
                content: { nodes: graph.nodes.length },
                source_graph_id: graph.id,
              }),
            ],
          },
        ],
      },
    }),
  });
}

describe('LlmModule', () => {
  it('ask() completes without tools when the provider returns end_turn', async () => {
    const { atlas, dir } = createTestAtlas({
      fakeScript: [
        Object.freeze({
          message: Object.freeze({ role: 'assistant' as const, content: 'No tools needed.' }),
          usage: Object.freeze({ inputTokens: 1, outputTokens: 2 }),
          stopReason: 'end_turn' as const,
        }),
      ],
    });

    const result = await atlas.llm.ask('Explain Atlas');

    expect(result.success).toBe(true);
    expect(result.finalMessage).toBe('No tools needed.');

    rmSync(dir, { recursive: true, force: true });
  });

  it('ask() can invoke memory_search and memory_store against real Memory', async () => {
    const { atlas, dir } = createTestAtlas({
      fakeScript: [
        Object.freeze({
          message: Object.freeze({
            role: 'assistant' as const,
            content: '',
            toolCalls: Object.freeze([
              Object.freeze({
                id: 'toolu_store',
                name: 'memory_store',
                arguments: Object.freeze({ content: 'pedido cliente VIP' }),
              }),
            ]),
          }),
          usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
          stopReason: 'tool_use' as const,
        }),
        Object.freeze({
          message: Object.freeze({
            role: 'assistant' as const,
            content: '',
            toolCalls: Object.freeze([
              Object.freeze({
                id: 'toolu_search',
                name: 'memory_search',
                arguments: Object.freeze({ query: 'pedido' }),
              }),
            ]),
          }),
          usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
          stopReason: 'tool_use' as const,
        }),
        Object.freeze({
          message: Object.freeze({ role: 'assistant' as const, content: 'Stored and found it.' }),
          usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
          stopReason: 'end_turn' as const,
        }),
      ],
    });

    const result = await atlas.llm.ask('Remember this VIP order');

    expect(result.success).toBe(true);
    expect(result.finalMessage).toBe('Stored and found it.');

    const search = await atlas.memory.searchContent({ query: 'pedido' });
    expect(search.total).toBe(1);
    expect(search.records[0]?.content).toEqual({ text: 'pedido cliente VIP' });

    rmSync(dir, { recursive: true, force: true });
  });

  it('memory_search tool results truncate content and cap record count', async () => {
    const longTail = 'X'.repeat(1300);
    const fake = createFakeLlmProviderWithRequests([
      Object.freeze({
        message: Object.freeze({
          role: 'assistant' as const,
          content: '',
          toolCalls: Object.freeze([
            Object.freeze({
              id: 'toolu_search_long',
              name: 'memory_search',
              arguments: Object.freeze({ query: 'longsearch' }),
            }),
          ]),
        }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'tool_use' as const,
      }),
      Object.freeze({
        message: Object.freeze({ role: 'assistant' as const, content: 'Found truncated records.' }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'end_turn' as const,
      }),
    ]);
    const dir = mkdtempSync(join(tmpdir(), 'atlas-llm-memory-search-truncate-'));
    const atlas = createAtlas({
      memory: { storageFilePath: join(dir, 'memory.json') },
      llm: { provider: fake.provider },
    });

    for (let index = 0; index < 9; index += 1) {
      await atlas.memory.storeContent({
        content: `longsearch record ${index} ${longTail}`,
        recordType: 'document',
      });
    }

    const result = await atlas.llm.ask('Search long knowledge rows');

    expect(result.success).toBe(true);
    expect(fake.requests.length).toBeGreaterThanOrEqual(2);

    const toolMessage = fake.requests[1]?.messages.find((message) => message.role === 'tool');
    expect(toolMessage).toBeDefined();

    const payload = JSON.parse(String(toolMessage?.content)) as {
      records: Array<{ content: string }>;
      omitted?: number;
    };

    expect(payload.records.length).toBeLessThanOrEqual(8);
    expect(payload.omitted).toBe(1);
    expect(payload.records[0]?.content.length).toBeLessThanOrEqual(1200);
    expect(payload.records[0]?.content).toContain('…');
    expect(String(toolMessage?.content)).not.toContain(longTail);

    rmSync(dir, { recursive: true, force: true });
  });

  it('ask() can invoke org_evaluate_discount and surface the 10% limit and SalesDirector approval', async () => {
    const { atlas, dir } = createTestAtlas({
      fakeScript: [
        Object.freeze({
          message: Object.freeze({
            role: 'assistant' as const,
            content: '',
            toolCalls: Object.freeze([
              Object.freeze({
                id: 'toolu_org_discount',
                name: 'org_evaluate_discount',
                arguments: Object.freeze({
                  clientLegalName: 'Constructora Andes S.A.',
                  requestedPercent: 12,
                }),
              }),
            ]),
          }),
          usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
          stopReason: 'tool_use' as const,
        }),
        Object.freeze({
          message: Object.freeze({
            role: 'assistant' as const,
            content:
              'No puedes aplicar 12% de forma autónoma. Límite autónomo: 10%. Requiere aprobación de SalesDirector.',
          }),
          usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
          stopReason: 'end_turn' as const,
        }),
      ],
    });

    await seedCase1DiscountGraph(atlas);

    const result = await atlas.llm.ask('¿Puedo ofrecerle 12% de descuento a Constructora Andes?');

    expect(result.success).toBe(true);
    expect(result.finalMessage).toContain('10%');
    expect(result.finalMessage).toContain('SalesDirector');

    rmSync(dir, { recursive: true, force: true });
  });

  it('ask() can invoke org_upsert_entity to create a new Client', async () => {
    const { atlas, dir } = createTestAtlas({
      fakeScript: [
        Object.freeze({
          message: Object.freeze({
            role: 'assistant' as const,
            content: '',
            toolCalls: Object.freeze([
              Object.freeze({
                id: 'toolu_org_upsert',
                name: 'org_upsert_entity',
                arguments: Object.freeze({
                  recordType: 'Client',
                  entityId: 'client.nuevo-chat',
                  content: Object.freeze({
                    legalName: 'Nuevo Cliente Chat S.A.',
                    segment: 'Standard',
                    renewalActive: true,
                  }),
                }),
              }),
            ]),
          }),
          usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
          stopReason: 'tool_use' as const,
        }),
        Object.freeze({
          message: Object.freeze({
            role: 'assistant' as const,
            content: 'Entidad client.nuevo-chat (Client) creada correctamente.',
          }),
          usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
          stopReason: 'end_turn' as const,
        }),
      ],
    });

    const result = await atlas.llm.ask('Registra a Nuevo Cliente Chat S.A. como cliente Standard');

    expect(result.success).toBe(true);
    expect(result.finalMessage).toContain('creada');

    const client = await atlas.org.resolveEntityById('client.nuevo-chat');
    expect(client).toBeDefined();

    rmSync(dir, { recursive: true, force: true });
  });

  it('ask() can record and resolve a Decision with Evidence via org tools', async () => {
    const { atlas, dir } = createTestAtlas({
      fakeScript: [
        Object.freeze({
          message: Object.freeze({
            role: 'assistant' as const,
            content: '',
            toolCalls: Object.freeze([
              Object.freeze({
                id: 'toolu_record_evidence',
                name: 'org_record_evidence',
                arguments: Object.freeze({
                  entityId: 'record.evidence.andes-renewal-2023',
                  content: 'cliente en renovación continua desde 2023, sin incidentes de pago',
                  sourceType: 'manual',
                  recordedBy: 'SalesDirector',
                }),
              }),
            ]),
          }),
          usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
          stopReason: 'tool_use' as const,
        }),
        Object.freeze({
          message: Object.freeze({
            role: 'assistant' as const,
            content: '',
            toolCalls: Object.freeze([
              Object.freeze({
                id: 'toolu_record_decision',
                name: 'org_record_decision',
                arguments: Object.freeze({
                  entityId: 'record.decision.andes-discount-2026-08-15',
                  content: Object.freeze({
                    subjectType: 'discount_request',
                    clientLegalName: 'Constructora Andes S.A.',
                    requestedPercent: 12,
                    outcome: 'approved',
                    approvedPercent: 12,
                    decidedBy: 'SalesDirector',
                    decidedAt: '2026-08-15',
                  }),
                  targetEntityId: 'record.client.constructora-andes',
                  evidenceIds: Object.freeze(['record.evidence.andes-renewal-2023']),
                }),
              }),
            ]),
          }),
          usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
          stopReason: 'tool_use' as const,
        }),
        Object.freeze({
          message: Object.freeze({
            role: 'assistant' as const,
            content: '',
            toolCalls: Object.freeze([
              Object.freeze({
                id: 'toolu_resolve_decision',
                name: 'org_resolve_decision',
                arguments: Object.freeze({
                  clientLegalName: 'Constructora Andes S.A.',
                  subjectType: 'discount_request',
                }),
              }),
            ]),
          }),
          usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
          stopReason: 'tool_use' as const,
        }),
        Object.freeze({
          message: Object.freeze({
            role: 'assistant' as const,
            content:
              'SalesDirector aprobó el 12% citando la renovación continua desde 2023 sin incidentes de pago.',
          }),
          usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
          stopReason: 'end_turn' as const,
        }),
      ],
    });

    await seedCase1DiscountGraph(atlas);

    const result = await atlas.llm.ask(
      '¿Quién aprobó el descuento de Constructora Andes y por qué?',
    );

    expect(result.success).toBe(true);
    expect(result.finalMessage).toContain('SalesDirector');
    expect(result.finalMessage).toContain('renovación continua desde 2023');

    const resolved = await atlas.org.resolveDecisionWithEvidence(
      'Constructora Andes S.A.',
      'discount_request',
    );
    expect(resolved).toBeDefined();
    expect(resolved!.evidence).toHaveLength(1);

    rmSync(dir, { recursive: true, force: true });
  });

  it('ask() can invoke plan_and_execute with the same outcome as planExecuteAndRemember', async () => {
    const { atlas, dir } = createTestAtlas({
      fakeScript: [
        Object.freeze({
          message: Object.freeze({
            role: 'assistant' as const,
            content: '',
            toolCalls: Object.freeze([
              Object.freeze({
                id: 'toolu_plan',
                name: 'plan_and_execute',
                arguments: Object.freeze({ goal: 'hacer X' }),
              }),
            ]),
          }),
          usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
          stopReason: 'tool_use' as const,
        }),
        Object.freeze({
          message: Object.freeze({ role: 'assistant' as const, content: 'Plan executed.' }),
          usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
          stopReason: 'end_turn' as const,
        }),
      ],
    });

    const direct = await planExecuteAndRemember(atlas, 'hacer X');
    const result = await atlas.llm.ask('Run hacer X through planning');

    expect(result.success).toBe(true);

    const search = await atlas.memory.searchContent({ query: 'hacer X' });
    expect(search.total).toBeGreaterThanOrEqual(1);
    expect(direct.execute.success).toBe(true);
    expect(direct.planning.workflow?.identity.workflow_id).toMatch(/^workflow\./);

    rmSync(dir, { recursive: true, force: true });
  });

  it('isConfigured() is true with an injected provider', () => {
    const { atlas, dir } = createTestAtlas();
    expect(atlas.llm.isConfigured()).toBe(true);
    rmSync(dir, { recursive: true, force: true });
  });

  it('isConfigured() reflects apiKey and model options without making network calls', () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-llm-configured-'));

    const configured = createAtlas({
      memory: { storageFilePath: join(dir, 'memory.json') },
      llm: { apiKey: 'secret', model: 'claude-test' },
    });
    expect(configured.llm.isConfigured()).toBe(true);

    const missingModel = createAtlas({
      memory: { storageFilePath: join(dir, 'memory-missing-model.json') },
      llm: { apiKey: 'secret' },
    });
    expect(missingModel.llm.isConfigured()).toBe(false);

    const missingKey = createAtlas({
      memory: { storageFilePath: join(dir, 'memory-missing-key.json') },
      llm: { model: 'claude-test' },
    });
    expect(missingKey.llm.isConfigured()).toBe(false);

    rmSync(dir, { recursive: true, force: true });
  });

  it('ask() forwards history to the tool loop', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-llm-history-'));
    const fake = createFakeLlmProviderWithRequests([
      Object.freeze({
        message: Object.freeze({ role: 'assistant' as const, content: 'Continued.' }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'end_turn' as const,
      }),
    ]);
    const atlas = createAtlas({
      memory: { storageFilePath: join(dir, 'memory.json') },
      llm: { provider: fake.provider },
    });
    const history = Object.freeze([
      Object.freeze({ role: 'user' as const, content: 'First' }),
      Object.freeze({ role: 'assistant' as const, content: 'First reply' }),
    ]);

    await atlas.llm.ask('Second', { history });

    expect(fake.requests[0]?.messages.some((message) => message.content === 'First')).toBe(true);
    expect(fake.requests[0]?.messages.some((message) => message.content === 'First reply')).toBe(
      true,
    );
    expect(fake.requests[0]?.messages.some((message) => message.content === 'Second')).toBe(true);

    rmSync(dir, { recursive: true, force: true });
  });

  it('includes contextPrompt in the system message sent to the provider', async () => {
    const fake = createFakeLlmProviderWithRequests([
      Object.freeze({
        message: Object.freeze({ role: 'assistant' as const, content: 'Brand-aware reply.' }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'end_turn' as const,
      }),
    ]);
    const dir = mkdtempSync(join(tmpdir(), 'atlas-llm-context-prompt-'));
    const atlas = createAtlas({
      memory: { storageFilePath: join(dir, 'memory.json') },
      llm: {
        provider: fake.provider,
        contextPrompt: 'Purpose: Electronics retail for enthusiasts',
      },
    });

    await atlas.llm.ask('Hello brand');

    const systemMessage = fake.requests[0]?.messages.find((message) => message.role === 'system');
    expect(systemMessage?.content).toContain('Purpose: Electronics retail for enthusiasts');
    expect(systemMessage?.content).toContain('certified ATLAS capabilities');

    rmSync(dir, { recursive: true, force: true });
  });

  it('includes authoritative tool-result precedence in the system message', async () => {
    const fake = createFakeLlmProviderWithRequests([
      Object.freeze({
        message: Object.freeze({ role: 'assistant' as const, content: 'Acknowledged.' }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'end_turn' as const,
      }),
    ]);
    const dir = mkdtempSync(join(tmpdir(), 'atlas-llm-system-prompt-'));
    const atlas = createAtlas({
      memory: { storageFilePath: join(dir, 'memory.json') },
      llm: { provider: fake.provider },
    });

    await atlas.llm.ask('Hello');

    const systemMessage = fake.requests[0]?.messages.find((message) => message.role === 'system');
    expect(systemMessage?.content).toContain('authoritative');
    expect(systemMessage?.content).toContain('never be contradicted');
    expect(systemMessage?.content).toContain('genuinely empty');

    rmSync(dir, { recursive: true, force: true });
  });

  it('includes fresh knowledge retrieval in the system message before answering', async () => {
    const fake = createFakeLlmProviderWithRequests([
      Object.freeze({
        message: Object.freeze({ role: 'assistant' as const, content: 'Acknowledged.' }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'end_turn' as const,
      }),
    ]);
    const dir = mkdtempSync(join(tmpdir(), 'atlas-llm-fresh-knowledge-'));
    const atlas = createAtlas({
      memory: { storageFilePath: join(dir, 'memory.json') },
      llm: { provider: fake.provider },
    });

    await atlas.memory.storeContent({
      content: 'Un descuento del 15% requiere aprobación escrita del Gerente Comercial.',
      recordType: 'document',
      metadata: Object.freeze({ fileName: 'Politica_Comercial.md' }),
    });

    await atlas.llm.ask('¿Puedo ofrecer un 15% de descuento sin aprobación?', {
      history: Object.freeze([
        Object.freeze({
          role: 'user' as const,
          content: '¿Puedo ofrecer un 15% de descuento sin aprobación?',
        }),
        Object.freeze({
          role: 'assistant' as const,
          content: 'No tengo esa política registrada.',
        }),
      ]),
    });

    const systemMessage = fake.requests[0]?.messages.find((message) => message.role === 'system');
    expect(systemMessage?.content).toContain('Fresh knowledge retrieval for this turn');
    expect(systemMessage?.content).toContain('Gerente Comercial');
    expect(systemMessage?.content).toContain('never assume a previous answer remains valid');

    rmSync(dir, { recursive: true, force: true });
  });

  it('includes internal identifier guidance in the system message', async () => {
    const fake = createFakeLlmProviderWithRequests([
      Object.freeze({
        message: Object.freeze({ role: 'assistant' as const, content: 'Acknowledged.' }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'end_turn' as const,
      }),
    ]);
    const dir = mkdtempSync(join(tmpdir(), 'atlas-llm-system-prompt-'));
    const atlas = createAtlas({
      memory: { storageFilePath: join(dir, 'memory.json') },
      llm: { provider: fake.provider },
    });

    await atlas.llm.ask('Hello');

    const systemMessage = fake.requests[0]?.messages.find((message) => message.role === 'system');
    expect(systemMessage?.content).toContain('workflowId');
    expect(systemMessage?.content).toContain('never read them aloud');
    expect(systemMessage?.content).toContain('business language');

    rmSync(dir, { recursive: true, force: true });
  });

  it('resolves openai-compatible provider from providerId options', async () => {
    const fetchImpl = vi.fn(async (_input: string | URL | Request, _init?: RequestInit) =>
      Response.json({
        choices: [
          {
            message: { role: 'assistant', content: 'Qwen reply.' },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 1, completion_tokens: 1 },
      }),
    );
    vi.stubGlobal('fetch', fetchImpl);

    const dir = mkdtempSync(join(tmpdir(), 'atlas-llm-openai-compatible-'));
    const atlas = createAtlas({
      memory: { storageFilePath: join(dir, 'memory.json') },
      llm: {
        apiKey: 'secret-key',
        model: 'qwen-test-model',
        providerId: 'openai-compatible',
        baseUrl: 'https://custom.example.com/v1',
      },
    });

    const result = await atlas.llm.ask('Hello Qwen');

    expect(result.success).toBe(true);
    expect(result.finalMessage).toBe('Qwen reply.');
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(String(fetchImpl.mock.calls[0]?.[0])).toBe(
      'https://custom.example.com/v1/chat/completions',
    );

    vi.unstubAllGlobals();
    rmSync(dir, { recursive: true, force: true });
  });

  it('rejects unsupported providerId values', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-llm-unsupported-provider-'));
    const atlas = createAtlas({
      memory: { storageFilePath: join(dir, 'memory.json') },
      llm: {
        apiKey: 'secret-key',
        model: 'qwen-test-model',
        providerId: 'qwen',
      },
    });

    await expect(atlas.llm.ask('Hello')).rejects.toThrow(/Unsupported ATLAS_LLM_PROVIDER/);

    rmSync(dir, { recursive: true, force: true });
  });
});
