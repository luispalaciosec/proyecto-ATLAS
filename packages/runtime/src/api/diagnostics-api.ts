import type { RuntimeDiagnosticsSnapshot } from '../diagnostics/types.js';

/**
 * @see ATLAS-RUNTIME-100 §9 Diagnostics API
 */
export interface DiagnosticsApi {
  getSnapshot(executionId: string): RuntimeDiagnosticsSnapshot;
}
