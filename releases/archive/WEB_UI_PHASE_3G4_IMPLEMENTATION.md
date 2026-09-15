# ATLAS Web UI — Fase 3G.4 — Home Polish + Coherencia de Producto

**Fecha:** 2026-08-09  
**Estado:** **PASS**  
**Prerequisito:** [`WEB_UI_PHASE_3G4_AUDIT.md`](./WEB_UI_PHASE_3G4_AUDIT.md) aprobado

---

## 1. Objetivo

Convertir la Home en el **centro de trabajo de ATLAS**: contexto de Marca claro, acción principal inequívoca (Conversar), continuidad con historial real, bloques secundarios de Conocimiento y Actividad — sin dashboard artificial ni jerga técnica.

---

## 2. Auditoría (referencia)

Ver [`WEB_UI_PHASE_3G4_AUDIT.md`](./WEB_UI_PHASE_3G4_AUDIT.md). Gaps P0 cerrados en esta entrega.

---

## 3. Decisiones UX aplicadas

| Decisión | Resolución |
|----------|------------|
| Banner aislamiento en Home | **Eliminado** — se mantiene en Chat, Conocimiento y Actividad |
| Contexto principal | **«Trabajando en General»** / **«Trabajando con {Marca}»** bajo el hero |
| Shell | Selector compacto sin cambios de arquitectura (3G.3) |
| Conversaciones recientes | Hasta **3** entradas desde `GET /api/history` (mensajes de usuario) |
| Conocimiento en Home | Bloque **estático** + CTA «Explorar conocimiento» |
| Jerarquía acciones | **Primaria:** Conversar con ATLAS — **Secundarias:** 3 acciones compactas |

---

## 4. Cambios implementados

### Home (`apps/web/src/client/pages/home.ts`)

- Reestructuración completa con estado de página (`homeState`) y carga paralela history + activity.
- Hero + contexto «Trabajando con/en».
- Zona primaria `.home-primary` con CTA «Empezar una conversación».
- Acciones secundarias en `.home-secondary` (Conocimiento, otra Marca, Actividad).
- Ejemplos vía `setPendingChatDraft()` (no auto-envío).
- Sección **«Continúa donde lo dejaste»** con empty / loading / error + retry.
- Bloque estático **Conocimiento de tu marca**.
- Sección **Actividad reciente** (máx. 3) con empty / error + retry.
- Export `refreshHomeView()` para recarga async.
- Sin banner de aislamiento en Home.

### Historial (`apps/web/src/client/lib/history.ts`)

- `deriveRecentConversationEntries()` — hasta 3 mensajes de usuario con título humano y nombre de Marca.

### i18n (`apps/web/src/i18n/es.ts`)

- Copy Home 3G.4: contexto, primaria, secundarias, continuidad, conocimiento, actividad, ejemplos pyme.

### Estilos (`apps/web/src/client/styles/app.css`)

- Jerarquía visual: `.home-primary`, `.home-secondary`, `.home-continue-*`, `.home-knowledge`, `.home-activity-*`, `.home-empty`, `.home-error`.
- Responsive: primaria en fila desde 640px; secundarias en grid 3 columnas.

---

## 5. Archivos

### Creados

| Archivo |
|---------|
| `releases/WEB_UI_PHASE_3G4_IMPLEMENTATION.md` |

### Modificados

| Archivo | Cambio |
|---------|--------|
| `apps/web/src/client/pages/home.ts` | Home 3G.4 completa |
| `apps/web/src/client/lib/history.ts` | Entradas recientes para Home |
| `apps/web/src/i18n/es.ts` | Copy Home |
| `apps/web/src/client/styles/app.css` | Estilos Home premium |
| `apps/web/tests/client/home.test.ts` | 20 tests Home |
| `apps/web/tests/client/history.test.ts` | Test `deriveRecentConversationEntries` |
| `VERSION.md` | Entrada 3G.4 |
| `docs/README.md` | Enlaces 3G.4 |

---

## 6. Arquitectura

```text
Browser → apps/web (Express) → SessionStore → @atlas/cli → SDK / Memory
```

- Home compone `fetchHistory`, `fetchActivity`, `resolveBrandDisplayName`, `setPendingChatDraft`.
- Sin lectura de `.atlas`, sin duplicar SessionStore, sin tocar Kernel.

---

## 7. Tests

**`@atlas/web`:** 126/126 PASS

Cobertura Home ampliada:

1. General + contexto «Trabajando en General»
2. Marca activa (Geeks) sin slug visible
3. Hero + contexto
4. CTA primaria → Chat
5. Ejemplo → `pendingChatDraft`
6. Ejemplo no auto-envía
7. Historial vacío
8. Historial 1 elemento
9. Historial hasta 3 elementos
10. Marca humana en historial
11. Error historial + retry
12. Bloque Conocimiento
13. CTA Conocimiento → `/conocimiento`
14. Actividad vacía
15. Actividad con resultados
16. Error actividad + retry
17. Clases responsive/estructura
18. Sin banner en Home
19. Sin regresión shell selector
20. CTAs navegación

---

## 8. Quality gate

| Comando | Resultado |
|---------|-----------|
| `pnpm --filter @atlas/web test` | **PASS** (126/126) |
| `pnpm --filter @atlas/web typecheck` | **PASS** |
| `pnpm --filter @atlas/web lint` | **PASS** |
| `pnpm --filter @atlas/web build` | **PASS** |
| `pnpm test` | **PASS** |
| `pnpm build` | **PASS** |
| `pnpm typecheck` | **PASS** |
| `pnpm lint` | **PASS** |
| `pnpm atlas doctor` | **HEALTHY** |

---

## 9. Accesibilidad

- Headings semánticos (`h1` hero, `h2` secciones, `h3` empty states).
- Botones reales; targets ≥44px.
- `aria-live` / `aria-busy` en secciones async (continuar, actividad).
- Focus visible en acciones secundarias y primaria.
- Navegación teclado en botones y chips.

---

## 10. Responsive

- Mobile: columna única; orden DOM = jerarquía producto.
- Tablet/desktop (≥640px): primaria horizontal; secundarias en grid 3 cols; items continuar en fila.

---

## 11. Smoke test manual (checklist)

| # | Escenario | Esperado |
|---|-----------|----------|
| S1 | Home con General | «Trabajando en General» |
| S2 | Cambiar a Geeks | Shell + Home coherentes |
| S3–S4 | Volver a Home | Contexto Geeks visible |
| S5–S6 | Chat desde Home y volver | CTA primaria OK |
| S7–S8 | Conocimiento y volver | Bloque estático + nav OK |
| S9 | Actividad | Secundaria OK |
| S10–S11 | Conversación + Home | «Continúa donde lo dejaste» |
| S12–S13 | Cambio Marca | Historial/actividad aislados |
| S14 | F5 | Sin rotura |
| S15 | Sin datos | Empty states elegantes |

---

## 12. Governance check

```bash
git diff --name-only  # archivos 3G.4 en apps/web/, releases/, docs/, VERSION.md
```

**Confirmado:** ningún archivo en `packages/core`, `compiler`, `runtime`, `memory`, `retrieval`, `events`, `intelligence`, `sdk`, `cli`, `llm` modificado por 3G.4.

---

## 13. Limitaciones

- Timestamps de historial no se muestran en Home (mapper no expone fechas reales de sesión).
- Actividad sigue siendo in-memory por sesión Web (3F).
- `refreshHomeView()` disponible; recarga principal vía `renderHome()` en cambio de ruta/marca.
- Sin `prefers-reduced-motion` global (deuda heredada).

---

## 14. Decisiones menores tomadas en implementación

- Recarga silenciosa de datos al volver a Home si ya hay contenido cacheado (evita flicker).
- Lista de conversaciones = últimos mensajes **de usuario** (no sesiones separadas — API única).
- CTA actividad con datos usa «Ver actividad» (misma etiqueta que empty CTA).

---

## 15. Veredicto

**PASS**

La Home responde en segundos qué es ATLAS, con qué Marca se trabaja, qué hacer y cuál es el siguiente paso (Conversar). Historial y actividad son datos reales; sin métricas inventadas; errores parciales con retry; coherencia con 3G.3.

---

## 16. Próxima fase recomendada

**3G.5 o 3H** — Pulido transversal restante (Configuración, copy residual «espacio de trabajo» en Actividad, `prefers-reduced-motion`) o piloto de uso real según roadmap producto.
