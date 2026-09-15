# ATLAS Web UI — World-Class Product Review

**Tipo:** Revisión pre-implementación (Product / UX / Frontend / QA)  
**Fecha:** 9 de agosto de 2026  
**Alcance:** `@atlas/web` (`apps/web/`) — evolución hacia producto empresarial de clase mundial  
**Referencias:** [`docs/WEB_UI_PRODUCT_UX.md`](../docs/WEB_UI_PRODUCT_UX.md) · [`releases/WEB_UI_AUDIT.md`](./WEB_UI_AUDIT.md) · [`releases/WEB_UI_PHASE_3_IMPLEMENTATION.md`](./WEB_UI_PHASE_3_IMPLEMENTATION.md) · [`VERSION.md`](../VERSION.md)  
**Regla:** Este documento **no modifica código**. Define el camino incremental hacia la experiencia objetivo del brief world-class.

---

## Resumen ejecutivo

ATLAS Web ha dado un salto importante: ya no es una demo técnica de una sola página. Tras Fase 3 (ítems 1–4), existe una **SPA Vite + TypeScript** con app shell, i18n español, chat v2 con markdown, mapeo de errores y arquitectura de presentación separada. La integración con la plataforma sigue siendo **correcta**: Express → `@atlas/cli` → `@atlas/sdk`, sin tocar paquetes Frozen/Certified.

Sin embargo, la interfaz **aún no alcanza el estándar “world-class SaaS B2B”** descrito en el brief. Funciona como **MVP de producto usable**, no como experiencia diaria comparable a Notion/Linear/Slack en claridad, confianza y completitud. Las brechas principales son: **Home orientada a acciones**, **Conocimiento browseable**, **Marcas como cards**, **Actividad legible**, **feedback natural (👍/👎)**, **historial al recargar**, **transparencia sin jerga**, **design system completo** y **pass de accesibilidad WCAG 2.2 AA**.

**Recomendación:** proceder con implementación incremental en fases 3B–3J (ver §S), priorizando endpoints delgados en `apps/web/src/server.ts` donde el backend ya existe en CLI pero no está expuesto HTTP. **No** ampliar alcance a streaming, multiusuario, cloud, edición de memoria ni proyectos hasta diseño backend explícito.

**Veredicto:** **NEEDS REVIEW** — la base arquitectónica y el slice 1–4 están listos para construir encima, pero el brief world-class requiere decisiones de producto (taxonomía de navegación, sección Usuario, nivel de transparencia de actividad) y aprobación de contratos API delgados antes de declarar “producto terminado”.

---

## A. Estado actual

### A.1 Stack y estructura (post Fase 3 ítems 1–4)

```text
apps/web/
├── index.html                    # Entry Vite
├── vite.config.ts                # Build → dist/public/
├── package.json                  # tsup (server) + vite (client)
├── src/
│   ├── server.ts                 # Express: 4 endpoints + SPA fallback
│   ├── session-store.ts          # Sesiones in-memory por workspace
│   ├── config.ts                 # ATLAS_WEB_HOST / PORT (4173)
│   ├── client/                   # SPA vanilla TS
│   │   ├── app.ts, main.ts
│   │   ├── components/shell.ts
│   │   ├── pages/home.ts, chat.ts
│   │   ├── api/client.ts
│   │   ├── state/app-state.ts
│   │   ├── lib/markdown.ts
│   │   └── styles/tokens.css, app.css
│   ├── i18n/es.ts                # Español centralizado
│   └── presentation/             # format-error, map-chat-response
└── tests/                        # 26 tests (API 7 + frontend 19)
```

**Build:** `tsup src/server.ts` + `vite build` → `dist/server.js` + `dist/public/`  
**Arranque:** `pnpm --filter @atlas/web build && atlas web` → `http://127.0.0.1:4173`

### A.2 API HTTP existente

| Método | Ruta | Contrato actual | Consumido por UI |
|--------|------|-----------------|------------------|
| GET | `/api/health` | `{ ok: true }` | No (solo tests) |
| GET | `/api/workspaces` | `{ workspaces: string[] }` | Selector espacio |
| POST | `/api/chat` | `ChatTurnPayload` (`goal`, `workspace?`) | Conversación |
| POST | `/api/correct` | `CorrectionOutcome` | Panel corrección |

**No existen aún:** `/api/history`, `/api/memory/search`, `/api/brands`, `/api/activity`, `/api/settings`.

### A.3 Capacidades UI implementadas vs brief world-class

| Área | Estado actual | Nivel world-class |
|------|---------------|-------------------|
| App shell + routing | ✅ Sidebar, header, responsive drawer | ⚠️ Falta Actividad, Usuario, contexto marca premium |
| i18n ES | ✅ Centralizado | ⚠️ “Memoria” vs “Conocimiento”; sin locales regionales |
| Chat v2 | ✅ Markdown, loading, corrección, errores mapeados | ⚠️ Falta retry, 👍/👎, pasos de actividad, transparencia retrieval |
| Home | ⚠️ Bienvenida + 1 CTA | ❌ Acciones múltiples, ejemplos, saludo personalizado |
| Marcas | ⚠️ `<select>` + input slug | ❌ Grid de cards, descripción, última actividad |
| Conocimiento | ❌ Placeholder “Próximamente” | ❌ Buscar, filtros, cards read-only |
| Actividad | ❌ No existe | ❌ Timeline humano |
| Configuración | ❌ Placeholder | ❌ IA, apariencia, avanzado read-only |
| Historial F5 | ❌ Se pierde en UI | ❌ Bloqueante para confianza diaria |
| Accesibilidad | ⚠️ Parcial (landmarks, aria-live, touch 44px) | ❌ WCAG 2.2 AA audit formal pendiente |

### A.4 Quality gate verificado (Fase 3 slice)

| Comando | Resultado |
|---------|-----------|
| `pnpm build` | 23/23 |
| `pnpm typecheck` | 35/35 |
| `pnpm lint` | 35/35 |
| `pnpm --filter @atlas/web test` | 26/26 |
| `pnpm test` (raíz) | 45/46 — flake preexistente `@atlas/cli` dev-bootstrap |

---

## B. Qué conservar

1. **Arquitectura de capas** — `client/` → `presentation/` → `api/` → `server.ts` → `@atlas/cli`. No revertir.
2. **i18n centralizado** — `src/i18n/es.ts` + `t()`; extender, no dispersar strings.
3. **Mappers de presentación** — `formatUserError`, `mapChatResponse`; base para transparencia y actividad.
4. **Tokens CSS** — `tokens.css` alineado con UX doc §8; evolucionar a design system formal.
5. **Chat core** — Composer multilínea, Enter/Shift+Enter, markdown sanitizado, confirmación cambio espacio.
6. **Tests** — Vitest node + jsdom; mantener regresión API + unit presentation.
7. **SPA fallback** — Routing History API funcional post-build.
8. **Glosario humano** — No exponer `workspace`, `goal`, `deterministic` en UI principal (ya aplicado en copy).

---

## C. Qué debe cambiar

### C.1 Crítico (bloquea uso diario “world-class”)

| # | Cambio | Motivo |
|---|--------|--------|
| 1 | **`GET /api/history` + preload UI** | F5 pierde hilo; servidor ya tiene `session.history` ([`WEB_UI_CHAT_HISTORY_RELOAD_FIX.md`](./WEB_UI_CHAT_HISTORY_RELOAD_FIX.md)) |
| 2 | **Home orientada a acciones** | Brief §5: responder “¿Qué puedo hacer?” en <10 s |
| 3 | **Contexto de marca persistente y elegante** | Brief §7: chip/banner premium, no solo `<select>` |
| 4 | **Botón Reintentar en errores** | Keys i18n existen (`common.retry`); falta wiring en chat |
| 5 | **Renombrar “Memoria” → “Conocimiento”** | Alineación glosario §4 brief world-class |

### C.2 Alto (confianza y percepción premium)

| # | Cambio | Motivo |
|---|--------|--------|
| 6 | **Transparencia post-respuesta** | “Consulté el conocimiento…” usando `retrieval.selected` en modo deterministic |
| 7 | **Loading contextual multi-paso** | Brief §15; inferir de `llm_turns` + fases genéricas (sin inventar tool names) |
| 8 | **Feedback 👍/👎 → corrección** | Brief §13; reutilizar `/api/correct` |
| 9 | **Pantalla Marcas (cards)** | Brief §11; datos de `profile.json` vía endpoint delgado |
| 10 | **Pantalla Conocimiento read-only** | Brief §10; `memory search` vía CLI ya existe |

### C.3 Medio (completitud producto)

| # | Cambio |
|---|--------|
| 11 | Timeline Actividad (derivada de turnos chat + correcciones, no events kernel) |
| 12 | Configuración read-only (LLM configurado sí/no, versión, health) |
| 13 | Empty states enseñables en todas las vistas |
| 14 | Design system: componentes reutilizables (`EmptyState`, `ErrorPanel`, `ContextChip`, `ActionCard`) |
| 15 | Pass accesibilidad WCAG 2.2 AA + `prefers-reduced-motion` |

### C.4 Polish

| # | Cambio |
|---|--------|
| 16 | Tipografía con escala formal (display, title, body, caption) |
| 17 | Micro-interacciones sutiles (focus, hover, disabled) — sin animaciones decorativas |
| 18 | Health check en UI (“ATLAS no disponible”) usando `/api/health` |
| 19 | Eliminar input slug crudo; flujo “Nueva marca” con nombre humano + `sanitizeBrandSlug` server-side |

---

## D. Riesgos UX

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Usuario confunde espacio activo | Alto — datos en marca equivocada | Context chip persistente + confirmación (ya parcial) + color por marca |
| F5 pierde conversación | Alto — abandono | Prioridad #1: `/api/history` |
| Loading opaco 5–30 s | Alto — “¿Se colgó?” | Pasos contextuales + `aria-busy` |
| Placeholders “Próximamente” prolongados | Medio — percepción incompleta | Entregar Conocimiento/Marcas antes de marketing externo |
| Corrección técnica (panel textarea) | Medio — no natural | Flujo 👍/👎 del brief |
| Sin cuenta/usuario | Bajo en v1 local | Ocultar sección Usuario o mostrar “Modo local” honesto |
| Ejemplos que invitan a `memory_search` | Medio | Copy solo lenguaje natural en Home |
| Tono demasiado “ingeniería” residual | Medio | Auditoría copy completa contra glosario §4 |

---

## E. Riesgos técnicos

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Payload CLI expuesto al frontend | Medio — fuga jerga vía `technicalDetails` JSON | Mapper server-side `ChatResponseProduct` (UX doc §5) |
| Estado UI desincronizado de sesión server | Alto | Historial + `session_id`/`turn` en respuestas mapeadas (no crudos) |
| Crear endpoints sin límite en `apps/web` | Medio — deuda API | Documentar cada endpoint; solo wrappers `@atlas/cli` |
| Vanilla TS sin component framework a escala | Medio — mantenibilidad | Extraer Web Components o evaluar Preact (UX doc §5) antes de 3E+ |
| Sesión in-memory | Medio — reinicio proceso pierde chat | Comunicar en UI; no prometer persistencia cloud |
| Inferir actividad falsa | Alto — pérdida confianza | Solo estados determinables (`llm_turns`, `retrieval.selected`) |
| Tocar Frozen para “facilitar UI” | Crítico arquitectura | **Prohibido** — detener y ADR |

---

## F. Gaps de API

### F.1 Endpoints implementables en `apps/web` sin tocar Kernel

| Endpoint propuesto | Fuente CLI/SDK | Esfuerzo | Prioridad |
|--------------------|-----------------|----------|-----------|
| `GET /api/history?workspace=` | `SessionStore` + `session.history` | Bajo | **P0** |
| `GET /api/brands` | `listWorkspaces` + `loadOrCreateBrandProfile` | Medio | P1 |
| `GET /api/brands/:slug` | `loadOrCreateBrandProfile` | Bajo | P1 |
| `POST /api/brands` | `sanitizeBrandSlug` + `loadOrCreateBrandProfile` | Medio | P1 |
| `GET /api/memory/search?query=&workspace=` | `AtlasService.createMemoryClient()` / brand client + `memory.searchContent` | Medio | P1 |
| `GET /api/settings` | Lectura env + `client.llm.isConfigured()` + versión package | Bajo | P2 |
| `GET /api/health` (enriquecido UI) | Existente + opcional doctor-lite | Bajo | P2 |

### F.2 Gaps sin backend — NO inventar UI activa

| Capacidad | Estado | UI permitida |
|-----------|--------|--------------|
| Editar/eliminar memoria | ❌ | Mensaje “consulta only” |
| Streaming respuestas | ❌ SDK | No botón “stream” |
| Proyectos/contextos | ❌ | Oculto o roadmap |
| Multiusuario / auth | ❌ | No login falso |
| Cloud sync | ❌ | No |
| Actividad desde Events kernel | ❌ expuesto | Timeline derivada de turnos web only |
| Settings persistidos (tema, idioma) | ❌ | localStorage UI-only OK; documentar límite |
| Plan / compile / run vía web | ❌ | Fuera alcance v1 producto |

### F.3 Contrato producto recomendado (mapper server)

Alineado con UX doc §5 — implementar en `apps/web/src/presentation/` + respuesta HTTP enriquecida **sin cambiar** `@atlas/cli`:

```typescript
interface ChatResponseProduct {
  assistant_message: string;
  activity: Array<{ label: string; status: 'pending' | 'done' | 'error' }>;
  transparency?: {
    knowledge_consulted?: boolean;
    items_found?: number;
  };
  can_correct: boolean;
  turn: number;
  technical?: ChatTurnPayload; // solo "Ver detalles"
}
```

El frontend world-class **solo renderiza** campos producto por defecto.

---

## G. Design system propuesto

### G.1 Evolución desde tokens actuales

Mantener estética **premium · calmada · sobria** (UX doc §8 + brief §17). Formalizar:

| Categoría | Tokens / componentes |
|-----------|---------------------|
| Color | Existentes + `--color-brand-accent` por marca (opcional) + semantic success/warning/error |
| Typography | `--font-display`, `--font-body`, escala `--text-xs` … `--text-2xl`, `--leading-*` |
| Spacing | Ya `--space-*`; añadir `--layout-page-max`, `--chat-thread-max` |
| Radius / shadow | Existentes; unificar cards y bubbles |
| Motion | `--motion-fast: 150ms`, `--motion-base: 250ms`; respetar `prefers-reduced-motion` |
| Focus | `--focus-ring` consistente en todos los interactivos |

### G.2 Componentes base (nuevos módulos `client/components/`)

| Componente | Uso |
|------------|-----|
| `ContextChip` | Marca activa persistente |
| `ActionCard` | Home acciones |
| `EmptyState` | Todas las vistas vacías |
| `ErrorPanel` | Error + Reintentar + Detalles |
| `LoadingSteps` | Chat actividad |
| `KnowledgeCard` | Conocimiento browse |
| `BrandCard` | Grid marcas |
| `ActivityItem` | Timeline |
| `FeedbackBar` | 👍/👎 post-respuesta |
| `Toast` | Confirmaciones breves |

### G.3 Anti-patrones (evitar)

Gradientes excesivos, glassmorphism, dashboards densos de métricas, iconos sin texto, cards por card sin jerarquía, consola de debug visible.

---

## H. Navegación propuesta

### H.1 IA de información (desktop)

```text
Sidebar
├── ATLAS (logo)
├── Inicio
├── Conversación          ← pantalla principal
├── Marcas
├── Conocimiento          ← renombrar desde "Memoria"
├── Actividad             ← nuevo
├── Configuración
├── ─────────
├── Espacio actual
│   └── [Chip Geeks ▾]
└── Modo local            ← honesto; sin auth falsa
    └── "ATLAS en este equipo"
```

### H.2 Rutas

| Ruta | Vista | Estado |
|------|-------|--------|
| `/` | Home acciones | ⚠️ Mejorar |
| `/chat` | Conversación | ✅ Base |
| `/marcas` | Grid marcas | ❌ |
| `/conocimiento` | Browse read-only | ❌ (hoy `/memoria` placeholder) |
| `/actividad` | Timeline | ❌ |
| `/configuracion` | Settings | ❌ |

**Decisión pendiente (review):** migrar `/memoria` → `/conocimiento` con redirect 301 client-side.

### H.3 Mobile

- Header: logo + context chip + menú  
- Drawer sidebar (ya implementado parcialmente)  
- Conversación: composer fijo inferior; thread scroll  
- Opcional fase posterior: bottom bar Chat · Conocimiento · Más

---

## I. Chat UX

### I.1 Estado actual (fortalezas)

- Input multilínea, placeholder humano, markdown assistant  
- Errores mapeados (`formatUserError`)  
- Corrección contextual en última respuesta (copiar + corregir)  
- Banner aislamiento marca  

### I.2 Gap vs world-class

| Aspecto | Hoy | Objetivo |
|---------|-----|----------|
| Burbujas | Funcionales | Premium: avatares sutiles, spacing, tipografía |
| Actividad | Texto genérico status bar | Pasos ✓ Consultando · ● Preparando |
| Transparencia | No visible | Footer “Consulté N elementos del conocimiento” |
| Error recovery | Reescribir manual | Botón Reintentar (`lastFailedGoal` ya en state) |
| Feedback | Panel corrección | 👍/👎 → flujo guiado |
| Metadata | `technicalDetails` en payload map | Solo acordeón “Ver detalles” |
| Historial | Solo sesión UI | Preload `/api/history` |

### I.3 Reglas de copy chat

- Nunca: Turn, Mode, tool_use, provider, workflow_id en superficie  
- Sí: prosa, listas, preguntas de seguimiento sugeridas (cuando LLM las ofrezca)

---

## J. Brand UX

### J.1 Hoy

- `<select>` workspaces + input texto + botón “Usar”  
- `sanitizeBrandSlug` solo implícito al crear vía CLI paths  
- Confirmación al cambiar con mensajes activos ✅  

### J.2 Objetivo

- **Grid de cards:** nombre, purpose (de `profile.json`), indicador conocimiento (count vía memory search `*` o metadata file)  
- **Crear marca:** modal “Nombre de la empresa” → slug automático → `POST /api/brands`  
- **Detalle marca:** lectura purpose/tone/rules; edición limitada **solo si** endpoint PUT aprobado (v2)  
- **Señal visual:** color/accent por marca en `ContextChip`  

### J.3 Sin inventar

No editor JSON de `profile.json` en v1 unless `PUT /api/brands/:slug/profile` aprobado como capa apps/web.

---

## K. Knowledge UX

### K.1 Presentación

- Título: **Conocimiento**  
- Subtítulo: “Información que ATLAS puede utilizar para ayudarte.”  
- Buscar + resultados cards (snippet, fecha, tipo humanizado)  
- Empty state enseñable + enlace “Cómo funciona”  

### K.2 Backend path

`GET /api/memory/search?query=&workspace=` wrapping:

```text
AtlasService.createMemoryClient() | createBrandClient()
  → client.memory.searchContent({ query })
```

Scope: **solo espacio activo**. Sin edit/delete.

### K.3 Tipos humanizados (mapper)

| recordType técnico | UI |
|--------------------|-----|
| Note | Nota |
| Plan | Plan |
| Feedback / Correction | Corrección |
| default | Registro |

---

## L. Activity UX

### L.1 Realidad backend

No hay feed de `@atlas/events` expuesto a web. **No inventar** CompilerCompletedEvent en UI.

### L.2 Fuente honesta v1

Timeline derivada en `apps/web` de:

- Turnos chat completados (user message + assistant summary)  
- Correcciones registradas (`/api/correct` → `recorded`)  
- Opcional: entradas “Consultó conocimiento” cuando `retrieval.selected > 0`  

Persistencia: in-memory por proceso o append-only log file en `.atlas/web-activity.json` — **requiere decisión**; mínimo viable: sesión actual only.

### L.3 Copy timeline

- “ATLAS consultó información sobre {tema}.”  
- “ATLAS preparó una respuesta.”  
- “Corregiste una respuesta.”  

---

## M. Feedback UX

### M.1 Hoy

Panel corrección manual + `formatCorrectionStatus` ✅  

### M.2 Objetivo (brief §13)

```text
Respuesta assistant
[👍 Útil] [👎 No fue útil]

Si 👎:
  ¿Qué estuvo mal?
  ( ) Información incorrecta
  ( ) No entendió mi solicitud
  ( ) Faltó información
  ( ) Otro
  → textarea opcional
  → POST /api/correct (mismo backend)
```

Mapear categorías a texto de corrección estructurado para `recordFeedback`.

---

## N. Accessibility

### N.1 Presente

- `lang="es"`, landmarks parciales, `aria-live` en thread, `role="status"`, touch targets 44px en toggle, contraste dark/light tokens  

### N.2 Gap WCAG 2.2 AA

| Requisito | Acción |
|-----------|--------|
| Focus visible | `:focus-visible` en todos los controles |
| Skip link | “Saltar al contenido” |
| `aria-busy` | Durante fetch chat |
| Anuncio errores | Live region dedicada errores |
| Heading hierarchy | Un `h1` por vista |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` |
| Form labels | Auditar todos los inputs |
| Color alone | Iconos + texto en estados |

Target: checklist §R + herramienta axe manual antes de PASS world-class.

---

## O. Responsive

### O.1 Presente

- Grid shell, sidebar drawer `@media (min-width: 900px)`, nav inline desktop  
- Chat composer wrap  

### O.2 Mejorar

- Composer sticky bottom mobile  
- Cards grid marcas: 1 col mobile, 2 tablet, 3 desktop  
- Conocimiento: lista full-width mobile  
- Reducir header chrome en pantallas <480px  
- Probar iPad portrait + Android phone  

---

## P. i18n

### P.1 Presente

- `src/i18n/es.ts` + `t()` con interpolación  
- Glosario humano parcial  

### P.2 Evolución

```text
src/i18n/
├── index.ts
├── es.ts              # default
├── es-EC.ts           # futuro
├── es-CO.ts           # futuro
└── keys.ts            # tipado TranslationKey
```

Reglas:

- Cero strings críticos en TSX/HTML templates  
- Microcopy latino neutro (“tú”, no “vos” por default)  
- Pluralización preparada (`tCount()`)  

Renombrar keys: `nav.memory` → `nav.knowledge` (“Conocimiento”).

---

## Q. Performance

| Área | Estado | Acción |
|------|--------|--------|
| Bundle | ~89 KB JS gzip | OK para v1 |
| Markdown parse | Sync en render | Debounce o cache por message id |
| History preload | N/A | Una fetch al entrar chat |
| Re-renders | Full innerHTML pages | Migrar a DOM diff o components |
| Fonts | System stack | OK; opcional variable font later |
| Lighthouse | No medido | Target ≥90 Performance/A11y en `/chat` |

Perceived performance > spinners: usar `LoadingSteps` inmediatamente al enviar.

---

## R. QA checklist

### R.1 Funcional

- [ ] Primera visita: acciones claras <10 s  
- [ ] Chat multi-turno sin terminal  
- [ ] F5 restaura historial (post `/api/history`)  
- [ ] Cambio marca con confirmación + aislamiento E5  
- [ ] Corrección vía 👍/👎 y vía panel  
- [ ] Conocimiento search read-only scoped  
- [ ] Marcas grid + crear marca  
- [ ] Errores 429/tool/connection amigables + Reintentar  
- [ ] No API keys / paths en UI  

### R.2 Visual

- [ ] Jerarquía tipográfica consistente  
- [ ] Spacing 4/8/12/16/24  
- [ ] Empty states en todas las vistas  
- [ ] Context chip marca siempre visible  

### R.3 A11y

- [ ] Navegación teclado completa  
- [ ] axe DevTools 0 critical  
- [ ] Contraste AA  

### R.4 Regresión

- [ ] `pnpm build` / `typecheck` / `lint` / `@atlas/web test`  
- [ ] 7 tests API server  
- [ ] E3/E5 manual web  

---

## S. Fases de implementación

Alineado con brief §28, extendiendo Fase 3 ya entregada (3A parcial):

| Fase | Entrega | Dependencias API | Esfuerzo |
|------|---------|------------------|----------|
| **3A** ✅ | Foundation + shell + i18n + chat base | Existente | Hecho |
| **3B** | Home acciones + ejemplos + saludo | Ninguna | S |
| **3C** | Chat premium: retry, steps, transparency, feedback bar | Mapper producto opcional | M |
| **3D** | `/api/history` + reload | P0 endpoint | S |
| **3E** | Marcas grid + CRUD mínimo create | `/api/brands` | M |
| **3F** | Conocimiento browse | `/api/memory/search` | M |
| **3G** | Actividad timeline (sesión) | Log UI o derivado turnos | M |
| **3H** | Configuración read-only | `/api/settings` | S |
| **3I** | Responsive + WCAG pass | Ninguna | M |
| **3J** | Polish + QA manual + docs | Ninguna | S |

Cada fase: implement → test → build → lint → typecheck → doc delta → report.

---

## Hallazgos

1. **La arquitectura web es sólida** — el salto Fase 3 1–4 desbloquea evolución sin tocar Kernel.  
2. **El gap producto es de completitud y polish**, no de integración backend core.  
3. **El bloqueador #1 de confianza diaria** sigue siendo historial al recargar (documentado, no implementado).  
4. **Tres pantallas clave están vacías** (Marcas, Conocimiento, Configuración) — inaceptable para marketing “world-class”.  
5. **La taxonomía del brief y la implementación divergen** (Memoria vs Conocimiento; falta Actividad).  
6. **Transparencia y actividad deben ser honestas** — inferir solo de datos reales del payload.  
7. **Feedback natural requiere UX nueva**, no nuevo backend.  
8. **Endpoints delgados en apps/web son suficientes** para Conocimiento y Marcas — no requieren ADR Kernel.

---

## Recomendaciones

1. **Aprobar P0:** `GET /api/history` — implementar antes de cualquier polish visual.  
2. **Aprobar contratos delgados:** `/api/brands`, `/api/memory/search`, `/api/settings` en `apps/web` only.  
3. **Renombrar navegación** a Conocimiento + añadir Actividad.  
4. **Implementar mapper `ChatResponseProduct`** en server o presentation — frontend deja de consumir `ChatTurnPayload` crudo.  
5. **Ejecutar fases 3B→3J en orden**; no mega-diff.  
6. **QA manual E3/E5** al cierre de 3C y 3F.  
7. **No declarar world-class PASS** hasta checklist §R completo.  
8. **Mantener CLI** como herramienta avanzada — Configuración Avanzado puede enlazar a docs operador.

---

## Riesgos (consolidado)

| Severidad | Riesgo |
|-----------|--------|
| Alta | Historial perdido en F5 |
| Alta | Prometer capacidades sin backend |
| Alta | Modificar Frozen para shortcuts UI |
| Media | Actividad inventada |
| Media | Scope creep (proyectos, streaming, auth) |
| Baja | Vanilla TS mantenibilidad — evaluar Preact en 3J si DOM complexity crece |

---

## Archivos que deberían cambiar

**Solo `apps/web/`** (+ docs/releases):

```text
apps/web/src/server.ts                    # endpoints delgados
apps/web/src/presentation/*               # mappers producto
apps/web/src/client/components/*          # design system
apps/web/src/client/pages/*               # Home, Chat, Marcas, Conocimiento, Actividad, Settings
apps/web/src/client/api/client.ts         # nuevos fetch wrappers
apps/web/src/i18n/es.ts                   # copy world-class
apps/web/src/client/styles/*              # design system tokens + components
apps/web/tests/*                          # cobertura nuevas vistas/endpoints
releases/WEB_UI_PHASE_3_*                 # informes por sub-fase
VERSION.md                                # registro entregas
docs/WEB_UI_PRODUCT_UX.md                 # estado ítems (no rediseño)
```

---

## Archivos que NO deben cambiar

```text
packages/core/**
packages/compiler/**
packages/runtime/**
packages/memory/**
packages/retrieval/**
packages/events/**
packages/sdk/**          # salvo necesidad futura explícita + ADR
packages/cli/**          # salvo export ya existente consumido por web
```

Si UI “necesita” cambio SDK → **detener**, documentar gap, proponer ADR.

---

## Propuesta de implementación incremental

```text
Semana 1: 3D (history) + 3B (home) + 3C parcial (retry, steps)
Semana 2: 3E (marcas) + mapper ChatResponseProduct
Semana 3: 3F (conocimiento) + 3G (actividad sesión)
Semana 4: 3H (settings) + 3I (a11y/responsive) + 3J (polish + QA)
```

Cada PR/shippable: una fase, tests verdes, doc delta.

---

## Tests necesarios

| Área | Tests |
|------|-------|
| `/api/history` | Integración server: chat → history orden |
| `/api/memory/search` | Integración con fixture memory.json |
| `/api/brands` | list + create slug sanitization |
| Presentation | mapChatResponseProduct, activity steps, transparency |
| i18n | keys Conocimiento, Actividad, feedback |
| Chat UI | retry, feedback bar, loading steps (jsdom) |
| Shell | context chip, nav Actividad |
| Regresión | 26 tests existentes + API 7 |

---

## Criterios de aceptación (world-class PASS)

Usuario **no técnico** en **LatAm/España**, **solo navegador**:

1. Entiende qué es ATLAS y qué hacer en <10 s (Home).  
2. Trabaja siempre con marca visible y sin confusiones.  
3. Conversa en lenguaje natural sin jerga técnica visible.  
4. Ve actividad/loading que genera confianza.  
5. Recibe respuestas markdown legibles con transparencia opcional.  
6. Corrige con flujo natural (👍/👎).  
7. Consulta Conocimiento read-only de su marca.  
8. Gestiona Marcas sin slug manual ni JSON.  
9. Recupera historial tras F5 (mismo proceso server).  
10. Se recupera de errores con Reintentar.  
11. Navega en mobile/desktop con teclado.  
12. No ve secrets, paths ni stack traces en superficie.

Pregunta final (brief §29):

> “¿Una PYME latinoamericana usaría esto todos los días sin abrir la terminal?”

Solo **Sí** → VEREDICTO implementation PASS.

---

## VEREDICTO

### Documento de revisión

**NEEDS REVIEW**

Motivos:

1. Divergencia taxonomía (Memoria/Actividad/Usuario) requiere decisión producto.  
2. Contratos API delgados (`/api/history`, `/api/brands`, `/api/memory/search`) requieren aprobación explícita antes de implementación.  
3. Actividad timeline necesita decisión de persistencia (sesión vs archivo local).  
4. El slice 3A entregado es base válida, pero **no cumple** aún el brief world-class completo.

### Readiness para codificar siguiente fase

**READY** para iniciar **Fase 3D (`/api/history`) + 3B (Home)** inmediatamente tras aprobación owner — sin tocar Kernel, sin ADR.

---

*Próximo paso autorizado tras review: aprobar P0 endpoints y comenzar Fase 3D + 3B. Sin commit hasta cierre de hito acordado.*
