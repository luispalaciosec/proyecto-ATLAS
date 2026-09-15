# ATLAS Web UI — Fase 3G.4 — Auditoría Home Polish + Coherencia de Producto

**Fecha:** 2026-08-09  
**Alcance:** Auditoría pre-implementación — **sin código de producto**  
**Prerequisitos verificados:** 3G.3 PASS (selector de Marca unificado, `loadBrandCatalog()`, 108/108 tests `@atlas/web`)

---

## 1. Objetivo de esta auditoría

Evaluar si la Home y el resto de la Web UI cumplen el criterio de producto 3G.4: que un usuario de pyme en Latinoamérica o España entienda en pocos segundos dónde está, con qué Marca trabaja, qué puede hacer y cómo continuar — **sin dashboard artificial ni jerga técnica**.

Esta auditoría documenta el estado actual, los gaps frente al spec 3G.4 y una propuesta acotada de implementación. **No se modificó código.**

---

## 2. Prueba fundamental de UX (≤10 segundos)

> *Si una persona que nunca ha usado ATLAS entra por primera vez, ¿entiende qué puede hacer aquí y cuál es el siguiente paso en menos de 10 segundos?*

> *¿Responde visualmente: «ATLAS es el asistente de trabajo de mi empresa. Aquí puedo preguntarle cosas, consultar conocimiento y trabajar dentro del contexto de una Marca»?*

### Veredicto actual: **NO CUMPLE** (parcial)

| Señal esperada | Estado actual | Evidencia |
|----------------|---------------|-----------|
| Posicionamiento claro de ATLAS | **Parcial OK** | Hero con `app.productPhrase` + `productSubtitle` |
| Marca activa obvia al entrar | **Parcial** | Existe `context-chip`, pero **no** como primera zona; label «Marca activa» en lugar de «Trabajando con» |
| Qué puedo hacer | **Parcial** | Cuatro acciones visibles, pero **sin jerarquía** primaria/secundaria |
| Cómo empezar | **OK** | Acción Chat + ejemplos clicables |
| Qué hice recientemente | **Incompleto** | Solo actividad (`GET /api/activity`); **no hay** sección de conversaciones (`GET /api/history`) |
| Cómo continuar | **Falta** | No existe «Continúa donde lo dejaste» |
| Cambiar Marca sin miedo | **Parcial** | Banner de aislamiento + shell 3G.3; falta CTA explícito «Cambiar de Marca» en Home |

**Conclusión:** La Home ya es accionable y no es un dashboard de KPIs falsos, pero **no alcanza** el estándar 3G.4: jerarquía débil, contexto de Marca no prioritario, historial ausente y copy desalineado en CTAs clave.

---

## 3. Estado actual por área (evidencia en código)

### 3.1 Home (`apps/web/src/client/pages/home.ts`)

| Aspecto | Estado actual |
|---------|----------------|
| Estructura | Hero → `context-chip` → `banner` → acciones (4 cards) → ejemplos → actividad reciente |
| Contexto Marca | `resolveBrandDisplayName()` + label `workspace.label` («Marca activa») |
| Hero | `app.productPhrase` + `app.productSubtitle` — alineado con posicionamiento aprobado |
| Acciones | 4× `.action-card` idénticas en peso visual; IDs `#home-action-chat`, `-knowledge`, `-brands`, `-activity` |
| Ejemplos | 4 chips → `setRoute('/chat')` + `patchChatComposer()` local (DOM directo) |
| Historial | **No implementado** — no llama `fetchHistory()` |
| Actividad | `fetchActivity(slug, { limit: 3 })` + `renderActivityPreview()` |
| Conocimiento | **No hay** bloque contextual en Home |
| CTA cambiar marca | Solo acción «Trabajar con una marca» → `/marcas`; **no** «Cambiar de Marca» |
| Errores async | `loadRecentActivity` — `catch` vacío, mantiene empty state sin retry |
| Loading async | Sin skeleton/spinner en sección actividad |
| Re-render marca | `subscribe()` → `renderCurrentRoute()` → `renderHome()` completo al cambiar estado |
| `refreshHomeView` | **No existe** (a diferencia de `refreshActivityView`, `refreshKnowledgeView`, etc.) |

**Archivo clave:** `home.ts` líneas 8–114.

### 3.2 Shell y selector de Marca (`shell.ts`, `workspace-switch.ts`, `brand-catalog.ts`)

| Aspecto | Estado (post 3G.3) |
|---------|---------------------|
| Fuente única | `loadBrandCatalog()` en boot → `GET /api/brands` |
| Selector | Popover accesible con `role="listbox"`, footer «Ver todas las marcas» |
| Nombres | `resolveBrandDisplayName()` desde `BrandProduct.name` |
| Cambio Marca | Modal accesible; `pendingChatDraft` gestionado al cambiar |
| Coherencia Home | Mismo label «Marca activa» en chip Home y shell — **consistente entre sí**, pero **no** con copy objetivo 3G.4 («Trabajando con») |

**Conclusión:** El shell cumple 3G.3. La Home debe **reutilizar** el mismo vocabulario de Marca sin duplicar lógica.

### 3.3 Chat (`apps/web/src/client/pages/chat.ts`)

| Aspecto | Estado |
|---------|--------|
| Historial | `fetchHistory()` en preload; títulos humanos vía mensajes UI |
| Contexto | Subtítulo `workspace.active` + banner aislamiento |
| Draft | `applyPendingChatDraftToComposer()` vía `setPendingChatDraft` + `consumePendingChatDraft` |
| Integración Home | Ejemplos Home **no usan** `setPendingChatDraft` — patrón distinto a Conocimiento/Actividad |
| Copy técnico | `chat.deterministicSuccess` menciona «automáticamente» — aceptable; no visible en Home |

**Helper disponible no usado en Home:** `deriveRecentConversationTitle()` en `lib/history.ts`.

### 3.4 Conocimiento (`apps/web/src/client/pages/knowledge.ts`)

| Aspecto | Estado |
|---------|--------|
| Patrón contexto | Mismo `context-chip` + `banner` que Home/Actividad |
| Draft a Chat | `openChatWithPrompt()` → `setPendingChatDraft` + `setRoute('/chat')` — **patrón correcto** |
| Estados | loading / empty / error con retry — **referencia** para Home |
| Entrada en Home | **Ausente** — spec pide bloque estático contextual sin métricas inventadas |

### 3.5 Actividad (`apps/web/src/client/pages/activity.ts`)

| Aspecto | Estado |
|---------|--------|
| API | `GET /api/activity` con filtros y retry en página completa |
| Preview Home | `renderActivityPreview()` — máx. 3 items, botón «Ver toda la actividad» |
| Empty Home | `activity.recentEmpty` — copy distinto al spec (`emptyTitle` + `emptyBody` + CTA «Ver actividad») |
| Error Home | Silencioso — página Actividad sí tiene error + retry |
| Copy | `activity.subtitle` usa «espacio de trabajo» (jerga residual) |

### 3.6 Navegación (`shell.ts`, `app.ts`)

| Ruta | Label nav | CTA Home equivalente | Coherencia |
|------|-----------|------------------------|------------|
| `/` | Inicio | — | OK |
| `/chat` | Conversación | «Preguntar a ATLAS» | **Desalineado** — spec «Hablar con ATLAS» |
| `/conocimiento` | Conocimiento | «Consultar conocimiento» | OK |
| `/marcas` | Marcas | «Trabajar con una marca» | Parcial — falta «Cambiar de Marca» |
| `/actividad` | Actividad | «Ver actividad» | OK |

Nav orden: Home → Chat → Conocimiento → Actividad → Marcas → Configuración — lógica de producto razonable.

### 3.7 i18n (`apps/web/src/i18n/es.ts`)

**Claves Home existentes pero subutilizadas:**

| Clave | Valor | Uso actual |
|-------|-------|------------|
| `home.recentTitle` | «Conversaciones recientes» | **No usada** en `home.ts` |
| `home.recentEmpty` | «Todavía no hay conversaciones…» | **No usada** |
| `home.recentContinue` | «Continuar conversación» | **No usada** |
| `home.startChat` | «Preguntar a ATLAS» | Placeholder settings; spec «Hablar con ATLAS» |
| `home.where` | «Marca activa» | **No referenciada** en Home |

**Sección actividad en Home usa claves de `activity.*`**, no las de conversaciones — indica intención previa no completada.

### 3.8 Estilos Home (`apps/web/src/client/styles/app.css`)

| Aspecto | Estado |
|---------|--------|
| Jerarquía visual acciones | Todas `.action-card` iguales — sin `.action-card--primary` |
| Grid responsive | 1 col mobile; 2 cols desde 640px |
| Targets táctiles | `min-height: 44px` en action-card y example-chip |
| Tokens | Usa variables existentes — OK |
| Hover | Acciones dependen de `:hover` para feedback secundario — no bloquea mobile |
| `prefers-reduced-motion` | **No presente** en `app.css` (limitación heredada) |

### 3.9 Tests (`apps/web/tests/client/home.test.ts`)

| Caso | Cubierto |
|------|----------|
| Hero + 4 acciones | Sí |
| Marca activa (Geeks) | Sí (texto «Marca activa») |
| Actividad con items | Sí |
| Historial / «Continúa donde lo dejaste» | **No** — mock `fetchHistory` existe pero Home no lo invoca |
| Empty states conversación | **No** |
| Error activity + retry | **No** |
| Draft ejemplo → Chat sin auto-envío | **No** |
| Jerarquía primaria Chat | **No** |
| Cambio Marca re-render | **No** |
| Bloque Conocimiento | **No** |

**Total tests Home:** 3 — insuficiente para spec 3G.4 (spec pide ~15 escenarios).

---

## 4. Gaps vs spec 3G.4 (priorizados)

### P0 — Funcionalidad ausente o incorrecta

1. **Sin sección «Continúa donde lo dejaste»** — no consume `GET /api/history`; claves i18n preparadas pero no cableadas.
2. **Jerarquía de acciones** — las cuatro cards son visualmente equivalentes; spec exige primaria (Chat) + secundarias.
3. **Contexto Marca no es la primera zona** — hero precede al chip; spec pide «Trabajando con: {nombre}» como ancla inicial.
4. **Ejemplos no usan `pendingChatDraft`** — riesgo de inconsistencia con cambio de Marca y patrón Conocimiento/Actividad.

### P1 — Coherencia de producto y copy

5. **CTA «Hablar con ATLAS»** vs actual «Preguntar a ATLAS» / `home.startChat`.
6. **Falta CTA explícito «Cambiar de Marca»** → `/marcas` (distinto de «Trabajar con una Marca» como acción secundaria).
7. **Triple redundancia contexto** — hero + chip + banner repiten aislamiento; densidad alta para usuario nuevo.
8. **Sin bloque Conocimiento** contextual (copy + CTA, sin contadores falsos).
9. **Empty/error actividad en Home** — copy y retry no alineados con página Actividad ni spec.

### P2 — Robustez y arquitectura UI

10. **Sin `refreshHomeView()`** — re-render completo vía `subscribe()` funciona pero impide refresh parcial y complica tests de estado async.
11. **Errores silenciosos** — `loadRecentActivity` traga fallos; Home debe seguir siendo utilizable **con** feedback humano y retry.
12. **Sin loading visible** en secciones async de Home.

### P3 — Pulido y tests

13. **Copy residual** — «espacio de trabajo», «espacio principal» en i18n no-Home visible indirectamente.
14. **Tests insuficientes** — ver §3.9.
15. **`home.test.ts` mock engañoso** — importa `fetchHistory` que producción no usa.

---

## 5. Copy review (Home y superficies relacionadas)

| Término técnico / desalineado | Ubicación actual | Copy objetivo 3G.4 | ¿Filtrado a UI Home? |
|------------------------------|------------------|--------------------|----------------------|
| workspace | i18n interno, TS | Marca | No en Home visible |
| slug | código TS | eliminar | No |
| session | código TS | Conversación | No |
| memory | — | Conocimiento | No |
| LLM | `errors.llmRequired`, chat | IA | No en Home |
| deterministic | `chat.deterministicSuccess` | Respuesta directa | No en Home |
| espacio de trabajo | `activity.subtitle` | (reformular) | No en Home directo |
| espacio principal | `workspace.generalHint` | lenguaje humano | Shell/popover |
| Marca activa | chip Home/shell | **Trabajando con** (spec) | **Sí — desalineado** |
| Preguntar a ATLAS | `home.actionAskTitle`, `startChat` | **Hablar con ATLAS** | **Sí — desalineado** |
| Ver toda la actividad | `activity.recentViewAll` | **Ver actividad** (spec empty CTA) | Parcial |

**Hero principal:** no contiene jerga prohibida (RAG, LLM, agentic, etc.) — **OK**.

**Ejemplos:** tono pyme razonable; revisar alineación fina con spec:

| Actual | Spec conceptual |
|--------|-----------------|
| «¿Qué sabemos de nuestro cliente Ana García?» | «¿Qué sabes sobre este cliente?» |
| «Resume las últimas decisiones de este proyecto.» | «Resume lo más importante de este proyecto.» |
| «¿Qué información tenemos sobre la campaña actual?» | (no en spec — OK mantener si suena natural) |
| «¿Qué debería hacer hoy con este cliente?» | «¿Qué debería hacer hoy?» |

---

## 6. Evaluación por principio de Home (spec Parte B)

| # | Principio spec | Cumple | Notas |
|---|----------------|--------|-------|
| 1 | Contexto actual «Trabajando con» | **No** | Usa «Marca activa»; hero va antes |
| 2 | Hero orientado a acción | **Parcial** | Frase aprobada OK; subtítulo algo largo |
| 3 | Acciones con jerarquía | **No** | 4 cards equivalentes |
| 4 | Ejemplos clicables sin auto-envío | **Sí** | Solo prellenan composer |
| 5 | Conversación reciente real | **No** | Ausente |
| 6 | Actividad reciente real (máx. 3) | **Parcial** | Datos reales OK; empty/CTA/copy incompletos |
| 7 | Entrada Conocimiento sin métricas falsas | **No** | Ausente |
| 8 | Reacción cambio Marca | **Parcial** | Re-render vía subscribe; falta validar historial/actividad por marca en UI |
| 9 | CTA «Cambiar de Marca» | **No** | Solo ruta genérica a `/marcas` |
| 10 | No dashboard falso | **Sí** | Sin KPIs inventados |

---

## 7. Responsive (evaluación estática)

| Breakpoint | Home actual | Riesgo |
|------------|-------------|--------|
| 390px mobile | Columna única, chips apilados, action-grid 1 col | Bajo — targets ≥44px |
| 768px tablet | 2 cols acciones desde 640px | Bajo |
| 1024px laptop | Layout shell + main estándar | Bajo |
| 1280px+ desktop | Sin max-width específico Home — hereda `.page` | Aceptable |

**Dependencia hover:** feedback en `.action-card:hover` — no es requisito para usar; focus-visible presente.

---

## 8. Accesibilidad (evaluación estática)

| Criterio WCAG 2.2 AA | Home actual |
|----------------------|-------------|
| Landmarks | `<section class="page">`, `<main id="main">` en shell |
| Headings | `h1` hero, `h2` por sección — orden lógico |
| Botones reales | Acciones y ejemplos son `<button type="button">` |
| Focus visible | `.action-card:focus-visible`, tokens accent |
| aria-label contexto | `context-chip` con `workspace.active` |
| aria-live async | **Ausente** en carga actividad/historial Home |
| Contraste | Tokens design system — asumido OK (sin regresión 3G) |
| reduced motion | No implementado globalmente |

---

## 9. Arquitectura — restricciones y reutilización

**No crear nueva capa de datos.** Implementación debe componer:

| Recurso existente | Uso propuesto en 3G.4 |
|-------------------|----------------------|
| `loadBrandCatalog()` / `resolveBrandDisplayName()` | Contexto «Trabajando con {name}» |
| `fetchHistory(slug)` | Sección «Continúa donde lo dejaste» |
| `deriveRecentConversationTitle()` | Título humano por conversación |
| `fetchActivity(slug, { limit: 3 })` | Actividad reciente (ya usado) |
| `renderActivityPreview()` | Reutilizar o extender empty/error |
| `setPendingChatDraft()` + `applyPendingChatDraftToComposer()` | Ejemplos Home |
| `setRoute()` | Navegación CTAs |
| Bloque Conocimiento | Copy estático + CTA — **sin** nueva API salvo dato real futuro |

**Prohibido:** leer `.atlas` desde cliente, duplicar SessionStore, inventar endpoints o métricas.

**Patrón recomendado:** `refreshHomeView()` análogo a otras páginas, pintando sub-secciones async sin reemplazar todo el DOM en cada `patchState` menor (opcional — evaluar en implementación).

---

## 10. Propuesta de implementación (Parte C — borrador para aprobación)

### 10.1 Reordenar y simplificar jerarquía Home

```text
[ eyebrow ATLAS ]
Trabajando con: General          ← primera zona, prominente
[ hero: productPhrase + frase corta humana ]
[ acción primaria: Hablar con ATLAS → /chat ]
[ acciones secundarias: Conocimiento | Marcas | Actividad ]
[ ejemplos clicables ]
[ Continúa donde lo dejaste ← fetchHistory ]
[ Actividad reciente ← fetchActivity limit 3 ]
[ Conocimiento — bloque contextual + CTA ]
[ Cambiar de Marca → /marcas ]
```

**Reducir** banner de aislamiento en Home (mantener en Chat/Conocimiento/Actividad si aporta) para bajar densidad.

### 10.2 CSS

- `.action-card--primary` o equivalente para Chat.
- Clases para zona «Trabajando con» (p. ej. `.home-context`).
- Empty states con título + cuerpo + CTA botón (patrón Actividad).
- Sin paleta paralela.

### 10.3 i18n

Nuevas/ajustadas claves sugeridas:

- `home.workingWith` → «Trabajando con»
- `home.continueTitle` → «Continúa donde lo dejaste»
- Renombrar CTAs a «Hablar con ATLAS», «Cambiar de Marca», «Ver actividad»
- Ajustar ejemplos según tabla §5

### 10.4 Tests (`home.test.ts`)

Cubrir escenarios del spec: General/Geeks, historial real/empty, actividad real/empty, draft sin auto-envío, errores parciales con retry, clases jerárquicas (sin asserts frágiles de píxeles).

---

## 11. Estrategia de regresión UX (post-implementación)

Checklist smoke manual del spec (S1–S15) + quality gate:

```bash
pnpm --filter @atlas/web test
pnpm --filter @atlas/web typecheck
pnpm --filter @atlas/web lint
pnpm --filter @atlas/web build
pnpm test && pnpm build && pnpm typecheck && pnpm lint
pnpm atlas doctor
git diff --name-only  # governance: NO packages Frozen
```

---

## 12. Governance

Auditoría realizada **sin cambios** en el repositorio. Al implementar, verificar que `git diff --name-only` no incluya:

`packages/core`, `compiler`, `runtime`, `memory`, `retrieval`, `events`, `intelligence`, `sdk`, `cli`, `llm`.

---

## 13. Decisiones pendientes (requieren aprobación antes de Parte C)

| # | Decisión | Opciones | Recomendación auditoría |
|---|----------|----------|-------------------------|
| D1 | ¿Retirar `banner` de aislamiento en Home? | Mantener / Quitar / Condicional | **Quitar en Home** — shell + chip «Trabajando con» suficientes; reduce ruido |
| D2 | Label contexto | «Marca activa» vs «Trabajando con» | **«Trabajando con»** en Home; evaluar alinear shell en mismo release o dejar shell con «Marca activa» + Home distinto |
| D3 | Historial en Home | Una tarjeta vs lista | **Una entrada** (última conversación con título humano) + enlace Chat; si hay varios mensajes, título desde `deriveRecentConversationTitle` |
| D4 | Bloque Conocimiento | Estático vs condicional API | **Estático** con CTA — sin contadores hasta API semántica estable |
| D5 | `refreshHomeView` | Re-render completo vs parcial | **Parcial preferido** para async; re-render completo aceptable si tests PASS y no hay flicker |

---

## 14. Veredicto de auditoría

| Criterio | Estado |
|----------|--------|
| Prueba 10 segundos | **NO CUMPLE** |
| Principios Home 1–10 | **4/10 completos**, 4 parciales, 2 ausentes |
| Sin dashboard falso | **CUMPLE** |
| Datos reales only | **Parcial** — actividad OK; historial no mostrado |
| Coherencia Marca 3G.3 | **CUMPLE** en datos; copy contexto desalineado |
| Tests 3G.4 | **NO LISTO** |
| WCAG base | **Mantenible** — mejorar aria-live en async |
| Responsive | **Aceptable** base |

### Veredicto global 3G.4: **NO PASS — IMPLEMENTACIÓN REQUERIDA**

Tras implementación, si tests están verdes pero la jerarquía visual no alcanza estándar: declarar **NEEDS UX REVIEW**, no PASS.

---

## 15. Siguiente paso

**DETENER aquí.**

Esperar **aprobación de esta auditoría** antes de implementar Parte C.

Tras aprobación:

1. Implementar según §10 respetando principios Parte B del spec.
2. Ampliar tests §10.4.
3. Ejecutar quality + governance gate.
4. Smoke manual S1–S15.
5. Crear `releases/WEB_UI_PHASE_3G4_IMPLEMENTATION.md`.
6. Actualizar `VERSION.md` y `docs/README.md`.

---

## 16. Resumen ejecutivo

La Home actual es funcional y evita métricas falsas, pero **no cumple** el mandato 3G.4 de centro de trabajo claro: falta historial real, jerarquía de acciones, copy «Trabajando con» / «Hablar con ATLAS», bloque Conocimiento, CTA «Cambiar de Marca» y manejo humano de errores async. El shell de Marca (3G.3) y las APIs `history`/`activity` ya existen; la implementación debe **componer** esos building blocks sin tocar Kernel ni paquetes Frozen, alineando Home con Conocimiento y Actividad en patrones de draft, empty states y retry.
