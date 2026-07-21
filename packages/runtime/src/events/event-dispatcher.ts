import type {
  RuntimeEventEnvelope,
  RuntimeEventFilter,
  RuntimeEventHandler,
  RuntimeEventSubscription,
} from './types.js';

/**
 * @see ATLAS-RUNTIME-002
 * @see ATLAS-RUNTIME-009 §3 Event Dispatcher
 */
export interface EventDispatcher {
  readonly component: 'event-dispatcher';

  publish(event: RuntimeEventEnvelope): void;

  query(filter: RuntimeEventFilter): readonly RuntimeEventEnvelope[];

  subscribe(handler: RuntimeEventHandler): RuntimeEventSubscription;
}
