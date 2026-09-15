# ATLAS Web — Fase 3I Parte B: Accesibilidad + Responsive (WCAG 2.2 AA)

**Fecha:** 2026-08-10  
**Modo:** IMPLEMENTACIÓN (P0 + P1 únicamente)  
**Alcance:** `apps/web/`  
**Baseline:** `fe56c69` — `feat(web): integrate ATLAS design system`  
**Auditoría previa:** [`WEB_UI_PHASE_3I_ACCESSIBILITY_RESPONSIVE_AUDIT.md`](./WEB_UI_PHASE_3I_ACCESSIBILITY_RESPONSIVE_AUDIT.md)

---

## 1. VEREDICTO

### **PASS** (alcance P0 + 11 P1)

Los hallazgos **3I-P0-01** y los **11 P1** del informe de auditoría fueron implementados con tests automatizados y quality gate verde.  
**P2/P3 no forman parte de esta entrega.** La certificación WCAG 2.2 AA formal en producción sigue requiriendo smoke manual con screen reader real (ver §13).

---

## 2. P0 implementado

| ID | Resultado | Resumen |
|----|-----------|---------|
| **3I-P0-01** | **PASS** | Sidebar móvil como drawer/overlay: `<main>` ya no se oculta; backdrop `#sidebar-backdrop`; `main.inert` en móvil con menú abierto; Escape cierra; foco entra al drawer y vuelve al `#menu-toggle`; desktop sin regresión |

**Archivos:** `shell.ts`, `app.css`, `app.ts`

---

## 3. P1 implementados (11/11)

| ID | Resultado | Cambio principal |
|----|-----------|------------------|
| **3I-P1-01** | **PASS** | Listbox Marca: ArrowUp/Down, Home, End, Enter/Space, Escape; foco roving en opciones |
| **3I-P1-02** | **PASS** | Drawer móvil: trap Tab, foco inicial en primer enlace, Escape global |
| **3I-P1-03** | **PASS** | `#chat-thread` sin `aria-live`; `#status-bar` con `role="status"` + `aria-live="polite"` |
| **3I-P1-04** | **PASS** | `mountDialogRoot` aplica `inert` en `#shell-body`; dialog en `#shell-dialog-root` (fuera del target inert) |
| **3I-P1-05** | **PASS** | `.chat-composer:focus-within` con ring cian DS |
| **3I-P1-06** | **PASS** | `<label for="correction-input">` + i18n `chat.correctLabel` |
| **3I-P1-07** | **PASS** | Helper `appendExpandableDetails` con `aria-expanded` / `aria-controls` en chat, knowledge, activity, brands |
| **3I-P1-08** | **PASS** | `--color-border: #334155` en `tokens.css` (dark); light mantiene `--atlas-slate-200` |
| **3I-P1-09** | **PASS** | `.action-card__cta` `min-height: 44px` + padding táctil |
| **3I-P1-10** | **PASS** | Brands usa `mountDialogRoot` (cleanup listeners); `trapDialogFocus` devuelve release fn |
| **3I-P1-11** | **PASS** | Workspace switch restaura foco en `#brand-switcher-trigger` al cerrar diálogo |

---

## 4. Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `apps/web/src/client/components/shell.ts` | Drawer móvil, backdrop, listbox keyboard, focus trap sidebar, status-bar live region |
| `apps/web/src/client/lib/dialog.ts` | `mountDialogRoot`: inert, restore focus async, trap cleanup |
| `apps/web/src/client/lib/expandable-details.ts` | **Nuevo** — toggles accesibles |
| `apps/web/src/client/lib/workspace-switch.ts` | inert + restore focus vía `mountDialogRoot` |
| `apps/web/src/client/app.ts` | `onCloseSidebar` en shell events |
| `apps/web/src/client/pages/chat.ts` | Sin live en thread; label corrección; expandable details |
| `apps/web/src/client/pages/knowledge.ts` | Expandable details |
| `apps/web/src/client/pages/activity.ts` | Expandable details |
| `apps/web/src/client/pages/brands.ts` | `mountDialogRoot`; expandable details |
| `apps/web/src/client/styles/app.css` | Drawer/backdrop CSS; composer focus-within; action-card CTA 44px; eliminado `display:none` en main móvil |
| `apps/web/src/client/styles/tokens.css` | Token border contraste dark |
| `apps/web/src/i18n/es.ts` | `chat.correctLabel` |
| `apps/web/tests/client/phase-3i-accessibility.test.ts` | **Nuevo** — suite 3I |
| `apps/web/tests/client/brand-switcher.test.ts` | `onCloseSidebar` + teardown |
| `apps/web/tests/client/workspace-switch.test.ts` | Restore focus al cancelar |
| `docs/README.md` | Enlace auditoría + implementación 3I |
| `VERSION.md` | Entrada Fase 3I |

---

## 5. Tests agregados/modificados

| Test | Cobertura |
|------|-----------|
| `phase-3i-accessibility.test.ts` | P0 drawer, P1-01 listbox, P1-03 chat live, P1-04/10/11 dialog, P1-06 label, P1-07 toggles, P1-08/09 CSS fuente |
| `workspace-switch.test.ts` | P1-11 restore focus al cancelar |
| `brand-switcher.test.ts` | Compatibilidad `onCloseSidebar` |

**Total `@atlas/web`:** **143/143 PASS**

---

## 6. Quality gate

| Comando | Resultado |
|---------|-----------|
| `pnpm --filter @atlas/web test` | ✅ **143/143 PASS** |
| `pnpm --filter @atlas/web typecheck` | ✅ PASS |
| `pnpm --filter @atlas/web lint` | ✅ PASS |
| `pnpm --filter @atlas/web build` | ✅ PASS |
| `pnpm test` (monorepo) | ✅ PASS |
| `pnpm atlas doctor` | ✅ **HEALTHY** |
| `git diff --name-only packages/` | ✅ **vacío** |

---

## 7. Accessibility behavior

- **Teclado:** listbox APG; drawer móvil con trap; modales con Tab ciclico y Escape
- **Focus management:** dialogs → foco inicial + restore; sidebar → toggle; workspace switch → trigger
- **Screen readers:** historial chat estático; estados vía `#status-bar`; toggles con `aria-expanded`
- **Contraste:** borde UI reforzado en dark theme
- **Touch:** CTAs Home ≥44px

---

## 8. Responsive behavior

- **Desktop (≥900px):** sidebar fija; sin drawer modal
- **Móvil/tablet (≤899px):** drawer overlay + backdrop; main visible con `inert`
- **Breakpoints validados conceptualmente:** 320–1280+ vía CSS existente + tests móvil simulado (`matchMedia` 899px)

---

## 9. Light / Dark verification

| Elemento | Light | Dark |
|----------|-------|------|
| `--color-border` | `--atlas-slate-200` | `#334155` |
| Focus ring | `--color-focus-ring` cian | igual |
| Drawer backdrop | token surface + opacity | igual |
| Dialog inert | shell-body inert, dialog-root activo | igual |

---

## 10. Governance check

- ✅ Solo `apps/web/`, `releases/`, `docs/`, `VERSION.md`
- ✅ Sin cambios en `packages/*`
- ✅ Sin contratos Frozen / Kernel
- ✅ Sin nuevas dependencias (no `vitest-axe`)

---

## 11. Limitaciones

- Sin axe automatizado en CI (P3)
- Sin prueba manual VoiceOver/NVDA en esta fase
- P1-05 verificado por regla CSS (jsdom no aplica hoja completa con `@import`)
- Zoom 200% no auditado exhaustivamente (P2)

---

## 12. P2 / P3 — NO implementados

Confirmado explícitamente: **ningún ítem P2 ni P3** del informe 3I Parte A fue implementado en Parte B.

---

## 13. Smoke test manual recomendado

| # | Escenario | Esperado |
|---|-----------|----------|
| S1 | Móvil 375px: abrir menú hamburguesa | Drawer sobre contenido; main visible pero inert; backdrop visible |
| S2 | Móvil: Escape con menú abierto | Cierra drawer; foco en toggle |
| S3 | Selector Marca: flechas + Enter | Navega opciones; selecciona |
| S4 | Chat: enviar mensaje | SR anuncia estado en barra inferior, no re-lee hilo |
| S5 | Corrección chat | Label asociado audible en SR |
| S6 | Cambio Marca con borrador → Cancelar | Foco vuelve al trigger |
| S7 | Crear Marca modal | Tab no escapa al shell; Escape/cierra restaura foco |
| S8 | Home action cards móvil | CTA fácil de pulsar (≥44px) |
| S9 | Light + Dark | Bordes visibles; focus cian visible en composer y botones |

Ejecutar: `pnpm atlas web`

---

## 14. Resultado final

| Criterio | Estado |
|----------|--------|
| P0 | **1/1 PASS** |
| P1 | **11/11 PASS** |
| Tests/build/lint/doctor | **PASS** |
| Frozen packages | **NO tocados** |
| P2/P3 | **NO implementados** |

**Próximo paso:** revisión manual + autorización de commit por el owner.
