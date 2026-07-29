---
id: ATLAS-VERSION-001
title: Atlas Version Registry
version: 1.7.0
status: active
last_updated: 2026-07-29
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
| **Memory Session Domain Tag** | `memory-session-domain-certified` |
| **Memory Session Engine Tag** | `memory-session-engine-certified` |
| **Memory Architecture ADR** | [`adr/ADR-0003-MEMORY_ARCHITECTURE_RESOLUTION.md`](./adr/ADR-0003-MEMORY_ARCHITECTURE_RESOLUTION.md) |
| **Execution Model ADR** | [`adr/ADR-0004-EXECUTION-MODEL-AND-RUNTIME-OWNERSHIP.md`](./adr/ADR-0004-EXECUTION-MODEL-AND-RUNTIME-OWNERSHIP.md) — **Accepted** |
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
| `@atlas/memory` | 0.0.0 | Memory — domain, engine, application, providers, session domain + engine integration (Sprint 11A–11E.2) | **Session Engine Certified** |

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

---

## Memory session domain certification (Sprint 11E.1)

Dominio `MemorySession` certificado sobre **CONTRACT-005** (Frozen) y baseline **ADR-0003** / **ADR-0004**.

| Sprint | Componente | Tag | Status |
|--------|------------|-----|--------|
| 11E.1 | Memory Session — Domain Layer (CONTRACT-005) | `memory-session-domain-certified` | **Certified** |

Implementado: Aggregate Root `MemorySession`, Value Objects, historiales append-only (`OperationRecord`, `DiagnosticEntry`, `LifecycleRecord`), factories de ciclo de vida, validadores, estadísticas derivadas; dependencia autorizada `@atlas/events` (`CorrelationId`); 112 tests PASS (`@atlas/memory`).

Baseline congelada: dominio puro sin Engine/Providers/Repositories; sin cambios en API pública MEMORY-008; sin imports prohibidos CONTRACT-005 §16.

**Nota OI-0007:** `ATLAS-DOM-008-AGENT_DOMAIN` permanece en `Draft`; OI-0007 no afecta Sprint 11E.1 — este sprint implementa exclusivamente el dominio Memory Session bajo CONTRACT-005, sin dependencia del modelo Agent.

### CONTRACT-005 §6–§17 → cobertura de tests

| Sección CONTRACT-005 | Cobertura | Test (`memory-session.test.ts`) |
|----------------------|-----------|----------------------------------|
| §6 Session Lifecycle | Transiciones `Created→Initialized→Running→Completed\|Failed→Disposed` | `initialization`, `completion`, `failure handling`, `disposal`, `contract compliance` |
| §7 Session Identity | Session ID, Execution ID, Correlation ID, Namespace, timestamps, revision, status, metadata | `session creation` |
| §8 Session State | Status, counters, diagnostics, errors, execution metadata | `operation tracking`, `diagnostic recording`, `failure handling`, `statistics generation` |
| §9 Session Context | tenant, workspace, environment, variables, custom metadata | `session creation` (fixture con `MemorySessionContext`) |
| §10 Operation Tracking | 6 tipos canónicos, timestamped | `operation tracking` |
| §11 Diagnostics | warnings, failures, timings, counts, health snapshots (append-only) | `diagnostic recording` |
| §12 Error Handling | Errores canónicos Memory | `failure handling` (`MEMORY_RETRIEVAL_ERROR`) |
| §13 Statistics | counts, duration, latency (read-only) | `statistics generation` |
| §14 Concurrency | Una sesión por contexto de ejecución | Verificado por diseño (identidad única por aggregate); sin test de integración en 11E.1 |
| §15 Events | Lifecycle records internos (append-only) | `initialization`, `completion`, `failure handling`, `disposal` |
| §16 Dependency Rules | Sin referencias prohibidas | Verificado en código (`domain/` sin imports Runtime/Workflow/Agent/Providers) |
| §17 Testing Requirements | 9 casos obligatorios | Los 9 `it(...)` del describe §17 |

### Invariantes del Aggregate (verificados en código)

1. **Transiciones deterministas:** solo transiciones permitidas en `MEMORY_SESSION_TRANSITIONS`; violaciones lanzan `MEMORY_INVALID_SESSION_TRANSITION`.
2. **Identidad inmutable:** `memorySessionId`, `executionId`, `correlationId`, `namespaceId`, `createdAt` no mutan tras `createMemorySession`.
3. **Revisión monotónica:** cada evolución incrementa `MemorySessionRevision`.
4. **Historial append-only:** `operationHistory`, `diagnosticHistory`, `lifecycleHistory` y `errors` solo crecen por append; entradas previas no se modifican.
5. **Operaciones solo en Running:** `recordMemoryOperation` rechaza estados distintos de `Running`.
6. **Diagnósticos hasta Disposed:** `recordMemorySessionDiagnostic` rechaza sesiones en estado `Disposed`.
7. **Estadísticas derivadas:** `MemorySessionStatistics` se calcula vía `computeMemorySessionStatistics()`; no se almacena como estado mutable.
8. **Errores canónicos:** `failMemorySession` registra `MemorySessionErrorRecord` con código Memory canónico.
9. **Cadena de lifecycle coherente:** `validateMemorySession` verifica encadenamiento `toStatus`/`fromStatus` en `lifecycleHistory`.
10. **Sin lógica de infraestructura:** el aggregate no referencia Storage, Retrieval, Index, Engine, Runtime, Workflow ni Agent.

**Próximo sprint:** Pendiente autorización Owner.

---

## Memory session engine certification (Sprint 11E.2)

Integración `MemorySession` ↔ `MemoryEngine` certificada sobre **CONTRACT-001 §15**, **CONTRACT-005 §5** y baseline **ADR-0003** / **ADR-0004**.

| Sprint | Componente | Tag | Status |
|--------|------------|-----|--------|
| 11E.2 | Memory Session — Engine Integration (CONTRACT-001 §15) | `memory-session-engine-certified` | **Certified** |

Implementado: MemoryEngine como único creador/owner de MemorySession, `MemoryEngineSessionOrchestrator` y `MemoryEngineSessionRegistry` (internos, no exportados), `ConsistencyProvider.validateSessions()` con implementación real, integración en `store`/`retrieve`/`search`/`update`/`delete`.

Baseline congelada: Application nunca referencia Orchestrator/Registry; `validateSessions()` compone (no duplica) `validateMemorySession()` del dominio; API pública MEMORY-008 sin cambios.

**Próximo sprint:** Pendiente autorización Owner.

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

## Execution Model Resolution (ADR-0004)

Contradicción resuelta entre `ATLAS-RUNTIME-009-RUNTIME_ARCHITECTURE` y `ATLAS-INTELLIGENCE-CONTRACT-006/007` respecto a la propiedad de Workflow Engine y Agent Runtime.

| Field | Value |
|-------|-------|
| **ADR** | [`adr/ADR-0004-EXECUTION-MODEL-AND-RUNTIME-OWNERSHIP.md`](./adr/ADR-0004-EXECUTION-MODEL-AND-RUNTIME-OWNERSHIP.md) |
| **Status** | **Accepted** — 2026-07-27 |
| **Approved by** | Owner |

Taxonomía oficial establecida: **Pipeline Runtime** (Kernel, `@atlas/runtime`, ejecución determinista) y **Agent Runtime** (Capability, `@atlas/agent`, ejecución cognitiva no determinista). Workflow Engine pertenece exclusivamente a `@atlas/workflow`. El término genérico "Runtime" queda desambiguado — ver ADR-0004 §7.

Migración pendiente (no bloquea Sprint 11E): retirar `packages/runtime/src/agents/` y `packages/runtime/src/workflow/` del Kernel antes de iniciar la implementación de Agent Runtime (Fase 2 del ADR).

Open Issues activos derivados de este ADR: `OI-0007` (promover `ATLAS-DOM-008-AGENT_DOMAIN` a `approved`), `OI-0008` (actualizar `CONTRACT-007` con la composición de Pipeline Runtime), `OI-0009` (gates de CI para las Reglas A–F, disparador antes de Fase 3).

**Nota de alcance:** ADR-0004 resuelve exclusivamente la propiedad de Runtime/Workflow/Agent. La reconciliación CONTRACT-005 ↔ Sprint 11E quedó resuelta en 11E.1 (dominio) y 11E.2 (integración Engine ↔ Session).

---

## Accepted Technical Debt

Deuda técnica aceptada por auditoría independiente. No bloquea certificaciones de Sprint 11D ni 11E.2.

| ID | Título | Estado | Prioridad |
|----|--------|--------|-----------|
| **TD-11D-001** | StorageProvider contract still relies on optional listAll() through internal type casts. | **Accepted Technical Debt** | Resolve before first production StorageProvider implementation. |
| **TD-11E-001** | MemoryEngineSessionOrchestrator supports only one active session per engine instance. | **Accepted Technical Debt** | Resolve before any capability invokes MemoryEngine from parallel executions. |

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

### TD-11E-001 — MemoryEngineSessionOrchestrator supports only one active session per engine instance.

| Field | Value |
|-------|-------|
| **ID** | TD-11E-001 |
| **Title** | MemoryEngineSessionOrchestrator supports only one active session per engine instance. |
| **Status** | Accepted Technical Debt |
| **Priority** | Resolve before any capability (Retrieval, Agent, etc.) invokes MemoryEngine from parallel executions. |
| **Sprint** | 11E.2 — Memory Session Engine Integration |
| **Audit** | Owner review — non-blocking observation |

**Description:**

`MemoryEngineSessionOrchestrator` supports a single active session per instance (throws `Error` if `beginExecution()` is invoked while a session is already active). CONTRACT-005 §14 specifies "Concurrent executions always use different sessions", which implies concurrent executions with isolated sessions. The current implementation is correct for sequential use but does not yet support real concurrency.

**Impact:**

- Does not affect sequential MemoryEngine operations.
- Does not break ADR-0003 or ADR-0004.
- Does not break CONTRACT-001 §15 single-owner session model.
- Does not break Single Entry Point or API pública MEMORY-008.
- Does not block Sprint 11E.2 certification.

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
