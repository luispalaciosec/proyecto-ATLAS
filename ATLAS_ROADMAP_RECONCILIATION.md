# ATLAS — Reconciliación de Roadmap y Estado Real

**Document ID:** ATLAS-RECON-001
**Versión:** 1.0
**Fecha:** 2026-08-17
**Propósito:** Documento ancla para que cualquier sesión nueva (Claude, ChatGPT, Cursor, o Luis releyendo esto en tres meses) recupere el estado real de ATLAS sin depender de la memoria de ningún chat.

---

## 0. Regla de precedencia

Si algo dicho en un chat (este, el de ChatGPT, o cualquier otro) contradice este documento o los documentos que cita, **gana el documento**, no el chat. Las fuentes de verdad, en orden:

1. `adr/ADR-000X-*.md` — decisiones de arquitectura aceptadas.
2. `git log` / `git tag` sobre `origin/main` — lo que realmente está comiteado y pusheado.
3. `VERSION.md` (raíz del repo) — registro de versión de producto.
4. `ATLAS_ARCHITECTURE_MASTER.md` (raíz del repo) — mapa de arquitectura por fases.
5. Este documento — reconciliación entre lo anterior y las etiquetas conceptuales usadas en conversación.
6. Cualquier chat — nunca autoritativo por sí solo.

Este documento se debe actualizar cada vez que se cierre una ronda de trabajo verificada (mismo criterio que `VERSION.md`).

---

## 1. El problema que este documento resuelve

En conversación (con Claude y con ChatGPT) se ha usado una numeración conceptual — "ATLAS 3", "ATLAS 4", "ATLAS 5"... — para hablar de la evolución del producto. **Esa numeración no existe como tal en ningún documento del repo.** Lo que existe son dos esquemas reales, distintos entre sí:

- `ATLAS_ARCHITECTURE_MASTER.md` define **Phases de arquitectura** (Phase 0 a Phase 14).
- `VERSION.md` define **versión de producto** (`Atlas Version 0.1.0-alpha`, con su propio Phase 1 = Foundation & MVP, Phase 2 = Product con sprints P2.1–P2.5).

Ninguno de los dos usa "ATLAS 3/4/5...". Esa es la causa de la confusión: no es que se haya perdido información, es que la etiqueta conceptual nunca estuvo escrita en el repo hasta ahora.

---

## 2. Tabla de reconciliación

| Etiqueta conceptual (chat) | Qué es en realidad | Dónde vive en los documentos oficiales | Estado real | Evidencia (commit/tag) |
|---|---|---|---|---|
| **ATLAS 1.x / 2.x** (mencionado en chat, nunca definido por escrito) | No existe como documento formal bajo ese nombre. Lo más cercano: Phase 0 (Platform Foundation, arquitectura) + Phase 1 (Foundation & MVP, producto) | `ATLAS_ARCHITECTURE_MASTER.md` §Phase 0; `VERSION.md` §Phase 1 | Completo, congelado | Kernel v0.1, tag `kernel-v0.1.0-alpha.1`; MVP-1 a MVP-6, commit final `c5db504` |
| **ATLAS 3 — Knowledge Intelligence** | `@atlas/knowledge` + la biblioteca de conocimiento de la Web UI (ingesta, búsqueda, upload de documentos) | `ATLAS_ARCHITECTURE_MASTER.md` §Phase 1 (Knowledge); `VERSION.md` §P2.5 y §P2.5.x (Web UI, upload de documentos) | Completo | `@atlas/knowledge` v0.2.0 Stable; Web UI knowledge library, commit `aeea5f5` en adelante |
| **ATLAS 4 — Organizational Intelligence** | El módulo `packages/sdk/src/org/**` construido en esta sesión: Entities, Relationships, Policies versionadas, creación vía chat, Decision + Evidence | **No aparece en `ATLAS_ARCHITECTURE_MASTER.md` ni en `VERSION.md`** — es trabajo nuevo, posterior al último cierre documentado (Product Hardening Checkpoint) | Completo (4.1 + 4.2) | RFC: `ecfb79b`. Vertical slice 4.1: `fef9356`. Wire `atlas.org`: `86daf79`. Chat data entry: `7bd13c7`. Decision+Evidence 4.2: `2388eeb` (en `origin/main`) |
| **ATLAS 5 — Decision Intelligence** | Propuesta conceptual, sin RFC todavía | No existe en ningún documento | No iniciado — siguiente paso acordado | — |
| **ATLAS 6 — Operational Intelligence** | Propuesta conceptual (ChatGPT) | No existe en ningún documento | No iniciado, no comprometido | — |
| **ATLAS 7 — Autonomous Organizational Intelligence** | Propuesta conceptual (ChatGPT) | No existe en ningún documento | No iniciado, no comprometido | — |
| **ATLAS 8 — Organizational Learning** | Propuesta conceptual (ChatGPT) | No existe en ningún documento | No iniciado, no comprometido | — |

**Importante sobre 5–8:** esa numeración y esas definiciones (Decision Context, Alternatives, Confidence/Risk, Agents, Guardrails, Outcome Learning, etc.) fueron reconstruidas por ChatGPT el 2026-08-17 a partir de la arquitectura actual, **no recuperadas de un documento perdido**. Son una propuesta razonable y coherente, pero deben tratarse como eso — propuesta — hasta que cada nivel pase por el mismo proceso de RFC-audit que usamos para 4 y 4.2.

---

## 3. Los dos esquemas reales, completos

### 3.1 `ATLAS_ARCHITECTURE_MASTER.md` — Phases de arquitectura

| Phase | Nombre | Estado documentado |
|---|---|---|
| 0 | Platform Foundation (Kernel v0.1) | Completo, Congelado |
| 1 | Knowledge | Completo |
| 2 | Runtime Evolution (Sprints 10A–10D) | Completo, Congelado |
| 3 | Workflow | Completo, Congelado |
| 4 | Planning | Completo, Congelado (ADR-0002) |
| 5 | Memory | Completo — Session Engine Certified (ADR-0003) |
| 6 | Retrieval | Documento dice "Planned" — **desactualizado**: en realidad ya se implementó (ver §4) |
| 7 | Context | Planned — sin implementar (`@atlas/context` en `0.0.0`) |
| 8 | Reasoning | Planned — sin implementar (solo spec, sin paquete) |
| 9 | Architecture Consolidation | Deferred |
| 10 | Agents | Planned |
| 11 | Intelligence Engine | Planned |
| 12 | Governance | Planned |
| 13 | Platform Interfaces | Planned |
| 14 | ATLAS v1.0 | Target Release |

### 3.2 `VERSION.md` — Versión de producto

| Fase | Nombre | Estado |
|---|---|---|
| Phase 1 | Foundation & MVP (ADR-0001–0005, Kernel Frozen, MVP-1 a MVP-6) | **Cerrado** 2026-08-04 |
| P2.1 | LLM Adapter + Tool Calling | Completo |
| P2.2 | Conversación (`atlas chat`) | Completo |
| P2.3 | Brands & Workspaces | Completo |
| P2.4 | Feedback Loop (`/correct`) | Completo |
| P2.5 | Web UI (+ Fase 3 consolidada: SPA, biblioteca de conocimiento, upload) | Completo |
| Checkpoint | Product Hardening post-P2.5 | Cerrado — recomendó piloto real antes de seguir, no P2.6 Cloud |
| — | **Trabajo de esta sesión (ATLAS 4.x / org/)** | **No registrado todavía en VERSION.md** |

---

## 4. Inconsistencia real encontrada (para que quede documentada, no oculta)

`ATLAS_ARCHITECTURE_MASTER.md` (fechado 2026-08-01) marca **Phase 6 — Retrieval** como "Planned". Pero `VERSION.md` confirma que `@atlas/retrieval` ya salió de estado bootstrap con un pipeline MVP bajo ADR-0005 (Sprint MVP-5), antes incluso de la fecha del Architecture Master. Es decir: el Architecture Master quedó desactualizado apenas se cerró el MVP. Esto es exactamente el tipo de drift que este documento de reconciliación busca prevenir hacia adelante.

---

## 5. Cabo suelto encontrado durante esta reconciliación

`releases/RFC_ATLAS4_2_DECISION_EVIDENCE.md` fue escrito y usado como base real para la implementación de 4.2 (commit `2388eeb`, ya en `origin/main`), pero **el archivo del RFC nunca se comiteó** — sigue como untracked en el working tree. La implementación que describe sí está mergeada; el documento que la justificó, no. Pendiente: commit de este archivo (y del resto de `SUPERPROMPT_*.md`/RFCs sueltos en `releases/`, que Luis ha decidido dejar para después).

---

## 6. Estado real, hoy (2026-08-17)

```
Kernel (Phase 0)                         COMPLETO, CONGELADO
Knowledge (Phase 1 / "ATLAS 3")          COMPLETO
Runtime/Workflow/Planning (Phase 2-4)    COMPLETO, CONGELADO
Memory (Phase 5)                         COMPLETO, CERTIFICADO (ADR-0003)
Retrieval (Phase 6)                      COMPLETO (MVP, ADR-0005) — doc desactualizado
Context / Reasoning (Phase 7-8)          NO IMPLEMENTADO
Producto P2.1-P2.5                       COMPLETO
Organizational Intelligence ("ATLAS 4")  COMPLETO (4.1 + 4.2), en origin/main @ 2388eeb
Decision Intelligence ("ATLAS 5")        NO INICIADO — siguiente paso acordado
```

---

## 7. Cómo usar este documento en una sesión nueva

Cualquier IA (Claude, ChatGPT, Cursor) que retome este proyecto debería, en este orden: leer este documento, luego `VERSION.md`, luego `ATLAS_ARCHITECTURE_MASTER.md`, y solo después considerar lo que diga el historial de un chat. Si el chat dice algo distinto a estos tres documentos, estos documentos tienen prioridad — y si se descubre que están desactualizados (como el caso de §4), se corrigen aquí y no se asume que el chat tenía razón por defecto.

Antes de escribir el RFC de ATLAS 5, actualizar este documento con la entrada correspondiente en la tabla §2, aunque siga "no iniciado" — para que quede trazado desde el momento en que se decide, no solo cuando se termina.
