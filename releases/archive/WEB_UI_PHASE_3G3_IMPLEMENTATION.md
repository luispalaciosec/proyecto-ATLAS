# ATLAS Web UI — Fase 3G.3 — Selector de Marca (Shell)

**Fecha:** 2026-08-09  
**Auditoría previa:** [`WEB_UI_PHASE_3G3_AUDIT.md`](./WEB_UI_PHASE_3G3_AUDIT.md)  
**Estado:** PASS

---

## 1. Objetivo

Unificar el selector de Marca del header con la experiencia `/marcas`: una sola fuente de verdad (`GET /api/brands`), nombres humanos del perfil, sin creación desde el header, confirmación accesible al cambiar contexto, y validación de `localStorage`.

---

## 2. Problema anterior

| Problema | Impacto |
|----------|---------|
| Shell usaba `GET /api/workspaces` (solo slugs) | Lista desalineada con `/marcas` |
| `workspaceDisplayName()` capitalizaba slugs | «Banco-machala» en lugar del nombre real |
| Input «Nueva marca» + «Usar» en header | Bypass de `POST /api/brands` |
| `window.confirm` solo con chat visible | Confirmación inconsistente e inaccesible |
| `localStorage` sin validar | Slugs inválidos persistían en UI |
| `pendingChatDraft` no gestionado | Riesgo de borrador cross-marca |

---

## 3. Solución

### Fuente de verdad

- Boot de la app: `loadBrandCatalog()` → `GET /api/brands`.
- Cache en `app-state`: `brands[]`, `brandsLoaded`, `applyBrandCatalog()`.
- `/marcas` sincroniza el mismo cache tras cargar/crear.

### Selector premium en header

- Popover accesible (`role="listbox"`, `aria-expanded`, targets ≥44px).
- Muestra `BrandProduct.name` (nunca slug visible).
- Footer **«Ver todas las marcas»** → `/marcas`.
- **Eliminados:** input crear + botón «Usar».

### Cambio de marca

- Reutiliza `switchWorkspace()` sin duplicar lógica.
- Modal accesible (patrón `.dialog`) con marca actual, destino y explicación humana.
- Aviso explícito si hay borrador sin enviar.
- Tras confirmar: limpia draft, mantiene ruta actual, actualiza Home/Chat/Conocimiento/Actividad.
- `skipConfirm: true` solo en CTA explícito post-creación («Trabajar con {name}»).

### localStorage

- `applyBrandCatalog()` valida `activeWorkspace` contra ids del backend.
- Slug inválido → fallback seguro a **General** (`default` interno).

---

## 4. UX implementada

```text
Marca activa
[ Geeks ▾ ]

General
Geeks ✓
Revital
────────────
Ver todas las marcas
```

Confirmación al cambiar:

> Vas a cambiar de marca  
> Ahora estás trabajando con **General**. Al cambiar a **Geeks**, ATLAS utilizará el conocimiento y el contexto de esa marca.

Feedback post-cambio en `#status-bar` (role=status).

---

## 5. Arquitectura

```text
mountApp → loadBrandCatalog() → GET /api/brands → applyBrandCatalog()
                ↓
         shell popover + páginas (resolveBrandDisplayName)
                ↓
         switchWorkspace(id) → API calls con slug interno (backend autoridad)
```

Sin cambios en paquetes Frozen/Certified ni en `session-store` / `server` (API 3G.1 suficiente).

---

## 6. Archivos creados

| Archivo |
|---------|
| `apps/web/src/client/lib/dialog.ts` |
| `apps/web/src/client/lib/brand-catalog.ts` |
| `apps/web/tests/client/brand-switcher.test.ts` |
| `apps/web/tests/client/workspace-switch.test.ts` |
| `releases/WEB_UI_PHASE_3G3_IMPLEMENTATION.md` |

## 7. Archivos modificados

| Archivo |
|---------|
| `apps/web/src/client/components/shell.ts` |
| `apps/web/src/client/app.ts` |
| `apps/web/src/client/state/app-state.ts` |
| `apps/web/src/client/lib/workspace-switch.ts` |
| `apps/web/src/client/pages/brands.ts` |
| `apps/web/src/client/pages/home.ts` |
| `apps/web/src/client/pages/chat.ts` |
| `apps/web/src/client/pages/knowledge.ts` |
| `apps/web/src/client/pages/activity.ts` |
| `apps/web/src/client/styles/app.css` |
| `apps/web/src/i18n/es.ts` |
| `apps/web/tests/client/shell.test.ts` |
| `apps/web/tests/client/home.test.ts` |
| `apps/web/tests/client/brands.test.ts` |
| `VERSION.md` |
| `docs/README.md` |

## 8. Archivos NO modificados

`packages/core`, `compiler`, `runtime`, `memory`, `retrieval`, `events`, `intelligence`, `sdk`, `cli`, `llm`.

---

## 9. Tests

**`@atlas/web`:** 108/108 PASS

| Suite | Casos nuevos/actualizados |
|-------|---------------------------|
| `brand-switcher.test.ts` | Sin input crear, nombres humanos, popover, fallback localStorage |
| `workspace-switch.test.ts` | Confirmación, cancelación, draft, skipConfirm, ruta preservada |
| `shell.test.ts` | Selector nuevo |
| `home.test.ts` | Contexto con catálogo de marcas |

Regresión server (aislamiento HTTP) sin cambios — PASS.

---

## 10. Quality gate

| Comando | Resultado |
|---------|-----------|
| `pnpm --filter @atlas/web test` | PASS (108/108) |
| `pnpm --filter @atlas/web typecheck` | PASS |
| `pnpm --filter @atlas/web lint` | PASS |
| `pnpm --filter @atlas/web build` | PASS |
| `pnpm build` / `typecheck` / `lint` / `test` | PASS |
| `pnpm atlas doctor` | HEALTHY |

---

## 11. Governance gate

Cambios limitados a `apps/web/` + documentación. **Ningún `packages/*` modificado.**

---

## 12. Accesibilidad

- `aria-haspopup`, `aria-expanded`, `role="listbox"` / `role="option"`.
- Modal con `role="dialog"`, `aria-modal`, Escape, focus en confirmar.
- `#status-bar` con `role="status"` para feedback.
- Targets ≥44px; focus visible en trigger y opciones.

---

## 13. Responsive

- Popover anclado al trigger; `min-width` adaptativo en móvil.
- Header flex-wrap; sin overflow horizontal.

---

## 14. Smoke test manual recomendado

```bash
pnpm --filter @atlas/web build
pnpm atlas web
```

1. Home → «Marca activa: General».
2. Selector → Geeks → confirmar → feedback «Ahora estás trabajando con Geeks».
3. Navegar Home/Chat/Conocimiento/Actividad sin perder contexto ni cambiar ruta.
4. Volver a General desde selector.
5. Crear marca en `/marcas` → aparece en selector.
6. F5 → marca activa recuperada.
7. `localStorage.setItem('atlas.activeWorkspace','fantasma')` + F5 → fallback General.
8. Verificar: sin input crear en header, sin slugs visibles.

---

## 15. Limitaciones

- Confirmación en cada cambio desde selector (by design).
- `fetchWorkspaces()` permanece en API cliente pero **no** lo usa el shell.
- Popover se repuebla al abrir; no es un componente React reactivo.

---

## 16. Siguiente fase recomendada

**3G.4 — Home polish + regresión integral** (CTA «Trabajar con otra marca», coherencia chips, tests E2E manuales documentados).
