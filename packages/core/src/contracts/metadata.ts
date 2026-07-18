import type { AtlasTimestamp } from '../timestamp.js';
import type { TraceId } from '../trace-id.js';

/**
 * Traceability metadata for engine operations.
 * @see ATLAS-100 §12 Input Contract (metadata)
 */
export interface EngineMetadata {
  readonly trace_id: TraceId;
  readonly timestamp: AtlasTimestamp;
  readonly [key: string]: unknown;
}
