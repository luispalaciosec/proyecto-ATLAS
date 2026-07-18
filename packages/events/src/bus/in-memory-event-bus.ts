import type {
  EventBus,
  EventDefinition,
  EventHandler,
  Unsubscribe,
} from '../contracts/event-definition.js';
import type { DomainEvent, EventType } from '../contracts/event.js';

type HandlerEntry = EventHandler<unknown>;

/**
 * In-memory synchronous event bus.
 * @see SDK-204 §14 Event Bus
 * @see SDK-204 §13 (memory delivery only in Sprint 3)
 */
export class InMemoryEventBus implements EventBus {
  readonly #handlers = new Map<EventType, HandlerEntry[]>();

  publish<TPayload>(event: DomainEvent<TPayload>): void {
    const handlers = this.#handlers.get(event.type) ?? [];

    for (const handler of handlers) {
      (handler as EventHandler<TPayload>)(event);
    }
  }

  subscribe<TPayload>(
    definition: EventDefinition<TPayload>,
    handler: EventHandler<TPayload>,
  ): Unsubscribe {
    return this.#addHandler(definition.type, handler as EventHandler<unknown>);
  }

  subscribeToType(type: EventType, handler: EventHandler<unknown>): Unsubscribe {
    return this.#addHandler(type, handler);
  }

  clear(): void {
    this.#handlers.clear();
  }

  handlerCount(type: EventType): number {
    return this.#handlers.get(type)?.length ?? 0;
  }

  #addHandler(type: EventType, handler: EventHandler<unknown>): Unsubscribe {
    const current = this.#handlers.get(type) ?? [];
    const next = [...current, handler];
    this.#handlers.set(type, next);

    return () => {
      const entries = this.#handlers.get(type) ?? [];
      this.#handlers.set(
        type,
        entries.filter((entry) => entry !== handler),
      );
    };
  }
}

export function createInMemoryEventBus(): InMemoryEventBus {
  return new InMemoryEventBus();
}
