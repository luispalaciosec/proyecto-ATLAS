---
id: ATLAS-P2.4-IMPLEMENTATION-PLAN
title: P2.4 — Feedback Loop — Implementation Plan for Cursor
version: 1.0.0
status: Complete
created: 2026-08-05
completed: 2026-08-05
owner: Luis Palacios
relationship_to_governance: implements P2.4 de ATLAS_PRODUCT_VISION_v1.0.md; construye sobre P2.1–P2.3 (verificados); ADR-0001–ADR-0005 permanecen Frozen
---

# P2.4 — Feedback Loop

## 0. Contexto y reglas no negociables

P2.1, P2.2 y P2.3 están **cerrados y verificados de forma independiente** (commits `ce7816e`, `9b54cd4`, `a6fe298`). Este documento implementa P2.4, definido en `ATLAS_PRODUCT_VISION_v1.0.md` sección 7: sin esto, cada campaña o plan parte del mismo punto para siempre — nada de lo que ATLAS produce hoy se recuerda como "esto estuvo mal, no lo repitas."

**Qué es P2.4, en una frase:** cuando corregís un output de `atlas brand`/`atlas chat`, esa corrección se guarda en la memoria de ese workspace y se le muestra al modelo en sesiones futuras — sin capability nueva, reutilizando Memory tal como está certificado desde el MVP.

**Decisión de diseño que resuelve la pregunta abierta del Vision doc (sección 11):** el feedback es **explícito, vía comando, no detección implícita.** Detectar automáticamente que "Luis rechazó o reescribió algo" requiere diffing de outputs y heurísticas de intención — mucho más riesgo de falsos positivos que valor por ahora. Un comando `/correct` dentro de la conversación es simple, confiable, y consistente con el resto de Phase 2.

### Reglas no negociables

1. **No se toca `packages/memory`, `packages/workflow`, `packages/intelligence`, `packages/retrieval` por dentro.** Feedback es un `recordType: 'Feedback'` más sobre el mismo `MemoryEngine` — cero cambios ahí.
2. **`atlas ask`, `atlas plan`, `atlas memory`, y el modo determinista de `atlas chat` no cambian de comportamiento.**
3. **`/correct` solo tiene efecto en modo LLM.** En modo determinista (sin `ATLAS_LLM_API_KEY`), imprime un mensaje claro y no escribe nada en memoria — no crashea, no finge que guardó algo.
4. **La recuperación proactiva de feedback (Sección 3, FEED-2) es solo para `atlas brand <name>` en este sprint.** `atlas chat`/`atlas` sin subcomando no cambian su `contextPrompt` — hoy no tienen ninguno, y este sprint no se lo agrega.
5. **Cero red real en tests.** Mismo patrón `fetch` stubbeado de P2.1–P2.3.
6. **Nunca loguear la API key.**
7. **No ADRs nuevos, no revisión de arquitectura.**
8. **`/correct` nunca cuenta como turno de conversación** — no consume el presupuesto de turnos del LLM (`maxTurns`), no incrementa `turnCount` de la sesión.

## 1. Decisiones de diseño ya tomadas

| Decisión | Valor |
|---|---|
| Mecanismo de captura | Comando `/correct <texto>` dentro del REPL, junto a `/exit`/`/quit` ya existentes |
| Qué se corrige | El último turno LLM de la sesión activa (goal + respuesta final) |
| Dónde se guarda | `client.memory.storeContent({ content: <corrección>, recordType: 'Feedback', metadata: {...} })` — mismo mecanismo que ya usa `plan_and_execute` para `PlanExecution` |
| Cómo vuelve a aparecer | (a) El LLM ya tiene la tool `memory_search`, puede buscarlo si quiere; (b) `atlas brand <name>` carga proactivamente las últimas correcciones de esa marca y las inyecta en el `contextPrompt`, junto al perfil |
| Alcance de la recuperación proactiva | Solo `atlas brand` en P2.4 — no `atlas chat` genérico |
| Sin turno previo o sin LLM configurado | Mensaje claro, no-op, no crashea |

## 2. Forma exacta del registro de Feedback

```ts
export interface FeedbackMetadata {
  readonly originalGoal: string;
  readonly originalOutput: string;
  readonly source: 'atlas-correct';
}
```

Guardado vía `MemoryModule.storeContent`:
```ts
await client.memory.storeContent({
  content: correctionText,
  recordType: 'Feedback',
  metadata: {
    originalGoal: lastTurn.goal,
    originalOutput: lastTurn.output,
    source: 'atlas-correct',
  },
});
```

Nada de esto requiere tocar `packages/memory` — `recordType`/`metadata` ya son parámetros aceptados por `StoreMemoryContentOptions` desde P2.1.

## 3. Sprints

### FEED-1 — Comando `/correct` en el REPL

**Objetivo funcional:** dentro de `atlas chat`/`atlas brand`, después de una respuesta del modelo, escribir `/correct <texto>` guarda esa corrección asociada al turno anterior.

**Paquetes afectados:** `packages/cli/`.

**Archivos a crear/editar:**
- `packages/cli/src/chat/feedback.ts` (nuevo):
  ```ts
  import type { Atlas } from '@atlas/sdk';

  export interface LastTurn {
    readonly goal: string;
    readonly output: string;
  }

  export interface RecordFeedbackResult {
    readonly recordId: string;
  }

  export async function recordFeedback(
    client: Atlas,
    lastTurn: LastTurn,
    correction: string,
  ): Promise<RecordFeedbackResult> {
    const result = await client.memory.storeContent({
      content: correction,
      recordType: 'Feedback',
      metadata: {
        originalGoal: lastTurn.goal,
        originalOutput: lastTurn.output,
        source: 'atlas-correct',
      },
    });

    return { recordId: result.recordId };
  }

  export function parseCorrectCommand(line: string): string | null {
    const trimmed = line.trim();
    if (!trimmed.toLowerCase().startsWith('/correct')) return null;
    return trimmed.slice('/correct'.length).trim();
  }
  ```

- `packages/cli/src/chat/chat-session.ts` — `ChatSessionState` gana `lastTurn?: LastTurn` (mutable, opcional).

- `packages/cli/src/chat/chat-repl.ts`:
  - Después de `executeLlmChatTurn` (la rama LLM de P2.2), setear `session.lastTurn = { goal, output: result.finalMessage }`. La rama determinista **no** setea `lastTurn` — `/correct` en modo determinista debe encontrar `lastTurn` indefinido y responder en consecuencia.
  - En el loop principal de `runChatRepl`, antes de tratar la línea como un goal nuevo: si `parseCorrectCommand(line)` devuelve no-`null`:
    - Si la corrección está vacía → mensaje "Usage: /correct <what should have been different>", `continue` (no cuenta turno).
    - Si `!session.client.llm.isConfigured()` → mensaje "Correction requires LLM mode (set ATLAS_LLM_API_KEY and ATLAS_LLM_MODEL)." , `continue`.
    - Si `session.lastTurn` es `undefined` → mensaje "Nothing to correct yet — ask something first.", `continue`.
    - Si no, llamar `recordFeedback(session.client, session.lastTurn, correctionText)`, imprimir confirmación con el `recordId`, `continue` (sin incrementar `session.turnCount`, sin pasar por `executeChatTurn`).

**Tests** (`packages/cli/tests/chat-repl.test.ts`, agregar — no tocar el bloque existente):
- `parseCorrectCommand`: reconoce `/correct algo`, `/CORRECT algo` (case-insensitive), devuelve `null` para una línea normal.
- REPL con LLM configurado (fetch stubbeado, un turno + `/correct texto`): el `recordId` se confirma en el output, y una búsqueda posterior con `client.memory.searchContent({ query: '', recordType: 'Feedback' })` (o el método equivalente) encuentra el registro con el `originalGoal`/`originalOutput` correctos.
- REPL sin LLM configurado, con `/correct texto`: mensaje de error esperado, y `client.memory.searchContent` para `Feedback` sigue vacío después.
- REPL con LLM configurado pero `/correct` como primera línea (sin turno previo): mensaje "Nothing to correct yet", sin escritura en memoria.
- Confirmar que `/correct` no incrementa el conteo de turnos reportado en los payloads de `onTurn` (no debe generar un `ChatTurnPayload` nuevo).

**Criterios de aceptación:** `pnpm --filter @atlas/cli test` verde, incluido el test determinista preexistente sin modificar.

**Riesgos:** confundir `/correct` con un goal real si el parseo no es estricto — verificar que un mensaje que empiece con "correct" como palabra normal (ej. "correct me if wrong") no se interprete como comando por accidente. Usar el prefijo exacto `/correct` (con la barra) evita esto.

**Dependencias:** P2.2 (rama LLM de `chat-repl.ts`), P2.3 (para que `/correct` funcione también dentro de `atlas brand`, que reusa el mismo REPL).

**Tiempo estimado:** 1 sesión de trabajo.

---

### FEED-2 — Recuperación proactiva de feedback en `atlas brand`

**Objetivo funcional:** al abrir `atlas brand geeks`, si hay correcciones guardadas antes para esa marca, el modelo las ve desde el primer turno — no depende de que decida buscarlas por su cuenta.

**Paquetes afectados:** `packages/cli/`.

**Archivos a crear/editar:**
- `packages/cli/src/workspace/feedback-context.ts` (nuevo):
  ```ts
  import { createJsonFileMemoryEngine, type MemoryRecord } from '@atlas/memory';

  const FEEDBACK_NAMESPACE_ID = 'cli.default'; // mismo namespace que usa MemoryModule.storeContent hoy
  const DEFAULT_LIMIT = 5;

  export async function loadRecentFeedbackContext(
    memoryFilePath: string,
    limit: number = DEFAULT_LIMIT,
  ): Promise<string> {
    const engine = createJsonFileMemoryEngine(memoryFilePath);
    const result = await engine.search({ namespaceId: FEEDBACK_NAMESPACE_ID, recordType: 'Feedback' });

    if (!result.ok || result.value.records.length === 0) {
      return '';
    }

    const recent = [...result.value.records]
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);

    const lines = recent.map((record) => renderFeedbackRecord(record));

    return `Known corrections from previous sessions:\n\n${lines.join('\n\n')}`;
  }

  function renderFeedbackRecord(record: MemoryRecord): string {
    const metadata = record.metadata as { originalGoal?: unknown; originalOutput?: unknown };
    const goal = typeof metadata.originalGoal === 'string' ? metadata.originalGoal : '(unknown goal)';
    const correction = typeof record.content === 'object' && record.content !== null && 'text' in record.content
      ? String((record.content as { text?: unknown }).text ?? '')
      : String(record.content);

    return `- When asked "${goal}", the correction was: ${correction}`;
  }
  ```
  Ajustar el parseo de `record.content`/`metadata` a la forma real que ya usan `MemoryModule.storeContent`/`extractSearchableText` — revisar `packages/sdk/src/modules/memory-module.ts` antes de escribir esto para no asumir un shape incorrecto.

- `packages/cli/src/commands/brand-command.ts` — antes de llamar `createBrandClient`, además de `renderProfileAsContext(profile)`, llamar `await loadRecentFeedbackContext(paths.memoryFilePath)` y combinar ambos bloques (con un separador `\n\n---\n\n`, solo incluir el bloque de feedback si no está vacío) en el `contextPrompt` final.

**Tests:**
- `loadRecentFeedbackContext` sobre un archivo de memoria vacío → string vacío.
- Sobre un archivo con 2 registros `Feedback` guardados a mano (o vía `recordFeedback` de FEED-1) → el texto devuelto incluye ambos, más recientes primero.
- Integración en `brand-command.test.ts` (fetch stubbeado): abrir `atlas brand geeks`, hacer un turno y `/correct`, cerrar sesión; abrir `atlas brand geeks` de nuevo — el body de la primera llamada a `fetch` de la segunda sesión contiene el texto de la corrección anterior en el mensaje `system`.

**Criterios de aceptación:** `pnpm --filter @atlas/cli test` verde, incluidos todos los tests de `brand-command.test.ts`/`brand-profile.test.ts` preexistentes sin modificar.

**Riesgos:** el shape exacto de `MemoryRecord.content`/`metadata` — verificar contra el código real de `packages/memory` y `memory-module.ts` antes de asumir la forma en el snippet de arriba; el snippet es una guía, no un contrato rígido.

**Dependencias:** FEED-1.

**Tiempo estimado:** 1 sesión de trabajo.

---

### FEED-3 — Documentación de cierre

**Archivos a editar:**
- `VERSION.md` — sección `## P2.4 — Feedback Loop (Phase 2)`, mismo formato que P2.1–P2.3 (tabla FEED-1…3), `Current Phase` → `Phase 2 — Product (P2.4 Delivered)`.
- **Nota de checkpoint, no deuda:** con P2.4 cerrado, quedan entregados los cuatro frentes originalmente descritos como núcleo conversacional en `ATLAS_PRODUCT_VISION_v1.0.md` (P2.1–P2.4). Antes de avanzar a P2.5 (Web UI), registrar en `VERSION.md` que corresponde evaluar el criterio de éxito de la Sección 10 del Vision doc con uso real — no es un bloqueo automático, es el checkpoint que el propio Vision doc pide.
- **No tocar** `ATLAS_PRODUCT_VISION_v1.0.md`.

**Dependencias:** FEED-1, FEED-2.

**Tiempo estimado:** menos de 1 sesión.

## 4. Fuera de alcance de P2.4 (explícitamente)

- Detección implícita de corrección (edición/rechazo sin comando explícito) — descartada por diseño, ver Sección 0.
- Recuperación proactiva de feedback en `atlas chat`/`atlas` genérico — solo `atlas brand` en este sprint.
- Resumen o poda del feedback acumulado — mismo tipo de deuda aceptada que TD-P2.2-001, crece sin límite por ahora.
- Editar o borrar una corrección ya guardada — solo se agregan, no se modifican ni eliminan en P2.4.
- Cualquier cambio a `atlas ask`, `atlas plan`, `atlas memory` — sin cambios.

## 5. Protocolo de reporte por sprint

Igual que en sprints anteriores: comandos ejecutados con output real, `git status --short`, confirmación explícita de las 8 reglas no negociables, y detenerse a reportar si el shape real de `MemoryRecord`/`metadata` difiere de lo asumido en FEED-2 en vez de improvisar una forma distinta sin avisar.
