# ATLAS Web UI — Fase 3G.2 — Marcas (UI)

**Fecha:** 2026-08-09  
**Alcance:** UI `/marcas` — BrandCard, crear marca, estados, cambio de contexto  
**Prerequisito:** 3G.1 (`GET/POST /api/brands`, mapper, SessionStore)

---

## Objetivo

Entregar la pantalla **Marcas** como experiencia SaaS B2B world-class: comprensible en menos de 10 segundos, sin jerga técnica, con creación y selección de contexto de trabajo.

---

## Qué se implementó

### Página `/marcas`

- Reemplazo completo del placeholder.
- Header con título, subtítulo humano y CTA **+ Crear marca**.
- Zona de contexto activo: «Estás trabajando con **General** / **Geeks**».
- Nota de confianza sobre aislamiento (sin términos técnicos).
- Grid responsive de marcas (General siempre presente).
- Estados: loading (skeletons), empty, populated, error con retry.
- Banner de éxito post-creación con CTA opcional «Trabajar con {name}» (sin cambio automático de contexto).

### BrandCard (`brand-card.ts`)

- Nombre, propósito/descripción, badge **Activa**, secciones Conocimiento y Actividad reciente.
- Métricas solo si vienen de `/api/brands` (sin inventar; sin mostrar `0` cuando no hay dato).
- CTA **Trabajar con {name}** o **Estás trabajando aquí** (deshabilitado + `aria-current`).

### Crear marca (modal accesible)

- Campos: nombre (requerido), propósito (opcional).
- Validación cliente + autoridad backend (`POST /api/brands`).
- Errores humanos (duplicado, validación, genérico) con **Ver detalles** opcional.
- Escape cierra; focus trap; `role="dialog"` + `aria-modal`.

### Cambio de marca

- Reutiliza `switchWorkspace()` extraído a `lib/workspace-switch.ts` (sin duplicar lógica).
- Actualiza estado global (`app-state`) → Home, Chat, Conocimiento, Actividad y shell coherentes.
- Feedback en barra de estado: «Ahora estás trabajando con {name}» / «… en General».

### API cliente

- `fetchBrands(activeWorkspace)` → `GET /api/brands?activeWorkspace=`
- `createBrand(name, purpose?)` → `POST /api/brands` con `BrandApiError` tipado.

---

## Arquitectura

```
Browser → pages/brands.ts → api/client.ts → Express → SessionStore → @atlas/cli
                ↓
         lib/workspace-switch.ts → app-state (activeWorkspace)
```

- Sin cambios en paquetes Frozen/Certified.
- Una sola fuente de verdad: `getState().activeWorkspace` + `/api/brands`.

---

## Archivos creados

| Archivo |
|---------|
| `apps/web/src/client/pages/brands.ts` |
| `apps/web/src/client/components/brand-card.ts` |
| `apps/web/src/client/lib/workspace-switch.ts` |
| `apps/web/tests/client/brands.test.ts` |
| `releases/WEB_UI_PHASE_3G2_IMPLEMENTATION.md` |

## Archivos modificados

| Archivo |
|---------|
| `apps/web/src/client/app.ts` |
| `apps/web/src/client/api/client.ts` |
| `apps/web/src/client/styles/app.css` |
| `apps/web/src/i18n/es.ts` |
| `docs/README.md` |
| `VERSION.md` |

---

## Tests

**`@atlas/web`:** 100/100 PASS

`tests/client/brands.test.ts` cubre:

1. Loading skeletons  
2. General + múltiples marcas  
3. Marca activa  
4. CTA trabajar  
5. Modal crear  
6. Validación nombre  
7. Creación exitosa  
8. Error duplicado  
9. Error genérico + detalles  
10. Empty state  
11. Error de carga + retry  
12. Grid responsive  
13. Ausencia de jerga técnica  

---

## Build / Typecheck / Lint

| Comando | Resultado |
|---------|-----------|
| `pnpm --filter @atlas/web test` | PASS (100/100) |
| `pnpm --filter @atlas/web typecheck` | PASS |
| `pnpm --filter @atlas/web lint` | PASS |
| `pnpm --filter @atlas/web build` | PASS |
| `pnpm build` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm lint` | PASS |
| `pnpm test` | PASS |
| `pnpm atlas doctor` | HEALTHY |

---

## Accesibilidad (WCAG 2.2 AA)

- Headings semánticos (`h1`, `h2` en cards).
- Labels reales en formulario del modal.
- `aria-live` / `aria-busy` en contenido dinámico.
- Focus visible en inputs y botones.
- Modal: Escape, focus trap, botones ≥44px.
- Estado activo: badge + borde + CTA distinto (no solo color).

---

## Responsive

- Mobile: 1 columna.
- Tablet (≥640px): 2 columnas.
- Desktop (≥960px): 3 columnas.
- Modal usable en móvil; sin overflow horizontal.

---

## Governance

`git diff --name-only` confirma **sin modificaciones** en:

`packages/core`, `compiler`, `runtime`, `memory`, `retrieval`, `events`, `intelligence`, `sdk`, `cli`, `llm`.

---

## Limitaciones

- Shell header sigue con input libre «Nueva marca» (refactor previsto en **3G.3**).
- Sin edición/eliminación de marca.
- Actividad reciente solo de sesión Web actual.
- Sin página `/marcas/:id` de detalle.

---

## Próximo bloque recomendado

**3G.3 — Cambio de marca + shell:** selector elegante, «Administrar marcas» → `/marcas`, eliminar creación duplicada en header.
