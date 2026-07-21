import type { ExecutionResult } from '../contracts/execution-result.js';
import type { ExecuteParams } from '../contracts/runtime.js';
import type { ExecutionSnapshot } from '../engine/types.js';

/**
 * @see ATLAS-RUNTIME-100 §4 Execution API
 */
export interface ExecutionApi {
  execute(params: ExecuteParams): Promise<ExecutionResult>;

  getExecution(executionId: string): ExecutionSnapshot | null;
}
