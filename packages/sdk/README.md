# @atlas/sdk

Public facade for the Atlas Kernel — SDK-202 extended with ATLAS 4.x product integration (INT-001–009).

Depends on `@atlas/core`, `@atlas/compiler`, `@atlas/events`, `@atlas/knowledge`, `@atlas/runtime`, `@atlas/memory`, `@atlas/retrieval`, `@atlas/llm`, and other capability packages. Product logic for INT-001–009 lives here and in `@atlas/cli` / `@atlas/web` — not in the Frozen Kernel packages.

## Specifications

- `../../spec/sdk/ATLAS-200-SDK_OVERVIEW.md`
- `../../spec/sdk/ATLAS-202-SDK_TYPESCRIPT.md`

## Facade modules (current)

| Module | Responsibility |
|--------|----------------|
| `atlas.compiler` | Compilation orchestration |
| `atlas.runtime` | Artifact execution |
| `atlas.events` | Typed event subscription |
| `atlas.memory` | Memory facade — store, list, search (INT-002) |
| `atlas.retrieval` | Canonical retrieval search (INT-001) |
| `atlas.org` | Organizational entities, policies, decisions (INT-005) |
| `atlas.llm` | LLM ask + tool loop |
| `atlas.governance` | Governance gate + internal actions (INT-006) |
| `atlas.planning` | Planning engine facade |
| `atlas.workflow` | Workflow compiler facade |

## ATLAS 4.x integration exports

| Area | Key exports |
|------|-------------|
| INT-004 Context | `AtlasContextBuilder`, `build` |
| INT-003 Ingest | `storeIngestedDocumentKnowledgeObject`, `prepareIngestedDocumentKnowledge` |
| INT-009 Feedback | `recordFeedbackCorrection`, `readCurrentWarrantyDays` |
| INT-005 Tools | `createAtlasToolExecutors`, `listAtlasOrgToolNames` |
| INT-006 Governance | via `atlas.governance.execute` |

## Usage

```typescript
import { Atlas, createAtlas, AtlasContextBuilder } from '@atlas/sdk';

const atlas = createAtlas({
  workspace: { name: 'geeks' },
  memory: { storageFilePath: '.atlas/workspaces/geeks/memory.json' },
  llm: { apiKey: process.env.ATLAS_LLM_API_KEY, model: 'claude-test' },
});

const context = await AtlasContextBuilder.build({
  goal: '¿Cuál es la garantía?',
  atlas,
  workspace: 'geeks',
});

const search = await atlas.retrieval.searchContent({ query: 'garantía' });
const listed = await atlas.memory.listRecords({ recordType: 'document' });
```

## Kernel boundary

Applications and interfaces (`@atlas/cli`, `@atlas/web`) must consume the platform through `@atlas/sdk` only — never import `@atlas/core`, `@atlas/compiler`, or `@atlas/retrieval` directly.

Frozen Kernel packages are not modified for product integration; see [`VERSION.md`](../../VERSION.md) and INT-010-C audit.

## Tests

158 tests (`pnpm test` in this package). INT suites: `retrieval-unification`, `memory-list-records`, `atlas-context-builder`, `governance-gate`, `action-result-memory-closure`, `feedback-memory-retrieval-closure`, `knowledge-ingest-integration`, `llm-org-integration`.
