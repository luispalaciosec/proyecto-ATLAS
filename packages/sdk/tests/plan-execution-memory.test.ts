import { describe, expect, it } from 'vitest';

import { createArtifact, createAtlas, planExecuteAndRemember } from '../src/index.js';

describe('planExecuteAndRemember', () => {
  it('plans, executes, and stores the execution in memory', async () => {
    const atlas = createAtlas({
      workspace: { name: 'plan-memory' },
      compiler: {
        generators: () => [
          {
            id: 'summary-generator',
            supported_formats: ['summary'],
            generate: (graph) => [
              createArtifact({
                id: 'artifact.plan-memory',
                kind: 'summary',
                content: { nodes: graph.nodes.length },
                source_graph_id: graph.id,
              }),
            ],
          },
        ],
      },
    });

    const result = await planExecuteAndRemember(atlas, 'hacer X');

    expect(result.planning.success).toBe(true);
    expect(result.execute.success).toBe(true);
    expect(result.memory.record.type).toBe('PlanExecution');

    const search = await atlas.memory.searchContent({ query: 'hacer X' });

    expect(search.total).toBe(1);
    expect(search.records[0]?.id).toBe(result.memory.recordId);
    expect(search.records[0]?.metadata).toMatchObject({
      workflowId: result.planning.workflow?.identity.workflow_id,
      sessionId: result.execute.context.session_id.toJSON(),
    });
  });

  it('keeps distinct plan executions searchable by goal', async () => {
    const atlas = createAtlas({
      workspace: { name: 'plan-memory-multi' },
      compiler: {
        generators: () => [
          {
            id: 'summary-generator',
            supported_formats: ['summary'],
            generate: (graph) => [
              createArtifact({
                id: 'artifact.plan-memory-multi',
                kind: 'summary',
                content: { nodes: graph.nodes.length },
                source_graph_id: graph.id,
              }),
            ],
          },
        ],
      },
    });

    await planExecuteAndRemember(atlas, 'procesar pedido A');
    await planExecuteAndRemember(atlas, 'analizar dataset B');

    const searchA = await atlas.memory.searchContent({ query: 'procesar pedido' });
    const searchB = await atlas.memory.searchContent({ query: 'analizar dataset' });

    expect(searchA.total).toBe(1);
    expect(searchB.total).toBe(1);
    expect(searchA.records[0]?.id).not.toBe(searchB.records[0]?.id);
  });
});
