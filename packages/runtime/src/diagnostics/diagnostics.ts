import type { RuntimeDiagnosticsSnapshot } from './types.js';

/**
 * @see ATLAS-RUNTIME-007
 * @see ATLAS-RUNTIME-009 §3 Observability Layer
 */
export interface Diagnostics {
  readonly component: 'diagnostics';

  getSnapshot(executionId: string): RuntimeDiagnosticsSnapshot;
}
