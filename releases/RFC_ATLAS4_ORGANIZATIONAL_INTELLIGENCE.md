# RFC — ATLAS 4: Organizational Intelligence

**Estado:** Propuesta (investigación + diseño, sin implementación)  
**Fecha:** 2026-08-16  
**Alcance:** Pasar de razonar sobre documentos a razonar sobre entidades, hechos, relaciones y políticas aplicables.  
**Casos ancla:** (1) descuento 12% a Constructora Andes; (2) garantía 45→60 días.

---

## Resumen ejecutivo

`@atlas/memory` ya contiene un **modelo de dominio rico** (Record, Version, Relationship, Namespace, Collection) con repositorios internos probados, pero la **superficie pública certificada** (`MemoryEngine.store/search/retrieve/update/delete` sobre `MemoryRecord` plano) y el **SDK** (`MemoryModule.storeContent/searchContent`) operan hoy en un camino **plano y textual** que ignora versiones y relaciones.

ATLAS 4.1 puede arrancar como **vertical slice en `@atlas/sdk`** usando convenciones sobre `MemoryRecord` existente **sin ADR**. Para activar de forma nativa los repositorios internos (`VersionRepository`, `RelationshipRepository`) vía API pública del engine, **sí se requeriría ADR** porque extendería la superficie certificada de `@atlas/memory`.

---

## Paso 1 — Auditoría de `@atlas/memory` (y consumo actual)

### 1.1 Primitivos de dominio confirmados en código

| Componente | Qué hay | Evidencia |
|------------|---------|-----------|
| **Record** (contenedor de entidad versionada) | `recordId`, `namespaceId`, `collectionId`, `recordType`, `status`, `currentVersion`, metadata | `packages/memory/src/domain/entities/record.ts` L9–L20 |
| **Version** (contenido versionado inmutable) | `revision`, `content`, `checksum`, `author`, enlace a `recordId` | `packages/memory/src/domain/entities/version.ts` L7–L16 |
| **Relationship** (grafo entre records) | `sourceRecord`, `targetRecord`, `relationshipType`, metadata | `packages/memory/src/domain/entities/relationship.ts` L6–L12 |
| **Collection / Namespace** (ámbito organizacional de almacenamiento) | IDs tipados + metadata | `collection.ts` L6–L12, `namespace.ts` L5–L11 |
| **RecordType** | String libre validado no vacío — **no hay taxonomía fija** | `record-type.ts` L10–L17 |
| **RecordStatus** | `active`, `archived`, `deleted`, `locked`, `pending` | `record-status.ts` L1–L7 |
| **RelationshipType** | `parent`, `child`, `reference`, `dependency`, `related`, `derived` — **sin semántica de negocio** (p. ej. `applies_to`, `approves`) | `relationship-type.ts` L1–L8 |
| **RecordAggregate** | Agrega record + versiones; resuelve versión vigente | `record-aggregate.ts` L5–L20 |
| **Factories** | `createRecord`, `createVersion`, `createRelationship`, `evolveRecord`, `projectMemoryRecord` | `memory-factories.ts` L92–L176 |
| **Proyección persistida** | Records de dominio ↔ `MemoryRecord`; entidades internas tipadas `Namespace`, `Collection`, `Version`, `Relationship` | `repository-projections.ts` L23–L26, L109–L215 |

### 1.2 Repositorios internos (implementados, no productizados)

| Repositorio | Operaciones clave | Evidencia |
|-------------|-------------------|-----------|
| `VersionRepository` | `appendVersion`, `getCurrentVersion`, `getHistory` | `VersionRepository.ts` L34–L139 |
| `RelationshipRepository` | `link`, `unlink`, `getRelationships` | `RelationshipRepository.ts` L32–L76 |
| `RecordRepository` | `createRecord`, `listRecords` (excluye entidades internas del listado) | `RecordRepository.ts` L42–L64, L185–L194 |
| `NamespaceRepository` / `CollectionRepository` | CRUD de ámbito | Instanciados en engine L68–L69 |

### 1.3 MemoryEngine — wiring vs camino real del producto

```text
Colaboradores internos (L67–L73):
  namespace, collection, record, version, relationship
  → accesibles solo vía getCollaborators() @internal (L82–L85)

API pública operacional (L133–L364):
  store / retrieve / search / update / delete
  → operan directamente sobre MemoryRecord plano vía StorageProvider
  → NO invocan RecordRepository.createRecord ni VersionRepository.appendVersion
```

**Conclusión:** el dominio rico existe y tiene tests (`memory-repositories.test.ts`), pero el **camino CLI/Web/SDK** usa el bypass plano de `MemoryEngine.store()`.

### 1.4 Superficie pública certificada (`packages/memory/src/index.ts`)

Exporta únicamente:

- `MemoryEngine`, `createMemoryEngine`, `createJsonFileMemoryEngine`
- Tipos: `MemoryRecord`, `MemoryQuery`, `SearchResult`, etc. (L9–L17)
- Códigos de error MEMORY-008 (L21–L28)

**NO exporta:** entidades de dominio, repositorios, factories, `getCollaborators`. Confirmado también en `public-api.test.ts` L40–L41 (“without leaking internal modules”).

### 1.5 SDK — qué llega al producto

`MemoryModule` (`memory-module.ts`):

| Método | Comportamiento | Evidencia |
|--------|----------------|-----------|
| `storeContent` | Crea `MemoryRecord` con `content: { text }`, `recordType` default `CliMemory`, metadata plana | L154–L167 |
| `searchContent` | `engine.search` + filtro tokenizado en texto; **sin** versiones ni relaciones | L197–L217 |
| `getEngine()` | Expone `MemoryEngine` público, pero el módulo no usa colaboradores internos | L150–L152 |

`llm-module.ts` expone herramientas `memory_search` / `memory_store` sobre ese facade textual (L228–L279).

### 1.6 `@atlas/retrieval`

`runRetrievalPipeline` (`retrieval-pipeline.ts`):

- Entrada: `MemoryEngine.search` por namespace (L102)
- Ranking: coincidencia de términos en texto extraído de `MemoryRecord.content` (L46–L70)
- Salida: `{ recordId, recordType, text, score, timestamp }` (L73–L80)

**No hay** resolución de grafo, versión vigente ni políticas. Es retrieval lexical sobre registros planos.

### 1.7 Tabla — Qué ya existe vs qué falta

| Concepto | Estado | Detalle confirmado en código |
|----------|--------|------------------------------|
| **Entity** | **Existe parcialmente** | Primitivo reusable: entidad `Record` (`record.ts` L9–L20) + proyección `MemoryRecord` (`memory-types.ts` L4–L11). Falta: taxonomía de entidades de negocio, resolución por identidad estable en SDK, API productiva que use `RecordRepository` en lugar del bypass plano. |
| **Fact** | **Existe parcialmente** | No hay tipo `Fact` en dominio. Convención de `recordType: 'Fact'` solo en tests (`memory-engine.test.ts` L28, L150). `RecordType.create()` acepta cualquier string (`record-type.ts` L10–L17). Falta: esquema de hecho atómico, vigencia temporal, enlace a entidad/policy. |
| **Relationship** | **Existe parcialmente** | Entidad `Relationship` (`relationship.ts` L6–L12), enum genérico (`relationship-type.ts` L1–L8), repo `link/unlink/getRelationships` (`RelationshipRepository.ts` L32–L76), proyección persistida (`repository-projections.ts` L187–L215). Falta: tipos de relación de negocio, exposición SDK, traversal en búsqueda/razonamiento, wiring desde `MemoryEngine.store`. |
| **Policy** | **No existe** | No hay entidad, value object ni `recordType` reservado para políticas en `@atlas/memory`. Solo texto libre en `MemoryRecord.content`. *Nota:* `@atlas/knowledge` define `ObjectKind.Policy` en su metamodelo (fuera del alcance de memory; ver v2). |
| **Decision** | **No existe** | Sin primitivo en `@atlas/memory`. |
| **Evidence** | **No existe** | Sin primitivo en `@atlas/memory`. (`MetaConceptId.Evidence` vive en `@atlas/knowledge`, no en memory.) |
| **Knowledge Version** | **Existe parcialmente** | Entidad `Version` (`version.ts` L7–L16), `Record.currentVersion` (`record.ts` L17), `VersionRepository.appendVersion/getHistory/getCurrentVersion` (`VersionRepository.ts` L34–L139), inmutabilidad (`record-aggregate.ts` L23–L34). Falta: API pública/engine route, resolución “verdad vigente” en SDK/retrieval, ingestión que versione en lugar de duplicar documentos. |
| **Context** | **Existe parcialmente** | `Namespace`/`Collection` acotan almacenamiento (`namespace.ts`, `collection.ts`). `MemorySessionContext` es contexto de **ejecución de sesión**, no contexto organizacional de negocio (`memory-session-context.ts` L3–L11). Falta: dimensiones temporales/organizacionales aplicables a políticas y hechos. |
| **Event** | **No existe** | Sin entidad Event en dominio memory. |
| **Action** | **No existe** | Sin entidad Action en dominio memory. |

---

## Paso 2 — Modelo mínimo para los dos casos reales

Principio: **reutilizar primitivos existentes** (`Record`, `Version`, `Relationship`, `RecordStatus`, `RelationshipType`) con **convenciones de `recordType` y `content` JSON**, sin inventar tipos de dominio nuevos en `@atlas/memory` en esta fase.

### 2.1 Convenciones compartidas (ATLAS 4.1)

```typescript
// Convenciones SDK — NO son exports de @atlas/memory hoy
type OrgRecordType = 'Client' | 'DiscountPolicy' | 'WarrantyPolicy' | 'ApprovalRule';

// RelationshipType existente: usar Reference para "cliente referenciado por política"
// RelationshipType existente: usar Dependency para "política depende de regla de aprobación"
```

Ámbito: `namespaceId: 'org.default'`, `collectionId: 'org.entities'` (metadata en `MemoryRecord`, compatible con proyección `recordToMemoryRecord` en `repository-projections.ts` L109–L124).

---

### 2.2 Caso 1 — Descuento 12% a Constructora Andes

#### Datos concretos

**1. Record — Cliente**

```json
{
  "id": "record.client.constructora-andes",
  "type": "Client",
  "content": {
    "legalName": "Constructora Andes S.A.",
    "segment": "VIP",
    "renewalActive": true
  },
  "metadata": {
    "namespaceId": "org.default",
    "collectionId": "org.entities",
    "owner": "sales.ops",
    "status": "active",
    "revision": 1
  }
}
```

Mapeo a primitivos: entidad `Record` con `recordType = RecordType.create('Client')` (`record.ts` L13), `status = RecordStatus.Active` (`record-status.ts` L2).

**2. Record — Política de descuento**

```json
{
  "id": "record.policy.discount.autonomous",
  "type": "DiscountPolicy",
  "content": {
    "policyCode": "DISCOUNT-VIP-2026",
    "autonomousMaxPercent": 10,
    "currency": "USD"
  },
  "metadata": {
    "namespaceId": "org.default",
    "collectionId": "org.policies",
    "owner": "revenue.ops",
    "status": "active",
    "revision": 1
  }
}
```

**3. Record — Regla de aprobación**

```json
{
  "id": "record.rule.discount-approval",
  "type": "ApprovalRule",
  "content": {
    "appliesWhen": "discountPercent > autonomousMaxPercent",
    "approverRole": "SalesDirector",
    "approverQueue": "sales-directors"
  },
  "metadata": { "status": "active", "revision": 1 }
}
```

**4. Relationships (persistidos como entidad `Relationship` o proyección equivalente)**

| sourceRecord | targetRecord | relationshipType | Semántica SDK |
|--------------|--------------|------------------|---------------|
| `record.client.constructora-andes` | `record.policy.discount.autonomous` | `reference` | Cliente VIP gobernado por política |
| `record.policy.discount.autonomous` | `record.rule.discount-approval` | `dependency` | Política exige aprobación sobre umbral |

Usar `RelationshipType.Reference` y `RelationshipType.Dependency` (`relationship-type.ts` L4–L5).

#### Trazado de la pregunta

**Pregunta:** *¿Puedo ofrecerle 12% de descuento a Constructora Andes?*

| Paso | Acción | Primitivo |
|------|--------|-----------|
| 1 | Resolver entidad cliente por identificador o búsqueda acotada `recordType=Client` + `legalName` | `Record` / `MemoryRecord` |
| 2 | Verificar `segment === 'VIP'` y `renewalActive === true` | `content` del Record |
| 3 | Seguir relación `reference` → política de descuento | `RelationshipRepository.getRelationships` o registro `type: Relationship` |
| 4 | Leer `autonomousMaxPercent` (10) | `content` de DiscountPolicy |
| 5 | Comparar 12 > 10 → **no autónomo** | Lógica SDK |
| 6 | Seguir relación `dependency` → ApprovalRule | `Relationship` |
| 7 | Responder con veredicto + responsable | `approverRole: SalesDirector` |

**Respuesta esperada (estructurada):**

```text
No puedes aplicar 12% de forma autónoma.
Límite autónomo: 10% (política DISCOUNT-VIP-2026).
Cliente Constructora Andes califica (VIP, renovación activa).
Requiere aprobación de SalesDirector.
```

#### Qué NO alcanza el modelo actual sin SDK

- `memory_search` hoy devuelve fragmentos textuales mezclados; no traversa relaciones (`memory-module.ts` L197–L217).
- `RelationshipRepository` no es invocable desde SDK (solo `@internal` vía `getCollaborators()`).

---

### 2.3 Caso 2 — Garantía 45 → 60 días

#### Datos concretos

**Record padre — política de garantía**

```json
{
  "id": "record.policy.warranty.standard",
  "type": "WarrantyPolicy",
  "content": {
    "policyCode": "WARRANTY-STD",
    "warrantyDays": 60,
    "effectiveFrom": "2026-06-01"
  },
  "metadata": {
    "namespaceId": "org.default",
    "collectionId": "org.policies",
    "status": "active",
    "revision": 2,
    "updatedAt": "2026-06-01T00:00:00.000Z"
  }
}
```

**Versión 1 (histórica, inmutable)**

```json
{
  "id": "version.warranty.standard.r1",
  "type": "Version",
  "content": {
    "recordId": "record.policy.warranty.standard",
    "revision": 1,
    "content": { "policyCode": "WARRANTY-STD", "warrantyDays": 45, "effectiveFrom": "2025-01-01" },
    "checksum": "sha256:…",
    "author": "legal.ops"
  }
}
```

**Versión 2 (vigente)** — creada con `VersionRepository.appendVersion` (`VersionRepository.ts` L34–L100):

- Actualiza `Record.currentVersion` de 1 → 2 (`evolveRecord`, `memory-factories.ts` L147–L175)
- Proyección `recordToMemoryRecord` deja en el Record principal solo el contenido **vigente** (`repository-projections.ts` L109–L124)
- La revisión 1 permanece como entidad `Version` separada (`versionToMemoryRecord`, L156–L169)

**RecordStatus:** el Record padre permanece `active` (`record-status.ts` L2). La política anterior no se borra: queda en historial de versiones (no requiere `archived` en el Record padre).

#### Trazado de la pregunta

**Pregunta:** *¿Cuál es el plazo de garantía vigente?*

| Paso | Acción | Primitivo |
|------|--------|-----------|
| 1 | Localizar `record.policy.warranty.standard` (`recordType=WarrantyPolicy`) | `Record` |
| 2 | Leer `metadata.revision` (= 2) | `Record.currentVersion` |
| 3 | Obtener versión vigente | `VersionRepository.getCurrentVersion(aggregate)` (`VersionRepository.ts` L117–L128) **o** leer `content` proyectado del Record principal |
| 4 | Responder **60 días** con `effectiveFrom: 2026-06-01` | `Version.content` |
| 5 | Si preguntan histórico | `getHistory` → incluye revisión 1 con 45 días (`VersionRepository.ts` L131–L138) |

**Pregunta de auditoría:** *¿Qué decía la política antes del cambio?*

→ `getHistory` → revisión 1 → 45 días. Inmutabilidad garantizada por `assertVersionImmutable` (`record-aggregate.ts` L23–L34).

#### Cómo evitar confusión en búsqueda

Problema actual: `searchContent` indexa texto de **todos** los registros; una búsqueda “garantía 45 días” podría devolver la versión histórica.

Reglas SDK ATLAS 4.1:

1. Para preguntas normativas (“¿cuál manda?”), **no usar búsqueda lexical como fuente de verdad**.
2. Resolver por identidad de Record + `getCurrentVersion` / `metadata.revision`.
3. Excluir del ranking lexical registros `type === 'Version'` salvo modo explícito “histórico” (alineado a `RecordRepository.listRecords` L185–L190).

---

## Paso 3 — Plan de implementación ATLAS 4.1 (estimado, no ejecutado)

### 3.1 División `@atlas/memory` vs `@atlas/sdk`

| Capa | ATLAS 4.1 recomendado (sin ADR) | ATLAS 4.1+ (con ADR) |
|------|----------------------------------|----------------------|
| **`@atlas/memory`** | **Sin cambios** en superficie pública. Repos internos siguen disponibles solo para tests vía `getCollaborators()`. | Nuevos métodos públicos en `MemoryEngine` que orquesten colaboradores (p. ej. `storeRecordWithVersion`, `appendVersion`, `linkRecords`) **sin** exportar repositorios. |
| **`@atlas/sdk`** | **Todo el vertical slice:** esquemas JSON, servicio de resolución de entidades, traversal de relaciones sobre registros persistidos, evaluador de políticas, resolución de versión vigente, nuevas herramientas LLM. | Adaptar a API enriquecida del engine cuando exista. |
| **`@atlas/retrieval`** | Sin cambios obligatorios en 4.1. | Pipeline que consulte versión vigente antes de rankear (post-ADR). |

### 3.2 ¿Requiere ADR?

| Escenario | ¿ADR? | Por qué |
|-----------|-------|---------|
| **4.1 mínimo en SDK** usando solo `MemoryEngine.store/search/retrieve` + convenciones sobre `MemoryRecord` | **No** | No modifica exports certificados de `@atlas/memory` (`index.ts` L6–L30). ADR-0003 L238–L264 congela la API pública actual; convenciones en SDK son capa superior. |
| **Exponer colaboradores, entidades de dominio o repositorios** | **Sí** | Viola ADR-0003 § Entity Repositories (“Never public API”, L159–L168) y § Public API (L238–L264). |
| **Agregar métodos públicos al MemoryEngine** para versionado/relaciones | **Sí** | Cambio de superficie operacional certificada; requiere ADR complementario (p. ej. ADR-0006) + actualización MEMORY-008. |
| **Cambiar forma de `MemoryRecord` o códigos de error públicos** | **Sí** | Contrato congelado MEMORY-008. |

**Recomendación:** ejecutar **4.1 sin ADR** en SDK; planificar **ADR-0006** en paralelo si se confirma que el bypass plano (`MemoryEngine.store` L133–L187) debe eliminarse a favor de rutas domain-aware.

### 3.3 Vertical slice mínimo ATLAS 4.1

#### A. Entidades reconocidas (~6–8 archivos nuevos en SDK)

| Archivo (propuesto) | Responsabilidad |
|---------------------|-----------------|
| `packages/sdk/src/org/schemas/client.ts` | Esquema Client + validación |
| `packages/sdk/src/org/schemas/discount-policy.ts` | Esquema DiscountPolicy |
| `packages/sdk/src/org/schemas/warranty-policy.ts` | Esquema WarrantyPolicy |
| `packages/sdk/src/org/schemas/approval-rule.ts` | Esquema ApprovalRule |
| `packages/sdk/src/org/entity-resolver.ts` | Resolución por id / recordType + claves de negocio |
| `packages/sdk/src/org/entity-store.ts` | Persistencia vía `MemoryEngine.store` con metadata estructurada |
| `packages/sdk/src/modules/org-memory-module.ts` | Facade público SDK |
| `packages/sdk/tests/org-entity-resolver.test.ts` | Tests |

#### B. Relationships (~3–5 archivos)

| Archivo (propuesto) | Responsabilidad |
|---------------------|-----------------|
| `packages/sdk/src/org/relationship-store.ts` | Persistir/leer registros `type: Relationship` con forma `RelationshipContent` (`repository-projections.ts` L46–L50) |
| `packages/sdk/src/org/graph-traversal.ts` | `getRelated(recordId, relationshipType?)` |
| `packages/sdk/tests/org-graph-traversal.test.ts` | Tests caso Andes |
| Modificar `packages/sdk/src/modules/llm-module.ts` | Herramienta `org_resolve` o ampliar `memory_search` con modo estructurado |

#### C. Políticas aplicadas (~4–6 archivos)

| Archivo (propuesto) | Responsabilidad |
|---------------------|-----------------|
| `packages/sdk/src/org/policy-evaluator.ts` | Evaluación descuento (caso 1) |
| `packages/sdk/src/org/version-resolver.ts` | Versión vigente + historial (caso 2) |
| `packages/sdk/src/org/policy-answer.ts` | Respuesta estructurada (veredicto + evidencia) |
| `packages/sdk/tests/org-policy-evaluator.test.ts` | Tests ambos casos |
| `packages/sdk/tests/org-version-resolver.test.ts` | Tests garantía 45/60 |

**Totales estimados:** ~15–20 archivos nuevos/modificados, **casi todo en `@atlas/sdk`**. `@atlas/memory`: 0 archivos en ruta sin ADR.

### 3.4 Riesgos

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Duplicar lógica de `VersionRepository` en SDK | Inconsistencia con dominio memory | Tests de conformidad contra fixtures de `memory-repositories.test.ts`; plan de convergencia post-ADR |
| Búsqueda lexical devuelve versión obsoleta | Respuesta incorrecta (caso garantía) | Política: preguntas normativas usan `version-resolver`, no `searchContent` |
| Relaciones almacenadas como registros sueltos sin validación de repo | Grafos huérfanos | Validar existencia de `sourceRecord`/`targetRecord` en SDK antes de `link` |
| Convenciones `recordType` ad hoc | Fragmentación | Registry central en SDK; documentar mapping a primitivos memory |
| Kernel frozen | Bloqueo si se necesita API memory | Fase 1 SDK-only explícita; ADR antes de tocar `@atlas/memory` |

### 3.5 Suites de test a ejecutar post-implementación

**Obligatorias (regresión kernel + SDK):**

| Paquete | Archivos / suite |
|---------|------------------|
| `@atlas/memory` | `tests/public-api.test.ts`, `tests/engine/memory-engine.test.ts`, `tests/repositories/memory-repositories.test.ts`, `tests/application/architecture-boundaries.test.ts`, suite completa `packages/memory/tests/**` (22 archivos) |
| `@atlas/sdk` | `tests/memory-module.test.ts`, `tests/llm-module.test.ts`, `tests/retrieval-integration.test.ts`, nuevos `tests/org-*.test.ts` |
| `@atlas/retrieval` | Tests del paquete retrieval (si se toca integración) |

**Recomendadas (producto):**

| Paquete | Motivo |
|---------|--------|
| `apps/web` | Chat usa SDK memory tools |
| `@atlas/cli` | Sesión chat + herramientas LLM |

**Gate completo:** build, typecheck, lint, test monorepo (46 workspaces / suites actuales según último gate en `main`).

---

## Fuera de alcance — v2

Backlog para RFC futuros; **no diseñar ni implementar en ATLAS 4.1:**

| Tema | Motivo de exclusión |
|------|---------------------|
| Taxonomía completa de subtipos Entity (Person, Organization, Client, Product, Project, Department) | Solo dos casos ancla; `RecordType` libre basta por ahora |
| Formalización general de **Decision** y **Evidence** | Casos 1–2 no lo requieren; metamodelo `@atlas/knowledge` (`MetaConceptId.Evidence`, L358–L387) es vía alternativa |
| **Context** organizacional rico (dimensiones temporales/regulatorias) | `MemorySessionContext` ≠ contexto de negocio; `@atlas/knowledge` ContextScope es integración v2 |
| **Event** / **Action** | Sin primitivos memory; requieren modelo de auditoría operacional |
| Integración Knowledge → Memory estructurado | Compiler/projection de `@atlas/knowledge` a registros org |
| Nuevos `RelationshipType` de negocio en kernel | Requeriría ADR + cambio dominio memory |
| UI dedicada para grafo organizacional | ATLAS 4 es capacidad cognitiva, no feature UI |

---

## Decisión propuesta

1. **Aprobar ATLAS 4.1 como vertical slice en `@atlas/sdk`**, reutilizando primitivos memory vía convenciones sobre `MemoryRecord`, `Relationship` persistido y resolución de versión vigente en capa SDK.
2. **No tocar `@atlas/memory` certificado** en 4.1 → **sin ADR**.
3. **Abrir ADR-0006** cuando se decida exponer versionado/relaciones como API pública del `MemoryEngine`, eliminando el bypass plano del camino producto.
4. Validar los dos casos ancla con tests SDK antes de expandir taxonomía (v2).

---

## Referencias de código auditadas

- `packages/memory/src/domain/entities/*.ts`
- `packages/memory/src/domain/value-objects/relationship-type.ts`, `record-status.ts`, `record-type.ts`
- `packages/memory/src/repositories/*.ts`
- `packages/memory/src/engine/MemoryEngine.ts`
- `packages/memory/src/index.ts`
- `packages/sdk/src/modules/memory-module.ts`
- `packages/retrieval/src/retrieval-pipeline.ts`
- `adr/ADR-0003-MEMORY_ARCHITECTURE_RESOLUTION.md`
