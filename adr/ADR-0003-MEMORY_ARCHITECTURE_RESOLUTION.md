---
id: ADR-0003
title: Memory Architecture Resolution
version: 1.0.0
status: accepted
date: 2026-07-25
deciders: Atlas Architecture Board
depends_on:
  - ADR-0001
  - ADR-0002
  - ATLAS-MEMORY-CONTRACT-001
  - ATLAS-MEMORY-CONTRACT-006
  - ATLAS-MEMORY-CONTRACT-007
  - ATLAS-MEMORY-002
  - ATLAS-MEMORY-004
  - ATLAS-MEMORY-008
---

# ADR-0003 — Memory Architecture Resolution

## Status

**Accepted** — 2026-07-25

**Supersedes:** none

**Required follow-up:** Sprint 11A.3B — Architecture Realignment

---

## Context

Tras la implementación parcial de `@atlas/memory` (Sprints 11A.1R Domain, 11A.2R Engine, 11A.3 Repository Layer local), tres auditorías independientes convergieron en el mismo diagnóstico:

- El **Domain Layer** es sólido y alineado a `ATLAS-MEMORY-004`.
- El **Memory Engine** requiere realineación con los contratos congelados.
- El **Repository Layer** requiere rewiring bajo el Memory Engine.
- El **Single Entry Point** definido en `ATLAS-MEMORY-CONTRACT-001` no se respeta en la implementación actual.
- Existen primitivas paralelas (`EngineResult`, `RepositoryResult`) innecesarias frente a `@atlas/core Result`.
- `MemoryRepository` no debe ser API pública paralela al Memory Engine.

La resolución fue ratificada por el Architecture Review Board durante Sprint 11A.3A.

**Estado pre-ADR de la implementación:**

| Sprint | Estado | Conformidad ADR-0003 |
|--------|--------|----------------------|
| 11A.1R Domain | Commiteado (`sprint-11a-1r`) | Conforme |
| 11A.2R Engine | Commiteado (`sprint-11a-2r`) | No conforme — vocabulario y wiring |
| 11A.3 Repository | Local, no commiteado | No conforme — bypass Engine, acceso directo a MemoryStore |

Este ADR no modifica código. Establece la arquitectura autoritativa que regirá toda evolución futura de `@atlas/memory`.

**Relación con ADR-0002:** ADR-0002 pospone la consolidación de Planning hasta que existan Memory Provider, Retrieval Provider, Context Builder, Reasoning Engine y Agent Runtime. La presente resolución **complementa** ADR-0002: estabiliza la arquitectura interna de `@atlas/memory` como prerrequisito de la cadena cognitiva Goal → Context → Memory → Retrieval → Reasoning → Planning definida en ADR-0002. No modifica ni contradice las decisiones de Planning.

**Precedencia aplicada:**

1. ADRs aceptados
2. Specs Frozen
3. Specs Draft
4. Architecture Master
5. VERSION
6. Releases
7. Source Code

---

## Problem Statement

La implementación actual de `@atlas/memory` presenta conflictos arquitectónicos demostrables:

1. **Bypass del Memory Engine:** los entity repositories acceden directamente a `MemoryStore`, violando `ATLAS-MEMORY-CONTRACT-001` §5 (*"All memory operations pass through the engine. No component bypasses it."*).

2. **API dual:** `ATLAS-MEMORY-008` §6 expone `MemoryRepository` como interfaz pública paralela a `MemoryEngine`, en conflicto con el Single Entry Point del contrato Frozen.

3. **Vocabulario fragmentado:** la implementación 11A.2R usa `write/read/remove`; los contratos y MEMORY-008 §5 definen `store/retrieve/delete`.

4. **Primitivas Result duplicadas:** `EngineResult` y `RepositoryResult` duplican `@atlas/core Result<T,E>`.

5. **Pipeline no integrado:** el Engine y los Repositories operan en paralelo sobre `MemoryStore` sin un pipeline unificado Engine → Providers → MemoryStore.

6. **Superficie pública vacía:** `packages/memory/src/index.ts` permanece como stub (`export {}`), sin exports alineados a MEMORY-008.

Estos conflictos **bloquean Sprint 11B (Application Layer)** si no se resuelven, porque cristalizarían deuda estructural en la capa de aplicación.

---

## Decision

**ADR-0003 becomes authoritative architecture for `@atlas/memory`.**

Toda evolución futura del paquete SHALL cumplir las decisiones congeladas en este documento. La implementación pre-ADR (11A.2R / 11A.3) queda **superseded** como objetivo arquitectónico y debe realinearse en Sprint 11A.3B.

---

## Architecture Principles

1. **Single Entry Point** — Toda operación de memoria pasa por `MemoryEngine`. Ningún componente externo ni interno bypassa el engine.

2. **Provider Independence** — El engine coordina providers; nunca depende de implementaciones concretas de almacenamiento (`ATLAS-MEMORY-CONTRACT-001` §4, `ATLAS-MEMORY-002` §Layered Architecture).

3. **Domain Integrity** — El Domain Layer (`ATLAS-MEMORY-004`) permanece intacto. Las reglas de negocio viven en domain; la orquestación vive en engine.

4. **Platform Cohesion** — `@atlas/memory` usa primitivas compartidas de `@atlas/core` (`Result`, `AtlasError` en frontera).

5. **Internal vs Public Separation** — Repositories, MemoryStore, ConsistencyProvider y entity repositories son **internos al paquete**. Solo la superficie MEMORY-008 autorizada es pública.

6. **Frozen over Draft** — Ante conflicto entre contratos Frozen y specs Draft, prevalece el contrato Frozen.

---

## Official Pipeline

```
Application Layer
        ↓
MemoryEngine
        ↓
Providers
  (Storage Provider,
   Index Provider,
   Retrieval Provider,
   Consistency Provider)
        ↓
MemoryStore
        ↓
Storage Providers
  (SQLite, PostgreSQL, Redis, filesystem — futuro)
```

**Autoridad:** `ATLAS-MEMORY-CONTRACT-001` §4–§8, `ATLAS-MEMORY-002` §Layered Architecture.

Los entity repositories (`NamespaceRepository`, `RecordRepository`, etc.) **no constituyen un tier arquitectónico independiente**. Son colaboradores internos invocados desde rutas internas del Memory Engine (Storage Coordinator).

---

## Single Entry Point

**MemoryEngine** es el único punto de entrada operacional de `@atlas/memory`.

- Toda mutación, consulta y búsqueda SHALL enrutarse a través del engine.
- Ningún consumidor de plataforma (Runtime, SDK, Agent) SHALL invocar repositories, MemoryStore o providers directamente.
- `ATLAS-MEMORY-CONTRACT-001` §5 (Frozen) es la autoridad definitiva.

---

## MemoryRepository

**Internal Only.**

`MemoryRepository` (`ATLAS-MEMORY-008` §6) queda reclasificado como **puerto interno de persistencia** dentro del paquete `@atlas/memory`.

- SHALL NOT exportarse como API pública independiente.
- Si existe, SHALL delegar obligatoriamente a `MemoryEngine`.
- La resolución del conflicto Frozen vs Draft: `ATLAS-MEMORY-CONTRACT-001` §5 prevalece sobre MEMORY-008 §6.

---

## Entity Repositories

Los repositorios de entidad (`NamespaceRepository`, `CollectionRepository`, `RecordRepository`, `VersionRepository`, `RelationshipRepository`) son **colaboradores internos** del Memory Engine.

| Regla | Detalle |
|-------|---------|
| Visibilidad | **Never public API** |
| Acceso a MemoryStore | **Never direct** — SHALL invocarse solo desde rutas internas del Engine |
| Responsabilidad | Adaptadores de persistencia domain-aware: validación MEMORY-004 en frontera + traducción Domain ↔ store |
| Orquestación | **No** poseen orquestación de providers, sesiones, eventos ni indexing — eso es responsabilidad del Engine |

---

## Vocabulary

Vocabulario canónico de operaciones del Memory Engine:

| Operación | Método canónico |
|-----------|-----------------|
| Escritura | `store` |
| Lectura | `retrieve` |
| Eliminación | `delete` |
| Búsqueda | `search` |
| Actualización | `update` |

**Autoridad:** `ATLAS-MEMORY-CONTRACT-001` §7, `ATLAS-MEMORY-008` §5.

**Rechazado:**

- `write / read / remove` — artefacto de implementación 11A.2R, no canónico.
- `save / load / remove` — vocabulario subordinado de MemoryRepository interno; no vocabulario público.

Los verbos de dominio en entity repositories (`createRecord`, `appendVersion`, `link`, etc.) operan en un plano semántico distinto y no entran en conflicto con este vocabulario.

---

## Result Primitive

**`@atlas/core Result<T,E>`** es la primitiva oficial de resultado para `@atlas/memory`.

| Primitiva | Estado |
|-----------|--------|
| `@atlas/core Result<T,E>` | **Oficial** |
| `EngineResult` | **Deprecated** — eliminar en Sprint 11A.3B |
| `RepositoryResult` | **Deprecated** — eliminar en Sprint 11A.3B |

**Justificación:** `@atlas/core` exporta `Result` como primitiva compartida de plataforma (`ATLAS-ARCH-002` — capabilities dependen de core). Introducir resultados paralelos fragmenta el algebra de resultados de Atlas.

---

## Error Model

```
Errores internos Memory
  (MemoryDomainError, EngineError, RepositoryError)
        ↓
Errores públicos MEMORY-008 §16
  (MemoryNotFoundError, InvalidMemoryRecordError, …)
        ↓
AtlasError
  (únicamente en frontera Runtime/SDK)
```

| Capa | Tipo | Export público |
|------|------|----------------|
| Domain | `MemoryDomainError` | No |
| Engine | `EngineError` (capability-internal) | No |
| Repository | `RepositoryError` (capability-internal) | No |
| Public API | Errores MEMORY-008 §16 | Sí |
| Platform boundary | `AtlasError` (`@atlas/core`) | Sí — normalización al cruzar hacia Runtime/SDK |

`RepositoryError` **NO** deriva de `AtlasError`. La normalización a `AtlasError` ocurre exclusivamente en la frontera de plataforma, no en capas internas de persistencia.

**Consistencia:** `ATLAS-MEMORY-CONTRACT-006` (Frozen) — el ConsistencyProvider ejecuta reglas; el MemoryEngine orquesta cuándo se invoca. Los repositories **NO** invocan ConsistencyProvider directamente.

**MemoryStore:** `ATLAS-MEMORY-CONTRACT-007` (Frozen) — frontera lógica de persistencia. **Never public.**

---

## Public API

### Public API operacional

**MemoryEngine** es el **único punto de entrada operacional**.

Ningún otro componente SHALL actuar como entry point alternativo para operaciones de memoria.

### Public API contractual

Los siguientes exports complementarios **están autorizados** en `packages/memory/src/index.ts` pero **no constituyen entry points alternativos**:

| Export | Fuente |
|--------|--------|
| `MemoryEngine` | MEMORY-008 §5 |
| `createMemoryEngine()` | MEMORY-008 §14 |
| Tipos públicos | MEMORY-008 §15: `MemoryRecord`, `MemorySnapshot`, `MemoryQuery`, `SearchResult`, `RetrievalResult`, `SimilarityResult`, `MemoryMetadata`, `MemoryStatistics` |
| Errores públicos | MEMORY-008 §16: `MemoryNotFoundError`, `MemoryStorageError`, `MemoryIndexError`, `MemoryRetrievalError`, `InvalidMemoryRecordError`, `InvalidQueryError` |
| `Result` (re-export) | `@atlas/core` |

**NO exportar:**

- `MemoryStore`, `ConsistencyProvider`, Storage/Index/Retrieval Providers
- `MemoryRepository`, entity repositories, `RepositoryFactory`
- Entidades de dominio internas (`Namespace`, `Collection`, `Record`, `Version`, `Relationship`)
- `EngineResult`, `RepositoryResult`, `EngineError`, `RepositoryError`

---

## Forbidden Architecture

Queda **prohibido** en `@atlas/memory` y en cualquier consumidor:

| Prohibición | Detalle |
|-------------|---------|
| MemoryStore público | MemoryStore nunca se exporta ni se consume desde fuera del paquete |
| Repository público | MemoryRepository y entity repositories nunca son API pública |
| Bypass Engine → Store | El engine no accede a store sin pasar por providers/repositories internos |
| Bypass Repository → Store | Entity repositories nunca acceden a MemoryStore directamente |
| API dual | No coexisten entry points paralelos (Engine + Repository público) |
| Resultados paralelos | No se introducen primitivas Result distintas de `@atlas/core` |
| Consistencia en repos | Repositories no invocan ConsistencyProvider |
| SQL/filesystem/Redis en repos | Repositories no conocen tecnologías de almacenamiento |

---

## Consequences

### Positivas

- Arquitectura Memory congelada y auditable por cinco años.
- Single Entry Point garantiza trazabilidad y observabilidad centralizadas.
- Cohesión con `@atlas/core` elimina fragmentación de primitivas.
- Sprint 11B puede construir Application Layer sobre base estable.
- Complementa la cadena cognitiva de ADR-0002 con Memory arquitectónicamente sólido.

### Negativas / coste de migración

- Sprint 11A.3B requiere rewiring significativo de Engine y Repositories.
- Renombrado de API (`write/read/remove` → `store/retrieve/delete`) rompe tests existentes.
- Eliminación de `EngineResult`/`RepositoryResult` requiere refactor de capa engine y repositories.
- Implementación 11A.3 local debe reescribirse parcialmente, no solo commitearse.

### Neutras

- Domain Layer (11A.1R) permanece intacto.
- Storage Providers, Sessions, Event Bus siguen deferidos post-11B.
- ADR-0002 permanece vigente sin modificación.

---

## Migration Plan

### Sprint 11A.3B — Architecture Realignment

| # | Acción | Obligatorio |
|---|--------|-------------|
| 1 | Rewire MemoryEngine como único entry point | Sí |
| 2 | Entity repos invocados solo desde rutas internas del Engine | Sí |
| 3 | Eliminar bypass Engine → MemoryStore directo | Sí |
| 4 | Eliminar bypass Repository → MemoryStore directo | Sí |
| 5 | Renombrar `write/read/remove` → `store/retrieve/delete` | Sí |
| 6 | Eliminar `EngineResult` y `RepositoryResult`; adoptar `@atlas/core Result` | Sí |
| 7 | Implementar exports públicos en `index.ts` según sección Public API | Sí |
| 8 | Tests de integración que demuestren Single Entry Point | Sí |

### Post-11A.3B

```
Architecture Certification
        ↓
Tag: memory-architecture-certified
        ↓
Sprint 11B — Application Layer
```

Sprint 11B **queda bloqueado** hasta certificación PASS post-11A.3B.

---

## References

### ADRs

- `adr/ADR-0001-DOCUMENT_ID_NAMESPACE.md`
- `adr/ADR-0002-PLANNING_CONSOLIDATION.md`

### Contratos Frozen

- `spec/memory/contracts/ATLAS-MEMORY-CONTRACT-001-MEMORY_ENGINE.md`
- `spec/memory/contracts/ATLAS-MEMORY-CONTRACT-006-CONSISTENCY_PROVIDER.md`
- `spec/memory/contracts/ATLAS-MEMORY-CONTRACT-007-MEMORY_STORE.md`

### Especificaciones Memory

- `spec/memory/ATLAS-MEMORY-002-ARCHITECTURE.md`
- `spec/memory/ATLAS-MEMORY-004-STORAGE_MODEL.md`
- `spec/memory/ATLAS-MEMORY-008-PUBLIC_API.md`

### Arquitectura

- `ATLAS_ARCHITECTURE_MASTER.md` §28–§30, Phase 5 Memory

### Implementación pre-ADR

- `packages/memory/src/domain/` — Sprint 11A.1R (conforme)
- `packages/memory/src/engine/` — Sprint 11A.2R (requiere realineación)
- `packages/memory/src/repositories/` — Sprint 11A.3 local (requiere realineación)

### Resolución Architecture Board

- Sprint 11A.3A — ADR Ratification (2026-07-25)

---

## Final Statement

Este ADR congela la arquitectura definitiva de `@atlas/memory`.

Ningún sprint futuro puede introducir bypasses, APIs duales, primitivas Result paralelas ni vocabulario no canónico sin un nuevo ADR que supersede ADR-0003.

La implementación existente es pre-ADR. La conformidad arquitectónica se alcanza exclusivamente mediante Sprint 11A.3B — Architecture Realignment.

---

**Status:** Accepted

**Supersedes:** none

**Required follow-up:** Sprint 11A.3B — Architecture Realignment
