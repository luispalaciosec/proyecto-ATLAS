# ATLAS Web UI — Fase 3H — Auditoría pre-implementación

**Fecha:** 2026-08-09  
**Referencia:** [`WEB_UI_WORLD_CLASS_FINAL_AUDIT.md`](./WEB_UI_WORLD_CLASS_FINAL_AUDIT.md)  
**Veredicto previo:** NEEDS POLISH BEFORE PILOT  
**Alcance:** Verificación en código — **sin implementación en esta fase**

---

## 1. Estado actual

- **Fases completadas:** P2.5, 3A–3G.4 (Home polish).
- **Tests `@atlas/web`:** 126/126 PASS (último gate 3G.4).
- **Arquitectura:** sin cambios en paquetes Frozen; producto en `apps/web/`.
- **Documentos revisados:** Final Audit, 3G.4/3G.3/3G.2 Implementation, 3F/3E Implementation, `docs/WEB_UI_PRODUCT_UX.md`, `VERSION.md`.  
  **Nota:** no existe `releases/WEB_UI_PHASE_3G_IMPLEMENTATION.md` (sí `WEB_UI_PHASE_3_IMPLEMENTATION.md`).

---

## 2. Hallazgos P1 confirmados (siguen en código)

| ID | Hallazgo | Evidencia actual | Confirmado |
|----|----------|------------------|------------|
| **P1-01** | Dead-end Configuración/LLM | `chat.correctLlmRequired` L109–110 → «Configuración → Inteligencia artificial»; Configuración = Próximamente (`app.ts`) | **Sí** |
| **P1-02** | «espacio de trabajo» | `activity.subtitle` L133 | **Sí** |
| **P1-02b** | «espacio principal» | `workspace.generalHint` L35 | **Sí** |
| **P1-03** | Vocabulario Marca inconsistente | Home «Trabajando con» vs shell/chat/chips «Marca activa» (`workspace.label`, `workspace.active`) | **Sí** |
| **P1-04** | Historial no comunica límite sesión | `home.continueEmptyBody` promete continuar «después» sin calificador de sesión | **Sí** |
| **P1-05** | «Continúa donde lo dejaste» vs datos reales | `deriveRecentConversationEntries` = últimos mensajes usuario, un hilo; título implica conversaciones | **Sí** |
| **P1-06** | Actividad Home sin alcance sesión | `/actividad` tiene `activity.scopeNote`; Home preview no | **Sí** |
| **P1-07** | Confirmación en cada cambio Marca | `workspace-switch.ts` L158–168: `needsConfirm = skipConfirm !== true` siempre | **Sí** |
| **P1-08** | prefers-reduced-motion | **Parcialmente resuelto** en `tokens.css` L98–105; skeleton animation en `app.css` | **Parcial** |

---

## 3. Hallazgos ya resueltos (desde Final Audit)

| Item | Estado |
|------|--------|
| Home sin banner aislamiento | **Resuelto** (3G.4) |
| Home jerarquía primaria Conversar | **Resuelto** (3G.4) |
| Ejemplos vía `pendingChatDraft` | **Resuelto** (3G.4) |
| Errores técnicos en mensaje principal (429, tool_use) | **Resuelto** (`format-error.ts`) |
| Slugs visibles en UI | **Resuelto** (`resolveBrandDisplayName`) |
| Selector shell unificado API brands | **Resuelto** (3G.3) |
| Actividad scope en página completa | **Resuelto** (3F) |
| prefers-reduced-motion base | **Resuelto** en tokens (extender cobertura si hace falta) |

---

## 4. Hallazgos P2/P3 — fuera de scope 3H

No se implementarán en esta fase salvo copy trivial durante revisión transversal:

- Redundancia chip + banner (P2)
- 👍/👎 ausentes (P3)
- Configuración nav sin indicador Próximamente (P2)
- Unificación empty-state helpers (P3)
- `chat.deterministicSuccess` tono (P2 — opcional en polish transversal)

---

## 5. Archivos afectados (propuesta)

| Archivo | Cambios P1 |
|---------|------------|
| `src/i18n/es.ts` | Copy Marca, sesión, LLM, actividad |
| `src/i18n/index.ts` | Export `formatWorkingContext` (sin circular deps vía `lib/brand-context.ts`) |
| `src/client/lib/brand-context.ts` | **Nuevo** — helper contexto Marca |
| `src/client/lib/workspace-switch.ts` | Confirm solo con draft |
| `src/client/pages/home.ts` | Copy honesto historial/actividad + scope note |
| `src/client/pages/chat.ts` | Subtítulo `formatWorkingContext` |
| `src/client/pages/knowledge.ts` | context-chip working context |
| `src/client/pages/activity.ts` | subtitle + context-chip |
| `src/client/components/shell.ts` | Label shell compacto |
| `tests/client/workspace-switch.test.ts` | Switch sin draft |
| `tests/client/home.test.ts` | Copy sesión |
| `tests/client/phase-3h.test.ts` | **Nuevo** — garantías piloto |
| `tests/i18n/index.test.ts` | Actualizar expectativas |

---

## 6. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Cambio confirmación Marca → cambio accidental | Mantener confirm cuando hay draft/borrador composer |
| Copy sesión alarmista | Tono calmado, no técnico |
| Tests rotos por copy | Actualizar assertions, no relajar cobertura |
| Tocar Frozen packages | **Prohibido** — detener si surge necesidad |

---

## 7. Propuesta de implementación (Fase B)

1. **P1.1** — Mensajes LLM sin referencia a Configuración; acción clara (contactar quien instaló ATLAS).
2. **P1.2–P1.3** — Unificar `formatWorkingContext`; eliminar «espacio de trabajo/principal»; shell label secundario «Marca».
3. **P1.4–P1.5** — Renombrar sección Home a «Últimas preguntas de esta sesión» + empty/loading honestos.
4. **P1.6** — Nota discreta alcance sesión en Home actividad.
5. **P1.7** — `shouldConfirmBrandSwitch()` = `hasUnsavedDraft()` only.
6. **P1.8** — Verificar `prefers-reduced-motion` en tokens; asegurar skeleton respeta reduce.

**Sin:** threads, persistencia, Configuración funcional, cambios Kernel.

---

## 8. Explícitamente fuera de scope

Cloud, Auth, multi-user, streaming, persistencia durable chat/activity, edición conocimiento, eliminar marcas, dashboard KPIs, AI settings UI, packages Frozen.

---

## 9. Veredicto auditoría

**Hallazgos P1 confirmados: 8/8** (P1-08 parcial ya en tokens).

**Autorizado proceder a Fase B — implementación P1.**

---

**Detener auditoría. Continuar implementación.**
