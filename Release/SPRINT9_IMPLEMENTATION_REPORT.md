# Sprint 9 — Knowledge → Compiler Integration

**Status:** Implementation complete — awaiting architectural review  
**Date:** 2026-07-19  
**Packages:** `@atlas/knowledge@0.2.0`, `@atlas/sdk@0.3.0`

---

## 1. Objective

Integrate the Knowledge package with the existing Compiler while preserving complete architectural separation between both domains.

- **Knowledge** remains the source of truth.
- **Compiler** remains completely independent from Knowledge.

---

## 2. Architecture Decisions

### AD-009-01 — Projection layer naming (AR-009-01)

Implemented `KnowledgeProjectionAdapter` (not `KnowledgeCompilationAdapter`). The adapter:

- Projects `KnowledgeObject` → `CreateCompilationUnitParams`
- Does **not** compile
- Does **not** contain business logic
- Only translates domain representations

Location: `packages/knowledge/src/adapters/`

### AD-009-02 — SDK transparency (AR-009-02)

No new SDK method (`compileFromKnowledge()` was explicitly rejected).

Extended existing API:

```typescript
await atlas.compiler.compile({ knowledge: knowledgeObjects });
```

The SDK internally invokes `KnowledgeProjectionAdapter` before delegating to `@atlas/compiler`. The adapter is **not** exported from `@atlas/sdk`.

### AD-009-03 — Projection Rule (one-way invariant)

```text
KnowledgeObject
      ↓
KnowledgeProjectionAdapter
      ↓
CompilationUnit (disposable)
      ↓
Compiler
```

Enforced by:

| Rule | Implementation |
|------|----------------|
| Compiler unaware of Knowledge | `@atlas/compiler` has zero imports of `@atlas/knowledge` (verified) |
| Knowledge is canonical | Canonical JSON source derived from `KnowledgeObject` aggregate |
| One-way projection | Adapter only exports forward projection; no reverse mapping |
| CompilationUnits disposable | Projected units carry `metadata.projection: 'knowledge-projection-adapter'` |

### AD-009-04 — Lifecycle guard

By default, only `operational` and `observed` lifecycle states are projectable. Non-compilable objects produce `PROJECTION_LIFECYCLE_NOT_COMPILABLE` diagnostics.

Override for testing/internal use:

```typescript
new KnowledgeProjectionAdapter({ requireCompilableLifecycle: false });
```

### AD-009-05 — Deterministic checksums

Canonical source is serialized with sorted JSON keys. Checksum format: `sha256:<hex>`.

Origin format: `knowledge://{objectId}@{version}`.

---

## 3. Dependency Graph

```text
@atlas/core
    ↑
    ├── @atlas/knowledge (domain + metamodel)
    │       ↓ (adapter only)
    │   @atlas/compiler  ← types for CreateCompilationUnitParams
    │
    └── @atlas/compiler (unchanged — no knowledge dep)
            ↑
        @atlas/sdk (+ @atlas/knowledge for transparent projection)
            ↑
        @atlas/cli (unchanged)
```

**Forbidden edge (not present):** `@atlas/compiler` → `@atlas/knowledge` ✓

---

## 4. Public API Changes

### `@atlas/knowledge@0.2.0`

| Export | Description |
|--------|-------------|
| `@atlas/knowledge/compiler-adapter` | Projection layer public surface |
| `KnowledgeProjectionAdapter` | Main adapter class |
| `KnowledgeProjectionError` | Batch projection failure |
| `isKnowledgeObject()` | Type guard |
| `ProjectionOptions`, `ProjectionResult`, etc. | Supporting types |

Existing `@atlas/knowledge` and `@atlas/knowledge/metamodel` exports unchanged.

### `@atlas/sdk@0.3.0`

| Change | Breaking? |
|--------|-----------|
| `CompileOptions.knowledge?: readonly KnowledgeObject[]` | No — additive |
| Dependency on `@atlas/knowledge` | No — internal composition |

### `@atlas/compiler` / `@atlas/core`

No public API changes.

---

## 5. Files Delivered

| Path | Purpose |
|------|---------|
| `packages/knowledge/src/adapters/canonical-source.ts` | Canonical JSON + checksum |
| `packages/knowledge/src/adapters/knowledge-projection-adapter.ts` | Adapter |
| `packages/knowledge/src/adapters/index.ts` | `@atlas/knowledge/compiler-adapter` export |
| `packages/knowledge/tests/adapters/knowledge-projection-adapter.test.ts` | Unit tests |
| `packages/sdk/tests/knowledge-integration.test.ts` | Integration tests |
| `packages/sdk/src/modules/compiler-module.ts` | SDK wiring |
| `examples/knowledge-compiler-demo/` | End-to-end demo |

---

## 6. Tests

| Suite | Result |
|-------|--------|
| `@atlas/knowledge` | 26 tests passed |
| `@atlas/sdk` | 8 tests passed (6 existing + 2 new) |
| `@atlas/compiler` | 21 tests passed (unchanged) |

### New test coverage

- Projection of operational objects
- Lifecycle rejection (draft)
- Lifecycle override option
- `projectAll` failure aggregation
- Deterministic checksums
- `isKnowledgeObject` guard
- SDK compile with `knowledge` option
- Mixed `knowledge` + explicit `units`

---

## 7. Coverage

### `@atlas/knowledge` (with projection)

| Metric | Value | Threshold |
|--------|-------|-----------|
| Statements | 91.92% | ≥85% ✓ |
| Branches | 84.75% | ≥80% ✓ |
| Functions | 90.42% | ≥85% ✓ |
| Lines | 91.92% | ≥85% ✓ |

`src/adapters/` coverage: ~92% statements.

---

## 8. Demo

```bash
pnpm --filter @atlas/example-knowledge-compiler demo
```

Flow:

```text
KnowledgeObject[] (2 policies/concepts)
    → atlas.compiler.compile({ knowledge })
    → projection (internal)
    → CompilationUnit[] (2 units)
    → Compiler pipeline
    → Artifact (summary)
```

---

## 9. Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| Compiler unaware of Knowledge | ✓ |
| Knowledge canonical model | ✓ |
| Projection one-way | ✓ |
| No breaking changes in `@atlas/compiler` | ✓ |
| No breaking changes in `@atlas/core` | ✓ |
| SDK remains simple | ✓ |
| Existing compiler tests pass | ✓ |
| New projection tests pass | ✓ |
| Demo proves E2E integration | ✓ |

---

## 10. Implementation Notes

1. **Operational lifecycle in tests/demo:** `createKnowledgeObject()` defaults to `draft`. Tests use a helper to promote objects to `operational` without modifying factories (out of Sprint 9 scope).

2. **Build order:** `@atlas/knowledge` must be built before `@atlas/sdk` in CI because the SDK imports `@atlas/knowledge/compiler-adapter` from `dist/`.

3. **No reverse reconstruction:** The adapter serializes a canonical view; the Compiler never attempts to rebuild `KnowledgeObject` from units.

4. **Workspace Path A preserved:** Existing `compile({ units })` and workspace JSON configs continue to work unchanged.

---

## 11. Future Recommendations (Sprint 10+ — not implemented)

| Item | Rationale |
|------|-----------|
| Lifecycle FSM in Knowledge | Promote objects to `operational` through domain operations instead of test helpers |
| `@atlas/memory` repositories | AMD-002 — persistence layer owns storage ports |
| Graph expansion projection | Project `relationshipRefs` into compiler graph hints |
| CLI `atlas compile` from knowledge store | Wire CLI through SDK `knowledge` option |
| Projection diagnostics in SDK events | Surface `KnowledgeProjectionError` as compiler diagnostics |
| Incremental projection cache | Avoid re-serializing unchanged objects |

---

## 12. Stop Condition

Sprint 9 is **complete**. Sprint 10 work is **not** started.

**Awaiting architectural review before proceeding.**
