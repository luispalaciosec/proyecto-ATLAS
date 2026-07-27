---
id: ATLAS-VERSION-001
title: Atlas Version Registry
version: 1.5.0
status: active
last_updated: 2026-07-26
---

# VERSION.md

## Official Atlas Version

| Field | Value |
|-------|-------|
| **Atlas Version** | `0.1.0-alpha` |
| **Kernel Version** | `0.1` |
| **Kernel Status** | **Frozen** |
| **Architecture Phase** | **Completed** |
| **Current Phase** | **Implementation** |
| **Next Sprint** | **Pending owner authorization** |
| **Memory Architecture Tag** | `memory-architecture-certified` |
| **Memory Application Tag** | `memory-application-certified` |
| **Memory Engine Operations Tag** | `memory-engine-operations-certified` |
| **Memory Providers Tag** | `memory-providers-certified` |
| **Memory Architecture ADR** | [`adr/ADR-0003-MEMORY_ARCHITECTURE_RESOLUTION.md`](./adr/ADR-0003-MEMORY_ARCHITECTURE_RESOLUTION.md) |
| **Foundation Phase** | **Completed** |
| **Repository Stabilization (Milestone 2)** | **Completed** |
| **Release document** | [`releases/ATLAS-RELEASE-001-KERNEL_v0.1.md`](./releases/ATLAS-RELEASE-001-KERNEL_v0.1.md) |
| **Architecture reference** | [`ATLAS_ARCHITECTURE_MASTER.md`](./ATLAS_ARCHITECTURE_MASTER.md) |
| **Internal RC tag** | `kernel-v0.1.0-alpha.1` |

---

## Kernel package versions

Versiones publicadas en `package.json` al cierre del Kernel y actualizaciones post-Foundation:

| Package | Version | Role | Status |
|---------|---------|------|--------|
| `@atlas/core` | 0.1.1 | Primitivas fundacionales | **Frozen** |
| `@atlas/compiler` | 0.1.1 | Pipeline de compilación | **Frozen** |
| `@atlas/events` | 0.1.0 | Eventos de dominio | **Frozen** |
| `@atlas/runtime` | 0.1.0 | Ejecución de artifacts + Pipeline Engine (Sprint 10D) | **Frozen** |
| `@atlas/sdk` | 0.3.0 | Fachada pública del Kernel (+ integración Knowledge, Sprint 9) | **Frozen** |
| `@atlas/cli` | 0.1.0 | Interfaz de línea de comandos | **Frozen** |

> **Nota de versionado:** La versión de producto Atlas es `0.1.0-alpha` (Kernel v0.1 congelado). Los paquetes npm mantienen semver independiente por componente.

---

## Capability package versions

| Package | Version | Role | Status |
|---------|---------|------|--------|
| `@atlas/knowledge` | 0.2.0 | Knowledge Capability — metamodel, domain core, projection adapter (Sprint 8–9) | **Stable** |
| `@atlas/workflow` | 0.1.0 | Workflow Definition System — graph model, WorkflowCompiler (Sprint 10E) | **Frozen** |
| `@atlas/intelligence` | 0.1.0 | Cognitive Planning Engine — Goal → WorkflowDefinition (Sprint 10F) | **Frozen** |
| `@atlas/memory` | 0.0.0 | Memory — domain, engine, application layer, providers (Sprint 11A–11D) | **Providers Certified** |

---

## Runtime extensions (Sprint 10A–10D)

Extensiones cognitivas dentro de `@atlas/runtime@0.1.0`. Congeladas — no modificar sin ADR.

| Sprint | Componente | Status |
|--------|------------|--------|
| 10A | Execution Aggregate, Runtime Engine, Execution Repository | **Frozen** |
| 10B | Lifecycle Manager | **Frozen** |
| 10C | Runtime State Model | **Frozen** |
| 10D | Pipeline Engine (Coordinator, Executor, Registry, Factory) | **Frozen** |

---

## Memory certification (Sprint 11A)

Arquitectura de `@atlas/memory` certificada bajo **ADR-0003** (Accepted).

| Sprint | Componente | Tag | Status |
|--------|------------|-----|--------|
| 11A.0.1 | Specification Reconciliation | — | Complete |
| 11A.1R | Domain Layer (MEMORY-004) | `sprint-11a-1r` | Complete |
| 11A.2R | Memory Engine Validation | `sprint-11a-2r` | Complete |
| 11A.3A | ADR-0003 Ratification | — | Accepted |
| 11A.3B | Architecture Realignment | `memory-architecture-certified` | **Certified** |

Baseline congelada: Single Entry Point (`MemoryEngine`), `@atlas/core Result`, API pública MEMORY-008, entity repositories internos.

**Próximo sprint autorizado:** 11D — Memory Providers.

---

---

## Memory providers certification (Sprint 11D)

Providers reales de `@atlas/memory` certificados sobre baseline ADR-0003.

| Sprint | Componente | Tag | Status |
|--------|------------|-----|--------|
| 11D | Memory Providers — Storage / Index / Retrieval (in-memory reference) | `memory-providers-certified` | **Certified** |

Implementado: `InMemoryStorageProvider`, `InMemoryIndexProvider`, `InMemoryRetrievalProvider`; pipeline Application → MemoryEngine → Providers → MemoryStore; eliminación del fallback silencioso Legacy; `createMemoryEngine(consistencyProvider)` con stack oficial; 103 tests PASS.

Baseline congelada: MemoryEngine orquesta Storage, Index y Retrieval Providers; ConsistencyProvider exclusivo del Engine; InternalStoreGateway subordinado al Storage Provider; API pública MEMORY-008 sin cambios; Providers no exportados en `index.ts`.

**Próximo sprint:** pendiente de autorización del Owner. Sprint 11E no iniciado.

---

## Memory engine operations certification (Sprint 11C)

Operaciones canónicas del MemoryEngine certificadas sobre baseline ADR-0003.

| Sprint | Componente | Tag | Status |
|--------|------------|-----|--------|
| 11C | Memory Engine Operations — `retrieve` / `search` / `update` | `memory-engine-operations-certified` | **Certified** |

Implementado: `retrieve(request)`, `search(query)`, `update(record)`, `RetrievalProviderPort` stub, realineación Application Layer sin workarounds.

Baseline congelada: orquestación exclusiva del Engine; pipeline Engine → Retrieval Port (stub) → InternalStoreGateway → MemoryStore.

**Próximo sprint autorizado:** 11D — Memory Providers.

---

## Memory application certification (Sprint 11B)

Application Layer de `@atlas/memory` certificada sobre baseline ADR-0003.

| Sprint | Componente | Tag | Status |
|--------|------------|-----|--------|
| 11B | Application Layer — Use Cases | `memory-application-certified` | **Certified** |

Implementado: 5 Use Cases (`Store`, `Retrieve`, `Delete`, `Search`, `Update`), contratos Request/Response, `ApplicationError`, 32 tests de aplicación.

Baseline congelada: Use Cases orquestan exclusivamente `MemoryEngine`; sin acceso a MemoryStore, Providers ni Repositories.

---

## Accepted Technical Debt

Deuda técnica aceptada por auditoría independiente. No bloquea certificación ni Sprint 11E. Debe resolverse antes del primer StorageProvider productivo.

| ID | Título | Estado | Prioridad |
|----|--------|--------|-----------|
| **TD-11D-001** | StorageProvider contract still relies on optional listAll() through internal type casts. | **Accepted Technical Debt** | Resolve before first production StorageProvider implementation. |

### TD-11D-001 — StorageProvider contract still relies on optional listAll() through internal type casts.

| Field | Value |
|-------|-------|
| **ID** | TD-11D-001 |
| **Title** | StorageProvider contract still relies on optional listAll() through internal type casts. |
| **Status** | Accepted Technical Debt |
| **Priority** | Resolve before first production StorageProvider implementation. |
| **Sprint** | 11D — Memory Providers |
| **Audit** | Independent audit — non-blocking observation |

**Description:**

Current InMemoryStorageProvider is not affected.

Future production providers (SQLite/PostgreSQL/Redis) must eliminate this dependency by formalizing the contract instead of relying on optional runtime capabilities.

**Impact:**

- Does not affect current InMemoryStorageProvider.
- Does not break ADR-0003.
- Does not break the Engine → Providers → MemoryStore pipeline.
- Does not break Single Entry Point.
- Does not block Sprint 11E.

---

## Stub packages (Stage 2 — sin implementación)

Los siguientes paquetes permanecen en `0.0.0` (bootstrap):

`agent`, `context`, `context-planner`, `graph`, `ontology`, `plugin`, `prompt`, `publisher`, `retrieval`, `search`, `validation`

---

## Version policy

- **Kernel v0.1 line:** contratos públicos congelados. Breaking changes requieren major version.
- **Runtime Sprint 10D, Workflow 10E, Planning 10F:** congelados. Cambios requieren ADR.
- **Knowledge capability:** semver independiente bajo `@atlas/knowledge`; integración transparente vía `@atlas/sdk@0.3.0`.
- **Atlas product semver:** gobernada por este archivo, `ATLAS_ARCHITECTURE_MASTER.md` y `releases/ATLAS-RELEASE-001-KERNEL_v0.1.md`.
