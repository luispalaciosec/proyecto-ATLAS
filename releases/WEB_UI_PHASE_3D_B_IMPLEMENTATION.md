# Web UI — Fase 3D + 3B — Implementación

**Fecha:** 2026-08-09  
**Alcance:** `@atlas/web` únicamente  
**Gate:** Production Implementation Gate (historial + Home accionable + Conocimiento + retry)

---

## 1. Objetivo

Entregar un incremento UX coherente para usuarios no técnicos:

- **3D:** persistencia del historial de conversación (F5 ya no destruye el chat mientras el servidor siga vivo).
- **3B:** Home accionable que responde “¿Qué puedo hacer aquí?” en menos de 30 segundos.
- **Renaming:** Memoria → **Conocimiento** con compatibilidad `/memoria` → `/conocimiento`.
- **Retry:** botón **Intentar de nuevo** cuando falla una respuesta reutilizable.

La Web continúa consumiendo la plataforma vía Express → `@atlas/cli` → SDK. No se expone arquitectura interna al usuario.

---

## 2. Alcance

### Incluido

| Área | Entrega |
|------|---------|
| API | `GET /api/history` |
| Chat | preload al entrar, empty state, retry |
| Home | hero, acciones, ejemplos, conversación reciente, marca activa |
| Nav / routing | Conocimiento + redirect `/memoria` |
| Tests | API, chat, retry, home, routing |
| i18n | glosario producto (ES) |

### Excluido (por diseño)

- Auth, Cloud, streaming
- Edición/eliminación de memoria
- Persistencia nueva de Activity
- Segundo sistema de memoria en frontend
- Cambios en paquetes Frozen/Certified (`core`, `compiler`, `runtime`, `memory`, `retrieval`, `events`, `intelligence`)
- Cambios de contratos o ADRs

---

## 3. Archivos modificados

### Backend / presentación (`apps/web`)

| Archivo | Cambio |
|---------|--------|
| `src/server.ts` | `GET /api/history`; registro deterministic post-chat |
| `src/session-store.ts` | `#deterministicHistory` + `getConversationHistory` |
| `src/presentation/map-history.ts` | mapper producto → `{ workspace, messages[], canCorrect }` |

### Frontend (`apps/web`)

| Archivo | Cambio |
|---------|--------|
| `src/client/api/client.ts` | `fetchHistory` |
| `src/client/lib/history.ts` | map UI + título conversación reciente |
| `src/client/state/app-state.ts` | preload flags, `/conocimiento`, redirect `/memoria` |
| `src/client/pages/chat.ts` | preload, empty state, retry (`skipUserMessage`) |
| `src/client/pages/home.ts` | Home accionable |
| `src/client/components/shell.ts` | nav Conocimiento |
| `src/client/app.ts` | ruta `/conocimiento` |
| `src/i18n/es.ts` | copy producto |
| `src/client/styles/app.css` | home action-grid, context-chip, example-chip |

### Tests

| Archivo | Cobertura |
|---------|-----------|
| `tests/server.test.ts` | history vacío, deterministic, LLM, error controlado |
| `tests/presentation/map-history.test.ts` | mapper |
| `tests/client/chat.test.ts` | preload, empty, retry |
| `tests/client/home.test.ts` | acciones, marca, reciente |
| `tests/client/history.test.ts` | helpers |
| `tests/client/app-state.test.ts` | redirect `/memoria` |
| `tests/client/shell.test.ts` | nav Conocimiento |

### Documentación

| Archivo | Cambio |
|---------|--------|
| `releases/WEB_UI_PHASE_3D_B_IMPLEMENTATION.md` | este documento |
| `docs/README.md` | enlace al informe |
| `VERSION.md` | checkpoint 3D+3B |

---

## 4. Arquitectura utilizada

```
Browser SPA (Vite)
    ↓ fetch
Express (@atlas/web)
    ↓
SessionStore (in-process)
    ├─ LLM: session.history (@atlas/cli ChatSessionState)
    └─ deterministic: #deterministicHistory (presentation-layer, mismo proceso)
    ↓
@atlas/cli (executeChatTurn, applyCorrection, listWorkspaces)
    ↓
SDK / Kernel (sin cambios)
```

**Principio:** una sola fuente de verdad por modo:

- **LLM:** historial ya mantenido por `ChatSessionState.history` en el servidor web.
- **Deterministic:** intercambios registrados en `SessionStore.recordDeterministicExchange` tras cada turno exitoso (no duplica almacenamiento del Kernel; complementa el gap de que el modo deterministic no persiste en `session.history`).

**Aislamiento de marcas:** historial keyed por `workspace` (slug). Cambio de marca resetea/recarga chat vía `setActiveWorkspace` + `reloadChatHistory`.

---

## 5. Endpoint `GET /api/history`

### Request

```
GET /api/history
GET /api/history?workspace=geeks
```

### Response (producto)

```json
{
  "workspace": "default",
  "messages": [
    {
      "id": "hist.default.0.user",
      "role": "user",
      "content": "...",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "canCorrect": false
}
```

- Delgado: delega en `SessionStore.getConversationHistory`.
- Sin lógica de Kernel en el handler.
- Errores → `500` con `{ error: string }` (middleware Express existente).

---

## 6. Comportamiento preload (Chat)

1. Al renderizar Chat, si `chatHistoryLoadedFor !== activeWorkspace` → preload.
2. Muestra copy calmado: **“Estamos recuperando tu conversación…”**
3. Consulta `/api/history`.
4. Reconstruye mensajes vía `mapHistoryMessagesToUi`.
5. Si vacío → empty state con ejemplos humanos.
6. Si falla la red → cae a chat vacío sin romper el flujo.

**Limitación documentada:** el historial vive en memoria del proceso `atlas web`. Reiniciar el servidor borra la conversación (no hay DB ni Cloud en esta fase).

---

## 7. Retry

- Tras error en `submitChatMessage`, se guarda `lastFailedGoal`.
- El mensaje de error muestra botón **Intentar de nuevo** (`t('common.retry')`).
- Retry llama la misma ruta con `{ skipUserMessage: true }` → no duplica el turno usuario.
- Limpia error previo (`removeLastErrorMessage`) y estado de fallo en éxito.
- Si vuelve a fallar, mantiene botón y mensaje amigable (sin códigos técnicos).

---

## 8. Home accionable

Estructura implementada:

1. **Header:** ATLAS + frase de producto aprobada.
2. **Contexto:** chip “Marca activa: …” + banner de aislamiento humano.
3. **Acciones:** Preguntar, Conocimiento, Marcas (navegan a rutas reales); Actividad marcada **Próximamente** (disabled).
4. **Ejemplos:** 4 prompts clicables que abren Chat con el texto precargado.
5. **Conversaciones recientes:** título derivado del último mensaje usuario vía `/api/history`; empty state si no hay historial.

---

## 9. Cambio Memoria → Conocimiento

| Antes | Después |
|-------|---------|
| Nav “Memoria” | Nav **Conocimiento** |
| `/memoria` | `/conocimiento` (canonical) |

Compatibilidad:

- `normalizeRoute('/memoria')` → `/conocimiento`
- `initRouter` hace `replaceState` de `/memoria` → `/conocimiento`

Glosario UI aplicado en i18n (workspace → Marca, memory → Conocimiento, etc.).

---

## 10. Tests

**`@atlas/web`:** 42 tests (API 11 + client/presentation 31).

| Suite | Casos |
|-------|-------|
| API history | vacío, deterministic, LLM, error 500 |
| Chat | preload, empty, retry visible, retry sin duplicar, retry fallido |
| Home | acciones, marca, reciente con historial |
| Routing | `/memoria` → `/conocimiento`, shell nav |

---

## 11. Quality gate

Ejecutado 2026-08-09 desde raíz:

| Comando | Resultado |
|---------|-----------|
| `pnpm install` | OK |
| `pnpm build` | 23/23 OK |
| `pnpm typecheck` | OK |
| `pnpm lint` | OK |
| `pnpm test` | 46/46 OK |
| `pnpm atlas --help` | OK |
| `pnpm atlas doctor` | **HEALTHY** |
| `pnpm --filter @atlas/web test` | 42/42 OK |

---

## 12. Regresión

Verificado que no se modificaron paquetes Frozen/Certified.

Smoke esperado (manual):

```bash
pnpm --filter @atlas/web build && atlas web
```

- F5 en Chat restaura mensajes (mismo proceso).
- Home muestra acciones y ejemplos.
- `/memoria` redirige a `/conocimiento`.
- CLI: `atlas ask`, `atlas chat`, `atlas brand`, `atlas doctor` sin cambios de contrato.

---

## 13. Decisiones UX

| Decisión | Razón |
|----------|-------|
| Historial in-process | Arquitectura actual no expone persistencia cross-restart sin tocar memory/runtime |
| `#deterministicHistory` en SessionStore | LLM ya usa `session.history`; deterministic necesita registro presentation-layer |
| Actividad “Próximamente” | No crear botón falso; pantalla Activity no implementada |
| Ejemplos clicables → Chat | Reduce fricción; no envían automátamente (usuario confirma) |
| “Estamos recuperando…” | Copy calmado vs “Loading…” genérico |

---

## 14. Límites

1. **Historial no sobrevive reinicio del servidor web** — requiere decisión arquitectónica para persistencia durable (memory package o contrato nuevo).
2. **Una conversación por marca** — no hay lista multi-thread ni IDs de conversación separados.
3. **Activity** — placeholder; sin persistencia nueva en esta fase.
4. **Conocimiento browse** — solo renaming/routing; UI de consulta profunda pendiente (Fase 3E+).

---

## 15. Contradicción documentación vs código

| Doc | Código | Resolución |
|-----|--------|------------|
| UX doc menciona reload historial desde fuente durable | Solo in-memory en `SessionStore` + `session.history` | Implementado dentro del scope permitido; documentado límite §14 |
| Entregables 1–4 en VERSION.md listaban historial como pendiente | Ahora complete en 3D+3B | VERSION.md actualizado |

**NEEDS ARCHITECTURAL DECISION:** persistencia cross-restart del historial de chat sin tocar `packages/memory` o contratos Certified.

---

## 16. Siguiente fase recomendada

Prioridad sugerida (alineada con `WEB_UI_WORLD_CLASS_PRODUCT_REVIEW.md`):

1. **3E — Browse Conocimiento:** lectura/search de registros con copy producto (sin exponer memory internals).
2. **3F — Activity real:** timeline de acciones recientes (requiere definir fuente; hoy no persistir Activity nueva).
3. **3G — Settings / proveedor IA:** configuración avanzada opcional.
4. **Decisión ADR:** historial durable (file-backed session vs memory records vs event log).

---

## Arranque

```bash
pnpm --filter @atlas/web build && atlas web
```

Abrir `http://127.0.0.1:4173` (host/puerto según config).
