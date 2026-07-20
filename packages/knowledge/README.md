# @atlas/knowledge

Knowledge Capability for Atlas — Sprint 8 delivers the **Knowledge Metamodel** and **domain core**. Sprint 9 adds the **projection layer** toward the Compiler.

## Sprint 8 scope

| Step | Deliverable |
|------|-------------|
| 8.1 | Knowledge Metamodel (`src/metamodel/`) — AG-001 reflective descriptors |
| 8.2 | Value Objects |
| 8.3 | `KnowledgeStatement` entity |
| 8.4 | `KnowledgeRelationship` entity |
| 8.5 | `KnowledgeObject` aggregate |
| 8.6 | Factories |
| 8.7 | Validators |

## Sprint 9 scope

| Deliverable | Location |
|-------------|----------|
| `KnowledgeProjectionAdapter` | `src/adapters/` |
| Public export | `@atlas/knowledge/compiler-adapter` |

### Projection Rule (AR-009-03)

```text
KnowledgeObject
      ↓
KnowledgeProjectionAdapter
      ↓
CompilationUnit (disposable)
      ↓
Compiler
```

Projection is strictly one-way. The Compiler never modifies or reconstructs KnowledgeObjects.

## Architectural guidelines

- **AG-001:** Metamodel designed as declarative reflective semantic model (no runtime reflection in Sprint 8)
- **AMD-002:** No repository interfaces — v1 domain is persistence-agnostic; `@atlas/memory` owns future repository ports
- **AR-009-01:** Adapter translates domain representations only — no compilation, no business logic

## Usage

```typescript
import {
  createKnowledgeObject,
  createKnowledgeStatement,
  ObjectKind,
  ObjectMetadata,
  ContextScope,
  StatementContent,
} from '@atlas/knowledge';
import { Identifier } from '@atlas/core';

const owner = Identifier.create('owner.example');
const context = ContextScope.create({ organizational: 'example' });

const object = createKnowledgeObject({
  id: 'concept.example',
  kind: ObjectKind.create('Concept'),
  metadata: ObjectMetadata.create({ name: 'Example Concept' }),
  owner,
  contexts: [context],
});
```

Compiler projection (direct adapter — typically used via `@atlas/sdk`):

```typescript
import { KnowledgeProjectionAdapter } from '@atlas/knowledge/compiler-adapter';

const adapter = new KnowledgeProjectionAdapter();
const { units } = adapter.projectAll([operationalKnowledgeObject]);
```

SDK integration (recommended):

```typescript
await atlas.compiler.compile({ knowledge: [operationalKnowledgeObject] });
```

Metamodel-only import:

```typescript
import { getMetaConceptDescriptor, MetaConceptId } from '@atlas/knowledge/metamodel';
```

## References

- [`releases/KNOWLEDGE_IMPLEMENTATION_PLAN.md`](../../releases/KNOWLEDGE_IMPLEMENTATION_PLAN.md)
- [`releases/SPRINT9_IMPLEMENTATION_REPORT.md`](../../releases/SPRINT9_IMPLEMENTATION_REPORT.md)
- [`spec/capabilities/knowledge/KNOWLEDGE-002-METAMODEL.md`](../../spec/capabilities/knowledge/KNOWLEDGE-002-METAMODEL.md)
