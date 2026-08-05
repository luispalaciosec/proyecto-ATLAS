import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createFakeLlmProvider } from '@atlas/llm';
import { describe, expect, it } from 'vitest';

import { createArtifact, createAtlas, planExecuteAndRemember } from '../src/index.js';

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
});
