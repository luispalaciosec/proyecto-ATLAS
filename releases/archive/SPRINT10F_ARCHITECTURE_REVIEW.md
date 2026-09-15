# Sprint 10F — Architecture Review

**Fecha:** 2026-07-21  
**Tipo:** Revisión arquitectónica post-implementación (Sprint 10F.1)  
**Estado:** Cerrado — decisión del Owner registrada  
**Paquete analizado:** `@atlas/intelligence`  
**Commit / Tag / Push:** Ninguno (Sprint 10F congelado sin publicar)

---

## 1. Resumen

Tras implementar el Cognitive Planning Engine (Sprint 10F), se realizó una revisión arquitectónica completa (Sprint 10F.1) del paquete `@atlas/intelligence` para detectar duplicaciones, violaciones de SRP y desalineaciones con la arquitectura Atlas.

El análisis concluyó que existen **observaciones válidas** pero **no bloqueantes**. El Owner decidió **postponer** cualquier refactor a Sprint 11 y **congelar** Sprint 10F tal como está implementado localmente.

Decisión formal registrada en: [`adr/ADR-0002-PLANNING_CONSOLIDATION.md`](../adr/ADR-0002-PLANNING_CONSOLIDATION.md)

---

## 2. Análisis realizado

### Alcance

- Revisión componente por componente de `@atlas/intelligence`
- Verificación de fronteras con `@atlas/workflow` (congelado Sprint 10E)
- Verificación de no-intrusión en `@atlas/runtime` (congelado Sprint 10D)
- Construcción de mapa de responsabilidades y dependencias
- Comparación con specs: INT-006, INT-CONTRACT-005, INT-011, RUNTIME-005

### Metodología

- Análisis estático del código fuente (sin modificaciones)
- Sin nuevas funcionalidades
- Sin commits, tags ni push

### Flujo actual vs flujo objetivo

| Fase | Flujo actual (10F) | Flujo objetivo Atlas |
|------|---------------------|----------------------|
| Entrada | Goal directo | Goal → Context → Memory → Retrieval → Reasoning |
| Planning | Goal → PlanningEngine → WorkflowDefinition | Reasoning Result → PlanningEngine → WorkflowDefinition |
| Compilación | WorkflowCompiler (`@atlas/workflow`) | Sin cambio |
| Ejecución | Pipeline Engine (`@atlas/runtime`) | Sin cambio |

---

## 3. Observaciones detectadas

### 3.1 PlanningCompiler

| Aspecto | Hallazgo |
|---------|----------|
| Nombre | Implica compilación |
| Comportamiento | Solo adapta resultado de validación |
| Duplicación | Redundante con `PlanningEngine` + `PlanningValidator` |
| Riesgo | Confusión semántica; no rompe arquitectura |

**Veredicto técnico:** eliminar o renombrar en Sprint 11 — **no ahora**.

### 3.2 WorkflowBuilder

| Aspecto | Hallazgo |
|---------|----------|
| Rol | Helper incremental para strategies |
| Duplicación | Parcial con `WorkflowFactory` (`@atlas/workflow`) |
| API pública | Exportado desde `@atlas/intelligence` |
| Integración workflow | Usa `createWorkflowNode/Edge` de `@atlas/workflow` |

**Veredicto técnico:** internalizar en Sprint 11 — **no mover a `@atlas/workflow`** (congelado).

### 3.3 PlanningValidator

| Aspecto | Hallazgo |
|---------|----------|
| Planning puro | `validateGoal`, `validateStrategy` — correcto |
| Workflow | `validatePlanningResult` llama `validateWorkflowDefinition` + `compileWorkflowDefinition` |
| Duplicación | Solapa responsabilidades de `WorkflowValidator` y verificación de `WorkflowCompiler` |

**Veredicto técnico:** separar fronteras en Sprint 11 — **mantener hasta entonces**.

### 3.4 PlanningEngine

| Aspecto | Hallazgo |
|---------|----------|
| Orquestación | Correcta para fase actual |
| Límites | No conoce Runtime, Pipeline ni Execution |
| Mejora futura | Extraer selector de estrategia cuando exista Reasoning |

**Veredicto técnico:** aceptable; refactor menor diferido a Sprint 11.

### 3.5 PlanningStrategies

| Aspecto | Hallazgo |
|---------|----------|
| Output | Solo `WorkflowDefinition` — correcto |
| Mezcla | Heurísticas de steps/rules dentro de strategies |

**Veredicto técnico:** extraer heurísticas en Sprint 11.

### 3.6 GoalNormalizer

| Aspecto | Hallazgo |
|---------|----------|
| Pureza | Componente puro de normalización |
| Acoplamiento | No conoce strategies ni workflow |

**Veredicto técnico:** correcto; sin cambios planeados.

### 3.7 WorkflowCompiler (`@atlas/workflow`)

| Aspecto | Hallazgo |
|---------|----------|
| Rol | Único transformador `WorkflowDefinition → PipelineDefinition` |
| Violación | Ninguna detectada |

**Veredicto técnico:** correcto; permanece congelado.

---

## 4. Decisión del Owner

| Decisión | Detalle |
|----------|---------|
| **Sprint 10F.2** | **NO AUTORIZADO** |
| **Sprint 10F** | **CONGELADO** — sin modificaciones de código |
| **Commit / Tag / Push** | **NO** hasta aprobación explícita |
| **Consolidación** | **POSPUESTA** a Sprint 11 |
| **ADR** | `ADR-0002-PLANNING_CONSOLIDATION.md` — **accepted** |

---

## 5. Razones para NO refactorizar todavía

1. **Input definitivo inexistente.** Planning debería consumir `Reasoning Result` (INT-CONTRACT-005), no Goal directo. Refactorizar ahora no refleja el contrato final.

2. **Cadena cognitiva incompleta.** Faltan Memory, Retrieval, Context Builder, Reasoning y Agent Runtime. Cualquier consolidación profunda será parcial.

3. **Alto riesgo de re-trabajo.** Los nombres, exports y fronteras de Planning cambiarán cuando Reasoning exista.

4. **Observaciones no bloqueantes.** Las duplicaciones no impiden Sprint 10G ni la evolución del stack Workflow → Pipeline → Runtime.

5. **Deuda técnica consciente.** Preferible documentar y posponer que refactorizar dos veces.

---

## 6. Backlog trasladado a Sprint 11

**Sprint 11 — Architecture Consolidation**

| ID | Item | Prioridad |
|----|------|-----------|
| S11-PLN-001 | Eliminar `PlanningCompiler`; reemplazar por verificador de compatibilidad con nombre correcto | Alta |
| S11-PLN-002 | Internalizar `WorkflowBuilder`; remover de exports públicos | Alta |
| S11-PLN-003 | Separar `PlanningValidator` (planning puro vs delegación workflow) | Alta |
| S11-PLN-004 | Simplificar exports de `@atlas/intelligence` | Media |
| S11-PLN-005 | Extraer heurísticas de `planning-strategies.ts` | Media |
| S11-PLN-006 | Revisar responsabilidades finales tras integración con Reasoning | Alta |
| S11-PLN-007 | Reconciliar input Planning: Goal provisional → Reasoning Result | Alta |
| S11-PLN-008 | Evaluar fusión o deprecación de `PlanningCompilationResult` | Baja |

### Precondiciones Sprint 11

- Reasoning Engine implementado (mínimo vertical slice)
- Context Builder implementado
- Memory y Retrieval disponibles (stubs o implementación mínima)
- Agent Runtime en scope o stub documentado

---

## 7. Estado de sprints relacionados

| Sprint | Estado | Notas |
|--------|--------|-------|
| 10D | Publicado | Pipeline Engine congelado |
| 10E | Publicado | Workflow Definition congelado |
| 10F | Implementado localmente, **congelado**, sin commit | Planning Engine |
| 10F.1 | **Cerrado** | Solo análisis |
| 10F.2 | **Rechazado** | Consolidación pospuesta |
| 10G | **Pendiente aprobación Owner** | No iniciar hasta autorización |
| 11 | **Planificado** | Architecture Consolidation |

---

## 8. Entregables de esta revisión

| Entregable | Ubicación |
|------------|-----------|
| ADR de postponement | `adr/ADR-0002-PLANNING_CONSOLIDATION.md` |
| Informe de revisión | `releases/SPRINT10F_ARCHITECTURE_REVIEW.md` (este documento) |

**Ningún otro archivo fue modificado.**

---

## 9. Próximo paso

Esperar **aprobación explícita del Owner** antes de iniciar **Sprint 10G**.
