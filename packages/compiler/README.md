# @atlas/compiler

Atlas Compiler — contracts, pipeline orchestration, and deterministic compilation.

Depends exclusively on `@atlas/core` for shared primitives.

## Specifications

- `Architecture/ATLAS-ARCH-003 — COMPILER_ARCHITECTURE.md`
- `Architecture/ATLAS-ARCH-006 — BUILD_COMPILATION_PIPELINE.md`

## Public API

### Contracts (ARCH-003 §12)

| Export | Responsibility |
|--------|----------------|
| `Compiler` | Main compile entry point |
| `CompilerPipeline` | Ordered stage execution |
| `CompilerStage` | Single pipeline transformation |
| `CompilationContext` | Immutable compilation state |
| `CompilationUnit` | Source compilation input |
| `KnowledgeNode` | HIR representation |
| `KnowledgeGraph` | MIR representation |
| `Diagnostic` | Compiler diagnostic model |
| `Artifact` | Generated artifact |
| `Generator` | Artifact generator contract |
| `Publisher` | Artifact publisher contract |

### Pipeline

| Export | Responsibility |
|--------|----------------|
| `createDefaultCompilerStages()` | Official 8-stage pipeline |
| `createDefaultCompilerPipeline()` | Deterministic stage runner |
| `createAtlasCompiler()` | Compiler implementation |
| `defineCompilerStage()` | Custom stage factory |

### Registries

| Export | Responsibility |
|--------|----------------|
| `GeneratorRegistry` | Generator discovery/resolution |
| `PublisherRegistry` | Publisher discovery/resolution |

## Usage

```typescript
import {
  createAtlasCompiler,
  createCompilationContext,
  createCompilationUnit,
  createDefaultCompilerPipeline,
  createDefaultCompilerStages,
} from '@atlas/compiler';

const unit = createCompilationUnit({
  id: 'doc.readme',
  origin: 'memory://doc.readme',
  checksum: 'sha256:abc',
  version: '1.0.0',
  source: { text: '# Atlas' },
});

const compiler = createAtlasCompiler(
  createDefaultCompilerPipeline({ stages: createDefaultCompilerStages() }),
);

const result = await compiler.compile(createCompilationContext({ units: [unit] }));
```

## Dependencies

| Package | Relationship |
|---------|--------------|
| `@atlas/core` | Required — Value Objects, errors, traceability |

Runtime infrastructure (filesystem, network, parsers) is intentionally excluded from Sprint 2.

## Future improvements (registered, non-blocking)

- **C3:** Add an explicit `kind` field to `CompilationUnit` instead of relying on `metadata.kind`.
- **C8:** Introduce an explicit `SourceDocument` contract for unit payloads.
- **Metadata.equals()** (in `@atlas/core`): replace JSON.stringify comparison with deterministic deep equality.
