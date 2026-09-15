# ATLAS Web — Fase 3I Parte A: Auditoría de accesibilidad y responsive

**Fecha:** 2026-08-09  
**Modo:** AUDIT ONLY — sin implementación  
**Alcance:** `apps/web`  
**Baseline:** `fe56c69` — `feat(web): integrate ATLAS design system`  
**Criterio:** WCAG 2.2 AA (criterios aplicables) + teclado + responsive + touch + estados + reduced motion + Light/Dark

---

## VEREDICTO 3I

### **NEEDS POLISH**

ATLAS Web tiene una **base sólida post-Design System**: `lang="es"`, landmarks, tokens DS, `:focus-visible` cian global, targets ≥44px en la mayoría de controles, `prefers-reduced-motion`, `aria-current="page"`, iconos Lucide con `aria-hidden`, modales con `role="dialog"`/`aria-modal`, listbox parcial en selector de Marca.

**No hay bloqueo total del piloto facilitado**, pero **no cumple WCAG 2.2 AA de forma formal** por hallazgos P0/P1 en sidebar móvil, teclado del listbox, regiones live del chat, foco en modales/composer, contraste de bordes UI y targets de action cards.

**Corregir P0 + P1 antes de declarar accesibilidad formal** o ampliar el piloto más allá de sesiones facilitadas.

---

## 1. Resumen ejecutivo

| Área | Estado | Comentario |
|------|--------|------------|
| Semántica / landmarks | **Bueno** | `<main>`, `<nav>`, `<aside>`, headings, labels en formularios clave |
| Design System | **Bueno** | Tokens importados; sin segundo sistema visual |
| Teclado | **Parcial** | Controles nativos OK; listbox sin flechas; sidebar móvil sin trap |
| Foco visible | **Parcial** | Global OK; composer anula outline sin alternativa |
| Screen readers | **Parcial** | `aria-live`/`aria-busy` presentes; chat re-anuncia hilo; toggles sin `aria-expanded` |
| Contraste | **Parcial** | Texto principal OK con tokens DS; bordes UI en límite/fallo 1.4.11 |
| Responsive | **Bueno con excepciones** | Grids adaptativos; sidebar móvil oculta `<main>` |
| Touch targets | **Parcial** | Mayoría 44px; `.action-card__cta` sin mínimo táctil |
| Reduced motion | **Bueno** | Global + skeleton brands |
| Tests a11y | **Insuficiente** | Sin axe/keyboard/viewport dedicados |

**Evidencia:** revisión estática de código (`apps/web/src/client/`, estilos, tests).  
**No ejecutado en Parte A:** axe automatizado, SR real (VoiceOver/NVDA), zoom 200% exhaustivo, dispositivos táctiles reales.

---

## 2. Quality gate (Parte A)

| Comando | Resultado |
|---------|-----------|
| `pnpm --filter @atlas/web test` | ✅ **134/134 PASS** |
| `pnpm --filter @atlas/web typecheck` | ✅ PASS |
| `pnpm --filter @atlas/web lint` | ✅ PASS |
| `pnpm --filter @atlas/web build` | ✅ PASS |
| `pnpm atlas doctor` | ✅ **HEALTHY** |
| `git diff --name-only packages/` | ✅ **vacío** |

**Governance Parte A:** sin cambios en `packages/*`, sin commit, sin push.

---

## 3. Mejoras ya presentes (post-DS `fe56c69`)

| # | Práctica | Evidencia |
|---|----------|-----------|
| ✅ | Tokens DS (púrpura/cian/navy) | `tokens.css` importa `design-system/tokens/*` |
| ✅ | Foco global cian | `tokens.css:92-95` — `--color-focus-ring` |
| ✅ | `aria-current="page"` en nav | `shell.ts:215-218` |
| ✅ | Menú móvil: `aria-label` sincronizado con estado | `shell.ts:207-209` |
| ✅ | Nav sidebar única (sin duplicado desktop) | `shell.ts:89-91` |
| ✅ | Iconos decorativos `aria-hidden` | `icons.ts:26` |
| ✅ | Targets 44px: nav, `.btn`, brand switcher, filtros | `app.css:65,215,278,324` |
| ✅ | `.btn--ghost` min-height 44px | `app.css:243-247` |
| ✅ | Reduced motion global | `tokens.css:97-104` |
| ✅ | Chat composer label oculto | `chat.ts:38`, `app.css` `.chat-composer__label` |
| ✅ | Brand switcher: `aria-expanded`, `aria-controls`, Escape | `shell.ts:59-61,266-271` |
| ✅ | Activity filters: `aria-pressed` | `activity.ts:76` |
| ✅ | `lang="es"`, viewport, color-scheme | `index.html:2-6` |

---

## 4. WCAG 2.2 AA — matriz (criterios aplicables)

| Criterio | Estado | Evidencia | Sev. |
|----------|--------|-----------|------|
| **1.1.1** Non-text Content | **PASS** | Logo con `alt=""` + texto “ATLAS” en enlace; iconos Lucide `aria-hidden` | — |
| **1.3.1** Info and Relationships | **PARTIAL** | Mensajes chat sin rol/nombre; corrección sin `<label>`; `#status-bar` fuera de `<main>` | P1/P2 |
| **1.3.2** Meaningful Sequence | **PARTIAL** | Sidebar móvil oculta main al abrir menú | P0 |
| **1.3.3** Sensory Characteristics | **PASS** | Estados con texto + borde/color | — |
| **1.4.3** Contrast Minimum | **PASS*** | Texto sobre fondos DS ≥4.5:1; blanco sobre `#685CFF` ≈4.65:1 (*estático) | — |
| **1.4.4** Resize Text | **PARTIAL** | Sin prueba formal 200% en todas las vistas | P2 |
| **1.4.10** Reflow | **PARTIAL** | Layout flex/grid tolerante; composer horizontal en móvil estrecho | P2 |
| **1.4.11** Non-text Contrast | **FAIL** | `--color-border` `#1E293B` sobre `--color-surface` `#111C31` ≈**1.3:1** | **P1** |
| **1.4.12** Text Spacing | **PARTIAL** | No probado con overrides UA | P3 |
| **1.4.13** Content on Hover or Focus | **PASS** | Sin contenido crítico solo hover | — |
| **2.1.1** Keyboard | **PARTIAL** | Listbox sin Arrow/Home/End; toolbar actividad sin flechas | P1/P2 |
| **2.1.2** No Keyboard Trap | **PARTIAL** | Modales sin `inert`; sidebar móvil; `trapDialogFocus` sin cleanup | P1 |
| **2.4.1** Bypass Blocks | **FAIL** | Sin skip link | P2 |
| **2.4.2** Page Titled | **PARTIAL** | `<title>ATLAS</title>` estático en SPA | P2 |
| **2.4.3** Focus Order | **PARTIAL** | Tab al fondo con modal; `#main` sin `.focus()` en cambio ruta | P1/P2 |
| **2.4.6** Headings and Labels | **PARTIAL** | Panel corrección solo placeholder | P1 |
| **2.4.7** Focus Visible | **PARTIAL** | Composer input `outline: none` sin alternativa | **P1** |
| **2.4.11** Focus Not Obscured | **PARTIAL** | Header sticky; no probado exhaustivamente | P2 |
| **2.5.3** Label in Name | **PASS** | Botones con texto visible coherente con nombre accesible | — |
| **2.5.8** Target Size | **PARTIAL** | `.action-card__cta` sin min-height/padding táctil | **P1** |
| **3.1.1** Language of Page | **PASS** | `html lang="es"` | — |
| **3.2.1 / 3.2.2** On Focus / Input | **PASS** | Cambio Marca con confirmación si borrador | — |
| **3.3.1–3.3.3** Errors | **PASS** | Errores con texto; `role="alert"` en crear Marca | — |
| **4.1.2** Name, Role, Value | **PARTIAL** | Toggles detalle sin `aria-expanded`; listbox incompleto APG | P1 |
| **4.1.3** Status Messages | **PARTIAL** | Chat `aria-live` en hilo completo | **P1** |

*Criterios no aplicables omitidos (audio/video, drag, motion actuation, etc.).*

---

## 5. Hallazgos clasificados

### P0 — bloquea uso / accesibilidad crítica

| ID | Hallazgo | WCAG | Componente | Archivo | Evidencia | Impacto | Recomendación | Esfuerzo | Código | vía DS/tokens |
|----|----------|------|------------|---------|-----------|---------|---------------|----------|--------|---------------|
| **3I-P0-01** | Sidebar móvil oculta `<main>` con menú abierto | 1.3.2, 2.1.2 | Shell | `app.css:1264-1267` | `.shell__frame.sidebar-open .shell__main { display: none; }` | Contenido principal desaparece; foco puede quedar en nodos ocultos | Drawer superpuesto + backdrop; no ocultar main; `inert` en contenido de fondo | Medio | Sí | CSS tokens |

---

### P1 — corregir antes del piloto ampliado

| ID | Hallazgo | WCAG | Componente | Archivo | Evidencia | Impacto | Recomendación | Esfuerzo | Código | vía DS/tokens |
|----|----------|------|------------|---------|-----------|---------|---------------|----------|--------|---------------|
| **3I-P1-01** | Listbox Marca sin teclado Arrow/Home/End | 2.1.1, 4.1.2 | Brand switcher | `shell.ts:266-271` | Solo Escape; sin listeners de flechas | Usuarios SR/teclado esperan patrón APG listbox | Implementar roving tabindex o combobox APG | Medio | Sí | — |
| **3I-P1-02** | Sidebar móvil sin trap de foco ni foco inicial | 2.1.2, 2.4.3 | Shell | `shell.ts:247-248`, `app.css:52-58` | Toggle solo cambia estado; sin `focus()` al abrir ni Escape global | Tab puede salir del drawer o perderse | Al abrir: foco primer link; trap Tab; Escape cierra | Medio | Sí | — |
| **3I-P1-03** | Chat: `aria-live="polite"` en hilo completo | 4.1.3 | Chat | `chat.ts:36,172-176` | `replaceChildren()` re-anuncia historial | SR verboso / repetitivo | Live region solo en último mensaje o `#status-bar` | Medio | Sí | — |
| **3I-P1-04** | Modales sin `inert` en fondo | 2.4.3, 2.1.2 | Dialogs | `dialog.ts`, `brands.ts`, `workspace-switch.ts` | Tab puede alcanzar shell detrás del modal | Confusión de contexto | `inert` en `#shell-body` al abrir modal | Medio | Sí | — |
| **3I-P1-05** | Composer chat: foco visible eliminado | 2.4.7 | Chat | `app.css:546-548` | `.chat-composer__input:focus-visible { outline: none; }` | Usuarios teclado no ven foco en textarea | `:focus-within` en `.chat-composer` con ring cian | Bajo | Sí | `--color-focus-ring` |
| **3I-P1-06** | Panel corrección sin `<label>` | 1.3.1, 3.3.2 | Chat | `chat.ts:44-47` | Solo `<h2>` + placeholder | SR no asocia campo con instrucción | `<label for="correction-input">` o `aria-labelledby` | Bajo | Sí | — |
| **3I-P1-07** | Toggles “Ver detalles” sin `aria-expanded` | 4.1.2 | Errores | `chat.ts:246-261`, `knowledge.ts`, `activity.ts`, `brands.ts` | Toggle `<pre hidden>` sin ARIA de estado | SR no anuncia expandido/colapsado | `aria-expanded` + `aria-controls` | Bajo | Sí | — |
| **3I-P1-08** | Contraste borde UI insuficiente | 1.4.11 | Tokens | `design-system/tokens/colors.css:23-24` | `#1E293B` sobre `#111C31` ≈1.3:1 | Controles/bordes poco perceptibles | Aclarar `--color-border` ≥3:1 vs surface (token DS) | Bajo | Sí | **Sí** |
| **3I-P1-09** | Action card CTAs bajo mínimo táctil | 2.5.8 | Home | `app.css:782-791`, `home.ts:222-228` | `padding: 0`; sin `min-height: 44px` | Difícil pulsar en móvil | `min-height: 44px` + padding en `.action-card__cta` | Bajo | Sí | spacing tokens |
| **3I-P1-10** | `trapDialogFocus` acumula listeners | 2.1.2 | Brands dialog | `brands.ts:370`, `dialog.ts:6-33` | `addEventListener` sin remove al cerrar | Comportamiento errático tras reabrir | Usar `mountDialogRoot` con cleanup o remover listener | Bajo | Sí | — |
| **3I-P1-11** | Diálogo cambio Marca sin restore focus | 2.4.3 | Workspace switch | `workspace-switch.ts:104-107` | `unmount()` sin `focus()` al trigger | Usuario pierde contexto tras cancelar | Restaurar foco en `#brand-switcher-trigger` | Bajo | Sí | — |

---

### P2 — polish importante, no bloqueante

| ID | Hallazgo | WCAG | Archivo | Recomendación |
|----|----------|------|---------|---------------|
| **3I-P2-01** | Sin skip link | 2.4.1 | `index.html` | Enlace “Saltar al contenido” → `#main` |
| **3I-P2-02** | `<title>` estático en SPA | 2.4.2 | `index.html`, `app.ts` | `document.title` por ruta |
| **3I-P2-03** | `#main tabindex="-1"` sin focus en cambio ruta | 2.4.1 | `shell.ts:75`, `app.ts:64-98` | `main.focus()` tras `renderCurrentRoute()` |
| **3I-P2-04** | Menú toggle sin `aria-controls` | 4.1.2 | `shell.ts:50` | `aria-controls="sidebar"` |
| **3I-P2-05** | Mensajes chat sin nombre de emisor | 1.3.1 | `chat.ts:181-193` | `aria-label` “Tú” / “ATLAS” según `kind` |
| **3I-P2-06** | Diálogos sin `aria-describedby` | 1.3.1 | `workspace-switch.ts`, `brands.ts` | Enlazar subtítulo/cuerpo |
| **3I-P2-07** | Toolbar actividad sin flechas | 2.1.1 | `activity.ts:69-108` | Roving tabindex ArrowLeft/Right |
| **3I-P2-08** | `#status-bar` fuera de `<main>` | 1.3.1 | `shell.ts:93-98` | Mover dentro de main o región nombrada |
| **3I-P2-09** | Composer chat no apila en móvil | 1.4.10 | `app.css:528-532` | `@media (max-width: 639px)` column flex |
| **3I-P2-10** | Disabled con `opacity: 0.5` global | 1.4.3 | `tokens.css:85-89` | Colores `--color-text-disabled` sin opacity |
| **3I-P2-11** | Logo `filter: invert(1)` fijo | 1.4.11 | `app.css:32-37` | Variante logo o quitar invert en light |
| **3I-P2-12** | Corrección: sin foco al abrir panel | 2.4.3 | `chat.ts:212-216` | `correctionInput.focus()` al abrir |
| **3I-P2-13** | Trigger Marca: nombre sin contexto “Marca” | 2.4.6 | `shell.ts:63-64` | `aria-labelledby` incluyendo label visible |

---

### P3 — mejora futura

| ID | Hallazgo | Recomendación |
|----|----------|---------------|
| **3I-P3-01** | Sin `autocomplete` en búsqueda/chat | Añadir donde aplique |
| **3I-P3-02** | Sin `safe-area-inset` / visual viewport en composer | Padding inferior iOS |
| **3I-P3-03** | Placeholder sin estilo/contraste explícito `::placeholder` | Token muted |
| **3I-P3-04** | Zoom 200%/400% no probado exhaustivamente | Matriz manual Parte E |
| **3I-P3-05** | Sin axe-core en CI | Evaluar `vitest-axe` en Parte B |

---

## 6. Keyboard audit

| Flujo | Tab/Enter/Space | Escape | Flechas | Estado |
|-------|-----------------|--------|---------|--------|
| Nav sidebar | ✅ links nativos | — | — | OK |
| Menú móvil | ✅ toggle button | ❌ no cierra | — | P1 |
| Brand switcher | ✅ Tab opciones | ✅ + restore focus | ❌ | P1 |
| Modal cambio Marca | ✅ trap parcial | ✅ | — | P1 inert |
| Modal crear Marca | ✅ | ✅ | — | P1 leak |
| Chat enviar | ✅ Enter/Shift+Enter | — | — | OK |
| Copiar / corregir / retry | ✅ | — | — | OK |
| Conocimiento buscar | ✅ form | — | — | OK |
| Actividad filtros | ✅ botones | — | ❌ toolbar | P2 |
| Home action cards | ✅ botones | — | — | OK (touch P1) |

---

## 7. Dialog / popover audit

| Superficie | role/modal/label | Focus trap | Escape | Restore focus | inert fondo |
|------------|------------------|------------|--------|---------------|-------------|
| Crear Marca | ✅ | Parcial (leak) | ✅ | ✅ trigger | ❌ |
| Cambio Marca + draft | ✅ | `mountDialogRoot` | ✅ | ❌ | ❌ |
| Brand switcher panel | listbox parcial | — | ✅ | ✅ trigger | — |

---

## 8. Screen reader audit

**Fortalezas:** headings por página; Home con `aria-labelledby`; actividad `aria-pressed`; errores `role="alert"`; loading `aria-busy`.

**Problemas principales:** chat live region amplia (P1); mensajes sin emisor (P2); toggles detalle (P1); status bar fuera de main (P2).

**Estrategia recomendada chat (Parte B):** no mantener `aria-live` en `#chat-thread`; anunciar solo inserciones nuevas vía región dedicada o `#status-bar`.

---

## 9. Contraste (Light / Dark)

### Dark (default)

| Par | Ratio estático | WCAG AA |
|-----|----------------|---------|
| `--color-text-primary` on `--color-bg` | >15:1 | PASS |
| `--color-text-muted` on `--color-bg` | >7:1 | PASS |
| `#fff` on `--color-primary` `#685CFF` | ~4.65:1 | PASS texto normal |
| `--color-border` on `--color-surface` | ~1.3:1 | **FAIL 1.4.11** |
| `--color-cyan` focus ring on dark | OK perceptual | PASS |

### Light (`prefers-color-scheme: light`)

| Par | Ratio estático | WCAG AA |
|-----|----------------|---------|
| Texto primary on off-white | >12:1 | PASS |
| `--color-text-muted` `#64748b` on `#F8FAFC` | ~4.4:1 | Borderline P2 |
| Bordes `#E2E8F0` on white | >3:1 | PASS UI |

**Regla Parte B:** ajustar solo tokens DS (`colors.css` / alias en `tokens.css`), no colores ad hoc.

---

## 10. Touch targets

| Control | min-height | 44×44 | Estado |
|---------|------------|-------|--------|
| `.shell__menu-toggle` | 44px | ✅ | OK |
| `.brand-switcher__trigger` | 44px | ✅ | OK |
| `.btn` / `.btn--ghost` | 44px | ✅ | OK |
| `.shell__sidebar-link` | 44px | ✅ | OK |
| `.activity-filter` | 44px | ✅ | OK |
| `.example-chip` | 44px | ✅ | OK |
| `.action-card__cta` | **no definido** | ❌ | **P1** |

---

## 11. Responsive audit

| Breakpoint | Comportamiento | Archivo | Estado |
|------------|----------------|---------|--------|
| `<899px` | Sidebar overlay; **main oculto si abierto** | `app.css:1264-1267` | P0 |
| `≥900px` | Sidebar fija | `app.css:1247-1261` | OK |
| `≥640px` | Home 2 cols; knowledge row | `app.css:1215-1238` | OK |
| `≥1024px` | Home action grid 4 cols | `app.css:1241-1244` | OK |
| `max 639px` | Activity cards 1 col | `app.css` | OK |

**Viewports a validar en Parte E:** 320, 375, 390, 414, 768, 1024, 1280, 1440.

**Riesgo:** composer horizontal sin stack en `<640px` (P2).

---

## 12. Zoom / reflow

| Prueba | Parte A |
|--------|---------|
| 200% browser zoom | No ejecutado |
| 400% zoom | No ejecutado |
| Reflow 320px | Riesgo por header/composer (P2) |

---

## 13. Reduced motion

| Elemento | Cubierto |
|----------|----------|
| Global transitions/animations | ✅ `tokens.css:97-104` |
| Brand skeleton | ✅ `app.css:1209-1213` |
| Test presencia regla CSS | ✅ `phase-3h.test.ts` |

**Veredicto reduced motion:** PASS (estático).

---

## 14. Estados (Home / Chat / Conocimiento / Actividad / Marcas / Shell)

| Página | loading | empty | error | retry | modal |
|--------|---------|-------|-------|-------|-------|
| Home | ✅ `aria-busy` | ✅ | ✅ | ✅ | — |
| Chat | ✅ | ✅ | ✅ + retry | ✅ | corrección hidden |
| Conocimiento | ✅ | ✅ | ✅ | ✅ | — |
| Actividad | ✅ | ✅ | ✅ | ✅ | — |
| Marcas | ✅ skeleton | ✅ | ✅ | ✅ | ✅ parcial |
| Shell | ✅ status | — | — | — | listbox parcial |

---

## 15. Design System compliance

| Regla | Estado |
|-------|--------|
| Usar `design-system/tokens` | ✅ |
| Usar `icons.ts` (Lucide) | ✅ |
| No segunda librería iconos | ✅ |
| No cambiar logo | ✅ |
| Light + Dark | ✅ `prefers-color-scheme` |
| No colores hardcoded innecesarios | ⚠️ algunos `#fff` en botones (aceptable) |

---

## 16. Test coverage audit

| Herramienta | Presente |
|-------------|----------|
| Vitest + jsdom | ✅ |
| axe-core | ❌ |
| Tests keyboard/focus/ARIA | Mínimos |

**Tests con algo a11y:** `brand-switcher.test.ts` (listbox role), `workspace-switch.test.ts` (dialog), `brands.test.ts` (dialog DOM), `phase-3h.test.ts` (reduced motion CSS).

**Gap:** 0 tests de Escape/foco sidebar, flechas listbox, `aria-expanded`, viewport overflow.

---

## 17. Riesgos

1. **Sidebar móvil (P0):** usuarios teclado/móvil pueden perder acceso al contenido con menú abierto.
2. **Chat SR (P1):** anuncios repetitivos degradan experiencia VoiceOver/NVDA.
3. **Modales sin inert (P1):** riesgo de interacción con contenido de fondo.
4. **Contraste bordes (P1):** usuarios con baja visión pueden no distinguir controles.
5. **Sin prueba SR/zoom real:** hallazgos inferidos de código; validación manual pendiente Parte E.

---

## 18. Decisiones necesarias (antes de Parte B)

1. **Chat announcements:** ¿live region por mensaje, `role="log"`, o solo `#status-bar`?
2. **Modales:** ¿unificar todo en `mountDialogRoot` + `inert` en `#shell-body`?
3. **Listbox:** ¿listbox APG puro o combobox?
4. **Sidebar móvil:** ¿drawer overlay vs off-canvas sin ocultar main?
5. **Contraste bordes:** ¿ajustar token DS global o solo alias web?
6. **Tests:** ¿añadir `vitest-axe` o tests manuales documentados?

---

## 19. Propuesta de implementación (Parte B — pendiente aprobación)

### Orden sugerido

1. **P0:** sidebar móvil drawer (3I-P0-01)
2. **P1 teclado/foco:** listbox, sidebar trap, modales inert, composer focus, restore focus workspace-switch
3. **P1 SR:** chat live region, `aria-expanded` toggles, label corrección
4. **P1 visual/touch:** border token, action-card CTA targets
5. **P1 técnico:** `trapDialogFocus` cleanup / migrar a `mountDialogRoot`
6. **P2** según tiempo: skip link, title, main focus, composer stack, etc.

### Alcance explícito Parte B

- Solo `apps/web`
- Sin `packages/*`
- Sin features nuevas
- Reutilizar tokens DS + `icons.ts`
- Tests donde protejan comportamiento real

### Documentación posterior (Parte B/C)

- `releases/WEB_UI_PHASE_3I_ACCESSIBILITY_RESPONSIVE_IMPLEMENTATION.md`
- Actualizar `VERSION.md`, `docs/README.md`

### Quality gate objetivo Parte B

```
pnpm --filter @atlas/web test
pnpm --filter @atlas/web typecheck
pnpm --filter @atlas/web lint
pnpm --filter @atlas/web build
pnpm test
pnpm build
pnpm atlas doctor
git diff --name-only packages/  → vacío
```

---

## 20. Conteo por severidad

| Severidad | Cantidad |
|-----------|----------|
| **P0** | 1 |
| **P1** | 11 |
| **P2** | 13 |
| **P3** | 5 |

---

## Referencias

- Baseline DS: `fe56c69` — `feat(web): integrate ATLAS design system`
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WAI-ARIA APG Listbox: https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
- Código: `apps/web/src/client/`, `apps/web/src/client/styles/`
- Design System: `apps/web/design-system/`
- Tests: `apps/web/tests/client/`

---

**Auditoría Parte A completada — DETENIDO. Esperar aprobación explícita antes de Parte B (implementación).**
