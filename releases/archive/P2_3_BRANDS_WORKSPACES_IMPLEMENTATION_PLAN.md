---
id: ATLAS-P2.3-IMPLEMENTATION-PLAN
title: P2.3 — Brands & Workspaces — Implementation Plan for Cursor
version: 1.0.0
status: Complete
created: 2026-08-05
completed: 2026-08-05
owner: Luis Palacios
relationship_to_governance: implements P2.3 de ATLAS_PRODUCT_VISION_v1.0.md; construye sobre P2.1+P2.2 (verificados, 423/423 tests); ADR-0001–ADR-0005 permanecen Frozen
---

# P2.3 — Brands & Workspaces

## 0. Contexto y reglas no negociables

P2.1 (LLM Adapter) y P2.2 (Conversación) están **cerrados y verificados de forma independiente**: commits `ce7816e` y `9b54cd4`, 423 tests pasando entre `@atlas/llm` (10), `@atlas/sdk` (31) y `@atlas/cli` (45) más el resto del monorepo sin regresión. Este documento implementa P2.3, definido en `ATLAS_PRODUCT_VISION_v1.0.md` sección 7 (fusión explícita de Brands + Workspaces — se construyen juntos porque uno sin el otro no funciona).

**Qué es P2.3, en una frase:** `atlas brand geeks` carga el contexto de esa marca (propósito, tono, procesos, clientes, reglas) y abre una conversación con memoria **físicamente aislada** de cualquier otra marca — no una etiqueta sobre memoria compartida.

**Por qué esto y no otra cosa:** el `Vision doc` es explícito — "Brand sin Workspace es una etiqueta sobre memoria compartida, no aislamiento real." Hoy, después de P2.1/P2.2, toda la memoria vive en un único namespace fijo `cli.default` (`DEFAULT_NAMESPACE_ID` en `packages/sdk/src/modules/memory-module.ts`). P2.3 no filtra ese namespace — le da a cada marca su propio archivo de memoria, reutilizando `JsonFileStorageProvider`/`createJsonFileMemoryEngine` tal cual existen desde el MVP, sin tocarlos.

### Reglas no negociables

1. **No se toca `packages/memory`, `packages/workflow`, `packages/intelligence`, `packages/retrieval` por dentro.** El aislamiento se logra con un `storageFilePath` distinto por marca — mecanismo que ya existe desde MVP Sprint 4, no una capability nueva.
2. **`atlas chat`, `atlas ask`, `atlas` (sin subcomando), `atlas plan`, `atlas memory` no cambian de comportamiento.** Siguen operando sobre `cli.default` exactamente como hoy. Brands es aditivo — `atlas brand <name>` es la única superficie nueva.
3. **Aislamiento real y probado:** cada workspace tiene un archivo de memoria físicamente separado (no un namespace compartido con filtro). Tiene que existir un test de integración que demuestre que `memory_search` desde la marca A nunca devuelve contenido guardado desde la marca B.
4. **Cero red real en tests.** Mismo patrón de `fetch` stubbeado que P2.1/P2.2.
5. **Nunca loguear la API key.**
6. **No ADRs nuevos, no revisión de arquitectura.**
7. **Reuso máximo:** `WorkspaceProfile` es configuración a nivel CLI, no una capability nueva del Kernel. No se crea `@atlas/brand` ni `@atlas/workspace` como paquete — vive dentro de `packages/cli/`.
8. **`atlas brand <name>` con un nombre nunca visto crea el perfil por defecto automáticamente.** No requiere un comando `atlas brand create` separado en este sprint — baja fricción, consistente con el resto de Phase 2.
9. **Sanitizar el nombre de marca antes de usarlo como nombre de directorio.** Solo `[a-z0-9-]`, sin `/`, sin `..`, sin espacios — el nombre de marca se convierte en ruta de archivo, tiene que estar validado contra path traversal.

## 1. Decisiones de diseño ya tomadas

| Decisión | Valor |
|---|---|
| Dónde vive cada workspace | `.atlas/workspaces/<slug>/` — `profile.json` (perfil) + `memory.json` (memoria, formato ya definido por `JsonFileStorageProvider`) |
| Aislamiento | Un archivo de memoria físico por marca, no un namespace compartido — reusa `createJsonFileMemoryEngine(storageFilePath, ...)` tal cual |
| Quién carga el perfil en el prompt del modelo | `AtlasLlmOptions` gana un campo nuevo `contextPrompt?: string`, que `LlmModule` concatena al `SYSTEM_PROMPT` existente |
| Qué hace `atlas brand <name>` | Carga (o crea) el perfil, arma un cliente `Atlas` con `storageFilePath` y `contextPrompt` de esa marca, y lanza el mismo `runChatRepl` que ya usan `atlas chat`/`atlas` — no es un comando nuevo de UI, es una parametrización de lo que ya existe |
| Edición del perfil | Manual en P2.3 — el usuario edita `profile.json` directamente. Un comando `atlas brand edit`/`atlas brand set` queda fuera de alcance, es trabajo futuro |
| Forma del perfil | Plana, mínima, sin sobre-diseño (ver Sección 2) |

## 2. Forma exacta de `WorkspaceProfile`

```ts
export interface WorkspaceProfile {
  readonly name: string;
  readonly purpose: string;
  readonly tone: string;
  readonly processes: readonly string[];
  readonly clients: readonly string[];
  readonly rules: readonly string[];
  readonly createdAt: string;
}
```

Template por defecto al crear una marca nueva (todos los campos de texto vacíos, arrays vacíos, `createdAt` con `new Date().toISOString()`). El usuario lo completa a mano editando `.atlas/workspaces/<slug>/profile.json`.

## 3. Patrones existentes a replicar

| Necesitás | Mirar |
|---|---|
| Crear un `MemoryEngine` con storage en archivo | `createJsonFileMemoryEngine` en `@atlas/memory`, ya usado en `packages/cli/src/services/atlas-service.ts` |
| Resolver una ruta de archivo desde opciones/env con fallback | `AtlasService#resolveMemoryFilePath()` |
| Comando CLI nuevo, registro en container | `packages/cli/src/commands/ask-command.ts` + su registro en `container.ts` |
| Lanzar el REPL de chat con un cliente ya armado | `packages/cli/src/chat/chat-repl.ts` (`runChatRepl(container, options)`) — revisar si necesita aceptar un `Atlas` client ya construido en vez de siempre llamar `container.atlasService.createMemoryClient()` internamente (ver BRAND-3) |
| Extender `AtlasLlmOptions` de forma aditiva | Mismo patrón que agregó `budget`/`provider` en P2.1 — `packages/sdk/src/atlas/options.ts` |
| Test de aislamiento con `fetch` stubbeado | Mismo patrón que el test de historial de P2.2 en `chat-repl.test.ts` (`vi.stubGlobal('fetch', ...)`) |

## 4. Sprints

### BRAND-1 — `WorkspaceProfile`: modelo y almacenamiento

**Objetivo funcional:** poder resolver, cargar o crear el perfil y la ruta de memoria de cualquier marca por nombre, con el nombre saneado contra path traversal.

**Paquetes afectados:** `packages/cli/`.

**Archivos a crear:**
- `packages/cli/src/workspace/brand-profile.ts`:
  ```ts
  export interface WorkspaceProfile { /* ver Sección 2 */ }

  export interface WorkspacePaths {
    readonly slug: string;
    readonly directory: string;
    readonly profilePath: string;
    readonly memoryFilePath: string;
  }

  export function sanitizeBrandSlug(name: string): string; // solo [a-z0-9-], lanza si queda vacío o contiene .. o /
  export function resolveWorkspacePaths(name: string, rootDir?: string): WorkspacePaths; // rootDir default: process.cwd()/.atlas/workspaces
  export function loadOrCreateBrandProfile(paths: WorkspacePaths): WorkspaceProfile; // sync, crea el directorio y el JSON default si no existe
  export function renderProfileAsContext(profile: WorkspaceProfile): string; // bloque de texto legible para el system prompt
  ```

**Tests:**
- `sanitizeBrandSlug` rechaza `../etc`, `geeks/../../x`, cadenas vacías; acepta `geeks`, `banco-machala`.
- `loadOrCreateBrandProfile` crea el archivo con el template default en la primera llamada, y en la segunda llamada devuelve el mismo contenido sin sobrescribirlo (probar que editar el archivo a mano entre llamadas se respeta).
- `resolveWorkspacePaths('geeks')` y `resolveWorkspacePaths('revital')` devuelven rutas distintas y no se pisan.
- `renderProfileAsContext` incluye el `purpose`/`tone`/`rules` en el texto generado.

**Criterios de aceptación:** `pnpm --filter @atlas/cli test` verde, incluidos los tests nuevos de este módulo.

**Riesgos:** ninguno — módulo nuevo, aislado, sin dependencias de Memory/SDK todavía.

**Dependencias:** ninguna.

**Tiempo estimado:** 1 sesión de trabajo.

---

### BRAND-2 — `AtlasLlmOptions.contextPrompt`

**Objetivo funcional:** poder inyectar contexto adicional (el perfil de marca) en el system prompt del LLM sin tocar el `SYSTEM_PROMPT` base que usan `atlas ask`/`atlas chat`/`atlas`.

**Paquetes afectados:** `packages/sdk/`.

**Cambios:**
- `packages/sdk/src/atlas/options.ts` — agregar `readonly contextPrompt?: string;` a `AtlasLlmOptions`.
- `packages/sdk/src/modules/llm-module.ts` — al armar `SYSTEM_PROMPT` para `runToolLoop`, si `this.#llmOptions.contextPrompt` está presente, concatenarlo (con un separador claro, ej. `\n\n---\n\n`) al prompt base. Si no está presente, comportamiento idéntico a P2.1/P2.2.

**Tests:**
- `packages/sdk/tests/llm-module.test.ts` — nuevo caso: con `contextPrompt` seteado y un provider fake que registra el request recibido, verificar que el mensaje `system` enviado al provider contiene el texto del `contextPrompt`. Sin `contextPrompt`, verificar que el comportamiento es idéntico al que ya prueban los tests existentes (no romperlos).

**Criterios de aceptación:** `pnpm --filter @atlas/sdk test` verde, incluidos todos los tests preexistentes de P2.1/P2.2 sin modificar.

**Riesgos:** ninguno — extensión aditiva de una interfaz ya extendida dos veces antes (P2.1 `budget`/`provider`, P2.2 `history`).

**Dependencias:** ninguna (independiente de BRAND-1).

**Tiempo estimado:** menos de 1 sesión.

---

### BRAND-3 — `atlas brand <name>`

**Objetivo funcional:** `atlas brand geeks` carga (o crea) el perfil de Geeks, arma un cliente Atlas con memoria aislada en `.atlas/workspaces/geeks/memory.json` y el perfil como contexto del LLM, y abre la misma conversación que `atlas chat`.

**Paquetes afectados:** `packages/cli/`.

**Cambios:**
- `packages/cli/src/services/atlas-service.ts` — agregar un método `createBrandClient(paths: WorkspacePaths, contextPrompt: string): Atlas` que llama `createAtlas` con `memory: { storageFilePath: paths.memoryFilePath }` y `llm: { ...this.#resolveLlmOptions(), contextPrompt }`. **No modificar** `createClient()`/`createMemoryClient()` existentes — este es un método nuevo al lado, no un reemplazo.
- `packages/cli/src/chat/chat-repl.ts` — revisar si `runChatRepl` puede recibir un `Atlas` client ya construido en vez de siempre pedirle uno a `container.atlasService.createMemoryClient()`. Si `runChatRepl(container, options)` no tiene ese seam, agregar `options.client?: Atlas` opcional — si viene, se usa ese; si no, comportamiento actual sin cambios (`createMemoryClient()` como siempre). Esto es lo que le permite a `atlas brand` reusar el REPL sin duplicar código.
- `packages/cli/src/commands/brand-command.ts` (nuevo):
  ```ts
  export class BrandCommand implements CliCommand {
    readonly name = 'brand';
    register(program: Command, container: Container): void {
      program
        .command('brand <name>')
        .description('Open a brand-scoped conversation with isolated memory and context')
        .action(async (name: string) => {
          const paths = resolveWorkspacePaths(name);
          const profile = loadOrCreateBrandProfile(paths);
          const client = container.atlasService.createBrandClient(paths, renderProfileAsContext(profile));
          await runChatRepl(container, { client });
        });
    }
  }
  ```
- `packages/cli/src/application/container.ts` — registrar `commandRegistry.register(new BrandCommand())`.

**Tests:**
- Nuevo archivo `packages/cli/tests/brand-command.test.ts` (o agregado a `chat-repl.test.ts`, decisión de Cursor): con `fetch` stubbeado (mismo patrón que P2.2), abrir una sesión de `atlas brand geeks`, guardar contenido vía `memory_store`, cerrar. Abrir una sesión de `atlas brand revital`, buscar con `memory_search` el contenido guardado en la sesión de Geeks — **debe devolver cero resultados**. Volver a abrir `atlas brand geeks` y confirmar que el contenido sigue ahí.
- Verificar que el `system` prompt enviado al provider fake en una sesión de `atlas brand geeks` contiene el texto del perfil (purpose/tone/rules), y que en `atlas chat` normal (sin marca) no lo contiene.

**Criterios de aceptación:**
- `pnpm --filter @atlas/cli test` verde, incluido el test de aislamiento cruzado entre dos marcas.
- `pnpm --filter @atlas/sdk --filter @atlas/llm test` siguen en verde sin cambios de comportamiento fuera de lo agregado en BRAND-2.

**Riesgos:** si `runChatRepl` no acepta un client externo hoy, hay que tocar su firma — hacerlo de forma estrictamente aditiva (parámetro opcional), y volver a correr el test existente de `chat-repl.test.ts` (el que no se puede modificar) para confirmar que sigue funcionando exactamente igual sin pasar `client`.

**Dependencias:** BRAND-1, BRAND-2.

**Tiempo estimado:** 1–2 sesiones de trabajo.

---

### BRAND-4 — Documentación de cierre

**Archivos a editar:**
- `VERSION.md` — sección `## P2.3 — Brands & Workspaces (Phase 2)`, mismo formato que P2.1/P2.2 (tabla BRAND-1…4, estado, referencia a este documento), `Current Phase` → `Phase 2 — Product (P2.3 Delivered)`, `Next Sprint` → `P2.4 — Feedback Loop`.
- Registrar como nota (no deuda, es una decisión de alcance): edición de perfil de marca es manual en P2.3, `atlas brand edit` queda como trabajo futuro.
- **No tocar** `ATLAS_PRODUCT_VISION_v1.0.md`.

**Dependencias:** BRAND-1, BRAND-2, BRAND-3.

**Tiempo estimado:** menos de 1 sesión.

## 5. Fuera de alcance de P2.3 (explícitamente)

- `atlas brand edit`/`atlas brand set` para modificar el perfil desde la CLI — edición manual del JSON por ahora.
- `atlas brand list` para listar marcas existentes — no es parte de este sprint, aunque es trivial de agregar después (leer subdirectorios de `.atlas/workspaces/`).
- Migración de memoria ya guardada en `cli.default` hacia una marca — no aplica, son espacios distintos desde el día uno.
- Feedback loop (P2.4) — todavía no.
- Cualquier cambio a `atlas chat`/`atlas ask`/`atlas` bare — quedan exactamente como P2.2 los dejó.

## 6. Protocolo de reporte por sprint

Igual que P2.1/P2.2: comandos ejecutados con output real, `git status --short`, confirmación explícita de las 9 reglas no negociables, y detenerse a reportar si algo del diseño (en particular el seam de `runChatRepl` en BRAND-3) no es viable tal como está especificado.
