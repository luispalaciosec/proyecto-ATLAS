import type { CreateEventOptions, EventDefinition } from '../contracts/event-definition.js';
import type { DomainEvent, EventType } from '../contracts/event.js';
import { createDomainEvent } from './create-event.js';

export function defineEvent<TPayload>(config: {
  readonly type: EventType;
  readonly version: string;
}): EventDefinition<TPayload> {
  return Object.freeze({
    type: config.type,
    version: config.version,
    create(payload: TPayload, options: CreateEventOptions): DomainEvent<TPayload> {
      return createDomainEvent({
        type: config.type,
        version: config.version,
        payload,
        ...options,
      });
    },
  });
}
