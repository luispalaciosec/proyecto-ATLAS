import type { AtlasTimestamp } from '../timestamp.js';
import type { TraceId } from '../trace-id.js';
import type { ErrorSeverity } from './severity.js';

/**
 * Uniform Atlas error contract.
 * @see ATLAS-100 §12 Error Contract
 */
export interface AtlasError {
  readonly code: string;
  readonly message: string;
  readonly severity: ErrorSeverity;
  readonly module: string;
  readonly timestamp: AtlasTimestamp;
  readonly trace_id: TraceId;
}
