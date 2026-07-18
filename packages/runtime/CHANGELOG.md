# @atlas/runtime

## 0.1.0

Sprint 5 — in-memory artifact execution engine.

### Added

- `ExecutionContext` and lifecycle management (DOM-009 §10–11, §17)
- `RuntimeLifecycle` states
- `AtlasRuntime` with deterministic in-memory execution
- `ArtifactExecutor` registry with default `summary` executor
- `RuntimeStartedEvent` (`runtime.started` v1.0.0)
- `RuntimeCompletedEvent` (`runtime.completed` v1.0.0)
- Unit tests with coverage thresholds

### Notes

- Executes only compiler-produced artifacts
- Memory-only — no filesystem, network, databases, or LLMs
- Depends on `@atlas/core`, `@atlas/compiler`, `@atlas/events`

## 0.0.0

- Bootstrap stub created during Phase 0 monorepo setup.
