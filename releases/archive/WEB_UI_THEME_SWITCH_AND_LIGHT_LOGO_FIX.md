# ATLAS Web — Tema claro/oscuro + logo en Light Mode

**Fecha:** 2026-08-10  
**Tipo:** Mejora UX post-3I (logo P2-11 + selector de tema)  
**Base:** `a376e6c` — hotfix render loop  
**Alcance:** `apps/web/` únicamente

---

## VEREDICTO AUDITORÍA

### **PASS** — implementado

| Hallazgo | Severidad | Estado |
|----------|-----------|--------|
| Logo sidebar invisible en light (`filter: invert(1)` sobre fondo claro) | P1 UX | **Corregido** |
| Tema dependía solo de `prefers-color-scheme` OS — sin control usuario | P2 UX | **Corregido** |
| Hero rocket con mismo invert en light | P2 UX | **Corregido** |

Referencia auditoría 3I: **3I-P2-11** (logo invert fijo) — implementado por solicitud explícita pre-push.

---

## 1. Síntoma

En **modo claro**, el isotipo ATLAS en la esquina superior izquierda del sidebar aparecía blanco/invisible sobre fondo `#F8FAFC`. El usuario no podía alternar tema manualmente; solo seguía la preferencia del sistema operativo.

---

## 2. Causa raíz

```css
.shell__logo-mark {
  filter: invert(1); /* pensado para dark: negro → blanco */
}
```

Con fondo claro, `invert(1)` mantiene el logo casi invisible.

El tema light se aplicaba vía `@media (prefers-color-scheme: light)` en `tokens.css`, sin `data-theme` ni persistencia — imposible un switch manual coherente con el Design System (`colors.css` usa `[data-theme="light"]`).

---

## 3. Solución

### Logo

- Tokens `--logo-mark-filter` y `--home-rocket-logo-filter` por tema.
- **Dark:** `invert(1)` (blanco sobre navy).
- **Light:** filtro de recoloración a púrpura marca `#685CFF` (patrón DS: recoloración, no redibujo).

### Theme switch

- `html[data-theme="light"|"dark"]` alineado con `design-system/tokens/colors.css`.
- Persistencia en `localStorage` (`atlas.theme`).
- Script inline en `index.html` para evitar flash incorrecto antes del bundle.
- Botón `#theme-toggle` en header (44×44px, Sol/Luna Lucide, `aria-label` ES).

---

## 4. Archivos

| Archivo | Cambio |
|---------|--------|
| `apps/web/index.html` | Init sync de tema antes del bundle |
| `apps/web/src/client/lib/theme.ts` | **Nuevo** — API tema |
| `apps/web/src/client/main.ts` | `initTheme()` |
| `apps/web/src/client/components/shell.ts` | Toggle en header |
| `apps/web/src/client/lib/icons.ts` | Iconos Sol/Luna |
| `apps/web/src/client/styles/tokens.css` | `data-theme` + filtros logo |
| `apps/web/src/client/styles/app.css` | Estilos toggle + vars logo |
| `apps/web/src/i18n/es.ts` | Labels accesibles |
| `apps/web/tests/client/theme.test.ts` | **Nuevo** |

---

## 5. Accesibilidad

- Botón real (no solo icono decorativo).
- `aria-label`: «Cambiar a modo claro/oscuro» según estado.
- Target mínimo 44×44px.
- `:focus-visible` hereda ring cian global.

---

## 6. Smoke test

1. `pnpm --filter @atlas/web build && pnpm atlas web`
2. Modo claro: logo sidebar **púrpura visible**; hero rocket púrpura.
3. Clic toggle → dark: logo blanco; fondo navy.
4. Recargar página → preferencia persistida.
5. Teclado: Tab al toggle, Enter alterna tema.

---

## 7. Governance

- Solo `apps/web/` + `releases/` + `VERSION.md`
- Sin cambios en `packages/*`

---

## 8. Limitaciones

- Selector **light/dark** únicamente (sin opción «Sistema» explícita en UI; primera visita sí respeta OS).
- Logo light usa filtro CSS sobre SVG negro — no un asset multicolor separado.
