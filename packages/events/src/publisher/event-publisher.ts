import type { EventBus, EventDefinition } from '../contracts/event-definition.js';
import type { CorrelationId, DomainEvent, EventSource } from '../contracts/event.js';
import { createEventSource } from '../contracts/event.js';

export interface EventPublisherOptions {
  readonly source: EventSource | string;
  readonly correlation_id?: CorrelationId;
  readonly metadata?: Record<string, unknown>;
}

/**
 * @see SDK-204 §15 Event Publishers
 */
export class EventPublisher {
  readonly #bus: EventBus;
  readonly #source: EventSource;
  readonly #correlationId?: CorrelationId;
  readonly #metadata: Record<string, unknown>;

  constructor(bus: EventBus, options: EventPublisherOptions) {
    this.#bus = bus;
    this.#source = createEventSource(String(options.source));
    this.#correlationId = options.correlation_id;
    this.#metadata = options.metadata ?? {};
  }

  publish<TPayload>(
    definition: EventDefinition<TPayload>,
    payload: TPayload,
    metadata: Record<string, unknown> = {},
  ): DomainEvent<TPayload> {
    const event = definition.create(payload, {
      source: this.#source,
      correlation_id: this.#correlationId,
      metadata: { ...this.#metadata, ...metadata },
    });

    this.#bus.publish(event);
    return event;
  }
}

export function createEventPublisher(
  bus: EventBus,
  source: EventSource | string,
  options: Omit<EventPublisherOptions, 'source'> = {},
): EventPublisher {
  return new EventPublisher(bus, { source, ...options });
}
