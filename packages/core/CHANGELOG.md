# @atlas/core

## 0.1.1

Sprint 1 post-review adjustments (owner approved).

### Changed

- `ErrorSeverity` is now a closed union (`info` | `warning` | `error` | `critical`)
- `ExecutionStatus` adds `cancelled`

### Notes

- Added technical TODO on `Metadata.equals()` for future deep-equality improvement

## 0.1.0

Sprint 1 — initial implementation of foundation primitives and Engine contracts.

### Added

- Value Objects: `Identifier`, `Version`, `Metadata`, `Namespace` (DOM-000 §11)
- Error model: `AtlasError`, `ErrorSeverity`, `createAtlasError()`, `isAtlasError()` (ATLAS-100 §12)
- Engine contracts: `EngineInput`, `EngineOutput`, `EngineContext`, `EngineRequest`, `EngineConfiguration`, `EngineMetadata`, `ExecutionStatus`, `EngineEvent`, `EngineMetrics`, `EngineModuleContract` (ATLAS-100 §8, §12, §13)
- Primitives: `Result`, `TraceId`, `AtlasTimestamp`
- Unit tests for types, errors, contracts, and primitives

### Notes

- Absorbs ARCH-002 Foundation Packages (`shared`, `types`, `errors`)
- Zero runtime dependencies
- Zero dependencies on other `@atlas/*` packages

## 0.0.0

- Bootstrap stub created during Phase 0 monorepo setup.
