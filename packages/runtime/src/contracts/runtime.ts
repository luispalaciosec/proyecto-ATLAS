import type { Artifact } from '@atlas/compiler';

import type { ExecutionResult } from './execution-result.js';

export interface ExecuteParams {
  readonly artifacts: readonly Artifact[];
  readonly workspace?: Readonly<Record<string, unknown>>;
  readonly metadata?: Record<string, unknown>;
}

/**
 * @see ATLAS-DOM-009 §7–8 Runtime Entity
 */
export interface Runtime {
  readonly module: '@atlas/runtime';
  execute(params: ExecuteParams): Promise<ExecutionResult>;
}
