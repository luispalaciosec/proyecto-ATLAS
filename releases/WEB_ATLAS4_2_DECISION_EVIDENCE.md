# ATLAS 4.2 — Decision + Evidence

**Fecha:** 2026-08-17  
**Base:** RFC aprobado (`releases/RFC_ATLAS4_2_DECISION_EVIDENCE.md`) sobre ATLAS 4.1 (`main` @ `7bd13c7`)  
**Alcance:** Registrar decisiones organizacionales auditables y evidencia citada — **solo `@atlas/sdk`**, sin cambios en `@atlas/memory`, kernel, web ni cli.

---

## Resumen

ATLAS 4.1 responde si un descuento requiere aprobación; ATLAS 4.2 registra **quién decidió**, **cuándo**, **con qué resultado**, y **qué evidencia citó** — consultable por chat.

Caso ancla cubierto: SalesDirector aprueba 12% a Constructora Andes el 2026-08-15 citando evidencia de renovación continua desde 2023.

---

## Aclaración de diseño (Cambio 0)

`Decision` y `Evidence` **no** entran en `ORG_ENTITY_RECORD_TYPES`. Son registros de journal append-only:

```typescript
ORG_JOURNAL_RECORD_TYPES = ['Decision', 'Evidence']
ORG_COLLECTION_DECISIONS = 'org.decisions'
```

**Por qué:** separar entidades de negocio (Client, Policy) de eventos auditados evita que `resolveEntityById` sin tipo explícito barra journal records en cada búsqueda de Client. Con tipo explícito (`'Decision' | 'Evidence'`) sí resuelven; `resolveAnyEntityById` une entities + journal para `linkEntities` y `getRelated`.

Relaciones nuevas (strings SDK, no enum memory):

| Tipo | Dirección | Semántica |
|------|-----------|-----------|
| `resolves` | Decision → entidad del grafo | La decisión resuelve una solicitud sobre esa entidad |
| `cites` | Decision → Evidence | La decisión citó esa evidencia |

---

## Qué se agregó

### Schemas

| Archivo | Rol |
|---------|-----|
| `packages/sdk/src/org/schemas/decision.ts` | `Decision` + assert/parse |
| `packages/sdk/src/org/schemas/evidence.ts` | `Evidence` + assert/parse |

### Persistencia y resolución

| Archivo | Rol |
|---------|-----|
| `packages/sdk/src/org/decision-store.ts` | `storeDecision`, `storeEvidence`, `recordDecision` |
| `packages/sdk/src/org/decision-resolver.ts` | `resolveDecisionsForClient`, `resolveDecisionWithEvidence` |
| `packages/sdk/src/org/decision-answer.ts` | `formatDecisionWithEvidence` |

### Extensiones a módulos existentes

| Archivo | Cambio |
|---------|--------|
| `constants.ts` | Journal types, collection, relaciones `resolves`/`cites` |
| `entity-resolver.ts` | `resolveEntityById` acepta journal types explícitos; +`resolveAnyEntityById` |
| `relationship-store.ts` | Usa `resolveAnyEntityById` (Decision→Client, Decision→Evidence) |
| `graph-traversal.ts` | Resuelve targets journal vía `resolveAnyEntityById` |
| `fixtures.ts` | `seedCase1WithApproval` |
| `org-memory-module.ts` | Facade decision/evidence |
| `llm-module.ts` | +3 tools aditivas |

### Tools LLM (aditivas — 7 existentes intactas)

| Tool | Rol |
|------|-----|
| `org_record_evidence` | Persistir Evidence |
| `org_record_decision` | Persistir Decision + enlaces resolves/cites |
| `org_resolve_decision` | Consultar decisión más reciente + evidencia citada |

---

## Verificación live

Script: `packages/sdk/scripts/verify-atlas42-live.mjs`

Flujo: grafo Caso 1 vía fixtures → Evidence + Decision vía chat tools → pregunta de resolución.

**Respuesta real (2026-08-17):**

> Descuento aprobado para Constructora Andes S.A.  
> Decisión: 12% aprobado el 2026-08-15 por SalesDirector.  
> Evidencia citada:  
> - "cliente en renovación continua desde 2023, sin incidentes de pago" (registrada por SalesDirector).  
> Contexto de política (ATLAS 4.1): el 12% excedía el límite autónomo de 10% (DISCOUNT-VIP-2026); la aprobación cubrió ese exceso.

```bash
pnpm build
node packages/sdk/scripts/verify-atlas42-live.mjs
```

---

## Fuera de alcance

- Integración `@atlas/knowledge` → Evidence estructurada
- Traversal inverso `getIncomingRelated` (matcher en Decision basta para 4.2)
- Versionado de Decision/Evidence (inmutables por diseño)
- Cambios en `@atlas/memory` public API (no ADR requerido)

---

## Referencias

- RFC diseño: `releases/RFC_ATLAS4_2_DECISION_EVIDENCE.md`
- ATLAS 4.1 slice: `releases/WEB_ATLAS4_1_VERTICAL_SLICE.md`
