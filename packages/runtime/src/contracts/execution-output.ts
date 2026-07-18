import type { Identifier } from '@atlas/core';

/**
 * Result of executing a single Artifact.
 * @see ATLAS-DOM-009 §18 Runtime Execution Model
 */
export interface ExecutionOutput {
  readonly artifact_id: Identifier;
  readonly kind: string;
  readonly result: unknown;
  readonly success: boolean;
}
