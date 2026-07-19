# @atlas/knowledge

Knowledge Capability for Atlas — Sprint 8 delivers the **Knowledge Metamodel** and **domain core**.

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

## Architectural guidelines

- **AG-001:** Metamodel designed as declarative reflective semantic model (no runtime reflection in Sprint 8)
- **AMD-002:** No repository interfaces — v1 domain is persistence-agnostic; `@atlas/memory` owns future repository ports

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

Metamodel-only import:

```typescript
import { getMetaConceptDescriptor, MetaConceptId } from '@atlas/knowledge/metamodel';
```

## References

- `Release/KNOWLEDGE_IMPLEMENTATION_PLAN.md`
- `Capabilities/Knowledge/KNOWLEDGE-002-METAMODEL.md`
