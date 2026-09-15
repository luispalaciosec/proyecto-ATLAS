# Superprompt — Fix consumo de tokens: truncar `memory_search` + ventana de historial

## Contexto

`apps/web/src/server.ts` usa `executeChatTurn` importado directo de `@atlas/cli`
(`packages/cli/src/chat/chat-turn.ts`). Es decir: el bug descrito aquí afecta
directamente el consumo real de tokens del producto Web, no solo al CLI.

Diagnóstico (ya confirmado leyendo el código, no es hipótesis):

1. **Historial sin límite.** `ChatSessionState.history` (`packages/cli/src/chat/chat-session.ts`)
   crece para siempre. `chat-turn.ts` (líneas 87-88) solo hace `push(...)` en cada turno.
   Ese array completo se reenvía como `history` en cada llamada a
   `session.client.llm.ask(goal, { history: session.history })` (línea 84), y
   `runToolLoop` (`packages/llm/src/tool-loop.ts`, líneas 52-55) lo antepone al mensaje
   nuevo en cada iteración. A los N turnos, cada respuesta paga el costo de reenviar
   los N-1 turnos anteriores completos.

2. **`memory_search` no trunca su resultado.** En `packages/sdk/src/modules/llm-module.ts`,
   la función `createAtlasToolExecutors` (líneas ~241-258) define la tool `memory_search`
   así:

   ```ts
   execute: async (args) => {
     const query = asString(args.query, 'query');
     const result = await atlas.memory.searchContent({ query });

     return JSON.stringify({
       total: result.total,
       query: result.query,
       records: result.records.map((record) => ({
         id: record.id,
         type: record.type,
         content: record.content, // <-- sin truncar, sin límite de cantidad
       })),
     });
   },
   ```

   Cuando el LLM llama esta tool directamente (no la inyección automática de
   "fresh knowledge", que sí trunca a 1200 caracteres × 8 registros vía
   `buildFreshKnowledgeContextBlock`), el `content` completo de cada registro —sin
   truncar, sin límite de cuántos registros— queda guardado en `transcript`/`history`
   para siempre, y se reenvía en cada turno posterior de esa sesión. Con Excel
   Knowledge activo esto puede ser texto de filas completas. Este es probablemente
   el mayor responsable de picos de consumo.

**Restricción crítica que hay que respetar** (verificada leyendo el código real,
no asumida): `apps/web/src/session-store.ts` línea 285
(`getConversationHistory` → `session.history.map(...)`) usa el MISMO
`session.history` para renderizar el transcript visible del chat en la Web UI
(`/api/history`). Si se recorta `session.history` directamente, el usuario vería
desaparecer mensajes viejos de su pantalla. **Eso no es aceptable.** La solución
tiene que separar dos cosas que hoy comparten una sola estructura:

- Qué se le muestra al usuario en la UI → debe seguir siendo el historial completo,
  sin cambios.
- Qué se le reenvía al LLM como contexto → debe estar acotado a una ventana
  reciente de turnos.

## Alcance autorizado

Solo estos archivos:

- `packages/sdk/src/modules/llm-module.ts` (truncar `memory_search`)
- `packages/cli/src/chat/chat-session.ts` (agregar ventana de turnos)
- `packages/cli/src/chat/chat-turn.ts` (usar la ventana al llamar `llm.ask`)
- Tests nuevos/actualizados en `packages/sdk/tests/llm-module.test.ts` y
  `packages/cli/tests/` (crear `chat-session.test.ts` si no existe, o extender
  `chat-turn.test.ts`)
- Un doc nuevo en `releases/` documentando el fix (mismo formato que
  `WEB_UI_POLISH_TOAST_SEND_DUPLICADO.md`)

**No tocar** `packages/llm/src/tool-loop.ts` ni ningún paquete del kernel
(`core`, `compiler`, `runtime`, `workflow`, `intelligence`). No se necesita ADR
para este alcance porque no cambia la interfaz pública de `runToolLoop` ni de
`AskOptions` — solo qué contenido se le pasa.

## Fix 1 — Truncar y acotar `memory_search`

En `packages/sdk/src/modules/llm-module.ts`, dentro de `createAtlasToolExecutors`,
reusar las constantes y helpers que YA existen en el mismo archivo
(`KNOWLEDGE_CONTEXT_RECORD_LIMIT = 8`, `KNOWLEDGE_CONTEXT_SNIPPET_MAX_LENGTH = 1200`,
`extractKnowledgeRecordText`, `truncateKnowledgeSnippet`) — no crear constantes
nuevas duplicadas. El resultado de la tool debe quedar acotado con el mismo
criterio que ya usa el bloque de "fresh knowledge" del system prompt:

```ts
execute: async (args: Readonly<Record<string, unknown>>) => {
  const query = asString(args.query, 'query');
  const result = await atlas.memory.searchContent({ query });
  const limitedRecords = result.records.slice(0, KNOWLEDGE_CONTEXT_RECORD_LIMIT);

  return JSON.stringify(
    Object.freeze({
      total: result.total,
      query: result.query,
      records: limitedRecords.map((record) =>
        Object.freeze({
          id: record.id,
          type: record.type,
          content: truncateKnowledgeSnippet(
            extractKnowledgeRecordText(record.content),
            KNOWLEDGE_CONTEXT_SNIPPET_MAX_LENGTH,
          ),
        }),
      ),
      ...(result.records.length > KNOWLEDGE_CONTEXT_RECORD_LIMIT
        ? { omitted: result.records.length - KNOWLEDGE_CONTEXT_RECORD_LIMIT }
        : {}),
    }),
  );
},
```

Ajustar el tipo/forma exacta si hace falta para que compile — el punto no
negociable es: el `content` de cada registro sale truncado, y no se devuelven
más de `KNOWLEDGE_CONTEXT_RECORD_LIMIT` registros.

### Test requerido (`packages/sdk/tests/llm-module.test.ts`)

Nuevo test que:
1. Guarda en memory un registro con contenido de más de 1200 caracteres, y al
   menos 9 registros que matcheen la misma query (para probar el límite de 8).
2. Usa `createFakeLlmProviderWithRequests` para scriptear una llamada a la tool
   `memory_search` seguida de una respuesta final (mismo patrón que el test
   existente `'ask() can invoke memory_search and memory_store against real Memory'`).
3. Inspecciona el mensaje `role: 'tool'` en `fake.requests[1].messages` (la
   segunda llamada al provider, la que ya incluye el resultado de la tool) y
   afirma que:
   - el contenido del/los registro(s) está truncado (longitud acotada, contiene
     el marcador `…` de `truncateKnowledgeSnippet`, y NO contiene el texto
     completo original de más de 1200 caracteres).
   - no hay más de 8 registros en el JSON parseado.
   - si había más de 8 matches, aparece el campo `omitted` con el conteo correcto.

## Fix 2 — Ventana de turnos acotada (sin tocar el historial completo)

En `packages/cli/src/chat/chat-session.ts`:

```ts
export interface ChatSessionState {
  readonly sessionId: string;
  readonly client: Atlas;
  turnCount: number;
  lastMemorySessionId?: string;
  history: LlmMessage[];
  turnBoundaries: number[]; // índice en `history` donde empieza cada turno
  lastTurn?: LastTurn;
}

export function createChatSession(client: Atlas, sessionId = createChatSessionId()): ChatSessionState {
  return {
    sessionId,
    client,
    turnCount: 0,
    history: [],
    turnBoundaries: [],
  };
}

export const DEFAULT_HISTORY_WINDOW_TURNS = 4;

/** Agrega los mensajes de un turno completo y registra dónde empezó. */
export function recordTurnMessages(session: ChatSessionState, messages: readonly LlmMessage[]): void {
  session.turnBoundaries.push(session.history.length);
  session.history.push(...messages);
}

/**
 * Devuelve solo los últimos `maxTurns` turnos completos de `history`, sin
 * cortar nunca a la mitad de un turno (nunca deja un tool_use sin su
 * tool_result correspondiente). `session.history` en sí NO se modifica —
 * sigue completo para consumidores como el transcript de la Web UI
 * (apps/web/src/session-store.ts `getConversationHistory`).
 */
export function selectRecentTurns(
  session: ChatSessionState,
  maxTurns: number = DEFAULT_HISTORY_WINDOW_TURNS,
): readonly LlmMessage[] {
  if (session.turnBoundaries.length <= maxTurns) {
    return session.history;
  }

  const startIndex = session.turnBoundaries[session.turnBoundaries.length - maxTurns];
  return session.history.slice(startIndex);
}
```

En `packages/cli/src/chat/chat-turn.ts`, dentro de `executeLlmChatTurn`:

```ts
import { captureLastMemorySessionId, recordTurnMessages, selectRecentTurns, type ChatSessionState } from './chat-session.js';

// ...

const result = await session.client.llm.ask(goal, { history: selectRecentTurns(session) });
const elapsedMs = Math.round(performance.now() - startedAt);

recordTurnMessages(session, [
  Object.freeze({ role: 'user' as const, content: goal }),
  ...result.transcript,
]);
```

Esto reemplaza las dos líneas actuales `session.history.push(...)` (87-88) por
una sola llamada a `recordTurnMessages`, y reemplaza `history: session.history`
por `history: selectRecentTurns(session)` en la llamada a `llm.ask`.

**No cambiar el tipo de `history`** (sigue siendo `LlmMessage[]` plano) — así
`apps/web/src/session-store.ts` línea 285 sigue funcionando sin cambios.

### Tests requeridos (`packages/cli/tests/`, extender `chat-turn.test.ts` o crear `chat-session.test.ts`)

Usando `createAtlas` con un fake provider inyectado (mismo patrón que
`packages/sdk/tests/llm-module.test.ts`) que responda de forma distinguible
por turno (ej. contenido `"Reply 1"`, `"Reply 2"`, etc.), simular 6 turnos
seguidos de chat vía `executeChatTurn` y verificar:

1. **El historial completo NO se recorta.** Después de 6 turnos,
   `session.history` contiene los mensajes de los 6 turnos (prueba de que la
   UI sigue viendo todo).
2. **Lo que se envía al provider SÍ está acotado.** Inspeccionando el request
   enviado al fake provider en el turno 6 (via `createFakeLlmProviderWithRequests`
   o el mecanismo equivalente inyectado en `createAtlas`), el array `history`
   recibido por `llm.ask` solo contiene mensajes de los últimos
   `DEFAULT_HISTORY_WINDOW_TURNS` turnos — el contenido distinguible del turno 1
   NO debe aparecer en los mensajes enviados en el turno 6.
3. **Alineación por turno.** El primer mensaje de la ventana enviada siempre
   tiene `role: 'user'` (nunca empieza a mitad de un turno con un mensaje
   `tool` huérfano).
4. Con menos turnos que `DEFAULT_HISTORY_WINDOW_TURNS` (ej. 2 turnos), el
   historial enviado es el completo — sin recorte prematuro.

Además, correr (no modificar salvo que falle por este cambio, en cuyo caso
reportarlo) cualquier test existente en `apps/web` que cubra
`SessionStore.getConversationHistory` / `/api/history`, para confirmar que el
transcript de la Web UI no se ve afectado.

## Documentación requerida

Crear `releases/WEB_TOKEN_HISTORY_WINDOW_FIX.md` con: causa raíz (las dos
encontradas arriba, con archivo/línea), qué se cambió, por qué se preservó
`session.history` completo para la UI, el valor elegido para
`DEFAULT_HISTORY_WINDOW_TURNS` y cómo ajustarlo a futuro, y el resultado de
los 4 gates.

## Gates obligatorios

Correr los 4 gates en el MONOREPO completo (no solo los paquetes tocados,
porque `packages/sdk` es una base compartida): build, typecheck, lint, test.
Reportar conteo exacto de tests por paquete (`@atlas/sdk`, `@atlas/cli`,
`@atlas/web`), no solo "todo pasó".

## Detenerse antes de commitear

No hacer commit. Cuando termines, reporta: diff completo, resultado de los 4
gates con conteos exactos, y el contenido del doc nuevo. Yo (Claude, verificando
en checkout aislado) confirmo antes de autorizar el commit — mismo proceso que
en los fixes anteriores (Excel search bug, UI polish).
