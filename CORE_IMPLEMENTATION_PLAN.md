---
id: ATLAS-CORE-001
title: Core Implementation Plan
version: 1.1.0
status: historical-completed
phase: 2
sprint: 1
created: 2026-07-18
author: Lead Software Engineer
audience: Owner / Software Engineer
superseded_by:
  - Releases/ATLAS-RELEASE-001-KERNEL_v0.1.md
  - packages/core/
purpose: >
  Documento histórico — autorización original para Sprint 1 (@atlas/core).
  La implementación fue completada; la Fase Fundacional está cerrada.
prerequisite:
  - Phase 0 APROBADA
  - Decisiones arquitectónicas owner 18/07/2026
related:
  - IMPLEMENTATION_READINESS_REPORT.md
  - Architecture/ATLAS-ARCH-002 — PACKAGE_ARCHITECTURE.md
  - Engine/ATLAS-100-ENGINE.md
  - Domain/ATLAS-DOM-000-DOMAIN_REVIEW.md
---

# CORE_IMPLEMENTATION_PLAN.md

> **DOCUMENTO HISTÓRICO** — Pertenece al historial de la Fase Fundacional.
>
> **Estado actual (18/07/2026):** Sprint 1 **COMPLETADO**. `@atlas/core` implementado en `packages/core/`.
> Fase Fundacional **COMPLETADA**. Ver [`VERSION.md`](./VERSION.md) y [`Releases/ATLAS-RELEASE-001-KERNEL_v0.1.md`](./Releases/ATLAS-RELEASE-001-KERNEL_v0.1.md).

---

## Sprint 1 — Plan de implementación de `@atlas/core`

**Estado:** ✅ **COMPLETADO** (histórico — autorización cumplida)  
**Alcance:** Únicamente `@atlas/core`  
**Regla original:** Este documento fue la autorización para escribir código en Sprint 1.

---

## 1. ¿Qué es exactamente `@atlas/core`?

`@atlas/core` es el **paquete fundacional del monorepo Atlas**.

Absorbe la responsabilidad que ARCH-002 describe como **Foundation Packages** (`shared`, `types`, `errors`), consolidada en un único paquete según decisión oficial del owner:

> No existirán `@atlas/shared`, `@atlas/types` ni `@atlas/errors`. Todo ese contenido pertenece a `@atlas/core`.

### 1.1 Definición operativa

| Propiedad | Valor |
|-----------|-------|
| Nombre npm | `@atlas/core` |
| Grupo | **Kernel** |
| Posición en el grafo | Raíz — **no depende de ningún paquete `@atlas/*`** |
| Responsabilidad | Lenguaje compartido del ecosistema: tipos base, errores uniformes y contratos I/O que todos los módulos Engine y Domain deben respetar |
| Naturaleza | Librería TypeScript pura de contratos y primitivas — **sin lógica de dominio, sin infraestructura, sin ejecución** |

### 1.2 Qué representa conceptualmente

`@atlas/core` implementa la capa de **primitivas transversales** que conectan:

```text
Foundation (principios)
        │
        ▼
@atlas/core (tipos · errores · contratos)
        │
        ▼
Kernel · Domain Engines · Infrastructure · Interfaces
```

Traduce a código TypeScript los contratos definidos en:

- **ATLAS-100 §12** — Input Contract, Output Contract, Error Contract
- **ATLAS-DOM-000 §11** — Value Objects transversales
- **ARCH-002 §7–11** — Layout, API pública, encapsulamiento `internal/`

### 1.3 Qué NO es `@atlas/core`

| `@atlas/core` NO es | Pertenece a |
|---------------------|-------------|
| Compiler | `@atlas/compiler` |
| Runtime | `@atlas/runtime` |
| Event bus / dispatcher | `@atlas/events` |
| Knowledge, Context, Agent, Workflow | Paquetes Domain Engines |
| Graph, Ontology, Search, Validation | Paquetes Infrastructure |
| CLI, SDK clients | Paquetes Interfaces |
| Implementación de Engine modules | Paquetes Engine correspondientes |

---

## 2. ¿Qué exporta?

La API pública de `@atlas/core` se exporta **únicamente** desde `src/index.ts`.

### 2.1 Módulo `types/` — Value Objects transversales

Derivado de **ATLAS-DOM-000 §11** y uso transversal en Domain docs.

| Export | Tipo | Descripción spec |
|--------|------|------------------|
| `Identifier` | Value Object | Identidad estable de entidades — DOM-000 |
| `Version` | Value Object | Evolución de entidades; Semantic Versioning — Glossary §Version, DOM-000 |
| `Metadata` | Value Object | Metadatos asociados a entidades — DOM-000 |
| `Namespace` | Value Object | Organización lógica de entidades — DOM-000, DOM-002 §16 |

**Reglas de implementación:**

- Todos SHALL ser **inmutables** (DOM-000 §11).
- `Version` SHALL aceptar formato `MAJOR.MINOR.PATCH` (Glossary §Version, ARCH-002 §13).
- No incluir Value Objects de dominio específico (`ContextVersion`, `AgentVersion`, etc.) — esos pertenecen a sus paquetes Domain.

### 2.2 Módulo `errors/` — Modelo uniforme de errores

Derivado de **ATLAS-100 §12 Error Contract**.

| Export | Tipo | Campos obligatorios (spec) |
|--------|------|----------------------------|
| `AtlasError` | Interface / class | `code`, `message`, `severity`, `module`, `timestamp`, `trace_id` |
| `ErrorSeverity` | Type union | Valores mínimos derivados de spec: al menos `'warning'` (SDK-205 §11 filtering). Resto como `string` branded o union extensible documentada |
| `createAtlasError()` | Factory | Construcción tipada sin texto libre (ATLAS-100: "Los errores nunca deberán devolverse como texto libre") |
| `isAtlasError()` | Type guard | Validación en runtime para interoperabilidad |

**Reglas de implementación:**

- Todo error del ecosistema Atlas SHOULD ser representable como `AtlasError`.
- `code` SHALL ser estable y machine-readable.
- `trace_id` SHALL ser correlacionable (SDK-205, ATLAS-100).
- No incluir códigos de error de dominio específico (`KNOWLEDGE_NOT_FOUND`, etc.) — esos se definen en paquetes consumidores extendiendo el contrato base.

### 2.3 Módulo `contracts/` — Contratos I/O del Engine

Derivado de **ATLAS-100 §12** y **ATLAS-100 §8** (toda interfaz define: entrada, salida, errores, eventos, métricas).

| Export | Tipo | Campos (spec ATLAS-100) |
|--------|------|-------------------------|
| `EngineInput` | Interface | `context`, `request`, `configuration`, `metadata` |
| `EngineOutput` | Interface | `status`, `result`, `events`, `metrics`, `errors` |
| `EngineContext` | Interface | Sub-estructura de `context` — opaco en core; extensible por consumidores |
| `EngineRequest` | Interface | Sub-estructura de `request` — opaca en core |
| `EngineConfiguration` | Interface | Sub-estructura de `configuration` — opaca en core |
| `EngineMetadata` | Interface | Sub-estructura de `metadata` — incluye campos de trazabilidad |
| `ExecutionStatus` | Type union | Valores base: `'pending' \| 'running' \| 'completed' \| 'failed'` — derivados del lifecycle ATLAS-100 §10 |
| `EngineEvent` | Interface | Evento trazable — ATLAS-100 §13: nombre, timestamp, payload, trace_id |
| `EngineMetrics` | Interface | Métricas de ejecución — ATLAS-100 §12 Output Contract |
| `EngineModuleContract` | Interface | Formaliza ATLAS-100 §8: input + output + errors + events + metrics |

### 2.4 Módulo raíz — Utilidades transversales mínimas

| Export | Tipo | Justificación spec |
|--------|------|-------------------|
| `Result<T, E>` | Discriminated union | `{ ok: true; value: T } \| { ok: false; error: E }` — patrón derivado de Output Contract (`status` + `result` + `errors`); no inventa dominio |
| `AtlasTimestamp` | Type alias | `string` ISO 8601 — usado en Error Contract y REST SDK-205 |
| `TraceId` | Branded string | Correlación transversal — ATLAS-100, SDK-205 |

### 2.5 Mapa de exports públicos (`src/index.ts`)

```text
@atlas/core
├── types/
│   ├── Identifier
│   ├── Version
│   ├── Metadata
│   └── Namespace
├── errors/
│   ├── AtlasError
│   ├── ErrorSeverity
│   ├── createAtlasError
│   └── isAtlasError
├── contracts/
│   ├── EngineInput
│   ├── EngineOutput
│   ├── EngineContext
│   ├── EngineRequest
│   ├── EngineConfiguration
│   ├── EngineMetadata
│   ├── ExecutionStatus
│   ├── EngineEvent
│   ├── EngineMetrics
│   └── EngineModuleContract
└── (root)
    ├── Result
    ├── AtlasTimestamp
    └── TraceId
```

---

## 3. ¿Qué NO exporta?

### 3.1 Encapsulamiento obligatorio (ARCH-002 §11)

| Path | Visibilidad |
|------|-------------|
| `src/internal/**` | **Privado** — nunca exportado |
| Implementaciones de validación interna | **Privado** |
| Helpers de serialización internos | **Privado** |

### 3.2 Contenido explícitamente excluido

| Categoría | Ejemplos | Motivo |
|-----------|----------|--------|
| Entidades de dominio | `KnowledgeNode`, `Agent`, `Workflow`, `Prompt` | DOM-000 §10 — pertenecen a paquetes Domain Engines |
| Servicios de dominio | `ContextResolution`, `RetrievalRanking` | DOM-000 §13 |
| Eventos de dominio | `KnowledgeCreated`, `WorkflowExecuted` | DOM-000 §14 — pertenecen a paquetes consumidores |
| Engine modules | Knowledge Engine, Agent Runtime | ATLAS-100 §6 — paquetes separados |
| Compiler pipeline | Parsing, IR, compilation units | ARCH-003 — `@atlas/compiler` |
| Runtime execution | Lifecycle, orchestration | DOM-009 — `@atlas/runtime` |
| Event bus / pub-sub | Dispatcher, subscriptions | `@atlas/events` |
| Infraestructura | DB clients, HTTP, LLM adapters, file I/O | Violación de boundaries — ATLAS-005 |
| Status de dominio | `Draft`, `Approved`, `Deprecated` | DOM-001 §16 — específicos de Knowledge Domain |
| Clientes SDK | `Atlas.ts`, `CompilerClient` | SDK-202 — `@atlas/sdk` |
| CLI commands | Parsers, registry | SDK-201 — `@atlas/cli` |
| Graph / Ontology logic | Concepts, Relations, Taxonomies | DOM-002 — `@atlas/ontology`, `@atlas/graph` |

### 3.3 Regla de oro

> Si un concepto tiene un paquete propio en el monorepo, **no vive en `@atlas/core`**.

`@atlas/core` solo contiene lo que **todos** los paquetes necesitan compartir.

---

## 4. API pública

### 4.1 Contrato de consumo

Todo paquete `@atlas/*` (excepto core) **SHALL** importar primitivas exclusivamente desde:

```typescript
import {
  Identifier,
  Version,
  Metadata,
  Namespace,
  AtlasError,
  createAtlasError,
  EngineInput,
  EngineOutput,
  EngineEvent,
  Result,
  TraceId,
} from '@atlas/core';
```

### 4.2 Reglas de la API pública

| Regla | Fuente |
|-------|--------|
| Un único entry point: `src/index.ts` | ARCH-002 §11 |
| Subpath exports prohibidos en Sprint 1 | Simplicidad; un solo contrato público |
| Breaking changes → MAJOR semver | ARCH-002 §13 |
| Sin efectos secundarios en import | Pureza de primitivas |
| Sin dependencias `@atlas/*` | ARCH-002 §9 — core es raíz |
| Sin acceso a `internal/` desde otros paquetes | ARCH-002 §10–11 |

### 4.3 Estabilidad

| Nivel | Garantía Sprint 1 |
|-------|---------------------|
| `AtlasError` shape | **Congelado** — campos ATLAS-100 §12 |
| `EngineInput` / `EngineOutput` shape | **Congelado** — campos ATLAS-100 §12 |
| Value Objects base | **Congelado** — DOM-000 §11 |
| `ExecutionStatus` union | Extensible en MINOR |
| `ErrorSeverity` union | Extensible en MINOR |

---

## 5. Contratos que define

### 5.1 Error Contract (ATLAS-100 §12)

```yaml
# Contrato normativo — no modificar campos
code: string          # machine-readable, estable
message: string       # human-readable
severity: string      # ver ErrorSeverity
module: string        # módulo emisor (@atlas/<package>)
timestamp: string     # ISO 8601
trace_id: string      # correlación transversal
```

**Compliance:** Ningún módulo Engine SHALL devolver errores como texto libre.

### 5.2 Input Contract (ATLAS-100 §12)

```yaml
context: object       # EngineContext — resuelto por Context Engine
request: object       # EngineRequest — solicitud de operación
configuration: object # EngineConfiguration — config de ejecución
metadata: object      # EngineMetadata — trazabilidad, auditoría
```

### 5.3 Output Contract (ATLAS-100 §12)

```yaml
status: ExecutionStatus
result: unknown       # tipado por módulo consumidor
events: EngineEvent[]
metrics: EngineMetrics
errors: AtlasError[]
```

### 5.4 Event Contract (ATLAS-100 §13)

Todo evento emitido por un módulo Engine SHALL ser trazable:

```yaml
name: string          # ej: KnowledgeLoaded, ContextResolved (ATLAS-100 §13)
timestamp: AtlasTimestamp
trace_id: TraceId
payload: unknown      # tipado por módulo emisor
source: string        # módulo emisor
```

**Nota:** `@atlas/core` define la **forma** del evento. `@atlas/events` implementará el **bus** en Sprint posterior.

### 5.5 Module Contract (ATLAS-100 §8)

Todo módulo Engine SHALL exponer un contrato que incluya:

```typescript
interface EngineModuleContract<TInput, TOutput> {
  readonly module: string;
  execute(input: EngineInput & TInput): Promise<EngineOutput & { result: TOutput }>;
}
```

Adaptación TypeScript del mandato ATLAS-100 §8 sin añadir comportamiento.

### 5.6 Value Object Contract (DOM-000 §11)

Todo Value Object exportado por core SHALL:

- ser inmutable;
- compararse por valor (`equals()`);
- validarse en construcción (`createX()` factory que lanza `AtlasError` si inválido);
- serializarse a JSON de forma determinística.

---

## 6. Dependencias externas

### 6.1 Sprint 1 — dependencias runtime

| Dependencia | ¿Requerida? | Justificación |
|-------------|-------------|---------------|
| Ninguna runtime | **No** | Core es tipos + factories mínimas puras TypeScript |
| `@types/node` | **No** en runtime del paquete | Solo devDependency del monorepo root (ya instalada) |
| `zod` / validadores | **No** | No mandatado en spec; validación en factories propias |
| `uuid` | **No** | `TraceId` puede generarse con `crypto.randomUUID()` nativo Node 20 |

### 6.2 Dependencias del paquete `packages/core/package.json`

```json
{
  "dependencies": {},
  "devDependencies": {}
}
```

Todas las herramientas (TypeScript, Vitest, ESLint, tsup) permanecen en el **root del monorepo** — patrón Phase 0.

### 6.3 Dependencias internas Atlas

```text
@atlas/core → (ninguna)
```

**Prohibido en Sprint 1:** importar cualquier otro paquete `@atlas/*`.

---

## 7. Orden interno de implementación

Orden estricto dentro de Sprint 1. **Cada paso debe compilar, pasar tests y lint antes de continuar.**

### Paso 1 — Estructura y exports vacíos tipados

```text
src/
├── index.ts
├── types/
├── errors/
├── contracts/
└── internal/
tests/
```

- Configurar subpath interno sin exports públicos.
- Verificar pipeline verde con stubs tipados.

### Paso 2 — Value Objects (`types/`)

| Orden | Archivo | Contenido |
|-------|---------|-----------|
| 2.1 | `types/identifier.ts` | `Identifier` + `createIdentifier()` |
| 2.2 | `types/version.ts` | `Version` + semver validation |
| 2.3 | `types/metadata.ts` | `Metadata` (Record readonly) |
| 2.4 | `types/namespace.ts` | `Namespace` + validation |
| 2.5 | `types/index.ts` | Re-exports internos |
| 2.6 | `tests/types.test.ts` | Inmutabilidad, equals, invalid input |

### Paso 3 — Primitivas raíz

| Orden | Archivo | Contenido |
|-------|---------|-----------|
| 3.1 | `trace-id.ts` | `TraceId` branded type + `createTraceId()` |
| 3.2 | `timestamp.ts` | `AtlasTimestamp` + `now()` |
| 3.3 | `result.ts` | `Result<T, E>` discriminated union + helpers |
| 3.4 | `tests/primitives.test.ts` | |

### Paso 4 — Error model (`errors/`)

| Orden | Archivo | Contenido |
|-------|---------|-----------|
| 4.1 | `errors/severity.ts` | `ErrorSeverity` type |
| 4.2 | `errors/atlas-error.ts` | `AtlasError` interface |
| 4.3 | `errors/create-error.ts` | `createAtlasError()`, `isAtlasError()` |
| 4.4 | `tests/errors.test.ts` | Campos obligatorios, no texto libre |

### Paso 5 — Engine contracts (`contracts/`)

| Orden | Archivo | Contenido |
|-------|---------|-----------|
| 5.1 | `contracts/status.ts` | `ExecutionStatus` |
| 5.2 | `contracts/metadata.ts` | `EngineMetadata` |
| 5.3 | `contracts/context.ts` | `EngineContext` |
| 5.4 | `contracts/request.ts` | `EngineRequest` |
| 5.5 | `contracts/configuration.ts` | `EngineConfiguration` |
| 5.6 | `contracts/input.ts` | `EngineInput` compuesto |
| 5.7 | `contracts/event.ts` | `EngineEvent` |
| 5.8 | `contracts/metrics.ts` | `EngineMetrics` |
| 5.9 | `contracts/output.ts` | `EngineOutput` compuesto |
| 5.10 | `contracts/module-contract.ts` | `EngineModuleContract` |
| 5.11 | `tests/contracts.test.ts` | Shape compliance ATLAS-100 §12 |

### Paso 6 — API pública (`src/index.ts`)

- Exportar únicamente símbolos de Pasos 2–5.
- Verificar que `internal/` no aparece en `dist/index.d.ts`.

### Paso 7 — Documentación y compliance

| Tarea | Referencia |
|-------|------------|
| Actualizar `packages/core/README.md` | Lista completa de exports |
| Actualizar `packages/core/CHANGELOG.md` | `0.1.0` — Sprint 1 initial implementation |
| Verificar ARCH-002 compliance checklist | §7–11 |
| Ejecutar pipeline completo | `format:check lint typecheck build test` |

### Paso 8 — Gate de cierre Sprint 1

```text
□ Todos los exports documentados en README
□ Cero dependencias runtime
□ Cero imports @atlas/* externos
□ internal/ no exportado
□ Tests cubren Value Objects, Errors, Contracts
□ CI verde
□ Owner aprueba PR Sprint 1
```

---

## 8. Estructura de archivos objetivo (post-Sprint 1)

```text
packages/core/
├── src/
│   ├── index.ts
│   ├── trace-id.ts
│   ├── timestamp.ts
│   ├── result.ts
│   ├── types/
│   │   ├── identifier.ts
│   │   ├── version.ts
│   │   ├── metadata.ts
│   │   ├── namespace.ts
│   │   └── index.ts
│   ├── errors/
│   │   ├── severity.ts
│   │   ├── atlas-error.ts
│   │   ├── create-error.ts
│   │   └── index.ts
│   ├── contracts/
│   │   ├── status.ts
│   │   ├── context.ts
│   │   ├── request.ts
│   │   ├── configuration.ts
│   │   ├── metadata.ts
│   │   ├── input.ts
│   │   ├── event.ts
│   │   ├── metrics.ts
│   │   ├── output.ts
│   │   ├── module-contract.ts
│   │   └── index.ts
│   └── internal/
│       └── (helpers privados si necesarios)
├── tests/
│   ├── types.test.ts
│   ├── primitives.test.ts
│   ├── errors.test.ts
│   └── contracts.test.ts
├── docs/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
└── CHANGELOG.md
```

---

## 9. Criterios de aceptación Sprint 1

| # | Criterio | Verificable |
|---|----------|-------------|
| AC1 | `@atlas/core` compila sin dependencias runtime | `package.json` dependencies vacío |
| AC2 | Exporta Value Objects DOM-000 §11 | Tests + `.d.ts` |
| AC3 | Exporta Error Contract ATLAS-100 §12 | Tests campos obligatorios |
| AC4 | Exporta Input/Output Contract ATLAS-100 §12 | Tests shape |
| AC5 | Exporta Event shape ATLAS-100 §13 | Tests |
| AC6 | No exporta lógica de dominio ni infra | Review de `index.ts` |
| AC7 | `internal/` encapsulado | Audit de `dist/index.d.ts` |
| AC8 | Pipeline CI verde | GitHub Actions |
| AC9 | Sin paquetes `@atlas/shared`, `@atlas/types`, `@atlas/errors` | Solo `@atlas/core` |

---

## 10. Referencias oficiales

| Documento | Secciones usadas |
|-----------|------------------|
| ATLAS-ARCH-002 | §6–11, §13 — layout, naming, API, semver |
| ATLAS-100 | §8, §12, §13 — contratos I/O, errores, eventos |
| ATLAS-DOM-000 | §11 — Value Objects |
| ATLAS-009 Glossary | §Version — semver |
| ATLAS-005 Boundaries | Exclusión de infraestructura |
| SDK-205 REST API | §7–8 — trace_id, error shape (referencia, no implementación REST) |

---

## 11. Autorización

| Gate | Estado |
|------|--------|
| Phase 0 bootstrap | ✅ APROBADA |
| Decisiones arquitectónicas owner | ✅ RESUELTAS |
| CORE_IMPLEMENTATION_PLAN | ⏳ **Pendiente aprobación owner** |
| Sprint 1 — escribir código | 🔒 **Bloqueado hasta aprobación de este documento** |

**Al aprobar este documento, el owner autoriza Sprint 1: implementación exclusiva de `@atlas/core` según §7.**

---

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-07-18 | Plan Sprint 1 derivado de specs oficiales |
