# ATLAS — Go / No-Go del piloto real controlado

**Fecha:** 2026-08-09  
**Propósito:** criterios claros para iniciar, pausar y cerrar el piloto  
**Principio:** el piloto termina cuando hay **evidencia suficiente para decidir**, no cuando todo es perfecto

---

## 1. GO — Condiciones para iniciar el piloto

Todas deben cumplirse:

| # | Condición | Verificación |
|---|-----------|--------------|
| G1 | Fase 3H declarada **READY FOR PILOT** | `WEB_UI_PHASE_3H_IMPLEMENTATION.md` |
| G2 | `@atlas/web` tests **134/134 PASS** (último gate conocido) | CI o ejecución local pre-piloto |
| G3 | `pnpm atlas doctor` → **HEALTHY** en entorno piloto | Antes de sesión 1 |
| G4 | LLM configurado (`.env`) o plan explícito solo deterministic | Facilitador |
| G5 | **Facilitador designado** capaz de arrancar `pnpm atlas web` | Rol asignado |
| G6 | Usuarios reclutados (≥2 perfiles pyme no técnicos) | Lista anónima |
| G7 | Protocolo leído (`ATLAS_PILOT_PROTOCOL.md`) | Facilitador |
| G8 | Plantillas feedback y backlog listas | Este paquete docs |
| G9 | Reglas piloto aceptadas (sin features mid-pilot) | Equipo producto |
| G10 | Briefing usuario sobre **sesión local** y **Marca** preparado | Script §3 protocolo |
| G11 | **Ningún paquete Frozen** modificado en preparación | `git diff packages/` vacío |
| G12 | Expectativa alineada: **no es SaaS cloud autónomo** | Stakeholders |

**Veredicto GO actual (documentación):** **SÍ** — cumple G1–G3, G7–G9, G11 según auditoría 2026-08-09. **Pendiente operativo:** G4–G6, G10, G12 por equipo piloto.

---

## 2. NO-GO — Condiciones que bloquean el piloto

Cualquiera **bloquea** inicio o **pausa** sesiones hasta resolver:

| # | Condición | Acción |
|---|-----------|--------|
| N1 | `@atlas/web` tests fallando en entorno piloto | Arreglar + gate antes de usuarios |
| N2 | `pnpm atlas doctor` no HEALTHY | No invitar usuarios |
| N3 | LLM no configurado **y** tareas requieren conversación IA | Configurar o limitar alcance deterministic |
| N4 | Sin facilitador técnico disponible | No iniciar |
| N5 | Modificación no autorizada en paquetes Frozen | STOP — revertir / investigar |
| N6 | Usuarios creerán que es producto cloud multiusuario | Corregir expectativas — NO-GO hasta briefing |
| N7 | P0 bug reproducible que impide conversación o mezcla Marcas | Hotfix documentado o pausa |
| N8 | Datos sensibles reales sin acuerdo de tratamiento local | NO-GO legal/operativo |

---

## 3. DURANTE EL PILOTO — Continue / Pause

### Continue sesiones

- Facilitador presente.
- Doctor HEALTHY.
- Hallazgos registrados en backlog semanalmente.

### Pause sesiones

- N7 activo.
- Facilitador ausente sin reemplazo.
- &lt;50% sesiones registradas en feedback (proceso roto).

---

## 4. PILOT ACCEPTED — Cierre con evidencia suficiente

El piloto se considera **completado con evidencia** cuando:

| # | Criterio | Umbral sugerido |
|---|----------|-----------------|
| A1 | Semanas ejecutadas | ≥3 de 4 planificadas |
| A2 | Usuarios únicos observados | ≥3 |
| A3 | Sesiones con plantilla completa | ≥8 |
| A4 | Tareas protocolo cubiertas | ≥8 de 12 al menos una vez |
| A5 | Hallazgos en backlog | ≥10 ítems clasificados |
| A6 | Temas recurrentes identificados | ≥3 con frecuencia ≥2 |
| A7 | Decisión tomada en ≥80% ítems P0/P1 | FIX / BUILD / DOCUMENT / IGNORE |
| A8 | Resumen cierre escrito | Top fricciones + recomendación |
| A9 | **No** se implementaron features reactivas sin registro | Revisión git apps/web |

**No requiere:** satisfacción 100%, cero errores LLM, cero confusión.

---

## 5. Post-piloto — Decisiones posibles

| Resultado | Significado | Siguiente paso |
|-----------|-------------|----------------|
| **CONTINUE PRODUCT** | Valor observado; fricciones acotables | Roadmap FIX/IMPROVE desde backlog |
| **PIVOT SCOPE** | Valor en nicho distinto (ej. solo Conocimiento) | Redefinir propuesta |
| **NEEDS ARCHITECTURE** | Bloqueadores de persistencia/auth/cloud | ADR antes de build |
| **PAUSE** | Evidencia insuficiente o entorno inválido | Repetir piloto |

---

## 6. Checklist rápido pre-sesión

```text
[ ] atlas doctor HEALTHY
[ ] atlas web running
[ ] LLM OK (si aplica)
[ ] Marca inicial definida
[ ] Plantilla feedback abierta
[ ] Usuario briefeado (sesión local)
[ ] Observador acordado
```

---

## 7. Checklist rápido post-sesión

```text
[ ] ATLAS_PILOT_FEEDBACK.md completado
[ ] Hallazgos trasladados a backlog
[ ] ¿Algo P0? → pause + registrar
[ ] ¿Implementación impulsiva? → NO
```

---

## 8. Veredicto documentación (2026-08-09)

| Gate | Estado |
|------|--------|
| GO técnico/documental | **PASS** |
| GO operativo (usuarios + facilitador) | **Pendiente equipo** |
| NO-GO activo | **Ninguno** conocido |

**Recomendación:** **READY FOR PILOT** una vez asignados facilitador, usuarios y LLM en entorno piloto.

---

## Referencias

- [`ATLAS_PILOT_READINESS_AUDIT.md`](./ATLAS_PILOT_READINESS_AUDIT.md)
- [`ATLAS_PILOT_PROTOCOL.md`](./ATLAS_PILOT_PROTOCOL.md)
- [`ATLAS_PILOT_FEEDBACK.md`](./ATLAS_PILOT_FEEDBACK.md)
- [`ATLAS_PILOT_EVIDENCE_BACKLOG.md`](./ATLAS_PILOT_EVIDENCE_BACKLOG.md)
