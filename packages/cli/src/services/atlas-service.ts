import {
  createArtifact,
  createAtlas,
  planExecuteAndRemember,
  type Atlas,
  type CompilationResult,
  type CreateCompilationUnitParams,
  type ExecutionResult,
  type Generator,
  type PlanExecuteAndRememberResult,
} from '@atlas/sdk';
import { join } from 'node:path';

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
  #sessionClient: Atlas | undefined;

  #resolveMemoryFilePath(): string {
    const fromEnv = process.env.ATLAS_MEMORY_FILE;

    if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
      return fromEnv;
    }

    return join(process.cwd(), '.atlas', 'memory.json');
  }

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
      memory: {
        storageFilePath: this.#resolveMemoryFilePath(),
      },
    });
  }

  createMemoryClient(workspace?: WorkspaceConfig): Atlas {
    if (this.#sessionClient === undefined) {
      this.#sessionClient = this.createClient(workspace);
    }

    return this.#sessionClient;
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
  ): Promise<Omit<PlanExecuteAndRememberResult, 'memory'>> {
    try {
      const result = await planExecuteAndRemember(client, goalText);

      return {
        planning: result.planning,
        compile: result.compile,
        execute: result.execute,
      };
    } catch (error) {
      if (error instanceof CliExitError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : String(error);

      if (message === 'Planning failed' || message === 'Workflow compilation failed') {
        throw new CliExitError(EXIT_VALIDATION_ERROR, message);
      }

      if (message === 'Compilation failed') {
        throw new CliExitError(EXIT_COMPILATION_ERROR, message);
      }

      if (message === 'Execution failed') {
        throw new CliExitError(EXIT_RUNTIME_ERROR, message);
      }

      throw error;
    }
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
