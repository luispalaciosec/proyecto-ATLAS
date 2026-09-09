import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createFakeLlmProviderWithRequests } from '@atlas/llm';
import { describe, expect, it, vi } from 'vitest';

import {
  AtlasContextBuilder,
  CONTEXT_SYSTEM_PROMPT_MAX_LENGTH,
  KNOWLEDGE_CONTEXT_SNIPPET_MAX_LENGTH,
  createAtlas,
} from '../src/index.js';
import { seedCase1DiscountGraph } from '../src/org/fixtures.js';
import * as retrievalContentSearch from '../src/retrieval/retrieval-content-search.js';

function createContextAtlas(
  storageFilePath: string,
  workspace = 'default',
  contextPrompt?: string,
) {
  const fake = createFakeLlmProviderWithRequests([
    Object.freeze({
      message: Object.freeze({ role: 'assistant' as const, content: 'Acknowledged.' }),
      usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
      stopReason: 'end_turn' as const,
    }),
  ]);

  const atlas = createAtlas({
    workspace: { name: workspace },
    memory: { storageFilePath },
    llm: {
      provider: fake.provider,
      ...(contextPrompt !== undefined ? { contextPrompt } : {}),
    },
  });

  return Object.freeze({ atlas, fake });
}

describe('INT-004 AtlasContextBuilder', () => {
  it('INT-004-A: builds basic brand/workspace context in the system prompt', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int004-a-'));
    const brandPrompt = 'Purpose: Electronics retail for enthusiasts';
    const { atlas } = createContextAtlas(join(dir, 'memory.json'), 'geeks', brandPrompt);

    const contextPackage = await AtlasContextBuilder.build({
      goal: 'Hello brand',
      atlas,
      contextPrompt: brandPrompt,
      workspace: 'geeks',
    });

    expect(contextPackage.workspace).toBe('geeks');
    expect(contextPackage.systemPrompt).toContain('Purpose: Electronics retail for enthusiasts');
    expect(contextPackage.sources.some((source) => source.kind === 'brand')).toBe(true);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-004-B: includes knowledge retrieved via Retrieval in the context package', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int004-b-'));
    const { atlas } = createContextAtlas(join(dir, 'memory.json'));

    await atlas.memory.storeContent({
      content: 'termino-contexto-int004-beta unico en memoria',
    });

    const contextPackage = await AtlasContextBuilder.build({
      goal: 'termino-contexto-int004-beta',
      atlas,
      workspace: 'default',
    });

    expect(contextPackage.retrieval.selected).toBeGreaterThan(0);
    expect(contextPackage.systemPrompt).toContain('termino-contexto-int004-beta');
    expect(contextPackage.sources.some((source) => source.kind === 'knowledge')).toBe(true);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-004-C: includes organizational context when the query requires it', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int004-c-'));
    const { atlas } = createContextAtlas(join(dir, 'memory.json'));

    await seedCase1DiscountGraph(atlas);

    const contextPackage = await AtlasContextBuilder.build({
      goal: '¿Puedo ofrecerle 12% de descuento a Constructora Andes S.A.?',
      atlas,
      workspace: 'default',
    });

    expect(contextPackage.systemPrompt).toContain('Organizational intelligence context');
    expect(contextPackage.systemPrompt).toContain('10%');
    expect(contextPackage.sources.some((source) => source.kind === 'organizational')).toBe(true);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-004-D: keeps brand/workspace isolation in context retrieval', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int004-d-'));
    const geeks = createContextAtlas(join(dir, 'geeks.json'), 'geeks');
    const revital = createContextAtlas(join(dir, 'revital.json'), 'revital');

    await geeks.atlas.memory.storeContent({
      content: 'secreto exclusivo geeks int004 delta',
    });

    const cross = await AtlasContextBuilder.build({
      goal: 'secreto exclusivo geeks int004 delta',
      atlas: revital.atlas,
      workspace: 'revital',
    });
    const local = await AtlasContextBuilder.build({
      goal: 'secreto exclusivo geeks int004 delta',
      atlas: geeks.atlas,
      workspace: 'geeks',
    });

    expect(cross.retrieval.selected).toBe(0);
    expect(local.retrieval.selected).toBeGreaterThan(0);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-004-E: records recent conversation in context sources', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int004-e-'));
    const { atlas } = createContextAtlas(join(dir, 'memory.json'));
    const history = Object.freeze([
      Object.freeze({ role: 'user' as const, content: 'First question' }),
      Object.freeze({ role: 'assistant' as const, content: 'First answer' }),
    ]);

    const contextPackage = await AtlasContextBuilder.build({
      goal: 'Second question',
      atlas,
      workspace: 'default',
      history,
    });

    expect(contextPackage.history).toEqual(history);
    expect(contextPackage.sources.some((source) => source.kind === 'conversation')).toBe(true);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-004-F: enforces existing context size limits', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int004-f-'));
    const { atlas } = createContextAtlas(join(dir, 'memory.json'));

    for (let index = 0; index < 12; index += 1) {
      await atlas.memory.storeContent({
        content: `bloque-int004-f-${index} `.repeat(400),
      });
    }

    const contextPackage = await AtlasContextBuilder.build({
      goal: 'bloque-int004-f',
      atlas,
      workspace: 'default',
    });

    expect(contextPackage.systemPrompt.length).toBeLessThanOrEqual(
      CONTEXT_SYSTEM_PROMPT_MAX_LENGTH,
    );
    expect(
      contextPackage.retrieval.priorGoals.every(
        (snippet) => snippet.length <= KNOWLEDGE_CONTEXT_SNIPPET_MAX_LENGTH,
      ),
    ).toBe(true);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-004-G: llm.ask uses AtlasContextBuilder as the context path', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int004-g-'));
    const { atlas, fake } = createContextAtlas(join(dir, 'memory.json'));
    const buildSpy = vi.spyOn(AtlasContextBuilder, 'build');

    await atlas.llm.ask('Probe context builder path');

    expect(buildSpy).toHaveBeenCalledTimes(1);
    const systemMessage = fake.requests[0]?.messages.find((message) => message.role === 'system');
    expect(systemMessage?.content).toContain('Fresh knowledge retrieval');

    buildSpy.mockRestore();
    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-004-H: main consumers do not keep parallel private context builders', async () => {
    const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
    const sources = [
      'packages/sdk/src/modules/llm-module.ts',
      'packages/cli/src/chat/chat-turn.ts',
      'apps/web/src/server.ts',
    ] as const;

    for (const relativePath of sources) {
      const source = readFileSync(join(repoRoot, relativePath), 'utf8');
      expect(source).not.toMatch(
        /prefetchKnowledgeForGoal|buildFreshKnowledgeContextBlock|buildSystemPrompt\(/,
      );
    }

    const chatTurnSource = readFileSync(
      join(repoRoot, 'packages/cli/src/chat/chat-turn.ts'),
      'utf8',
    );
    expect(chatTurnSource).toContain('AtlasContextBuilder.build');
  });

  it('INT-004-H: builder delegates knowledge retrieval to RetrievalModule pipeline', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int004-h-'));
    const { atlas } = createContextAtlas(join(dir, 'memory.json'));
    const pipelineSpy = vi.spyOn(retrievalContentSearch, 'searchContentViaRetrieval');

    await AtlasContextBuilder.build({
      goal: 'retrieval delegation int004',
      atlas,
      workspace: 'default',
    });

    expect(pipelineSpy).toHaveBeenCalled();

    pipelineSpy.mockRestore();
    rmSync(dir, { recursive: true, force: true });
  });
});
