import { describe, expect, it } from 'vitest';

import { createArtifact, createAtlas } from '../src/index.js';

describe('Atlas SDK plan integration', () => {
  it('plans a goal, compiles projected units, and executes artifacts', async () => {
    const atlas = createAtlas({
      workspace: { name: 'plan-integration' },
      compiler: {
        generators: () => [
          {
            id: 'summary-generator',
            supported_formats: ['summary'],
            generate: (graph) => [
              createArtifact({
                id: 'artifact.plan-integration',
                kind: 'summary',
                content: { nodes: graph.nodes.length, source: 'planned-workflow' },
                source_graph_id: graph.id,
              }),
            ],
          },
        ],
      },
    });

    const planning = atlas.planning.planFromGoal('hacer X');
    expect(planning.success).toBe(true);
    expect(planning.workflow).not.toBeNull();

    const workflowResult = atlas.workflow.compileDefinition(planning.workflow!);
    expect(workflowResult.success).toBe(true);

    const units = atlas.workflow.projectForCompilation(workflowResult.pipeline!, planning.workflow!);
    const compileResult = await atlas.compiler.compile({ units: [...units] });
    const executionResult = await atlas.runtime.execute({
      artifacts: compileResult.context.artifacts,
    });

    expect(compileResult.success).toBe(true);
    expect(compileResult.context.units).toHaveLength(1);
    expect(compileResult.context.units[0]?.origin).toMatch(/^workflow:\/\//);
    expect(executionResult.success).toBe(true);
    expect(executionResult.context.outputs).toHaveLength(1);
  });
});
