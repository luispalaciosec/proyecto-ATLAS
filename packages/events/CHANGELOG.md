# @atlas/events

## 0.1.0

Sprint 3 — in-memory domain event bus.

### Added

- `DomainEvent` envelope aligned with SDK-204 §7
- `defineEvent()` for strongly typed event definitions
- `InMemoryEventBus` with synchronous publish/subscribe
- `EventPublisher` producer helper
- `CompilerCompletedEvent` (`compiler.completed` v1.0.0)
- Unit tests with coverage thresholds

### Notes

- Memory-only delivery (no queues, brokers, persistence)
- Depends only on `@atlas/core`

## 0.0.0

- Bootstrap stub created during Phase 0 monorepo setup.
