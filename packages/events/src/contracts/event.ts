import { Identifier, Metadata, Version } from '@atlas/core';

/**
 * Domain event envelope.
 * @see SDK-204 §7 Event Structure
 */
export interface DomainEvent<TPayload = unknown> {
  readonly id: Identifier;
  readonly type: EventType;
  readonly timestamp: IsoTimestamp;
  readonly source: EventSource;
  readonly version: Version;
  readonly correlation_id: CorrelationId;
  readonly payload: TPayload;
  readonly metadata: Metadata;
}

export type EventType = string & { readonly __eventTypeBrand: unique symbol };
export type EventSource = string & { readonly __eventSourceBrand: unique symbol };
export type CorrelationId = string & { readonly __correlationIdBrand: unique symbol };
export type IsoTimestamp = string & { readonly __isoTimestampBrand: unique symbol };

export function createEventType(value: string): EventType {
  const pattern = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/;

  if (!pattern.test(value)) {
    throw new Error(`Invalid event type "${value}". Expected pattern Resource.Action`);
  }

  return value as EventType;
}

export function createEventSource(value: string): EventSource {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error('Event source must be a non-empty string');
  }

  return value.trim() as EventSource;
}

export function createCorrelationId(value?: string): CorrelationId {
  const candidate = value ?? crypto.randomUUID();
  return candidate as CorrelationId;
}

export function createIsoTimestamp(value?: string | Date): IsoTimestamp {
  const candidate =
    value instanceof Date ? value.toISOString() : (value ?? new Date().toISOString());

  if (Number.isNaN(Date.parse(candidate))) {
    throw new Error('Invalid ISO timestamp');
  }

  return candidate as IsoTimestamp;
}

export function isDomainEvent(value: unknown): value is DomainEvent {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.type === 'string' &&
    typeof candidate.timestamp === 'string' &&
    typeof candidate.source === 'string' &&
    typeof candidate.correlation_id === 'string' &&
    'payload' in candidate
  );
}
