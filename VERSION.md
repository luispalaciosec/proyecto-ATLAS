---
id: ATLAS-VERSION-001
title: Atlas Version Registry
version: 1.11.0
status: active
last_updated: 2026-08-10
---

# VERSION.md

## Official Atlas Version

| Field | Value |
|-------|-------|
| **Atlas Version** | `0.1.0-alpha` |
| **Kernel Version** | `0.1` |
| **Kernel Status** | **Frozen** |
| **Architecture Phase** | **Completed** |
| **Current Phase** | **Phase 2 — Product (P2.5 Delivered, Product Hardening Checkpoint Closed)** |
| **Next Sprint** | **Piloto de uso real (varias semanas, ≥1 marca real)** — P2.6 Cloud sigue condicional a necesidad real, no autorizado todavía ([`ATLAS_PRODUCT_VISION_v1.0.md`](./ATLAS_PRODUCT_VISION_v1.0.md)) |
| **Product Vision** | [`ATLAS_PRODUCT_VISION_v1.0.md`](./ATLAS_PRODUCT_VISION_v1.0.md) |
| **Memory Architecture Tag** | `memory-architecture-certified` |
| **Memory Application Tag** | `memory-application-certified` |
| **Memory Engine Operations Tag** | `memory-engine-operations-certified` |
| **Memory Providers Tag** | `memory-providers-certified` |
| **Memory Session Domain Tag** | `memory-session-domain-certified` |
| **Memory Session Engine Tag** | `memory-session-engine-certified` |
| **Memory Architecture ADR** | [`adr/ADR-0003-MEMORY_ARCHITECTURE_RESOLUTION.md`](./adr/ADR-0003-MEMORY_ARCHITECTURE_RESOLUTION.md) |
| **Execution Model ADR** | [`adr/ADR-0004-EXECUTION-MODEL-AND-RUNTIME-OWNERSHIP.md`](./adr/ADR-0004-EXECUTION-MODEL-AND-RUNTIME-OWNERSHIP.md) — **Accepted** |
| **Retrieval Architecture ADR** | [`adr/ADR-0005-RETRIEVAL_ARCHITECTURE_RECONCILIATION.md`](./adr/ADR-0005-RETRIEVAL_ARCHITECTURE_RECONCILIATION.md) — **Accepted** |
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
| `@atlas/sdk` | 0.3.0 | Fachada pública del Kernel (+ Memory, Planning, Workflow, Retrieval MVP, LLM P2.1–P2.2) | **MVP+** |
| `@atlas/cli` | 0.1.0 | Interfaz de línea de comandos (+ memory, plan, chat MVP; `ask` P2.1; chat LLM + `atlas` default P2.2; `brand` P2.3; `web` P2.5) | **MVP+** |

> **Nota de versionado:** La versión de producto Atlas es `0.1.0-alpha` (Kernel v0.1 congelado). Los paquetes npm mantienen semver independiente por componente.

---

## Capability package versions

| Package | Version | Role | Status |
|---------|---------|------|--------|
| `@atlas/knowledge` | 0.2.0 | Knowledge Capability — metamodel, domain core, projection adapter (Sprint 8–9) | **Stable** |
| `@atlas/workflow` | 0.1.0 | Workflow Definition System — graph model, WorkflowCompiler (Sprint 10E) | **Frozen** |
| `@atlas/intelligence` | 0.1.0 | Cognitive Planning Engine — Goal → WorkflowDefinition (Sprint 10F) | **Frozen** |
| `@atlas/memory` | 0.0.0 | Memory — domain, engine, application, providers, session domain + engine integration (Sprint 11A–11E.2); JsonFileStorageProvider MVP | **Session Engine Certified** |
| `@atlas/retrieval` | 0.0.0 | Retrieval Capability — pipeline MVP ADR-0005 D8 (Sprint MVP-5) | **MVP** |
| `@atlas/llm` | 0.0.0 | LLM Adapter — provider abstraction, tool-calling loop, conversation history (P2.1–P2.2) | **P2.2** |

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

## Retrieval Architecture Resolution (ADR-0005)

Reconciliación arquitectónica de Retrieval (Phase 6) previa a cualquier implementación de `@atlas/retrieval`.

| Field | Value |
|-------|-------|
| **ADR** | [`adr/ADR-0005-RETRIEVAL_ARCHITECTURE_RECONCILIATION.md`](./adr/ADR-0005-RETRIEVAL_ARCHITECTURE_RECONCILIATION.md) |
| **Status** | **Accepted** — 2026-08-04 |
| **Approved by** | Owner |

Cierra formalmente **OI-0005** de ADR-0004 (colisión Retrieval Provider vs. RetrievalProvider interno de Memory): se declaran componentes no equivalentes y no relacionados; `@atlas/retrieval` tiene prohibido depender de `packages/memory/src/providers/retrieval/`; todo consumo de Memory ocurre exclusivamente vía la interfaz pública de Memory Engine (`MEMORY-CONTRACT-001`).

`DOM-005` queda establecida como la referencia arquitectónica interna canónica de Retrieval. La arquitectura interna de `ATLAS-104`/`ATLAS-105` queda no autoritativa (Superseded parcial), preservando su valor conceptual. Pipeline canónico único adoptado: Retrieval Request → Memory Access → Candidate Retrieval → Ranking → Filtering/Selection → Retrieval Result → Context.

Open Issues activos derivados de este ADR: `OI-0001` (relación Memory Provider `INTELLIGENCE-CONTRACT-002` vs. Memory Engine — no determinada), `OI-0002` (posible recurrencia del patrón en Context/Reasoning/Planning), `OI-0003` (relación `ATLAS-104` vs. `@atlas/search`), `OI-0004` (ejecución de correcciones documentales M1–M3), `OI-0005` (futuro de la distinción Search→Retrieval en `@atlas/search`).

**Nota de alcance:** ADR-0005 no modifica ningún contrato, código o certificación de Memory. No define Sprint 12A–D — la descomposición operativa de Phase 6 queda como Future Work, pendiente de autorización del Owner.

---

## MVP Implementation (Sprints MVP-1–MVP-6)

Primer MVP funcional de ATLAS entregado sobre arquitectura congelada (ADR-0001–ADR-0005). Plan de referencia: [`releases/MVP_IMPLEMENTATION_PLAN.md`](./releases/MVP_IMPLEMENTATION_PLAN.md).

| Sprint | Entregable | Commit | Status |
|--------|------------|--------|--------|
| MVP-1 | `atlas memory store/search` — MemoryModule + CLI | `f7eab86` | **Complete** |
| MVP-2 | `atlas plan --goal` — Planning + Workflow + compile + execute | `7c575a6` | **Complete** |
| MVP-3 | Plan recuerda ejecuciones automáticamente en Memory | `35aa602` | **Complete** |
| MVP-4 | Memoria persistente JSON (`JsonFileStorageProvider`, `.atlas/memory.json`) | `51843b3` | **Complete** |
| MVP-5 | Retrieval pipeline MVP (ADR-0005 D8) antes de planificar | `ee8a04c` | **Complete** |
| MVP-6 | `atlas chat` — REPL multi-turno con sesión compartida | `2daefce` | **Complete** |

**Comandos CLI MVP:** `atlas memory`, `atlas plan`, `atlas chat` (más `compile`, `run`, `doctor`, `version` existentes).

**Módulos SDK añadidos:** `memory`, `planning`, `workflow`, `retrieval`.

**Restricciones respetadas:** sin nuevos ADR; sin modificar contratos Frozen de Memory; `@atlas/retrieval` consume Memory exclusivamente vía API pública de `MemoryEngine`; prohibido tocar `packages/memory/src/providers/retrieval/`.

**Deuda parcialmente abordada:** TD-11D-001 — `JsonFileStorageProvider` (MVP Sprint 4) implementa persistencia JSON; la dependencia interna opcional de `listAll()` permanece como deuda aceptada hasta un Storage Provider de producción completo.

---

## Phase 1 — Foundation & MVP: CLOSED

Status:

**Phase 1 — Complete** (officially closed 2026-08-04, tras verificación independiente de commits y suite de tests completa).

Phase 1 agrupa la fundación arquitectónica (ADR-0001–ADR-0005, Kernel Frozen v0.1) y el primer MVP funcional (Sprints MVP-1–MVP-6). Con este cierre, ATLAS deja de medirse por número de ADRs, contratos o packages, y pasa a medirse por valor entregado a un usuario real. Ver [`ATLAS_PRODUCT_VISION_v1.0.md`](./ATLAS_PRODUCT_VISION_v1.0.md) para la dirección de Phase 2.

**Verificación de cierre (independiente, no autoreportada):**

| Verificación | Método | Resultado |
|---|---|---|
| Commits en `origin/main` | `git status`, `git rev-parse HEAD` vs `git rev-parse origin/main`, `git log` | `HEAD` y `origin/main` apuntan al mismo commit (`c5db504`); working tree limpio; historial local coincide commit-a-commit con los 7 commits reportados (`f7eab86`…`c5db504`) |
| Suite de tests | Instalación limpia (`pnpm install --frozen-lockfile`) + `vitest run` ejecutado paquete por paquete | **363/363 tests pasando, 0 fallos**, en los 11 paquetes core (`core`, `events`, `compiler`, `runtime`, `knowledge`, `memory`, `workflow`, `intelligence`, `retrieval`, `sdk`, `cli`) |
| Encapsulamiento Retrieval (ADR-0005 D2/D3/R2) | Grep de `providers/retrieval` sobre `packages/retrieval` y `packages/sdk` | Cero referencias — `@atlas/retrieval` nunca importa el Retrieval Provider interno de Memory |
| Registro de comandos CLI nuevos | Lectura de `packages/cli/src/application/container.ts` | `memory`, `plan`, `chat` registrados en el `commandRegistry`, no archivos huérfanos |
| Orquestación real (Retrieval→Planning→Workflow→Compiler→Runtime→Memory) | Lectura de `packages/sdk/src/plan/plan-execution-memory.ts` | Composición real de las 6 capabilities, sin generadores de relleno en la ruta nueva |

**Alcance de la certificación:** esta verificación cubre los 11 paquetes bajo `packages/` al cierre de Phase 1. No cubre `apps/`, `templates/` ni `scripts/`, que no forman parte de la superficie MVP.

---

## P2.1 — LLM Adapter + Tool Calling (Phase 2)

Primer entregable de Phase 2 — Product: capacidad generativa con tool-calling sobre capabilities certificadas, sin modificar Memory, Workflow, Intelligence ni Retrieval por dentro. Plan de referencia: [`releases/P2_1_LLM_ADAPTER_IMPLEMENTATION_PLAN.md`](./releases/P2_1_LLM_ADAPTER_IMPLEMENTATION_PLAN.md).

| Sprint | Entregable | Status |
|--------|------------|--------|
| LLM-1 | `@atlas/llm` — `LlmProvider`, `AnthropicProvider`, `FakeLlmProvider`, presupuesto | **Complete** |
| LLM-2 | `runToolLoop()` — ciclo tool-calling con guardrail `maxTurns` | **Complete** |
| LLM-3 | `LlmModule` en SDK — `memory_search`, `memory_store`, `plan_and_execute` | **Complete** |
| LLM-4 | `atlas ask --goal`, check LLM en `atlas doctor`, `.env.example` | **Complete** |

**Comando CLI nuevo:** `atlas ask` (requiere `ATLAS_LLM_API_KEY` + `ATLAS_LLM_MODEL`).

**Tools expuestas al modelo:** `memory_search`, `memory_store`, `plan_and_execute` (wrapper de `planExecuteAndRemember`).

**Sin cambios en:** `atlas plan`, `atlas chat`, `planAndExecute()`, `#createSummaryGenerator()` — siguen deterministas.

**Tests automatizados (sin red):** `@atlas/llm` 9/9, `@atlas/sdk` 28/28, `@atlas/cli` 43/43 — todos con `FakeLlmProvider` o provider inline en tests CLI.

**Variables de entorno:** `ATLAS_LLM_PROVIDER` (default `anthropic`), `ATLAS_LLM_API_KEY`, `ATLAS_LLM_MODEL` (sin default hardcodeado).

### P2.1 Extension — OpenAI-Compatible Provider

Extensión aditiva de P2.1 dentro de la abstracción `LlmProvider` existente — **no** introduce ADR nuevo ni modifica contratos Frozen. Qwen Cloud es el primer target validado como proveedor OpenAI-compatible; Qwen es configuración tecnológica, no parte de la arquitectura ATLAS.

| Componente | Cambio |
|------------|--------|
| `@atlas/llm` | `createOpenAICompatibleProvider` — `id: openai-compatible`, `fetch` nativo, `/chat/completions` |
| `@atlas/sdk` | `LlmModule` resuelve `anthropic` \| `openai-compatible` desde `providerId` / `ATLAS_LLM_PROVIDER` |
| `@atlas/cli` | `#resolveLlmOptions()` lee `ATLAS_LLM_PROVIDER` y `ATLAS_LLM_BASE_URL` |
| Anthropic | Sin cambios en `anthropic-provider.ts` ni en semántica existente |

**Providers soportados:**

| `ATLAS_LLM_PROVIDER` | Implementación | Notas |
|----------------------|----------------|-------|
| `anthropic` (default) | `createAnthropicProvider` | Sin cambios |
| `openai-compatible` | `createOpenAICompatibleProvider` | Qwen, DeepSeek u otros APIs compatibles con OpenAI Chat Completions |

**Variables adicionales:**

| Variable | Obligatoria | Default | Uso |
|----------|-------------|---------|-----|
| `ATLAS_LLM_BASE_URL` | No | `https://dashscope.aliyuncs.com/compatible-mode/v1` cuando `provider=openai-compatible` | Base URL del API compatible; trailing slash se normaliza; endpoint final: `{baseUrl}/chat/completions` |

**Principio arquitectónico:** `ATLAS → LlmProvider → Provider implementation → External LLM`. Nunca `ATLAS → Qwen` ni `ATLAS → Anthropic` directamente.

**Ejemplo Qwen (sin secretos reales):**

```bash
export ATLAS_LLM_PROVIDER=openai-compatible
export ATLAS_LLM_API_KEY="..."
export ATLAS_LLM_MODEL="..."
export ATLAS_LLM_BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1"
pnpm build
pnpm atlas doctor
pnpm atlas ask --goal "..."
```

**Verificación de cierre (extensión P2.1 OpenAI-compatible):**

| Área | Resultado | Evidencia |
|------|-----------|-----------|
| LlmProvider contract | PASS | `packages/llm/src/provider.ts` sin diff; provider implementa `complete()` existente |
| Anthropic | PASS | `anthropic-provider.ts` sin diff; `@atlas/llm` tests anthropic 5/5 |
| OpenAI-compatible | PASS | `openai-compatible-provider.test.ts` 6/6; mapeo chat/tools/multi-turn |
| Tool-calling | PASS | `tool-loop.test.ts` 5/5; `llm-module.test.ts` incluye resolución openai-compatible |
| Qwen configuration | PASS | default base URL + override vía `ATLAS_LLM_BASE_URL`; tests mock HTTP |
| Build | PASS | `pnpm build` — 23/23 tareas turbo |
| Tests | PASS | `pnpm test` — 46/46; `@atlas/llm` 16/16, `@atlas/sdk` 34/34, `@atlas/cli` 72/72 |
| Typecheck | FAIL | `@atlas/llm` TS2322 preexistente en `anthropic-provider.test.ts:71` (commit `ce7816ee`) |
| Lint | FAIL | `@atlas/llm` unused `init` en `openai-compatible-provider.test.ts:104` — **introducido por esta extensión** |
| Architecture scope | PASS | Sin cambios en Core, Compiler, Runtime, Memory, Retrieval, Workflow, Planning, Events, ADRs |

**Deuda aceptada:** ninguna nueva introducida por esta extensión. Corregir lint de test antes de commit.

---

## P2.2 — Conversación (Phase 2)

Segundo entregable de Phase 2: `atlas chat` conversacional con LLM cuando está configurado, fallback determinista idéntico al MVP cuando no lo está; `atlas` sin subcomando entra en chat. Plan: [`releases/P2_2_CONVERSACION_IMPLEMENTATION_PLAN.md`](./releases/P2_2_CONVERSACION_IMPLEMENTATION_PLAN.md).

| Sprint | Entregable | Status |
|--------|------------|--------|
| CONV-1 | Historial en `runToolLoop` + `LlmModule.ask({ history })` + `isConfigured()` | **Complete** |
| CONV-2 | `atlas chat` bifurcado LLM/determinista con memoria conversacional | **Complete** |
| CONV-3 | `atlas` sin subcomando → `runChatRepl` (sin interceptar subcomandos) | **Complete** |
| CONV-4 | Cierre documental en `VERSION.md` | **Complete** |

**Comportamiento:** con `ATLAS_LLM_API_KEY` + `ATLAS_LLM_MODEL`, cada turno usa `atlas.llm.ask` con historial acumulado; presupuesto `maxTurns` se resetea por mensaje. Sin LLM configurado, `planExecuteAndRemember` vía `planAndExecute` — igual que MVP.

**Sin cambios en:** `atlas ask` (single-shot), capabilities certificadas por dentro, test determinista preexistente de `chat-repl.test.ts`.

**Tests automatizados (sin red):** `@atlas/llm` 10/10, `@atlas/sdk` 31/31, `@atlas/cli` 45/45.

**Deuda aceptada:** TD-P2.2-001 — historial conversacional sin truncado ni resumen; crece y se reenvía completo en cada turno LLM.

---

## P2.3 — Brands & Workspaces (Phase 2)

Tercer entregable de Phase 2: workspaces de marca con memoria físicamente aislada (`.atlas/workspaces/<slug>/memory.json`) y perfil de contexto inyectado al LLM vía `contextPrompt`. Plan: [`releases/P2_3_BRANDS_WORKSPACES_IMPLEMENTATION_PLAN.md`](./releases/P2_3_BRANDS_WORKSPACES_IMPLEMENTATION_PLAN.md).

| Sprint | Entregable | Status |
|--------|------------|--------|
| BRAND-1 | `WorkspaceProfile`, slug sanitization, load/create profile | **Complete** |
| BRAND-2 | `AtlasLlmOptions.contextPrompt` concatenado al system prompt | **Complete** |
| BRAND-3 | `atlas brand <name>`, `createBrandClient`, `runChatRepl({ client })` | **Complete** |
| BRAND-4 | Cierre documental en `VERSION.md` | **Complete** |

**Comando CLI nuevo:** `atlas brand <name>` — carga/crea perfil, abre conversación con memoria aislada.

**Sin cambios en:** `atlas chat`, `atlas ask`, `atlas` (default), `atlas plan`, `atlas memory` — siguen en `cli.default`.

**Edición de perfil:** manual vía `.atlas/workspaces/<slug>/profile.json` (`atlas brand edit` fuera de alcance).

**Tests automatizados (sin red):** `@atlas/cli` incluye aislamiento cruzado geeks/revital + contexto de marca en system prompt.

---

## P2.4 — Feedback Loop (Phase 2)

Cuarto entregable del núcleo conversacional Phase 2: comando `/correct` en el REPL (modo LLM) persiste correcciones como `recordType: 'Feedback'`, y `atlas brand` carga proactivamente correcciones previas en el `contextPrompt`. Plan: [`releases/P2_4_FEEDBACK_LOOP_IMPLEMENTATION_PLAN.md`](./releases/P2_4_FEEDBACK_LOOP_IMPLEMENTATION_PLAN.md).

| Sprint | Entregable | Status |
|--------|------------|--------|
| FEED-1 | `/correct` en REPL + `recordFeedback` | **Complete** |
| FEED-2 | Recuperación proactiva en `atlas brand` | **Complete** |
| FEED-3 | Cierre documental en `VERSION.md` | **Complete** |

**Comando REPL nuevo:** `/correct <texto>` — solo en modo LLM, no cuenta como turno.

**Sin cambios en:** `atlas ask`, `atlas plan`, `atlas memory`, `atlas chat`/`atlas` genérico (sin feedback proactivo).

**Deuda aceptada (mismo tipo que TD-P2.2-001):** feedback acumulado sin poda ni límite en P2.4.

**Checkpoint Phase 2:** con P2.1–P2.4 entregados, corresponde evaluar el criterio de éxito de ATLAS_PRODUCT_VISION §10 con uso real antes de avanzar a P2.5 (Web UI).

---

## P2.5 — Web UI (Phase 2)

Quinto entregable Phase 2: interfaz web local (`@atlas/web`) que expone `atlas chat`/`atlas brand`/`/correct` vía HTTP sobre la lógica compartida exportada desde `@atlas/cli`. Plan: [`releases/P2_5_WEB_UI_IMPLEMENTATION_PLAN.md`](./releases/P2_5_WEB_UI_IMPLEMENTATION_PLAN.md).

| Sprint | Entregable | Status |
|--------|------------|--------|
| WEB-1 | Extracción `chat-turn.ts` + exports `@atlas/cli` | **Complete** |
| WEB-2 | Servidor HTTP `apps/web` + tests API | **Complete** |
| WEB-3 | Frontend estático `public/` | **Complete** |
| WEB-4 | Comando `atlas web` (spawn subproceso) | **Complete** |
| WEB-5 | Cierre documental en `VERSION.md` | **Complete** |

**Arranque:** `pnpm --filter @atlas/web build && node apps/web/dist/server.js` o `atlas web`.

**Host/puerto:** `ATLAS_WEB_HOST` (default `127.0.0.1`), `ATLAS_WEB_PORT` (default `4173`).

**Nota checkpoint:** Owner autorizó avanzar a P2.5 sin esperar evaluación formal del criterio Vision §10.

**Verificación de cierre (independiente, no autoreportada):** el reporte inicial de P2.5 declaraba `pnpm --filter @atlas/cli test` 69/69 y `pnpm --filter @atlas/web test` 7/7, pero no ejecutaba `turbo run build`/`turbo run test` en la raíz. La verificación independiente detectó una dependencia circular real `@atlas/cli` ↔ `@atlas/web` (el comando estándar `pnpm run build` fallaba con cycle-detection, exit 1) y, tras corregirla, un test flaky en `feedback-context.test.ts` (colisión de timestamp en milisegundo, ~50% de fallos). Ambos corregidos ([`releases/P2_5_FIX_CIRCULAR_DEPENDENCY.md`](./releases/P2_5_FIX_CIRCULAR_DEPENDENCY.md), [`releases/P2_5_FIX_FEEDBACK_ORDER_FLAKY_TEST.md`](./releases/P2_5_FIX_FEEDBACK_ORDER_FLAKY_TEST.md)) y reverificados desde una copia limpia: `pnpm run build` en raíz — 23/23 tareas, sin warning de ciclo; `pnpm run test` en raíz — 46/46; `feedback-context.test.ts` — 0 fallos en 30 corridas repetidas.

---

## Checkpoint — Product Hardening post-P2.5 (validación manual + fixes)

En P2.4 quedó registrado: *"corresponde evaluar el criterio de éxito de ATLAS_PRODUCT_VISION §10 con uso real antes de avanzar a P2.5"*. Esa evaluación no se hizo antes de P2.5 (Owner autorizó avanzar igual), pero se completó ahora, después de P2.5, mediante una batería de 6 ejercicios end-to-end (E1–E6) ejecutados manualmente el 8–9 de agosto de 2026. Informe completo: [`releases/MANUAL_VALIDATION_REPORT_2026-08-09.md`](./releases/MANUAL_VALIDATION_REPORT_2026-08-09.md). Guía de uso resultante: [`USER_MANUAL.md`](./USER_MANUAL.md).

| Ejercicio | Descripción | Resultado |
|-----------|-------------|-----------|
| E1 | Memoria + `ask` + `plan` | **PASS** |
| E2 | Chat multi-turno | **PASS** |
| E3 | Web UI (`default`) | **PASS** |
| E4 | Brand CLI (`geeks`) | **PASS** |
| E5 | Brand Web (`geeks` ↔ `default`) | **PASS** |
| E6 | Escalamiento cross-brand (bidireccional, CLI + Web, con `/correct` y resumen entre sesiones) | **PASS (12/12)** |

Durante la validación se detectaron y cerraron cuatro hallazgos, además de tres commits fuera de este proceso que también se reverificaron independientemente:

- **Tres commits sin revisión previa** (`39ac12f` bootstrap `pnpm atlas`, `29e39d4` provider OpenAI-compatible, `a63ed06` búsqueda/plan insensible a tildes) — verificados post-hoc: código correcto, pero `a63ed06` modificó `@atlas/core` y `@atlas/intelligence` (Frozen) sin pasar por ADR. Gap de gobernanza señalado, no bloqueante dado el carácter de bug fix aditivo.
- **Quality gate roto en la raíz** (`pnpm run typecheck` y `pnpm run lint` fallaban, invisibles porque nunca se corrían completos, solo con `--filter`) — corregido y reverificado: `pnpm run typecheck` 35/35, `pnpm run lint` 35/35. Ver [`releases/QUALITY_GATE_FIX_TYPECHECK_LINT.md`](./releases/QUALITY_GATE_FIX_TYPECHECK_LINT.md).
- **L-01 — Groq (`llama-3.3-70b-versatile`) intermitente en tool-calling** (`tool_use_failed`, rate limits) — diagnosticado con un experimento controlado comparando el mismo flujo en Groq vs. Anthropic (`claude-sonnet-5`): el fallo no se reprodujo con Anthropic. Confirmado como limitación del proveedor, no de ATLAS. `USER_MANUAL.md` actualizado recomendando Anthropic como proveedor por defecto.
- **L-02 — el LLM podía contradecir un resultado de `memory_search` no vacío** (afirmar "no hay datos" existiendo registros) — corregido extendiendo `SYSTEM_PROMPT` en `llm-module.ts` con una instrucción explícita de precedencia de tool results; test unitario nuevo verifica el mensaje real enviado al provider. Ver [`releases/LLM_TOOL_RESULT_PRECEDENCE_FIX.md`](./releases/LLM_TOOL_RESULT_PRECEDENCE_FIX.md).

**Verificación de cierre (independiente):** cada fix anterior fue reverificado desde una copia limpia del repo (no solo el autoreporte) — `pnpm run build` 23/23, `pnpm run test` 46/46 en cada punto de control.

**Conclusión del checkpoint:** el núcleo funcional de Phase 2 (P2.1–P2.5) es operativo y reproducible con evidencia end-to-end, no solo tests automatizados. El siguiente paso autorizado no es P2.6 (Cloud) — sigue condicional a necesidad real — sino un piloto de uso real de varias semanas con al menos una marca/workspace real, antes de reabrir esa conversación.

---

## P2.5.x — Web UI Fase 3, consolidado (Productización post-P2.5)

**Qué es esto:** cierre consolidado de la reconstrucción completa de la Web UI (`@atlas/web`), ejecutada por Luis trabajando directamente con ChatGPT (producto/spec) y Cursor (implementación), **fuera** del proceso de super-prompt/revisión previa de esta sesión. Confirmado por Luis como trabajo intencional, no un desvío accidental. Esta entrada reemplaza las cinco entradas fragmentadas "Fase 3 / 3D+3B / 3E / 3F / 3G" que existían antes (histórico completo sigue disponible en los informes individuales bajo `releases/`, ver bibliografía abajo) y añade el hotfix más reciente (env + errores legibles) que no tenía entrada propia todavía.

**Qué se construyó:** la Web UI pasó de un HTML/JS estático (`apps/web/public/`) a una SPA real con Vite (`apps/web/src/client/`) — router, páginas (Inicio, Conversación, Conocimiento, Actividad, Marcas), estado de app, componentes de shell, mappers de presentación, i18n español, markdown seguro (`dompurify` + `marked`), iconos (`lucide`). Endpoints nuevos en el servidor: `GET/POST /api/brands`, `GET /api/activity`, `GET/POST /api/knowledge/search`, `GET /api/history`, además de los ya existentes `/api/chat`, `/api/correct`, `/api/health`, `/api/workspaces`. `vite build` es ahora parte del build de producción real (no un artefacto aparte).

**Progresión de tests `@atlas/web` a través de las fases (todas verificadas, no autoreportadas):** 26/26 → 42/42 → 60/60 → 74/74 → 152/152 → **165/165** (upload documentos).

**Upload de documentos (post-`aeea5f5`, 2026-08-10):** `POST /api/knowledge/upload` — PDF/DOCX/PPTX/TXT/MD → memoria buscable por marca. Informe: [`WEB_UI_KNOWLEDGE_UPLOAD_IMPLEMENTATION.md`](./releases/WEB_UI_KNOWLEDGE_UPLOAD_IMPLEMENTATION.md). Solo `apps/web/`; PPTX vía `jszip` (OOXML zip, sin binarios nativos).

**Verificación independiente de esta sesión, sobre el HEAD real `aeea5f5` (2026-08-10, copia limpia aislada, no la self-report de Cursor):**

| Chequeo | Resultado |
|---|---|
| `pnpm install --frozen-lockfile` | OK |
| `pnpm run build` (raíz) | 23/23 tareas |
| `pnpm run typecheck` (raíz) | 35/35 tareas |
| `pnpm run lint` (raíz) | 35/35 tareas |
| `pnpm run test` (raíz) | 46/46 tareas — `@atlas/sdk` 36/36, `@atlas/memory` 128/128 (22 archivos), `@atlas/cli` 72/72 (10 archivos), `@atlas/web` 152/152 (24 archivos) |
| Kernel/Frozen tocado (`packages/{core,compiler,runtime,workflow,intelligence,memory,retrieval}`) desde el inicio de Fase 3 hasta `aeea5f5` | **0 commits** — límite respetado |

**Hotfix más reciente (commit `aeea5f5`, 2026-08-10):** durante uso real con la marca "Geeks", `/api/chat` devolvía 500 porque el proceso de `atlas web` no cargaba el `.env` del repo (sin `ATLAS_LLM_API_KEY`, caía a modo determinístico, que fallaba en esa marca), y el panel "Ver detalles" mostraba el error literal `[object Object]`. Corregido con `apps/web/src/lib/load-env.ts` y `format-atlas-error.ts`. Informe: [`WEB_UI_CHAT_ENV_AND_ERROR_DISPLAY_FIX.md`](./releases/WEB_UI_CHAT_ENV_AND_ERROR_DISPLAY_FIX.md). Este episodio es la primera señal real de uso del pilotaje — no fue un test sintético.

**Gaps conocidos, sin resolver todavía:**

- **Bug confirmado, no corregido:** el chip de ejemplo "Clientes VIP" en Conocimiento (`apps/web/src/i18n/es.ts:267`) es texto decorativo hardcodeado, no derivado de contenido real indexado; al hacer clic devuelve 0 resultados reales (confirmado contra captura de la propia sesión de Luis). Pendiente decidir: corregir el ejemplo, quitarlo, o dejarlo documentado como conocido.
- Modo determinístico con metas que contienen `?` sigue fallando con `CORE_INVALID_IDENTIFIER` si el LLM no está configurado — bug en `packages/sdk` (`planExecuteAndRemember`), fuera de alcance de este hotfix, documentado en el informe del hotfix §7.
- Sin edición/eliminación de marca.
- Historial de chat y timeline de actividad viven en memoria del proceso Web — se pierden si el servidor se reinicia (mismo comportamiento ya conocido desde P2.5, no una regresión nueva).
- Página "Configuración" sigue siendo un placeholder ("Próximamente").

**Bibliografía completa (histórico, no hace falta releer para entender el estado actual — esta entrada consolidada es la fuente de verdad):** [`WEB_UI_PHASE_3_IMPLEMENTATION.md`](./releases/WEB_UI_PHASE_3_IMPLEMENTATION.md), [`WEB_UI_PHASE_3D_B_IMPLEMENTATION.md`](./releases/WEB_UI_PHASE_3D_B_IMPLEMENTATION.md), [`WEB_UI_PHASE_3E_IMPLEMENTATION.md`](./releases/WEB_UI_PHASE_3E_IMPLEMENTATION.md), [`WEB_UI_PHASE_3F_ACTIVITY_DESIGN.md`](./releases/WEB_UI_PHASE_3F_ACTIVITY_DESIGN.md), [`WEB_UI_PHASE_3F_IMPLEMENTATION.md`](./releases/WEB_UI_PHASE_3F_IMPLEMENTATION.md), [`WEB_UI_PHASE_3G2_IMPLEMENTATION.md`](./releases/WEB_UI_PHASE_3G2_IMPLEMENTATION.md), [`WEB_UI_WORLD_CLASS_FINAL_AUDIT.md`](./releases/WEB_UI_WORLD_CLASS_FINAL_AUDIT.md), [`WEB_UI_PHASE_3H_AUDIT.md`](./releases/WEB_UI_PHASE_3H_AUDIT.md), [`WEB_UI_PHASE_3H_IMPLEMENTATION.md`](./releases/WEB_UI_PHASE_3H_IMPLEMENTATION.md), [`WEB_UI_PHASE_3I_ACCESSIBILITY_RESPONSIVE_AUDIT.md`](./releases/WEB_UI_PHASE_3I_ACCESSIBILITY_RESPONSIVE_AUDIT.md), [`WEB_UI_PHASE_3I_ACCESSIBILITY_RESPONSIVE_IMPLEMENTATION.md`](./releases/WEB_UI_PHASE_3I_ACCESSIBILITY_RESPONSIVE_IMPLEMENTATION.md), [`WEB_UI_NAVIGATION_RENDER_LOOP_FIX.md`](./releases/WEB_UI_NAVIGATION_RENDER_LOOP_FIX.md), [`WEB_UI_THEME_SWITCH_AND_LIGHT_LOGO_FIX.md`](./releases/WEB_UI_THEME_SWITCH_AND_LIGHT_LOGO_FIX.md), [`WEB_UI_CHAT_ENV_AND_ERROR_DISPLAY_FIX.md`](./releases/WEB_UI_CHAT_ENV_AND_ERROR_DISPLAY_FIX.md), [`WEB_UI_KNOWLEDGE_UPLOAD_IMPLEMENTATION.md`](./releases/WEB_UI_KNOWLEDGE_UPLOAD_IMPLEMENTATION.md).

**Verificación de cierre (independiente, no autoreportada):** ejecutada por Claude en esta sesión el 2026-08-10, sobre una copia aislada del repo en el commit real `aeea5f5` (no una versión anterior ni el self-report de Cursor). Confirma: pipeline completo verde, boundary Kernel intacto, conteo de tests exacto, y un gap real (chip "Clientes VIP") encontrado por revisión cruzada contra evidencia visual del propio usuario, no por autoreporte del agente implementador.

---

## Accepted Technical Debt

Deuda técnica aceptada por auditoría independiente. No bloquea certificaciones de Sprint 11D ni 11E.2.

| ID | Título | Estado | Prioridad |
|----|--------|--------|-----------|
| **TD-11D-001** | StorageProvider contract still relies on optional listAll() through internal type casts. | **Accepted Technical Debt** | Resolve before first production StorageProvider implementation. |
| **TD-11E-001** | MemoryEngineSessionOrchestrator supports only one active session per engine instance. | **Accepted Technical Debt** | Resolve before any capability invokes MemoryEngine from parallel executions. |
| **TD-P2.2-001** | Chat LLM conversation history grows unbounded and is resent in full on every turn. | **Accepted Technical Debt** | Resolve before long-running production chat sessions (truncation/summary strategy). |

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

### TD-P2.2-001 — Chat LLM conversation history grows unbounded and is resent in full on every turn.

| Field | Value |
|-------|-------|
| **ID** | TD-P2.2-001 |
| **Title** | Chat LLM conversation history grows unbounded and is resent in full on every turn. |
| **Status** | Accepted Technical Debt |
| **Priority** | Resolve before long-running production chat sessions. |
| **Sprint** | P2.2 — Conversación |
| **Audit** | Design decision — non-blocking for P2.2 delivery |

**Description:**

In LLM chat mode, `ChatSessionState.history` accumulates every user/assistant/tool message for the session and is passed wholesale to `runToolLoop` on each new user message. There is no truncation, summarization, or token-budget-aware windowing.

**Impact:**

- Does not affect deterministic fallback mode.
- Does not affect `atlas ask` (single-shot, no session history).
- Increases token cost and latency as conversations lengthen.
- Does not block P2.2 certification or P2.3.

---

## Stub packages (Stage 2 — sin implementación)

Los siguientes paquetes permanecen en `0.0.0` (bootstrap):

`agent`, `context`, `context-planner`, `graph`, `ontology`, `plugin`, `prompt`, `publisher`, `search`, `validation`

> `@atlas/retrieval` salió de bootstrap con el pipeline MVP (ADR-0005 D8) en Sprint MVP-5.
> `@atlas/llm` salió de bootstrap con el adapter LLM + tool-calling en P2.1.

---

## Version policy

- **Kernel v0.1 line:** contratos públicos congelados. Breaking changes requieren major version.
- **Runtime Sprint 10D, Workflow 10E, Planning 10F:** congelados. Cambios requieren ADR.
- **Knowledge capability:** semver independiente bajo `@atlas/knowledge`; integración transparente vía `@atlas/sdk@0.3.0`.
- **Atlas product semver:** gobernada por este archivo, `ATLAS_ARCHITECTURE_MASTER.md` y `releases/ATLAS-RELEASE-001-KERNEL_v0.1.md`.
