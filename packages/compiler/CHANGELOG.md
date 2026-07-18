# @atlas/compiler

## 0.1.1

Sprint 3 integration — optional domain event publishing.

### Added

- Optional `eventBus` in `AtlasCompilerOptions`
- Publishes `CompilerCompletedEvent` via `@atlas/events` when configured

### Notes

- Depends on `@atlas/events`
- No behavior change when `eventBus` is omitted

## 0.1.0

Sprint 2 — initial compiler contracts and deterministic pipeline orchestration.

### Added

- Compiler contracts: `Compiler`, `CompilerPipeline`, `CompilerStage`, `CompilationContext`, `CompilationUnit`, `KnowledgeNode`, `KnowledgeGraph`, `Diagnostic`, `Artifact`, `Generator`, `Publisher`
- Official 8-stage default pipeline (Discovery → Publishing)
- `AtlasCompiler` with deterministic, immutable context transitions
- `GeneratorRegistry` and `PublisherRegistry`
- Context factories for units, diagnostics, knowledge graph, and artifacts
- Unit tests with coverage thresholds

### Notes

- Depends only on `@atlas/core`
- No filesystem, network, parser, or publisher infrastructure implementations
- Compilation units are provided programmatically (no Discovery I/O)

## 0.0.0

- Bootstrap stub created during Phase 0 monorepo setup.
