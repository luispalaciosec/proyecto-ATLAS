# Sprint 11A.1 — Implementation Plan

**Capability:** `@atlas/memory`  
**Scope:** `packages/memory/src/domain/` ONLY  
**Baseline:** `76a85bc` · tag `architecture-complete-v1`  
**Status:** **BLOCKED — specification inconsistencies detected**  
**Date:** 2026-07-23

---

## ⚠️ BLOCKING CONDITION

Before any code is written, the Owner must resolve the specification inconsistencies documented in **Section 3**. Per sprint rules: do not choose between conflicting specs. Implementation remains **stopped** until resolution.

---

## 1. Sprint Objective

Implement the **Memory Domain Layer** exclusively inside `packages/memory/src/domain/`, including entities, value objects, domain types, domain errors, domain events (only if explicitly defined), domain specifications, invariants, validation rules, and business rules — with domain unit tests.

**Out of scope for Sprint 11A.1:** Application layer, use cases, services, repositories, persistence, infrastructure, providers, API, CLI, SDK, mocks, and every layer outside the domain.

---

## 2. Specifications Reviewed

| ID | Document | Status | Relevance to Domain |
|----|----------|--------|---------------------|
| — | `ATLAS_ARCHITECTURE_MASTER.md` | Read | Phase 5 Memory, Sprint 11A scope, frozen boundaries |
| — | `VERSION.md` | Read | `@atlas/memory@0.0.0` stub, Implementation phase |
| ATLAS-DOM-004 | `spec/domain/ATLAS-DOM-004-MEMORY_DOMAIN.md` | Read | Domain entities, VOs, events, specifications, §31 mapping |
| ATLAS-MEMORY-001 | `spec/memory/ATLAS-MEMORY-001-VISION.md` | Read | Principles: immutability, determinism, auditability |
| ATLAS-MEMORY-002 | `spec/memory/ATLAS-MEMORY-002-ARCHITECTURE.md` | Read | Layer boundaries; observability event names |
| ATLAS-MEMORY-003 | `spec/memory/ATLAS-MEMORY-003-MEMORY_ENGINE.md` | Read | Out of scope (engine/orchestration) |
| ATLAS-MEMORY-004 | `spec/memory/ATLAS-MEMORY-004-STORAGE_MODEL.md` | Read | Canonical storage hierarchy: Namespace → Collection → Record → Version |
| ATLAS-MEMORY-005 | `spec/memory/ATLAS-MEMORY-005-RETRIEVAL.md` | Read | Retrieval request concepts (domain types only, no engine) |
| ATLAS-MEMORY-006 | `spec/memory/ATLAS-MEMORY-006-INDEXING.md` | Read | Index lifecycle (derived data principles) |
| ATLAS-MEMORY-007 | `spec/memory/ATLAS-MEMORY-007-CONSISTENCY.md` | Read | Record/version/relationship consistency rules |
| ATLAS-MEMORY-008 | `spec/memory/ATLAS-MEMORY-008-PUBLIC_API.md` | Read | MemoryRecord, MemorySnapshot, public errors, public events |
| ATLAS-INTELLIGENCE-002 | `spec/intelligence/ATLAS-INTELLIGENCE-002-MEMORY.md` | Read | Memory vs Knowledge conceptual model, memory types |
| ATLAS-MEMORY-CONTRACT-005 | `spec/memory/contracts/…-005-MEMORY_SESSION.md` | Read | Session lifecycle (application boundary — not Sprint 11A.1) |
| ATLAS-MEMORY-CONTRACT-006 | `spec/memory/contracts/…-006-CONSISTENCY_PROVIDER.md` | Read | References `MemoryEntry` (undefined structurally) |
| ATLAS-MEMORY-CONTRACT-007 | `spec/memory/contracts/…-007-MEMORY_STORE.md` | Read | MemoryStore as readonly metadata container |

**Foundation / architecture (read):** `spec/foundation/ATLAS-000-README.md`, `ATLAS-012`, `spec/architecture/ATLAS-ARCH-002-PACKAGE_ARCHITECTURE.md`

---

## 3. Domain Components to Implement

### 3.1 Blocking specification inconsistencies (MUST RESOLVE FIRST)

| # | Area | Spec A | Spec B | Conflict |
|---|------|--------|--------|----------|
| I-01 | **Core entity model** | `ATLAS-DOM-004` §8, §31: `Memory`, `MemoryEntry`, `MemorySnapshot`, `MemoryCategory` | `ATLAS-MEMORY-004`: `Namespace`, `Collection`, `Record`, `Version`, `Relationship` as **canonical representation** | Two incompatible domain models for the same layer. DOM-004 maps files under `entities/Memory.ts`; MEMORY-004 declares Record/Version hierarchy canonical. |
| I-02 | **Public record unit** | `ATLAS-DOM-004`: `MemoryEntry` | `ATLAS-MEMORY-008` §12: `MemoryRecord` (id, type, content, embedding?, metadata, timestamp) | Different names and shapes for the minimal stored unit. |
| I-03 | **MemoryStore** | `ATLAS-MEMORY-CONTRACT-007`: readonly `MemoryStore` (identity, metadata, statistics — no mutations) | `ATLAS-MEMORY-008` §11: `MemoryStore` with `put()`, `get()`, `remove()`, `search()` | Same concept name, incompatible interfaces. |
| I-04 | **Domain events** | `ATLAS-DOM-004` §23: `MemoryCaptured`, `MemoryClassified`, `MemoryConsolidated`, `MemoryStored`, `MemoryRecalled`, `MemoryUpdated`, `MemoryArchived`, `MemoryForgotten` | `ATLAS-MEMORY-002`: `MemoryCreated`, `MemoryUpdated`, `MemoryRetrieved`, `MemoryIndexed`, `MemoryArchived` | Overlapping but non-equivalent event vocabularies. |
| I-05 | **Domain events (continued)** | `ATLAS-DOM-004` §23 (above) | `ATLAS-MEMORY-008` §17: `MemoryInitialized`, `MemoryStored`, `MemoryRetrieved`, `MemoryUpdated`, `MemoryDeleted`, `MemoryIndexed`, `MemorySnapshotCreated` | Third event vocabulary for the same domain. |
| I-06 | **MemoryEntry definition** | Referenced in `ATLAS-MEMORY-CONTRACT-006` (`validateEntry(entry: MemoryEntry)`) | No structural definition in any `spec/memory/` document | Contract references a type that is not formally defined in memory specs. |
| I-07 | **Implementation mapping path** | `ATLAS-DOM-004` §31: `packages/memory/entities/` (no `src/domain/`) | Sprint 11A.1 mandate: `packages/memory/src/domain/` | Path divergence (minor — resolved by sprint mandate + `@atlas/knowledge` convention). |

**Action required:** Owner must designate which specification set governs Sprint 11A.1 domain implementation before code begins.

---

### 3.2 Domain components (pending Owner resolution of I-01 through I-06)

Once inconsistencies are resolved, Sprint 11A.1 will implement **only** components explicitly required by the authoritative spec set.

#### Track A — if `ATLAS-DOM-004` governs (per §31 Implementation Mapping)

| Category | Components |
|----------|------------|
| Entities | `Memory`, `MemoryEntry`, `MemorySnapshot`, `MemoryCategory`, `RetentionPolicy` |
| Value Objects | `MemoryId`, `MemoryVersion`, `RecallScore`, `RetentionPeriod` |
| Specifications | `ValidMemorySpecification`, `RetentionSpecification`, `ConsolidationSpecification`, `RecallSpecification`, `ExpirationSpecification` |
| Events | Per §23 (8 events) |
| Errors | Derived from domain validation rules |

#### Track B — if `ATLAS-MEMORY-004` governs (canonical storage model)

| Category | Components |
|----------|------------|
| Entities / Aggregates | `Namespace`, `Collection`, `Record`, `Version`, `Relationship` |
| Value Objects | Identifiers (`namespace_id`, `collection_id`, `record_id`, `version_id`, `relationship_id`), `RecordStatus`, `Visibility`, `Revision`, `Checksum`, `RecordMetadata`, `VersionContent` |
| Specifications | Identity, Namespace, Collection, Version, Ownership, Immutability, Relationship constraints (§Constraints) |
| Events | Per MEMORY-002 / MEMORY-008 only if Owner selects that vocabulary |
| Errors | Integrity violation errors per §Integrity |

#### Track C — if `ATLAS-MEMORY-008` public types govern domain primitives

| Category | Components |
|----------|------------|
| Entities | `MemoryRecord`, `MemorySnapshot` |
| Value Objects | `MemoryMetadata`, `MemoryQuery` (types only), record identifiers |
| Errors | `InvalidMemoryRecordError`, `MemoryNotFoundError` (domain error types, not thrown by infrastructure) |
| Events | Per §17 (7 events) |

**These tracks are mutually incompatible without an Owner decision.**

---

## 4. Entities

### ATLAS-DOM-004 (Track A)

| Entity | Key attributes (spec) | Aggregate? |
|--------|----------------------|------------|
| `Memory` | MemoryId, Source, Scope, Context, Timestamp, Metadata, Status, Retention Policy | Root candidate |
| `MemoryEntry` | Part of Memory domain | — |
| `MemorySnapshot` | Frozen memory state | — |
| `MemoryCategory` | Working, Short-Term, Long-Term, Episodic, Semantic, Procedural, Organizational, Agent | — |
| `RetentionPolicy` | Permanent, Long-Term, Medium-Term, Session, Temporary | — |

### ATLAS-MEMORY-004 (Track B)

| Entity | Key attributes (spec) |
|--------|----------------------|
| `Namespace` | namespace_id, namespace_type, owner, metadata, created_at |
| `Collection` | collection_id, namespace_id, collection_type, metadata, created_at |
| `Record` | record_id, namespace_id, collection_id, record_type, status, metadata, current_version, created_at, updated_at |
| `Version` | version_id, record_id, revision, content, checksum, created_at, author, metadata |
| `Relationship` | relationship_id, source_record, target_record, relationship_type, metadata |

### ATLAS-MEMORY-008 (Track C)

| Entity | Key attributes (spec) |
|--------|----------------------|
| `MemoryRecord` | id, type, content, embedding?, metadata, timestamp |
| `MemorySnapshot` | id, created_at, records, checksum |

---

## 5. Value Objects

### ATLAS-DOM-004 (Track A)

- `MemoryId`
- `MemoryVersion`
- `RecallScore`
- `RetentionPeriod`

### ATLAS-MEMORY-004 (Track B)

- `NamespaceId`, `CollectionId`, `RecordId`, `VersionId`, `RelationshipId`
- `RecordStatus` — `active | archived | deleted | locked | pending`
- `Visibility` — `private | shared | public | restricted`
- `Revision` — monotonic integer
- `Checksum`
- `RecordMetadata`, `VersionMetadata` (extensible key-value with typed accessors)
- `RelationshipType` — `parent | child | reference | dependency | related | derived`
- `NamespaceType`, `CollectionType`, `RecordType`
- `OwnerReference`

### Cross-cutting (both INT-002 and DOM-004)

- Memory category / type enumerations: Episodic, Working, Semantic, Procedural, Organizational, Short-Term, Long-Term

---

## 6. Interfaces

**Sprint 11A.1 includes domain interfaces only** — not provider/application ports.

| Interface | Source | Sprint 11A.1? |
|-----------|--------|---------------|
| `ConsistencyProvider` | CONTRACT-006 | **NO** — provider contract (infrastructure boundary) |
| `MemoryStore` | CONTRACT-007 | **NO** — provider/metadata port |
| `MemoryStore` | MEMORY-008 §11 | **NO** — application/storage port |
| `MemoryEngine` | MEMORY-008 §5 | **NO** — application layer |
| `MemoryRepository` | MEMORY-008 §6 | **NO** — application layer |
| Domain specification interfaces | DOM-004 §25 | **YES** — if Track A selected |
| Domain validation result types | MEMORY-007, CONTRACT-006 | **YES** — as pure domain types (`ValidationResult`, `ValidationIssue`) if Owner confirms |

**No domain interface will be invented.** If the authoritative track does not define an interface, it will not be created.

---

## 7. Business Rules

Rules extracted from approved specs (implementation depends on model track selection):

### Identity and immutability (MEMORY-001, MEMORY-004, MEMORY-007)

- Every record owns one immutable identifier; identifiers never change.
- Version content is immutable; updates create new versions.
- Equal memory state produces deterministic validation outcomes.

### Hierarchy constraints (MEMORY-004)

- Records belong to exactly one namespace and one collection.
- Versions belong to exactly one record.
- Collections do not nest.
- Namespaces do not overlap.

### Version rules (MEMORY-004)

- Revision numbers increase monotonically.
- Skipped revisions discouraged.
- `current_version` pointer updated on record evolution; historical versions preserved.

### Ownership and visibility (MEMORY-004)

- Every record has exactly one owner.
- Visibility values restricted to defined enum.

### Relationship rules (MEMORY-004)

- Relationships connect existing records only.
- Relationships never duplicate content.

### Lifecycle (DOM-004 §17, MEMORY-004 §Record Lifecycle)

- Valid transitions: Created → Active → Updated → Archived → Deleted (deletion policy implementation-specific).
- Memory lifecycle stages: Capture → Classify → Validate → Consolidate → Store → Recall → Update → Archive → Forget.

### Retention (DOM-004 §20–21)

- Every Memory SHALL define a retention policy.
- Forgetting is controlled, not error.

### Knowledge boundary (INT-002, DOM-004 §4)

- Memory derives from valid knowledge; never stored without identity, context, traceability.
- Memory never replaces Knowledge.

### Consistency (MEMORY-007)

- Record consistent iff: one identity, one namespace, one collection, one current version, valid ownership.
- Version consistent iff: monotonic revision, immutable content, valid checksum, parent record exists.

### Determinism (MEMORY-001)

- No random behavior in domain validation rules.

---

## 8. Files that will be created

**Pending Owner resolution of Section 3.1.** Structure follows `@atlas/knowledge` convention under `src/domain/`.

### Proposed layout (final file names depend on selected track)

```text
packages/memory/src/domain/
├── aggregates/          # Track A: memory.ts | Track B: record.ts (aggregate root)
├── entities/            # Track-dependent entity files
├── value-objects/       # One file per value object + index.ts
├── events/              # One file per domain event (if vocabulary confirmed)
├── specifications/      # Domain specifications (Track A) or constraint specs (Track B)
├── errors/              # Domain error types
├── types/               # Shared domain types (enums, branded types)
└── index.ts             # Domain public exports (domain-only)

packages/memory/tests/domain/
├── aggregates/
├── entities/
├── value-objects/
├── specifications/
└── events/
```

### Estimated file count (Track B — MEMORY-004 canonical, if selected)

| Area | Files |
|------|-------|
| Value objects | ~12–15 |
| Entities / aggregates | ~5 |
| Specifications | ~7 |
| Events | 0–7 (pending event vocabulary decision) |
| Errors | ~6–8 |
| Types / index | ~2 |
| Tests | ~1 per domain component |
| **Total estimate** | ~45–60 files |

### Files explicitly NOT created in Sprint 11A.1

- Anything under `src/application/`, `src/infrastructure/`, `src/engine/`, `src/providers/`
- Repository implementations
- `createMemoryEngine()` factories (MEMORY-008 — application layer)
- Changes to `packages/memory/src/index.ts` public API (deferred)

---

## 9. Dependencies

| Dependency | Type | Usage in Domain |
|------------|------|-----------------|
| `@atlas/core` | Package | Foundation primitives, base error patterns (if aligned with knowledge package) |
| TypeScript 5.x | Dev | strict mode |
| Vitest | Dev | Domain unit tests only |

**No dependencies on:** `@atlas/runtime`, `@atlas/workflow`, `@atlas/intelligence`, `@atlas/knowledge` (domain layer remains independent; knowledge integration is upstream contract only).

**No external storage libraries.**

---

## 10. Acceptance Criteria

### Gate 0 — Specification (BLOCKING)

- [ ] Owner resolves inconsistencies I-01 through I-06
- [ ] Authoritative domain model track (A, B, or C) documented by Owner
- [ ] Authoritative domain event vocabulary selected

### Gate 1 — Domain implementation (after Gate 0)

- [ ] All domain components exist only under `packages/memory/src/domain/`
- [ ] Every class/type maps to an explicit spec requirement
- [ ] No `any`, no TODO, no FIXME, no placeholders
- [ ] TypeScript `strict: true` passes
- [ ] Rich domain model: invariants enforced inside entities/aggregates
- [ ] No anemic domain model (no business logic in tests-only helpers)
- [ ] No application, infrastructure, repository, or provider code
- [ ] Domain unit tests cover invariants, validation rules, and business rules
- [ ] No integration tests, no mocks, no infrastructure tests
- [ ] `pnpm --filter @atlas/memory typecheck` passes
- [ ] `pnpm --filter @atlas/memory test` passes
- [ ] `pnpm --filter @atlas/memory lint` passes

### Gate 2 — Sprint closure

- [ ] Final report generated per sprint template
- [ ] **NOT** started: Sprint 11A.2, Application Layer, Infrastructure, Repositories, Storage

---

## Current status

**STOPPED — awaiting Owner approval and specification conflict resolution.**

Do not generate domain code until:

1. This plan is approved, AND  
2. Blocking inconsistencies in Section 3.1 are resolved by the Owner.

---

*End of Sprint 11A.1 Implementation Plan*
