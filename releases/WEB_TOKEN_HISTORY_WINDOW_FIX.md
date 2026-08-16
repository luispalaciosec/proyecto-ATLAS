# ATLAS — Fix consumo de tokens: truncar `memory_search` + ventana de historial

**Fecha:** 2026-08-16  
**Estado:** 🛑 **IMPLEMENTADO — SIN COMMIT (esperando autorización)**

---

## Causa raíz

### 1. Historial sin límite hacia el LLM

- **Archivo:** `packages/cli/src/chat/chat-session.ts` + `packages/cli/src/chat/chat-turn.ts`
- `ChatSessionState.history` crecía sin tope y se reenviaba completo en cada `llm.ask(goal, { history: session.history })` (`chat-turn.ts` ~L84).
- `runToolLoop` (`packages/llm/src/tool-loop.ts` ~L52-55) antepone ese historial al mensaje nuevo en cada iteración → costo lineal con la longitud de la conversación.

**Restricción respetada:** `apps/web/src/session-store.ts` ~L285 (`getConversationHistory`) lee el **mismo** `session.history` para el transcript visible. Recortar `history` directamente haría desaparecer mensajes viejos en la UI — **no aceptable**.

### 2. `memory_search` devolvía contenido completo

- **Archivo:** `packages/sdk/src/modules/llm-module.ts` ~L241-258 (`createAtlasToolExecutors`)
- La tool serializaba `record.content` sin truncar ni limitar cantidad.
- Esos resultados quedan en `transcript`/`history` y se reenvían en turnos posteriores.
- Con Excel Knowledge activo, filas completas pueden inflar el consumo de forma agresiva.
- Contraste: la inyección automática de “fresh knowledge” **sí** truncaba (8 registros × 1200 chars) vía `buildFreshKnowledgeContextBlock`.

---

## Qué se cambió

### Fix 1 — Truncar y acotar `memory_search` (`llm-module.ts`)

Reutiliza constantes/helpers existentes en el mismo archivo:

- `KNOWLEDGE_CONTEXT_RECORD_LIMIT = 8`
- `KNOWLEDGE_CONTEXT_SNIPPET_MAX_LENGTH = 1200`
- `extractKnowledgeRecordText`, `truncateKnowledgeSnippet`

La tool ahora:

- Devuelve como máximo **8** registros (`slice(0, KNOWLEDGE_CONTEXT_RECORD_LIMIT)`).
- Trunca cada `content` con el mismo criterio que fresh knowledge.
- Añade `omitted` cuando hay más registros que el límite.

### Fix 2 — Ventana de turnos (`chat-session.ts` + `chat-turn.ts`)

Nuevo campo `turnBoundaries: number[]` — índice en `history` donde empieza cada turno.

| Función | Rol |
|---------|-----|
| `recordTurnMessages(session, messages)` | Push de un turno completo + marca boundary |
| `selectRecentTurns(session, maxTurns?)` | Devuelve slice de los últimos N turnos **completos** |
| `DEFAULT_HISTORY_WINDOW_TURNS = 4` | Ventana por defecto hacia el LLM |

En `executeLlmChatTurn`:

```ts
const result = await session.client.llm.ask(goal, { history: selectRecentTurns(session) });
recordTurnMessages(session, [
  { role: 'user', content: goal },
  ...result.transcript,
]);
```

- **`session.history` no se recorta** → transcript Web UI intacto.
- **`selectRecentTurns` nunca parte a mitad de turno** → no queda un `tool_use` sin su `tool_result`.

### Valor elegido: `DEFAULT_HISTORY_WINDOW_TURNS = 4`

- Equilibra contexto reciente vs. costo de tokens en conversaciones largas.
- Ajuste futuro: cambiar la constante exportada o parametrizarla vía env/config del CLI (fuera de alcance de este fix).

---

## Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `packages/sdk/src/modules/llm-module.ts` | Truncar/limitar `memory_search` |
| `packages/sdk/tests/llm-module.test.ts` | +1 test truncamiento |
| `packages/cli/src/chat/chat-session.ts` | `turnBoundaries`, `recordTurnMessages`, `selectRecentTurns` |
| `packages/cli/src/chat/chat-turn.ts` | Usar ventana en `llm.ask` |
| `packages/cli/tests/chat-session.test.ts` | **Nuevo** — unit ventana |
| `packages/cli/tests/chat-turn.test.ts` | +1 test integración `executeChatTurn` |

**Sin tocar:** `packages/llm/src/tool-loop.ts`, kernel (`core`, `compiler`, `runtime`, `workflow`, `intelligence`), `apps/web/src/session-store.ts`.

---

## Tests añadidos

### SDK — `memory_search tool results truncate content and cap record count`

1. 9 registros con contenido >1200 chars y query común.
2. Script fake: `memory_search` → respuesta final.
3. Inspecciona mensaje `role: 'tool'` en `fake.requests[1]`:
   - Contenido truncado (≤1200, contiene `…`, no el tail de 1300 chars).
   - ≤8 registros en JSON.
   - `omitted: 1` cuando hay 9 matches.

### CLI — `chat-session.test.ts`

- Ventana completa con ≤4 turnos.
- Con 6 turnos: slice de 4 turnos completos, empieza en `role: 'user'`, excluye turno 1.

### CLI — `executeChatTurn history window`

- 6 turnos simulados vía spy en `llm.ask`.
- `session.history` conserva los 6 turnos.
- Llamada #6 recibe historial acotado (sin `Goal 1` / `Reply 1`).

### Web UI — sin regresión

`@atlas/web`: **216/216** tests pasan, incluyendo cobertura de `/api/history` y `SessionStore` — transcript no afectado (no se modificó `session-store.ts`).

---

## Quality Gate (monorepo completo)

```bash
pnpm build && pnpm typecheck && pnpm lint && pnpm test
```

| Gate | Resultado |
|------|-----------|
| **build** | `Tasks: 23 successful, 23 total` |
| **typecheck** | `Tasks: 35 successful, 35 total` |
| **lint** | `Tasks: 35 successful, 35 total` |
| **test** | `Tasks: 46 successful, 46 total` |

### Conteo por paquete tocado / relevante

| Paquete | Tests |
|---------|-------|
| `@atlas/sdk` | **44/44** (+1) |
| `@atlas/cli` | **77/77** (+3) |
| `@atlas/web` | **216/216** (sin cambios de código; sin regresión) |

---

## v2 — detección semántica (no implementada)

**Qué haría:** al subir o indexar, buscar conocimiento relacionado por tema/carpeta y usar una llamada LLM corta para comparar si el nuevo documento contradice o actualiza fragmentos existentes con nombres distintos.

**Por qué no ahora:**

- Costo y latencia en cada subida o turno.
- Falsos positivos en políticas parecidas pero distintas.
- Decisión de producto mayor que requiere UX de resolución de conflictos.

**Qué haría falta:** resumen del documento nuevo + retrieval por tema + prompt comparativo + UI de conflicto semántico.

---

## Propuesta de commit (NO ejecutada)

```
fix(sdk,cli): cap memory_search output and bound LLM history window

Truncate memory_search tool results to match fresh-knowledge limits and
send only the last four complete chat turns to the LLM while preserving
full session.history for the Web UI transcript.
```

---

*Esperando autorización para commit. Sin push.*
