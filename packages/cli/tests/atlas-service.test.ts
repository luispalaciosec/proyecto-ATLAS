import { describe, expect, it, vi } from 'vitest';

import { createArtifact, createAtlas } from '@atlas/sdk';

import {
  CliExitError,
  EXIT_COMPILATION_ERROR,
  EXIT_RUNTIME_ERROR,
  EXIT_VALIDATION_ERROR,
} from '../src/output/exit-codes.js';
import { AtlasService } from '../src/services/atlas-service.js';

describe('AtlasService', () => {
  const service = new AtlasService();

  it('throws compilation exit code when compile fails during run', async () => {
    const client = createAtlas({ workspace: { name: 'test' } });

    vi.spyOn(client.compiler, 'compile').mockResolvedValue({
      success: false,
      context: {
        lifecycle: 'complete',
        artifacts: [],
        diagnostics: [],
      },
    } as unknown as Awaited<ReturnType<typeof client.compiler.compile>>);

    await expect(service.compileAndExecute(client, [])).rejects.toMatchObject({
      code: EXIT_COMPILATION_ERROR,
    });

    vi.restoreAllMocks();
  });

  it('throws runtime exit code when execution fails during run', async () => {
    const client = createAtlas({ workspace: { name: 'test' } });

    vi.spyOn(client.compiler, 'compile').mockResolvedValue({
      success: true,
      context: {
        lifecycle: 'complete',
        artifacts: [],
        diagnostics: [],
      },
    } as unknown as Awaited<ReturnType<typeof client.compiler.compile>>);

    vi.spyOn(client.runtime, 'execute').mockResolvedValue({
      success: false,
      context: {
        lifecycle: 'failed',
        artifacts: [],
        outputs: [],
      },
    } as unknown as Awaited<ReturnType<typeof client.runtime.execute>>);

    await expect(service.compileAndExecute(client, [])).rejects.toMatchObject({
      code: EXIT_RUNTIME_ERROR,
    });

    vi.restoreAllMocks();
  });

  it('rethrows CliExitError instances unchanged', async () => {
    const client = createAtlas({ workspace: { name: 'test' } });
    const cliError = new CliExitError(EXIT_COMPILATION_ERROR, 'already wrapped');

    vi.spyOn(client.compiler, 'compile').mockRejectedValue(cliError);

    await expect(service.compileAndExecute(client, [])).rejects.toBe(cliError);

    vi.restoreAllMocks();
  });

  it('plans a goal and executes the projected workflow', async () => {
    const client = createAtlas({
      workspace: { name: 'plan-service' },
      compiler: {
        generators: () => [
          {
            id: 'summary-generator',
            supported_formats: ['summary'],
            generate: (graph) => [
              createArtifact({
                id: 'artifact.plan-service',
                kind: 'summary',
                content: { nodes: graph.nodes.length },
                source_graph_id: graph.id,
              }),
            ],
          },
        ],
      },
    });

    const result = await service.planAndExecute(client, 'hacer X');

    expect(result.planning.success).toBe(true);
    expect(result.planning.workflow?.identity.workflow_id).toMatch(/^workflow\./);
    expect(result.compile.success).toBe(true);
    expect(result.execute.success).toBe(true);

    const search = await client.memory.searchContent({ query: 'hacer X' });
    expect(search.total).toBe(1);
  });

  it('throws validation exit code when planning fails', async () => {
    const client = createAtlas({ workspace: { name: 'plan-fail' } });

    await expect(service.planAndExecute(client, '   ')).rejects.toMatchObject({
      code: EXIT_VALIDATION_ERROR,
    });
  });
});
