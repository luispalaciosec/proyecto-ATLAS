import { Identifier, Metadata, Version } from '@atlas/core';

import type { CreateEventOptions } from '../contracts/event-definition.js';
import type { DomainEvent, EventType } from '../contracts/event.js';
import { createCorrelationId, createEventSource, createIsoTimestamp } from '../contracts/event.js';

let eventCounter = 0;

export interface CreateDomainEventParams<TPayload> extends CreateEventOptions {
  readonly type: EventType;
  readonly version: string;
  readonly payload: TPayload;
}

export function createDomainEvent<TPayload>(
  params: CreateDomainEventParams<TPayload>,
): DomainEvent<TPayload> {
  eventCounter += 1;

  return Object.freeze({
    id: Identifier.create(params.id ?? `event.${eventCounter}`),
    type: params.type,
    timestamp: createIsoTimestamp(),
    source: createEventSource(String(params.source)),
    version: Version.create(params.version),
    correlation_id: createCorrelationId(params.correlation_id),
    payload: params.payload,
    metadata: Metadata.create(params.metadata ?? {}),
  });
}

export function resetDomainEventCounter(): void {
  eventCounter = 0;
}
