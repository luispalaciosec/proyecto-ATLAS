---
id: ATLAS-KNOWLEDGE-IMPL-001
title: Knowledge Implementation Plan
version: 1.2.0
status: approved
phase: 3
sprint: 8
capability: Knowledge
created: 2026-07-18
last_updated: 2026-07-18
author: Architecture Board
audience: Owner / Software Engineer
amendments:
  - id: AMD-001
    title: Metamodel-first Sprint 8 order
    date: 2026-07-18
  - id: AMD-002
    title: No repository interfaces in Knowledge v1
    date: 2026-07-18
architectural_guidelines:
  - id: AG-001
    title: Reflective semantic metamodel (constraint only)
    date: 2026-07-18
    sprint: 8
purpose: >
  Plan de implementación arquitectónico para @atlas/knowledge.
  Deriva exclusivamente de Capabilities/Knowledge/ (KNOWLEDGE-001–008).
  No contiene código. Autorización requerida antes de escribir TypeScript.
prerequisite:
  - Foundation Phase COMPLETED
  - Kernel v0.1.0-alpha FROZEN
  - KNOWLEDGE-001–008 APPROVED
related:
  - Capabilities/Knowledge/KNOWLEDGE-001-CAPABILITY.md
  - Capabilities/Knowledge/KNOWLEDGE-002-METAMODEL.md
  - Capabilities/Knowledge/KNOWLEDGE-003-OBJECT_MODEL.md
  - Capabilities/Knowledge/KNOWLEDGE-004-GRAPH_MODEL.md
  - Capabilities/Knowledge/KNOWLEDGE-005-LIFECYCLE.md
  - Capabilities/Knowledge/KNOWLEDGE-006-QUERY_MODEL.md
  - Capabilities/Knowledge/KNOWLEDGE-007-OPERATIONS.md
  - Capabilities/Knowledge/KNOWLEDGE-008-ROADMAP.md
  - Architecture/ATLAS-ARCH-002 — PACKAGE_ARCHITECTURE.md
  - Engine/ATLAS-102-KNOWLEDGE_ENGINE.md
  - Domain/ATLAS-DOM-001-KNOWLEDGE_DOMAIN.md
---

# KNOWLEDGE_IMPLEMENTATION_PLAN.md

## Sprint 7 — Plan de implementación de `@atlas/knowledge`

**Estado:** ✅ **APROBADO** v1.2.0 — **Sprint 8 AUTORIZADO**  
**Alcance activo:** Implementación Sprint 8 (metamodel + domain core)  
**Regla:** AG-001 es constraint arquitectónico — sin implementación de reflection en Sprint 8.

---

## Enmiendas arquitectónicas aprobadas

### AMD-001 — Metamodel-first (Sprint 8)

Sprint 8 **debe comenzar** con la implementación completa del **Knowledge Metamodel** (KNOWLEDGE-002). El metamodel es la fundación del paquete y **debe existir antes** de aggregates, stores u operaciones.

**Orden obligatorio Sprint 8:**

1. Knowledge Metamodel
2. Value Objects
3. `KnowledgeStatement`
4. `KnowledgeRelationship`
5. `KnowledgeObject`
6. Factories
7. Validators

### AMD-002 — Sin repository interfaces en Knowledge v1

- Knowledge v1 permanece **100% in-memory**.
- **No** se definen repository interfaces en `@atlas/knowledge`.
- **No** se introducen abstracciones de persistencia en el modelo de dominio inicial.
- Las **repository interfaces** se trasladan a la futura capability **`@atlas/memory`**.
- El almacenamiento in-memory vive en `src/internal/store/` como detalle de implementación, no como port hexagonal.

### AG-001 — Reflective semantic metamodel (constraint only)

**Estado:** ✅ Registrado — Sprint 8 Authorization (18/07/2026)

El Knowledge Metamodel **no es** una colección arbitraria de clases de dominio. Representa el **lenguaje semántico universal de Atlas**. Capabilities futuras (Memory, Retrieval, Workflow, Runtime, Agents, SDK, CLI e integraciones externas) razonarán sobre el Knowledge Model **a través del Metamodel**.

**Constraint arquitectónico:**

- Diseñar el metamodel como **modelo semántico reflectivo declarativo** (`MetaConceptDescriptor`).
- Cada elemento del metamodel debe preservar la **posibilidad futura** de describir, sin breaking changes de API pública:
  - identidad propia (`identity`)
  - tipo semántico (`semanticType`)
  - atributos (`attributes`)
  - relaciones (`relationships`)
  - lifecycle (`lifecycle`)
  - operaciones (`operations`)
  - reglas de validación (`validationRules`)
  - aplicabilidad contextual (`contextApplicability`)

**Explícitamente prohibido en Sprint 8:**

- Implementar reflection en runtime
- Introspección dinámica
- Metaprogramming
- Complejidad adicional en runtime

**Implementación Sprint 8:** descriptors readonly congelados en `src/metamodel/meta-concept-descriptor.ts` + registry estático. Sin motores de reflection.

---

## Tabla de mapeo documental → arquitectura TypeScript

| Documento | Conceptos principales | Destino en `@atlas/knowledge` |
|-----------|----------------------|-------------------------------|
| KNOWLEDGE-001 | Capability, Statement, Object, Graph, Trust, Lifecycle | Propósito, boundaries, posición en plataforma |
| KNOWLEDGE-002 | Metamodel: Identity, Statement, Object, Relationship, Context, Owner, Lifecycle, Trust, Version, Evidence, History, Graph | `src/metamodel/` (**primero en Sprint 8**) → `src/domain/` |
| KNOWLEDGE-003 | Object components: Metadata, Behavior, Governance | `src/domain/entities/` + `src/domain/value-objects/` |
| KNOWLEDGE-004 | Nodes, Edges, Context Layers, Graph Identity, Federation, Consistency | `src/graph/` + `src/contracts/graph/` |
| KNOWLEDGE-005 | Lifecycle stages Idea→Archived, transitions, invariants | `src/lifecycle/` |
| KNOWLEDGE-006 | Query dimensions, types, traversal, ranking, explainability | `src/query/` |
| KNOWLEDGE-007 | Creation, Modification, Relationship, Validation, Discovery, Governance, Lifecycle ops | `src/operations/` |
| KNOWLEDGE-008 | Maturity stages 1–8 | Orden de implementación + migration strategy |

---

## 1. Purpose of the package

`@atlas/knowledge` es el **primer Capability Engine** sobre el Kernel congelado v0.1.

Implementa la **Knowledge Capability** (KNOWLEDGE-001): transformar información organizacional en inteligencia estructurada, gobernada y conectada mediante el **Knowledge Graph** canónico.

### Posición en la plataforma

```text
Reality (externa)
    ↓
@atlas/knowledge     ← representación canónica (Statements → Objects → Graph)
    ↓
@atlas/compiler      ← consume unidades exportadas; valida consistencia semántica
    ↓
Artifacts
    ↓
@atlas/runtime       ← ejecuta; produce observaciones (evidencia futura)
```

`@atlas/knowledge` existe **antes** de la compilación y **sobrevive** a la ejecución (KNOWLEDGE-001 §Conceptual Position).

### Objetivos de diseño (derivados de KNOWLEDGE-002 §Design Goals)

| Goal | Implicación TypeScript |
|------|------------------------|
| Universality | Metamodel estable; tipos de objeto extensibles vía `ObjectKind` + metadata |
| Stability | Cambios breaking solo en major; metamodel congelado por línea semver |
| Extensibility | Registry de `ObjectKind` y `RelationshipType` sin alterar core concepts |
| Composability | Aggregates pequeños; operaciones composables |
| Technology Independence | Stores in-memory internos; persistencia durable delegada a `@atlas/memory` (futuro) |
| Semantic Consistency | Validators + invariants enforced en domain services |

---

## 2. Responsibilities

`@atlas/knowledge` **SHALL**:

| Responsabilidad | Fuente | Implementación prevista |
|-----------------|--------|-------------------------|
| Representar Knowledge Statements | KNOWLEDGE-001, 002 | Entity `KnowledgeStatement` + VO `StatementContent` |
| Construir Knowledge Objects | KNOWLEDGE-003 | Aggregate `KnowledgeObject` |
| Mantener Knowledge Graph | KNOWLEDGE-004 | Aggregate `KnowledgeGraph` + graph services |
| Gobernar lifecycle | KNOWLEDGE-005 | `LifecycleStateMachine` + domain service |
| Exponer query semantics | KNOWLEDGE-006 | `KnowledgeQuery` + `QueryExecutor` (interface) |
| Ejecutar operations | KNOWLEDGE-007 | `KnowledgeOperation` + `OperationHandler` registry |
| Validar invariants del metamodel | KNOWLEDGE-002 §Invariants | `MetamodelValidator` |
| Versionar sin destruir historial | KNOWLEDGE-002, 005 | `KnowledgeVersion` + immutable history entries |
| Registrar trust y evidence | KNOWLEDGE-002, 003 | VOs `TrustScore`, `EvidenceReference` |
| Exportar unidades compilables | KNOWLEDGE-001 §Role | `CompilationUnitExporter` → `@atlas/core`/`@atlas/compiler` contracts |
| Publicar domain events | KNOWLEDGE-007 §Traceable | Event definitions en `@atlas/knowledge` (patrón `@atlas/runtime`) |

---

## 3. Non-responsibilities

`@atlas/knowledge` **SHALL NOT** (KNOWLEDGE-001 §Scope, KNOWLEDGE-008):

| Excluido | Paquete responsable |
|----------|---------------------|
| Ejecución de artifacts | `@atlas/runtime` |
| Persistencia durable (storage engines) | `@atlas/memory` (futuro) — incluye **repository interfaces** (AMD-002) |
| Definir repository interfaces | `@atlas/memory` (AMD-002) |
| Ranking/search algorithms de discovery | `@atlas/retrieval` (futuro) |
| Orquestación multi-paso de approval | `@atlas/workflow` (futuro) |
| Razonamiento de agentes | `@atlas/agent` (futuro) |
| Validación estructural pre-ejecución del pipeline | `@atlas/compiler` |
| Ontología formal / reasoning lógico | `@atlas/ontology` (futuro) |
| API HTTP/GraphQL | `@atlas/sdk` + apps |
| UI / CLI commands | `@atlas/cli` |
| Plugin loading | `@atlas/plugin` (futuro) |

**Regla de boundary:** Knowledge define **semántica y estado conceptual**. No implementa algoritmos de retrieval ni storage concretos en v1.

---

## 4. Public API

La API pública de `@atlas/knowledge` sigue el patrón Kernel: **contracts + factories + facade mínima**.

### 4.1 Entry point

| Export | Rol |
|--------|-----|
| `createKnowledgeEngine(options)` | Factory principal — construye facade |
| `KnowledgeEngine` | Facade de operaciones de alto nivel |
| `AtlasKnowledgeOptions` | Configuración (registries, event bus adapter, store options) |

### 4.2 Módulos públicos (subpath exports propuestos)

| Subpath | Contenido |
|---------|-----------|
| `@atlas/knowledge` | Facade + factories (Sprint 10+) |
| `@atlas/knowledge/metamodel` | Tipos readonly del metamodel (Sprint 8) |
| `@atlas/knowledge/contracts` | Interfaces públicas (sin persistencia) |
| `@atlas/knowledge/events` | Event type definitions (Sprint 10+) |

### 4.3 Facade surface (`KnowledgeEngine`)

Operaciones agrupadas según KNOWLEDGE-007:

| Grupo | Métodos conceptuales |
|-------|---------------------|
| **Objects** | `createObject`, `getObject`, `updateMetadata`, `addStatement` |
| **Graph** | `connect`, `disconnect`, `getGraph`, `validateGraph` |
| **Lifecycle** | `submitDraft`, `approve`, `publish`, `observe`, `version`, `archive` |
| **Query** | `lookup`, `browse`, `trace`, `audit` (delegan a QueryExecutor) |
| **Export** | `exportCompilationUnits(filter)` → `CompilationUnit[]` compatible con compiler |
| **Validation** | `validateObject`, `validateGraph` |

### 4.4 Tipos públicos re-exportables

Solo **contracts**, **metamodel types** y **value object interfaces** (readonly). Nunca stores internos ni clases de infraestructura.

| Tipo público | Origen doc |
|--------------|------------|
| `KnowledgeObjectSnapshot` | KNOWLEDGE-003 — vista inmutable del aggregate |
| `KnowledgeStatementSnapshot` | KNOWLEDGE-002 |
| `KnowledgeRelationshipSnapshot` | KNOWLEDGE-004 |
| `KnowledgeGraphSnapshot` | KNOWLEDGE-004 |
| `LifecycleState` | KNOWLEDGE-005 |
| `QuerySpec` / `QueryResult` | KNOWLEDGE-006 |
| `OperationResult` | KNOWLEDGE-007 |
| `TrustIndicator` | KNOWLEDGE-002, 003 |

---

## 5. Internal architecture

Arquitectura **hexagonal / layered DDD** alineada con `@atlas/compiler` y `@atlas/runtime`:

```text
┌─────────────────────────────────────────────────────────┐
│  Application Layer                                      │
│  KnowledgeEngine (facade)                               │
│  OperationDispatcher · QueryCoordinator                 │
│  CompilationUnitExporter                                │
├─────────────────────────────────────────────────────────┤
│  Domain Layer                                           │
│  Metamodel (foundation)                                 │
│  Entities · Value Objects · Aggregates (Sprint 9+)      │
│  Domain Services (Lifecycle, GraphConsistency)          │
│  Invariants · Validators                                │
├─────────────────────────────────────────────────────────┤
│  Contracts Layer (ports)                                │
│  QueryExecutor interface · EventPublisher interface     │
│  (NO repository interfaces — AMD-002)                   │
├─────────────────────────────────────────────────────────┤
│  Infrastructure Layer (internal/ — NOT exported)        │
│  InMemoryKnowledgeStore (v1)                            │
│  EventBus adapter → @atlas/events                       │
└─────────────────────────────────────────────────────────┘
```

### Flujo de una operación (KNOWLEDGE-007)

```text
KnowledgeEngine.operation(params)
    → OperationDispatcher.resolve(operationType)
    → GovernanceGuard.checkPermissions()
    → LifecycleGuard.checkTransition()
    → DomainService.execute()
    → MetamodelValidator.validate()
    → InMemoryKnowledgeStore.commit()
    → HistoryRecorder.append()
    → EventPublisher.publish()
    → OperationResult
```

### Principios internos

0. **Metamodel primero** — ningún entity, VO ni aggregate existe fuera del vocabulario definido en `src/metamodel/` (AMD-001).
1. **Aggregates mutan solo vía domain services** — no setters públicos.
2. **Statements inmutables** — modificaciones crean nuevos statements (KNOWLEDGE-002).
3. **History append-only** — nunca update/delete de entradas históricas.
4. **Identity estable** — `KnowledgeObjectId` asignado en creación, nunca reasignado.
5. **Sin ports de persistencia** — el dominio no conoce repositories; stores in-memory son infraestructura opaca (AMD-002).

---

## 6. Folder structure

Estructura propuesta para `packages/knowledge/`:

```text
packages/knowledge/
├── src/
│   ├── index.ts
│   ├── metamodel/                        # AMD-001: Sprint 8 step 1
│   │   ├── meta-concept.ts
│   │   ├── meta-layer.ts
│   │   ├── metamodel-invariants.ts
│   │   └── index.ts
│   ├── domain/
│   │   ├── value-objects/                # Sprint 8 step 2
│   │   ├── entities/                     # Sprint 8 steps 3–4
│   │   ├── aggregates/
│   │   │   ├── knowledge-object.ts       # Sprint 8 step 5
│   │   │   └── knowledge-graph.ts        # Sprint 9+
│   │   └── …
│   ├── factories/                        # Sprint 8 step 6
│   ├── validators/                       # Sprint 8 step 7
│   ├── contracts/                        # NO repositories/ (AMD-002)
│   └── internal/
│       └── store/                        # InMemoryKnowledgeStore (AMD-002)
│           └── in-memory-knowledge-store.ts
├── tests/
│   ├── metamodel/
│   └── domain/
└── …
```

Ver §6.1 y diagrama completo en anexo estructural (sin cambios de paths adicionales en sprints posteriores).

```text
packages/knowledge/   (estructura completa — sprints 9–11 añaden engine/, application/, etc.)
├── src/
│   ├── index.ts
│   ├── metamodel/
│   ├── engine/
│   ├── application/
│   ├── domain/
│   ├── lifecycle/
│   ├── graph/
│   ├── query/
│   ├── operations/
│   ├── contracts/          # sin repositories/
│   ├── factories/
│   ├── validators/
│   ├── events/
│   ├── registries/
│   └── internal/
│       ├── store/          # reemplaza repositories/ (AMD-002)
│       └── adapters/
```

**Convención ARCH-002:** `src/internal/` nunca exportado. `src/metamodel/` exportado como subpath `./metamodel`. `src/contracts/` sin interfaces de persistencia (AMD-002).

---

## 6.1 Knowledge Metamodel (AMD-001 — Sprint 8, paso 1)

Implementación completa de KNOWLEDGE-002 **antes** de cualquier entity, VO o aggregate.

### Contenido de `src/metamodel/`

| Artefacto | Representa | Fuente KNOWLEDGE-002 |
|-----------|------------|----------------------|
| `MetaLayer` | enum: `reality`, `statement`, `object`, `graph` | §The Meta Layers |
| `MetaConcept` | union type de conceptos core | §Core Meta Concepts |
| `MetaConceptDescriptor` | schema reflectivo declarativo (AG-001) | §Meta Concept Definitions |
| `MetaConceptRegistry` | registry estático de descriptors | AG-001 |
| `MetamodelInvariant` | reglas declarativas (12 invariants) | §Metamodel Invariants |
| `ExtensionModel` | contrato para `ObjectKind` sin redefinir core | §Extension Model |

### Core concepts → tipos metamodel (readonly interfaces)

| Meta Concept | Tipo metamodel | Rol |
|--------------|----------------|-----|
| Identity | `MetaIdentity` | Contrato de identidad permanente |
| Statement | `MetaStatement` | Assertion atómica, inmutable |
| Object | `MetaObject` | Agregación semántica de statements |
| Relationship | `MetaRelationship` | Conexión direccional tipada |
| Context | `MetaContext` | Validez contextual |
| Owner | `MetaOwner` | Responsabilidad de governance |
| Lifecycle | `MetaLifecycle` | Estados de evolución |
| Trust | `MetaTrust` | Señal de confianza |
| Version | `MetaVersion` | Evolución versionada |
| Evidence | `MetaEvidence` | Soporte, no equivalente a knowledge |
| History | `MetaHistory` | Registro inmutable |
| Graph | `MetaGraph` | Red semántica canónica |

### Reglas de implementación

1. El metamodel es **puro** — sin dependencia de stores, events ni application layer.
2. Entities y VOs del dominio **implementan o satisfacen** contratos del metamodel.
3. `MetamodelValidator` (paso 7) valida conformidad contra `MetamodelInvariant[]`.
4. El metamodel se congela por línea semver de `@atlas/knowledge`; cambios requieren ADR.

### Export

Subpath propuesto: `@atlas/knowledge/metamodel` — tipos readonly del lenguaje universal.

---

## 7. Value Objects

**Orden Sprint 8:** paso **2** — después del metamodel, antes de entities (AMD-001).

Mapeo KNOWLEDGE-002/003 → Value Objects TypeScript (diseño, no implementación):

| Value Object | Campos conceptuales | Invariantes | Doc fuente |
|--------------|---------------------|-------------|------------|
| `KnowledgeObjectId` | `value: string` (URN/UUID) | Inmutable; formato validado; único en graph | KNOWLEDGE-002 Identity |
| `StatementContent` | `assertion: string`; `predicate?`; `object?` | Una sola assertion atómica | KNOWLEDGE-002 Statement |
| `ObjectMetadata` | `name`, `description`, `labels`, `tags`, `aliases`, `language`, `visibility` | No define behavior | KNOWLEDGE-003 Metadata |
| `ObjectBehavior` | `intentions: BehaviorIntention[]` | Conceptual only; no execution | KNOWLEDGE-003 Behavior |
| `ContextScope` | `dimensions: Map<ContextDimension, string>` | Al menos una dimensión en object | KNOWLEDGE-002 Context |
| `GovernanceRecord` | `owner`, `stewards`, `reviewers`, `permissions`, `lifecycleState`, `versionPolicy` | Owner obligatorio | KNOWLEDGE-003 Governance |
| `TrustScore` | `level: number`; `signals: TrustSignal[]` | 0–1 o escala ordinal; no binary only | KNOWLEDGE-002 Trust |
| `KnowledgeVersion` | `major`, `minor`, `patch`; `label?` | Monotonic per object identity | KNOWLEDGE-002 Version |
| `EvidenceReference` | `source`, `type`, `uri?`, `capturedAt` | Evidence ≠ Knowledge | KNOWLEDGE-002 Evidence |
| `RelationshipType` | `name: string` (enum extensible) | Registrado en RelationshipTypeRegistry | KNOWLEDGE-002 Relationship |
| `ObjectKind` | `name: string` | Extensible; no redefine metamodel | KNOWLEDGE-002 Extension |
| `GraphId` | `value: string` | Identifica graph instance / federation boundary | KNOWLEDGE-004 Graph Identity |
| `LifecycleState` | enum (ver §16) | Transiciones gobernadas | KNOWLEDGE-005 |
| `HistoryEntryId` | `value: string` | Immutable reference | KNOWLEDGE-002 History |

**Patrón:** Todos los VOs usan `Object.freeze`, factory functions (`createX`), y métodos `equals()` donde aplique (patrón `@atlas/core` Identifier/Version). Cada VO **declara conformidad** con su `MetaConcept` correspondiente en `src/metamodel/`.

---

## 8. Entities

**Orden Sprint 8 (AMD-001):** paso **3** `KnowledgeStatement` → paso **4** `KnowledgeRelationship`. `EvidenceRecord` y `HistoryEntry` difieren a Sprint 9+.

| Entity | Sprint | Identidad | Responsabilidad | Mutabilidad |
|--------|--------|-----------|-----------------|-------------|
| `KnowledgeStatement` | 8.3 | `StatementId` | Assertion atómica contextualizada | Inmutable post-publicación |
| `KnowledgeRelationship` | 8.4 | `RelationshipId` | Edge tipado entre dos `KnowledgeObjectId` | Evoluciona vía nueva versión de edge |
| `EvidenceRecord` | 9+ | `EvidenceId` | Soporte de trust para statements | Append-only |
| `HistoryEntry` | 9+ | `HistoryEntryId` | Registro inmutable de cambio | Inmutable |

### `KnowledgeStatement` — mapeo detallado

| Campo | Tipo | Doc |
|-------|------|-----|
| `id` | `StatementId` | Traceable |
| `content` | `StatementContent` | KNOWLEDGE-002 |
| `context` | `ContextScope` | Obligatorio |
| `version` | `KnowledgeVersion` | Versioned |
| `authoredBy` | `Identifier` (@atlas/core) | Ownership trace |
| `publishedAt` | `AtlasTimestamp` | History |
| `supersedes?` | `StatementId` | Evolution without mutation |

---

## 9. Aggregates

**Orden Sprint 8 (AMD-001):** paso **5** — `KnowledgeObject` se implementa **después** de Statement y Relationship, **no antes** del metamodel.

**Nota:** En Sprint 8, `KnowledgeObject` se introduce como aggregate root conceptual. `KnowledgeGraph` aggregate difiere a **Sprint 9**.

### 9.1 `KnowledgeObject` (aggregate root — Sprint 8.5)

**Composición** (KNOWLEDGE-003 §Universal Structure):

```text
KnowledgeObject (root)
├── KnowledgeObjectId          (identity — invariant)
├── ObjectKind
├── ObjectMetadata
├── statements: KnowledgeStatement[]
├── behavior: ObjectBehavior
├── relationships: RelationshipRef[]    (refs, not full edges)
├── contexts: ContextScope[]
├── governance: GovernanceRecord
├── history: HistoryEntry[]
├── trust: TrustScore
└── currentVersion: KnowledgeVersion
```

**Invariantes del aggregate** (KNOWLEDGE-002 §Metamodel Invariants):

- Exactamente un `KnowledgeObjectId`
- Al menos un `ContextScope`
- `GovernanceRecord.owner` definido
- Statements pertenecen al object
- `currentVersion` monotónico

**Consistencia boundary:** Relationships como entidades pueden vivir en `KnowledgeGraph` aggregate; `KnowledgeObject` mantiene refs para navegación local. Operaciones cross-aggregate coordinadas por `GraphConsistencyService`.

### 9.2 `KnowledgeGraph` (aggregate root)

**Composición** (KNOWLEDGE-004):

```text
KnowledgeGraph (root)
├── GraphId
├── nodes: Map<KnowledgeObjectId, GraphNodeRef>
├── edges: KnowledgeRelationship[]
├── contexts: ContextScope[]              (graph-level defaults)
├── federationRefs: SubgraphRef[]         (v2+)
└── metadata: GraphMetadata
```

**Invariantes:**

- Cada edge referencia nodes existentes
- No broken references (KNOWLEDGE-004 §Graph Consistency)
- Node identity = Object identity (1:1)

---

## 10. Domain Services

| Domain Service | Responsabilidad | Doc |
|----------------|-----------------|-----|
| `LifecycleStateMachine` | Validar y ejecutar transiciones Idea→Archived | KNOWLEDGE-005 |
| `GraphConsistencyService` | Verificar integridad referencial del graph | KNOWLEDGE-004 |
| `VersioningService` | Crear snapshots de versión; link supersedes | KNOWLEDGE-002, 005 |
| `TrustCalculator` | Recalcular trust desde evidence + governance | KNOWLEDGE-002 (v1: rule-based simple) |
| `HistoryRecorder` | Append history entries en cada operación | KNOWLEDGE-007 §Traceable |
| `MetamodelValidator` | Enforce all metamodel invariants | KNOWLEDGE-002 |
| `CompilationUnitMapper` | Object/Statement → CompilationUnit | KNOWLEDGE-001 §Compiler |

**Nota:** Discovery ranking (KNOWLEDGE-006 §Ranking) **no** vive aquí — delegado a `@atlas/retrieval`. `QueryCoordinator` en application layer compone resultados in-memory en v1.

---

## 11. Contracts

Interfaces públicas en `src/contracts/`:

### 11.1 Engine contract

| Interface | Métodos clave |
|-----------|---------------|
| `KnowledgeEngineContract` | Operaciones facade (§4.3) |
| `KnowledgeEngineOptions` | `queryExecutor`, `eventPublisher`, `registries`, `storeOptions` (sin repositories — AMD-002) |

### 11.2 Persistence — delegada a `@atlas/memory` (AMD-002)

`@atlas/knowledge` **no define** repository interfaces. La persistencia durable y sus ports viven en la futura capability `@atlas/memory`.

En v1, el engine usa `InMemoryKnowledgeStore` (clase concreta interna) inyectada solo en application layer, invisible al dominio.

### 11.3 Query contract

| Interface | Descripción |
|-----------|-------------|
| `QueryExecutor` | `execute(spec: QuerySpec): Promise<QueryResult>` |
| `GraphTraverser` | `traverse(from, direction, depth, filter)` |

### 11.4 Export contract

| Interface | Descripción |
|-----------|-------------|
| `CompilationUnitExporter` | `export(filter: ExportFilter): CompilationUnit[]` |
| `ExportFilter` | lifecycle state, context, object kinds |

### 11.5 Event contract

| Interface | Descripción |
|-----------|-------------|
| `KnowledgeEventPublisher` | `publish(event: KnowledgeDomainEvent)` |
| `KnowledgeDomainEvent` | Extiende patrón `@atlas/core` EngineEvent |

### 11.6 Operation contract

| Interface | Descripción |
|-----------|-------------|
| `OperationHandler<TParams, TResult>` | `handle(params, context): OperationResult` |
| `OperationContext` | actor, permissions, graph snapshot, traceId |

---

## 12. Factory classes

**Orden Sprint 8:** paso **6** — después de Metamodel, VOs, Statement, Relationship y Object (AMD-001).

Patrón **factory functions** (consistente con `@atlas/compiler` `createCompilationUnit`):

| Factory | Produce | Validaciones |
|---------|---------|--------------|
| `createKnowledgeEngine(options)` | `KnowledgeEngine` | Sprint 10+; DI de store interno |
| `createKnowledgeObject(params)` | `KnowledgeObject` draft | Identity + owner + context + metamodel |
| `createKnowledgeStatement(params)` | `KnowledgeStatement` | Atomic assertion + metamodel |
| `createKnowledgeRelationship(params)` | `KnowledgeRelationship` | Endpoints exist + metamodel |
| `createKnowledgeGraph(params)` | `KnowledgeGraph` | Sprint 9+ |
| `createQuerySpec(params)` | `QuerySpec` | Sprint 10+ |
| `createLifecycleTransition(from, to)` | `LifecycleTransition` | Sprint 9+ |

**No constructor público** en aggregates — solo factories + reconstitution interna desde store (application layer, Sprint 9+).

---

## 13. Validators

**Orden Sprint 8:** paso **7** — último paso del sprint; depende de metamodel + domain types (AMD-001).

| Validator | Valida | Fail mode |
|-----------|--------|-----------|
| `MetamodelValidator` | Conformidad con `MetamodelInvariant[]` | compuesto — **primero en cadena** |
| `IdentityValidator` | Formato y unicidad de IDs | `AtlasError` validation |
| `StatementValidator` | Atomicidad, context present | reject create |
| `RelationshipValidator` | Endpoints, type registered | reject connect |
| `ContextValidator` | Al menos una dimensión | reject object |
| `GraphValidator` | No broken refs, consistency | Sprint 9+ |
| `LifecycleValidator` | Transition permitida | Sprint 9+ |
| `GovernanceValidator` | Owner, permissions | Sprint 10+ |

**Integración compiler:** `GraphValidator` output alimenta diagnostics compatibles con `@atlas/compiler` `Diagnostic` shape en export path (adapter, no dependencia inversa).

---

## 14. Persistence model — in-memory v1 / repositories en Memory (AMD-002)

**Decisión aprobada:** `@atlas/knowledge` v1 **no expone** repository interfaces. El modelo de dominio **no** está influenciado por abstracciones de persistencia.

### Knowledge v1 — `InMemoryKnowledgeStore`

Clase concreta **interna** en `src/internal/store/in-memory-knowledge-store.ts`:

| Responsabilidad | Descripción |
|-----------------|-------------|
| `objects` | Map de `KnowledgeObjectId` → `KnowledgeObject` |
| `relationships` | Colección de `KnowledgeRelationship` |
| `statements` | Índice por objectId |
| `commit()` | Persiste estado tras validación (application layer) |
| `snapshot()` | Vista readonly para queries |

**Reglas:**

- No es un port hexagonal — es detalle de implementación.
- No se exporta en `package.json` exports.
- El dominio **nunca** importa el store.
- Tests de dominio Sprint 8 **no requieren** store — solo metamodel, VOs, entities, object, factories, validators.

### Futuro — `@atlas/memory` (repository interfaces)

Las **repository interfaces** se definirán en `@atlas/memory` cuando esa capability se implemente:

| Interface (futuro en `@atlas/memory`) | Responsabilidad |
|---------------------------------------|-----------------|
| `KnowledgeObjectRepository` | Persistencia durable de objects |
| `KnowledgeGraphRepository` | Persistencia de graph |
| `KnowledgeHistoryRepository` | Append-only history durable |

`@atlas/memory` implementará adapters que satisfagan estos ports y podrá **hidratar** un `InMemoryKnowledgeStore` o reemplazarlo en el engine via application-layer wiring — **sin cambiar** el dominio de `@atlas/knowledge`.

**Migración M3 (§27):** `@atlas/memory` sustituye el store in-memory como backend; el dominio permanece intacto.

---

## 15. Graph abstractions

Mapeo KNOWLEDGE-004 → abstracciones TypeScript:

| Concepto doc | Abstracción | Notas |
|--------------|-------------|-------|
| Node | `GraphNodeRef` | Referencia ligera a `KnowledgeObjectId` + kind + lifecycle |
| Edge | `KnowledgeRelationship` entity | Directional, typed, metadata |
| Context Layers | `ContextScope` en node y edge | Multi-context |
| Graph Identity | `GraphId` VO | Federation futura |
| Graph Topology | `GraphTraverser` | Soporta hierarchy, network, dependency |
| Graph Operations | `GraphOperationHandler` | Create, Connect, Update, Disconnect, Archive, Merge, Split |
| Graph Consistency | `GraphConsistencyService` | Pre-operational gate |
| Federation | `SubgraphRef` + `FederatedGraphView` | Stage 3 roadmap — interface only v1 |

### `GraphTraverser` capabilities (KNOWLEDGE-006)

- Incoming / outgoing / bidirectional
- Depth limit (default configurable)
- Filter by lifecycle, trust, context
- Return `TraversalPath` para explainability

**Decisión:** Abstracciones de graph viven en `@atlas/knowledge` v1. El paquete `@atlas/graph` stub permanece sin implementar hasta evaluar extracción (ver §29).

---

## 16. Lifecycle implementation

### Estados (mapeo KNOWLEDGE-005 → enum `LifecycleState`)

| Estado doc | Enum propuesto | Activo para compile |
|------------|----------------|---------------------|
| Idea | `idea` | No |
| Draft | `draft` | No |
| Review | `review` | No |
| Approved | `approved` | No |
| Operational | `operational` | **Sí** |
| Observed | `observed` | Sí (with observations) |
| Improved | `improved` | Transitorio |
| Versioned | `versioned` | Transitorio → operational |
| Retired | `retired` | No |
| Archived | `archived` | No (searchable only) |

KNOWLEDGE-001 usa subset (Draft→Approved→Executable→...). **Resolución:** enum completo de KNOWLEDGE-005; alias `executable` = `operational` en export layer.

### `LifecycleStateMachine`

```text
Transitions: Map<LifecycleState, Set<LifecycleState>>
Guards: GovernanceGuard, ApprovalGuard
Side effects: HistoryRecorder, EventPublisher
```

### Transiciones obligatorias v1

Implementar todas las de KNOWLEDGE-005 §Lifecycle Transitions como mínimo. Transiciones custom vía `LifecyclePolicy` injectable (org extension).

### Invariantes (KNOWLEDGE-005 §Lifecycle Invariants)

| Invariante | Enforcement |
|------------|-------------|
| Identity never changes | Aggregate design |
| History immutable | InMemoryKnowledgeStore append-only history index (Sprint 9+) |
| Operational requires approved | LifecycleGuard |
| Archived not executable | ExportFilter + Runtime contract |
| Trust evolves | TrustCalculator post-observation |

---

## 17. Query abstraction

Mapeo KNOWLEDGE-006 → `src/query/`:

### `QuerySpec`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `type` | `QueryType` | lookup, browse, search, explore, compare, trace, explain, audit |
| `scope` | `QueryScope` | org, unit, project, time, etc. |
| `dimensions` | `QueryDimension[]` | identity, relationship, context, time, trust, ownership, lifecycle |
| `filter` | `QueryFilter` | Composable predicates |
| `traversal` | `TraversalOptions?` | depth, direction |
| `pagination` | `Pagination?` | limit/offset |

### `QueryResult`

| Campo | Contenido |
|-------|-----------|
| `objects` | `KnowledgeObjectSnapshot[]` |
| `relationships` | `KnowledgeRelationshipSnapshot[]` |
| `statements` | `KnowledgeStatementSnapshot[]` |
| `contexts` | `ContextScope[]` |
| `evidence` | `EvidenceReference[]` |
| `history` | `HistoryEntry[]` (audit queries) |
| `trust` | `TrustIndicator[]` |
| `explanation` | `QueryExplanation` (KNOWLEDGE-006 §Explainability) |

### `QueryExecutor` implementación v1

- **In-memory** sobre `InMemoryKnowledgeStore.snapshot()` (Sprint 10+)
- Ranking simple: trust + lifecycle + context match (no ML)
- `@atlas/retrieval` reemplaza/extiende executor en Stage 6–7 roadmap

---

## 18. Operations abstraction

Mapeo KNOWLEDGE-007 §Categories → `OperationType` enum + handlers:

| Categoría | OperationTypes v1 | Handler |
|-----------|-------------------|---------|
| Creation | `CREATE_STATEMENT`, `CREATE_OBJECT`, `CREATE_RELATIONSHIP`, `CREATE_CONTEXT`, `CREATE_EVIDENCE`, `CREATE_VERSION` | `CreationOperationHandler` |
| Modification | `UPDATE_METADATA`, `ADD_STATEMENT`, `SUPERSEDE_STATEMENT`, `ATTACH_EVIDENCE`, `UPDATE_CONTEXT` | `ModificationOperationHandler` |
| Relationship | `CONNECT`, `DISCONNECT`, `REPLACE_RELATIONSHIP`, `VALIDATE_RELATIONSHIPS` | `RelationshipOperationHandler` |
| Validation | `VALIDATE_OBJECT`, `VALIDATE_GRAPH`, `VALIDATE_TRUST` | `ValidationOperationHandler` |
| Discovery | `LOOKUP`, `BROWSE`, `TRACE`, `AUDIT`, `EXPLAIN` | Delegates to QueryCoordinator |
| Governance | `ASSIGN_OWNER`, `TRANSFER_OWNERSHIP`, `APPROVE`, `REJECT`, `REVIEW`, `GRANT_PERMISSION`, `REVOKE_PERMISSION` | `GovernanceOperationHandler` |
| Lifecycle | `SUBMIT_DRAFT`, `PUBLISH`, `ACTIVATE`, `OBSERVE`, `IMPROVE`, `VERSION`, `RETIRE`, `ARCHIVE`, `RESTORE` | `LifecycleOperationHandler` |

### `OperationResult`

| Campo | Descripción |
|-------|-------------|
| `success` | boolean |
| `operationId` | trace |
| `affectedObjects` | IDs |
| `historyEntries` | created entries |
| `diagnostics` | warnings/errors |
| `events` | domain events emitted |

**Composite operations** (KNOWLEDGE-007): `OperationPipeline` en application layer — secuencia de operations con rollback semántico (compensating operations, no DB transaction en v1).

---

## 19. Compiler integration

KNOWLEDGE-001, 004, 005 establecen: **Compiler valida y transforma; Knowledge produce**.

### Dirección de dependencia (ARCH-002 §9)

```text
@atlas/compiler  →  @atlas/knowledge   (futuro: compiler depende de knowledge)
@atlas/knowledge  ↛  @atlas/compiler   (PROHIBIDO)
```

### Mecanismo de integración

1. **`CompilationUnitExporter`** en `@atlas/knowledge`:
   - Filtra objects en estado `operational`+
   - Mapea `KnowledgeObject` + statements → `CompilationUnit` (@atlas/compiler contract)
   - `source` field: canonical JSON representation
   - `metadata.kind`: `ObjectKind`
   - `origin`: `knowledge://{objectId}@{version}`

2. **Workspace bridge** (sin modificar Kernel v0.1):
   - Fase transitoria: `atlas.workspace.json` units coexisten con graph
   - Migration: loader importa units → KnowledgeObjects (ver §27)

3. **Validation split**:
   | Validación | Owner |
   |------------|-------|
   | Metamodel / graph consistency | `@atlas/knowledge` |
   | Structural / pipeline / artifact | `@atlas/compiler` |

4. **Compiler hook** (Sprint futuro en `@atlas/compiler`):
   - Nuevo stage opcional: `KnowledgeValidationStage`
   - Consume `CompilationUnitExporter` output
   - **Fuera de scope Sprint 7** — solo documentado aquí

---

## 20. Runtime integration

KNOWLEDGE-005 §Observed: Runtime produce **observations** que Knowledge captura como evidence.

### Dirección

```text
@atlas/runtime  →  (observations via SDK)  →  @atlas/knowledge
@atlas/knowledge  ↛  @atlas/runtime
```

### Mecanismo

1. **`ObserveOperation`** (KNOWLEDGE-007): ingesta `ExecutionObservation` contract
2. **`ExecutionObservation`** (contract en knowledge):
   - `sessionId`, `artifactId`, `outcome`, `metrics`, `timestamp`
3. Crea `EvidenceRecord` + dispara `TrustCalculator`
4. Transición lifecycle: `operational` → `observed` → `improved` (opcional)

### v1 scope

- Interface `ObservationIngester` definida
- Implementación mínima: manual via SDK `knowledge.observe()`
- Auto-hook desde `RuntimeCompletedEvent`: Sprint SDK futuro

**Knowledge NO ejecuta** — solo registra observaciones (KNOWLEDGE-001 Non-responsibilities).

---

## 21. SDK integration

Patrón espejo de `CompilerModule`, `RuntimeModule`:

### Nuevo módulo `@atlas/sdk`

| Componente | Descripción |
|------------|-------------|
| `KnowledgeModule` | Wraps `KnowledgeEngine` |
| `Atlas.knowledge` | Expuesto en facade `Atlas` |
| `AtlasOptions.knowledge` | Config injectable |

### SDK surface (SDK-202 alignment)

```text
atlas.knowledge
├── createObject(...)
├── connect(...)
├── query(spec)
├── lifecycle.transition(...)
├── exportCompilationUnits(filter)   → fed to atlas.compiler
└── on(event, handler)               → via atlas.events bus
```

### Dependency addition (futuro `package.json` @atlas/sdk)

```text
@atlas/sdk → @atlas/knowledge (new dependency)
```

**Kernel freeze note:** Cambio en `@atlas/sdk` será **minor** bump (0.3.0), no altera contratos existentes de compiler/runtime/events.

---

## 22. Event integration

Patrón `@atlas/runtime`: eventos definidos en `@atlas/knowledge`, publicados via `@atlas/events` bus.

### Eventos propuestos (KNOWLEDGE-007 §Traceable)

| Event | Trigger | Payload key fields |
|-------|---------|-------------------|
| `knowledge.object.created` | CREATE_OBJECT | objectId, kind, owner |
| `knowledge.statement.created` | CREATE_STATEMENT | statementId, objectId |
| `knowledge.relationship.connected` | CONNECT | relationshipId, from, to, type |
| `knowledge.lifecycle.transitioned` | lifecycle ops | objectId, from, to, actor |
| `knowledge.object.versioned` | VERSION | objectId, version, supersedes |
| `knowledge.graph.validated` | VALIDATE_GRAPH | graphId, diagnostics |
| `knowledge.trust.updated` | trust recalc | objectId, trustScore |

**Convención naming:** `knowledge.<entity>.<action>` — alineado con mejora E1 (@atlas/events README).

### Integration con bus existente

- `KnowledgeEventPublisher` adapter → `EventBus.publish()`
- SDK `EventsModule` permite subscribe
- CLI futuro: `atlas knowledge` commands emiten/consumen eventos

**Open decision:** ¿Registrar eventos en `@atlas/events` central registry o solo en knowledge package? Ver §29.

---

## 23. Dependency graph

### Grafo objetivo post-implementación

```text
@atlas/core
    ↑
@atlas/events
    ↑
@atlas/knowledge          ← NEW (depends: core, events)
    ↑
@atlas/compiler           ← adds dependency on knowledge (future sprint)
    ↑
@atlas/runtime            (unchanged initially)
    ↑
@atlas/sdk                ← adds knowledge module
    ↑
@atlas/cli                (unchanged initially)
```

### Dependencias `@atlas/knowledge` v1

| Dependencia | Tipo | Razón |
|-------------|------|-------|
| `@atlas/core` | required | Identifier, Version, Metadata, AtlasError, timestamps |
| `@atlas/events` | required | EventBus adapter |

### Prohibidas

| Dependencia | Razón |
|-------------|-------|
| `@atlas/compiler` | Inversión ARCH-002 |
| `@atlas/runtime` | Inversión |
| `@atlas/sdk` | Inversión |
| `@atlas/memory` | Memory no existe aún; **repository interfaces viven allí**, no en knowledge (AMD-002) |
| `@atlas/retrieval` | Retrieval no existe aún |

---

## 24. Package boundaries

| Boundary | Regla |
|----------|-------|
| Public vs internal | Solo `index.ts`, `contracts/`, `events/` exportados |
| Domain purity | `domain/` y `metamodel/` no importan de `internal/`, stores ni `@atlas/events` |
| Cross-capability | Solo via contracts públicos del consumidor |
| Workspace JSON | Import adapter en `internal/adapters/` — no canonical model |
| Graph vs Knowledge | Graph abstractions owned by knowledge v1 |

### Encapsulamiento

```text
Consumidor permitido          →  Superficie
─────────────────────────────────────────────
@atlas/compiler               →  CompilationUnitExporter contract
@atlas/sdk                    →  KnowledgeEngine facade
@atlas/memory (futuro)        →  Repository interfaces + durable adapters
@atlas/retrieval (futuro)     →  QueryExecutor + GraphTraverser
@atlas/workflow (futuro)      →  Governance + Lifecycle operations
Tests / examples              →  Public API only
```

---

## 25. Export surface

### `package.json` exports propuestos

| Export path | Target |
|-------------|--------|
| `.` | `./dist/index.js` |
| `./metamodel` | `./dist/metamodel/index.js` |
| `./contracts` | `./dist/contracts/index.js` |
| `./events` | `./dist/events/index.js` |

### Barrel `src/index.ts` — allow list

**Exportar:**

- `createKnowledgeEngine`, `KnowledgeEngine`
- Metamodel types + `MetamodelInvariant` definitions
- Snapshot types (readonly interfaces)
- `LifecycleState`, `QueryType`, `OperationType` enums
- Event type constants + type guards
- Factory functions públicas (§12)

**NO exportar:**

- `InMemoryKnowledgeStore` ni cualquier store interno
- Repository interfaces (no existen en knowledge — AMD-002)
- Operation handler classes
- Domain service internals

---

## 26. Test strategy

Alineado con Kernel v0.1 quality gates:

### Pirámide

| Nivel | Foco | Coverage target |
|-------|------|-----------------|
| Unit | Metamodel, VOs, entities, object, factories, validators | ≥ 90% Sprint 8 scope |
| Integration | Operation handlers + InMemoryKnowledgeStore | ≥ 85% (Sprint 9+) |
| Contract | CompilationUnitExporter shape vs compiler | 100% campatibility |
| E2E | knowledge → export → compiler.compile (example) | 1 demo mínimo |

### Suites por carpeta

| Carpeta tests | Contenido |
|---------------|-----------|
| `tests/metamodel/` | Invariants, meta concepts, extension model (Sprint 8) |
| `tests/domain/` | VOs, Statement, Relationship, Object, factories, validators |
| `tests/lifecycle/` | All transitions + illegal transitions |
| `tests/graph/` | Connect/disconnect, broken ref rejection |
| `tests/query/` | Lookup, browse, trace, audit, explain |
| `tests/operations/` | Each OperationType handler |
| `tests/integration/` | Full pipeline create→approve→publish→export |
| `tests/fixtures/` | Sample policies, concepts (from first-atlas-workspace) |

### Fixtures de referencia

Reutilizar semántica de:

- `workspaces/first-atlas-workspace/knowledge/policies/*.json`
- `workspaces/first-atlas-workspace/knowledge/concepts/*.json`

Como **KnowledgeObjects** canonicales en tests (no copiar archivos en package; recrear como fixtures TS).

### Scripts

| Script | Descripción |
|--------|-------------|
| `test` | vitest run |
| `test:coverage` | ≥ 85% statements (match compiler gate) |

---

## 27. Migration strategy

Transición desde Kernel v0.1 workspace model → Knowledge graph:

### Fase M1 — Parallel mode

| Elemento | Estado |
|----------|--------|
| `atlas.workspace.json` units | Siguen funcionando (CLI unchanged) |
| Knowledge graph | Populated via import adapter |
| Compiler | Consume units (existing path) |

### Fase M2 — Export bridge

| Elemento | Estado |
|----------|--------|
| `CompilationUnitExporter` | Generates units from graph |
| Workspace demo | Adds `knowledge-export-demo` example |
| Compiler | Accepts units from either source |

### Fase M3 — Graph primary

| Elemento | Estado |
|----------|--------|
| CLI `atlas knowledge import` | Loads knowledge/ dir → graph |
| workspace.json | Becomes view/projection of graph |
| `@atlas/memory` | Proporciona repository interfaces + storage durable |

### Import adapter (`KnowledgeImportAdapter`)

Mapeo first-atlas-workspace:

| Source | Target |
|--------|--------|
| `knowledge/policies/*.json` | `KnowledgeObject` kind=`Policy` |
| `knowledge/concepts/*.json` | `KnowledgeObject` kind=`Concept` |
| `atlas.workspace.json` units | `KnowledgeStatement` + metadata |
| unit `source.body` | Statement content |

**Sin modificar** archivos workspace existentes en M1.

---

## 28. Risks

| ID | Riesgo | Impacto | Mitigación |
|----|--------|---------|------------|
| K-R01 | Scope creep hacia retrieval/search | Alto | Strict non-responsibilities; QueryExecutor minimal v1 |
| K-R02 | Duplicación con `@atlas/graph` stub | Medio | Graph abstractions in knowledge v1; defer graph package |
| K-R03 | Metamodel enum drift vs KNOWLEDGE docs | Alto | Single `LifecycleState` source; doc-driven tests |
| K-R04 | Compiler dependency inversion | Crítico | Exporter interface only; compiler sprint separado |
| K-R05 | Event namespace collision | Medio | Prefix `knowledge.*`; document in SDK-204 addendum |
| K-R06 | In-memory store no escala | Medio | Repository interfaces en `@atlas/memory`; dominio sin ports (AMD-002) |
| K-R07 | Statement immutability vs UX | Medio | `supersedes` chain; UI/API design in SDK sprint |
| K-R08 | Federation complexity early | Bajo | `SubgraphRef` interface only; no impl v1 |
| K-R09 | Trust algorithm premature | Medio | Rule-based v1; ML deferred to retrieval/agent |
| K-R10 | Breaking Kernel freeze | Crítico | Zero changes to @atlas/core contracts; sdk minor only |

---

## 29. Open architectural decisions

Requieren resolución del Architecture Board **antes** de Sprint 8 (salvo resueltas por enmiendas):

| ID | Decisión | Opciones | Resolución |
|----|----------|----------|------------|
| OAD-01 | `@atlas/graph` vs graph in knowledge | A) Todo en knowledge B) Split graph package | **A** para v1 |
| OAD-02 | Event registry location | A) `@atlas/knowledge/events` B) Centralize in `@atlas/events` | **A** (runtime pattern) |
| OAD-03 | Lifecycle enum canonical | A) KNOWLEDGE-005 full B) KNOWLEDGE-001 subset | **A** with `executable` alias |
| OAD-04 | Statement storage | A) Embedded in object B) Separate repository | **A** v1 — **AMD-002**: no repository interfaces in knowledge |
| OAD-05 | Relationship aggregate | A) Graph-owned B) Object-owned | **A** graph-owned edges |
| OAD-06 | SDK exposure breadth | A) Full operations B) Read + export only v1 | **B** incremental |
| OAD-07 | `@atlas/ontology` boundary | A) ontology validates kinds B) knowledge owns kinds | **B** v1 |
| OAD-08 | Version numbering | A) Per-object semver B) Global graph version | **A** |
| OAD-09 | CLI commands scope | A) New `atlas knowledge` B) SDK-only v1 | **B** v1 |
| OAD-10 | Compiler stage vs exporter | A) Pull exporter in compiler B) SDK orchestrates | **B** |
| OAD-11 | Repository interfaces location | A) In `@atlas/knowledge` B) In `@atlas/memory` | **B** — **AMD-002 RESUELTO** |
| OAD-12 | Sprint 8 entry point | A) VOs first B) Metamodel first | **B** — **AMD-001 RESUELTO** |

---

## 30. Recommended implementation order

Alineado con KNOWLEDGE-008 maturity stages 1–4 (Foundation → Executable):

### Sprint 8 — Metamodel + Domain Core (Stage 1) — AMD-001

**Prerrequisito:** Package scaffold mínimo (deps `@atlas/core`, exports, `tests/metamodel/`, README) — no engine ni store.

| Orden | Entregable | AMD |
|-------|------------|-----|
| 8.1 | **Knowledge Metamodel** completo (`src/metamodel/`) — MetaLayer, MetaConcept, invariants, extension model | AMD-001 paso 1 |
| 8.2 | **Value Objects** — todos los VOs §7 conformes al metamodel | AMD-001 paso 2 |
| 8.3 | **Entity `KnowledgeStatement`** | AMD-001 paso 3 |
| 8.4 | **Entity `KnowledgeRelationship`** | AMD-001 paso 4 |
| 8.5 | **Aggregate `KnowledgeObject`** | AMD-001 paso 5 |
| 8.6 | **Factories** — createObject, createStatement, createRelationship | AMD-001 paso 6 |
| 8.7 | **Validators** — MetamodelValidator + Identity, Statement, Relationship, Context | AMD-001 paso 7 |
| 8.8 | Unit tests ≥90% sobre scope Sprint 8 (metamodel + domain core) | — |

**Explícitamente fuera de Sprint 8 (AMD-002):** repository interfaces, `InMemoryKnowledgeStore`, graph aggregate, lifecycle FSM, operations, engine facade.

### Sprint 9 — Graph + Lifecycle + In-Memory Store (Stage 2–3)

| Orden | Entregable |
|-------|------------|
| 9.1 | `InMemoryKnowledgeStore` (internal/store — **sin interface port**) |
| 9.2 | Aggregate: `KnowledgeGraph` |
| 9.3 | GraphConsistencyService + GraphValidator |
| 9.4 | LifecycleStateMachine + all transitions |
| 9.5 | HistoryRecorder + `HistoryEntry` entity |
| 9.6 | Relationship operations: CONNECT, DISCONNECT |
| 9.7 | Integration tests: graph invariants + store |

### Sprint 10 — Operations + Query (Stage 3)

| Orden | Entregable |
|-------|------------|
| 10.1 | OperationDispatcher + all handlers |
| 10.2 | QuerySpec, QueryExecutor (in-memory) |
| 10.3 | GraphTraverser + explain |
| 10.4 | Governance operations |
| 10.5 | KnowledgeEngine facade |
| 10.6 | Domain events + EventPublisher |

### Sprint 11 — Platform Integration (Stage 4)

| Orden | Entregable |
|-------|------------|
| 11.1 | CompilationUnitExporter |
| 11.2 | KnowledgeImportAdapter (workspace migration) |
| 11.3 | `@atlas/sdk` KnowledgeModule (0.3.0) |
| 11.4 | Example: `knowledge-graph-demo` |
| 11.5 | Example: `knowledge-to-compiler-demo` |
| 11.6 | CHANGELOG, docs, coverage gate |

### Sprint 12+ — Observable / Learning (Stage 5–6)

Deferred per KNOWLEDGE-008:

- ObservationIngester + runtime hook
- `@atlas/memory` repository interfaces + durable storage adapters
- `@atlas/retrieval` QueryExecutor replacement
- Trust evolution algorithms

---

## Approval gate

| Requisito | Estado |
|-----------|--------|
| Documento completo (30 secciones) | ✅ |
| Sin código TypeScript | ✅ |
| Alineado KNOWLEDGE-001–008 | ✅ |
| Respeta Kernel v0.1 freeze | ✅ |
| Architecture Review | ✅ **APROBADO** (AMD-001, AMD-002) |
| Plan v1.1.0 actualizado | ✅ |
| **Autorización Sprint 8** | ✅ **AUTORIZADO** (v1.2.0 + AG-001) |

---

**Sprint 8 en ejecución** — ver §30 orden 8.1–8.8.

---

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-07-18 | Initial architectural implementation plan — Sprint 7 |
| 1.1.0 | 2026-07-18 | Architecture Review approved — AMD-001 metamodel-first, AMD-002 no repository interfaces |
| 1.2.0 | 2026-07-18 | Sprint 8 authorized — AG-001 reflective semantic metamodel constraint |
