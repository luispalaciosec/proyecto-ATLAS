# Superprompt — ATLAS 4.1: Vertical Slice Organizational Intelligence (Entities + Relationships + Policies)

## Contexto

El RFC ya está aprobado y en `main` (`releases/RFC_ATLAS4_ORGANIZATIONAL_INTELLIGENCE.md`,
commit `ecfb79b`). Este prompt implementa exactamente lo que el RFC dejó
especificado en su Paso 2 (modelo mínimo) y Paso 3.3 (vertical slice):
Entities, Relationships, Policies — validado contra los dos casos ancla:

1. Descuento 12% a Constructora Andes (requiere aprobación, límite 10%).
2. Garantía 45→60 días (versión vigente vs. histórica).

## Alcance autorizado

- Código nuevo: `packages/sdk/src/org/**` y `packages/sdk/tests/org-*.test.ts`.
- Modificación permitida: `packages/sdk/src/modules/llm-module.ts` — **solo
  para agregar 2 tools nuevas**, sin tocar `memory_search`, `memory_store`
  ni `plan_and_execute` existentes.
- **No tocar:** `@atlas/memory` (ningún archivo), kernel (`core`, `compiler`,
  `runtime`, `workflow`, `intelligence`), `apps/web`, `packages/cli`. El RFC
  §3.2 ya confirmó que este alcance no requiere ADR.
- Todo se construye sobre `atlas.memory.storeContent/searchContent` (el
  único camino que llega desde `@atlas/sdk` — confirmado en el RFC
  §1.3-1.5). **No** accedas a `RelationshipRepository`/`VersionRepository`
  internos de `@atlas/memory` — no son alcanzables desde SDK. Todo se
  representa con convenciones de `recordType` + `content` JSON sobre
  `MemoryRecord` normal, tal como especifica el RFC §2.1.

## A. Entidades (`packages/sdk/src/org/`)

### `schemas/*.ts`

Los 4 tipos de contenido del RFC §2.1-2.3, exactamente:

```ts
interface Client { legalName: string; segment: string; renewalActive: boolean; }
interface DiscountPolicy { policyCode: string; autonomousMaxPercent: number; currency: string; }
interface WarrantyPolicy { policyCode: string; warrantyDays: number; effectiveFrom: string; }
interface ApprovalRule { appliesWhen: string; approverRole: string; approverQueue: string; }
```

Validación simple (sigue el estilo de validación ya usado en el resto de
`@atlas/sdk`, no introduzcas una librería nueva si no existe ya en el repo).

### `entity-store.ts`

- `storeEntity(atlas, recordType, id, content, metadata?)` — persiste vía
  `atlas.memory.storeContent` con ese `recordType` y `content`, replicando
  la forma de los JSON de ejemplo del RFC §2.2 (Client, DiscountPolicy,
  ApprovalRule).
- `storeEntityVersion(atlas, recordId, previousContent, revision, author)`
  — para el caso de garantía: persiste un record separado
  `recordType: 'Version'` con
  `content: { recordId, revision, content: previousContent, author }`,
  replicando el JSON "Versión 1 (histórica, inmutable)" del RFC §2.3.

### `entity-resolver.ts`

- `resolveEntity(atlas, recordType, matcher)` — busca vía `searchContent` y
  filtra en memoria por `type === recordType` **y** coincidencia exacta del
  campo indicado (ej. `legalName`). `searchContent` hace matching de texto
  libre, no filtrado exacto — la precisión es responsabilidad de esta
  función, no del motor de búsqueda.
- `getEntityHistory(atlas, recordId)` — busca todos los records
  `type: 'Version'` con `content.recordId === recordId`, ordenados por
  `content.revision`.

### `modules/org-memory-module.ts`

Facade que agrupa entity-store + entity-resolver + relationship-store +
policy-evaluator + version-resolver, siguiendo el mismo patrón de
construcción que `memory-module.ts` (constructor que recibe `Atlas`,
métodos async).

## B. Relaciones

### `relationship-store.ts`

- `linkEntities(atlas, sourceId, targetId, relationshipType, metadata?)` —
  persiste `recordType: 'Relationship'` con
  `content: { sourceRecord: sourceId, targetRecord: targetId, relationshipType }`.
  Usa los mismos strings `'reference'` / `'dependency'` que ya existen como
  `RelationshipType` en `@atlas/memory` (por consistencia semántica, aunque
  ese dominio interno no sea alcanzable desde aquí).

### `graph-traversal.ts`

- `getRelated(atlas, recordId, relationshipType?)` — busca records
  `type: 'Relationship'` con `content.sourceRecord === recordId`
  (filtrando por `relationshipType` si se pasa), resuelve y devuelve las
  entidades `targetRecord` completas.

## C. Políticas

### `policy-evaluator.ts` — resuelve el Caso 1 (RFC §2.2)

`evaluateDiscountRequest(atlas, clientLegalName, requestedPercent)`:

1. Resuelve el cliente (`resolveEntity`, `recordType: 'Client'`).
2. Sigue relación `reference` → política de descuento.
3. Compara `requestedPercent` vs. `autonomousMaxPercent`.
4. Si excede, sigue relación `dependency` desde la política → `ApprovalRule`.
5. Devuelve veredicto estructurado:
   `{ autonomous: boolean, limitPercent: number, requestedPercent: number, client: {...}, approverRole?: string, reasoning: string[] }`.

### `version-resolver.ts` — resuelve el Caso 2 (RFC §2.3)

- `resolveCurrentPolicy(atlas, recordType, policyCode)` — resuelve el
  record vigente por `recordType` + `content.policyCode`, devuelve su
  `content` (ya es la versión vigente por convención).
- `resolvePolicyHistory(atlas, recordId)` — usa `getEntityHistory`, historial
  completo ordenado.

### `policy-answer.ts`

Formatea el veredicto de `evaluateDiscountRequest` o de
`resolveCurrentPolicy`/historial en el texto estructurado que muestra el
RFC §2.2/§2.3 ("Respuesta esperada").

## Exposición a chat (`llm-module.ts`)

Agregar **dos** tools nuevas a `createAtlasToolExecutors` (aditivo, no
modifica las 3 existentes):

- `org_evaluate_discount` — args `{ clientLegalName: string, requestedPercent: number }`
  → `evaluateDiscountRequest` + `policy-answer`, devuelve el texto
  estructurado.
- `org_resolve_policy` — args `{ policyCode: string, includeHistory?: boolean }`
  → `resolveCurrentPolicy` (+ `resolvePolicyHistory` si `includeHistory`),
  devuelve el texto estructurado.

No generalices a una tool de "responde cualquier pregunta organizacional" —
el RFC deja eso explícitamente fuera de alcance (§"Fuera de alcance — v2").

## Tests obligatorios (fixtures = datos exactos del RFC §2.2/§2.3)

- **`packages/sdk/tests/org-entity-resolver.test.ts`** — guarda un `Client`
  `legalName: 'Constructora Andes S.A.'` y otro con nombre distinto;
  `resolveEntity` encuentra el correcto, no confunde con el otro.
- **`packages/sdk/tests/org-graph-traversal.test.ts`** — reproduce el grafo
  del Caso 1 (Client → reference → DiscountPolicy → dependency →
  ApprovalRule); `getRelated` desde cada nodo devuelve el siguiente
  correcto.
- **`packages/sdk/tests/org-policy-evaluator.test.ts`** (Caso 1
  end-to-end) — monta el fixture completo solo con las funciones nuevas
  (`storeEntity`, `linkEntities`). `evaluateDiscountRequest(atlas,
  'Constructora Andes S.A.', 12)` → `autonomous: false`,
  `approverRole: 'SalesDirector'`. Caso de control: pedir 8% →
  `autonomous: true`, sin `approverRole`.
- **`packages/sdk/tests/org-version-resolver.test.ts`** (Caso 2
  end-to-end) — monta política vigente 60 días (revision 2) + histórica 45
  días (revision 1) vía `storeEntity` + `storeEntityVersion`.
  `resolveCurrentPolicy` → `warrantyDays: 60`. `resolvePolicyHistory` →
  ambas revisiones ordenadas.
- **Extender `packages/sdk/tests/llm-module.test.ts`** — un test que
  scriptea el fake provider llamando a `org_evaluate_discount` con el
  fixture y confirma que `finalMessage` menciona el límite de 10% y a
  `SalesDirector` (mismo patrón que el test existente de `memory_search`).

## Verificación funcional en vivo (obligatoria, antes de reportar terminado)

Igual que se hizo con Excel Knowledge: levanta el servidor Web local,
carga los fixtures de los dos casos reales vía las funciones nuevas (o vía
un script de setup), y haz las dos preguntas reales por `/api/chat`:

1. "¿Puedo ofrecerle 12% de descuento a Constructora Andes?"
2. "¿Cuál es el plazo de garantía vigente?" (y luego "¿cuál era antes?")

Pega las respuestas reales obtenidas — no solo el resultado de los tests
unitarios.

## Documentación requerida

`releases/WEB_ATLAS4_1_VERTICAL_SLICE.md`: qué se implementó, mapeo
explícito a las secciones del RFC que resuelve, resultado de los 4 gates,
las respuestas reales de la verificación en vivo, y una nota explícita de
qué sigue **fuera de alcance** (todo lo listado en "Fuera de alcance — v2"
del RFC sigue fuera — no lo implementes aunque parezca fácil).

## Gates

4 gates en el monorepo completo (build, typecheck, lint, test). Reportar
conteo exacto por paquete, especialmente `@atlas/sdk` antes/después.

## Detenerse antes de commitear

**No hagas commit.** Reporta: diff completo, resultado de los 4 gates con
conteos exactos, las respuestas reales de la verificación en vivo, y el
contenido del doc nuevo. Yo verifico en worktree aislado antes de
autorizar — mismo proceso que en todos los fixes anteriores. Esta vez,
literalmente detente ahí sin commitear aunque todo salga verde: el último
commit de esta sesión se hizo sin esperar autorización y no debe repetirse.
