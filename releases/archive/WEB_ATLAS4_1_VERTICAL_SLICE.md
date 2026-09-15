# ATLAS 4.1 — Vertical Slice: Organizational Intelligence

**Fecha:** 2026-08-16  
**Base:** RFC aprobado en `main` (`releases/RFC_ATLAS4_ORGANIZATIONAL_INTELLIGENCE.md`, commit `ecfb79b`)  
**Alcance:** Entities + Relationships + Policies en `@atlas/sdk` — **sin cambios en `@atlas/memory` certificado**

---

## Resumen

Se implementó el vertical slice mínimo de Organizational Intelligence descrito en el RFC ATLAS 4, usando únicamente `atlas.memory.storeContent` / `searchContent` sobre `MemoryRecord` con convenciones JSON (`recordType`, `metadata.entityId`, relaciones y versiones históricas).

Dos casos ancla quedaron cubiertos end-to-end:

| Caso | Pregunta | Resultado |
|------|----------|-----------|
| **1 — Descuento** | ¿Puedo ofrecerle 12% a Constructora Andes? | No autónomo; límite 10%; requiere **SalesDirector** |
| **2 — Garantía** | ¿Cuál es el plazo vigente? / ¿cuál era antes? | Vigente **60 días**; histórico **45 días** (rev. 1) |

---

## Mapeo al RFC

| RFC | Implementación |
|-----|----------------|
| **§2.1 Convenciones** | `packages/sdk/src/org/constants.ts`, `record-content.ts` |
| **§2.2 Caso descuento** | `fixtures.ts`, `policy-evaluator.ts`, `policy-answer.ts`, tool `org_evaluate_discount` |
| **§2.3 Caso garantía** | `entity-store.storeEntityVersion`, `version-resolver.ts`, tool `org_resolve_policy` |
| **§3.3 Vertical slice A** | `schemas/*.ts`, `entity-store.ts`, `entity-resolver.ts`, `org-memory-module.ts` |
| **§3.3 Vertical slice B** | `relationship-store.ts`, `graph-traversal.ts` |
| **§3.3 Vertical slice C** | `policy-evaluator.ts`, `version-resolver.ts`, `policy-answer.ts` |
| **§3.2 Sin ADR** | Confirmado: **0 archivos** modificados en `@atlas/memory`, kernel, web, cli |

### Decisión de namespace (`cli.default`)

El RFC propone `namespaceId: org.default`, pero `MemoryModule.searchContent` filtra siempre por `namespaceId: cli.default` (único camino SDK). Las entidades org se persisten con **`cli.default`** para ser recuperables. Es una adaptación de implementación documentada aquí; la semántica organizacional vive en `metadata.collectionId` (`org.entities`, `org.policies`).

### Resolución de entidades

`resolveEntity` lista registros por `recordType` vía `searchContent({ query: '', recordType })` y aplica **coincidencia exacta en memoria** sobre el payload JSON — no delega precisión al motor lexical.

---

## Archivos nuevos / modificados

### Nuevos (`packages/sdk/src/org/`)

| Archivo | Rol |
|---------|-----|
| `constants.ts` | Tipos de record, relaciones, namespace |
| `record-content.ts` | Serialización/parseo JSON en `content.text` |
| `schemas/client.ts` | `Client` + validación |
| `schemas/discount-policy.ts` | `DiscountPolicy` + validación |
| `schemas/warranty-policy.ts` | `WarrantyPolicy` + validación |
| `schemas/approval-rule.ts` | `ApprovalRule` + validación |
| `entity-store.ts` | `storeEntity`, `storeEntityVersion` |
| `entity-resolver.ts` | `resolveEntity`, `getEntityHistory`, `resolveEntityById` |
| `relationship-store.ts` | `linkEntities` |
| `graph-traversal.ts` | `getRelated` |
| `policy-evaluator.ts` | `evaluateDiscountRequest` |
| `version-resolver.ts` | `resolveCurrentPolicy`, `resolvePolicyHistory` |
| `policy-answer.ts` | Formateo de respuestas estructuradas |
| `fixtures.ts` | Seed RFC §2.2 / §2.3 para tests y verificación |

### Nuevos (módulo + tests)

| Archivo | Rol |
|---------|-----|
| `packages/sdk/src/modules/org-memory-module.ts` | Facade `OrgMemoryModule` |
| `packages/sdk/tests/org-entity-resolver.test.ts` | Resolución exacta de clientes |
| `packages/sdk/tests/org-graph-traversal.test.ts` | Grafo Caso 1 |
| `packages/sdk/tests/org-policy-evaluator.test.ts` | Caso 1 end-to-end (12% / 8%) |
| `packages/sdk/tests/org-version-resolver.test.ts` | Caso 2 end-to-end (60 / 45) |
| `packages/sdk/scripts/verify-atlas41-live.mjs` | Verificación live `/api/chat` |

### Modificados (alcance autorizado)

| Archivo | Cambio |
|---------|--------|
| `packages/sdk/src/modules/llm-module.ts` | +2 tools: `org_evaluate_discount`, `org_resolve_policy` |
| `packages/sdk/tests/llm-module.test.ts` | +1 test integración tool org |

**No modificados:** `@atlas/memory`, `apps/web`, `packages/cli`, kernel.

---

## Tools LLM expuestas

| Tool | Args | Comportamiento |
|------|------|----------------|
| `org_evaluate_discount` | `clientLegalName`, `requestedPercent` | Evalúa política VIP + aprobación |
| `org_resolve_policy` | `policyCode`, `includeHistory?` | Resuelve garantía vigente (+ historial opcional) |

Las tools existentes (`memory_search`, `memory_store`, `plan_and_execute`) **no fueron modificadas**.

---

## Gates (monorepo completo)

| Gate | Resultado |
|------|-----------|
| **build** | 23/23 tasks OK |
| **typecheck** | 35/35 tasks OK |
| **lint** | 35/35 tasks OK |
| **test** | 46/46 tasks OK |

### Conteo `@atlas/sdk` (tests)

| | Antes (main @ `ecfb79b`) | Después (ATLAS 4.1) |
|--|--------------------------|---------------------|
| **Tests** | 44/44 | **50/50** (+6) |
| **Archivos de test** | 11 | 15 (+4 org + 1 llm extendido) |

### Paquetes producto (sin regresión)

| Paquete | Tests |
|---------|-------|
| `@atlas/sdk` | 50/50 |
| `@atlas/cli` | 77/77 |
| `@atlas/web` | 216/216 |
| `@atlas/memory` | 128/128 |

---

## Verificación funcional en vivo (`/api/chat`)

Comando (tras `pnpm build`):

```bash
node packages/sdk/scripts/verify-atlas41-live.mjs
```

Servidor Web local con `ATLAS_MEMORY_FILE` sembrado, LLM Anthropic stubbed para invocar las tools org, **una sesión nueva por pregunta**.

### Pregunta 1

**Entrada:** `¿Puedo ofrecerle 12% de descuento a Constructora Andes?`

**Respuesta real (`llm_message`):**

```text
No puedes aplicar 12% de forma autónoma.
Límite autónomo: 10% (política DISCOUNT-VIP-2026).
Cliente Constructora Andes S.A. califica (VIP, renovación activa).
Requiere aprobación de SalesDirector.

Razonamiento:
- Cliente Constructora Andes S.A. (VIP).
- Política DISCOUNT-VIP-2026: límite autónomo 10%.
- El 12% solicitado excede el límite autónomo de 10%.
- Requiere aprobación de SalesDirector.
```

### Pregunta 2

**Entrada:** `¿Cuál es el plazo de garantía vigente?`

**Respuesta real:**

```text
Política vigente: WARRANTY-STD.
Plazo de garantía: 60 días.
Vigente desde: 2026-06-01.
Revisión actual: 2.
```

### Pregunta 3

**Entrada:** `¿Cuál era el plazo de garantía antes del cambio?`

**Respuesta real:**

```text
Política vigente: WARRANTY-STD.
Plazo de garantía: 60 días.
Vigente desde: 2026-06-01.
Revisión actual: 2.

Historial auditado:
- Revisión 1: 45 días (desde 2025-01-01), autor legal.ops.
```

---

## Fuera de alcance — sigue pendiente (RFC § v2)

No implementado en ATLAS 4.1 (aunque parezca cercano):

- Taxonomía completa de subtipos Entity (Person, Organization, Product, …)
- Formalización general de **Decision** / **Evidence**
- **Context** organizacional rico (dimensiones temporales/regulatorias)
- **Event** / **Action**
- Integración `@atlas/knowledge` → memoria estructurada
- Nuevos `RelationshipType` de negocio en kernel (`@atlas/memory`)
- UI de grafo organizacional
- Tool genérica “responde cualquier pregunta organizacional”
- Exponer `VersionRepository` / `RelationshipRepository` vía API pública del engine (requeriría **ADR-0006**)

---

## Próximo paso sugerido (post-autorización)

1. Commit ATLAS 4.1 en rama dedicada.
2. Validación en worktree aislado (mismo protocolo que fixes anteriores).
3. Evaluar ADR-0006 si se decide eliminar el bypass plano y activar repos internos del engine.

---

## Actualización: OrgMemoryModule conectado a Atlas

**Fecha:** 2026-08-17

`OrgMemoryModule` queda expuesto en la facade pública como `atlas.org`, siguiendo el mismo patrón que `atlas.memory` y `atlas.llm`:

- `packages/sdk/src/atlas/atlas.ts` — `readonly org: OrgMemoryModule`, instanciado tras `LlmModule`.
- `packages/sdk/src/modules/llm-module.ts` — las tools `org_evaluate_discount` y `org_resolve_policy` delegan en `atlas.org.*` en lugar de importar funciones sueltas de `../org/*`.
- `packages/sdk/tests/atlas-org-module.test.ts` — confirma que `atlas.org` existe y que `evaluateDiscountRequest` vía facade reproduce el Caso 1 (12% → `SalesDirector`).

Comportamiento observable de las tools LLM **sin cambios**; los tests existentes de `llm-module.test.ts` pasan sin modificación.

---

## Actualización: creación/actualización desde el chat

**Fecha:** 2026-08-17

Se habilita persistir entidades y relaciones organizacionales desde el chat, sin UI ni fixtures manuales.

### Fix de dedupe en `listRecordsByType`

`MemoryModule.storeContent` siempre crea un `MemoryRecord` nuevo (sin update). Repetir `storeEntity` con el mismo `entityId` producía duplicados y `resolveEntityById` podía devolver una versión antigua vía `.find()`.

**Solución:** `listRecordsByType` deduplica por `metadata.entityId`, conservando el registro con `timestamp` ISO más reciente. Afecta a todos los consumidores (`resolveEntity`, `getRelated`, `pickCurrentPolicyRecord`, etc.) sin cambiar firmas públicas.

### Nuevas tools LLM (aditivas)

| Tool | Rol |
|------|-----|
| `org_upsert_entity` | Crear o actualizar `Client`, `DiscountPolicy`, `WarrantyPolicy`, `ApprovalRule` |
| `org_link_entities` | Vincular entidades existentes (`reference` / `dependency`) |

`upsertEntity` en `entity-store.ts`:

- **Crear:** `storeEntity` con `revision: 1`
- **Actualizar política:** archiva contenido previo como `Version`, incrementa `revision`
- **Actualizar Client/ApprovalRule:** reemplaza sin historial versionado

`linkEntities` es **idempotente** — repite el mismo par source/target/type sin duplicar.

### Tests SDK

Conteo `@atlas/sdk`: **51 → 56** (+5):

- dedupe en `org-entity-resolver.test.ts`
- upsert Client y WarrantyPolicy en `org-entity-store.test.ts`
- idempotencia en `org-graph-traversal.test.ts`
- `org_upsert_entity` en `llm-module.test.ts`

### Verificación live

Script: `packages/sdk/scripts/verify-atlas41-chat-data-entry.mjs`

Construye el Caso 1 completo (cliente, política, regla, dos relaciones) y la garantía (45 → 60 → 90) **solo** vía `org_upsert_entity` / `org_link_entities` por `/api/chat`, sin `seedFixtures`.

**Respuestas reales (2026-08-17):**

1. **Descuento 12% (grafo construido por chat):**
   > No puedes aplicar 12% de forma autónoma. Límite autónomo: 10% (política DISCOUNT-VIP-2026). Cliente Constructora Andes S.A. califica (VIP, renovación activa). Requiere aprobación de SalesDirector.

2. **Garantía vigente tras actualizar a 90:**
   > Política vigente: WARRANTY-STD. Plazo de garantía: 90 días. Vigente desde: 2026-09-01. Revisión actual: 3.

3. **Historial completo (45 → 60 → 90):**
   > Política vigente: WARRANTY-STD. Plazo de garantía: 90 días. … Historial auditado: Revisión 1: 45 días (desde 2025-01-01), autor legal.ops. Revisión 2: 60 días (desde 2026-06-01), autor chat.
