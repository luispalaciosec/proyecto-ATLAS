import type { ExecutionLifecycleStage } from '../lifecycle/types.js';

import type { ExecutionStateValue, StateScope, StateSnapshot, StateTransition } from './types.js';

/**
 * @see ATLAS-RUNTIME-003
 * @see ATLAS-RUNTIME-009 §3 State Manager
 */
export interface StateManager {
  readonly component: 'state-manager';

  initializeExecution(
    executionId: string,
    initial: Pick<ExecutionStateValue, 'artifact_count'>,
  ): StateSnapshot;

  transitionExecution(
    executionId: string,
    nextStage: ExecutionLifecycleStage,
    patch?: Partial<Pick<ExecutionStateValue, 'success' | 'output_count'>>,
  ): StateSnapshot;

  getState(scope: StateScope, entityId: string): StateSnapshot | null;

  getTransitionHistory(scope: StateScope, entityId: string): readonly StateTransition[];
}
