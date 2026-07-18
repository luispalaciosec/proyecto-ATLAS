import type { Artifact } from '@atlas/compiler';

import type { ExecutionContext } from './execution-context.js';
import type { ExecutionOutput } from './execution-output.js';

/**
 * Executes compiled Artifacts of a specific kind.
 * @see ATLAS-DOM-009 §18 — Load Artifacts → Start Execution
 */
export interface ArtifactExecutor {
  readonly kind: string;
  execute(artifact: Artifact, context: ExecutionContext): ExecutionOutput;
}
