import type { CorrelationId, DomainEvent, EventType } from './event.js';

export interface CreateEventOptions {
  readonly source: DomainEvent['source'];
  readonly correlation_id?: CorrelationId;
  readonly metadata?: Record<string, unknown>;
  readonly id?: string;
}

/**
 * Strongly typed event definition.
 * @see SDK-204 §7, §9, §10
 */
export interface EventDefinition<TPayload> {
  readonly type: EventType;
  readonly version: string;
  create(payload: TPayload, options: CreateEventOptions): DomainEvent<TPayload>;
}

export type EventHandler<TPayload> = (event: DomainEvent<TPayload>) => void;

export type Unsubscribe = () => void;

export interface EventBus {
  publish<TPayload>(event: DomainEvent<TPayload>): void;
  subscribe<TPayload>(
    definition: EventDefinition<TPayload>,
    handler: EventHandler<TPayload>,
  ): Unsubscribe;
  subscribeToType(type: EventType, handler: EventHandler<unknown>): Unsubscribe;
  clear(): void;
}
