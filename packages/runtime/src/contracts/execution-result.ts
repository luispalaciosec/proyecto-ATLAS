import type { ExecutionContext } from './execution-context.js';

/**
 * @see ATLAS-DOM-009 §18 Runtime Execution Model
 */
export interface ExecutionResult {
  readonly context: ExecutionContext;
  readonly success: boolean;
}
