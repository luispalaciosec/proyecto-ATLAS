# @atlas/runtime

In-memory execution engine for compiled Atlas artifacts.

Depends on `@atlas/core`, `@atlas/compiler`, and `@atlas/events`.

## Specifications

- `Domain/ATLAS-DOM-009-RUNTIME_DOMAIN.md`
- `SDK/ATLAS-204-SDK_EVENTS.md` (runtime events)
- `SDK/ATLAS-202-SDK_TYPESCRIPT.md` (Runtime module)

## Scope (Sprint 5)

| Supported | Not in Sprint 5 |
|-----------|-----------------|
| `ExecutionContext` | CLI |
| `RuntimeLifecycle` | Memory, Retrieval |
| Artifact execution (in-memory) | Workflow, Agent |
| `RuntimeStartedEvent` / `RuntimeCompletedEvent` | Publisher, Plugins |
| `ArtifactExecutor` registry | Filesystem, network, DB, LLMs |

## Public API

| Export | Responsibility |
|--------|----------------|
| `AtlasRuntime` / `createAtlasRuntime()` | Execution engine |
| `ExecutionContext` | Session + workspace + artifacts + outputs |
| `RuntimeLifecycle` | Official lifecycle states (DOM-009 §17) |
| `ArtifactExecutor` | Kind-based artifact execution contract |
| `RuntimeStartedEvent` | `runtime.started` v1.0.0 |
| `RuntimeCompletedEvent` | `runtime.completed` v1.0.0 |
| `summaryArtifactExecutor` | Default executor for `summary` artifacts |

## Lifecycle

```text
create → initialize → load → start → execute → monitor → stop → dispose
                                                      ↘ failed
```

## Usage

```typescript
import { createAtlasRuntime, RuntimeStartedEvent } from '@atlas/runtime';
import { createInMemoryEventBus } from '@atlas/events';

const bus = createInMemoryEventBus();
bus.subscribe(RuntimeStartedEvent, (event) => {
  console.log(event.payload.session_id);
});

const runtime = createAtlasRuntime({ eventBus: bus });
const result = await runtime.execute({ artifacts: compiledArtifacts });
```

## Dependencies

| Package | Relationship |
|---------|--------------|
| `@atlas/core` | Identifier, Metadata, timestamps |
| `@atlas/compiler` | `Artifact` contract |
| `@atlas/events` | Event bus and publisher |
