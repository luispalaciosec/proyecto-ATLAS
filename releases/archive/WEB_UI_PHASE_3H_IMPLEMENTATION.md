# ATLAS Web UI — Fase 3H — Pilot Polish + World-Class UX

**Fecha:** 2026-08-09  
**Estado:** **READY FOR PILOT** (piloto controlado)  
**Prerequisitos:** [`WEB_UI_WORLD_CLASS_FINAL_AUDIT.md`](./WEB_UI_WORLD_CLASS_FINAL_AUDIT.md), [`WEB_UI_PHASE_3H_AUDIT.md`](./WEB_UI_PHASE_3H_AUDIT.md)

---

## 1. Objetivo

Cerrar los **P1 pre-piloto** detectados en la auditoría world-class final: eliminar dead-ends, unificar vocabulario de Marca, honestidad sobre historial/actividad de sesión, y reducir fricción innecesaria al cambiar de Marca — sin tocar Kernel ni paquetes Frozen.

---

## 2. Hallazgos confirmados (Fase A)

Ver [`WEB_UI_PHASE_3H_AUDIT.md`](./WEB_UI_PHASE_3H_AUDIT.md). Los 8 P1 del Final Audit estaban presentes; P1-08 (`prefers-reduced-motion`) parcialmente resuelto en tokens, extendido en app.css.

---

## 3. Cambios implementados (Fase B)

### P1.1 — Dead-end Configuración/LLM

| Antes | Después |
|-------|---------|
| «Configuración → Inteligencia artificial» | «Pide a quien instaló ATLAS que configure el servicio de IA» |

Archivos: `i18n/es.ts` (`errors.llmRequired`, `chat.correctLlmRequired`).

### P1.2 — Vocabulario consistente

- Eliminado «espacio de trabajo» → `activity.subtitle`
- Eliminado «espacio principal» → `workspace.generalHint`
- Sin «Marca activa» como concepto principal en páginas

### P1.3 — Marca activa unificada

- Nuevo helper `formatWorkingContext()` en `lib/brand-context.ts`
- Home, Chat, Conocimiento, Actividad: «Trabajando en General» / «Trabajando con {Marca}»
- Shell: etiqueta compacta «Marca» + nombre humano en trigger

### P1.4 — Honestidad historial

- Copy Home: «Últimas preguntas de esta sesión»
- Nota: «Una sola conversación por marca mientras ATLAS Web esté abierto»
- Empty/loading/error calificados por sesión

### P1.5 — Sin simular threads

- Título y empty honestos; mismos datos (`deriveRecentConversationEntries`)
- CTA «Abrir conversación» → Chat (hilo único por Marca)

### P1.6 — Actividad en Home

- Título: «Actividad reciente · Esta sesión»
- Nota: `workspace.sessionScopeNote`

### P1.7 — Confirmación Marca

- Confirmación **solo** si hay borrador (`pendingChatDraft` o composer con texto)
- Sin `window.confirm`; diálogo accesible existente

### P1.8 — prefers-reduced-motion

- Ya en `tokens.css`; añadido override skeleton en `app.css`

---

## 4. Decisiones UX

| Decisión | Resolución |
|----------|------------|
| Shell label | «Marca» compacto; contexto completo en páginas |
| Configuración nav | Permanece «Próximamente» — sin pantalla falsa |
| Threads | No simular — copy honesto |
| Confirmación Marca | Solo con riesgo de pérdida de borrador |

---

## 5. Archivos

### Creados

- `apps/web/src/client/lib/brand-context.ts`
- `apps/web/tests/client/phase-3h.test.ts`
- `releases/WEB_UI_PHASE_3H_AUDIT.md`
- `releases/WEB_UI_PHASE_3H_IMPLEMENTATION.md`

### Modificados

- `apps/web/src/i18n/es.ts`
- `apps/web/src/client/pages/home.ts`
- `apps/web/src/client/pages/chat.ts`
- `apps/web/src/client/pages/knowledge.ts`
- `apps/web/src/client/pages/activity.ts`
- `apps/web/src/client/components/shell.ts`
- `apps/web/src/client/lib/workspace-switch.ts`
- `apps/web/src/client/styles/app.css`
- Tests: `home`, `workspace-switch`, `brand-switcher`, `knowledge`, `format-error`, `i18n`
- `VERSION.md`, `docs/README.md`

---

## 6. Limitaciones honestas

- Historial y actividad **in-memory** por proceso `atlas web`
- Una conversación por Marca por sesión (no threads)
- Configuración / AI settings **no implementados** en UI
- Persistencia durable requiere fase futura con ADR

---

## 7. Tests

**134/134 PASS** `@atlas/web`

Nuevos/actualizados:

- `phase-3h.test.ts` — copy, LLM dead-end, sesión, reduced-motion CSS
- `workspace-switch.test.ts` — sin confirm sin draft; con draft sí
- `home.test.ts` — copy sesión
- `format-error.test.ts` — LLM sin Configuración

---

## 8. Quality gate

| Gate | Resultado |
|------|-----------|
| `@atlas/web` test/typecheck/lint/build | **PASS** |
| Monorepo test/build/typecheck/lint | **PASS** |
| `pnpm atlas doctor` | **HEALTHY** |

---

## 9. Accesibilidad

- Sin regresión: aria-live/busy, focus trap dialogs, botones reales
- `prefers-reduced-motion` reforzado para skeleton

---

## 10. Responsive

Sin cambios estructurales; notas de sección usan tipografía secundaria existente.

---

## 11. Governance

Cambios acotados a `apps/web/`, `releases/`, `docs/`, `VERSION.md`.

**Confirmado:** ningún paquete Frozen/Certified modificado.

---

## 12. Smoke test (checklist manual)

| # | Escenario | Esperado post-3H |
|---|-----------|------------------|
| S1–S3 | Primera visita / Home / Chat | Contexto «Trabajando en/con» |
| S6–S7 | Cambio Marca sin draft | **Directo**, sin diálogo |
| S9 | Cambio con draft | Diálogo + aviso borrador |
| S13 | Error LLM | Mensaje sin Configuración |
| S12 | F5 | Sesión coherente; copy honesto si vacío |

Ejecutar: `pnpm atlas web`

---

## 13. Gate final

| Criterio | Estado |
|----------|--------|
| P1 corregidos | **8/8** |
| Copy consistente | **PASS** |
| Sin dead-ends | **PASS** |
| Historial/actividad honestos | **PASS** |
| Cambio Marca sin fricción innecesaria | **PASS** |
| Tests/build/lint/doctor | **PASS** |
| Frozen packages | **NO tocados** |

---

## 14. Veredicto

### **READY FOR PILOT**

Piloto real de varias semanas con al menos una Marca — con expectativa documentada de sesión Web local y LLM preconfigurado fuera de UI.

---

## 15. Próximo paso recomendado

1. **Piloto controlado** con checklist S1–S15 + feedback usuarios pyme  
2. Post-piloto: P2 polish (reducir banners redundantes, tono deterministic, indicador Configuración)  
3. Persistencia durable — solo con ADR y fuera de scope polish
