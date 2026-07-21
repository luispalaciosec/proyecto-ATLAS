import type { ErrorManager } from './error-manager.js';

export function createErrorManager(): ErrorManager {
  return {
    component: 'error-manager',
    record() {
      // Sprint 10B
    },
    list() {
      return Object.freeze([]);
    },
    listByCategory() {
      return Object.freeze([]);
    },
  };
}
