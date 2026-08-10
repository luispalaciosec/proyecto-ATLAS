# Fix: congelamiento al navegar a Chat (`/chat`)

**Fecha:** 2026-08-10  
**Tipo:** Hotfix P0 post-3I — navegación SPA  
**Commit base afectado:** `5d2c97c` — `feat(web): phase 3I accessibility and responsive WCAG P0/P1`  
**Alcance:** `apps/web/` únicamente

---

## VEREDICTO

### **PASS** — hotfix verificado

Chrome dejaba de responder al hacer clic en **Conversación** (o cualquier navegación que montara Chat con historial pendiente). Causa: bucle síncrono de re-render en el suscriptor global de estado. Corregido con render incremental por ruta/marca.

---

## 1. Síntoma reportado

| Síntoma | Evidencia |
|---------|-----------|
| Clic en sidebar **Conversación** sin respuesta aparente | URL cambia a `/chat` pero UI congelada |
| Chrome: **«La página no responde»** | Main thread bloqueado |
| Imposible interactuar (clic derecho incluido) | Bucle infinito JS |

**Nota:** errores `contentscript.js` / `ObjectMultiplex` en consola provienen de **extensiones del navegador** (p. ej. MetaMask), no de ATLAS.

---

## 2. Causa raíz

El suscriptor en `app.ts` ejecutaba `renderCurrentRoute()` en **cada** `patchState()`:

```
setRoute('/chat')
  → renderChat()
    → preloadHistory()
      → patchState({ chatHistoryLoading: true })   // emit anidado
        → renderCurrentRoute() otra vez            // antes de marcar ruta renderizada
          → renderChat() → innerHTML de nuevo
            → … recursión hasta stack overflow
```

Factores que amplificaban el bucle:

1. `markRenderedRoute()` se llamaba **después** de `renderCurrentRoute()`, permitiendo emisiones anidadas durante el montaje.
2. `consumePendingChatDraft()` hacía `patchState` incluso cuando no había borrador.
3. `preloadHistory()` no tenía guard de reentrada si ya estaba cargando.

Efecto colateral detectado en tests: peticiones async de Home (`loadHomeData`) pintaban secciones tras abandonar `/` — corregido con guards de DOM.

---

## 3. Corrección

| Archivo | Cambio |
|---------|--------|
| `apps/web/src/client/app.ts` | Render completo solo si cambian **ruta** o **marca**; resto vía `refresh*View()`. `markRenderedRoute()` **antes** de montar. |
| `apps/web/src/client/pages/chat.ts` | Guard en `preloadHistory()` si ya carga o historial cargado para workspace. |
| `apps/web/src/client/state/app-state.ts` | `consumePendingChatDraft()` solo emite si había borrador. |
| `apps/web/src/client/pages/home.ts` | No pintar secciones Home si el DOM ya no es Home (navegación rápida). |
| `apps/web/tests/client/app-navigation.test.ts` | Test regresión: `mountApp` + `setRoute('/chat')` sin stack overflow. |

---

## 4. Archivos modificados

- `apps/web/src/client/app.ts`
- `apps/web/src/client/pages/chat.ts`
- `apps/web/src/client/pages/home.ts`
- `apps/web/src/client/state/app-state.ts`
- `apps/web/tests/client/app-navigation.test.ts` *(nuevo)*

**Sin cambios** en `packages/*`, Kernel, contratos Frozen.

---

## 5. Tests

| Suite | Resultado |
|-------|-----------|
| `app-navigation.test.ts` | Abrir `/chat` no congela |
| `@atlas/web` total | **144/144 PASS** |

---

## 6. Quality gate

| Comando | Resultado |
|---------|-----------|
| `pnpm --filter @atlas/web test` | ✅ 144/144 |
| `pnpm --filter @atlas/web typecheck` | ✅ PASS |
| `pnpm --filter @atlas/web lint` | ✅ PASS |
| `pnpm --filter @atlas/web build` | ✅ PASS |
| `pnpm atlas doctor` | ✅ HEALTHY |
| `git diff --name-only packages/` | ✅ vacío |

---

## 7. Smoke test manual

1. `pnpm --filter @atlas/web build && pnpm atlas web`
2. Abrir `http://127.0.0.1:4173/`
3. Clic **Conversación** → debe cargar Chat sin diálogo «página no responde»
4. Volver a **Inicio** y repetir con **Conocimiento**, **Actividad**, **Marcas**
5. Recarga forzada (`Cmd+Shift+R`) y repetir paso 3

---

## 8. Governance

- Solo `apps/web/` + `releases/` + `VERSION.md`
- `design/` permanece **fuera** del commit (untracked local)
- No P2/P3 de accesibilidad en este hotfix

---

## 9. Relación con Fase 3I

El bug era **preexistente** en el patrón `subscribe → renderCurrentRoute()` (visible desde `fe56c69`), pero se manifestó con fuerza tras 3I al aumentar las emisiones de estado (`status-bar`, drawer, modales). Este fix es independiente del alcance WCAG 3I y no revierte cambios de accesibilidad.
