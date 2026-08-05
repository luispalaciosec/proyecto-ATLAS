---
id: ATLAS-P2.1-IMPLEMENTATION-PLAN
title: P2.1 — LLM Adapter + Tool Calling interno — Implementation Plan for Cursor
version: 1.0.0
status: Complete
created: 2026-08-04
completed: 2026-08-05
owner: Luis Palacios
relationship_to_governance: implements P2.1 of ATLAS_PRODUCT_VISION_v1.0.md; no ADR nuevo; Phase 1 (ADR-0001–ADR-0005) permanece Frozen y no se toca
---

# P2.1 — LLM Adapter + Tool Calling interno

## 0. Contexto y reglas no negociables

Sos Cursor, implementando sobre el repo ATLAS. Phase 1 (Foundation & MVP) está **cerrada y verificada** — 363/363 tests pasando en 11 paquetes, confirmado de forma independiente el 2026-08-04. ADR-0001–ADR-0005 son **Frozen**. Este documento implementa el primer frente de Phase 2 — Product, definido en `ATLAS_PRODUCT_VISION_v1.0.md` sección 7 (P2.1).

**Qué es P2.1, en una frase:** darle a ATLAS una capacidad generativa real (llamar a un modelo de lenguaje) con permiso para invocar, mediante tool-calling, las capabilities ya certificadas de ATLAS (Memory, Planning+Workflow+Compiler+Runtime ya compuestos en `planExecuteAndRemember`) — sin tocar ni una línea de esas capabilities.

**Por qué esto y no otra cosa:** hoy `PlanningEngine` es 100% determinista (grep de todo `packages/intelligence` por `fetch|openai|anthropic|LLM|completion` no devuelve nada). Sin esta pieza, `atlas plan`/`atlas chat` seleccionan estrategias fijas — no razonan. P2.1 es el prerequisito bloqueante de P2.2 (Conversación) y P2.3 (Brands): sin generación real, ninguno de los dos puede dar el "wow" que se busca.

### Reglas no negociables

1. **No se toca `packages/memory`, `packages/workflow`, `packages/intelligence`, `packages/retrieval` por dentro.** Se consumen exclusivamente por su API pública (`index.ts` de cada paquete), igual que hizo el MVP.
2. **No se toca `atlas-service.ts`'s `#createSummaryGenerator()` ni el método `planAndExecute()` existente.** Siguen funcionando exactamente igual para `compile`/`run`/`plan`.
3. **No se toca `chat-command.ts` ni `chat-repl.ts`.** `atlas chat` sigue siendo 100% determinista en P2.1 — absorberlo al LLM es scope de P2.2 (Conversación), no de este sprint. Mezclarlo ahora arriesga los tests existentes de `chat-repl.test.ts` sin necesidad.
4. **Ningún test automatizado (`pnpm test`) puede requerir una API key real ni hacer una llamada de red real.** Todo el tool-calling loop se prueba con un `FakeLlmProvider` scripteado. Si necesitás validar contra la API real, es un script manual separado, fuera de `pnpm test`.
5. **Nunca loguear ni serializar el valor de la API key**, ni en tests, ni en output de `atlas doctor`, ni en errores.
6. **El límite de turnos/tokens (budget guardrail) es obligatorio, no opcional.** Debe existir al menos un test que verifique que el loop se detiene solo cuando se excede el presupuesto, sin loop infinito ni gasto sin control.
7. **No ADRs nuevos, no contratos nuevos, no revisión de arquitectura.** Si durante la implementación aparece una contradicción real con lo Frozen, se detiene y se reporta — no se decide unilateralmente.
8. **Reuso máximo:** el tool `plan_and_execute` que el LLM puede invocar es un wrapper directo de la función `planExecuteAndRemember` que ya existe en `@atlas/sdk` (usada hoy por `atlas plan` y `atlas chat`). No se reimplementa planning ni execution.

## 1. Decisiones de diseño ya tomadas (no hay que redecidir esto)

Estas son decisiones de producto/arquitectura que ya tomé — Cursor las implementa tal cual, no las rediscute.

| Decisión | Valor |
|---|---|
| Paquete nuevo | `packages/llm/` → `@atlas/llm`, mismo template que `@atlas/retrieval` (`package.json` abajo) |
| Abstracción de proveedor | Interfaz `LlmProvider` — swappable, no acoplado a un proveedor específico |
| Proveedor de referencia en P2.1 | Anthropic (`AnthropicProvider`), vía `fetch` directo a `https://api.anthropic.com/v1/messages` — sin SDK externo nuevo, consistente con el resto del monorepo |
| Variables de entorno | `ATLAS_LLM_PROVIDER` (default `anthropic`), `ATLAS_LLM_API_KEY` (requerida), `ATLAS_LLM_MODEL` (requerida, **sin default hardcodeado** — falla con error claro si falta, para no embeber un model id que puede quedar desactualizado) |
| Comando CLI nuevo | `atlas ask --goal "..."` — aislado, no modifica `plan`/`chat`/`compile`/`run` |
| Tools expuestas al modelo en P2.1 | `memory_search`, `memory_store`, `plan_and_execute` (wrapper de `planExecuteAndRemember`) — nada más |
| Presupuesto por defecto | `maxTurns: 6` (configurable vía opciones, no vía env var en P2.1) |
| Tests | 100% con `FakeLlmProvider`, cero llamadas de red en `pnpm test` |

## 2. Patrones existentes a replicar exactamente

| Necesitás | Copiar el patrón de |
|---|---|
| Estructura de paquete nuevo (`package.json`, `tsup`, `vitest`) | `packages/retrieval/package.json` |
| Clase de módulo SDK (`constructor(bus, options, workspace)`) | `packages/sdk/src/modules/retrieval-module.ts` (nota: `RetrievalModule` ya recibe un parámetro extra — `memoryEngine` — antes de `workspace`; `LlmModule` sigue el mismo patrón recibiendo `atlas`) |
| Lectura de env vars sin acoplar el paquete al proceso | `packages/cli/src/services/atlas-service.ts` método `#resolveMemoryFilePath()` (lee `ATLAS_MEMORY_FILE`) |
| Comando CLI nuevo, registro en container | `packages/cli/src/commands/plan-command.ts` + su registro en `packages/cli/src/application/container.ts` |
| Test con proveedor fake en vez de red real | `packages/memory` usa `InMemoryStorageProvider` en tests en vez de un storage real — mismo principio |
| Opciones del facade (`AtlasXOptions`) | `packages/sdk/src/atlas/options.ts` — agregar `AtlasLlmOptions` con la misma forma (`readonly` fields + index signature) |

## 3. Sprints

### LLM-1 — Paquete `@atlas/llm`: contratos + proveedor Anthropic + presupuesto

**Objetivo funcional:** tener un `LlmProvider` que puede completar una conversación con tool-calling contra la API real de Anthropic, con un guardrail de presupuesto, sin ningún tool todavía conectado a ATLAS.

**Paquetes afectados:** `packages/llm/` (nuevo).

**Archivos a crear:**
- `packages/llm/package.json` — clonar de `packages/retrieval/package.json`, cambiar `name`/`description`, sin dependencias de `@atlas/*` en esta capa (el paquete `llm` no conoce Memory/Workflow — eso lo conecta el SDK).
- `packages/llm/src/provider.ts` — interfaces: `LlmMessage`, `LlmToolDefinition`, `LlmToolCall`, `LlmCompletionRequest`, `LlmCompletionResult`, `LlmProvider` (ver forma exacta abajo).
- `packages/llm/src/budget.ts` — `LlmBudget` (`maxTurns: number`, `maxTotalTokens?: number`), `createBudgetTracker()` con método `consume(usage)` que devuelve si se excedió.
- `packages/llm/src/providers/anthropic-provider.ts` — `createAnthropicProvider({ apiKey, model }): LlmProvider`, usando `fetch` a `https://api.anthropic.com/v1/messages`, header `x-api-key`, `anthropic-version`. Traduce `LlmMessage[]`/`LlmToolDefinition[]` al formato de la API y la respuesta de vuelta a `LlmCompletionResult`.
- `packages/llm/src/providers/fake-provider.ts` — `createFakeLlmProvider(script: readonly LlmCompletionResult[]): LlmProvider` — devuelve las respuestas del script en orden, para tests determinísticos.
- `packages/llm/src/index.ts` — exporta todo lo anterior.
- `packages/llm/tests/anthropic-provider.test.ts` — testea el mapeo de request/response contra `fetch` mockeado (no red real).
- `packages/llm/tests/budget.test.ts` — testea que el tracker marca `exceeded: true` al pasar `maxTurns`.

**Forma exacta de `provider.ts`:**

```ts
export interface LlmToolParameterSchema {
  readonly type: 'object';
  readonly properties: Readonly<Record<string, { readonly type: string; readonly description: string }>>;
  readonly required?: readonly string[];
}

export interface LlmToolDefinition {
  readonly name: string;
  readonly description: string;
  readonly parameters: LlmToolParameterSchema;
}

export interface LlmToolCall {
  readonly id: string;
  readonly name: string;
  readonly arguments: Readonly<Record<string, unknown>>;
}

export type LlmMessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface LlmMessage {
  readonly role: LlmMessageRole;
  readonly content: string;
  readonly toolCallId?: string;
  readonly toolCalls?: readonly LlmToolCall[];
}

export type LlmStopReason = 'end_turn' | 'tool_use' | 'max_tokens';

export interface LlmUsage {
  readonly inputTokens: number;
  readonly outputTokens: number;
}

export interface LlmCompletionRequest {
  readonly messages: readonly LlmMessage[];
  readonly tools?: readonly LlmToolDefinition[];
  readonly maxTokens?: number;
}

export interface LlmCompletionResult {
  readonly message: LlmMessage;
  readonly usage: LlmUsage;
  readonly stopReason: LlmStopReason;
}

export interface LlmProvider {
  readonly id: string;
  complete(request: LlmCompletionRequest): Promise<LlmCompletionResult>;
}
```

**Criterios de aceptación:**
- `pnpm --filter @atlas/llm test` verde, cero llamadas de red reales.
- `createAnthropicProvider` nunca loguea `apiKey`.
- Si `ATLAS_LLM_API_KEY` no está seteada al construir el provider, error claro y explícito (no un fallo silencioso ni una llamada con key `undefined`).

**Riesgos:** el formato exacto de la API de Anthropic puede diferir del asumido aquí — si `fetch` a la API real falla por formato, ajustar el mapeo en `anthropic-provider.ts`, no el contrato `LlmProvider` (el contrato es la abstracción, se mantiene estable).

**Dependencias:** ninguna (paquete aislado).

**Tiempo estimado:** 1 sesión de trabajo.

---

### LLM-2 — Tool-calling loop

**Objetivo funcional:** dado un `LlmProvider`, un mensaje de usuario, y una lista de tools ejecutables, correr el ciclo completo: preguntar al modelo → si pide un tool, ejecutarlo → devolver el resultado al modelo → repetir hasta `end_turn` o presupuesto excedido.

**Paquetes afectados:** `packages/llm/` (mismo paquete, nuevos archivos).

**Archivos a crear:**
- `packages/llm/src/tool-loop.ts`:

```ts
export interface ToolExecutor {
  readonly definition: LlmToolDefinition;
  execute(args: Readonly<Record<string, unknown>>): Promise<string>;
}

export interface RunToolLoopOptions {
  readonly provider: LlmProvider;
  readonly systemPrompt: string;
  readonly userMessage: string;
  readonly tools: readonly ToolExecutor[];
  readonly budget?: LlmBudget;
}

export interface ToolLoopResult {
  readonly success: boolean;
  readonly finalMessage: string;
  readonly turns: number;
  readonly usage: LlmUsage;
  readonly budgetExceeded: boolean;
  readonly transcript: readonly LlmMessage[];
}

export async function runToolLoop(options: RunToolLoopOptions): Promise<ToolLoopResult>;
```

- `packages/llm/tests/tool-loop.test.ts` — usando `createFakeLlmProvider`, cubrir mínimo tres casos: (a) respuesta directa sin tool-calling, (b) un tool_call seguido de end_turn, (c) `maxTurns` excedido → `budgetExceeded: true`, el loop se detiene y no sigue llamando al provider.

**Criterios de aceptación:**
- Los tres casos de test pasan.
- Si `execute()` de un `ToolExecutor` lanza una excepción, el loop la captura, la reporta como resultado del tool al modelo (no crashea el proceso), y sigue el ciclo normalmente.

**Riesgos:** ninguno nuevo — es lógica pura sobre las interfaces de LLM-1.

**Dependencias:** LLM-1.

**Tiempo estimado:** 1 sesión de trabajo.

---

### LLM-3 — `LlmModule` en el SDK: conectar Memory y `planExecuteAndRemember`

**Objetivo funcional:** exponer `atlas.llm.ask(goalText)` en el facade del SDK, con tres tools reales conectadas: `memory_search`, `memory_store`, `plan_and_execute`.

**Paquetes afectados:** `packages/sdk/`.

**Archivos a crear/editar:**
- `packages/sdk/src/atlas/options.ts` — agregar:

```ts
export interface AtlasLlmOptions {
  readonly provider?: LlmProvider;
  readonly apiKey?: string;
  readonly model?: string;
  readonly budget?: LlmBudget;
  readonly [key: string]: unknown;
}
```
  y `readonly llm?: AtlasLlmOptions;` en `AtlasOptions`.

- `packages/sdk/src/modules/llm-module.ts` (nuevo) — construye el `LlmProvider` (usa `options.provider` si viene inyectado — así los tests pasan un fake sin tocar env vars — si no, arma `createAnthropicProvider` con `apiKey`/`model` de las opciones), arma el registro de tools a partir de la instancia de `Atlas` recibida, y expone `ask(goalText, options)` que llama a `runToolLoop`.

  El registro de tools:
  - `memory_search`: wrapea `atlas.memory.searchContent({ query })`.
  - `memory_store`: wrapea `atlas.memory.storeContent({ content })`.
  - `plan_and_execute`: wrapea `planExecuteAndRemember(atlas, goal)` — la misma función que ya usan `plan-command.ts` y `chat-repl.ts`. No se reimplementa nada de planning/execution.

- `packages/sdk/src/atlas/atlas.ts` — agregar `readonly llm: LlmModule;`, instanciado **al final** del constructor (después de `workflow`), pasándole `this` como referencia a la instancia `Atlas` ya parcialmente construida (memory/planning/workflow ya están asignados en ese punto — mismo orden de dependencia que usa `retrieval` con `memory.getEngine()`).

- `packages/sdk/src/index.ts` — exportar los tipos/símbolos nuevos de `llm-module.ts` y re-exportar lo necesario de `@atlas/llm`.

- `packages/sdk/tests/llm-module.test.ts` — con `createFakeLlmProvider` inyectado vía `options.llm.provider`, verificar: (a) `ask()` puede completar sin tools, (b) `ask()` puede invocar `memory_search` y `memory_store` y el resultado queda realmente en Memory (verificable con `atlas.memory.searchContent` después), (c) `ask()` puede invocar `plan_and_execute` y el resultado coincide con lo que devolvería llamar `planExecuteAndRemember` directamente.

**Criterios de aceptación:**
- `pnpm --filter @atlas/sdk test` sigue en verde, incluidos todos los tests preexistentes (nada se rompe).
- Ningún test de este sprint hace una llamada de red real.

**Riesgos:** el orden de inicialización en el constructor de `Atlas` importa — si `llm` se instancia antes que `memory`/`planning`/`workflow`, esos campos van a ser `undefined` dentro de `LlmModule`. Verificar el orden explícitamente.

**Dependencias:** LLM-1, LLM-2.

**Tiempo estimado:** 1–2 sesiones de trabajo.

---

### LLM-4 — CLI: `atlas ask` + `atlas doctor`

**Objetivo funcional:** un usuario puede correr `atlas ask --goal "..."` desde la terminal y obtener una respuesta generada de verdad, con memoria y planning disponibles como herramientas del modelo.

**Paquetes afectados:** `packages/cli/`.

**Archivos a crear/editar:**
- `packages/cli/src/commands/ask-command.ts` (nuevo) — mismo patrón que `plan-command.ts`: `AskCommand implements CliCommand`, opción `--goal <text>` requerida, opción `--json`. Internamente llama a `container.atlasService.createMemoryClient()` y después `client.llm.ask(goal)`.
- `packages/cli/src/services/atlas-service.ts` — agregar un método privado `#resolveLlmOptions(): AtlasLlmOptions` que lea `ATLAS_LLM_PROVIDER`, `ATLAS_LLM_API_KEY`, `ATLAS_LLM_MODEL` de `process.env` (mismo patrón que `#resolveMemoryFilePath()`), y pasarlo dentro de `createAtlas({ ..., llm: this.#resolveLlmOptions() })` en `createClient()`. **No tocar** `#createSummaryGenerator()` ni la firma pública de los métodos existentes.
- `packages/cli/src/application/container.ts` — registrar `commandRegistry.register(new AskCommand())`.
- El comando `doctor` — agregar un check no bloqueante: `llm: configured (provider=anthropic)` si `ATLAS_LLM_API_KEY` está seteada, o `llm: not configured (ATLAS_LLM_API_KEY missing — atlas ask will fail)` si no — **sin imprimir el valor de la key en ningún caso**. Esto no debe hacer fallar `doctor` (status `HEALTHY` se mantiene si todo lo demás está bien).
- `.env.example` (raíz del repo) — agregar/confirmar las tres variables con valores vacíos o de ejemplo, nunca una key real.
- `packages/cli/tests/cli.test.ts` — agregar un test de `atlas ask` inyectando un `FakeLlmProvider` (igual que se probó `atlas plan`/`atlas memory` en el MVP), sin llamada real.

**Criterios de aceptación:**
- `pnpm --filter @atlas/cli test` verde, incluidos todos los tests preexistentes.
- `atlas ask --goal "..."` sin `ATLAS_LLM_API_KEY` seteada falla con un mensaje de error claro (no un stack trace críptico).
- `atlas doctor` nunca imprime el valor de `ATLAS_LLM_API_KEY`.

**Riesgos:** ninguno nuevo más allá de los ya cubiertos en LLM-1–3.

**Dependencias:** LLM-1, LLM-2, LLM-3.

**Tiempo estimado:** 1 sesión de trabajo.

---

## 4. Verificación manual (fuera de `pnpm test`, requiere key real)

Después de LLM-4, con una `ATLAS_LLM_API_KEY` real exportada en tu shell:

```bash
export ATLAS_LLM_PROVIDER=anthropic
export ATLAS_LLM_API_KEY=sk-ant-...
export ATLAS_LLM_MODEL=<modelo vigente en tu cuenta>
pnpm --filter @atlas/cli build
node packages/cli/dist/index.js ask --goal "Busca en memoria si ya planeé algo sobre 'pedido cliente' y si no, créalo."
```

Esto es una verificación humana, no un test automatizado. El objetivo es confirmar que el modelo real de verdad invoca `memory_search`/`plan_and_execute` y no solo devuelve texto.

## 5. Fuera de alcance de P2.1 (explícitamente)

- `atlas chat` no se toca — sigue determinista. Se absorbe al LLM en P2.2.
- No hay Brands ni Workspaces todavía (P2.3) — `memory_search`/`memory_store` siguen operando sobre el namespace único `cli.default` del MVP.
- No hay proveedor OpenAI/Gemini/local implementado — solo la interfaz que lo permite. Agregar un segundo proveedor es trabajo futuro detrás de la misma abstracción, no parte de este sprint.
- No hay streaming de respuesta — `complete()` devuelve la respuesta completa, no tokens incrementales.
- No hay UI — esto es CLI únicamente (`atlas ask`), consistente con P2.5 (Web UI) siendo posterior.

## 6. Protocolo de reporte por sprint

Al cerrar cada sprint (LLM-1 a LLM-4), reportar:

1. Comandos ejecutados y su output real (no resumido) de `pnpm --filter @atlas/<paquete> test`.
2. Confirmación explícita de que ningún archivo fuera de lo listado en ese sprint fue modificado (`git status --short`).
3. Confirmación explícita de que ninguna de las 8 reglas no negociables de la Sección 0 fue violada.
4. Si algo del diseño de la Sección 1/2 resultó no viable tal como está especificado, reportarlo y detenerse — no improvisar una alternativa sin avisar.
