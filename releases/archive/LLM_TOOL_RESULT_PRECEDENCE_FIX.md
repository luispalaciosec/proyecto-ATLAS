# Fix: precedencia de tool results sobre la interpretación del LLM (L-02)

**Tipo:** Fix puntual de prompt, no un sprint. Cierra el hallazgo L-02 del informe de validación manual (`releases/MANUAL_VALIDATION_REPORT_2026-08-09.md` si ya está guardado, o el texto del informe compartido el 9 de agosto): el asistente a veces afirma "no hay datos" aunque `memory_search` sí devolvió resultados.

## Contexto

`packages/sdk/src/modules/llm-module.ts` ya envía a `memory_search` un resultado de herramienta estructurado y sin ambigüedad:

```ts
return JSON.stringify(
  Object.freeze({
    total: result.total,
    query: result.query,
    records: result.records.map((record) => ...),
  }),
);
```

El problema **no es el formato del resultado** — ya es JSON estructurado con `total` explícito. El problema es que el `SYSTEM_PROMPT` no le dice al modelo que ese resultado es autoritativo. Hoy es:

```ts
const SYSTEM_PROMPT = [
  'You are Atlas, an assistant with access to certified ATLAS capabilities via tools.',
  'Use memory_search to recall prior information, memory_store to persist new facts,',
  'and plan_and_execute when the user wants to plan and run a goal through the Atlas kernel.',
  'Prefer tools over guessing when memory or execution is relevant.',
].join(' ');
```

`runToolLoop()` (en `packages/llm/src/tool-loop.ts`) reenvía `systemMessage` en **cada** llamada a `provider.complete()` dentro del loop — incluida la llamada final donde el modelo sintetiza su respuesta a partir de los resultados de las herramientas. Eso significa que reforzar el system prompt sí llega exactamente al turno que importa, sin tocar la lógica del loop.

## Fix requerido

En `packages/sdk/src/modules/llm-module.ts`, extender `SYSTEM_PROMPT` con una instrucción explícita de precedencia. No reescribir las líneas existentes — agregar:

```ts
const SYSTEM_PROMPT = [
  'You are Atlas, an assistant with access to certified ATLAS capabilities via tools.',
  'Use memory_search to recall prior information, memory_store to persist new facts,',
  'and plan_and_execute when the user wants to plan and run a goal through the Atlas kernel.',
  'Prefer tools over guessing when memory or execution is relevant.',
  'Tool results are authoritative and must never be contradicted or ignored.',
  'If a tool result shows total greater than zero or a non-empty records array, you must',
  'reference that data in your response — never claim no information exists when a tool',
  'result shows otherwise. If a tool result is genuinely empty, say so plainly instead of guessing.',
].join(' ');
```

El texto exacto puede ajustarse en redacción, pero debe cubrir tres cosas: (1) los resultados de herramientas son autoritativos, (2) prohibición explícita de contradecir un resultado no vacío, (3) instrucción de qué hacer cuando el resultado sí está vacío (para no sobrecorregir hacia "siempre hay datos").

No tocar `buildSystemPrompt()`, `runToolLoop()`, `tool-loop.ts`, ni el formato de retorno de `memory_search`/`memory_store`/`plan_and_execute` — el fix es exclusivamente el contenido de `SYSTEM_PROMPT`.

## Verificación de cierre

Esto no se puede probar con un test determinista end-to-end (depende de que un LLM real obedezca una instrucción de prompt, y `FakeLlmProvider` no simula ese comportamiento). Lo que sí es verificable y obligatorio:

- **Test unitario nuevo** en `packages/sdk/tests/llm-module.test.ts`: verificar que el system prompt efectivo (via el mismo mecanismo que ya usa `buildSystemPrompt`/lo que se le pasa a `runToolLoop`) contiene las tres ideas clave — por ejemplo, asertar que el string incluye `'authoritative'` y `'never be contradicted'` (o las palabras clave que termines usando). No es un test de comportamiento del LLM, es un test de que la instrucción existe en el prompt.
- `pnpm --filter @atlas/sdk test` → todos los tests existentes de `llm-module.test.ts` siguen pasando, más el nuevo.
- `pnpm run build` y `pnpm run test` en la raíz → sin regresiones (23/23 build, 46+/46+ test contando el nuevo).
- **Verificación manual (la que realmente importa):** repetir el ejercicio E2 o E5 del informe de validación (preguntar algo con datos ya guardados en memoria, en una conversación nueva) con el mismo provider que falló antes (Groq / `openai-compatible`) y confirmar si la tasa de "no hay datos" falso baja. Esto no se puede automatizar — repórtalo como observación cualitativa, no como test PASS/FAIL.

## No negociables

- No modificar `runToolLoop()`, el contrato `LlmProvider`, ni el formato JSON de ningún tool result.
- No agregar lógica de post-verificación que compare la respuesta final del LLM contra el tool result (eso sería un cambio de arquitectura mucho mayor — fuera de alcance de este fix puntual).
- No tocar `contextPrompt`/`buildSystemPrompt()` — la concatenación con el contexto de marca (`atlas brand`) debe seguir funcionando exactamente igual, solo cambia el contenido de `SYSTEM_PROMPT` en sí.
- Reportar el resultado del test unitario nuevo y de la verificación manual cualitativa (no solo los tests automatizados) como evidencia de cierre.
