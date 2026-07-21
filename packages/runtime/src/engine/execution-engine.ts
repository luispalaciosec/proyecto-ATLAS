import type { ExecutionResult } from '../contracts/execution-result.js';
import type { ExecuteParams } from '../contracts/runtime.js';

import type { ExecutionSnapshot, ExecutionUnit } from './types.js';

/**
 * @see ATLAS-RUNTIME-001
 * @see ATLAS-RUNTIME-009 §3 Execution Engine
 */
export interface ExecutionEngine {
  readonly component: 'execution-engine';

  execute(params: ExecuteParams): Promise<ExecutionResult>;

  createExecution(unit: ExecutionUnit): Promise<ExecutionSnapshot>;

  getExecution(executionId: string): ExecutionSnapshot | null;
}
