import type {
  CorrelationId,
  DomainEvent,
  EventBus,
  EventDefinition,
  EventHandler,
  EventSource,
  Unsubscribe,
} from '@atlas/events';
import { createEventSource } from '@atlas/events';

/**
 * Public events facade — SDK-202 §14.
 * Delegates to the shared in-memory bus without adding delivery logic.
 */
export class EventsModule {
  readonly #bus: EventBus;

  constructor(bus: EventBus) {
    this.#bus = bus;
  }

  subscribe<TPayload>(
    definition: EventDefinition<TPayload>,
    handler: EventHandler<TPayload>,
  ): Unsubscribe {
    return this.#bus.subscribe(definition, handler);
  }

  publish<TPayload>(
    definition: EventDefinition<TPayload>,
    payload: TPayload,
    options: {
      readonly source?: EventSource | string;
      readonly correlation_id?: CorrelationId;
      readonly metadata?: Record<string, unknown>;
    } = {},
  ): DomainEvent<TPayload> {
    const event = definition.create(payload, {
      source:
        options.source !== undefined
          ? typeof options.source === 'string'
            ? createEventSource(options.source)
            : options.source
          : createEventSource('@atlas/sdk'),
      ...(options.correlation_id !== undefined ? { correlation_id: options.correlation_id } : {}),
      ...(options.metadata !== undefined ? { metadata: options.metadata } : {}),
    });

    this.#bus.publish(event);

    return event;
  }
}
