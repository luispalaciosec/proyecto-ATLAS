import type { StateManager } from './state-manager.js';

export function createStateManager(): StateManager {
  return {
    component: 'state-manager',
    getState() {
      return null;
    },
    getTransitionHistory() {
      return Object.freeze([]);
    },
  };
}
