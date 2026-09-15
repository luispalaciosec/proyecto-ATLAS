# Superprompt — Conectar OrgMemoryModule a Atlas como `atlas.org`

## Contexto

En la revisión de ATLAS 4.1 (commit `fef9356`, ya en `main`) quedó un
cabo suelto: `OrgMemoryModule` (`packages/sdk/src/modules/org-memory-module.ts`)
se construyó como facade siguiendo el patrón de `MemoryModule`/`LlmModule`,
pero nunca se conectó a la clase `Atlas`. Las tools `org_evaluate_discount`
y `org_resolve_policy` en `llm-module.ts` importan y llaman las funciones
de `packages/sdk/src/org/*` directamente, sin pasar por el facade. Hoy
`OrgMemoryModule` no lo usa nada ni lo prueba ningún test — es código
muerto funcionalmente correcto pero desconectado.

## Alcance autorizado

Solo estos archivos:

- `packages/sdk/src/atlas/atlas.ts`
- `packages/sdk/src/modules/llm-module.ts`
- `packages/sdk/tests/` (test nuevo o extendido para `atlas.org`)

No se necesitan cambios en `packages/sdk/src/org/**` ni en
`org-memory-module.ts` — ya están completos y probados. No tocar
`@atlas/memory`, kernel, `apps/web`, `packages/cli`.

## Cambio 1 — `atlas.ts`

Sigue el patrón exacto de `this.llm = new LlmModule(bus, options.llm, this, options.workspace)`:

```ts
import { OrgMemoryModule } from '../modules/org-memory-module.js';

export class Atlas {
  // ...
  readonly org: OrgMemoryModule;

  constructor(options: AtlasOptions = {}) {
    // ... (orden actual sin cambios)
    this.llm = new LlmModule(bus, options.llm, this, options.workspace);
    this.org = new OrgMemoryModule(this);
  }
}
```

(`OrgMemoryModule` ya tiene constructor `(atlas: Atlas)` — no requiere
cambios en su propio archivo.)

## Cambio 2 — `llm-module.ts`

En los dos executors de `org_evaluate_discount` y `org_resolve_policy`,
reemplaza las llamadas directas a las funciones importadas de `../org/*`
por llamadas a `atlas.org.*`:

- `evaluateDiscountRequest(atlas, clientLegalName, requestedPercent)` →
  `atlas.org.evaluateDiscountRequest(clientLegalName, requestedPercent)`
- `formatDiscountEvaluation(evaluation)` → `atlas.org.formatDiscountEvaluation(evaluation)`
- Para `org_resolve_policy`: usa `atlas.org.resolveCurrentWarrantyByCode`,
  `atlas.org.resolvePolicyHistory`, `atlas.org.formatCurrentWarrantyPolicy`,
  `atlas.org.formatWarrantyPolicyHistory` — todos ya existen en
  `OrgMemoryModule` tal como está.

Elimina los imports directos de `../org/policy-evaluator.js`,
`../org/policy-answer.js`, `../org/version-resolver.js` en `llm-module.ts`
si ya no se usan tras el cambio.

## Test requerido

Agrega un test (en `packages/sdk/tests/`, nuevo archivo
`atlas-org-module.test.ts` o similar) que:

1. Crea un `Atlas` con `createAtlas`.
2. Confirma que `atlas.org` existe y es instancia de `OrgMemoryModule`.
3. Usa `atlas.org.storeEntity` + `atlas.org.linkEntities` (o
   `seedCase1DiscountGraph` si prefieres reusar el fixture) y luego
   `atlas.org.evaluateDiscountRequest(...)` — confirma que el resultado
   es el mismo que ya prueban `org-policy-evaluator.test.ts` (12% →
   `autonomous: false`, `approverRole: 'SalesDirector'`), esta vez
   pasando por el facade en vez de las funciones sueltas.

No dupliques toda la cobertura ya existente — este test solo prueba que
el facade conectado a `Atlas` funciona igual que las funciones directas.

## Verificación

Los tests existentes de `org_evaluate_discount`/`org_resolve_policy` en
`llm-module.test.ts` deben seguir pasando sin modificarlos (si el
refactor es correcto, el comportamiento observable no cambia — mismo
input, mismo output). Si necesitas tocar esos tests para que compilen,
avísalo explícitamente en el reporte y explica por qué.

## Gates

4 gates en el monorepo completo. Reporta conteo exacto de `@atlas/sdk`
antes/después.

## Documentación

Actualiza `releases/WEB_ATLAS4_1_VERTICAL_SLICE.md` — agrega una sección
corta "Actualización: OrgMemoryModule conectado a Atlas" con la fecha de
hoy, en vez de crear un doc nuevo (es continuación directa del mismo
trabajo, no una feature nueva).

## Detenerse antes de commitear

No hagas commit. Reporta diff completo + gates + doc actualizado. Verifico
en worktree aislado antes de autorizar, como siempre.
