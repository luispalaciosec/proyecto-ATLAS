import type { Diagnostics } from './diagnostics.js';

export function createDiagnostics(): Diagnostics {
  return {
    component: 'diagnostics',
    getSnapshot(executionId: string) {
      return Object.freeze({
        execution_id: executionId,
        metrics: Object.freeze([]),
        traces: Object.freeze([]),
        diagnostics: Object.freeze([]),
      });
    },
  };
}
