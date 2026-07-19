# @atlas/sdk

## 0.3.0

Sprint 9 — transparent Knowledge → Compiler integration.

### Added

- `CompileOptions.knowledge` — pass `KnowledgeObject[]` to `atlas.compiler.compile()`
- Internal projection via `@atlas/knowledge/compiler-adapter` (not exposed in public API philosophy)
- Integration tests for knowledge-backed compilation

### Notes

- Depends on `@atlas/knowledge`
- No new public method such as `compileFromKnowledge()` (AR-009-02)
- `@atlas/compiler` and `@atlas/core` remain unchanged

## 0.2.0

Sprint 5 integration — runtime module.

### Added

- `RuntimeModule` with `execute()` orchestration
- `atlas.runtime` on the `Atlas` facade
- Re-exports: `RuntimeStartedEvent`, `RuntimeCompletedEvent`, execution types

### Notes

- Depends on `@atlas/runtime`
- No behavior change to compiler or events modules

## 0.1.0

Sprint 4 — public Kernel facade.

### Added

- `Atlas` / `createAtlas()` entry point (SDK-202 §7)
- `CompilerModule` with `compile()` orchestration
- `EventsModule` with typed `subscribe()`
- Passthrough re-exports: `CompilerCompletedEvent`, `createArtifact`, core types
- Unit tests with coverage thresholds
- Example: `examples/sdk-demo`

### Notes

- No business logic — composition only
- Depends on `@atlas/core`, `@atlas/compiler`, `@atlas/events`
- Runtime, CLI, Memory, Retrieval, Workflow, and Agent are out of scope

## 0.0.0

- Bootstrap stub created during Phase 0 monorepo setup.
