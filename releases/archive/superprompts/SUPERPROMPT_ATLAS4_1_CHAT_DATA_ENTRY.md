# Superprompt — ATLAS 4.1: crear/actualizar entidades y relaciones desde el chat

## Contexto

ATLAS 4.1 (commits `fef9356`, `86daf79`, ya en `main`) solo tiene datos
para los dos casos ancla, precargados a mano en `packages/sdk/src/org/fixtures.ts`.
No existe ninguna forma de que un usuario, hablando con ATLAS, le diga
"Constructora Andes es cliente VIP" o "la garantía ahora es de 90 días" y
que eso quede guardado como entidad organizacional real. Este prompt
agrega esa ruta — vía tools de chat, no una UI.

## Hallazgo previo que hay que resolver primero (bloqueante)

`packages/sdk/src/modules/memory-module.ts` **no expone update ni delete**
— `storeContent` siempre crea un `MemoryRecord` nuevo, con un `id` interno
nuevo cada vez. Hoy, `entity-store.ts`'s `storeEntity` se llamó una sola
vez por entidad (los fixtures), así que nunca hubo colisión. Pero si
ahora vamos a permitir *actualizar* una entidad existente (ej. cambiar
`renewalActive` de un cliente, o el `warrantyDays` de una política),
llamar `storeEntity` otra vez con el mismo `entityId` crea un **segundo**
`MemoryRecord` con el mismo `entityId` pero `id` interno distinto —
`entity-resolver.ts`'s `resolveEntityById`/`resolveEntity` usan `.find()`
sobre la lista cruda, que no garantiza devolver el más reciente.

### Fix requerido en `packages/sdk/src/org/entity-resolver.ts`

Modifica `listRecordsByType` para que, antes de devolver los registros,
agrupe por `getEntityId(record)` y se quede solo con el de `timestamp`
más reciente por cada `entityId` (los `MemoryRecord` ya traen
`timestamp: string` ISO). Esto es un fix general y seguro:

- Para `Client`/`ApprovalRule`/`DiscountPolicy`/`WarrantyPolicy`: resuelve
  la ambigüedad de duplicados, "el más nuevo gana".
- Para `Version`: cada revisión ya tiene un `entityId` único
  (`version.<recordId>.r<revision>`), así que el dedupe no afecta nada.
- Para `Relationship`: cada relación ya tiene un `entityId` determinístico
  (`relationship.<source>.<type>.<target>`), tampoco afecta nada, y sirve
  de red de seguridad si algo se duplica.

No cambies la firma pública de `listRecordsByType` — mismo tipo de
retorno, mismo comportamiento para todos los consumidores existentes
(`resolveEntity`, `resolveEntityById`, `getEntityHistory`, `getRelated`,
`pickCurrentPolicyRecord`). Agrega un test unitario para este fix
específico: guarda dos records con el mismo `entityId` y `recordType`
pero contenido distinto (timestamps distintos, el segundo más tarde),
confirma que `resolveEntityById` devuelve el segundo.

## Cambio 1 — Upsert con versionado automático para políticas

En `packages/sdk/src/org/entity-store.ts`, agrega:

```ts
export async function upsertEntity(
  atlas: Atlas,
  recordType: string,
  entityId: string,
  content: unknown,
  author?: string,
): Promise<{ readonly created: boolean; readonly versioned: boolean; readonly revision: number }>
```

Comportamiento:

1. Resuelve si ya existe un record con ese `entityId` + `recordType`
   (`resolveEntityById` con el `recordType` explícito).
2. Si **no existe**: `storeEntity` normal, `revision: 1`. Devuelve
   `{ created: true, versioned: false, revision: 1 }`.
3. Si **existe** y `recordType` es `DiscountPolicy` o `WarrantyPolicy`
   (usa `ORG_POLICY_RECORD_TYPES`): archiva el contenido **actual** como
   `Version` (vía `storeEntityVersion`, usando la revisión actual leída de
   `metadata.revision` y el `author` recibido — si no viene `author`,
   usa `'chat'`), luego `storeEntity` con el contenido nuevo y
   `revision: revisionAnterior + 1`. Devuelve
   `{ created: false, versioned: true, revision: revisionAnterior + 1 }`.
4. Si **existe** y NO es tipo política (`Client`/`ApprovalRule`): solo
   `storeEntity` con el contenido nuevo, mismo `entityId`,
   `revision: 1` (no versiona — el RFC no pide historial para estos
   tipos). Devuelve `{ created: false, versioned: false, revision: 1 }`.

## Cambio 2 — Relaciones idempotentes

En `packages/sdk/src/org/relationship-store.ts`, antes de crear la
relación en `linkEntities`, resuelve si ya existe un record
`Relationship` con ese `entityId` determinístico
(`relationship.<source>.<type>.<target>`) — si ya existe, no crees uno
nuevo, devuelve el existente. Evita duplicados cuando el chat repite un
`linkEntities` sobre el mismo par.

## Cambio 3 — Dos tools nuevas en `llm-module.ts`

Aditivas, sin tocar las 5 tools existentes (`memory_search`,
`memory_store`, `plan_and_execute`, `org_evaluate_discount`,
`org_resolve_policy`).

### `org_upsert_entity`

```
args: {
  recordType: 'Client' | 'DiscountPolicy' | 'WarrantyPolicy' | 'ApprovalRule',
  entityId: string,   // slug corto y estable, ej. "client.constructora-andes"
  content: object,    // shape según recordType (ver schemas/*.ts)
  author?: string,    // quién reporta el cambio, para historial de políticas
}
```

En la `description` de la tool, indícale al modelo explícitamente: usa
un `entityId` corto, en minúsculas, con guiones, prefijado por el tipo
en minúsculas (ej. `client.constructora-andes`,
`policy.warranty.standard`) — para que sea estable si se vuelve a
mencionar la misma entidad más adelante en la conversación.

`execute`: valida `recordType` contra los 4 soportados, llama
`atlas.org` con la lógica de `upsertEntity` (agrega el método
correspondiente a `OrgMemoryModule` también), y devuelve un texto de
confirmación distinto según el resultado:

- Creado: `"Entidad {entityId} ({recordType}) creada."`
- Actualizado sin versión: `"Entidad {entityId} actualizada."`
- Actualizado con versión: `"Política {entityId} actualizada a la revisión {revision}. La versión anterior queda en el historial auditado."`

### `org_link_entities`

```
args: {
  sourceId: string,
  targetId: string,
  relationshipType: 'reference' | 'dependency',
}
```

`execute`: llama `atlas.org.linkEntities`, devuelve
`"{sourceId} → {relationshipType} → {targetId} registrado."` — si falla
porque `sourceId`/`targetId` no existen (error ya lanzado por
`linkEntities`), deja que el error se propague tal cual (el tool-loop ya
maneja errores de tools convirtiéndolos en JSON de error, no hace falta
try/catch adicional).

## Tests obligatorios

- **`entity-resolver` dedupe** (ya descrito arriba).
- **`entity-store` upsert — Client simple**: crea un `Client`, luego
  `upsertEntity` con `renewalActive: false`; `resolveEntityById` después
  del segundo `upsertEntity` devuelve el contenido actualizado
  (`renewalActive: false`), un solo resultado, no dos.
- **`entity-store` upsert — WarrantyPolicy con versión**: crea
  `WarrantyPolicy` en 60 días (revision 1), `upsertEntity` a 90 días.
  Confirma: `resolveCurrentPolicy` devuelve 90 días revision 2;
  `resolvePolicyHistory` devuelve 1 entrada con 60 días. Encadena un
  tercer `upsertEntity` a 120 días — confirma vigente 120/revision 3 e
  historial con 2 entradas (60 y 90, en orden).
- **`relationship-store` idempotencia**: `linkEntities` dos veces con el
  mismo source/target/type — `getRelated` devuelve un solo resultado, no
  dos.
- **Extiende `packages/sdk/tests/llm-module.test.ts`**: un test que, via
  `atlas.llm.ask` con fake provider, llama `org_upsert_entity` para crear
  un `Client` nuevo (uno que no esté en los fixtures) y confirma que el
  mensaje final refleja la creación exitosa.

## Verificación funcional en vivo (obligatoria)

Extiende `packages/sdk/scripts/verify-atlas41-live.mjs` (o crea uno
nuevo si es más claro,
`verify-atlas41-chat-data-entry.mjs`) con un escenario que **no** use
`seedFixtures` — construye el grafo completo del Caso 1 (cliente, política,
regla, dos relaciones) llamando **solo** a `org_upsert_entity` y
`org_link_entities` a través de `/api/chat`, y luego haz la pregunta del
descuento — debe dar la misma respuesta que con los fixtures. Después,
actualiza la garantía de 60 a 90 días vía `org_upsert_entity` por chat, y
confirma que preguntar el historial ahora muestra 45 → 60 → 90. Pega las
respuestas reales.

## Documentación

Agrega una sección "Actualización: creación/actualización desde el chat"
a `releases/WEB_ATLAS4_1_VERTICAL_SLICE.md` — qué tools se agregaron, el
fix de dedupe y por qué era necesario, y el resultado de la verificación
en vivo.

## Gates

4 gates, monorepo completo. Conteo exacto de `@atlas/sdk` antes/después.

## Detenerse antes de commitear

No hagas commit. Reporta diff completo, gates, y las respuestas reales
de la verificación en vivo (las tres: descuento vía chat-construido,
garantía vigente tras actualizar a 90, historial completo). Verifico en
worktree aislado antes de autorizar.
