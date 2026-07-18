import type { AtlasError } from '../errors/atlas-error.js';
import type { EngineEvent } from './event.js';
import type { EngineMetrics } from './metrics.js';
import type { ExecutionStatus } from './status.js';

/**
 * Engine module output contract.
 * @see ATLAS-100 §12 Output Contract
 */
export interface EngineOutput<TResult = unknown> {
  readonly status: ExecutionStatus;
  readonly result: TResult;
  readonly events: readonly EngineEvent[];
  readonly metrics: EngineMetrics;
  readonly errors: readonly AtlasError[];
}
