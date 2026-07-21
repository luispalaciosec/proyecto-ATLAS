import type { ExecutionResult } from '../contracts/execution-result.js';
import type { ExecuteParams, Runtime } from '../contracts/runtime.js';
import {
  createLegacyAtlasRuntime,
  type LegacyAtlasRuntimeOptions,
} from '../compat/legacy-atlas-runtime.js';

export interface AtlasRuntimeOptions extends LegacyAtlasRuntimeOptions {}

export class AtlasRuntime implements Runtime {
  readonly module = '@atlas/runtime' as const;
  readonly composition;

  readonly #runtime;

  constructor(options: AtlasRuntimeOptions = {}) {
    this.#runtime = createLegacyAtlasRuntime(options);
    this.composition = this.#runtime.composition;
  }

  async execute(params: ExecuteParams): Promise<ExecutionResult> {
    return this.#runtime.execute(params);
  }
}

export function createAtlasRuntime(options: AtlasRuntimeOptions = {}): AtlasRuntime {
  return new AtlasRuntime(options);
}
