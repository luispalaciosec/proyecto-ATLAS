# ATLAS Web UI — Fase 3G.3 — Auditoría del selector de Marca (Shell)

**Fecha:** 2026-08-09  
**Alcance:** Auditoría pre-implementación — **sin código de producto**  
**Prerequisitos verificados:** 3G.1 (API), 3G.2 (UI `/marcas`), 100/100 tests `@atlas/web`

---

## 1. Objetivo de esta auditoría

Identificar el estado actual del selector de Marca en el App Shell, compararlo con la experiencia `/marcas`, detectar duplicaciones e inconsistencias, y definir una propuesta acotada para 3G.3 **sin modificar paquetes Frozen/Certified ni la arquitectura del Kernel**.

---

## 2. Estado actual (evidencia en código)

### 2.1 Shell header (`apps/web/src/client/components/shell.ts`)

| Aspecto | Estado actual |
|---------|----------------|
| Contenedor | `.workspace-switcher` con label `t('workspace.label')` → **«Marca activa»** (copy OK) |
| Selector | `<select id="workspace-select">` nativo |
| Creación | `<input id="workspace-new">` + botón **«Usar»** — **sigue presente** |
| Población | `updateShellChrome()` itera `state.workspaces` (slugs internos) |
| Etiquetas visibles | `workspaceDisplayName(slug)` — heurística cliente, no perfil API |
| Eventos | `change` → `onWorkspaceSelect`; botón Usar → `onWorkspaceCreate(raw input)` |

**Conclusión:** El shell refleja el diseño **pre-3G**, no las decisiones de producto de 3G.2/3G.3.

### 2.2 Bootstrap de la app (`apps/web/src/client/app.ts`)

```text
mountApp()
  → fetchWorkspaces()     // GET /api/workspaces  (solo slugs)
  → setWorkspaces(slugs)
  → bindShellEvents({ onWorkspaceSelect, onWorkspaceCreate })
```

- **No** llama a `GET /api/brands` en arranque.
- La lista del shell y la de `/marcas` **no comparten la misma fuente** al iniciar la sesión.

### 2.3 Página `/marcas` (`apps/web/src/client/pages/brands.ts`)

| Aspecto | Estado actual |
|---------|----------------|
| Fuente | `fetchBrands(activeWorkspace)` → **GET /api/brands** |
| Modelo | `BrandProduct[]` con `id`, `name`, `description`, `isActive`, métricas reales |
| Sincronización shell | Tras cargar, `setWorkspaces(payload.brands.map(b => b.id))` |
| Cambio de marca | `switchWorkspace(brandId)` vía `lib/workspace-switch.ts` |
| Creación | Modal + `POST /api/brands` (canónico server-side) |

**Conclusión:** `/marcas` es la experiencia correcta; el shell queda desalineado hasta que el usuario visita `/marcas`.

### 2.4 Cambio de marca (`apps/web/src/client/lib/workspace-switch.ts`)

| Comportamiento | Implementación |
|----------------|----------------|
| Confirmación | `window.confirm` **solo si** `chatMessages.length > 0` |
| Copy confirmación | `workspace.switchConfirm` — menciona conversación, no el modelo de producto 3G.3 |
| Feedback post-cambio | `brands.switchSuccess` / `brands.switchSuccessGeneral` en `statusText` |
| Ruta | **Permanece en la ruta actual** (`renderCurrentRouteRef`) salvo `/chat` (recarga historial) |
| Reload completo | **No** hay `location.reload()` |
| Chat | `setActiveWorkspace(..., { resetChat: true })` — limpia mensajes visibles |
| Draft | `pendingChatDraft` **no se limpia** al cambiar marca |
| Lista ad-hoc | Si slug no está en `workspaces`, lo añade sin validar contra API |

### 2.5 Estado global (`apps/web/src/client/state/app-state.ts`)

| Campo | Uso |
|-------|-----|
| `activeWorkspace` | Slug interno (`default` = General); persistido en `localStorage` key `atlas.activeWorkspace` |
| `workspaces` | `string[]` de slugs; inicial `['default']`; actualizado por `/api/workspaces` o `/marcas` |
| Validación boot | **Ninguna** — `readStoredWorkspace()` confía ciegamente en localStorage |
| Marcas enriquecidas | **No existe** cache de `BrandProduct` en app-state |

### 2.6 API cliente (`apps/web/src/client/api/client.ts`)

| Endpoint | Consumidor |
|----------|------------|
| `GET /api/workspaces` | `mountApp()` únicamente |
| `GET /api/brands` | `/marcas` |
| `POST /api/brands` | Modal crear en `/marcas` |

Duplicación funcional: `/api/workspaces` es un subconjunto técnico de lo que ya devuelve `/api/brands`.

### 2.7 Nombres humanos (`apps/web/src/i18n/index.ts`)

```typescript
workspaceDisplayName(slug):
  'default' → 'General'
  otro     → slug[0].toUpperCase() + slug.slice(1)
```

**Problemas:**

- `banco-machala` → **«Banco-machala»**, no «Banco Machala» (nombre del perfil).
- Ignora `BrandProduct.name` del mapper backend.
- Duplica responsabilidad que ya tiene `map-brand.ts`.

**No hay** `sanitizeBrandSlug` en frontend (correcto).

### 2.8 Estilos (`apps/web/src/client/styles/app.css`)

- Clases `.workspace-switcher*` — nomenclatura técnica interna (aceptable en CSS).
- Layout flex-wrap en header; targets ≥44px en select/input.
- Sin estilos para dropdown premium, footer «Ver todas las marcas», ni modal de confirmación de cambio.

### 2.9 Tests existentes (3G.1 + 3G.2)

| Archivo | Cobertura relevante |
|---------|---------------------|
| `tests/server.test.ts` | API brands, aislamiento conocimiento/actividad por workspace HTTP |
| `tests/presentation/map-brand.test.ts` | Mapper producto |
| `tests/client/brands.test.ts` | UI `/marcas`, modal crear, `switchWorkspace` mockeado |
| `tests/client/shell.test.ts` | Shell render básico; **espera `<select>` e input crear** |
| `tests/i18n/index.test.ts` | `workspaceDisplayName('geeks')` → «Geeks» |

**Ausente:** tests de coherencia shell ↔ `/api/brands`, validación localStorage, confirmación accesible, «Ver todas las marcas», permanencia de ruta al cambiar.

---

## 3. Problemas encontrados (priorizados)

### P0 — Violación de fuente de verdad

1. **Dos APIs para listar marcas:** `GET /api/workspaces` (shell boot) vs `GET /api/brands` (`/marcas`).
2. **Nombres humanos inconsistentes:** shell usa heurística de slug; `/marcas` usa `BrandProduct.name` del backend.

### P0 — UX / producto no alineado con 3G

3. **Creación desde header:** input libre + «Usar» bypassa `POST /api/brands`, canonicalización y validación humanizada.
4. **Sin enlace «Ver todas las marcas»** hacia `/marcas`.

### P1 — Seguridad de estado (producto, no kernel)

5. **localStorage no validado:** slug inexistente o corrupto persiste hasta intervención manual; backend sigue siendo autoridad en datos, pero la UI puede mostrar marca fantasma en el selector.
6. **`onWorkspaceCreate` acepta texto arbitrario** y llama `switchWorkspace()` — puede crear sesiones/adjuntos inconsistentes sin perfil de marca.

### P1 — Confirmación y feedback

7. **Confirmación incompleta:** solo con historial de chat visible; copy técnico; `window.confirm` no accesible ni premium.
8. **No describe marca origen** («Ahora estás trabajando con General → Geeks»).

### P2 — Estado compartido

9. **`state.workspaces` es slug[]** sin nombres — obliga a `workspaceDisplayName` en toda la UI.
10. **`/marcas` es quien sincroniza el shell** — orden de visita afecta lista del header.
11. **`pendingChatDraft` no se gestiona** al cambiar marca — riesgo de draft aplicado en contexto distinto.

### P2 — Re-render / rendimiento

12. **`subscribe()` re-renderiza ruta completa** en cada `patchState` — no es reload de página, pero puede resetear estado de página (p. ej. modal en `/marcas` si coincide timing).

### P3 — Terminología interna

13. Identificadores TS/DOM: `workspaceSelect`, `workspace-switcher`, `activeWorkspace`, `setWorkspaces` — aceptables internamente; **no deben filtrarse a UI** (hoy el test shell busca que no aparezca «workspace» en nav — OK).

---

## 4. Propuesta de solución (3G.3)

### 4.1 Principio rector

**Una fuente de verdad en frontend:** `GET /api/brands`.

```text
mountApp / refreshBrands
  → fetchBrands(activeWorkspace)
  → cache BrandProduct[] en app-state (o módulo brands-cache.ts mínimo)
  → validar activeWorkspace contra ids devueltos
  → fallback a 'default' (General) si inválido
  → poblar shell con BrandProduct.name (nunca slug en UI)
```

Deprecar `fetchWorkspaces()` en boot (mantener endpoint server por compatibilidad; no consumir desde shell).

### 4.2 Shell — UX objetivo

Reemplazar bloque actual por:

```text
Marca activa
[ {nombre humano activo} ▾ ]

── lista ──
General          ✓ (si activa)
Geeks
Revital
────────────────
Ver todas las marcas → /marcas
```

**Implementación sugerida (sin over-engineering):**

- Botón trigger + `<div role="listbox">` o `<ul role="menu">` (popover anclado al header).
- Footer con `<a>` / botón que llama `setRoute('/marcas')`.
- Eliminar `#workspace-new` y `#workspace-use`.
- Trigger muestra `resolveBrandDisplayName(activeId)` desde cache API.
- `aria-expanded`, `aria-haspopup="listbox"`, Escape cierra, focus trap ligero.

**Alternativa aceptable:** `<select>` nativo mejorado + `<optgroup>` + option disabled como separador + botón aparte «Ver todas las marcas» — menos premium pero más rápido. **Recomendación:** popover custom alineado con modal `/marcas` (consistencia world-class).

### 4.3 Cambio de marca — flujo

1. Usuario elige otra marca en shell (o desde `/marcas` — ya usa `switchWorkspace`).
2. Si cambio tiene impacto (siempre mostrar confirmación ligera según spec 3G.3, o al menos cuando hay chat/draft):
   - Modal accesible (reutilizar patrón `.dialog` de `/marcas`).
   - Copy: origen, destino, aislamiento en lenguaje humano.
   - [Cancelar] [Trabajar con {name}]
3. `switchWorkspace(brandId)` — **sin duplicar lógica**.
4. Feedback: `statusText` + `aria-live` (ya existe `#status-bar role="status"`).
5. **Permanecer en ruta actual** — ya implementado; verificar regresión.
6. Actualizar vistas: Home context chip, Chat historial, Conocimiento, Actividad — vía `renderCurrentRoute` + `refresh*View`.

### 4.4 localStorage

En boot (post-`fetchBrands`):

```text
stored = localStorage['atlas.activeWorkspace']
if stored ∉ brandIds → setActiveWorkspace('default')
else → mantener stored
```

Nunca mostrar `default` al usuario — siempre «General».

### 4.5 Sincronización post-creación

Tras `POST /api/brands` en `/marcas`:

- Refrescar cache global de marcas (nueva función `refreshBrandCatalog()`).
- Shell se actualiza vía `subscribe` + `updateShellChrome`.

### 4.6 Chat y drafts

| Regla | Acción propuesta |
|-------|------------------|
| No enviar mensajes al cambiar | Ya cumplido |
| No crear conversación automática | Ya cumplido |
| Draft seguro | Al confirmar cambio: `setPendingChatDraft(undefined)` o preservar en memoria keyed por slug (mínimo: limpiar draft global para evitar mezcla) |
| Historial chat | Mantener `resetChat: true` + `reloadChatHistory()` en `/chat` |

### 4.7 Aislamiento

- **Sin cambios en backend.**
- Frontend sigue pasando `workspace`/`activeWorkspace` slug interno solo en llamadas API — **nunca en copy visible**.
- **No** filtrar resultados de conocimiento/actividad en React como seguridad (ya cumplido).

### 4.8 i18n

Añadir claves bajo `brands.shell*`:

- `shellTriggerLabel`, `shellManageLink` («Ver todas las marcas»)
- `switchDialogTitle`, `switchDialogBody`, `switchDialogConfirm`
- Mantener `workspace.label` → «Marca activa» o migrar a `brands.activeLabel`

Eliminar uso visible de `workspace.create`, `workspace.use`, `workspace.createPlaceholder` del shell.

---

## 5. Archivos a modificar (implementación)

| Archivo | Cambio previsto |
|---------|-----------------|
| `apps/web/src/client/components/shell.ts` | Nuevo selector; quitar input crear; consumir marcas cache |
| `apps/web/src/client/app.ts` | Boot con `fetchBrands`; validación localStorage; quitar `fetchWorkspaces` |
| `apps/web/src/client/state/app-state.ts` | Cache `brands: BrandProduct[]`; helpers `resolveBrandName(id)` |
| `apps/web/src/client/lib/workspace-switch.ts` | Modal confirmación; validar id contra cache; draft handling |
| `apps/web/src/client/api/client.ts` | Opcional: helper `loadBrandCatalog()`; deprecar uso de `fetchWorkspaces` en UI |
| `apps/web/src/client/pages/brands.ts` | Tras crear/cargar, llamar refresh global (evitar duplicar fetch) |
| `apps/web/src/i18n/es.ts` | Copy shell + confirmación |
| `apps/web/src/client/styles/app.css` | Estilos `.brand-switcher*`, popover, responsive header |
| `apps/web/tests/client/shell.test.ts` | Actualizar expectativas |
| `apps/web/tests/client/brands.test.ts` | Ajustar si cambia sync global |
| **Nuevo** `apps/web/tests/client/brand-switcher.test.ts` | Selector, fallback, confirmación, navegación `/marcas` |
| **Nuevo** `apps/web/tests/client/workspace-switch.test.ts` | Cambio ruta, cancelación, feedback |

---

## 6. Archivos que NO deben modificarse

```text
packages/core
packages/compiler
packages/runtime
packages/memory
packages/retrieval
packages/events
packages/intelligence
packages/sdk
packages/cli
packages/llm
```

Tampoco modificar en esta fase (salvo bug bloqueante):

- `apps/web/src/session-store.ts`
- `apps/web/src/server.ts` (GET/POST brands ya suficientes)
- `apps/web/src/presentation/map-brand.ts` (salvo export de helper reutilizable en cliente — evitar si no es necesario)

---

## 7. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Race boot: UI antes de `fetchBrands` | Skeleton/disabled selector; no renderizar slugs hasta cache lista |
| Doble fetch brands (boot + `/marcas`) | Cache singleton en app-state; `/marcas` reutiliza cache si fresca |
| Regresión aislamiento | Mantener tests HTTP server existentes; no filtrar en frontend |
| `window.confirm` eliminado rompe tests | Reemplazar por modal testeable con ids estables |
| Header mobile overflow | Popover full-width en móvil; colapsar label si necesario |
| slug visible en DOM `option.value` | Usar `data-brand-id` en botones custom; no exponer en texto visible |
| Vitest timeout en gate completo | Ejecutar `@atlas/web` aislado; documentar flake infra |

---

## 8. Criterios de aceptación (PASS 3G.3)

### Producto

- [ ] Selector muestra **nombre humano** del perfil (desde `/api/brands`).
- [ ] **General** visible; nunca «default» en UI.
- [ ] **Sin** input «Nueva marca» ni botón «Usar» en header.
- [ ] Enlace **«Ver todas las marcas»** → `/marcas`.
- [ ] Confirmación clara al cambiar (copy 3G.3).
- [ ] Feedback post-cambio en lenguaje humano.
- [ ] Cambio **sin reload** de aplicación; **misma ruta** conservada.
- [ ] Creación solo en `/marcas`.

### Técnico

- [ ] Shell y `/marcas` consumen **GET /api/brands** como autoridad de listado.
- [ ] localStorage invalidado → fallback General.
- [ ] Tras crear marca en `/marcas`, aparece en selector sin inconsistencia.
- [ ] F5 recupera marca activa válida.
- [ ] Aislamiento backend intacto (tests regresión General ≠ Geeks ≠ Revital).

### Calidad

- [ ] `@atlas/web` tests nuevos/actualizados PASS.
- [ ] typecheck, lint, build PASS.
- [ ] `pnpm atlas doctor` HEALTHY.
- [ ] `git diff --name-only` sin `packages/*`.

### Accesibilidad / responsive

- [ ] Teclado, focus visible, aria-expanded/haspopup, targets ≥44px.
- [ ] Header usable en móvil.

---

## 9. Estrategia de tests

### 9.1 Unit / component (jsdom)

| Caso | Archivo |
|------|---------|
| Shell sin input crear; enlace `/marcas` | `shell.test.ts` |
| Nombres humanos desde mock `BrandProduct[]` | `brand-switcher.test.ts` |
| General vs slug nunca en textContent | `brand-switcher.test.ts` |
| localStorage `fantasma` → fallback `default` | `app-state.test.ts` o `app.test.ts` |
| Confirmación cancelar → marca sin cambio | `workspace-switch.test.ts` |
| Confirmación aceptar → `activeWorkspace` + feedback | `workspace-switch.test.ts` |
| Cambio en `/conocimiento` → route unchanged | `workspace-switch.test.ts` |
| Draft limpiado o no aplicado cross-brand | `workspace-switch.test.ts` |

### 9.2 Regresión server (sin cambios esperados)

Re-ejecutar suites existentes de aislamiento en `tests/server.test.ts` — deben seguir PASS sin modificar packages.

### 9.3 Manual (post-implementación)

Checklist del spec 3G.3 § Smoke test (7 escenarios).

---

## 10. Diagrama de estado objetivo

```text
                    GET /api/brands
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
   app-state.brands[]              BrandProduct.name
   app-state.activeWorkspace       (UI copy)
   (slug interno, validated)
          │
          ├─ shell selector (read)
          ├─ /marcas page (read + create)
          └─ switchWorkspace(id) ──► API calls con workspace slug
                                      (backend authoritative)
```

---

## 11. Decisión pendiente para implementación

| Opción | Pros | Contras |
|--------|------|---------|
| **A. Popover custom** | Premium, WCAG controlable, coherente con modal `/marcas` | Más código |
| **B. Select nativo + link** | Rápido, accesible por defecto | Menos «world-class» |

**Recomendación de auditoría:** Opción **A** (popover custom) — alineada con criterio world-class y design system existente (`.dialog`, tokens, botones).

---

## 12. Siguiente paso

**DETENER aquí.**

Esperar aprobación de esta auditoría antes de implementar 3G.3.

Tras aprobación:

1. Implementar según §4.
2. Ejecutar quality + governance gate.
3. Crear `releases/WEB_UI_PHASE_3G3_IMPLEMENTATION.md`.
4. Actualizar `VERSION.md` y `docs/README.md` si corresponde.

---

## 13. Resumen ejecutivo

El shell actual **contradice** las decisiones de 3G.2: usa una API distinta, muestra slugs heurísticos en lugar de nombres de perfil, y permite crear marcas sin canonicalización. La lógica de cambio (`switchWorkspace`) es reutilizable y ya preserva la ruta; falta confirmación premium, validación de localStorage, cache unificado de marcas y eliminación del input libre. La implementación 3G.3 debe concentrarse en **unificar fuente de verdad (`GET /api/brands`)** y **refactor visual/comportamental del header**, sin tocar Kernel ni packages Frozen.
