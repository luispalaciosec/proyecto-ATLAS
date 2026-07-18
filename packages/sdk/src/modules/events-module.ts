import type { EventBus, EventDefinition, EventHandler, Unsubscribe } from '@atlas/events';

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
}
