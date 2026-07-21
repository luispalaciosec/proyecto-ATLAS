import type { StateScope, StateSnapshot, StateTransition } from './types.js';

/**
 * @see ATLAS-RUNTIME-003
 * @see ATLAS-RUNTIME-009 §3 State Manager
 */
export interface StateManager {
  readonly component: 'state-manager';

  getState(scope: StateScope, entityId: string): StateSnapshot | null;

  getTransitionHistory(scope: StateScope, entityId: string): readonly StateTransition[];
}
