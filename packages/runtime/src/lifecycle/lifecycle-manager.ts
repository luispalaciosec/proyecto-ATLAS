import type { ExecutionLifecycleSnapshot, ExecutionLifecycleStage } from './types.js';

/**
 * @see ATLAS-RUNTIME-006
 */
export interface LifecycleManager {
  readonly component: 'lifecycle-manager';

  getCurrentStage(executionId: string): ExecutionLifecycleStage | null;

  getHistory(executionId: string): readonly ExecutionLifecycleSnapshot[];
}
