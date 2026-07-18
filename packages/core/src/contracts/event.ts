import type { AtlasTimestamp } from '../timestamp.js';
import type { TraceId } from '../trace-id.js';

/**
 * Traceable engine event.
 * @see ATLAS-100 §13 Event Model
 */
export interface EngineEvent {
  readonly name: string;
  readonly timestamp: AtlasTimestamp;
  readonly trace_id: TraceId;
  readonly payload: unknown;
  readonly source: string;
}
