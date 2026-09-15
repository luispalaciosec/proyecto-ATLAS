# Web UI — Fase 3F — Actividad

**Fecha:** 2026-08-09  
**Alcance:** `@atlas/web` únicamente  
**Design:** [`WEB_UI_PHASE_3F_ACTIVITY_DESIGN.md`](./WEB_UI_PHASE_3F_ACTIVITY_DESIGN.md)

---

## 1. Objetivo

Implementar la sección **Actividad** que responde:

> “¿Qué ha estado haciendo ATLAS por mi empresa?”

Con timeline humano, aislamiento por Marca, estados completos y un único mapper compartido con Home.

---

## 2. Problema

Home mostraba “Actividad” como Próximamente y solo “Conversaciones recientes” desde historial con timestamps sintéticos. No existía registro de búsquedas Conocimiento, correcciones ni errores como actividad de producto.

---

## 3. Arquitectura

```text
POST /api/chat | /api/correct | /api/knowledge/search
        ↓
SessionStore.record*Activity()   [#activityLog in-memory]
        ↓
GET /api/activity
        ↓
mapActivityEventsToProduct()
        ↓
/actividad + Home preview
```

Capa presentación en `apps/web` — sin tocar Kernel, CLI, SDK ni contratos Frozen.

---

## 4. Fuentes de datos

| Evento | Registro | Evidencia |
|--------|----------|-----------|
| Conversación | `recordConversationActivity` | `ChatTurnPayload` real post-chat |
| Error chat | `recordConversationError` | catch en `/api/chat` |
| Conocimiento | `recordKnowledgeActivity` | query + total resultados |
| Corrección | `recordCorrectionActivity` | `CorrectionOutcome` + texto |

**No usado:** historial con timestamps sintéticos, `packages/events`, Feedback en disco mezclado CLI/Web.

---

## 5. Modelo de actividad

Tipos reales: `conversation` | `knowledge` | `correction` | `error`

Estados: `success` | `info` | `warning` | `error`

Campos opcionales solo si existen: `quote`, `description`, `action`, `technicalDetails`, `occurredAt` (ISO real al registrar).

---

## 6. UX

- Timeline agrupada por Hoy / Ayer / fecha
- Filtros: Todo, Conversaciones, Conocimiento, Correcciones, Errores
- Empty: “Todavía no hay actividad” + CTA conversación
- Loading: “Estamos preparando tu actividad…”
- Banner scope: actividad de sesión Web actual
- CTAs reales: Ver conversación, Ver en Conocimiento, Intentar de nuevo

---

## 7. API

### `GET /api/activity`

Query: `workspace`, `limit` (max 100), `type` (`conversation|knowledge|correction|error`)

Response: `{ workspace, scopeNote, items[] }`

---

## 8. Mapper

**Archivo:** `apps/web/src/presentation/map-activity.ts`

- `mapActivityEventsToProduct()`
- `groupActivityItemsByDate()`
- `formatActivityTime()`

Lenguaje honesto: no scores inventados, no “aprendió permanentemente”.

---

## 9. Aislamiento

`#activityLog` keyed por workspace slug. Tests HTTP: actividad en `geeks` no aparece en `default`.

---

## 10. Accesibilidad

- `role="toolbar"` en filtros con `aria-pressed`
- `aria-live="polite"` en contenido
- Timeline con `<ol>` / headings
- Focus visible, botones reales

---

## 11. Responsive

- Cards apiladas; hora sobre card en móvil
- Filtros wrap; targets ≥ 44px

---

## 12. Tests

**`@atlas/web`:** 74/74 PASS

| Suite | Casos |
|-------|-------|
| `map-activity.test.ts` | mapper, filtros, corrección/error |
| `server.test.ts` | vacío, chat, knowledge+correction, aislamiento, error |
| `activity.test.ts` | empty, timeline, error+retry, filtros |
| `home.test.ts` | actividad reciente, botón habilitado |
| Regresión | shell, app-state, chat, knowledge |

---

## 13. Quality gate (2026-08-09)

| Comando | Resultado |
|---------|-----------|
| `pnpm --filter @atlas/web test` | 74/74 PASS |
| `pnpm --filter @atlas/web typecheck` | PASS |
| `pnpm --filter @atlas/web lint` | PASS |
| `pnpm build` | 23/23 PASS |
| `pnpm test` | 46/46 PASS |
| `pnpm atlas doctor` | HEALTHY |

---

## 14. Limitaciones

1. **In-memory** — se pierde al reiniciar `atlas web` (igual que historial chat)
2. **Solo acciones Web** — CLI no aparece en timeline
3. **Un hilo por Marca** — “Ver conversación” abre Chat de la marca, sin ID de conversación múltiple
4. **LLM multi-turn** — proxy de “consultó Conocimiento”, no lista documentos

---

## 15. Decisiones pendientes

**ARCHITECTURAL DECISION REQUIRED**

- Persistencia durable de Actividad cross-restart
- Timeline unificada CLI + Web
- Event sourcing vía `packages/events` sin tocar contratos

---

## 16. Archivos modificados / creados

### Creados

- `releases/WEB_UI_PHASE_3F_ACTIVITY_DESIGN.md`
- `releases/WEB_UI_PHASE_3F_IMPLEMENTATION.md`
- `apps/web/src/presentation/map-activity.ts`
- `apps/web/src/client/pages/activity.ts`
- `apps/web/tests/presentation/map-activity.test.ts`
- `apps/web/tests/client/activity.test.ts`

### Modificados

- `apps/web/src/session-store.ts`
- `apps/web/src/server.ts`
- `apps/web/src/client/api/client.ts`
- `apps/web/src/client/app.ts`
- `apps/web/src/client/state/app-state.ts`
- `apps/web/src/client/pages/home.ts`
- `apps/web/src/client/pages/knowledge.ts`
- `apps/web/src/client/components/shell.ts`
- `apps/web/src/client/styles/app.css`
- `apps/web/src/i18n/es.ts`
- `apps/web/tests/server.test.ts`
- `apps/web/tests/client/home.test.ts`
- `apps/web/tests/client/shell.test.ts`
- `apps/web/tests/client/app-state.test.ts`
- `VERSION.md`
- `docs/README.md`

### NO modificados

- `packages/core`, `compiler`, `runtime`, `memory`, `retrieval`, `events`, `intelligence`, `sdk`, `cli`, `llm`

---

## 17. Evidencia auditoría git

`git diff --name-only` en archivos trackeados no incluye paquetes Frozen. Cambios de producto concentrados en `apps/web/`, `docs/`, `releases/`, `VERSION.md`.

---

## 18. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Usuario espera historial durable | `scopeNote` visible |
| Confundir “respondió” con “ejecutó tarea” | Copy diferenciado por `mode` + `success` |
| Actividad vacía tras reinicio | Empty state + documentación |

---

## 19. Siguiente fase

1. Detalle de registro Conocimiento
2. Marcas UI
3. ADR persistencia Actividad + historial durable
4. Settings / configuración IA
