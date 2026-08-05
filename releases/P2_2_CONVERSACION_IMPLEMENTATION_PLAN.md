---
id: ATLAS-P2.2-IMPLEMENTATION-PLAN
title: P2.2 — Conversación — Implementation Plan for Cursor
version: 1.0.0
status: Complete
created: 2026-08-05
completed: 2026-08-05
owner: Luis Palacios
relationship_to_governance: implements P2.2 of ATLAS_PRODUCT_VISION_v1.0.md; construye sobre P2.1 (Accepted, verificado, 378/378 tests); ADR-0001–ADR-0005 permanecen Frozen
---

# P2.2 — Conversación

## 0. Contexto y reglas no negociables

P2.1 (LLM Adapter + tool-calling) está **cerrado y verificado de forma independiente**: 378/378 tests pasando en 12 paquetes, commit `ce7816e`. Este documento implementa P2.2, definido en `ATLAS_PRODUCT_VISION_v1.0.md` sección 7: colapsar `atlas memory` / `atlas plan` / `atlas retrieval` en una sola experiencia — `atlas`, y conversar.

**Qué es P2.2, en una frase:** `atlas chat` deja de ser determinista y gana memoria conversacional real (el historial de la charla, no solo Retrieval sobre goals pasados) usando el LLM Adapter de P2.1; y `atlas` sin subcomando lanza esa misma conversación como punto de entrada único.

**Qué NO es P2.2:** no es una reescritura. `atlas chat` ya existe, ya tiene tests, ya persiste sesión y memoria vía Retrieval — P2.2 le agrega una capa generativa encima, con un fallback explícito al comportamiento actual cuando no hay LLM configurado.

### Reglas no negociables (heredadas de P2.1 + nuevas de P2.2)

1. **No se toca `packages/memory`, `packages/workflow`, `packages/intelligence`, `packages/retrieval` por dentro.** Igual que en P2.1.
2. **El test determinista existente de `chat-repl.test.ts`** (`runChatRepl > keeps the same chat session id and retrieves prior memory...`, sin `ATLAS_LLM_API_KEY` configurada) **debe seguir pasando sin modificar ese archivo de test existente.** Es la prueba de que el fallback determinista no se rompió. Podés *agregar* tests nuevos al mismo archivo, no modificar el que ya está.
3. **`atlas ask` (P2.1) no cambia de comportamiento.** No gana historial en este sprint — sigue siendo single-shot por diseño. Ver Sección 4.
4. **Ningún test automatizado hace una llamada de red real.** Mismo patrón que P2.1: `fetchImpl` inyectado o `fetch` global stubbeado con `vi.stubGlobal`, nunca contra `api.anthropic.com` de verdad.
5. **Nunca loguear la API key** — regla heredada, sin cambios.
6. **El presupuesto de turnos (`maxTurns`) se resetea en cada mensaje del usuario, no se acumula a lo largo de toda la sesión de chat.** Decisión explícita — no se diseña un presupuesto de sesión completa en P2.2.
7. **No ADRs nuevos, no revisión de arquitectura.**
8. **Reuso:** el modo fallback determinista es el código de `chat-repl.ts` que ya existe — se reutiliza tal cual dentro de una rama `if`, no se reimplementa.

## 1. Decisión de diseño ya tomada: fallback, no reemplazo

`atlas chat` (y `atlas` sin subcomando) revisan si el LLM está configurado (`ATLAS_LLM_API_KEY` + `ATLAS_LLM_MODEL` presentes, o un provider inyectado para tests):

- **Si está configurado:** cada turno pasa por el tool-calling loop de P2.1 (`atlas.llm.ask`), con el historial completo de la conversación como contexto — el modelo recuerda lo que se dijo antes en la misma sesión, no solo goals pasados vía Retrieval.
- **Si no está configurado:** cada turno usa exactamente el código actual (`planExecuteAndRemember` vía `atlasService.planAndExecute`) — el comportamiento hoy certificado, sin cambios.

Esto es intencional: nadie pierde la funcionalidad actual por no tener una API key configurada, y quien sí la tiene gana conversación real sin que se le rompa nada.

**Deuda aceptada, no resuelta en P2.2:** el historial de la conversación crece sin límite dentro de una sesión y se reenvía completo en cada turno al LLM (más tokens, más costo, a medida que la charla se alarga). No hay truncado ni resumen en este sprint. Documentar como deuda aceptada en `VERSION.md`, igual que se hizo con TD-11D-001 en Phase 1.

## 2. Patrones existentes a replicar

| Necesitás | Mirar |
|---|---|
| Forma de `ChatSessionState`, `runChatRepl`, `executeChatTurn` | `packages/cli/src/chat/chat-repl.ts`, `packages/cli/src/chat/chat-session.ts` (no se reescriben, se extienden) |
| Cómo `LlmModule.ask()` arma el tool loop hoy | `packages/sdk/src/modules/llm-module.ts` (P2.1) |
| Forma de `LlmMessage`/`ToolLoopResult` | `packages/llm/src/provider.ts`, `packages/llm/src/tool-loop.ts` |
| Inyectar un provider fake sin red real en un test de paquete aislado | `packages/sdk/tests/llm-module.test.ts` (P2.1) |
| Inyectar `ATLAS_MEMORY_FILE` vía env var en un test de CLI | `packages/cli/tests/chat-repl.test.ts`, bloque `beforeAll`/`afterAll` existente |
| Stub de `fetch` global para un test de integración sin red real | Nuevo en P2.2 — usar `vi.stubGlobal('fetch', ...)` con una respuesta con forma Anthropic real (mirar `packages/llm/tests/anthropic-provider.test.ts` para la forma exacta del body) |

## 3. Sprints

### CONV-1 — Historial de conversación en `@atlas/llm` y `LlmModule`

**Objetivo funcional:** el tool-calling loop puede continuar una conversación previa en vez de empezar siempre desde cero, y `LlmModule` puede reportar si el LLM está configurado sin lanzar una excepción.

**Paquetes afectados:** `packages/llm/`, `packages/sdk/`.

**Cambios:**

- `packages/llm/src/tool-loop.ts` — agregar `readonly history?: readonly LlmMessage[];` a `RunToolLoopOptions`. Cambiar la inicialización de `messages` de:
  ```ts
  const messages: LlmMessage[] = [{ role: 'user', content: options.userMessage }];
  ```
  a:
  ```ts
  const messages: LlmMessage[] = [...(options.history ?? []), { role: 'user', content: options.userMessage }];
  ```
  El resto del loop no cambia. `ToolLoopResult.transcript` ya devuelve todo lo generado en esta llamada (incluyendo el nuevo turno) — el caller es responsable de concatenar `history` previo + `transcript` nuevo para la siguiente llamada.

- `packages/sdk/src/modules/llm-module.ts` — `AskOptions` gana `readonly history?: readonly LlmMessage[];`, se pasa a `runToolLoop`. Agregar método público:
  ```ts
  isConfigured(): boolean {
    if (this.#injectedProvider !== undefined) return true;
    const apiKey = this.#llmOptions.apiKey;
    const model = this.#llmOptions.model;
    return typeof apiKey === 'string' && apiKey.trim().length > 0
      && typeof model === 'string' && model.trim().length > 0;
  }
  ```
  Importante: `isConfigured()` **nunca** construye el provider real ni hace red — solo inspecciona las opciones.

**Tests:**
- `packages/llm/tests/tool-loop.test.ts` — nuevo caso: pasar `history` con un turno previo (`user`/`assistant`), verificar que el `FakeLlmProvider` recibe esos mensajes en el request (puede requerir extender `createFakeLlmProvider` para que registre las requests recibidas, ej. exponer `.calls` en el fake).
- `packages/sdk/tests/llm-module.test.ts` — nuevos casos: `isConfigured()` es `true` con provider inyectado, `true` con `apiKey`+`model` en options, `false` si falta cualquiera de los dos — y confirmar que llamarlo no lanza ni intenta red.

**Criterios de aceptación:** `pnpm --filter @atlas/llm --filter @atlas/sdk test` verde, incluidos todos los tests preexistentes de P2.1 sin modificar.

**Riesgos:** ninguno nuevo — es una extensión aditiva de interfaces ya existentes.

**Dependencias:** P2.1 completo.

**Tiempo estimado:** 1 sesión de trabajo.

---

### CONV-2 — `atlas chat`: conversación LLM con fallback determinista

**Objetivo funcional:** con `ATLAS_LLM_API_KEY`/`ATLAS_LLM_MODEL` configuradas, `atlas chat` conversa de verdad y recuerda lo dicho en turnos anteriores de la misma sesión. Sin esas variables, se comporta exactamente igual que hoy.

**Paquetes afectados:** `packages/cli/`.

**Cambios:**

- `packages/cli/src/chat/chat-session.ts` — `ChatSessionState` gana `history: LlmMessage[]` (mutable, inicia `[]`). Importar `LlmMessage` desde `@atlas/sdk` (ya re-exportado o agregar el re-export si falta).

- `packages/cli/src/chat/chat-repl.ts` — `executeChatTurn` se bifurca al inicio:
  ```ts
  if (session.client.llm.isConfigured()) {
    return executeLlmChatTurn(container, session, goal);
  }
  return executeDeterministicChatTurn(container, session, goal); // el código actual, renombrado, sin cambios de lógica
  ```
  `executeLlmChatTurn` (nueva función): llama `session.client.llm.ask(goal, { history: session.history })`, agrega el `transcript` devuelto a `session.history`, y arma un `ChatTurnPayload` extendido (ver abajo).

  `ChatTurnPayload` — agregar campos **opcionales** (no romper el shape existente):
  ```ts
  readonly mode?: 'llm' | 'deterministic';
  readonly llm_turns?: number;
  readonly budget_exceeded?: boolean;
  ```
  El modo determinista puede omitir estos campos o setear `mode: 'deterministic'` — decisión de Cursor, siempre que no rompa el test existente que ya lee `payload.retrieval`/`payload.execution` sin esperar estos campos nuevos.

  `renderTurn` — si `payload.mode === 'llm'`, imprimir el mensaje final del modelo y el conteo de turns/budget; si no, el output actual sin cambios.

**Tests:**
- **No modificar** el test existente de `chat-repl.test.ts` (regla no negociable #2).
- Agregar un nuevo test en el mismo archivo: `beforeEach`/`afterEach` locales que setean `process.env.ATLAS_LLM_API_KEY`/`ATLAS_LLM_MODEL` y `vi.stubGlobal('fetch', ...)` con una respuesta Anthropic-shaped scripteada (dos respuestas en secuencia, para dos turnos), y verifican: (a) el `mode` del payload es `'llm'`, (b) el body de la segunda llamada a `fetch` incluye el mensaje del usuario y la respuesta del asistente del primer turno (prueba real de que el historial se pasó), (c) `vi.unstubAllGlobals()` al final para no filtrar el stub a otros tests del archivo.

**Criterios de aceptación:**
- `pnpm --filter @atlas/cli test` verde, incluido el test preexistente de chat sin modificar y en verde.
- Sin `ATLAS_LLM_API_KEY`, `atlas chat` se comporta idéntico a como se comporta hoy en `main`.

**Riesgos:** el mayor riesgo es alterar sin querer la lógica determinista al refactorizar `executeChatTurn` en dos funciones — verificar con el test existente antes de dar el sprint por cerrado, no asumir que "se ve igual" alcanza.

**Dependencias:** CONV-1.

**Tiempo estimado:** 1–2 sesiones de trabajo.

---

### CONV-3 — `atlas` sin subcomando → modo conversación

**Objetivo funcional:** correr `atlas` sin argumentos lanza la misma experiencia de `atlas chat`, sin que el usuario tenga que escribir el subcomando.

**Paquetes afectados:** `packages/cli/`.

**Cambios:**

- `packages/cli/src/application/cli-app.ts` — en el constructor de `CliApp`, después de `this.container.commandRegistry.attachAll(this.program, this.container)`, agregar una acción por defecto en el programa raíz:
  ```ts
  this.program.action(async () => {
    await runChatRepl(this.container);
  });
  ```
  Verificar explícitamente (no asumir) que esto no interfiere con `--version`, `--help`, ni con la resolución normal de los subcomandos ya registrados (`compile`, `run`, `plan`, `ask`, `chat`, `memory`, `doctor`, `version`, `help`) — commander debe seguir despachando a esos subcomandos con normalidad cuando se los invoca explícitamente.

**Tests:**
- Test estructural mínimo: verificar que `CliApp` tiene una acción configurada en el programa raíz (inspección del objeto `Command` de `commander`, no ejecución real de un REPL interactivo dentro del test — evitar un test frágil que dependa de stdin).
- Los tests existentes de `cli.test.ts` que invocan subcomandos específicos (`compile`, `plan`, `ask`, `memory`, `doctor`, etc.) deben seguir pasando exactamente igual — es la prueba de que la acción por defecto no interceptó nada que no debía.

**Verificación manual (fuera de `pnpm test`):**
```bash
pnpm --filter @atlas/cli build
node packages/cli/dist/index.js
```
Debe caer directo en el prompt de chat, igual que `atlas chat`.

**Criterios de aceptación:** `pnpm --filter @atlas/cli test` verde, incluidos absolutamente todos los tests de subcomandos existentes sin cambios de comportamiento.

**Riesgos:** este es el sprint con más riesgo de romper algo por interacción con commander — si algún subcomando deja de dispararse y en su lugar cae en la acción por defecto, es una regresión seria. Verificar con la suite completa de `cli.test.ts`, no solo los tests nuevos.

**Dependencias:** CONV-2.

**Tiempo estimado:** 1 sesión de trabajo.

---

### CONV-4 — Documentación de cierre

**Objetivo funcional:** dejar registro del cierre de P2.2 con el mismo estándar que P2.1.

**Archivos a editar:**
- `VERSION.md` — agregar sección `## P2.2 — Conversación (Phase 2)` con la misma estructura que la sección P2.1 (tabla CONV-1…CONV-4, estado, referencia a este documento), actualizar `Current Phase` a `Phase 2 — Product (P2.2 Delivered)`, registrar la deuda aceptada de la Sección 1 (historial sin truncar) como nueva entrada en la tabla de Accepted Technical Debt.
- **No tocar** `ATLAS_PRODUCT_VISION_v1.0.md` — ya describe P2.2 correctamente, no requiere cambios.

**Criterios de aceptación:** `VERSION.md` refleja el estado real verificado, no aspiracional — igual criterio que en Phase 1 y P2.1.

**Dependencias:** CONV-1, CONV-2, CONV-3.

**Tiempo estimado:** menos de 1 sesión.

## 4. Fuera de alcance de P2.2 (explícitamente)

- `atlas ask` no gana historial — sigue single-shot. Si en el futuro se necesita, es una decisión de producto aparte, no una consecuencia automática de este sprint.
- No hay truncado/resumen de historial largo — deuda aceptada, ver Sección 1.
- No hay Brands ni Workspaces (P2.3) — la conversación sigue operando sobre el namespace único `cli.default`.
- No hay streaming de respuesta token a token — se mantiene la decisión de P2.1.
- No hay UI — CLI únicamente.

## 5. Protocolo de reporte por sprint

Igual que en P2.1: por cada sprint (CONV-1 a CONV-4), reportar comandos ejecutados con output real, `git status --short` confirmando que no se tocó nada fuera de lo listado, confirmación explícita de las 8 reglas no negociables, y detenerse a reportar (no improvisar) si algo del diseño resulta no viable tal como está especificado — en particular la interacción de la acción por defecto de CONV-3 con el resto de comandos de commander.
