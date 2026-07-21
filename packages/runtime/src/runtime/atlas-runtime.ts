import type { ExecutionResult } from '../contracts/execution-result.js';
import type { ExecuteParams, Runtime } from '../contracts/runtime.js';
import {
  createLegacyAtlasRuntime,
  type LegacyAtlasRuntimeOptions,
} from '../compat/legacy-atlas-runtime.js';
import { createRuntimeComposition, type RuntimeComposition } from '../composition/index.js';

export interface AtlasRuntimeOptions extends LegacyAtlasRuntimeOptions {}

export class AtlasRuntime implements Runtime {
  readonly module = '@atlas/runtime' as const;
  readonly composition: RuntimeComposition;
  readonly #legacy;

  constructor(options: AtlasRuntimeOptions = {}) {
    this.#legacy = createLegacyAtlasRuntime(options);
    this.composition = createRuntimeComposition(options);
  }

  async execute(params: ExecuteParams): Promise<ExecutionResult> {
    return this.#legacy.execute(params);
  }
}

export function createAtlasRuntime(options: AtlasRuntimeOptions = {}): AtlasRuntime {
  return new AtlasRuntime(options);
}
