# @atlas/sdk

Public facade for the Atlas Kernel — SDK-202.

Depends on `@atlas/core`, `@atlas/compiler`, `@atlas/events`, `@atlas/knowledge`, and `@atlas/runtime`. Contains **no business logic**; it orchestrates and composes Kernel packages only.

## Specifications

- `SDK/ATLAS-200-SDK_OVERVIEW.md`
- `SDK/ATLAS-202-SDK_TYPESCRIPT.md`

## Scope (Sprint 9)

| Supported | Not in Sprint 9 |
|-----------|-----------------|
| `Atlas` facade entry point | CLI knowledge store |
| `atlas.compiler.compile()` | Memory, Retrieval |
| `atlas.compiler.compile({ knowledge })` | Workflow, Agent |
| `atlas.runtime.execute()` | Publisher, Plugins |
| `atlas.events.subscribe()` | Domain engines beyond projection |
| Re-exports of Kernel types/events | |

## Public API

| Export | Responsibility |
|--------|----------------|
| `Atlas` / `createAtlas()` | Main SDK facade (SDK-202 §7) |
| `atlas.compiler` | Compilation orchestration (SDK-202 §15) |
| `atlas.runtime` | Artifact execution (SDK-202 §16) |
| `atlas.events` | Typed event subscription |
| `CompilerCompletedEvent` | Official compiler completion event |
| `RuntimeStartedEvent` / `RuntimeCompletedEvent` | Official runtime lifecycle events |
| `createArtifact()` | Passthrough factory for custom generators |

## Usage

```typescript
import {
  Atlas,
  CompilerCompletedEvent,
  RuntimeCompletedEvent,
  RuntimeStartedEvent,
  createArtifact,
} from '@atlas/sdk';

const atlas = new Atlas({
  workspace: { name: 'my-workspace' },
  compiler: {
    generators: () => [
      {
        id: 'summary-generator',
        supported_formats: ['summary'],
        generate: (graph) => [
          createArtifact({
            id: 'artifact.summary',
            kind: 'summary',
            content: { nodes: graph.nodes.length },
            source_graph_id: graph.id,
          }),
        ],
      },
    ],
  },
});

atlas.events.subscribe(RuntimeStartedEvent, (event) => {
  console.log(event.payload.session_id);
});

atlas.events.subscribe(RuntimeCompletedEvent, (event) => {
  console.log(event.payload.success);
});

const compileResult = await atlas.compiler.compile({
  knowledge: operationalKnowledgeObjects,
});

// Path A (legacy workspace units) remains supported:
// await atlas.compiler.compile({ units: [...] });

const executionResult = await atlas.runtime.execute({
  artifacts: compileResult.context.artifacts,
});
```

Applications SHOULD import Kernel packages exclusively through `@atlas/sdk`.

## Dependencies

| Package | Relationship |
|---------|--------------|
| `@atlas/core` | Value Objects, errors, contracts |
| `@atlas/compiler` | Compilation pipeline |
| `@atlas/knowledge` | Transparent KnowledgeObject projection (Sprint 9) |
| `@atlas/events` | In-memory domain events |
| `@atlas/runtime` | In-memory artifact execution |
