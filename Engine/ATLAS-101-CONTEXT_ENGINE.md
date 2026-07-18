---
id: ATLAS-101
title: Atlas Context Engine
version: 1.0.0
status: draft
owner: Atlas Core Team
classification: public
foundation_version: 1.0
engine_version: 1.0
created: 2026-07-13
last_updated: 2026-07-13
purpose: >
  Definir el Context Engine de Atlas, responsable de construir el contexto
  mínimo, preciso y relevante que utilizarán los agentes durante cada
  ejecución.
---

# ATLAS-101 — Context Engine

> "La calidad de un agente nunca será superior a la calidad del contexto que recibe."

---

# 1. Purpose

El Context Engine es responsable de construir el **Context Package**, el objeto de datos que representa toda la información necesaria para ejecutar una tarea.

Su objetivo es garantizar que cada agente reciba únicamente el contexto relevante para la solicitud actual.

El Context Engine no genera respuestas.

No toma decisiones.

No ejecuta agentes.

Su única responsabilidad consiste en construir el mejor contexto posible.

---

# 2. Responsibilities

El Context Engine SHALL:

- interpretar la solicitud.
- identificar el objetivo.
- resolver la Organization.
- resolver la Brand.
- resolver el Domain.
- identificar el Workflow.
- recuperar Policies aplicables.
- seleccionar Knowledge relevante.
- recuperar Assets necesarios.
- consultar Memory.
- construir el Context Package.

El Context Engine SHALL NOT:

- ejecutar herramientas.
- llamar directamente al LLM.
- modificar Knowledge.
- alterar Policies.
- persistir memoria.

---

# 3. Design Principles

## Minimal Context

Todo contexto deberá contener únicamente la información necesaria.

Más contexto no implica mejor contexto.

---

## Relevant Context

Toda información incluida deberá contribuir directamente al objetivo de la ejecución.

---

## Deterministic Resolution

Dadas las mismas entradas, el Context Engine deberá producir el mismo Context Package.

---

## Context over Prompt

El Prompt es una representación textual.

El Context Package representa conocimiento estructurado.

Atlas siempre construye primero el Context Package.

---

## Knowledge Before Generation

La generación nunca ocurre sin consultar el conocimiento disponible.

---

# 4. Context Lifecycle

Toda construcción de contexto sigue el siguiente flujo.

```text
Request

↓

Intent Detection

↓

Context Resolution

↓

Knowledge Retrieval

↓

Memory Resolution

↓

Policy Resolution

↓

Asset Resolution

↓

Context Assembly

↓

Context Validation

↓

Context Package
```

---

# 5. Context Sources

El Context Engine podrá utilizar información proveniente de múltiples fuentes.

| Source | Description |
|---------|-------------|
| Organization | Organización activa |
| Brand | Marca activa |
| User | Usuario actual |
| Role | Rol del usuario |
| Domain | Dominio funcional |
| Workflow | Flujo operativo |
| Knowledge Base | Conocimiento estructurado |
| Memory | Memoria persistente |
| Policies | Reglas aplicables |
| Assets | Recursos reutilizables |
| Decisions | Historial de decisiones |
| Metrics | Indicadores relevantes |
| Configuration | Configuración del sistema |

Cada fuente posee una estrategia de resolución independiente.

---

# 6. Context Resolution Pipeline

```text
User Request
      │
      ▼
Intent Resolver
      │
      ▼
Organization Resolver
      │
      ▼
Brand Resolver
      │
      ▼
Domain Resolver
      │
      ▼
Workflow Resolver
      │
      ▼
Knowledge Resolver
      │
      ▼
Memory Resolver
      │
      ▼
Policy Resolver
      │
      ▼
Asset Resolver
      │
      ▼
Validation
      │
      ▼
Context Package
```

Cada Resolver constituye un componente independiente.

---

# 7. Context Package

El Context Package representa el contrato oficial entre el Context Engine y el resto del Atlas Engine.

Todo agente compatible con Atlas deberá ser capaz de interpretar este contrato.

## Canonical Structure

```yaml
context_id:

request:

objective:

organization:

brand:

user:

role:

domain:

workflow:

task:

knowledge:

memory:

policies:

assets:

previous_decisions:

metrics:

constraints:

tools:

configuration:

metadata:
```

Esta estructura constituye la versión mínima obligatoria.

Las implementaciones podrán extenderla sin romper compatibilidad.

---

# 8. Context Objects

Cada propiedad del Context Package representa un objeto independiente.

Ejemplo.

```text
Context Package

├── Organization
├── Brand
├── User
├── Workflow
├── Knowledge
├── Memory
├── Policies
├── Assets
├── Metrics
├── Constraints
└── Tools
```

Estos objetos serán definidos en especificaciones posteriores.

---

# 9. Context Prioritization

Cuando exista exceso de información, el Context Engine aplicará el siguiente orden de prioridad.

1. Objective
2. Active Task
3. Policies
4. Workflow
5. Knowledge
6. Previous Decisions
7. Memory
8. Assets
9. Metrics
10. Configuration

La prioridad determina qué información permanece cuando el contexto debe reducirse.

# 10. Context Budget

El Context Engine administra el contexto como un recurso limitado.

Toda ejecución dispone de un **Context Budget**, que representa la cantidad máxima de información que puede incorporarse al Context Package.

El presupuesto podrá expresarse en:

- Tokens
- Bytes
- Objetos
- Peso relativo

La implementación es independiente del proveedor del modelo.

---

## Budget Allocation

Atlas recomienda distribuir el presupuesto de contexto según prioridades.

Ejemplo.

| Context Category | Recommended Budget |
|------------------|-------------------:|
| Objective | 20% |
| Policies | 15% |
| Workflow | 10% |
| Knowledge | 20% |
| Memory | 10% |
| Previous Decisions | 10% |
| Assets | 10% |
| Constraints | 5% |
| Metrics | 5% |
| Metadata | 5% |

Esta distribución podrá adaptarse según el tipo de tarea.

---

## Budget Optimization

Cuando el contexto exceda el presupuesto disponible, el Context Engine SHALL aplicar técnicas de reducción progresiva.

Ejemplos:

- eliminar duplicados.
- resumir información.
- priorizar conocimiento reciente.
- descartar contexto irrelevante.
- comprimir memoria histórica.
- fusionar referencias equivalentes.

El objetivo es preservar el mayor valor posible dentro del presupuesto disponible.

---

# 11. Context Validation

Antes de entregar un Context Package, el Context Engine deberá validarlo.

Las validaciones mínimas incluyen:

- estructura válida.
- entidades obligatorias presentes.
- referencias existentes.
- políticas aplicables.
- consistencia semántica.
- presupuesto respetado.
- ausencia de duplicados.

Un Context Package inválido nunca deberá entregarse al Agent Runtime.

---

# 12. Context Resolution Strategies

No todas las solicitudes requieren la misma estrategia.

Atlas define las siguientes estrategias.

## Minimal

Recupera únicamente el conocimiento indispensable.

Uso recomendado:

- tareas simples.
- consultas rápidas.

---

## Standard

Equilibrio entre precisión y rendimiento.

Constituye la estrategia por defecto.

---

## Deep

Recupera contexto amplio.

Incluye:

- decisiones históricas.
- memoria.
- activos relacionados.
- métricas.
- conocimiento extendido.

Uso recomendado:

- estrategia.
- arquitectura.
- investigación.

---

## Exploratory

Prioriza diversidad sobre precisión.

Utilizada para:

- ideación.
- innovación.
- investigación abierta.

---

# 13. Public Interfaces

El Context Engine expone las siguientes interfaces conceptuales.

## Build Context

Entrada:

```yaml
request
organization
brand
user
configuration
```

Salida:

```yaml
ContextPackage
```

---

## Validate Context

Entrada:

```yaml
ContextPackage
```

Salida:

```yaml
ValidationResult
```

---

## Optimize Context

Entrada:

```yaml
ContextPackage
ContextBudget
```

Salida:

```yaml
OptimizedContextPackage
```

---

# 14. Events

El Context Engine podrá emitir los siguientes eventos.

```text
ContextRequested

IntentResolved

OrganizationResolved

BrandResolved

WorkflowResolved

KnowledgeResolved

MemoryResolved

PoliciesResolved

AssetsResolved

ContextOptimized

BudgetExceeded

ContextValidated

ContextGenerated
```

Todos los eventos deberán registrarse mediante Observability.

---

# 15. Error Handling

Todo error deberá clasificarse.

Ejemplos.

| Error | Description |
|--------|-------------|
| ContextNotFound | No fue posible construir el contexto |
| OrganizationNotFound | Organización inexistente |
| BrandNotFound | Marca inexistente |
| PolicyConflict | Políticas incompatibles |
| BudgetExceeded | El contexto supera el presupuesto |
| MissingKnowledge | Falta conocimiento requerido |
| ValidationFailed | El contexto no supera la validación |

Los errores deberán incluir información suficiente para diagnóstico.

---

# 16. Performance Requirements

El Context Engine deberá optimizar:

- precisión.
- velocidad.
- consumo de memoria.
- reutilización de contexto.
- costo computacional.

Siempre que sea posible, reutilizará Context Packages previamente construidos.

---

# 17. Extensibility

Las implementaciones podrán incorporar nuevos Context Resolvers.

Ejemplos.

- Calendar Resolver
- CRM Resolver
- Email Resolver
- GitHub Resolver
- ERP Resolver
- Analytics Resolver
- MCP Resolver

Todo nuevo Resolver deberá respetar el contrato del Context Engine.

---

# 18. Compliance

Una implementación será compatible con Atlas Context Engine cuando:

- construya un Context Package válido.
- respete el contrato oficial.
- utilice Context Budget.
- valide el contexto antes de la ejecución.
- registre eventos.
- mantenga independencia del proveedor de IA.
- preserve la trazabilidad.

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
- ATLAS-102 — Knowledge Engine
- ATLAS-103 — Memory Engine
- ATLAS-104 — Search Engine
- ATLAS-105 — Retrieval Engine
- ATLAS-106 — Prompt Engine
- ATLAS-107 — Agent Runtime
- ATLAS-108 — Workflow Engine
- ATLAS-109 — Validation Engine
- ATLAS-110 — Context Planner

---

# 20. Change History

| Version | Date | Description |
|----------|------------|--------------------------------------------|
| 1.0.0 | 2026-07-13 | Initial Context Engine specification. |

---

# Final Statement

El Context Engine constituye el mecanismo mediante el cual Atlas transforma una solicitud en conocimiento accionable.

Su responsabilidad no consiste en generar respuestas, sino en construir el contexto correcto para que cualquier agente pueda razonar con precisión, consistencia y trazabilidad.

En Atlas, el contexto es un activo de ingeniería.

No es un bloque de texto.

No es un prompt.

Es una representación estructurada del conocimiento relevante para una ejecución específica.

La calidad de todo el ecosistema depende de la calidad del contexto que produce este módulo.

Por ello, el Context Engine representa el punto de entrada intelectual del Atlas Engine.