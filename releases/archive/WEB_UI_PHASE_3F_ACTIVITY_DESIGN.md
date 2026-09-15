# Web UI — Fase 3F — Actividad (Design)

**Fecha:** 2026-08-09  
**Estado:** Pre-implementación (auditoría completada)  
**Alcance:** `apps/web/` únicamente

---

## A. Product intent

La sección **Actividad** responde qué ha hecho ATLAS recientemente por la empresa del usuario, en lenguaje humano, sin exponer arquitectura interna.

Reduce la ansiedad operativa (“¿ATLAS hizo algo?”, “¿falló?”, “¿en qué Marca?”) y conecta acciones con Conversación y Conocimiento.

---

## B. User question

> **“¿Qué ha estado haciendo ATLAS por mi empresa?”**

Subpreguntas que debe resolver la UI:

1. ¿Qué pregunté / busqué / corregí?
2. ¿Cuándo ocurrió (en esta sesión web)?
3. ¿En qué Marca?
4. ¿Terminó bien o requiere atención?
5. ¿Qué puedo hacer ahora?

---

## C. Data sources

| Información | Fuente real | Disponible | Limitación |
| ----------- | ----------- | ---------- | ---------- |
| Mensaje usuario (goal) | `POST /api/chat` body + `ChatTurnPayload.goal` | Sí | Solo acciones vía Web en sesión actual |
| Respuesta ATLAS | `ChatTurnPayload` (`llm_message`, deterministic success) | Sí | No distinguir “completó tarea” vs “respondió” más allá de `success` + `mode` |
| Modo LLM / deterministic | `ChatTurnPayload.mode` | Sí | — |
| Consulta conocimiento (LLM multi-turn) | `ChatTurnPayload.llm_turns > 1` | Sí | Proxy: indica tool use, no lista documentos |
| Retrieval deterministic | `ChatTurnPayload.retrieval.selected/total_candidates` | Sí | Solo modo deterministic |
| Corrección registrada | `CorrectionOutcome` status `recorded` + texto | Sí | Solo vía Web; no afirmar aprendizaje permanente |
| Búsqueda Conocimiento | `KnowledgeSearchResponseProduct` | Sí **si se registra en SessionStore** | Hoy no queda log; hay que registrar en capa web |
| Timestamp real | Reloj del proceso al registrar evento | Sí | **In-memory**; se pierde al reiniciar `atlas web` |
| Historial chat (`GET /api/history`) | `session.history` + `#deterministicHistory` | Parcial | Timestamps **sintéticos** en mapper; no usar para timeline |
| Feedback en memoria (`Feedback` records) | `.atlas/.../memory.json` | Parcial | Mezcla CLI/Web; sin timestamp de UI; **no usar como timeline** |
| Eventos Kernel / `packages/events` | Event bus | No accesible sin tocar Frozen | **Fuera de scope** |
| Persistencia durable actividad | — | No | **ARCHITECTURAL DECISION REQUIRED** para cross-restart |

---

## D. Activity model (categorías reales)

Tipos derivables **sin inventar**:

| `type` | Origen | Cuándo |
| ------ | ------ | ------ |
| `conversation` | Chat exitoso (`success: true`) | `POST /api/chat` |
| `conversation` | Chat LLM fallido (`success: false`) | `POST /api/chat` |
| `error` | Excepción en chat | `POST /api/chat` catch |
| `knowledge` | Búsqueda Conocimiento | `GET/POST /api/knowledge/search` con query no vacía |
| `correction` | Corrección registrada | `POST /api/correct` status `recorded` |
| `error` | Corrección no aplicable | `POST /api/correct` status `no_prior_turn` / error HTTP |

**No incluir:** categorías “success” separadas, métricas de documentos, actividad de usuarios, IDs de sesión Kernel.

---

## E. Product language

| Interno | UI (solo si evidencia real) |
| ------- | ----------------------------- |
| LLM response | “ATLAS respondió una consulta” |
| `llm_turns > 1` | “ATLAS consultó información disponible en Conocimiento” |
| deterministic + `retrieval.selected > 0` | “ATLAS utilizó conocimiento de esta marca” |
| deterministic sin retrieval | “ATLAS ejecutó un proceso estructurado” |
| `success: false` (LLM) | “ATLAS no pudo completar la respuesta” |
| HTTP / exception | “ATLAS no pudo completar la solicitud” |
| knowledge search | “Consultaste Conocimiento” |
| correction recorded | “Corregiste una respuesta” + “ATLAS recibió tu corrección” |
| Feedback memory | **No** decir “ATLAS aprendió permanentemente” |

---

## F. UX states

| Estado | Copy |
| ------ | ---- |
| Loading | “Estamos preparando tu actividad…” |
| Empty | “Todavía no hay actividad” + CTA “Empieza una conversación” |
| Populated | Timeline agrupada por fecha (Hoy / Ayer / fecha) |
| Error API | “No pudimos cargar tu actividad” + “Intentar de nuevo” |
| Partial | Banner: “La actividad mostrada corresponde a esta sesión de ATLAS Web” |

---

## G. Accessibility

- `<main>` con heading `h1` Actividad
- Timeline con `<ol>` o lista semántica
- `aria-live="polite"` en zona de contenido
- Filtros como `<button>` o tabs con `aria-pressed`
- Focus visible; contraste tokens existentes
- `prefers-reduced-motion`: sin animaciones timeline

---

## H. Responsive

- Timeline vertical en todos los breakpoints
- Cards full-width móvil
- Filtros wrap / scroll horizontal evitado (stack en móvil)
- CTA ≥ 44px

---

## I. Privacy / isolation

- `GET /api/activity?workspace=` — backend filtra por `#activityLog` keyed por workspace
- Cambio de Marca → otra lista
- Sin filtro frontend como seguridad

---

## J. Architecture

Permanece en `apps/web` porque:

1. Actividad Web es **vista de producto** sobre acciones ya ejecutadas vía Express
2. No requiere cambiar contratos Memory/Events/CLI
3. Log in-memory en `SessionStore` es analogía a `#deterministicHistory` (capa presentación)
4. Mapper `map-activity.ts` traduce eventos crudos → `ActivityItemProduct`

```text
POST chat / correct / knowledge
        ↓
SessionStore.recordActivityEvent()
        ↓
GET /api/activity
        ↓
mapActivityToProduct()
        ↓
Actividad UI + Home reciente
```

---

## K. STOP conditions

**No implementar:**

- Persistencia `.atlas/web-activity.json` o DB
- Lectura de `packages/events`
- Reconstrucción desde historial con timestamps falsos
- Filtros sin datos (p. ej. “Errores” vacío si no hay eventos error)
- Links “Ver corrección” sin pantalla de detalle
- Métricas inventadas (“17 documentos”)
- Modificar `packages/cli` / `sdk` / Frozen

**ARCHITECTURAL DECISION REQUIRED (documentar, no resolver en 3F):**

- Actividad durable cross-restart
- Timeline unificada CLI + Web
- Identificador de conversación múltiple por marca

---

## L. API propuesta

### `GET /api/activity`

Query:

- `workspace` (opcional, default)
- `limit` (opcional, default 50, max 100)
- `type` (opcional: `conversation` | `knowledge` | `correction` | `error`)

Response:

```json
{
  "workspace": "geeks",
  "scopeNote": "…",
  "items": [ { "id", "type", "title", "description", "occurredAt", "workspaceName", "status", "quote", "action" } ]
}
```

---

## M. Home integration

Reemplazar bloque “Conversaciones recientes” por **“Actividad reciente”** usando el mismo mapper (`limit=3`).

Una sola fuente: `map-activity.ts`.

---

## N. Implementación incremental

1. Design doc (este archivo)
2. SessionStore activity log + record hooks en server
3. `map-activity.ts` + tests mapper
4. `GET /api/activity` + tests API
5. Página `/actividad` + routing + nav
6. Home reciente + habilitar acción Actividad
7. Quality gate + `WEB_UI_PHASE_3F_IMPLEMENTATION.md`
