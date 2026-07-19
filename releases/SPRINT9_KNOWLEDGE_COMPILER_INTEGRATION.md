---
id: ATLAS-SPRINT9-001
title: Sprint 9 — Knowledge Compiler Integration
version: 1.0.0
status: pending-authorization
phase: 3
sprint: 9
capability: Knowledge
created: 2026-07-18
author: Architecture Board
audience: Owner / Software Engineer
purpose: >
  Plan de integración entre @atlas/knowledge y @atlas/compiler.
  Sin implementación de código — autorización requerida antes de Sprint 9 execution.
prerequisite:
  - Sprint 8 COMPLETED (@atlas/knowledge v0.1.0)
  - Kernel v0.1.0-alpha FROZEN
  - AG-001, AMD-001, AMD-002 ACTIVE
related:
  - KNOWLEDGE_IMPLEMENTATION_PLAN.md
  - ../spec/capabilities/knowledge/KNOWLEDGE-001-CAPABILITY.md
  - ../spec/architecture/ATLAS-ARCH-003-COMPILER_ARCHITECTURE.md
  - packages/compiler/README.md
  - packages/knowledge/README.md
---

# SPRINT9_KNOWLEDGE_COMPILER_INTEGRATION.md

## Sprint 9 — Integración Knowledge → Compiler

**Estado:** Pendiente de autorización  
**Alcance:** Integración únicamente — **sin código en este entregable**  
**Regla:** No expandir dominio Knowledge. No Memory, Retrieval, Workflow, Runtime, persistencia.

---

## 1. Objetivo

Conectar el **Knowledge Domain** (Sprint 8) con el **Compiler Domain** (Kernel congelado) de forma que un `KnowledgeObject` pueda convertirse en entrada de compilación **sin acoplar** el compilador al dominio de conocimiento.

```text
KnowledgeObject[]
        │
        ▼
KnowledgeCompilationAdapter    ← único punto de integración
        │
        ▼
CreateCompilationUnitParams[] / CompilationUnit[]
        │
        ▼
@atlas/compiler.compile()      ← sin cambios de dependencia ni imports de Knowledge
```

**Resultado esperado:** un desarrollador puede compilar conocimiento estructurado usando el pipeline existente, con separación estricta de bounded contexts.

---

## 2. Restricciones (obligatorias)

| Restricción | Implicación |
|-------------|-------------|
| No expandir dominio Knowledge | Sin graph aggregate, store, lifecycle FSM, operations nuevas |
| No Memory / Retrieval / Workflow | Fuera de scope |
| No cambios Runtime | `@atlas/runtime` intacto |
| No persistencia | Sin repository interfaces ni stores |
| No modificar `@atlas/core` | Cero cambios en exports/contratos core |
| Compiler ↛ Knowledge | `@atlas/compiler` **no** importa `@atlas/knowledge` |
| Adapter único | Toda traducción Knowledge → CompilationUnit vive en el adapter |

---

## 3. Arquitectura

### 3.1 Principio de separación

| Bounded context | Responsabilidad | Conoce |
|-----------------|-----------------|--------|
| **Knowledge Domain** | Metamodel, `KnowledgeObject`, validators | `@atlas/core`, metamodel propio |
| **Compiler Domain** | Pipeline, HIR/MIR, artifacts, diagnostics | `@atlas/core`, `@atlas/events` |
| **Integration (Adapter)** | Traducción `KnowledgeObject` → `CompilationUnit` | Contratos **públicos** de ambos paquetes |

El compilador **nunca** ve `KnowledgeObject`, `KnowledgeStatement`, ni `src/metamodel/`.  
Solo recibe `CompilationUnit[]` como hoy.

### 3.2 Ubicación del adapter

**Decisión propuesta:** `@atlas/knowledge/src/adapters/knowledge-compilation-adapter.ts`

| Razón | Detalle |
|-------|---------|
| Ownership semántico | Knowledge **produce** unidades compilables (KNOWLEDGE-001 §Role) |
| Dominio protegido | Adapter vive fuera de `src/domain/` y `src/metamodel/` |
| Compiler aislado | Compiler no importa el paquete; Knowledge importa solo tipos públicos del compiler |
| Export dedicado | Subpath `@atlas/knowledge/compiler-adapter` |

**Alternativa rechazada:** adapter solo en `@atlas/sdk` — válida para orquestación, pero duplicaría mapping si otros consumidores (CLI futuro, tests) necesitan la traducción sin SDK. El adapter en Knowledge centraliza la regla de mapeo; SDK lo **consume**.

### 3.3 Flujo de compilación integrado

```text
Application / SDK / Example
    │
    ├─ Path A (legacy):  CreateCompilationUnitParams[]  →  compiler.compile()
    │
    └─ Path B (Sprint 9): KnowledgeObject[]
              │
              ▼
       KnowledgeCompilationAdapter.toCompilationUnits()
              │
              ▼
       CreateCompilationUnitParams[]
              │
              ▼
       createCompilationUnit()  (@atlas/compiler)
              │
              ▼
       compiler.compile(context)
```

### 3.4 Mapeo conceptual KnowledgeObject → CompilationUnit

Basado en `CreateCompilationUnitParams` (`@atlas/compiler`) y Sprint 8 `KnowledgeObject`:

| Campo CompilationUnit | Origen KnowledgeObject |
|-------------------------|------------------------|
| `id` | `object.id.toString()` |
| `origin` | `knowledge://{objectId}@{semver}` |
| `version` | `object.currentVersion.version.toJSON()` |
| `checksum` | Hash determinista del **canonical source payload** (SHA-256 sobre JSON canonicalizado) |
| `source` | Payload canónico JSON (ver §3.5) |
| `metadata.kind` | `object.kind.name` (alinea mejora C3 del compiler README) |
| `metadata.*` | Subset de `ObjectMetadata` + `governance.lifecycleState` + `trust.level` |

### 3.5 Canonical source payload (adapter output)

Estructura propuesta del campo `source` (serializable, estable para checksum):

```json
{
  "schema": "atlas.knowledge.compilation.v1",
  "objectId": "policy.security.access-control",
  "kind": "Policy",
  "metadata": { "name": "...", "description": "..." },
  "contexts": [ { "organizational": "security" } ],
  "governance": { "lifecycleState": "operational", "owner": "..." },
  "statements": [
    { "id": "stmt.1", "assertion": "...", "context": { ... } }
  ],
  "relationshipRefs": [],
  "trust": { "level": 0.0 },
  "version": "1.0.0"
}
```

**Reglas:**

- Orden de keys estable (JSON stringify con sort) para checksum reproducible
- No incluir referencias a clases TypeScript — solo datos planos
- Statements incluidos en orden de aparición en el object

### 3.6 Filtro de elegibilidad (pre-compiler)

El adapter **rechaza** (diagnostic o error) objects que no sean compilables:

| Regla | Fuente |
|-------|--------|
| `governance.lifecycleState` ∈ `{ operational, observed }` | KNOWLEDGE-005 §Operational |
| Al menos un `ContextScope` | MM-INV-003 |
| `GovernanceRecord.owner` presente | MM-INV-004 |
| Validación domain previa vía `validateKnowledgeObjectDraft` | Sprint 8 validators |

Objects en `draft`, `approved`, `archived`, etc. **no** se traducen — el adapter emite `KnowledgeCompilationDiagnostic` (adapter-local, no compiler internal).

---

## 4. Dependency graph

### 4.1 Grafo objetivo post-Sprint 9

```text
@atlas/core
    ↑
@atlas/events
    ↑
@atlas/compiler          (SIN cambios de dependencia)
    ↑
@atlas/knowledge         (+ @atlas/compiler SOLO para adapter layer)
    ↑
@atlas/sdk               (+ @atlas/knowledge)
    ↑
@atlas/cli               (sin cambios Sprint 9 — sigue vía SDK)
```

### 4.2 Matriz de dependencias

| Paquete | Nueva dependencia | Importa de Knowledge | Importa de Compiler |
|---------|-------------------|----------------------|---------------------|
| `@atlas/core` | — | — | — |
| `@atlas/compiler` | — | **NO** | — |
| `@atlas/knowledge` | `@atlas/compiler` (adapter) | — | `CreateCompilationUnitParams`, `createCompilationUnit` types/factory |
| `@atlas/runtime` | — | **NO** | — |
| `@atlas/sdk` | `@atlas/knowledge` | `KnowledgeObject`, adapter | sin cambios directos |
| `@atlas/cli` | — | **NO** | vía SDK |

### 4.3 Corrección respecto a KNOWLEDGE_IMPLEMENTATION_PLAN §19

El plan original sugería `@atlas/compiler → @atlas/knowledge`. **Sprint 9 revierte esa dirección:**

```text
@atlas/knowledge  →  @atlas/compiler   (adapter: contratos públicos únicamente)
@atlas/compiler   ↛  @atlas/knowledge  (PROHIBIDO — requisito Sprint 9)
```

El compilador acepta Knowledge **indirectamente** vía unidades ya traducidas.

---

## 5. Public API impact

### 5.1 `@atlas/knowledge` — v0.2.0 (minor)

| Export | Contenido |
|--------|-----------|
| `.` | Sin breaking changes — domain Sprint 8 intacto |
| `./compiler-adapter` | **NUEVO** — adapter + tipos de integración |
| `./metamodel` | Sin cambios |

**Nuevos símbolos propuestos:**

| Símbolo | Tipo | Descripción |
|---------|------|-------------|
| `KnowledgeCompilationAdapter` | interface | `toCompilationUnit`, `toCompilationUnits` |
| `createKnowledgeCompilationAdapter` | factory | Construye adapter con opciones |
| `KnowledgeCompilationAdapterOptions` | interface | Filtros lifecycle, inclusión statements |
| `KnowledgeCompilationResult` | interface | `units`, `skipped`, `diagnostics` |
| `KnowledgeCompilationDiagnostic` | interface | Errores/warnings pre-compiler |

**Dependencia npm añadida:**

```json
"@atlas/compiler": "workspace:*"
```

Solo referenciada desde `src/adapters/` — ESLint boundary rule recomendada: `domain/` y `metamodel/` no importan `@atlas/compiler`.

### 5.2 `@atlas/compiler` — v0.1.1 (sin bump requerido)

| Cambio | Tipo |
|--------|------|
| Código | **Ninguno obligatorio** — sigue aceptando `CompilationUnit[]` |
| Documentación | README: documentar Path B vía adapter externo |
| Tests | Opcional: contract test que acepta units con `origin: knowledge://*` |

**No** se añade `compileFromKnowledge` al compiler.  
**No** se importa `@atlas/knowledge`.

### 5.3 `@atlas/sdk` — v0.3.0 (minor)

| Cambio | Descripción |
|--------|-------------|
| Dependencia | `"@atlas/knowledge": "workspace:*"` |
| `CompilerModule.compileFromKnowledge()` | **NUEVO** — orquesta adapter + `compile()` |
| `CompileFromKnowledgeOptions` | `objects`, filtros adapter, resto de `CompileOptions` |
| Re-exports | `KnowledgeObject`, adapter types (opcional, para ergonomía) |

**Firma conceptual:**

```typescript
compileFromKnowledge(options: CompileFromKnowledgeOptions): Promise<CompilationResult>
```

Implementación interna:

```text
adapter.toCompilationUnits(objects)
  → createCompilationUnit per params
  → this.compile({ units, workspace, metadata, packages })
```

**Kernel freeze:** métodos existentes `compile()`, `runtime`, `events` sin breaking changes.

### 5.4 `@atlas/cli` — sin cambios Sprint 9

CLI continúa usando `atlas.workspace.json` units (Path A).  
Integración CLI + Knowledge objects → Sprint posterior (OAD-09).

### 5.5 `@atlas/core` — sin cambios

Cero modificaciones a contratos, tipos o errores.

---

## 6. Required code changes (post-aprobación)

### 6.1 `@atlas/knowledge`

| # | Archivo / área | Cambio |
|---|----------------|--------|
| K9-1 | `src/adapters/knowledge-compilation-adapter.ts` | Implementar adapter |
| K9-2 | `src/adapters/canonical-source.ts` | Serialización estable + checksum |
| K9-3 | `src/adapters/knowledge-compilation-diagnostic.ts` | Diagnostics pre-compiler |
| K9-4 | `src/adapters/index.ts` | Barrel export subpath |
| K9-5 | `package.json` | `exports["./compiler-adapter"]`, dep `@atlas/compiler` |
| K9-6 | `tests/adapters/` | Tests mapping, filtros, checksum estable |
| K9-7 | `README.md`, `CHANGELOG.md` | Documentar Path B |
| K9-8 | ESLint / boundary | Prohibir `@atlas/compiler` import fuera de `src/adapters/` |

**Explícitamente NO en Sprint 9:**

- `src/internal/store/`
- `KnowledgeGraph` aggregate
- Lifecycle state machine
- Nuevos entities o VOs de dominio

### 6.2 `@atlas/sdk`

| # | Archivo / área | Cambio |
|---|----------------|--------|
| S9-1 | `package.json` | Dep `@atlas/knowledge` |
| S9-2 | `src/modules/compiler-module.ts` | `compileFromKnowledge()` |
| S9-3 | `src/atlas/options.ts` | Opcional: knowledge adapter options |
| S9-4 | `src/index.ts` | Re-export types Knowledge + adapter (selectivo) |
| S9-5 | `tests/atlas.test.ts` | E2E: object → compile → success |
| S9-6 | `README.md`, `CHANGELOG.md` | Path B documentado |

### 6.3 `@atlas/compiler`

| # | Cambio | Obligatorio |
|---|--------|-------------|
| C9-1 | Ningún import de `@atlas/knowledge` | ✅ |
| C9-2 | README nota integración adapter | Recomendado |
| C9-3 | Test fixture unit con `origin: knowledge://` | Opcional |

### 6.4 Ejemplos

| # | Entregable |
|---|------------|
| E9-1 | `examples/knowledge-compiler-demo/` — crea `KnowledgeObject`, compila vía SDK |
| E9-2 | Actualizar `examples/README.md` |

### 6.5 Documentación Release

| # | Entregable |
|---|------------|
| D9-1 | Actualizar `KNOWLEDGE_IMPLEMENTATION_PLAN.md` §19 — dirección de dependencia corregida |
| D9-2 | Marcar Sprint 9 completado post-implementación |

---

## 7. Migration strategy

### Fase actual — Path A (sin regresión)

| Elemento | Estado |
|----------|--------|
| `atlas.workspace.json` → `units[]` | Sigue siendo Path A válido |
| CLI `atlas compile` | Sin cambios |
| SDK `compiler.compile({ units })` | Sin cambios |

### Fase Sprint 9 — Path B (paralelo)

| Elemento | Estado |
|----------|--------|
| Programmatic: `KnowledgeObject[]` | Nuevo via adapter + SDK |
| Demo `knowledge-compiler-demo` | Demuestra equivalencia semántica con workspace units |
| Workspace JSON | **No** se elimina — coexistencia |

### Equivalencia first-atlas-workspace

Migración de demostración (no automatizada en Sprint 9):

| Workspace unit id | KnowledgeObject equivalente |
|-------------------|----------------------------|
| `policy.security.access-control` | `ObjectKind: Policy`, statements del JSON |
| `policy.compliance.data-retention` | idem |
| `concept.platform.overview` | `ObjectKind: Concept` |

El adapter debe producir `CompilationUnit` cuyo pipeline produzca **mismos artifacts** que Path A para inputs equivalentes (test de paridad).

### Fases futuras (fuera Sprint 9)

| Fase | Contenido |
|------|-----------|
| M-CLI | `atlas compile` acepta knowledge objects (SDK + loader) |
| M-Workspace | Generación de units desde graph (Memory/store) |
| M-Primary | Graph como fuente canónica |

---

## 8. Implementation order

Orden estricto post-aprobación:

| Paso | Entregable | Paquete | Depende de |
|------|------------|---------|------------|
| 9.1 | Canonical source serializer + checksum | knowledge/adapters | Sprint 8 domain |
| 9.2 | `KnowledgeCompilationAdapter` interface + impl | knowledge/adapters | 9.1 |
| 9.3 | Adapter unit tests (mapping, filters, determinism) | knowledge/tests | 9.2 |
| 9.4 | Subpath export `./compiler-adapter` + package.json | knowledge | 9.2 |
| 9.5 | `compileFromKnowledge()` en SDK | sdk | 9.4 |
| 9.6 | SDK integration tests (object → compile → artifact) | sdk/tests | 9.5 |
| 9.7 | Example `knowledge-compiler-demo` | examples | 9.5 |
| 9.8 | Paridad test vs first-atlas-workspace units | knowledge or sdk tests | 9.6 |
| 9.9 | README / CHANGELOG / plan doc update | all | 9.7 |

**Quality gates Sprint 9:**

```bash
pnpm --filter @atlas/knowledge test:coverage
pnpm --filter @atlas/sdk test:coverage
pnpm --filter @atlas/compiler test          # sin regresión
pnpm --filter @atlas/knowledge lint
pnpm --filter @atlas/sdk lint
```

---

## 9. Riesgos

| ID | Riesgo | Impacto | Mitigación |
|----|--------|---------|------------|
| S9-R01 | Adapter importa internals del compiler | Alto | Solo `CreateCompilationUnitParams`, `createCompilationUnit` desde public API |
| S9-R02 | Compiler acoplado a Knowledge por error | Crítico | CI grep: `@atlas/compiler` must not import `@atlas/knowledge` |
| S9-R03 | Checksum no determinista | Alto | Canonical JSON con key sort; test golden |
| S9-R04 | Divergencia Path A vs Path B | Medio | Test paridad first-atlas-workspace |
| S9-R05 | Scope creep (graph, store) | Alto | Checklist §6.1 "NO en Sprint 9" |
| S9-R06 | `@atlas/knowledge` domain importa compiler | Medio | ESLint `no-restricted-imports` boundary |
| S9-R07 | Breaking SDK | Medio | Solo additive API; semver minor 0.3.0 |

---

## 10. Open decisions (requieren confirmación owner)

| ID | Decisión | Opción recomendada |
|----|----------|-------------------|
| OAD-S9-01 | Ubicación adapter | `@atlas/knowledge/src/adapters/` |
| OAD-S9-02 | Lifecycle filter default | `operational` + `observed` only |
| OAD-S9-03 | Error model adapter | `KnowledgeCompilationResult` con diagnostics, no throw en batch parcial |
| OAD-S9-04 | SDK re-export knowledge types | Sí — `KnowledgeObject` desde `@atlas/sdk` |
| OAD-S9-05 | Compiler README vs código | Solo docs, cero código compiler |

---

## 11. Criterios de aceptación Sprint 9

| # | Criterio |
|---|----------|
| AC-1 | `KnowledgeCompilationAdapter` traduce `KnowledgeObject` → `CreateCompilationUnitParams` |
| AC-2 | `@atlas/compiler` no depende ni importa `@atlas/knowledge` |
| AC-3 | `@atlas/sdk` expone `compileFromKnowledge()` |
| AC-4 | Pipeline compiler existente compila units del adapter sin modificación |
| AC-5 | Path A (workspace units) sigue funcionando |
| AC-6 | Demo + tests de paridad documentados |
| AC-7 | Sin Memory, Retrieval, Workflow, Runtime, persistencia, cambios core |

---

## 12. Approval gate

| Requisito | Estado |
|-----------|--------|
| Documento Sprint 9 completo | ✅ |
| Sin código implementado | ✅ |
| Respeta restricciones usuario | ✅ |
| Alineado Sprint 8 + Kernel freeze | ✅ |
| **Autorización owner** | ⏳ **PENDIENTE** |

---

**No escribir código hasta aprobación explícita de este plan.**

---

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-07-18 | Initial Sprint 9 integration plan — Knowledge → Compiler via adapter |
