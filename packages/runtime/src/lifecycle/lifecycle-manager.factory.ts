import type { LifecycleManager } from './lifecycle-manager.js';

export function createLifecycleManager(): LifecycleManager {
  return {
    component: 'lifecycle-manager',
    getCurrentStage() {
      return null;
    },
    getHistory() {
      return Object.freeze([]);
    },
  };
}
