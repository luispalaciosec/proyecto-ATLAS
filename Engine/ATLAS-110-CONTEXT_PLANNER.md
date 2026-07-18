---
id: ATLAS-110
title: Atlas Context Planner
version: 1.0.0
status: draft
owner: Atlas Core Team
classification: public
foundation_version: 1.0
engine_version: 1.0
created: 2026-07-13
last_updated: 2026-07-13
purpose: >
  Definir el Context Planner, el componente responsable de analizar una
  solicitud y producir un Context Plan que describa qué información deberá
  recuperarse antes de construir el Context Package.
---

# ATLAS-110 — Context Planner

> "Antes de recuperar información, Atlas planifica qué conocimiento necesita."

---

# 1. Purpose

El Context Planner constituye el componente de planificación del Atlas Context Engine.

Su responsabilidad consiste en transformar una solicitud en un plan estructurado de recuperación de contexto.

El Planner nunca recupera información.

Nunca consulta bases de conocimiento.

Nunca ejecuta agentes.

Su única responsabilidad consiste en decidir qué contexto será necesario.

---

# 2. Responsibilities

El Context Planner SHALL:

- analizar la solicitud.
- detectar la intención.
- identificar el objetivo.
- determinar el tipo de ejecución.
- seleccionar las fuentes necesarias.
- estimar el Context Budget.
- priorizar información.
- producir un Context Plan.

El Planner SHALL NOT:

- recuperar Knowledge.
- consultar Memory.
- ejecutar búsquedas.
- construir prompts.
- generar respuestas.

---

# 3. Design Principles

## Plan Before Retrieval

Toda recuperación de información deberá estar precedida por un plan.

---

## Explicit Planning

Toda decisión del Planner deberá quedar representada dentro del Context Plan.

No existen decisiones implícitas.

---

## Deterministic Planning

La misma solicitud deberá producir el mismo Context Plan.

---

## Source Independence

El Planner decide qué necesita.

Nunca cómo obtenerlo.

---

## Extensible Planning

Nuevas fuentes podrán incorporarse sin modificar el algoritmo principal.

---

# 4. Planning Lifecycle

```text
Request

↓

Intent Detection

↓

Objective Extraction

↓

Task Classification

↓

Source Selection

↓

Priority Definition

↓

Budget Allocation

↓

Constraint Resolution

↓

Context Plan
```

---

# 5. Planning Inputs

El Planner podrá utilizar:

- Request
- Organization
- Brand
- User
- Active Workflow
- Current Task
- Configuration
- Policies
- Runtime Capabilities

No utilizará conocimiento operativo.

---

# 6. Planning Outputs

El resultado del Planner será un único objeto.

```text
ContextPlan
```

El ContextPlan constituye el contrato entre el Planner y el Context Engine.

---

# 7. ContextPlan

Canonical Structure

```yaml
plan_id:

request:

intent:

objective:

execution_type:

priority:

required_sources:

optional_sources:

required_resolvers:

context_budget:

constraints:

expected_outputs:

metadata:
```

Este contrato será estable entre versiones mayores del Engine.

---

# 8. Execution Types

Atlas reconoce inicialmente los siguientes tipos.

- Analysis
- Creation
- Transformation
- Research
- Decision Support
- Workflow Execution
- Knowledge Retrieval
- Planning
- Validation

Las implementaciones podrán ampliar esta lista.

---

# 9. Source Selection

El Planner clasifica las fuentes en tres categorías.

## Mandatory

Sin ellas la tarea no puede ejecutarse.

---

## Recommended

Incrementan la calidad.

---

## Optional

Se utilizan únicamente si existe presupuesto disponible.

La clasificación permite optimizar el Context Budget.

# 10. Planning Strategies

No todas las solicitudes requieren el mismo proceso de planificación.

El Context Planner seleccionará una estrategia de acuerdo con la naturaleza de la solicitud.

## Minimal Strategy

Objetivo:

Construir el plan más pequeño posible.

Casos de uso:

- preguntas simples
- consultas rápidas
- tareas repetitivas

Prioriza:

- velocidad
- bajo costo
- mínimo contexto

---

## Standard Strategy

Objetivo:

Balancear precisión y eficiencia.

Es la estrategia por defecto del Atlas Engine.

---

## Deep Strategy

Objetivo:

Construir el plan más completo posible.

Incluye:

- Knowledge extendido
- Memory histórica
- Previous Decisions
- Metrics
- Policies
- Assets relacionados

Casos de uso:

- estrategia
- arquitectura
- investigación
- decisiones críticas

---

## Exploratory Strategy

Objetivo:

Maximizar diversidad de información.

Casos de uso:

- brainstorming
- innovación
- investigación abierta
- generación de alternativas

---

# 11. Planning Rules

El Planner deberá respetar las siguientes reglas.

## Rule 1

Nunca solicitar información innecesaria.

---

## Rule 2

Nunca omitir información crítica.

---

## Rule 3

Toda fuente deberá tener un propósito explícito.

---

## Rule 4

Todo Context Budget deberá respetarse.

---

## Rule 5

Toda decisión del Planner deberá ser reproducible.

---

## Rule 6

Las Policies siempre tendrán prioridad sobre el Knowledge.

---

## Rule 7

El Planner nunca ejecutará búsquedas directamente.

Toda recuperación será delegada al Engine correspondiente.

---

# 12. Context Budget Planning

El Planner es responsable de distribuir el presupuesto de contexto antes de comenzar la recuperación.

Ejemplo.

```yaml
context_budget:

total: 100%

allocation:

objective: 20%

knowledge: 25%

policies: 15%

workflow: 10%

memory: 10%

assets: 10%

metrics: 5%

constraints: 5%
```

El presupuesto podrá modificarse según el tipo de ejecución.

---

# 13. Resolver Selection

El Planner no recupera información.

Selecciona qué Resolvers deberán ejecutarse.

Ejemplo.

```yaml
required_resolvers:

- Organization Resolver

- Brand Resolver

- Knowledge Resolver

- Policy Resolver

- Asset Resolver

optional_resolvers:

- Calendar Resolver

- GitHub Resolver

- CRM Resolver

- Analytics Resolver
```

Cada Resolver será ejecutado posteriormente por el Context Engine.

---

# 14. Planning Events

El Planner podrá emitir los siguientes eventos.

```text
PlanningStarted

IntentDetected

ObjectiveResolved

ExecutionTypeSelected

BudgetAllocated

ResolversSelected

PlanningCompleted

PlanningFailed
```

Todos los eventos deberán registrarse mediante el módulo de Observability.

---

# 15. Error Handling

Los errores deberán clasificarse utilizando códigos estructurados.

Ejemplos.

| Error | Description |
|--------|-------------|
| IntentNotDetected | No fue posible identificar la intención |
| MissingObjective | No existe un objetivo claro |
| InvalidExecutionType | Tipo de ejecución inválido |
| BudgetPlanningFailed | No fue posible asignar el presupuesto |
| ResolverConflict | Conflicto entre Resolvers |
| PlanningValidationFailed | El Context Plan no supera la validación |

Los errores deberán ser trazables.

---

# 16. Performance Requirements

El Context Planner deberá optimizar:

- tiempo de planificación
- precisión de selección
- reutilización de planes
- consumo de recursos
- estabilidad del algoritmo

Cuando sea posible, podrá reutilizar Context Plans previamente generados para solicitudes equivalentes.

---

# 17. Extensibility

Las implementaciones podrán incorporar:

- nuevos Execution Types
- nuevos Planning Strategies
- nuevos Resolvers
- nuevos algoritmos de priorización
- nuevas políticas de Context Budget

Toda extensión deberá mantener compatibilidad con el contrato oficial del Context Plan.

---

# 18. Compliance

Una implementación será compatible con Atlas Context Planner cuando:

- produzca un Context Plan válido.
- respete la estructura oficial.
- seleccione Resolvers en lugar de ejecutar recuperación.
- asigne un Context Budget.
- registre eventos.
- mantenga planificación determinística.
- preserve independencia tecnológica.

---

# 19. Related Documents

Foundation

- ATLAS-001 — Manifesto
- ATLAS-002 — Constitution
- ATLAS-003 — Principles
- ATLAS-004 — Domain Model
- ATLAS-005 — Boundaries
- ATLAS-006 — Governance
- ATLAS-007 — Decision Model
- ATLAS-008 — Ontology
- ATLAS-009 — Glossary
- ATLAS-010 — Platform Mapping

Engine

- ATLAS-100 — Engine
- ATLAS-101 — Context Engine
- ATLAS-102 — Knowledge Engine
- ATLAS-103 — Memory Engine
- ATLAS-104 — Search Engine
- ATLAS-105 — Retrieval Engine
- ATLAS-106 — Prompt Engine
- ATLAS-107 — Agent Runtime
- ATLAS-108 — Workflow Engine
- ATLAS-109 — Validation Engine

---

# 20. Change History

| Version | Date | Description |
|----------|------------|----------------------------------------------|
| 1.0.0 | 2026-07-13 | Initial Context Planner specification. |

---

# Final Statement

El Context Planner constituye el componente estratégico del Atlas Context Engine.

Su función no consiste en recuperar información, sino en determinar qué conocimiento es necesario para ejecutar una tarea con precisión, eficiencia y trazabilidad.

Mediante la generación de un **Context Plan**, Atlas separa la planificación de la recuperación, permitiendo que el sistema evolucione de forma modular, escalable e independiente de cualquier fuente de datos o proveedor de inteligencia artificial.

Esta separación convierte al Context Planner en el primer paso del razonamiento operativo de Atlas y en el punto de partida para la construcción de un contexto de alta calidad.

En Atlas, una buena ejecución comienza mucho antes de consultar un modelo de IA.

Comienza con un buen plan.
