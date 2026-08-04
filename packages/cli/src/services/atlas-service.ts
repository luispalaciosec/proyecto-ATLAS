import {
  createArtifact,
  createAtlas,
  type Atlas,
  type CompilationResult,
  type CreateCompilationUnitParams,
  type ExecutionResult,
  type Generator,
} from '@atlas/sdk';

import type { WorkspaceConfig } from '../configuration/workspace-config.js';
import {
  CliExitError,
  EXIT_COMPILATION_ERROR,
  EXIT_RUNTIME_ERROR,
  EXIT_VALIDATION_ERROR,
} from '../output/exit-codes.js';

/**
 * Thin SDK adapter — no business logic, only composition.
 */
export class AtlasService {
  #memoryClient: Atlas | undefined;

  createClient(workspace?: WorkspaceConfig): Atlas {
    return createAtlas({
      workspace: workspace
        ? {
            name: workspace.name,
            environment: workspace.environment ?? 'memory',
          }
        : {
            name: 'atlas-cli',
            environment: 'memory',
          },
      compiler: {
        generators: () => [this.#createSummaryGenerator()],
      },
    });
  }

  createMemoryClient(): Atlas {
    if (this.#memoryClient === undefined) {
      this.#memoryClient = this.createClient();
    }

    return this.#memoryClient;
  }

  async compile(
    client: Atlas,
    units: readonly CreateCompilationUnitParams[],
  ): Promise<CompilationResult> {
    return client.compiler.compile({ units: [...units] });
  }

  async executeCompiled(client: Atlas, compileResult: CompilationResult): Promise<ExecutionResult> {
    return client.runtime.execute({ artifacts: compileResult.context.artifacts });
  }

  async compileAndExecute(
    client: Atlas,
    units: readonly CreateCompilationUnitParams[],
  ): Promise<{ compile: CompilationResult; execute: ExecutionResult }> {
    const compile = await this.compile(client, units);

    if (!compile.success) {
      throw new CliExitError(EXIT_COMPILATION_ERROR, 'Compilation failed');
    }

    const execute = await this.executeCompiled(client, compile);

    if (!execute.success) {
      throw new CliExitError(EXIT_RUNTIME_ERROR, 'Execution failed');
    }

    return { compile, execute };
  }

  async planAndExecute(
    client: Atlas,
    goalText: string,
  ): Promise<{
    planning: ReturnType<Atlas['planning']['planFromGoal']>;
    compile: CompilationResult;
    execute: ExecutionResult;
  }> {
    const planning = client.planning.planFromGoal(goalText);

    if (!planning.success || !planning.workflow) {
      throw new CliExitError(EXIT_VALIDATION_ERROR, 'Planning failed');
    }

    const workflowResult = client.workflow.compileDefinition(planning.workflow);

    if (!workflowResult.success || !workflowResult.pipeline) {
      throw new CliExitError(EXIT_VALIDATION_ERROR, 'Workflow compilation failed');
    }

    const units = client.workflow.projectForCompilation(workflowResult.pipeline, planning.workflow);
    const { compile, execute } = await this.compileAndExecute(client, units);

    return { planning, compile, execute };
  }

  #createSummaryGenerator(): Generator {
    return {
      id: 'summary-generator',
      supported_formats: ['summary'],
      generate: (graph) => [
        createArtifact({
          id: 'artifact.cli-summary',
          kind: 'summary',
          content: { nodes: graph.nodes.length },
          source_graph_id: graph.id,
        }),
      ],
    };
  }
}
