# @atlas/core

Foundation package for the Atlas monorepo.

Absorbs the shared primitives, error model, and Engine I/O contracts defined by the official specifications. Every other `@atlas/*` package depends on this package; `@atlas/core` depends on nothing inside Atlas.

## Specifications

- `../../spec/architecture/ATLAS-ARCH-002-PACKAGE_ARCHITECTURE.md`
- `../../spec/engine/ATLAS-100-ENGINE.md`
- `../../spec/domain/ATLAS-DOM-000-DOMAIN_REVIEW.md`

## Public API

### Value Objects

| Export | Source |
|--------|--------|
| `Identifier` | DOM-000 §11 |
| `Version` | DOM-000 §11, Glossary §Version |
| `Metadata` | DOM-000 §11 |
| `Namespace` | DOM-000 §11, DOM-002 §16 |

### Errors

| Export | Source |
|--------|--------|
| `AtlasError` | ATLAS-100 §12 |
| `ErrorSeverity` | ATLAS-100 §12, SDK-205 §11 |
| `createAtlasError()` | ATLAS-100 §12 |
| `isAtlasError()` | Runtime interoperability |

### Engine Contracts

| Export | Source |
|--------|--------|
| `EngineInput` | ATLAS-100 §12 |
| `EngineOutput` | ATLAS-100 §12 |
| `EngineContext` | ATLAS-100 §12 |
| `EngineRequest` | ATLAS-100 §12 |
| `EngineConfiguration` | ATLAS-100 §12 |
| `EngineMetadata` | ATLAS-100 §12 |
| `ExecutionStatus` | ATLAS-100 §10 |
| `EngineEvent` | ATLAS-100 §13 |
| `EngineMetrics` | ATLAS-100 §12 |
| `EngineModuleContract` | ATLAS-100 §8 |

### Primitives

| Export | Source |
|--------|--------|
| `Result` | Derived from Output Contract |
| `TraceId` | ATLAS-100, SDK-205 |
| `AtlasTimestamp` | ATLAS-100, SDK-205 |

## Usage

```typescript
import {
  Identifier,
  Version,
  Metadata,
  Namespace,
  createAtlasError,
  EngineInput,
  EngineOutput,
  Result,
  TraceId,
} from '@atlas/core';
```

## Dependencies

Runtime dependencies: **none**.

## Layout

```text
src/
├── index.ts          # sole public entry point
├── types/            # Value Objects
├── errors/           # Error contract
├── contracts/        # Engine I/O contracts
└── internal/         # private helpers (not exported)
```
