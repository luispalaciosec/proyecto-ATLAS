import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { createAtlas, createArtifact, planExecuteAndRemember } from '../src/index.js';

describe('RetrievalModule', () => {
  it('retrieves prior plan executions for similar goals', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-retrieval-module-'));
    const atlas = createAtlas({
      memory: { storageFilePath: join(dir, 'memory.json') },
      compiler: {
        generators: () => [
          {
            id: 'summary-generator',
            supported_formats: ['summary'],
            generate: (graph) => [
              createArtifact({
                id: 'artifact.retrieval-module',
                kind: 'summary',
                content: { nodes: graph.nodes.length },
                source_graph_id: graph.id,
              }),
            ],
          },
        ],
      },
    });

    await planExecuteAndRemember(atlas, 'procesar pedido cliente');

    const retrieval = await atlas.retrieval.retrieveForGoal('procesar pedido urgente');

    expect(retrieval.success).toBe(true);
    expect(retrieval.context.items.length).toBeGreaterThan(0);
    expect(retrieval.context.items[0]?.text).toContain('procesar pedido cliente');

    rmSync(dir, { recursive: true, force: true });
  });
});

describe('planExecuteAndRemember with retrieval', () => {
  it('includes prior memory in planning context for a similar second goal', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-plan-retrieval-'));
    const atlas = createAtlas({
      memory: { storageFilePath: join(dir, 'memory.json') },
      compiler: {
        generators: () => [
          {
            id: 'summary-generator',
            supported_formats: ['summary'],
            generate: (graph) => [
              createArtifact({
                id: 'artifact.plan-retrieval',
                kind: 'summary',
                content: { nodes: graph.nodes.length },
                source_graph_id: graph.id,
              }),
            ],
          },
        ],
      },
    });

    await planExecuteAndRemember(atlas, 'procesar pedido cliente');
    const second = await planExecuteAndRemember(atlas, 'procesar pedido urgente');

    expect(second.retrieval.context.items.length).toBeGreaterThan(0);
    expect(second.retrieval.context.items.some((item) => item.text.includes('procesar pedido'))).toBe(
      true,
    );

    rmSync(dir, { recursive: true, force: true });
  });
});
