import type { ExecutionLifecycleSnapshot, ExecutionLifecycleStage } from '../lifecycle/types.js';

/**
 * @see ATLAS-RUNTIME-100 §5 Lifecycle API
 */
export interface LifecycleApi {
  getCurrentStage(executionId: string): ExecutionLifecycleStage | null;

  getHistory(executionId: string): readonly ExecutionLifecycleSnapshot[];
}
