---
id: ATLAS-004
title: Atlas Domain Model
version: 1.0.0
status: draft
owner: Atlas Foundation
classification: public
created: 2026-07-13
last_updated: 2026-07-13
purpose: >
  Definir el modelo conceptual oficial de Atlas. Este documento establece las
  entidades fundamentales del ecosistema, sus responsabilidades, relaciones,
  restricciones e invariantes. Constituye el lenguaje común sobre el cual se
  construye toda la plataforma.
---

# ATLAS-004 — Domain Model

> "Todo sistema complejo comienza con un modelo correcto."

---

# 1. Purpose

El Domain Model constituye el modelo conceptual oficial de Atlas.

Su objetivo es definir de forma explícita los elementos que existen dentro del universo Atlas, cómo se relacionan entre sí y cuáles son sus responsabilidades.

Todo componente de Atlas deberá derivar de este modelo.

Este documento no describe implementaciones técnicas.

Describe la realidad conceptual del sistema.

---

# 2. Scope

Este documento aplica a:

- Atlas Foundation
- Atlas Engine
- Atlas Agents
- Atlas Knowledge
- Atlas Organization
- Atlas Brands
- Atlas Workflows
- Atlas Academy
- Cualquier extensión futura del ecosistema Atlas

---

# 3. Objectives

El modelo de dominio debe permitir:

- Comprender Atlas sin depender de herramientas específicas.
- Establecer un lenguaje común.
- Evitar ambigüedad terminológica.
- Separar responsabilidades.
- Facilitar la evolución del sistema.
- Servir como referencia para personas y agentes de IA.
- Preservar el conocimiento organizacional.

---

# 4. Design Principles

El modelo de dominio sigue los siguientes principios.

## 4.1 Explicitness

Toda entidad debe estar definida explícitamente.

No existen conceptos implícitos.

---

## 4.2 Separation of Concerns

Cada dominio posee una única responsabilidad principal.

Las responsabilidades no deben mezclarse.

---

## 4.3 AI Independence

El modelo no depende de ninguna tecnología específica de inteligencia artificial.

Los modelos podrán cambiar.

El dominio permanece.

---

## 4.4 Human Governance

Las personas gobiernan el sistema.

La inteligencia artificial amplifica capacidades.

Nunca reemplaza la autoridad.

---

## 4.5 Knowledge First

Toda entidad existe para crear, preservar o utilizar conocimiento.

El conocimiento constituye el activo principal del sistema.

---

# 5. Core Concepts

Atlas se construye sobre doce conceptos fundamentales.

```text
Organization
│
├── Strategy
├── Brand
├── Capability
├── Role
├── Knowledge
├── Process
├── Workflow
├── Decision
├── Policy
├── Asset
├── Agent
└── Metric
```

Cada uno representa un dominio conceptual independiente.

---

# 6. Domain Definitions

## 6.1 Organization

### Definición

Una Organization representa una entidad que persigue objetivos mediante personas, procesos y conocimiento.

Puede representar:

- empresa
- agencia
- marca
- iglesia
- fundación
- startup
- equipo
- unidad de negocio

### Responsabilidades

- definir visión
- definir estrategia
- definir objetivos
- gobernar dominios
- asignar propietarios

### Posee

- Brands
- Roles
- Knowledge
- Policies
- Processes
- Workflows
- Assets
- Agents

---

## 6.2 Strategy

La Strategy define hacia dónde quiere avanzar una organización.

No describe tareas.

Describe dirección.

Incluye:

- visión
- misión
- objetivos
- prioridades
- iniciativas

Una organización posee una estrategia activa.

Puede mantener estrategias históricas.

---

## 6.3 Brand

Una Brand representa una identidad.

Una organización puede administrar múltiples marcas.

Ejemplos.

```
Jerilex

Geeks

BlessLight

Stack
```

Cada Brand posee:

- identidad
- posicionamiento
- personalidad
- tono
- activos
- audiencias
- contenido
- campañas

---

## 6.4 Capability

Una Capability representa una habilidad permanente.

No representa personas.

No representa tareas.

Ejemplos.

```
Marketing

Ventas

Diseño

Desarrollo

Finanzas

RRHH

Producción

Investigación
```

Las capacidades sobreviven a las personas.

---

## 6.5 Role

Un Role representa una responsabilidad.

Nunca representa una persona.

Ejemplos.

```
CEO

Creative Director

Brand Manager

Designer

Copywriter

Developer

Legal Advisor
```

Una persona puede ocupar múltiples Roles.

Un Role puede ser desempeñado por una IA.

---

## 6.6 Knowledge

Knowledge representa conocimiento estructurado.

Es el activo más importante de Atlas.

Puede existir como:

- documentación
- playbooks
- estándares
- procedimientos
- investigaciones
- manuales
- decisiones
- aprendizajes
- plantillas

Todo conocimiento posee:

- propietario
- versión
- estado
- origen
- fecha
- evidencia

---

## 6.7 Process

Un Process representa una secuencia estable de actividades.

Su propósito es producir un resultado repetible.

Ejemplos.

```
Onboarding

Contratación

Ventas

Producción Creativa

QA

Publicación
```

---

## 6.8 Workflow

Un Workflow representa la ejecución concreta de un Process.

Proceso

↓

Workflow

↓

Resultado

Un proceso puede generar miles de Workflows.

---

## 6.9 Decision

Una Decision representa una elección registrada.

Debe contener:

- contexto
- alternativas
- evidencia
- responsable
- fecha
- resultado

Atlas preserva las decisiones.

No únicamente los resultados.

---

## 6.10 Policy

Una Policy representa una regla organizacional.

Ejemplos.

```
Naming Convention

Approval Policy

Security Policy

Publishing Policy

Brand Policy
```

Las Policies gobiernan comportamientos.

---

## 6.11 Asset

Un Asset representa cualquier recurso reutilizable.

Ejemplos.

```
Logo

Prompt

Plantilla

Video

Documento

Dataset

Código

Modelo
```

Todo Asset posee un propietario.

---

## 6.12 Agent

Un Agent representa una capacidad inteligente.

Puede ser:

- humano
- inteligencia artificial
- híbrido

Un Agent siempre opera bajo políticas.

Nunca posee autoridad propia.

La autoridad pertenece a la organización.

---

## 6.13 Metric

Una Metric representa una medición.

Ejemplos.

```
Revenue

CTR

CAC

NPS

Conversion

Brand Awareness

Quality Score
```

Las métricas permiten evaluar decisiones.

Nunca reemplazan el criterio.

# 7. Domain Relationships

Los dominios de Atlas no existen de forma aislada.

Cada dominio mantiene relaciones explícitas con otros dominios del sistema.

Estas relaciones permiten la colaboración sin romper la separación de responsabilidades.

## 7.1 Relationship Overview

```text
                    Organization
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
    Strategy           Brand          Capability
        │                 │                 │
        ├────────────┐    │          ┌──────┘
        │            │    │          │
   Decision      Policy   │      Role
        │            │    │          │
        └─────┬──────┘    │          │
              │           │          │
          Process────────Workflow────┘
              │
              │
         Knowledge
          │      │
      Asset    Agent
          │
        Metric
```

---

## 7.2 Relationship Rules

### Organization

Organization MAY own:

- Strategies
- Brands
- Roles
- Capabilities
- Knowledge
- Processes
- Policies
- Assets
- Metrics

Organization MUST own every Domain.

---

### Strategy

Strategy defines priorities.

Strategy DOES NOT execute work.

Execution belongs to Processes and Workflows.

---

### Brand

Brand consumes:

- Knowledge
- Assets
- Workflows
- Policies

Brand NEVER owns organizational governance.

---

### Capability

Capabilities produce Processes.

Capabilities require Roles.

Capabilities evolve independently.

---

### Role

Roles execute Capabilities.

Roles MAY be performed by:

- Humans
- AI Agents
- Hybrid Teams

---

### Knowledge

Knowledge supports every other Domain.

Every Domain both consumes and produces Knowledge.

Knowledge NEVER belongs to individuals.

---

### Process

Processes orchestrate Workflows.

Processes consume Policies.

Processes generate Decisions.

---

### Workflow

Workflow is the operational execution of a Process.

Workflow generates evidence.

Evidence becomes Knowledge.

---

### Decision

Every Decision SHALL reference:

- Context
- Evidence
- Responsible Role
- Date
- Impact

---

### Policy

Policies constrain behaviors.

Policies SHALL NOT execute work.

---

### Asset

Assets MAY be reused across Domains.

Assets SHALL have:

- Owner
- Version
- Lifecycle
- Classification

---

### Agent

Agents perform work.

Agents NEVER define governance.

Agents SHALL follow Policies.

---

### Metric

Metrics evaluate Outcomes.

Metrics SHALL NOT replace human judgment.

---

# 8. Ownership Model

Ownership prevents ambiguity.

Every Domain SHALL have exactly one Owner.

Ownership may be delegated.

Responsibility may be shared.

Authority SHALL remain explicit.

## Ownership Matrix

| Domain | Owner |
|----------|----------------|
| Organization | Executive Leadership |
| Strategy | Strategy Office |
| Brand | Brand Manager |
| Capability | Capability Lead |
| Role | Governance |
| Knowledge | Knowledge Owner |
| Process | Process Owner |
| Workflow | Workflow Owner |
| Decision | Decision Maker |
| Policy | Governance |
| Asset | Asset Owner |
| Agent | Agent Supervisor |
| Metric | Business Owner |

---

# 9. Domain Lifecycle

Every Domain follows the same lifecycle.

```text
Draft

↓

Review

↓

Approved

↓

Active

↓

Deprecated

↓

Archived
```

## Lifecycle Rules

Every Domain SHALL:

- have a version
- have an owner
- have a status
- maintain history

Nothing becomes Active without Review.

---

# 10. Domain Invariants

The following statements are ALWAYS true.

## Invariant 1

Every Domain has exactly one primary responsibility.

---

## Invariant 2

Every Domain has an Owner.

---

## Invariant 3

Every Domain produces Knowledge.

---

## Invariant 4

Every important Decision becomes Knowledge.

---

## Invariant 5

No Workflow exists without a Process.

---

## Invariant 6

No Agent operates outside Policies.

---

## Invariant 7

No Knowledge exists without provenance.

---

## Invariant 8

Every Asset belongs to exactly one Owner.

---

## Invariant 9

Every Metric has a business purpose.

---

## Invariant 10

Organization governs all Domains.

---

# 11. Communication Rules

Domains communicate through explicit interfaces.

Direct dependencies SHOULD be minimized.

Preferred communication:

```text
Strategy

↓

Capability

↓

Process

↓

Workflow

↓

Knowledge

↓

Decision

↓

Knowledge
```

Knowledge becomes the shared memory.

---

# 12. Domain Examples

## Example 1

Organization

↓

Jerilex

↓

Brand

↓

Creative Capability

↓

Creative Process

↓

Content Workflow

↓

AI Designer Agent

↓

Social Media Asset

↓

Performance Metrics

---

## Example 2

Organization

↓

Geeks

↓

Marketing Capability

↓

Campaign Process

↓

Campaign Workflow

↓

Campaign Knowledge

↓

Lessons Learned

---

## Example 3

Organization

↓

Casa de Fe

↓

Production Capability

↓

Sunday Service Process

↓

Sunday Workflow

↓

Runbook

↓

Operational Knowledge

---

# 13. Anti-patterns

The following situations violate the Atlas Domain Model.

## Mixed Responsibilities

One Domain performing multiple unrelated responsibilities.

---

## Hidden Ownership

A Domain without an explicit Owner.

---

## AI Governance

Allowing AI Agents to define organizational policies.

---

## Orphan Knowledge

Knowledge without provenance.

---

## Duplicate Domains

Multiple Domains representing the same responsibility.

---

## Workflow without Process

Executing operational work without a defined Process.

---

## Process without Capability

Processes not linked to organizational capabilities.

---

## Metrics without Purpose

Collecting metrics that support no decision.

---

# 14. Future Considerations

Future versions of Atlas may introduce additional Domain types.

Examples include:

- Risk
- Compliance
- Finance
- Legal
- Research
- Innovation
- Customer Experience
- Community
- Marketplace

New Domains SHALL preserve compatibility with this model.

---

# 15. Compliance

Every Atlas implementation SHALL comply with this Domain Model.

Extensions MAY introduce new Domains.

Extensions SHALL NOT redefine existing Domains.

---

# 16. Related Documents

- ATLAS-001 — Manifesto
- ATLAS-002 — Constitution
- ATLAS-003 — Principles
- ATLAS-005 — Boundaries
- ATLAS-006 — Governance
- ATLAS-007 — Decision Model
- ATLAS-008 — Ontology
- ATLAS-009 — Glossary
- ATLAS-010 — Platform Mapping

---

# 17. Change History

| Version | Date | Description |
|----------|------------|------------------------------|
| 1.0.0 | 2026-07-13 | Initial Domain Model specification. |

---

> **Atlas does not model software.**

> **Atlas models organizations.**

> Software is merely one possible implementation.

