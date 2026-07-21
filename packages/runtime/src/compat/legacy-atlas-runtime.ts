import type { ExecutionResult } from '../contracts/execution-result.js';
import type { ExecuteParams, Runtime } from '../contracts/runtime.js';
import { createRuntimeComposition, type RuntimeComposition } from '../composition/index.js';

export interface LegacyAtlasRuntimeOptions {
  readonly eventBus?: import('@atlas/events').EventBus;
  readonly executors?: readonly import('../contracts/artifact-executor.js').ArtifactExecutor[];
  readonly clock?: () => string;
}

/**
 * Compat layer — preserves Runtime.execute() behavior for existing consumers.
 * @see ATLAS-RUNTIME-100 §10 Compatibility Rules
 */
export class LegacyAtlasRuntime implements Runtime {
  readonly module = '@atlas/runtime' as const;
  readonly composition: RuntimeComposition;

  constructor(options: LegacyAtlasRuntimeOptions = {}) {
    this.composition = createRuntimeComposition(options);
  }

  async execute(params: ExecuteParams): Promise<ExecutionResult> {
    return this.composition.api.execution.execute(params);
  }
}

export function createLegacyAtlasRuntime(
  options: LegacyAtlasRuntimeOptions = {},
): LegacyAtlasRuntime {
  return new LegacyAtlasRuntime(options);
}
