---
id: ADR-0002
title: Planning Consolidation — Postponement
version: 1.0.0
status: accepted
date: 2026-07-21
deciders: Atlas Owner
depends_on:
  - ATLAS-INTELLIGENCE-006
  - ATLAS-INTELLIGENCE-CONTRACT-005
  - ATLAS-INTELLIGENCE-011
  - ATLAS-RUNTIME-005
---

# ADR-0002 — Planning Consolidation (Postponement)

## Status

**Accepted** — 2026-07-21

---

## Motivation

Durante la revisión arquitectónica posterior al Sprint 10F (Sprint 10F.1), se identificaron duplicaciones temporales y solapamientos de responsabilidad dentro del paquete `@atlas/intelligence`.

Estas observaciones son **técnicamente correctas**, pero no constituyen un defecto funcional ni un bloqueo para continuar el desarrollo del ecosistema Atlas.

El Planning Engine fue implementado sobre un **input provisional** (`Goal` directo), mientras que la arquitectura cognitiva final aún no existe:

- Context Builder
- Memory Provider
- Retrieval Provider
- Reasoning Engine
- Agent Runtime

Mientras Planning no esté conectado a su input definitivo (Reasoning Result), cualquier refactor profundo de su superficie interna sería **prematuro** y probablemente deba **rehacerse** cuando existan los componentes upstream.

Las duplicaciones actuales son, por tanto, **deuda técnica consciente y aceptada** en esta fase del roadmap — no errores que deban corregirse de inmediato.

---

## Current State

Estado del paquete `@atlas/intelligence` tras Sprint 10F (sin commit, sin tag, sin push):

### Flujo implementado

```
Goal → GoalNormalizer → PlanningEngine → PlanningStrategy → WorkflowDefinition
```

Planning **no ejecuta** Workflow, **no compila** Pipeline y **no conoce** Runtime ni Execution.

### Observaciones arquitectónicas documentadas

#### PlanningCompiler

- **Nombre:** sugiere compilación.
- **Comportamiento real:** no transforma tipos ni produce artefactos nuevos; delega en `PlanningValidator.validatePlanningResult` y adapta el resultado a `PlanningCompilationResult`.
- **Conclusión:** no compila realmente; actúa como adaptador/verificador de compatibilidad con `@atlas/workflow`.

#### WorkflowBuilder

- **Ubicación:** `packages/intelligence/src/workflow-builder.ts`
- **Comportamiento:** builder incremental para construir `WorkflowDefinition` desde las Planning Strategies.
- **Conclusión:** es un **helper temporal** de planning; solapa parcialmente el ensamblado declarativo que realiza `WorkflowFactory` en `@atlas/workflow`, pero responde a un patrón incremental necesario para las estrategias actuales.
- **Export:** expuesto en la API pública de `@atlas/intelligence` — decisión aceptada temporalmente.

#### PlanningValidator

- **Responsabilidades planning:** validación de `PlanningGoal`, `PlanningStrategy` y contexto.
- **Responsabilidades workflow:** `validatePlanningResult` invoca `validateWorkflowDefinition` y `compileWorkflowDefinition` de `@atlas/workflow`.
- **Conclusión:** invade **parcialmente** el dominio Workflow al reutilizar validación y verificación de compilabilidad en la frontera planning → workflow.

#### WorkflowCompiler (`@atlas/workflow`)

- Permanece como el **único** componente autorizado para transformar `WorkflowDefinition → PipelineDefinition`.
- Planning no produce `PipelineDefinition`; solo verifica compatibilidad indirectamente vía el validator.

### Componentes congelados por esta decisión

A partir de este ADR, queda **prohibido modificar** (hasta Sprint 11):

- `PlanningEngine`
- `PlanningValidator`
- `PlanningCompiler`
- `WorkflowBuilder`
- exports públicos de `@atlas/intelligence`
- nombres de componentes
- responsabilidades actuales
- ubicación de archivos

---

## Decision

**La consolidación arquitectónica de Planning se POSPONE.**

**NO se autoriza Sprint 10F.2** ni ningún refactor de Planning en el corto plazo.

No se modificará el código de `@atlas/intelligence` hasta completar la implementación de:

1. Memory Provider
2. Retrieval Provider
3. Context Builder
4. Reasoning Engine
5. Agent Runtime

**Rationale:**

La cadena cognitiva final será:

```
Goal
  ↓
Context
  ↓
Memory
  ↓
Retrieval
  ↓
Reasoning
  ↓
Planning
  ↓
Workflow
  ↓
Pipeline
  ↓
Runtime
```

Planning debe estabilizarse **después** de conocer la forma real de su input (`Reasoning Result`, según `ATLAS-INTELLIGENCE-CONTRACT-005`) y su relación con el Context Builder. Refactorizar ahora implicaría re-trabajo casi seguro.

Sprint 10F queda **oficialmente congelado** en su estado actual de implementación local (sin commit/tag/push hasta decisión explícita del Owner).

---

## Future Work

La consolidación completa se realizará en:

### Sprint 11 — Architecture Consolidation

Acciones explícitas planeadas (no ejecutar antes de Sprint 11):

| Acción | Detalle |
|--------|---------|
| **Eliminar PlanningCompiler** | Reemplazar por un componente de compatibilidad con nombre correcto (p. ej. `PlanningWorkflowCompatibility`) o integrar en la frontera workflow |
| **Internalizar WorkflowBuilder** | Renombrar si procede (p. ej. `PlanningWorkflowAssembler`); sacarlo de exports públicos |
| **Separar PlanningValidator** | Validación planning pura vs delegación única a `@atlas/workflow` |
| **Simplificar exports** | API pública de `@atlas/intelligence` solo expone capacidades de planning, no helpers de construcción de workflow |
| **Revisar responsabilidades finales** | Tras Reasoning: redefinir input/output de PlanningEngine, reglas, strategies y metadata |

### Criterio de entrada para Sprint 11

Sprint 11 no deberá iniciarse hasta que existan al menos stubs funcionales o contratos implementados de:

- Reasoning Engine (input definitivo de Planning)
- Context Builder
- Memory y Retrieval (dependencias upstream de Reasoning)

---

## Consequences

### Positivas

- El desarrollo continúa hacia Sprint 10G sin bloqueo por deuda técnica menor.
- Las duplicaciones quedan documentadas y aceptadas explícitamente.
- Se evita re-trabajo prematuro antes de conocer el contrato real Reasoning → Planning.

### Negativas (aceptadas temporalmente)

- `PlanningCompiler` mantiene un nombre engañoso.
- `WorkflowBuilder` permanece en API pública de intelligence.
- `PlanningValidator` mantiene acoplamiento a `@atlas/workflow`.
- Deuda técnica acumulada hasta Sprint 11.

### Neutras

- Sprint 10F permanece sin commit/tag/push hasta aprobación explícita del Owner para publicación.
- Sprint 10F.1 (análisis) queda cerrado; Sprint 10F.2 queda **rechazado**.

---

## References

- Sprint 10F.1 — Planning Architecture Consolidation (análisis)
- `releases/SPRINT10F_ARCHITECTURE_REVIEW.md`
- `spec/intelligence/ATLAS-INTELLIGENCE-006-PLANNING.md`
- `spec/intelligence/contracts/ATLAS-INTELLIGENCE-CONTRACT-005-PLANNING_ENGINE.md`
- `packages/intelligence/` (implementación local Sprint 10F)
