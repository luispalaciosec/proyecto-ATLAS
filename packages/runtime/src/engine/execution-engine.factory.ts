import type { ExecutionEngine } from './execution-engine.js';
import type { ExecutionUnit } from './types.js';

export function createExecutionEngine(): ExecutionEngine {
  return {
    component: 'execution-engine',
    async createExecution(unit: ExecutionUnit) {
      return Object.freeze({
        execution_id: unit.execution_id.toJSON(),
        status: 'pending' as const,
      });
    },
    getExecution() {
      return null;
    },
  };
}
