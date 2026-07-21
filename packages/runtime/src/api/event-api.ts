import type {
  RuntimeEventEnvelope,
  RuntimeEventFilter,
  RuntimeEventHandler,
  RuntimeEventSubscription,
} from '../events/types.js';

/**
 * @see ATLAS-RUNTIME-100 §8 Event API
 */
export interface EventApi {
  query(filter: RuntimeEventFilter): readonly RuntimeEventEnvelope[];

  subscribe(handler: RuntimeEventHandler): RuntimeEventSubscription;
}
