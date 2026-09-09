# RFC — ATLAS 4.2: Decision + Evidence

**Estado:** Propuesta (investigación + diseño, sin implementación)  
**Fecha:** 2026-08-17  
**Base:** ATLAS 4.1 en `main` (commits `fef9356`, `86daf79`, `7bd13c7`)  
**Alcance:** Completar el modelo de Organizational Intelligence con **Decision** y **Evidence**, apoyándose en el grafo org existente (Entities, Relationships, Policies versionadas).  
**Caso ancla:** Aprobación del 12% de descuento a Constructora Andes — registrar quién decidió, cuándo, con qué evidencia, y responder por chat.

---

## Resumen ejecutivo

ATLAS 4.1 resuelve **si** un descuento requiere aprobación (`org_evaluate_discount`) y **cómo** versionar políticas, pero se detiene antes de registrar **decisiones tomadas** ni **evidencia citada**. Esas dos piezas pueden modelarse con los **mismos primitivos** que ya usa 4.1 (`MemoryRecord` + convenciones JSON + registros `Relationship`), **sin tocar `@atlas/memory`**.

Se proponen dos nuevos `recordType` SDK (`Decision`, `Evidence`), dos tipos de relación semántica nuevos (`resolves`, `cites`), y extensión acotada de `entity-store` / `entity-resolver` / `graph-traversal` / tools LLM. **No requiere ADR** si se mantiene todo en `@atlas/sdk` sobre `storeContent`/`searchContent`, igual que ATLAS 4.1.

**Orden de magnitud estimado:** ~10–14 archivos nuevos o modificados en `@atlas/sdk` — comparable al incremento de chat data entry (`7bd13c7`), menor que el vertical slice inicial de 4.1 (~20 archivos).

---

## Paso 1 — Auditoría del código actual (post ATLAS 4.1)

### 1.1 Qué ya existe y alcanza sin cambios en `@atlas/memory`

| Primitivo / patrón | Estado en producto | Relevancia para Decision/Evidence |
|--------------------|-------------------|-----------------------------------|
| `MemoryModule.storeContent` | Crea `MemoryRecord` plano con `content.text` JSON | **Sí** — persistencia de Decision/Evidence igual que Client |
| `MemoryModule.searchContent({ recordType })` | Lista por tipo + filtro namespace `cli.default` | **Sí** — resolución por `recordType` + matcher en memoria |
| Registros `Relationship` (`relationship-store.ts`) | `linkEntities` persiste arista determinística `relationship.<source>.<type>.<target>` | **Sí** — enlazar Decision→Client, Decision→Evidence |
| Dedupe por `entityId` (`entity-resolver.ts` L28–L52) | “El más nuevo gana” por timestamp | **Sí** — red de seguridad si se reescribe (no esperado en Decision) |
| `Version` + `storeEntityVersion` | Historial inmutable de políticas | **No aplica** — Decision/Evidence son **inmutables por diseño** (registro auditado, no versionado) |
| `upsertEntity` | Versionado automático solo para políticas | **Parcial** — Evidence/Decision usan `storeEntity` (append-only); correcciones futuras vía dedupe si hiciera falta |
| `getRelated` (`graph-traversal.ts`) | Traversal **saliente** source → target | **Parcial** — sirve Decision→Evidence (`cites`); consultas desde Client requieren matcher o traversal inverso |
| `@atlas/memory` `RelationshipType` enum | `parent`, `child`, `reference`, `dependency`, `related`, `derived` | **No bloquea** — SDK ya usa strings libres (`constants.ts` L14–16: “semantic consistency only”) |

**Conclusión:** los primitivos de persistencia y relación **alcanzan**. No hace falta nuevo primitivo en `@atlas/memory`.

### 1.2 Gaps en `@atlas/sdk` que la implementación 4.2 debe cerrar

| Gap | Evidencia | Impacto |
|-----|-----------|---------|
| `ORG_ENTITY_RECORD_TYPES` solo incluye Client/Policies/ApprovalRule | `constants.ts` L18–23 | `resolveEntityById` y `linkEntities` **no resuelven** Decision ni Evidence hoy |
| `linkEntities` exige que source **y** target existan vía `resolveEntityById` | `relationship-store.ts` L30–40 | No se puede enlazar Decision→Client ni Decision→Evidence sin ampliar tipos resolubles |
| `assertEntityContent` / `storeEntity` no conocen Decision/Evidence | `entity-store.ts` L40–48 | Hay que extender validación y `resolveCollectionId` |
| No hay evaluador/resolver de decisiones | — | Falta lógica de consulta “¿quién aprobó X y por qué?” |
| Tools LLM no registran ni consultan decisiones | `llm-module.ts` — 7 tools org existentes | Falta ruta chat para registrar aprobación + evidencia y para preguntar |

Estos gaps son **extensiones locales del módulo org**, no cambios de contrato en memory.

### 1.3 ¿Hace falta un tipo de relación nuevo?

**Sí, a nivel SDK** — dos constantes semánticas adicionales:

| Tipo SDK | Dirección | Semántica | ¿Existe en memory enum? |
|----------|-----------|-----------|-------------------------|
| `resolves` | Decision → entidad del grafo (Client, Policy, …) | La decisión **resuelve** una solicitud sobre esa entidad | No (string libre en SDK, como `reference`/`dependency`) |
| `cites` | Decision → Evidence | La decisión **cita** esa evidencia al decidir | No |

**No reutilizar `reference`/`dependency` para estos casos:** ya tienen semántica fijada en 4.1 (Client→Policy, Policy→ApprovalRule). Mezclar Decision en esas aristas confundiría `evaluateDiscountRequest` y el traversal del Caso 1.

**Alternativa descartada:** modelar Evidence como campo embebido en Decision sin registro propio. Rechazada porque el caso ancla pide Evidence como entidad reutilizable (una Evidence podría citarse en varias Decision futuras) y respuesta estructurada “Decision + Evidence citada”.

### 1.4 ¿Alcanza `Version` para Decision?

**No.** `Version` en 4.1 archiva **revisiones sucesivas del mismo entityId de política**. Una Decision es un **evento puntual inmutable** (aprobó 12% el 2026-08-15), no una evolución del mismo registro. Patrón correcto: un `MemoryRecord` por decisión, sin `storeEntityVersion`.

---

## Paso 2 — Modelo mínimo de datos

### 2.1 Convenciones compartidas (heredadas de 4.1)

```typescript
// Convenciones SDK — capa sobre MemoryRecord
namespaceId: 'cli.default'          // requerido por MemoryModule.searchContent
collectionId: 'org.decisions'       // nuevo ámbito para Decision + Evidence
entityId: string                    // slug estable en metadata.entityId
content: JSON en content.text       // vía serializeOrgContent / parseOrgContent
```

Nuevos `recordType`:

```typescript
type OrgDecisionRecordType = 'Decision' | 'Evidence';
```

Extensión de tipos resolubles (propuesta):

```typescript
// Ampliar ORG_ENTITY_RECORD_TYPES → ORG_ORG_RECORD_TYPES o lista union
// que incluya Decision, Evidence además de Client, DiscountPolicy, etc.
```

### 2.2 Schema — `Decision`

Campos mínimos para el caso ancla y extensión futura:

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `subjectType` | string | sí | Qué clase de solicitud resuelve. Caso ancla: `'discount_request'` |
| `clientLegalName` | string | sí* | Identificador de negocio del sujeto (*obligatorio para `discount_request`) |
| `requestedPercent` | number | sí* | Porcentaje solicitado (*para descuentos) |
| `outcome` | `'approved' \| 'rejected'` | sí | Resultado de la decisión |
| `decidedBy` | string | sí | Rol o persona que decidió (caso ancla: `'SalesDirector'`) |
| `decidedAt` | string (ISO date) | sí | Cuándo se decidió (`'2026-08-15'`) |
| `approvedPercent` | number | condicional | Si `outcome === 'approved'` y aplica descuento: valor acordado (12) |
| `requestId` | string | no | Id estable de la solicitud (`'req.andes-discount-2026-08'`) para deduplicar preguntas |
| `notes` | string | no | Texto libre complementario del decisor |

**entityId sugerido:** `record.decision.<slug>` — p. ej. `record.decision.andes-discount-2026-08-15`.

**Inmutabilidad:** append-only vía `storeEntity`. No usar `upsertEntity` salvo corrección excepcional (dedupe protege si se repite).

### 2.3 Schema — `Evidence`

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `content` | string | sí | Texto citado (“cliente en renovación continua desde 2023, sin incidentes de pago”) |
| `sourceType` | string | sí | Origen de la evidencia. Fase 4.2: `'manual'` o `'chat'` — sin integraciones externas |
| `recordedBy` | string | sí | Quién registró/citó la evidencia |
| `recordedAt` | string (ISO date) | no | Cuándo se registró (default: timestamp del record) |
| `sourceLabel` | string | no | Etiqueta humana opcional (“historial comercial CRM”) |

**entityId sugerido:** `record.evidence.<slug>` — p. ej. `record.evidence.andes-renewal-2023`.

Evidence es **texto libre** en 4.2; no se exige enlace a documentos en `@atlas/knowledge`.

### 2.4 Relaciones propuestas

| source | target | relationshipType | Semántica |
|--------|--------|------------------|-----------|
| `record.decision.andes-discount-2026-08-15` | `record.client.constructora-andes` | `resolves` | Esta decisión resuelve una solicitud sobre ese cliente |
| `record.decision.andes-discount-2026-08-15` | `record.evidence.andes-renewal-2023` | `cites` | Esta decisión citó esa evidencia |

**Opcional (fase 4.2+):** Decision → ApprovalRule con `related` para auditar qué regla estaba vigente. No obligatorio para el caso ancla si `decidedBy: SalesDirector` ya está en el payload.

Cardinalidad:

- Una Decision **resolves** exactamente una entidad ancla del grafo existente (Client en el caso descuento).
- Una Decision **cites** cero o más Evidence (caso ancla: 1).
- Una Evidence puede ser citada por múltiples Decision (reutilización futura).

---

## Paso 3 — Conexión con ATLAS 4.1 existente

### 3.1 Grafo completo del caso ancla (4.1 + 4.2)

```text
[Client: Constructora Andes]
    │ reference
    ▼
[DiscountPolicy: DISCOUNT-VIP-2026, max 10%]
    │ dependency
    ▼
[ApprovalRule: SalesDirector si > 10%]

─── ATLAS 4.2 (nuevo, se apoya en lo anterior) ───

[Decision: aprobó 12% el 2026-08-15, SalesDirector]
    │ resolves ──► [Client: Constructora Andes]
    │ cites ─────► [Evidence: "renovación continua desde 2023…"]
```

4.1 responde: *“12% excede 10%, requiere SalesDirector”*.  
4.2 cierra el ciclo: *“SalesDirector aprobó 12% el 2026-08-15 porque [evidencia]”*.

### 3.2 Registros concretos (diseño en papel)

**Decision**

```json
{
  "entityId": "record.decision.andes-discount-2026-08-15",
  "recordType": "Decision",
  "content": {
    "subjectType": "discount_request",
    "clientLegalName": "Constructora Andes S.A.",
    "requestedPercent": 12,
    "outcome": "approved",
    "approvedPercent": 12,
    "decidedBy": "SalesDirector",
    "decidedAt": "2026-08-15",
    "requestId": "req.andes-discount-2026-08"
  },
  "metadata": {
    "namespaceId": "cli.default",
    "collectionId": "org.decisions",
    "entityId": "record.decision.andes-discount-2026-08-15",
    "status": "active",
    "revision": 1
  }
}
```

**Evidence**

```json
{
  "entityId": "record.evidence.andes-renewal-2023",
  "recordType": "Evidence",
  "content": {
    "content": "cliente en renovación continua desde 2023, sin incidentes de pago",
    "sourceType": "manual",
    "recordedBy": "SalesDirector",
    "recordedAt": "2026-08-15"
  },
  "metadata": {
    "namespaceId": "cli.default",
    "collectionId": "org.decisions",
    "entityId": "record.evidence.andes-renewal-2023",
    "status": "active",
    "revision": 1
  }
}
```

**Relationships** (registros `type: Relationship`, forma existente)

```json
{
  "entityId": "relationship.record.decision.andes-discount-2026-08-15.resolves.record.client.constructora-andes",
  "content": {
    "sourceRecord": "record.decision.andes-discount-2026-08-15",
    "targetRecord": "record.client.constructora-andes",
    "relationshipType": "resolves"
  }
}
```

```json
{
  "entityId": "relationship.record.decision.andes-discount-2026-08-15.cites.record.evidence.andes-renewal-2023",
  "content": {
    "sourceRecord": "record.decision.andes-discount-2026-08-15",
    "targetRecord": "record.evidence.andes-renewal-2023",
    "relationshipType": "cites"
  }
}
```

### 3.3 Trazado end-to-end — pregunta del caso ancla

**Pregunta:** *¿Quién aprobó el descuento de Constructora Andes y por qué?*

| Paso | Acción | Módulo / primitivo |
|------|--------|-------------------|
| 1 | Resolver Client por `legalName` (sanity / contexto) | `resolveEntity` — ya existe |
| 2 | Buscar Decision con matcher `{ clientLegalName, subjectType: 'discount_request', outcome: 'approved' }` | **nuevo** `resolveDecision` o `resolveEntity` con recordType Decision |
| 3 | Si hay varias, ordenar por `decidedAt` descendente → la más reciente | **nuevo** helper en decision-resolver |
| 4 | Seguir `getRelated(decisionId, 'cites')` → registros Evidence | `getRelated` — ya existe (forward) |
| 5 | Opcional: verificar arista `resolves` hacia Client | `getRelated(decisionId, 'resolves')` |
| 6 | Formatear respuesta citando Decision + Evidence | **nuevo** `formatDecisionWithEvidence` |

**Respuesta esperada (estructurada):**

```text
Descuento aprobado para Constructora Andes S.A.
Decisión: 12% aprobado el 2026-08-15 por SalesDirector.
Evidencia citada:
- "cliente en renovación continua desde 2023, sin incidentes de pago" (registrada por SalesDirector).
Contexto de política (ATLAS 4.1): el 12% excedía el límite autónomo de 10% (DISCOUNT-VIP-2026); la aprobación cubrió ese exceso.
```

**Nota:** la parte de política (4.1) puede enriquecer la respuesta pero **no sustituye** la Decision registrada — son capas complementarias.

### 3.4 Flujo de registro (chat / tools)

Secuencia propuesta al registrar una aprobación:

1. `org_record_evidence` — crea Evidence (si no existe ya con mismo slug).
2. `org_record_decision` — crea Decision + enlaces `resolves` y `cites` en una operación o vía `linkEntities` subsiguientes.
3. Alternativa compacta: `org_record_decision` acepta `evidenceIds[]` y crea/enlaza internamente.

`evaluateDiscountRequest` **no se modifica** — sigue siendo evaluación normativa previa a la decisión humana.

---

## Paso 4 — Diseño de implementación propuesto (estimación, no ejecutado)

### 4.1 Archivos nuevos (~6–8)

| Archivo | Responsabilidad |
|---------|-----------------|
| `packages/sdk/src/org/schemas/decision.ts` | Schema + validación Decision |
| `packages/sdk/src/org/schemas/evidence.ts` | Schema + validación Evidence |
| `packages/sdk/src/org/decision-store.ts` | `storeDecision`, `storeEvidence`, `linkDecision` (orquesta Decision + relaciones) |
| `packages/sdk/src/org/decision-resolver.ts` | `resolveDecisionsForClient`, `resolveDecisionWithEvidence` |
| `packages/sdk/src/org/decision-answer.ts` | Formateo respuesta “quién / por qué” |
| `packages/sdk/tests/org-decision-resolver.test.ts` | Caso ancla end-to-end |
| `packages/sdk/tests/org-decision-store.test.ts` | Persistencia + relaciones |
| `packages/sdk/scripts/verify-atlas42-live.mjs` | Verificación live (opcional, mismo patrón 4.1) |

### 4.2 Archivos modificados (~6–8)

| Archivo | Cambio |
|---------|--------|
| `packages/sdk/src/org/constants.ts` | +Decision, +Evidence, +`resolves`/`cites`, +`org.decisions` |
| `packages/sdk/src/org/entity-store.ts` | assertDecision, assertEvidence, collection routing |
| `packages/sdk/src/org/entity-resolver.ts` | Ampliar tipos resolubles (Decision/Evidence en búsqueda por id) |
| `packages/sdk/src/org/relationship-store.ts` | Permitir source/target Decision/Evidence en validación |
| `packages/sdk/src/org/fixtures.ts` | `seedCase1WithApproval` (Decision + Evidence + links) |
| `packages/sdk/src/modules/org-memory-module.ts` | Facade: store/resolve decision |
| `packages/sdk/src/modules/llm-module.ts` | +2–3 tools aditivas (sin tocar las 7 existentes) |
| `packages/sdk/tests/llm-module.test.ts` | +1 test integración |
| `releases/WEB_ATLAS4_*` o doc slice 4.2 | Documentación post-implementación |

### 4.3 Tools LLM propuestas (aditivas)

| Tool | Args (borrador) | Rol |
|------|-----------------|-----|
| `org_record_evidence` | `entityId`, `content`, `sourceType`, `recordedBy` | Persistir Evidence |
| `org_record_decision` | `entityId`, decisión (subjectType, clientLegalName, outcome, decidedBy, decidedAt, …), `evidenceIds[]`, `targetEntityId` | Persistir Decision + enlaces |
| `org_resolve_decision` | `clientLegalName`, `subjectType?` | Responder quién decidió y qué evidencia citó |

Las 7 tools org actuales (`org_evaluate_discount`, `org_resolve_policy`, `org_upsert_entity`, `org_link_entities`, …) **permanecen sin cambio de contrato**.

### 4.4 Comparación de tamaño vs ATLAS 4.1

| Entrega | Archivos org (src) | Tests SDK org | Tools LLM org | Toca `@atlas/memory` |
|---------|-------------------|---------------|---------------|----------------------|
| ATLAS 4.1 inicial | ~14 | +4 suites (~6 tests) | +2 | No |
| ATLAS 4.1 chat entry | +0 nuevos src org | +1 suite (+5 tests) | +2 | No |
| **ATLAS 4.2 (propuesto)** | **+4–6 nuevos, ~4–6 tocados** | **+2 suites (~4–6 tests)** | **+2–3** | **No** |

**Total acumulado org/** pasaría de ~14 a ~18–20 archivos — incremento acotado, no un rediseño.

### 4.5 ¿Requiere ADR?

| Escenario | ¿ADR? | Justificación |
|-----------|-------|---------------|
| **4.2 en SDK** con `storeContent`/`searchContent` + convenciones JSON | **No** | Misma frontera que 4.1 (`RFC_ATLAS4` §3.2). `@atlas/memory` public API sin cambios. |
| Exponer Decision/Evidence como entidades de dominio en `@atlas/memory` | **Sí** | Extendería superficie certificada / taxonomía kernel. **Fuera de alcance 4.2.** |
| Nuevos métodos públicos en `MemoryEngine` para audit trail | **Sí** | Requeriría ADR-0006 (mencionado en RFC ATLAS 4). **No necesario** si SDK orquesta registros planos. |

**Recomendación:** implementar 4.2 **sin ADR**, mismo criterio que 4.1 y chat data entry.

---

## Paso 5 — Riesgos y decisiones abiertas

| Riesgo | Mitigación propuesta |
|--------|---------------------|
| `linkEntities` no valida Decision/Evidence hoy | Ampliar `ORG_*_RECORD_TYPES` resolubles antes de enlazar |
| Consulta desde Client sin traversal inverso | Matcher sobre contenido Decision (`clientLegalName`) — suficiente para 4.2; `getIncomingRelated` como mejora opcional |
| Múltiples aprobaciones para el mismo cliente | Resolver la más reciente por `decidedAt`; exponer historial en fase posterior |
| Confundir Evidence org con `@atlas/knowledge` Evidence | Documentar que 4.2 Evidence es registro org autónomo; integración knowledge → org queda para v2 |
| Re-registrar la misma decisión por chat | `entityId` estable + idempotencia opcional en `storeDecision` (similar a `linkEntities`) |
| Lexical search mezcla Decision con policies | Preguntas auditivas usan `decision-resolver`, no `memory_search` — misma regla que garantías en 4.1 |

### Decisiones abiertas para revisión

1. **`approvedPercent` vs reutilizar `requestedPercent`** cuando outcome es approved — propuesta: ambos campos; `approvedPercent` puede diferir del solicitado en casos futuros.
2. **¿Un tool o dos para registrar?** — propuesta: dos tools (`org_record_evidence`, `org_record_decision`) para composición flexible; la tool de decisión acepta `evidenceIds[]`.
3. **¿Traversal inverso en 4.2 o 4.3?** — propuesta: diferir `getIncomingRelated`; matcher en Decision basta para el caso ancla.

---

## Paso 6 — Criterios de aceptación (post-implementación)

1. Con grafo 4.1 + Decision/Evidence del caso ancla cargado (fixtures o chat tools), `org_resolve_decision` responde quién aprobó y cita la evidencia textual.
2. `evaluateDiscountRequest` sigue comportándose igual (12% → no autónomo, SalesDirector).
3. `@atlas/memory`, `apps/web`, `packages/cli`, kernel: **0 cambios** en implementación 4.2 mínima.
4. Gates monorepo completos; `@atlas/sdk` tests org incrementados (~+4–6).
5. Verificación live: pregunta *“¿quién aprobó el descuento de Constructora Andes y por qué?”* devuelve SalesDirector + evidencia de renovación.

---

## Referencias en código (main @ `7bd13c7`)

| Tema | Ubicación |
|------|-----------|
| Convenciones org | `packages/sdk/src/org/constants.ts` |
| Persistencia entidades | `packages/sdk/src/org/entity-store.ts` |
| Dedupe + resolución | `packages/sdk/src/org/entity-resolver.ts` |
| Relaciones + idempotencia | `packages/sdk/src/org/relationship-store.ts` |
| Traversal saliente | `packages/sdk/src/org/graph-traversal.ts` |
| Evaluación descuento (4.1) | `packages/sdk/src/org/policy-evaluator.ts` |
| Grafo Caso 1 | `packages/sdk/src/org/fixtures.ts` |
| Facade SDK | `packages/sdk/src/modules/org-memory-module.ts` |
| Tools LLM | `packages/sdk/src/modules/llm-module.ts` |
| RelationshipType memory (referencia) | `packages/memory/src/domain/value-objects/relationship-type.ts` |
| RFC ATLAS 4 (precedente) | `releases/RFC_ATLAS4_ORGANIZATIONAL_INTELLIGENCE.md` |
| Slice 4.1 implementado | `releases/WEB_ATLAS4_1_VERTICAL_SLICE.md` |

---

## Próximo paso sugerido

1. Revisión de este RFC contra el código en `main`.
2. Autorización de implementación ATLAS 4.2 en `@atlas/sdk` únicamente.
3. Commit en `main` (mismo criterio que 4.1 / chat data entry) tras gates + verificación live.
