---
id: ATLAS-RUNTIME-REVIEW-001
title: Runtime Implementation Review — Sprint 10 Preflight
version: 1.0.0
status: proposed
owner: Atlas Architecture Board
created: 2026-07-20
depends_on:
  - ATLAS-RUNTIME-001
  - ATLAS-RUNTIME-009
  - ATLAS-RUNTIME-100
  - ATLAS-012-REPOSITORY_GOVERNANCE
classification: internal
purpose: >
  Revisión arquitectónica previa a Sprint 10. Verifica suficiencia de
  especificaciones, mapea componentes, identifica inconsistencias y propone
  plan de implementación sin escribir código.
---

# ATLAS — Runtime Implementation Review

**Sprint:** 10 (preflight — sin implementación)  
**Paquete objetivo:** `@atlas/runtime`  
**Alcance autorizado:** In-Memory únicamente  
**Fecha:** 2026-07-20  
**Estado:** Propuesto — **requiere aprobación del owner antes de codificar**

> **Nota de ubicación:** Este documento fue solicitado como `Release/RUNTIME_IMPLEMENTATION_REVIEW.md`. Se publica en `releases/` conforme a `ATLAS-012-REPOSITORY_GOVERNANCE.md` (Layer 4 — Operations).

---

## 1. Resumen Ejecutivo

Las especificaciones en `spec/runtime/` (ATLAS-RUNTIME-001 … 009, 100) definen un **Runtime cognitivo completo**: pipeline de 12 etapas, máquinas de estado, eventos, workflows, tareas, agentes, observabilidad y API pública extensa.

El paquete `@atlas/runtime` **actual** (v0.1.0, Kernel congelado) implementa un **subconjunto mínimo**: ejecución in-memory de `Artifact[]` vía `ArtifactExecutor`, lifecycle DOM-009 de 10 estados, y dos eventos (`runtime.started`, `runtime.completed`) sobre `@atlas/events`.

**Veredicto:** las specs son **conceptualmente suficientes** para diseñar Sprint 10, pero **operacionalmente incompletas** para implementar sin decisiones arquitectónicas adicionales. Existen **inconsistencias materiales** entre:

- modelos de lifecycle (3 taxonomías distintas);
- ubicación de Workflow Engine / Agent Runtime (Runtime vs Intelligence);
- API pública actual vs ATLAS-RUNTIME-100;
- dependencias rotas (`ATLAS-ENGINE-001` inexistente);
- reglas del sprint («no cambiar APIs» vs «implementar Public API completa»).

**Recomendación:** **aprobar Sprint 10 condicionado** a una Fase 0 de resolución arquitectónica (ADR + delta spec) antes de escribir código. La implementación debe progresar en **capas in-memory con puertos hacia Intelligence**, sin modificar Compiler, Knowledge ni Intelligence packages.

**Riesgo principal:** intentar implementar el pipeline completo (001/005) en un solo sprint colapsará el paquete, romperá compatibilidad con SDK/CLI existentes, o violará la regla de no mezclar capas.

---

## 2. Estado de las especificaciones

### 2.1 Inventario leído (autoridad Sprint 10)

| ID | Documento | Status | Suficiencia |
|----|-----------|--------|-------------|
| ATLAS-RUNTIME-001 | Execution Model | approved | ✅ Conceptual — ⚠️ no baja a tipos/contratos |
| ATLAS-RUNTIME-002 | Event Model | approved | ✅ Filosofía clara — ⚠️ sin catálogo tipado ni mapping a `@atlas/events` |
| ATLAS-RUNTIME-003 | State Model | approved | ✅ Principios — ⚠️ sin enum unificado ni FSM por entidad |
| ATLAS-RUNTIME-004 | Task Model | approved | ✅ Modelo claro — ⚠️ sin interfaces Task/Workflow |
| ATLAS-RUNTIME-005 | Pipeline | approved | ✅ Etapas definidas — ⚠️ sin contratos stage I/O |
| ATLAS-RUNTIME-006 | Lifecycle | approved | ⚠️ Lifecycle distinto al DOM-009 y al 001 |
| ATLAS-RUNTIME-007 | Observability | approved | ✅ Pilares definidos — ⚠️ sin API concreta |
| ATLAS-RUNTIME-008 | Error Model | approved | ✅ Categorías/severidad — ⚠️ sin tipos ErrorCode |
| ATLAS-RUNTIME-009 | Runtime Architecture | approved | ✅ Mapa de componentes — ⚠️ solapa Intelligence |
| ATLAS-RUNTIME-100 | Public API | approved | ⚠️ Solo grupos conceptuales — sin firmas TypeScript |

### 2.2 Autoridad arquitectónica complementaria

| Área | Documentos relevantes | Observación |
|------|----------------------|-------------|
| `spec/architecture/` | ATLAS-ARCH-001, 003 | Runtime como capa entre Intelligence y SDK — alineado |
| `spec/engine/` | ATLAS-100, ATLAS-107 | ATLAS-107 (Agent Runtime engine) **draft** — pre-Sprint 10 |
| `spec/domain/` | ATLAS-DOM-009 | Lifecycle **distinto** al RUNTIME-006 — base del código actual |
| `spec/sdk/` | ATLAS-202, ATLAS-204 | SDK usa `atlas.runtime.execute({ artifacts })` — no RUNTIME-100 |
| `spec/capabilities/knowledge/` | KNOWLEDGE-001…008 | Projection ya implementada — Runtime consume vía Compiler/SDK |
| `spec/intelligence/` | INTELLIGENCE-011, CONTRACT-005/006/007 | Workflow/Agent como **contratos Intelligence** — tensión con RUNTIME-009 |

### 2.3 Dependencias rotas en frontmatter

Varios docs runtime declaran `depends_on: ATLAS-ENGINE-001`, pero **no existe** documento con ese ID. El equivalente real es `spec/engine/ATLAS-100-ENGINE.md` (`id: ATLAS-100`).

**Impacto:** trazabilidad rota; implementadores no tienen ancla engine única.

### 2.4 Cobertura vs implementación actual

| Capacidad spec | `@atlas/runtime` v0.1.0 |
|----------------|-------------------------|
| Execution Unit | ❌ Usa `ExecutionContext` + session |
| Pipeline 12 etapas | ❌ Solo loop de artifacts |
| Workflow Engine | ❌ |
| Task Scheduler | ❌ |
| Agent Runtime | ❌ |
| State Manager (multi-entidad) | ❌ Solo lifecycle de sesión |
| Event Dispatcher (runtime interno) | ❌ Publica 2 eventos vía `@atlas/events` |
| Error Manager | ❌ Errores inline en outputs |
| Diagnostics / Observability | ❌ |
| Public API (RUNTIME-100) | ❌ Solo `Runtime.execute()` |

**Conclusión:** Sprint 10 no es una extensión incremental — es una **re-arquitectura interna** del paquete, con tensión contra «Kernel congelado» y «no cambiar APIs».

---

## 3. Mapa completo de componentes

### 3.1 Componentes exigidos por Sprint 10 (autorización)

| # | Componente solicitado | Spec primaria | Responsabilidad |
|---|----------------------|---------------|-----------------|
| 1 | **Execution Engine** | RUNTIME-001, 009 | Punto de entrada; administra Execution Units |
| 2 | **Pipeline Coordinator** | RUNTIME-005 | Orquesta etapas deterministas; valida transiciones |
| 3 | **Lifecycle Manager** | RUNTIME-006 | Created → … → Archived por entidad |
| 4 | **State Manager** | RUNTIME-003 | FSM por Execution/Workflow/Task/Agent session |
| 5 | **Workflow Engine** | RUNTIME-009, INT-CONTRACT-006 | Plan → workflow dinámico; dependencias de tareas |
| 6 | **Task Scheduler** | RUNTIME-004, 009 | Cola, asignación, orden por dependencias |
| 7 | **Runtime Event Dispatcher** | RUNTIME-002 | Publicación inmutable; correlación/causation |
| 8 | **Runtime Error Manager** | RUNTIME-008 | Clasificación, severidad, propagación, aislamiento |
| 9 | **Runtime Diagnostics** | RUNTIME-007 | Métricas, trazas, diagnósticos (in-memory) |
| 10 | **Runtime Public API** | RUNTIME-100 | Execution, Lifecycle, Task, Workflow, Event, Diagnostics APIs |

### 3.2 Componente en RUNTIME-009 no listado explícitamente en Sprint 10

| Componente | Spec | Nota |
|------------|------|------|
| **Agent Runtime** | RUNTIME-009, INT-CONTRACT-007, RUNTIME-004 §9 | **Obligatorio** — Task Model exige que Agent Runtime ejecute tareas |

**Recomendación:** incluir **Agent Runtime (in-memory)** como componente #11 implícito; omitirlo rompe RUNTIME-004.

### 3.3 Mapa de interacción (in-memory, objetivo Sprint 10)

```text
                    ┌─────────────────────────────────────┐
                    │         Runtime Public API          │
                    │  (RUNTIME-100 — fachada estable)    │
                    └─────────────────┬───────────────────┘
                                      │
                    ┌─────────────────▼───────────────────┐
                    │         Execution Engine            │
                    └─────────────────┬───────────────────┘
                                      │
          ┌───────────────────────────▼───────────────────────────┐
          │              Pipeline Coordinator                      │
          │  Intent → … → Result Collection → Finalization         │
          └───┬─────────┬─────────┬─────────┬─────────┬───────────┘
              │         │         │         │         │
    ┌─────────▼──┐ ┌────▼────┐ ┌─▼──────────┐ ┌──────▼─────┐
    │ Lifecycle  │ │ State   │ │ Workflow   │ │ Task       │
    │ Manager    │ │ Manager │ │ Engine     │ │ Scheduler  │
    └─────────┬──┘ └────┬────┘ └─────┬──────┘ └──────┬─────┘
              │         │            │                │
              │         │     ┌──────▼──────┐  ┌───────▼──────┐
              │         │     │ Agent       │  │ Intelligence │
              │         │     │ Runtime     │  │ Ports        │
              │         │     │ (in-memory) │  │ (stubs)      │
              │         │     └─────────────┘  └──────────────┘
              │         │
    ┌─────────▼─────────▼──────────────────────────────────────┐
    │     Runtime Event Dispatcher  ←→  @atlas/events (bridge) │
    │     Runtime Error Manager                                │
    │     Runtime Diagnostics (Observability Layer)            │
    └──────────────────────────────────────────────────────────┘
              │
    ┌─────────▼─────────┐
    │ In-Memory Stores  │  (executions, states, events, errors, traces)
    └───────────────────┘
```

### 3.4 Puertos externos (no implementar lógica — solo consumir)

| Puerto | Contrato | Paquete futuro | Sprint 10 |
|--------|----------|----------------|-----------|
| Compiler | `Compiler.compile()` | `@atlas/compiler` | ✅ Invocar — no modificar |
| Knowledge projection | vía SDK/`KnowledgeProjectionAdapter` | `@atlas/knowledge` | ✅ Consumir — no modificar |
| Context Builder | INT-CONTRACT-001 | `@atlas/intelligence` (futuro) | 🔶 Stub in-memory |
| Reasoning Engine | INT-CONTRACT-004 | futuro | 🔶 Stub |
| Planning Engine | INT-CONTRACT-005 | futuro | 🔶 Stub |
| Workflow Engine (contrato) | INT-CONTRACT-006 | ambiguo | 🔶 Stub mínimo en runtime |
| Agent Runtime (contrato) | INT-CONTRACT-007 | ambiguo | 🔶 Stub mínimo en runtime |

---

## 4. Dependencias

### 4.1 Grafo permitido (Sprint 10)

```text
@atlas/core
    ↓
@atlas/events
    ↓
@atlas/compiler          (tipos Artifact — compatibilidad)
    ↓
@atlas/runtime           (Sprint 10 — implementación nueva interna)
    ↓
@atlas/sdk               (RuntimeModule — adaptación mínima si API evoluciona)
```

### 4.2 Dependencias explícitamente prohibidas

| Dependencia | Razón |
|-------------|-------|
| `@atlas/knowledge` directa en runtime | Projection vive en knowledge; SDK ya integra |
| `@atlas/intelligence` (cuando exista package) | Sprint: no modificar Intelligence |
| Networking, DB, cloud SDKs | Fuera de alcance in-memory |
| Reflection / service locator | Reglas absolutas del sprint |

### 4.3 Dependencia actual a revisar

`@atlas/runtime` hoy depende de `@atlas/compiler` solo por tipo `Artifact`. El modelo RUNTIME-001 introduce **Execution Unit** e **Intent** — decidir si:

- **A)** mantener path `execute({ artifacts })` como proyección de Execution Unit (compatibilidad), o
- **B)** nueva API paralela sin romper la existente.

---

## 5. Orden recomendado de implementación

> Solo aplicable **después** de aprobar este review y resolver preguntas abiertas (§9).

### Fase 0 — Pre-implementación (0.5 sprint, solo docs/ADR)

1. ADR: resolución lifecycle unificado (DOM-009 vs RUNTIME-006 vs RUNTIME-001).
2. ADR: Workflow/Agent — runtime coordinator vs intelligence provider.
3. ADR: estrategia API v0.1 → v0.2 (compatibilidad `execute(artifacts)`).
4. Corregir `depends_on: ATLAS-ENGINE-001` → `ATLAS-100` en specs runtime.
5. Delta spec: `ATLAS-RUNTIME-101-IN_MEMORY_IMPLEMENTATION.md` (contratos TypeScript mínimos).

### Fase 1 — Fundación in-memory (Sprint 10.1)

| Orden | Componente | Entregable |
|-------|------------|------------|
| 1 | State Manager | FSM genérico + stores in-memory |
| 2 | Runtime Error Manager | ErrorRecord + severidad + aislamiento |
| 3 | Runtime Event Dispatcher | Bus interno + bridge opcional a `@atlas/events` |
| 4 | Runtime Diagnostics | Trace span in-memory, métricas contadores |
| 5 | Lifecycle Manager | Orquestación Created→Archived sobre State Manager |

### Fase 2 — Coordinación (Sprint 10.2)

| Orden | Componente | Entregable |
|-------|------------|------------|
| 6 | Pipeline Coordinator | Stage registry + transiciones + invariantes RUNTIME-005 |
| 7 | Execution Engine | Execution Unit + entrada Intent/artifacts |
| 8 | Intelligence Ports (stubs) | No-op providers para etapas Context→Planning |

### Fase 3 — Ejecución estructurada (Sprint 10.3)

| Orden | Componente | Entregable |
|-------|------------|------------|
| 9 | Workflow Engine (in-memory) | Interpreta Execution Plan stub → workflow graph |
| 10 | Task Scheduler | Cola + dependencias + estados Task |
| 11 | Agent Runtime (in-memory) | Ejecutor de tareas determinista (no LLM) |

### Fase 4 — API pública (Sprint 10.4)

| Orden | Componente | Entregable |
|-------|------------|------------|
| 12 | Runtime Public API | Facade RUNTIME-100 sin filtrar internals |
| 13 | Compat layer | `Runtime.execute({ artifacts })` → Execution Unit path |
| 14 | Tests + demo | Cobertura FSM, pipeline, eventos, errores |

---

## 6. Posibles inconsistencias

### I1 — Tres modelos de lifecycle coexisten

| Fuente | Estados |
|--------|---------|
| `packages/runtime` (DOM-009) | create, initialize, load, start, execute, monitor, stop, dispose, failed, cancelled |
| RUNTIME-006 | Created, Initialized, Prepared, Running, Waiting, Resumed, Completing, Completed, Archived |
| RUNTIME-001 §7 | Created, Compiled, ContextBuilt, Reasoned, Planned, WorkflowStarted, Executing, Completed, Archived |

**Severidad:** 🔴 Bloqueante para implementación sin ADR.

### I2 — Workflow Engine: ¿Runtime o Intelligence?

- RUNTIME-009 lista Workflow Engine **dentro** del Runtime.
- INT-CONTRACT-006 define Workflow Engine como contrato **Intelligence**.
- Sprint 10 lista Workflow Engine en `@atlas/runtime`.

**Resolución propuesta:** Runtime implementa **WorkflowCoordinator** que cumple el contrato INT-006 como **implementación in-memory por defecto**, intercambiable cuando exista `@atlas/intelligence`.

### I3 — Agent Runtime duplicado semánticamente

- ATLAS-107 (engine, draft) describe Agent Runtime amplio (LLM, tools).
- INT-CONTRACT-007 define contrato acotado.
- RUNTIME-009 lo incluye en Runtime.

**Resolución propuesta:** Sprint 10 implementa **AgentRuntimePort** mínimo in-memory; no implementar ATLAS-107 completo.

### I4 — Dos sistemas de eventos

| Sistema | Eventos |
|---------|---------|
| `@atlas/events` (implementado) | `runtime.started`, `runtime.completed` (SDK-204) |
| RUNTIME-002 | ExecutionCreated, ContextBuilt, TaskCompleted, … |

**Severidad:** 🟡 Requiere **Event Bridge** documentado — no reemplazar eventos SDK existentes.

### I5 — API pública: regla «no cambiar APIs» vs RUNTIME-100

| Actual | RUNTIME-100 |
|--------|-------------|
| `Runtime.execute(ExecuteParams)` | Execution, Lifecycle, Task, Workflow, Event, Diagnostics APIs |

**Severidad:** 🔴 Requiere ADR de versionado. Propuesta: **additive only** en v0.2.0; `execute()` permanece como shortcut de compatibilidad.

### I6 — Kernel congelado vs re-arquitectura total

`VERSION.md` declara Kernel v0.1 **Frozen**. Sprint 10 reemplaza ~90% del interior de `@atlas/runtime`.

**Resolución propuesta:** tratar Sprint 10 como **evolución minor** (`@atlas/runtime@0.2.0`) con compatibilidad backward; actualizar VERSION.md y ADR de congelamiento acotado al contrato público estable.

### I7 — Pipeline incluye Compilation

RUNTIME-005 etapa «Compilation» implica invocar `@atlas/compiler`. Correcto si Runtime **coordina** sin modificar Compiler. Debe quedar explícito que Compilation stage = delegación, no reimplementación.

### I8 — Specs sin contratos TypeScript

Ningún doc RUNTIME-* define interfaces, tipos, ni firmas. ATLAS-RUNTIME-100 es 100% conceptual.

**Severidad:** 🟡 Bloqueante para codificar sin delta spec o ADR de mapping a `@atlas/core` primitives.

### I9 — ATLAS-ENGINE-001 inexistente

Frontmatter roto en RUNTIME-001, RUNTIME-002.

**Severidad:** 🟢 Fácil de corregir en docs pre-Sprint 10.

---

## 7. Riesgos

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|----|--------|--------------|---------|------------|
| R1 | Romper SDK/CLI/demos existentes al cambiar API | Alta | Alto | Compat layer + tests de regresión Sprint 5 |
| R2 | Scope creep — implementar Intelligence dentro de runtime | Media | Alto | Stubs + ports; prohibición explícita en ADR |
| R3 | Lifecycle inconsistente entre componentes | Alta | Alto | ADR unificador + single State Manager |
| R4 | Event explosion — duplicar `@atlas/events` | Media | Medio | Event Bridge; mapping documentado |
| R5 | Sprint único insuficiente para 11 componentes | Alta | Alto | Dividir en 10.1–10.4 (§5) |
| R6 | Tests imposibles sin contratos concretos | Alta | Medio | Delta spec ATLAS-RUNTIME-101 |
| R7 | Violación «no mezclar capas» al importar knowledge | Baja | Alto | Solo vía SDK/compiler; runtime no importa knowledge |
| R8 | Confusión Workflow Engine ownership | Media | Alto | ADR + naming `WorkflowCoordinator` |

---

## 8. Supuestos necesarios

Para que Sprint 10 sea implementable **sin** modificar Compiler, Knowledge ni Intelligence packages:

| # | Supuesto |
|---|----------|
| A1 | Sprint 10 **puede** bump `@atlas/runtime` a **0.2.0** con API aditiva. |
| A2 | `Runtime.execute({ artifacts })` **permanece** como entry point de compatibilidad Kernel v0.1. |
| A3 | Etapas Context, Reasoning, Planning usan **stubs deterministas in-memory** que producen outputs mínimos válidos para el pipeline. |
| A4 | Workflow Engine in-memory acepta **Execution Plan stub** generado por Planning stub — no requiere `@atlas/intelligence` package. |
| A5 | Agent Runtime in-memory ejecuta tareas como **funciones registradas** (registry pattern), no agentes LLM. |
| A6 | `@atlas/events` permanece bus externo; Runtime Event Dispatcher es capa interna + bridge. |
| A7 | No persistencia: todos los stores son `Map` in-memory desechables al finalizar ejecución. |
| A8 | Suspensión/resume (RUNTIME-006 §8) puede ser **no-op o mínima** en v0.2.0 in-memory si se documenta como limitación. |
| A9 | Owner aprueba ADR lifecycle + ADR API antes de Fase 1. |

---

## 9. Preguntas abiertas

Requieren respuesta del **Architecture Board / owner** antes de codificar:

| # | Pregunta |
|---|----------|
| Q1 | ¿Cuál es el **lifecycle canónico** — DOM-009 (código actual), RUNTIME-006, o RUNTIME-001 progression? |
| Q2 | ¿Sprint 10 debe **reemplazar** o **convivir** con el modelo Artifact/Executor actual? |
| Q3 | ¿`@atlas/runtime@0.2.0` rompe el «Kernel congelado» o el freeze aplica solo a `@atlas/core` + compiler contracts? |
| Q4 | ¿Workflow Engine y Agent Runtime viven **dentro** de `packages/runtime` in-memory, o solo ports hacia futuro `@atlas/intelligence`? |
| Q5 | ¿RUNTIME-002 eventos reemplazan, extienden, o coexisten con `RuntimeStartedEvent`/`RuntimeCompletedEvent`? |
| Q6 | ¿El pipeline completo (12 etapas) es obligatorio en Sprint 10, o basta **pipeline skeleton** con stubs + 2 etapas reales (Compilation + Agent Execution)? |
| Q7 | ¿Se autoriza crear `spec/runtime/ATLAS-RUNTIME-101-IN_MEMORY_IMPLEMENTATION.md` como delta spec con contratos TypeScript? |
| Q8 | ¿SDK debe exponer RUNTIME-100 APIs en Sprint 10, o solo `@atlas/runtime` internamente? |
| Q9 | ¿Corregir frontmatter `ATLAS-ENGINE-001` → `ATLAS-100` como parte de pre-Sprint 10 doc fix? |

---

## 10. Propuesta detallada de Sprint 10

### 10.1 Objetivo refinado

Implementar en `@atlas/runtime` la **primera implementación in-memory oficial** del Runtime especificado en ATLAS-RUNTIME-001…009, exponiendo la API de ATLAS-RUNTIME-100 **de forma aditiva**, preservando compatibilidad con `Runtime.execute({ artifacts })` y eventos SDK existentes.

### 10.2 Fuera de alcance (confirmado)

- Persistencia, cloud, distribuido, networking
- Modificar `@atlas/compiler`, `@atlas/knowledge`, `@atlas/intelligence`
- LLM providers, Memory, Retrieval reales
- Cambios breaking en `@atlas/core`
- SDK surface completa RUNTIME-100 (salvo decisión Q8)

### 10.3 Estructura de paquete propuesta (sin codificar aún)

```text
packages/runtime/src/
├── api/                    # RUNTIME-100 public facade
├── engine/                 # Execution Engine
├── pipeline/               # Pipeline Coordinator + stages
├── lifecycle/              # Lifecycle Manager
├── state/                  # State Manager + FSM
├── workflow/               # Workflow Engine (in-memory)
├── tasks/                  # Task Scheduler + Task model
├── agents/                 # Agent Runtime (in-memory)
├── events/                 # Runtime Event Dispatcher + bridge
├── errors/                 # Runtime Error Manager
├── diagnostics/            # Observability in-memory
├── ports/                  # Intelligence contract ports (interfaces only)
├── compat/                 # execute(artifacts) legacy path
├── contracts/              # (existente — extender)
├── context/                # (existente — adaptar)
└── index.ts
```

### 10.4 Criterios de aceptación Sprint 10

| Criterio | Verificación |
|----------|--------------|
| 10 componentes solicitados + Agent Runtime | Unit tests por componente |
| In-memory only | Sin imports de FS/network/DB |
| Pipeline determinista | Mismas entradas → mismos estados/eventos |
| Eventos inmutables | RUNTIME-002 properties |
| FSM rechaza transiciones inválidas | RUNTIME-003 §9 |
| Errores clasificados y propagados | RUNTIME-008 |
| Trazas reconstructibles | RUNTIME-007 |
| `pnpm test` verde en `@atlas/runtime` | CI |
| Demos SDK existentes siguen pasando | Regresión Sprint 5/9 |
| Cobertura ≥ 85% | Vitest coverage gate |
| Sin deps prohibidas | Lint dependency rule |

### 10.5 Entregables documentales (pre-código — Fase 0)

| Entregable | Tipo |
|------------|------|
| ADR-0002 — Runtime Lifecycle Unification | `adr/` |
| ADR-0003 — Runtime API Evolution v0.2 | `adr/` |
| ADR-0004 — Workflow/Agent Ownership | `adr/` |
| ATLAS-RUNTIME-101 — In-Memory Implementation Contract | `spec/runtime/` |
| Sprint 10 Implementation Plan | `releases/` |

### 10.6 Estimación

| Fase | Duración estimada |
|------|-------------------|
| Fase 0 (ADRs + delta spec) | 2–3 días |
| Fase 1 (fundación) | 1 sprint parcial |
| Fase 2 (pipeline + engine) | 1 sprint parcial |
| Fase 3 (workflow/tasks/agents) | 1 sprint parcial |
| Fase 4 (API + compat + demo) | 1 sprint parcial |

**Total realista:** 1 sprint completo **solo** si se reduce alcance a pipeline skeleton + stubs (Q6). De lo contrario: **2 sprints** (10 + 10.1).

### 10.7 Decisión solicitada al owner

| Opción | Descripción |
|--------|-------------|
| **A — Aprobar condicionado** | Proceder Fase 0 (ADRs + RUNTIME-101); código tras respuestas Q1–Q9 |
| **B — Aprobar scope reducido** | Sprint 10 = Fase 1 + compat layer; pipeline completo en Sprint 11 |
| **C — Rechazar / replantear** | Resolver inconsistencias lifecycle y API antes de cualquier sprint |

**Recomendación del revisor:** **Opción A**.

---

## Apéndice A — Comparativa implementación actual vs objetivo

| Aspecto | v0.1.0 (hoy) | Sprint 10 (objetivo) |
|---------|--------------|----------------------|
| Entrada | `Artifact[]` | Execution Unit / Intent (+ compat artifacts) |
| Pipeline | N/A | 12 etapas coordinadas |
| Componentes | 3 (engine, registry, context) | 11+ |
| Eventos | 2 tipos SDK | Catálogo RUNTIME-002 + bridge |
| Lifecycle | 10 estados DOM-009 | Unificado (TBD ADR) |
| Tests | ~runtime.test.ts | Suite por componente + integración |

---

## Apéndice B — Referencias

- `spec/runtime/ATLAS-RUNTIME-001` … `ATLAS-RUNTIME-009`, `ATLAS-RUNTIME-100`
- `spec/intelligence/ATLAS-INTELLIGENCE-011`, `CONTRACT-005`, `006`, `007`
- `spec/domain/ATLAS-DOM-009-RUNTIME_DOMAIN.md`
- `spec/sdk/ATLAS-202-SDK_TYPESCRIPT.md`, `ATLAS-204-SDK_EVENTS.md`
- `packages/runtime/src/` (implementación v0.1.0)
- `releases/SPRINT9_1_DOCUMENTATION_ALIGNMENT_REPORT.md`
- `adr/ADR-0001-DOCUMENT_ID_NAMESPACE.md`

---

**Estado:** ⏸️ **PAUSA ACTIVA — PROHIBIDO ESCRIBIR CÓDIGO HASTA APROBACIÓN DEL OWNER**

*Documento generado como parte del preflight de Sprint 10. No implica implementación.*
