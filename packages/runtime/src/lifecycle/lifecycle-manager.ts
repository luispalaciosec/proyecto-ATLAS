import type { ExecutionLifecycleSnapshot, ExecutionLifecycleStage } from './types.js';

/**
 * @see ATLAS-RUNTIME-006
 */
export interface LifecycleManager {
  readonly component: 'lifecycle-manager';

  createExecution(executionId: string): ExecutionLifecycleSnapshot;

  transition(executionId: string, toStage: ExecutionLifecycleStage): ExecutionLifecycleSnapshot;

  getCurrentStage(executionId: string): ExecutionLifecycleStage | null;

  getHistory(executionId: string): readonly ExecutionLifecycleSnapshot[];
}
