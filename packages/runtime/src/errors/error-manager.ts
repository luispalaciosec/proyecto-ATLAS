import type { RuntimeErrorCategory, RuntimeErrorRecord } from './types.js';

/**
 * @see ATLAS-RUNTIME-008
 * @see ATLAS-RUNTIME-009 §3 Error Manager
 */
export interface ErrorManager {
  readonly component: 'error-manager';

  record(error: RuntimeErrorRecord): void;

  list(executionId: string): readonly RuntimeErrorRecord[];

  listByCategory(category: RuntimeErrorCategory): readonly RuntimeErrorRecord[];
}
