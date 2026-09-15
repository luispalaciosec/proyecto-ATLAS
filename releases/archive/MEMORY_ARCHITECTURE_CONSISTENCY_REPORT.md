# Memory Architecture Consistency Report

**Sprint:** 11A.0 — Architecture Consistency Review  
**Capability:** `@atlas/memory`  
**Baseline:** commit `76a85bc` · tag `architecture-complete-v1`  
**Date:** 2026-07-23  
**Scope:** Análisis documental exclusivo — sin modificaciones, sin propuestas de solución  

---

## Marco de referencia

### Precedencia oficial (ATLAS_ARCHITECTURE_MASTER.md §29)

1. Architecture Decision Records (ADR)  
2. Specifications (`spec/`)  
3. Architecture Master  
4. Releases  
5. README  
6. Source Code  

### Cronología documental relevante

| Fecha | Documento / evento | Notas |
|-------|-------------------|-------|
| 2026-07-13 | `spec/engine/ATLAS-103-MEMORY_ENGINE.md` | Engine spec temprana; sin modelo de almacenamiento canónico |
| 2026-07-16 | `spec/domain/ATLAS-DOM-004-MEMORY_DOMAIN.md` | Domain spec; incluye §31 Implementation Mapping |
| 2026-07-17 | `spec/foundation/ATLAS-010-PLATFORM_MAPPING.md` | Mapeo Memory Domain → Memory Engine |
| 2026-07-19 | `spec/intelligence/ATLAS-INTELLIGENCE-002-MEMORY.md` | Modelo conceptual Intelligence Layer (approved) |
| 2026-07-19 | Milestone 2 — DOM-004 entra al repositorio (`e7802a1`) | DOM-004 sin cambios posteriores |
| 2026-07-22 | `ATLAS_ARCHITECTURE_MASTER.md` (Last Updated) | Consolida fase arquitectónica |
| 2026-07-23 | Commit `76a85bc` — **Architecture Complete** | Introduce `spec/memory/` completo (16 docs) + Master |

### Hallazgo transversal

El baseline final **congeló simultáneamente** documentos de distintas generaciones sin reconciliación explícita. Las inconsistencias I-01…I-07 no son errores de implementación; son **documentos desalineados** incluidos en el mismo commit histórico.

---

## I-01 — Modelo de entidad central divergente

### ID

I-01

### Descripción

Coexisten dos modelos incompatibles para la unidad central de memoria persistente: el modelo DDD de Domain (`Memory`, `MemoryEntry`, `MemorySnapshot`) y el modelo de almacenamiento canónico de Capability (`Namespace → Collection → Record → Version → Relationship`).

### Documentos involucrados

| Documento | Rol |
|-----------|-----|
| `spec/domain/ATLAS-DOM-004-MEMORY_DOMAIN.md` | §8 Memory Entity; §9 Memory Categories; §31 Implementation Mapping |
| `spec/memory/ATLAS-MEMORY-004-STORAGE_MODEL.md` | Modelo canónico de almacenamiento (Purpose: "canonical representation") |
| `spec/memory/ATLAS-MEMORY-001-VISION.md` | Objetos conceptuales: Memory Record, Memory Collection, Memory Session |
| `spec/memory/ATLAS-MEMORY-008-PUBLIC_API.md` | §12 MemoryRecord; §13 MemorySnapshot |
| `spec/intelligence/ATLAS-INTELLIGENCE-002-MEMORY.md` | Tipos de memoria conceptuales (Episodic, Working, Semantic, etc.) |
| `ATLAS_ARCHITECTURE_MASTER.md` | §13 Planned Capabilities; §27 Snapshot — sin modelo de entidad detallado |

### Cuál documento fue escrito primero

1. **Primero:** `ATLAS-DOM-004` (2026-07-16)  
2. **Después:** `spec/memory/ATLAS-MEMORY-001` … `008` (commit 2026-07-23)  
3. **Paralelo conceptual:** `ATLAS-INTELLIGENCE-002` (2026-07-19) — no define entidades de almacenamiento  

### Cuál documento fue escrito después

`spec/memory/ATLAS-MEMORY-004-STORAGE_MODEL.md` y el resto de la suite `spec/memory/` (2026-07-23).

### Cuál representa la versión más reciente de la arquitectura

**`spec/memory/ATLAS-MEMORY-004-STORAGE_MODEL.md`** representa la versión más reciente para la **representación canónica de almacenamiento** dentro de `@atlas/memory`. Lo declara explícitamente en su Purpose: *"The Storage Model defines the canonical representation of every piece of information managed by the Memory domain."*

`ATLAS_ARCHITECTURE_MASTER.md` (2026-07-22/23) referencia genéricamente *Memory Specifications* en `spec/memory/` como base de Sprint 11A, sin reintroducir el modelo DOM-004 §8.

### Cuál documento quedó obsoleto

**Parcialmente obsoleto:** `spec/domain/ATLAS-DOM-004-MEMORY_DOMAIN.md`

- **Obsoleto para implementación de `@atlas/memory`:** §8 (forma de la entidad Memory), §31 (Implementation Mapping completo — estructura de archivos y nombres de entidades).  
- **Vigente como capa conceptual:** §1–7 (visión, principios, ubiquitous language), §9–21 (categorías, lifecycle conceptual), §23–25 (eventos y policies a nivel dominio conceptual).  

**No obsoleto:** `ATLAS-INTELLIGENCE-002` — opera en capa Intelligence (conceptual), no contradice MEMORY-004 si se interpreta como capa superior.

### Qué archivos deberían actualizarse

| Archivo | Acción requerida (futura, fuera de este sprint) |
|---------|--------------------------------------------------|
| `spec/domain/ATLAS-DOM-004-MEMORY_DOMAIN.md` | Alinear §8 y §31 con `spec/memory/` |
| `spec/domain/ATLAS-DOM-004-MEMORY_DOMAIN.md` | Añadir referencia explícita a ATLAS-MEMORY-004 como modelo canónico de persistencia |

**No requieren cambio por I-01:** `spec/memory/ATLAS-MEMORY-004-STORAGE_MODEL.md`, `ATLAS_ARCHITECTURE_MASTER.md`.

### Qué secciones exactas deberían actualizarse

**En `ATLAS-DOM-004`:**

| Sección | Acción |
|---------|--------|
| §8 Memory Entity | Eliminar o marcar como conceptual; referenciar MEMORY-004 Record como proyección de persistencia |
| §31 Implementation Mapping | Eliminar árbol de archivos obsoleto (`entities/Memory.ts`, `services/`, `repositories/` en raíz de package) |
| §31 | Reemplazar con referencia a `packages/memory/src/domain/` y a `spec/memory/` como autoridad de implementación |
| §3 Related Documents (§30) | Añadir referencias cruzadas a ATLAS-MEMORY-001…008 |

### Qué texto debería eliminarse

- §31 completo: árbol `packages/memory/entities/`, `services/`, `repositories/` sin prefijo `src/domain/`.  
- §8 atributos como definición implementable única (`MemoryId`, `Source`, `Scope` como shape exclusivo) si se adopta Record como canónico.

### Qué texto debería mantenerse

- §1–7: Purpose, Vision, Principles, Ubiquitous Language.  
- §9–21: Memory Categories, lifecycle conceptual (Capture→Forget).  
- §22–25: Services conceptuales, Events conceptuales, Policies, Specifications (como intención de dominio, sujetos a alineación nominal).  
- §32 Cursor Implementation Checklist: como checklist de fases, no como mapa de archivos.

### Justificación

MEMORY-004 fue authored y committed en el baseline final (`76a85bc`) como especificación dedicada de la capability `@atlas/memory`. DOM-004 predates esta suite por 7 días y no fue actualizado en el commit Architecture Complete. MEMORY-004 se autodefine como representación canónica. DOM-004 §31 contradice la estructura real del monorepo (`src/domain/` según convención `@atlas/knowledge` y mandato Sprint 11A).

### Nivel de riesgo

**ALTO** — Bloquea implementación del domain layer sin ambigüedad sobre el aggregate root y la jerarquía de entidades.

---

## I-02 — MemoryEntry vs MemoryRecord

### ID

I-02

### Descripción

El nombre y la forma del unit mínimo de memoria almacenada difieren entre Domain (`MemoryEntry`), Public API (`MemoryRecord`) y Storage Model (`Record` + `Version`).

### Documentos involucrados

| Documento | Término | Shape |
|-----------|---------|-------|
| `spec/domain/ATLAS-DOM-004-MEMORY_DOMAIN.md` | `MemoryEntry` | Entidad listada §31; no definida estructuralmente en §8 |
| `spec/memory/ATLAS-MEMORY-008-PUBLIC_API.md` | `MemoryRecord` | id, type, content, embedding?, metadata, timestamp |
| `spec/memory/ATLAS-MEMORY-004-STORAGE_MODEL.md` | `Record` + `Version` | record_id, namespace_id, collection_id, record_type, status, metadata, current_version + Version.content |
| `spec/memory/contracts/ATLAS-MEMORY-CONTRACT-007-MEMORY_STORE.md` | `Memory Entries` | Texto referencial; no define struct |
| `spec/memory/contracts/ATLAS-MEMORY-CONTRACT-006-CONSISTENCY_PROVIDER.md` | `MemoryEntry` | Referenciado en validateEntry() sin definición |

### Cuál documento fue escrito primero

1. **Primero:** `ATLAS-DOM-004` — introduce `MemoryEntry` (2026-07-16)  
2. **Después:** `ATLAS-MEMORY-004` — introduce `Record`/`Version` (2026-07-23)  
3. **Después:** `ATLAS-MEMORY-008` — introduce `MemoryRecord` (2026-07-23)  
4. **Después:** Contracts 006, 007 — referencian `MemoryEntry` (2026-07-23, mismo commit)

### Cuál documento fue escrito después

`ATLAS-MEMORY-004` y `ATLAS-MEMORY-008` (2026-07-23). Los contracts 006/007 son contemporáneos pero derivan terminología de DOM-004.

### Cuál representa la versión más reciente de la arquitectura

- **Persistencia canónica:** `ATLAS-MEMORY-004` (`Record` + `Version`).  
- **Superficie pública del paquete:** `ATLAS-MEMORY-008` (`MemoryRecord` como interfaz pública mínima).  

Ambos son post-baseline y más recientes que DOM-004 `MemoryEntry`. Entre ellos, MEMORY-004 es explícitamente *canonical*; MEMORY-008 es *public API* (capa de contrato exportado).

### Cuál documento quedó obsoleto

| Documento | Estado |
|-----------|--------|
| `ATLAS-DOM-004` — uso de `MemoryEntry` como entidad implementable | **Obsoleto** para `@atlas/memory` domain |
| `ATLAS-MEMORY-CONTRACT-006` — `MemoryEntry` en validateEntry() | **Obsoleto** nominalmente respecto a MEMORY-004 `Record` |
| `ATLAS-MEMORY-CONTRACT-007` — "Memory Entries" | **Obsoleto** nominalmente respecto a MEMORY-004 `Record` |

**No obsoleto:** `ATLAS-MEMORY-008` §12 — representa capa pública (puede ser proyección simplificada de Record, pero requiere definición de mapeo no existente).

### Qué archivos deberían actualizarse

| Archivo |
|---------|
| `spec/domain/ATLAS-DOM-004-MEMORY_DOMAIN.md` |
| `spec/memory/contracts/ATLAS-MEMORY-CONTRACT-006-CONSISTENCY_PROVIDER.md` |
| `spec/memory/contracts/ATLAS-MEMORY-CONTRACT-007-MEMORY_STORE.md` |
| `spec/memory/ATLAS-MEMORY-008-PUBLIC_API.md` (§12 — requiere relación explícita con Record/Version) |

### Qué secciones exactas deberían actualizarse

| Archivo | Sección |
|---------|---------|
| DOM-004 | §31 — `MemoryEntry.ts` |
| DOM-004 | §6 Ubiquitous Language — entrada `Memory Entry` |
| CONTRACT-006 | §Consistency Scope — `MemoryEntry` |
| CONTRACT-006 | §Public Interface — `validateEntry(entry: MemoryEntry)` |
| CONTRACT-007 | §Purpose — "Memory Entries" |
| MEMORY-008 | §12 MemoryRecord — añadir relación con ATLAS-MEMORY-004 Record |

### Qué texto debería eliminarse

- Referencias a `MemoryEntry` como tipo implementable único en contracts 006/007 sin definición estructural.  
- `MemoryEntry.ts` del mapping §31 de DOM-004 como archivo de dominio autoritativo.

### Qué texto debería mantenerse

- Concepto de "entry" / "record" como unidad mínima almacenada (semántica).  
- `MemoryRecord` en MEMORY-008 como nombre de interfaz pública si se documenta su relación con Record.  
- Inmutabilidad y versionado de MEMORY-004.

### Justificación

Tres nombres (`MemoryEntry`, `MemoryRecord`, `Record`) para el mismo concepto en la misma baseline. MEMORY-004 es el único que define estructura completa y se declara canónico. DOM-004 y contracts 006/007 usan terminología anterior no reconciliada en el commit final.

### Nivel de riesgo

**ALTO** — Impide definir el aggregate root y los value objects del domain layer.

---

## I-03 — MemoryStore: interfaz readonly vs operacional

### ID

I-03

### Descripción

El concepto `MemoryStore` tiene dos interfaces incompatibles: metadata readonly (Contract 007) vs operaciones mutables put/get/remove/search (MEMORY-008 §11).

### Documentos involucrados

| Documento | MemoryStore |
|-----------|-------------|
| `spec/memory/contracts/ATLAS-MEMORY-CONTRACT-007-MEMORY_STORE.md` | Status: **Frozen** — readonly: identity, metadata, statistics |
| `spec/memory/ATLAS-MEMORY-008-PUBLIC_API.md` §11 | Status: **Draft** — put(), get(), remove(), search() |
| `spec/domain/ATLAS-DOM-004-MEMORY_DOMAIN.md` | §6: `Memory Store` en ubiquitous language (sin interfaz) |
| `spec/memory/ATLAS-MEMORY-001-VISION.md` | Memory Collection (conceptual, no MemoryStore) |

### Cuál documento fue escrito primero

1. **Primero:** `ATLAS-DOM-004` — término `Memory Store` en ubiquitous language (2026-07-16)  
2. **Después:** `ATLAS-MEMORY-008` §11 (2026-07-23)  
3. **Después / contemporáneo:** `ATLAS-MEMORY-CONTRACT-007` (2026-07-23, mismo commit)

Orden interno probable: MEMORY-008 redactado como API pública; CONTRACT-007 como contrato de provider con semántica distinta pero mismo nombre.

### Cuál documento fue escrito después

Ambos `CONTRACT-007` y `MEMORY-008` §11 son del commit `76a85bc` (2026-07-23). CONTRACT-007 declara Status **Frozen**; MEMORY-008 declara status **Draft**.

### Cuál representa la versión más reciente de la arquitectura

**`spec/memory/contracts/ATLAS-MEMORY-CONTRACT-007-MEMORY_STORE.md`** — por status **Frozen** dentro de la suite de contratos publicada en el baseline, frente a MEMORY-008 §11 en status **Draft**.

Nota: MEMORY-008 §11 describe comportamiento operacional que CONTRACT-007 explícitamente excluye (§It SHALL NOT: perform searches, execute retrieval). Son conceptos homónimos en capas distintas mal diferenciados.

### Cuál documento quedó obsoleto

**`spec/memory/ATLAS-MEMORY-008-PUBLIC_API.md` §11 (MemoryStore)** — interfaz con put/get/remove/search contradice CONTRACT-007 Frozen. La sección mezcla contenedor lógico (007) con repositorio operacional.

**No obsoleto:** CONTRACT-007 como definición del concepto MemoryStore lógico.

### Qué archivos deberían actualizarse

| Archivo |
|---------|
| `spec/memory/ATLAS-MEMORY-008-PUBLIC_API.md` |

### Qué secciones exactas deberían actualizarse

| Sección | Acción |
|---------|--------|
| MEMORY-008 §11 MemoryStore | Eliminar o renombrar interfaz operacional |
| MEMORY-008 §4 Public Interfaces | Revisar listado MemoryStore |
| MEMORY-008 §15 Factory Functions | `createMemoryStore()` — alinear con semántica final |

### Qué texto debería eliminarse

- MEMORY-008 §11 bloque completo con `put()`, `get()`, `remove()`, `search()` bajo el nombre `MemoryStore`.  
- Episodic/semantic/procedural store examples en §11 si se mantienen bajo nombre incorrecto.

### Qué texto debería mantenerse

- CONTRACT-007 íntegro (Frozen).  
- MEMORY-008 §6 MemoryRepository y §8 StorageEngine — cubren operaciones mutables bajo otros nombres.  
- Concepto de store lógico agrupando entries/records (semántica de 007).

### Justificación

Dos interfaces homónimas en la misma capability, una Frozen y otra Draft, con responsabilidades opuestas (readonly vs mutable). El contrato Frozen prevalece por status. MEMORY-008 §11 duplica responsabilidades ya asignadas a MemoryRepository (§6) y StorageEngine (§8).

### Nivel de riesgo

**MEDIO-ALTO** — Confusión en domain vs application boundaries; riesgo de implementar interfaz incorrecta en domain layer.

---

## I-04 — Vocabulario de eventos de dominio (DOM vs MEMORY-002)

### ID

I-04

### Descripción

Los eventos listados en DOM-004 §23 difieren de los eventos de observabilidad arquitectónica en MEMORY-002.

### Documentos involucrados

| Documento | Eventos |
|-----------|---------|
| `spec/domain/ATLAS-DOM-004-MEMORY_DOMAIN.md` §23 | MemoryCaptured, MemoryClassified, MemoryConsolidated, MemoryStored, MemoryRecalled, MemoryUpdated, MemoryArchived, MemoryForgotten |
| `spec/memory/ATLAS-MEMORY-002-ARCHITECTURE.md` §Observability Architecture | MemoryCreated, MemoryUpdated, MemoryRetrieved, MemoryIndexed, MemoryArchived |
| `spec/memory/ATLAS-MEMORY-003-MEMORY_ENGINE.md` | publish observability events (sin lista canónica) |

### Cuál documento fue escrito primero

1. **Primero:** `ATLAS-DOM-004` §23 (2026-07-16)  
2. **Después:** `ATLAS-MEMORY-002` §Observability (2026-07-23)

### Cuál documento fue escrito después

`ATLAS-MEMORY-002-ARCHITECTURE.md` (2026-07-23).

### Cuál representa la versión más reciente de la arquitectura

**`spec/memory/ATLAS-MEMORY-002-ARCHITECTURE.md`** — eventos de observabilidad de la capability Memory, committed en baseline final. MEMORY-002 contextualiza explícitamente: *"These events support monitoring and diagnostics"* (capa Observability Layer, no domain DDD events).

**Interpretación de capas:** DOM-004 §23 describe eventos de **dominio DDD** (lifecycle Capture→Forget). MEMORY-002 describe eventos de **observabilidad arquitectónica**. No son equivalentes por diseño, pero el baseline no documenta esta distinción.

### Cuál documento quedó obsoleto

**Parcialmente desalineado:** `ATLAS-DOM-004` §23 — lista eventos DDD sin correspondencia ni mapeo con MEMORY-002. No está "obsoleto" conceptualmente si se mantiene como domain events, pero **quedó sin vincular** a la suite `spec/memory/` del baseline.

**No obsoleto:** MEMORY-002 observability events — vigentes para capa de observabilidad.

### Qué archivos deberían actualizarse

| Archivo |
|---------|
| `spec/domain/ATLAS-DOM-004-MEMORY_DOMAIN.md` |
| `spec/memory/ATLAS-MEMORY-002-ARCHITECTURE.md` (referencia cruzada) |

### Qué secciones exactas deberían actualizarse

| Archivo | Sección |
|---------|---------|
| DOM-004 | §23 Memory Events |
| DOM-004 | §31 events/ folder listing |
| MEMORY-002 | §Observability Architecture — añadir nota sobre relación con domain events |

### Qué texto debería eliminarse

- Ninguno sin decisión de capa. Si domain events se implementan: eliminar duplicados nominales sin mapeo (p.ej. MemoryStored vs MemoryCreated — distintos momentos del lifecycle).

### Qué texto debería mantenerse

- DOM-004 §23 completo como intención de domain events DDD.  
- MEMORY-002 lista de observability events.  
- Distinción explícita entre domain events y observability events (texto a añadir, no existe hoy).

### Justificación

Superposición nominal (MemoryUpdated, MemoryArchived aparecen en ambos) sin documentación de relación. DOM-004 predates MEMORY-002. Baseline no estableció taxonomía de eventos por capa.

### Nivel de riesgo

**MEDIO** — Riesgo de implementar eventos duplicados o en capa incorrecta.

---

## I-05 — Vocabulario de eventos (DOM vs MEMORY-008)

### ID

I-05

### Descripción

Tercer vocabulario de eventos en la API pública del paquete, distinto de DOM-004 §23 y MEMORY-002.

### Documentos involucrados

| Documento | Eventos |
|-----------|---------|
| `spec/domain/ATLAS-DOM-004-MEMORY_DOMAIN.md` §23 | 8 eventos DDD (ver I-04) |
| `spec/memory/ATLAS-MEMORY-008-PUBLIC_API.md` §17 | MemoryInitialized, MemoryStored, MemoryRetrieved, MemoryUpdated, MemoryDeleted, MemoryIndexed, MemorySnapshotCreated |
| `spec/memory/ATLAS-MEMORY-002-ARCHITECTURE.md` | 5 eventos observabilidad (ver I-04) |

### Cuál documento fue escrito primero

1. **Primero:** `ATLAS-DOM-004` §23 (2026-07-16)  
2. **Después:** `ATLAS-MEMORY-002` (2026-07-23)  
3. **Después:** `ATLAS-MEMORY-008` §17 (2026-07-23)

### Cuál documento fue escrito después

`ATLAS-MEMORY-008-PUBLIC_API.md` §17 (2026-07-23).

### Cuál representa la versión más reciente de la arquitectura

**`spec/memory/ATLAS-MEMORY-008-PUBLIC_API.md` §17** — eventos de integración/publicación del paquete `@atlas/memory`, parte del baseline final. MEMORY-008 declara: *"Events are immutable"* en contexto de API pública.

Jerarquía inferida dentro de `spec/memory/`:
- **Domain events (intención):** DOM-004 §23 (externo, no reconciliado)  
- **Observability:** MEMORY-002  
- **Public integration events:** MEMORY-008 §17  

### Cuál documento quedó obsoleto

**Sin mapeo explícito, todos quedaron parcialmente desactualizados entre sí:**

| Documento | Estado |
|-----------|--------|
| DOM-004 §23 | Sin correspondencia con MEMORY-008 §17 |
| MEMORY-002 observability | Sin correspondencia con MEMORY-008 §17 |
| MEMORY-008 §17 | **Vigente** como public API events, pero **inconsistente** con MEMORY-002 (MemoryStored vs MemoryCreated; MemoryDeleted ausente en 002) |

El documento más desalineado respecto al baseline capability: **DOM-004 §23** (generación anterior, sin MemoryInitialized, MemoryIndexed, MemorySnapshotCreated).

### Qué archivos deberían actualizarse

| Archivo |
|---------|
| `spec/domain/ATLAS-DOM-004-MEMORY_DOMAIN.md` |
| `spec/memory/ATLAS-MEMORY-002-ARCHITECTURE.md` |
| `spec/memory/ATLAS-MEMORY-008-PUBLIC_API.md` |

### Qué secciones exactas deberían actualizarse

| Archivo | Sección |
|---------|---------|
| DOM-004 | §23 |
| DOM-004 | §31 events/ file list |
| MEMORY-002 | §Observability Architecture |
| MEMORY-008 | §17 Events |

### Qué texto debería eliminarse

- Eventos duplicados sin rol definido entre capas (tras tabla de mapeo — no proponer aquí cuáles).

### Qué texto debería mantenerse

- MEMORY-008 §17 como lista de public integration events.  
- MEMORY-002 como observability.  
- DOM-004 §23 como domain lifecycle events (con mapeo futuro).

### Justificación

Tres listas de eventos en baseline sin taxonomía por capa (domain / observability / public). MEMORY-008 es la más reciente para API del paquete. DOM-004 §31 lista archivos de eventos (`MemoryCaptured.ts`, etc.) que no tienen equivalente en MEMORY-008 §17.

### Nivel de riesgo

**MEDIO** — Implementación de domain events sin criterio claro de cuál vocabulario usar.

---

## I-06 — MemoryEntry referenciado sin definición estructural

### ID

I-06

### Descripción

CONTRACT-006 referencia el tipo `MemoryEntry` en interfaz pública congelada, pero ningún documento en `spec/memory/` define su estructura. MEMORY-004 define `Record`; MEMORY-008 define `MemoryRecord`.

### Documentos involucrados

| Documento | Referencia |
|-----------|------------|
| `spec/memory/contracts/ATLAS-MEMORY-CONTRACT-006-CONSISTENCY_PROVIDER.md` | `MemoryEntry` en §Consistency Scope y `validateEntry(entry: MemoryEntry)` |
| `spec/domain/ATLAS-DOM-004-MEMORY_DOMAIN.md` | `MemoryEntry` como entidad §31 — sin struct |
| `spec/memory/ATLAS-MEMORY-004-STORAGE_MODEL.md` | `Record` — struct completo |
| `spec/memory/ATLAS-MEMORY-008-PUBLIC_API.md` | `MemoryRecord` — struct de interfaz |

### Cuál documento fue escrito primero

1. **Primero:** `ATLAS-DOM-004` — nombra MemoryEntry (2026-07-16)  
2. **Después:** `ATLAS-MEMORY-004` — define Record (2026-07-23)  
3. **Después:** `CONTRACT-006` — referencia MemoryEntry (2026-07-23)  
4. **Después:** `MEMORY-008` — define MemoryRecord (2026-07-23)

### Cuál documento fue escrito después

`ATLAS-MEMORY-CONTRACT-006` y `ATLAS-MEMORY-008` (2026-07-23).

### Cuál representa la versión más reciente de la arquitectura

**`spec/memory/ATLAS-MEMORY-004-STORAGE_MODEL.md`** — única definición estructural completa del unit almacenado (`Record` + `Version`).

Para contratos Frozen: **CONTRACT-006 debería referenciar el tipo canónico**, pero en su redacción actual referencia terminología obsoleta (`MemoryEntry`).

### Cuál documento quedó obsoleto

| Documento | Estado |
|-----------|--------|
| `CONTRACT-006` — uso de `MemoryEntry` | **Obsoleto** nominalmente; **Frozen** por status — conflicto interno |
| `DOM-004` — MemoryEntry sin struct | **Obsoleto** como definición de tipo |

**Vigente:** MEMORY-004 Record struct.

### Qué archivos deberían actualizarse

| Archivo |
|---------|
| `spec/memory/contracts/ATLAS-MEMORY-CONTRACT-006-CONSISTENCY_PROVIDER.md` |
| `spec/domain/ATLAS-DOM-004-MEMORY_DOMAIN.md` |

### Qué secciones exactas deberían actualizarse

| Archivo | Sección |
|---------|---------|
| CONTRACT-006 | §Consistency Scope — MemoryEntry |
| CONTRACT-006 | §Public Interface — validateEntry(entry: MemoryEntry) |
| DOM-004 | §31 — MemoryEntry.ts |

### Qué texto debería eliminarse

- `MemoryEntry` como identifier de tipo en CONTRACT-006 sin definición importada.  
- `MemoryEntry.ts` de DOM-004 §31 como archivo autoritativo.

### Qué texto debería mantenerse

- Operación `validateEntry` / validación de record integrity (semántica).  
- Scope de validación (structural, logical, storage, index, session) de CONTRACT-006.

### Justificación

Contract Frozen referencia un tipo inexistente en la suite memory. Es derivación terminológica de DOM-004 no actualizada al modelo canónico MEMORY-004 del mismo commit.

### Nivel de riesgo

**ALTO** — Contract Frozen inconsistente con Storage Model del mismo baseline.

---

## I-07 — Ruta de implementación DOM-004 §31 vs convención monorepo

### ID

I-07

### Descripción

DOM-004 §31 mapea implementación a `packages/memory/entities/` (sin `src/domain/`). Sprint 11A y convención `@atlas/knowledge` usan `packages/memory/src/domain/`.

### Documentos involucrados

| Documento | Ruta definida |
|-----------|---------------|
| `spec/domain/ATLAS-DOM-004-MEMORY_DOMAIN.md` §31 | `packages/memory/entities/`, `value-objects/`, `services/`, `repositories/` (raíz del package) |
| `spec/architecture/ATLAS-ARCH-002-PACKAGE_ARCHITECTURE.md` | `packages/` como Layer 2; no detalla `src/domain/` |
| `packages/knowledge/` (convención existente) | `src/domain/aggregates/`, `entities/`, `value-objects/` |
| `releases/SPRINT11A_1_IMPLEMENTATION_PLAN.md` | `packages/memory/src/domain/` |
| `ATLAS_ARCHITECTURE_MASTER.md` §28 | `packages/memory` (sin detalle de subcarpetas) |

### Cuál documento fue escrito primero

1. **Primero:** `ATLAS-DOM-004` §31 (2026-07-16)  
2. **Después:** `ATLAS-ARCH-002` (actualizado 2026-07-23 — sin mapping interno de packages)  
3. **Después:** `@atlas/knowledge` implementación con `src/domain/` (Sprint 8–9, pre-baseline)  
4. **Después:** Sprint 11A.1 plan (2026-07-23)

### Cuál documento fue escrito después

Convención `src/domain/` establecida por `@atlas/knowledge` (Sprint 8–9) y ratificada en Sprint 11A.1 plan. DOM-004 §31 no fue actualizado en commit `76a85bc`.

### Cuál representa la versión más reciente de la arquitectura

**Convención del monorepo** evidenciada en:
- `packages/knowledge/src/domain/` (implementación congelada/publicada)  
- `spec/architecture/ATLAS-ARCH-002` §5.1 (2026-07-23) — inventario de paquetes actualizado  
- Mandato Sprint 11A en `ATLAS_ARCHITECTURE_MASTER.md` §28  

Ningún documento posterior a DOM-004 valida la ruta `packages/memory/entities/` en raíz.

### Cuál documento quedó obsoleto

**`spec/domain/ATLAS-DOM-004-MEMORY_DOMAIN.md` §31 Implementation Mapping** — íntegro en cuanto a rutas de archivos. Incluye además carpetas fuera de scope Sprint 11A.1 (`services/`, `repositories/` en raíz).

**No obsoleto:** Estructura lógica de capas en DOM-004 (entities, value-objects, events, specifications como conceptos).

### Qué archivos deberían actualizarse

| Archivo |
|---------|
| `spec/domain/ATLAS-DOM-004-MEMORY_DOMAIN.md` |

### Qué secciones exactas deberían actualizarse

| Sección | Acción |
|---------|--------|
| §31 Implementation Mapping | Sustituir árbol de rutas |
| §32 Cursor Implementation Checklist | Alinear con fases Sprint 11A.x |

### Qué texto debería eliminarse

- Árbol completo §31 con rutas `packages/memory/entities/` (sin `src/`)  
- Referencias a `services/`, `repositories/` en raíz del package como estructura actual

### Qué texto debería mantenerse

- Lista de componentes lógicos (entities, value-objects, events, specifications) como categorías.  
- Referencia a `packages/memory/` como ubicación del paquete.

### Justificación

DOM-004 §31 es el único documento que prescribe estructura física obsoleta. El monorepo adoptó `src/domain/` en Knowledge. ARCH-002 actualizado en baseline no contradice pero tampoco valida §31. Sprint 11A apunta explícitamente a `packages/memory/src/domain/`.

### Nivel de riesgo

**BAJO-MEDIO** — Resuelto operativamente por convención del monorepo y Sprint 11A; riesgo documental, no arquitectónico estructural.

---

## Resumen ejecutivo

| ID | Documento más reciente (autoridad) | Documento obsoleto / desalineado | Riesgo |
|----|----------------------------------|----------------------------------|--------|
| I-01 | `ATLAS-MEMORY-004` | `ATLAS-DOM-004` §8, §31 | ALTO |
| I-02 | `ATLAS-MEMORY-004` + `ATLAS-MEMORY-008` §12 | `ATLAS-DOM-004` MemoryEntry; CONTRACT-006/007 | ALTO |
| I-03 | `CONTRACT-007` (Frozen) | `ATLAS-MEMORY-008` §11 | MEDIO-ALTO |
| I-04 | `ATLAS-MEMORY-002` (observability) | `ATLAS-DOM-004` §23 (sin mapeo de capa) | MEDIO |
| I-05 | `ATLAS-MEMORY-008` §17 (public API) | `ATLAS-DOM-004` §23; desalineación con MEMORY-002 | MEDIO |
| I-06 | `ATLAS-MEMORY-004` Record | `CONTRACT-006` MemoryEntry; DOM-004 MemoryEntry | ALTO |
| I-07 | Convención `src/domain/` (knowledge + Sprint 11A) | `ATLAS-DOM-004` §31 | BAJO-MEDIO |

### Documento principal desactualizado respecto al baseline final

**`spec/domain/ATLAS-DOM-004-MEMORY_DOMAIN.md`** — específicamente §8, §23 (sin taxonomía de capas), y §31 — redactado el 2026-07-16, **no actualizado** en commit `76a85bc` cuando se introdujo la suite completa `spec/memory/`.

### Inconsistencias internas dentro de `spec/memory/` (mismo baseline)

| Conflicto | Documentos |
|-----------|------------|
| MemoryEntry vs Record vs MemoryRecord | CONTRACT-006, CONTRACT-007 vs MEMORY-004 vs MEMORY-008 |
| MemoryStore readonly vs mutable | CONTRACT-007 (Frozen) vs MEMORY-008 §11 (Draft) |
| Eventos observability vs public API | MEMORY-002 vs MEMORY-008 §17 |

Estas inconsistencias indican que **`spec/memory/` no fue reconciliado internamente** antes del commit Architecture Complete, aunque representa la generación documental más reciente de la capability.

### Documentos vigentes del baseline (no obsoletos)

- `spec/memory/ATLAS-MEMORY-001` … `007` — arquitectura de capability  
- `spec/memory/ATLAS-MEMORY-004-STORAGE_MODEL.md` — modelo canónico de persistencia  
- `spec/memory/contracts/ATLAS-MEMORY-CONTRACT-001` … `005` — contratos Frozen de providers/engine  
- `spec/intelligence/ATLAS-INTELLIGENCE-002` — capa conceptual Intelligence  
- `ATLAS_ARCHITECTURE_MASTER.md` — referencia de fase y Sprint 11A  

---

## Estado del informe

**COMPLETADO**

No se modificó ningún archivo excepto la entrega de este informe.  
No se implementó código.  
No se propusieron soluciones.

---

*End of Memory Architecture Consistency Report*
