# @atlas/events

In-memory domain event system for Atlas Kernel decoupling.

Depends exclusively on `@atlas/core`.

## Specifications

- `../../spec/sdk/ATLAS-204-SDK_EVENTS.md`
- `../../spec/engine/ATLAS-100-ENGINE.md` (event traceability principles)

## Scope (Sprint 3)

| Supported | Not in Sprint 3 |
|-----------|-----------------|
| Event definition | Redis / Kafka / RabbitMQ |
| Typed publish/subscribe | WebSockets |
| Synchronous in-memory dispatch | Persistence / EventStore |
| `InMemoryEventBus` | Distributed transport |

## Public API

| Export | Responsibility |
|--------|----------------|
| `DomainEvent` | Event envelope (SDK-204 §7) |
| `defineEvent()` | Strongly typed event factory |
| `createDomainEvent()` | Low-level event creation |
| `InMemoryEventBus` | Sync pub/sub bus (SDK-204 §14) |
| `EventPublisher` | Producer helper (SDK-204 §15) |
| `CompilerCompletedEvent` | Official compiler.completed event |

## Usage

```typescript
import {
  CompilerCompletedEvent,
  createEventPublisher,
  createInMemoryEventBus,
} from '@atlas/events';

const bus = createInMemoryEventBus();

bus.subscribe(CompilerCompletedEvent, (event) => {
  console.log(event.payload.success);
});

createEventPublisher(bus, '@atlas/demo').publish(CompilerCompletedEvent, {
  success: true,
  lifecycle: 'complete',
  artifact_count: 1,
  unit_count: 1,
  graph_id: 'mir.workspace',
});
```

## Event envelope fields

| Field | Source |
|-------|--------|
| `id` | `Identifier` (@atlas/core) |
| `type` | SDK-204 §9 (`Resource.Action`) |
| `timestamp` | ISO 8601 |
| `source` | Emitting module (`@atlas/<package>`) |
| `version` | Event schema semver |
| `correlation_id` | Trace correlation |
| `payload` | Typed domain payload |
| `metadata` | `Metadata` (@atlas/core) |

## Dependencies

| Package | Relationship |
|---------|--------------|
| `@atlas/core` | Required |

## Future improvements (registered, non-blocking)

- **E1 (v0.2):** Official event naming convention `atlas.<bounded-context>.<event>`. Examples: `atlas.compiler.completed`, `atlas.runtime.started`, `atlas.workflow.failed`. Sprint 3 types (`compiler.completed`) remain unchanged until v0.2.
