# WEB UI Audit — ATLAS P2.5.x Product UX (Fase 1)

**Tipo:** Auditoría pre-implementación  
**Fecha:** 9 de agosto de 2026  
**Alcance:** `@atlas/web` (`apps/web/`) y su integración con `@atlas/cli`  
**HEAD de referencia:** `6fd73b7`  
**Estado P2.5:** Entregado y validado E1–E6 ([`MANUAL_VALIDATION_REPORT_2026-08-09.md`](./MANUAL_VALIDATION_REPORT_2026-08-09.md))  
**Regla:** Esta auditoría **no modifica código**. Entrada para Fase 2 ([`docs/WEB_UI_PRODUCT_UX.md`](../docs/WEB_UI_PRODUCT_UX.md) — **PASS**) e implementación incremental Fase 3.

---

## Resumen ejecutivo

La Web UI actual cumple su rol de **demostración técnica**: prueba que chat, corrección y aislamiento por marca funcionan vía HTTP. **No cumple** el rol de **interfaz operacional principal de producto**: expone jerga de ingeniería, carece de navegación, dashboard, memoria visible, proyectos, configuración, historial al recargar, estados vacíos de calidad y diseño responsive.

La arquitectura backend es sólida para evolucionar la UI: `@atlas/web` consume `@atlas/cli` sin reimplementar Kernel, Memory ni LLM. La mayoría de mejoras de producto pueden hacerse **en frontend + capa API delgada en `apps/web`** sin tocar paquetes certificados — con gaps documentados donde el backend aún no expone operaciones (browse/edit memory, projects, settings persistidos).

---

## A. Estado actual

### Estructura del paquete

```text
apps/web/
├── package.json          # @atlas/web 0.0.0
├── tsconfig.json
├── vitest.config.ts
├── public/               # Frontend estático (sin bundler)
│   ├── index.html        # 51 líneas — layout único
│   ├── style.css         # 125 líneas — tema oscuro fijo
│   └── app.js            # 176 líneas — lógica vanilla ES modules
├── src/
│   ├── server.ts         # Express — 4 endpoints API
│   ├── session-store.ts  # Sesiones in-memory por workspace
│   └── config.ts         # ATLAS_WEB_HOST / ATLAS_WEB_PORT
└── tests/
    └── server.test.ts    # 7 tests integración HTTP
```

### Stack

| Capa | Tecnología | Notas |
|------|------------|-------|
| Servidor | Express 4 | `createWebServer()` exportable para tests |
| Frontend | HTML + CSS + JS vanilla | Sin React/Vue/Svelte; sin bundler frontend |
| Build | tsup (solo `server.ts`) + copia `public/` → `dist/public/` | Estáticos servidos desde `dist/public/` |
| Plataforma | `@atlas/cli` | `executeChatTurn`, `applyCorrection`, `listWorkspaces`, brand client |
| SDK | `@atlas/sdk` en `package.json` | **No importado directamente** en web; llega vía CLI |
| Tests | Vitest (node) | 7 tests API; **0 tests frontend** |

### Entry points

1. `pnpm atlas web` → `packages/cli/src/commands/web-command.ts` hace `spawn(node, apps/web/dist/server.js)` con env heredado.
2. `node apps/web/dist/server.js` o bin `atlas-web`.
3. Puerto por defecto: `127.0.0.1:4173` (`config.ts`).

### Routing

**No hay routing frontend.** Una sola página (`index.html`) con todas las secciones apiladas verticalmente.

**API (backend):**

| Método | Ruta | Función |
|--------|------|---------|
| `GET` | `/api/health` | `{ ok: true }` — no consumido por UI |
| `GET` | `/api/workspaces` | `{ workspaces: ['default', ...slugs] }` |
| `POST` | `/api/chat` | Ejecuta un turno de chat |
| `POST` | `/api/correct` | Registra feedback |

Estáticos: `/`, `/style.css`, `/app.js` vía `express.static`.

### Estado y persistencia

- **Sesiones:** `SessionStore` mantiene un `Map<workspaceKey, ChatSessionState>` en memoria del proceso Node.
- **Historial LLM:** existe en `ChatSessionState.history` en el servidor, pero **no se expone ni renderiza** en la UI (ver [`WEB_UI_CHAT_HISTORY_RELOAD_FIX.md`](./WEB_UI_CHAT_HISTORY_RELOAD_FIX.md)).
- **Reinicio de `atlas web`:** pierde todas las sesiones en RAM (el historial LLM del servidor se pierde; la memoria persistente en `.atlas/` sobrevive).
- **Recarga F5 / cambio workspace:** el panel de mensajes se vacía (`app.js` L62 `messages.replaceChildren()`).

### Integración arquitectónica (correcta)

```text
Browser → apps/web (Express) → @atlas/cli (executeChatTurn, brand client)
                                      ↓
                               @atlas/sdk (Atlas facade)
                                      ↓
                               Memory / LLM / Plan (sin reimplementar)
```

Cumple `apps/README.md`: *Applications SHALL consume the platform. They never implement it.*

---

## B. Qué funciona

Conectado al backend y verificado en validación manual (E3, E5, E6):

| Capacidad | Evidencia |
|-----------|-----------|
| Health check | `GET /api/health` → 200 |
| Listar workspaces en disco | `GET /api/workspaces` incluye `default` + slugs de `.atlas/workspaces/` |
| Chat LLM con tools | `POST /api/chat` → `mode: llm`, `llm_message`, tool-calling vía SDK |
| Chat determinista (sin LLM) | `mode: deterministic` cuando no hay `ATLAS_LLM_*` |
| Aislamiento brand | Workspace `geeks` vs `default` — memoria separada (E5, E6) |
| Corrección / feedback | `POST /api/correct` → `status: recorded` con turno previo |
| Brand profile + feedback en prompt | Cargado silenciosamente en `SessionStore.#buildBrandClient()` |
| Arranque vía CLI | `pnpm atlas web` spawn correcto (post-fix circular dependency) |
| Tests API | 7/7 en `server.test.ts` |

### Flujo mínimo operativo hoy

1. Usuario abre `http://127.0.0.1:4173`.
2. Elige workspace en `<select>` o escribe slug + "Use".
3. Escribe un "Goal" y envía.
4. Recibe respuesta (texto LLM o metadata determinística).
5. Opcionalmente envía corrección en panel inferior.

---

## C. Qué está incompleto

### Respecto al brief P2.5.x (producto)

| Área | Estado |
|------|--------|
| Dashboard / home | ❌ No existe |
| Navegación / app shell | ❌ Página única sin sidebar |
| Espacios de trabajo visuales (marcas) | ⚠️ Dropdown + input slug crudo |
| Proyectos / contextos | ❌ No existe en UI ni backend web |
| Chat moderno (markdown, streaming, historial) | ❌ Texto plano; sin streaming en SDK |
| Actividad de ATLAS (tools amigables) | ❌ No visible |
| Memoria browsable ("Lo que ATLAS recuerda") | ❌ Solo vía tools LLM |
| Feedback natural ("Corregir respuesta") | ⚠️ Panel técnico separado |
| Configuración (IA, apariencia, idioma) | ❌ Solo env vars externas |
| Empty states de calidad | ❌ Panel vacío sin guía |
| Errores amigables + "Ver detalles" | ❌ Mensajes crudos del servidor |
| Responsive / mobile | ❌ Sin media queries |
| Accesibilidad completa | ⚠️ Parcial (ver §F) |
| Historial al recargar | ❌ Documentado como fix pendiente |
| Lista workspaces tras crear slug nuevo | ❌ No refresca hasta F5 |
| i18n (español producto) | ❌ UI en inglés con términos técnicos |

### Respecto al CLI (superficie no expuesta)

Comandos registrados en CLI (`container.ts`): `compile`, `run`, `plan`, `ask`, `brand`, `chat`, `memory`, `doctor`, `version`, `web`.

La Web UI expone equivalente parcial de **`chat` + `/correct` + selector brand**. No expone: `memory`, `plan`, `ask`, `doctor`, `compile`, `run`, perfil de marca editable.

---

## D. Qué es técnico para el usuario

Texto visible hoy que **viola la traducción de lenguaje** del brief (§8):

| Expuesto en UI | Debería ser (producto) |
|----------------|------------------------|
| "Atlas Web" / "Local chat over the Atlas platform" | ATLAS — asistente de trabajo |
| "Workspace" | Espacio de trabajo |
| "New brand slug" | Nueva marca / nombre |
| "Goal" | Mensaje / pregunta |
| "Active workspace: …" | Estás en: **Geeks** |
| "Mode: deterministic" | (oculto o traducido) |
| "Success: yes/no" | (oculto) |
| "Workflow: …" | (oculto o "Actividad") |
| "Retrieval: N/M" | "Consultando memoria…" |
| "Turn N completed (llm/deterministic/unknown)" | Estado amigable |
| "Correction status: no_prior_turn / llm_required" | Mensaje humano |
| "(empty LLM response)" | "No recibí respuesta del asistente" |
| Errores API literales | `goal must not be empty`, `OpenAI-compatible API error (429): …` |
| Mensajes backend env | `Correction requires LLM mode (set ATLAS_LLM_API_KEY…)` |

El usuario debe **conocer implícitamente** que escribir "Usa memory_search…" mejora resultados — eso es conocimiento de operador, no de producto.

---

## E. Problemas UX

### Críticos (bloquean producto diario)

1. **Sin orientación inicial** — No responde "¿Dónde empiezo?". Pantalla vacía + campos técnicos.
2. **Sin contexto visible de marca/proyecto** — Riesgo de enviar información al workspace equivocado (E6 demostró importancia del aislamiento).
3. **Historial perdido al recargar** — Usuario pierde hilo conversacional aunque el servidor aún lo tenga en RAM.
4. **Errores crudos** — `tool_use_failed`, HTTP 429, stack-like messages destruyen confianza.
5. **Sin indicador de actividad** — Durante 5–30 s de LLM+tools, solo "Sending goal…"; usuario no sabe si ATLAS trabaja o colgó.
6. **Corrección desconectada del flujo chat** — Panel inferior permanente; no hay acción contextual sobre la última respuesta.

### Importantes

7. **Cambio workspace borra mensajes** sin explicar que el historial sigue en servidor (si existiera endpoint).
8. **Slug libre sin validación UX** — Usuario puede escribir slug inválido; error llega tarde o silenciosamente.
9. **Modo determinístico expuesto** — Usuario no operador ve metadata de Kernel en burbuja assistant.
10. **Sin confirmación al cambiar marca** — Cambio en dropdown instantáneo; fácil mezclar contextos mentalmente.
11. **Sin retry** — Error → burbuja roja; usuario debe reescribir manualmente.
12. **Input single-line** — Sin Shift+Enter; mensajes largos incómodos.
13. **Sin copiar respuesta** — Fricción para reutilizar output.

### Menores

14. Workspace nuevo no aparece en lista hasta recargar página.
15. `GET /api/health` no usado para mostrar "ATLAS no disponible" si servidor cae.
16. Idioma inglés fijo vs usuarios hispanohablantes del piloto.

---

## F. Problemas UI

### Visual / diseño

- Tema oscuro único hardcodeado (`#0f172a`); `color-scheme: light dark` en `:root` pero sin tema claro real.
- Tipografía system default; sin jerarquía de producto premium.
- Layout centrado `max-width: 860px` — aceptable desktop, no optimizado mobile.
- Burbujas chat básicas (4 clases); **sin markdown**, listas, tablas, código.
- Sin design system: botones, inputs, cards, dialogs, skeletons, badges inconsistentes con producto SaaS moderno.
- Header mínimo ("Atlas Web") — no transmite marca ni espacio activo.

### Responsive

- **Cero `@media` queries** en `style.css`.
- Filas flex sin `flex-wrap` — riesgo overflow en móvil (workspace row + chat row).
- Textarea corrección usable pero panel apilado largo en pantallas pequeñas.

### Accesibilidad (estado parcial)

| Presente | Ausente |
|----------|---------|
| `lang="en"` | Español / i18n |
| Labels `for`/`id` en controles | Landmarks (`nav`, `aside`) |
| `aria-live="polite"` en mensajes | `aria-busy` durante fetch |
| `role="status"` en barra estado | `:focus-visible` estilizado |
| Contraste razonable en dark | Anuncio errores en live region dedicada |
| | Prevención doble submit |
| | Navegación teclado documentada |

---

## G. Problemas de arquitectura frontend

1. **Monolito de página única** — Todo en `index.html` + `app.js`; no escala a dashboard, memoria, settings sin refactor estructural.
2. **Estado global implícito** — `let activeWorkspace` + DOM queries; sin módulos ni patrón de estado (adecuado para demo, insuficiente para producto).
3. **Acoplamiento directo payload ↔ render** — `sendChat()` interpreta `ChatTurnPayload` en UI; cambios de contrato CLI rompen frontend silenciosamente.
4. **Sin capa de traducción** — No hay `formatError()`, `formatActivity()`, `formatWorkspaceLabel()` entre API y DOM.
5. **Sin separación vista / lógica / API client** — Dificulta testing frontend (hoy 0 tests).
6. **Sin bundler frontend** — Aceptable para Fase 1; Fase 3 probablemente necesite Vite o similar para componentes, CSS modules, tree-shaking.
7. **Sesión UI desincronizada del servidor** — Frontend no conoce `session_id`, `turn`, ni historial; imposible "conversaciones recientes" sin API.
8. **Estáticos copiados en build** — Correcto para deploy local; cualquier framework debe integrarse en pipeline `tsup` + copy o migrar a Vite full-stack ligero **solo en apps/web** (no toca kernel).

**No es deuda arquitectónica de plataforma** — es deuda de capa aplicación, acotada a `apps/web/`.

---

## H. Qué puede mejorarse sin tocar backend certificado

Mejoras realizables en **`apps/web/public/*`** y, donde acotado, **`apps/web/src/server.ts`** (capa aplicación, no `@atlas/*` certificado):

| Mejora | Esfuerzo | Notas |
|--------|----------|-------|
| Traducción de copy (español producto) | Bajo | Solo strings UI |
| App shell + sidebar + header contexto | Medio | HTML/CSS/JS o framework |
| Renombrar labels (Workspace → Espacio de trabajo) | Bajo | |
| Formateo markdown respuestas (client-side) | Medio | marked/DOMPurify en public |
| Loading skeleton + disable submit | Bajo | |
| Errores amigables + acordeón "Detalles técnicos" | Medio | Mapeo en `app.js` |
| Empty states ilustrados | Bajo | |
| `:focus-visible`, contraste, landmarks | Bajo–Medio | CSS + HTML |
| Media queries mobile | Medio | CSS |
| Botón "Reintentar" en errores | Bajo | |
| Copiar respuesta | Bajo | |
| Shift+Enter en textarea unificado | Bajo | Unificar input chat |
| Panel "Actividad" derivado de payload existente | Medio | Usar `llm_turns`, inferir fases; sin JSON crudo |
| Refrescar workspaces tras crear slug | Bajo | Re-call `loadWorkspaces()` |
| **Historial al recargar** | Medio | Endpoint `GET /api/history` en `server.ts` — **solo apps/web**, no toca contratos Frozen ([doc planeado](./WEB_UI_CHAT_HISTORY_RELOAD_FIX.md)) |
| Health indicator en header | Bajo | Poll `/api/health` |
| Ocultar bloque determinístico crudo | Bajo | Mostrar mensaje humano o ocultar modo técnico |

---

## I. Qué requeriría cambios backend

Clasificación: **apps/web API** (permitido) vs **paquetes certificados** (requiere parar + ADR si aplica).

### Capa apps/web (nuevo endpoints delgados — NO modificar kernel)

| Necesidad producto | Endpoint / cambio propuesto | Toca certificado |
|--------------------|----------------------------|------------------|
| Historial chat UI | `GET /api/history` | ❌ Solo apps/web + reutiliza `ChatSessionState` |
| Listar memoria browsable | `GET /api/memory/search?query=` | ❌ Wrapper sobre `AtlasService` / SDK memory |
| Detalle registro memoria | `GET /api/memory/records/:id` | ❌ Si SDK expone read |
| Health enriquecido para UI | `GET /api/status` (doctor-lite) | ❌ Wrapper `atlas doctor` lógica |
| Editar perfil marca | `GET/PATCH /api/workspaces/:slug/profile` | ❌ Wrapper `brand-profile.ts` CLI |
| Lista conversaciones | Persistir metadata sesión web | ⚠️ Requiere diseño (filesystem o extensión SessionStore) |

### Gaps reales — backend hoy NO soporta (no inventar en UI)

| Necesidad | Estado en plataforma | Acción |
|-----------|---------------------|--------|
| **Proyectos / contextos** (Banco Amazonas dentro de Geeks) | No existe modelo | **STOP** — requiere diseño producto + posible extensión Memory metadata o nuevo concepto; ADR si toca `@atlas/memory` |
| **Editar / eliminar** registros memoria | CLI solo store/search; no edit/delete API | **STOP** o scope mínimo vía nuevo comando SDK |
| **Streaming LLM** | `@atlas/llm` respuesta bloqueante | **STOP** — cambio arquitectónico LLM provider loop |
| **Settings persistidos** (modelo, idioma) | Solo env vars | UI puede mostrar read-only de env; persistir requiere config store (nuevo) |
| **Auth / multi-usuario** | No existe | Fuera scope P2.5.x |
| **Cloud / P2.6** | Condicional | Explícitamente excluido |

### Cambios que NO deben hacerse (regla §4)

- Modificar `@atlas/core`, `@atlas/compiler`, `@atlas/runtime`, `@atlas/memory`, `@atlas/retrieval`, contratos Frozen, `LlmProvider`, providers LLM.
- Introducir lógica de negocio duplicada en web en lugar de reutilizar `@atlas/cli`.

---

## J. Recomendación de arquitectura UI

### Principio

Mantener **`apps/web` como única capa de producto** que crece; **`@atlas/cli` sigue siendo fuente de verdad** para chat, brand, feedback. La Web UI añade **presentación + endpoints HTTP delgados**, no reimplementación.

### Fase 2 (siguiente entregable): `docs/WEB_UI_PRODUCT_UX.md`

Documentar antes de codificar masivamente:

- Sitemap: Home → Espacio → (Proyecto futuro) → Chat | Memoria | Configuración
- User journeys E1–E6 traducidos a clicks
- Design system tokens (premium, calmado, profesional)
- Glosario UI español ↔ conceptos internos
- Matriz de estados (empty, loading, error, success)

### Fase 3 (implementación incremental — orden sugerido)

```text
1. App shell + navegación + contexto visible (marca activa)
2. Capa i18n/copy + error formatter (sin tocar kernel)
3. Chat UX (markdown, loading, retry, input multiline)
4. GET /api/history + render historial (apps/web only)
5. Actividad ATLAS (discreta, expandible)
6. Feedback inline ("Corregir respuesta")
7. Vista memoria read-only (wrapper API)
8. Settings read-only + sección Avanzado
9. Responsive + a11y pass
10. Proyectos — SOLO tras decisión producto/backend
```

### Stack frontend recomendado (Fase 3)

| Opción | Pros | Contras |
|--------|------|---------|
| **Vanilla modular + Vite** | Mínimo cambio, sin React lock-in | Más manual para componentes complejos |
| **Vite + Preact/React ligero** | Ecosistema componentes, markdown, a11y libs | Curva setup en monorepo |
| **Lit / Web Components** | Encapsulación, interoperable | Menos convención en equipo |

**Recomendación:** **Vite + vanilla TS modules** o **Preact** dentro de `apps/web/` únicamente — sin imponer framework al monorepo. Build sigue siendo responsabilidad de `@atlas/web`; `pnpm atlas web` sirve `dist/`.

### Contrato API evolutivo (apps/web)

Versionar respuestas amigables en paralelo a payloads técnicos:

```json
{
  "assistant_message": "Encontré 3 elementos…",
  "activity": [{ "label": "Buscando en la memoria", "status": "done" }],
  "technical": { "mode": "llm", "turn": 2, "session_id": "…" }
}
```

El frontend producto consume `assistant_message` + `activity`; "Ver detalles técnicos" expande `technical`. **Implementación:** capa mapper en `server.ts` post-`executeChatTurn`, sin cambiar `@atlas/cli` exports — o mapper en frontend sobre payload actual (más rápido, menos limpio).

### Riesgo principal

Scope creep hacia **proyectos/contextos** o **streaming** antes de cerrar shell + chat + memoria read-only. Mantener P2.5.x acotado a **productizar lo que E1–E6 ya validaron**.

---

## Referencias inspeccionadas

| Artefacto | Ruta |
|-----------|------|
| HTML UI | `apps/web/public/index.html` |
| Frontend logic | `apps/web/public/app.js` |
| Estilos | `apps/web/public/style.css` |
| Servidor | `apps/web/src/server.ts` |
| Sesiones | `apps/web/src/session-store.ts` |
| Config | `apps/web/src/config.ts` |
| Payload chat | `packages/cli/src/chat/chat-turn.ts` |
| Comando web | `packages/cli/src/commands/web-command.ts` |
| Validación E1–E6 | `releases/MANUAL_VALIDATION_REPORT_2026-08-09.md` |
| Fix historial planeado | `releases/WEB_UI_CHAT_HISTORY_RELOAD_FIX.md` |
| Gobernanza apps | `apps/README.md` |
| VERSION P2.5 | `VERSION.md` § P2.5 |

---

## Entrega Fase 1 — Checklist (§34)

```text
ARCHIVOS MODIFICADOS
  (ninguno — auditoría solo lectura)

ARCHIVOS NUEVOS
  releases/WEB_UI_AUDIT.md

TESTS
  No ejecutados (sin cambios de código en esta fase)

BUILD
  No ejecutado (sin cambios de código en esta fase)

TYPECHECK
  No ejecutado (sin cambios de código en esta fase)

LINT
  No ejecutado (sin cambios de código en esta fase)

MANUAL QA
  Basado en inspección de código + validación manual previa E3/E5/E6
  (releases/MANUAL_VALIDATION_REPORT_2026-08-09.md)

RIESGOS
  - Scope creep (proyectos, streaming, cloud) antes de cerrar UX base
  - Errores LLM crudos siguen destruyendo confianza hasta capa traducción
  - Historial no visible genera percepción de "ATLAS no recuerda la conversación"
  - Cambio workspace sin confirmación → errores humanos cross-brand

GAPS
  - Proyectos/contextos: no existe en backend
  - Memory edit/delete: no existe
  - Streaming: no existe en @atlas/llm
  - Settings persistidos: solo env vars
  - GET /api/history: planeado, no implementado

DECISIONES ARQUITECTÓNICAS
  - Evolucionar solo apps/web + endpoints delgados; no tocar paquetes certificados
  - Reutilizar @atlas/cli como backend de producto web
  - Mapper amigable API o frontend antes de cambiar ChatTurnPayload en CLI
  - Proyectos/contextos: STOP hasta diseño explícito + posible ADR

VEREDICTO FASE 1
  PASS — Auditoría completa. Listo para Fase 2 (docs/WEB_UI_PRODUCT_UX.md).
  NO iniciar implementación masiva hasta aprobar propuesta UX/UI.
```

---

*Documento generado como Fase 1 del brief P2.5.x Web Product UX. Sin commit ni push por instrucción explícita.*
