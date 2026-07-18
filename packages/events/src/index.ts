// Event model — SDK-204 §7
export type {
  CorrelationId,
  DomainEvent,
  EventSource,
  EventType,
  IsoTimestamp,
} from './contracts/event.js';
export {
  createCorrelationId,
  createEventSource,
  createEventType,
  createIsoTimestamp,
  isDomainEvent,
} from './contracts/event.js';

// Definitions, handlers, bus contract
export type {
  CreateEventOptions,
  EventBus,
  EventDefinition,
  EventHandler,
  Unsubscribe,
} from './contracts/event-definition.js';

// Factories
export { createDomainEvent, resetDomainEventCounter } from './event/create-event.js';
export { defineEvent } from './event/define-event.js';

// In-memory bus — SDK-204 §14
export { createInMemoryEventBus, InMemoryEventBus } from './bus/in-memory-event-bus.js';

// Publisher — SDK-204 §15
export {
  createEventPublisher,
  EventPublisher,
  type EventPublisherOptions,
} from './publisher/event-publisher.js';

// Compiler domain events — SDK-204 §8
export {
  COMPILER_COMPLETED_EVENT_TYPE,
  CompilerCompletedEvent,
  type CompilerCompletedPayload,
} from './definitions/compiler-completed.js';
