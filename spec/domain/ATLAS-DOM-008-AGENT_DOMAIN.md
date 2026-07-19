---
id: ATLAS-DOM-008
title: Agent Domain
version: 1.0.0
status: draft
owner: Atlas Domain Board
classification: public
foundation_version: 1.0
domain_version: 1.0
created: 2026-07-16
last_updated: 2026-07-16
purpose: >
  Definir el dominio de Agentes del ecosistema Atlas,
  estableciendo el modelo mediante el cual los agentes
  inteligentes son definidos, gobernados, versionados,
  compilados y ejecutados como entidades autónomas
  dentro del ecosistema.
---

# ATLAS-DOM-008 — Agent Domain

> "An Agent is not an AI model. An Agent is an autonomous domain entity."

---

# 1. Purpose

Este documento define el dominio oficial de Agentes dentro del ecosistema Atlas.

Su propósito consiste en modelar los Agentes como entidades autónomas capaces de percibir información, razonar, tomar decisiones y ejecutar acciones utilizando el conocimiento del ecosistema.

Los Agentes representan la unidad fundamental de inteligencia operativa dentro de Atlas.

---

# 2. Scope

El Agent Domain aplica a todos los agentes definidos dentro del ecosistema.

Incluye.

- agentes;
- capacidades;
- objetivos;
- herramientas;
- políticas;
- memoria;
- contexto;
- comportamiento;
- colaboración;
- gobernanza.

No implementa modelos de IA.

No implementa motores de inferencia.

Modela la identidad y comportamiento del agente.

---

# 3. Agent Vision

Atlas considera un Agent como una entidad autónoma.

Un Agent posee.

- identidad;
- propósito;
- conocimiento;
- memoria;
- capacidades;
- herramientas;
- objetivos;
- políticas.

El modelo de IA constituye únicamente uno de sus recursos.

---

# 4. Fundamental Principle

Todo Agent SHALL ser una entidad gobernada.

Nunca deberá definirse únicamente mediante un Prompt.

Todo Agent posee identidad, ciclo de vida, contratos y responsabilidades explícitas.

---

# 5. Domain Responsibilities

El Agent Domain es responsable de.

- definir agentes;
- describir capacidades;
- asignar herramientas;
- establecer objetivos;
- gestionar comportamiento;
- coordinar colaboración;
- mantener identidad.

No administra modelos LLM.

No administra infraestructura.

---

# 6. Ubiquitous Language

El lenguaje oficial del dominio incluye.

- Agent
- Capability
- Goal
- Skill
- Tool
- Policy
- Memory
- Persona
- Reasoning
- Planning
- Delegation
- Collaboration

Toda implementación SHALL utilizar esta terminología.

---

# 7. What is an Agent?

En Atlas, un Agent representa una entidad inteligente autónoma capaz de ejecutar trabajo utilizando conocimiento, memoria, herramientas y razonamiento.

El modelo de lenguaje no constituye el agente.

Constituye únicamente uno de sus mecanismos de inferencia.

---

# 8. Agent Entity

La entidad principal del dominio es **Agent**.

Toda entidad Agent SHALL poseer.

- AgentId
- Name
- Description
- Version
- Purpose
- Capabilities
- Goals
- Skills
- Policies
- Metadata
- Status

---

# 9. Agent Categories

Atlas reconoce múltiples categorías.

Ejemplos.

- Assistant Agent
- Specialist Agent
- Supervisor Agent
- Reviewer Agent
- Compiler Agent
- Retrieval Agent
- Workflow Agent
- Publishing Agent
- Research Agent
- Orchestrator Agent

Cada categoría representa una responsabilidad distinta.

---

# 10. Capabilities

Las Capabilities representan aquello que un Agent sabe hacer.

Ejemplos.

- escribir;
- analizar;
- investigar;
- validar;
- programar;
- traducir;
- diseñar;
- publicar.

Las capacidades son declarativas.

No implementaciones.

---

# 11. Goals

Todo Agent deberá poseer objetivos explícitos.

Los Goals representan los resultados que el agente intenta alcanzar.

Ejemplos.

- resolver problemas;
- generar documentación;
- revisar código;
- publicar artefactos;
- investigar información.

---

# 12. Skills

Las Skills representan competencias específicas.

Ejemplos.

- TypeScript;
- GraphQL;
- Marketing;
- Arquitectura;
- UX;
- Python;
- Kubernetes.

Las Skills especializan al agente.

---

# 13. Tools

Los Agents utilizan herramientas para ejecutar trabajo.

Ejemplos.

- APIs;
- CLI;
- SDK;
- Git;
- Bases de datos;
- Navegadores;
- Compiladores;
- Servicios externos.

Las herramientas son recursos.

No capacidades.

---

# 14. Persona

Todo Agent podrá definir una Persona.

La Persona describe.

- estilo;
- comportamiento;
- tono;
- preferencias;
- restricciones.

La Persona influye en la interacción.

Nunca en la identidad del agente.

---

# 15. Collaboration

Los Agents podrán colaborar entre sí.

Ejemplo.

```text
Supervisor Agent

↓

Research Agent

↓

Architecture Agent

↓

Reviewer Agent
```

La colaboración constituye una capacidad del dominio.

---

# 16. Delegation

Un Agent podrá delegar tareas.

La delegación preserva.

- contexto;
- objetivos;
- restricciones;
- trazabilidad.

El agente que delega continúa siendo responsable del resultado.

---

# 17. Agent Lifecycle

Todo Agent SHALL seguir un ciclo de vida definido.

```text
Design

↓

Draft

↓

Review

↓

Validate

↓

Compile

↓

Publish

↓

Deploy

↓

Execute

↓

Monitor

↓

Improve

↓

Retire
```

Cada transición del ciclo de vida estará gobernada por políticas del dominio.

---

# 18. Agent Runtime Model

Todo Agent SHALL ejecutarse dentro de un Runtime.

El Runtime proporciona el entorno operativo necesario para que el agente pueda percibir información, razonar y actuar.

```text
Load Agent

↓

Load Context

↓

Load Memory

↓

Retrieve Knowledge

↓

Reason

↓

Plan

↓

Select Tools

↓

Execute

↓

Observe

↓

Learn

↓

Finish
```

El Runtime nunca modifica la definición del Agent.

Únicamente administra su ejecución.

---

# 19. Agent Planning

Todo Agent podrá construir un plan antes de ejecutar trabajo.

El Planning consiste en transformar un objetivo en una secuencia de acciones.

Ejemplos.

```text
Goal

↓

Objectives

↓

Tasks

↓

Activities

↓

Execution Plan
```

El plan podrá modificarse durante la ejecución.

---

# 20. Agent Reasoning

El Reasoning representa el proceso mediante el cual el agente analiza información antes de actuar.

El razonamiento podrá utilizar.

- conocimiento;
- memoria;
- contexto;
- ontología;
- políticas;
- resultados anteriores.

El mecanismo de razonamiento es independiente del modelo de IA utilizado.

---

# 21. Agent Memory Integration

Todo Agent interactúa con el Memory Domain.

Podrá utilizar.

- Working Memory;
- Short-Term Memory;
- Long-Term Memory;
- Episodic Memory;
- Semantic Memory.

El agente nunca administra directamente la memoria.

Siempre utiliza el Memory Domain.

---

# 22. Agent Tool Calling

Los Agents utilizan herramientas mediante contratos definidos.

Ejemplos.

```text
Agent

↓

Tool Contract

↓

Tool Adapter

↓

Tool Execution

↓

Result
```

Las herramientas son desacopladas mediante adaptadores.

El Agent nunca depende de implementaciones concretas.

---

# 23. Agent Registry

Todos los Agents SHALL registrarse mediante un Agent Registry.

El Registry es responsable de.

- descubrimiento;
- catálogo;
- versionado;
- búsqueda;
- resolución;
- dependencias.

Nunca administra ejecuciones activas.

Únicamente definiciones.

---

# 24. Agent Services

El dominio define los siguientes servicios.

- Agent Resolution Service
- Agent Planning Service
- Agent Reasoning Service
- Agent Execution Service
- Agent Collaboration Service
- Agent Registry Service
- Agent Version Service

Los servicios encapsulan la lógica operacional del dominio.

---

# 25. Agent Events

Toda modificación relevante SHALL generar eventos.

Ejemplos.

```text
AgentCreated

AgentValidated

AgentCompiled

AgentPublished

AgentStarted

AgentCompleted

AgentDelegated

AgentLearned

AgentRetired
```

Los eventos representan hechos históricos.

---

# 26. Agent Policies

El dominio establece políticas oficiales.

Ejemplos.

- Planning Policy
- Delegation Policy
- Collaboration Policy
- Memory Policy
- Security Policy
- Execution Policy
- Version Policy

Las políticas gobiernan el comportamiento del agente.

---

# 27. Multi-Agent Collaboration

Atlas soporta colaboración nativa entre múltiples agentes.

Ejemplo.

```text
Supervisor Agent

↓

Architecture Agent

↓

Research Agent

↓

Implementation Agent

↓

Reviewer Agent
```

Cada agente mantiene.

- identidad;
- memoria;
- capacidades;
- responsabilidades.

La colaboración no elimina la autonomía.

---

# 28. Compiler Integration

Durante la compilación.

```text
Knowledge

↓

Ontology

↓

Context

↓

Memory

↓

Retrieval

↓

Prompt

↓

Workflow

↓

Agent

↓

Knowledge Graph

↓

Validation

↓

Artifacts
```

El Compiler genera una representación completamente validada del Agent.

---

# 29. Runtime Integration

Todo Runtime utilizará Agents compilados.

Ejemplos.

- CLI
- SDK
- REST API
- GraphQL API
- Workflow Runtime
- Multi-Agent Runtime

La definición del Agent nunca cambia durante la ejecución.

---

# 30. Compliance

Toda implementación SHALL respetar.

- identidad del agente;
- capacidades explícitas;
- objetivos definidos;
- separación entre razonamiento y ejecución;
- independencia del proveedor LLM;
- colaboración gobernada;
- delegación controlada;
- integración con Compiler;
- integración con Runtime;
- integración con Memory Domain;
- integración con Workflow Domain.

---

# 31. Related Documents

## Domain

- ATLAS-DOM-001 — Knowledge Domain
- ATLAS-DOM-002 — Ontology Domain
- ATLAS-DOM-003 — Context Domain
- ATLAS-DOM-004 — Memory Domain
- ATLAS-DOM-005 — Retrieval Domain
- ATLAS-DOM-006 — Prompt Domain
- ATLAS-DOM-007 — Workflow Domain

## Architecture

- ATLAS-ARCH-003 — Compiler Architecture
- ATLAS-ARCH-004 — Knowledge Graph Architecture
- ATLAS-ARCH-006 — Build Compilation Pipeline

## Engine

- ATLAS-106 — Prompt Engine
- ATLAS-105 — Retrieval Engine
- ATLAS-107 — Agent Runtime
- ATLAS-108 — Workflow Engine

---

# 32. Implementation Mapping

Este dominio será implementado principalmente en.

```text
packages/

agent/
│
├── entities/
│   ├── Agent.ts
│   ├── Capability.ts
│   ├── Goal.ts
│   ├── Skill.ts
│   ├── Persona.ts
│   ├── ToolReference.ts
│   └── AgentRegistry.ts
│
├── value-objects/
│   ├── AgentId.ts
│   ├── AgentVersion.ts
│   ├── CapabilityId.ts
│   ├── GoalId.ts
│   └── SkillId.ts
│
├── services/
│   ├── AgentResolutionService.ts
│   ├── AgentPlanningService.ts
│   ├── AgentReasoningService.ts
│   ├── AgentExecutionService.ts
│   ├── AgentCollaborationService.ts
│   ├── AgentRegistryService.ts
│   └── AgentVersionService.ts
│
├── repositories/
│   └── AgentRepository.ts
│
├── specifications/
│   ├── ValidAgentSpecification.ts
│   ├── CapabilitySpecification.ts
│   ├── GoalSpecification.ts
│   ├── DelegationSpecification.ts
│   └── CollaborationSpecification.ts
│
├── events/
│   ├── AgentCreated.ts
│   ├── AgentCompiled.ts
│   ├── AgentStarted.ts
│   ├── AgentDelegated.ts
│   ├── AgentCompleted.ts
│   └── AgentRetired.ts
│
└── index.ts
```

---

# 33. Cursor Implementation Checklist

```text
□ Crear Agent Entity

□ Crear Capability

□ Crear Goal

□ Crear Skill

□ Crear Persona

□ Crear ToolReference

□ Crear Agent Repository

□ Implementar Planning Service

□ Implementar Reasoning Service

□ Implementar Execution Service

□ Implementar Collaboration Service

□ Implementar Agent Registry

□ Crear Domain Events

□ Escribir Unit Tests

□ Registrar package en Compiler

□ Registrar package en Runtime

□ Integrar con Memory Domain

□ Integrar con Workflow Domain

□ Integrar con Prompt Domain

□ Exportar package público
```

---

# Change History

| Version | Date | Description |
|----------|------------|----------------------------------------|
| 1.0.0 | 2026-07-16 | Initial Agent Domain specification. |

---

# Final Statement

El Agent Domain constituye la capacidad del ecosistema Atlas para representar inteligencia autónoma como una entidad de dominio gobernada.

En Atlas, un Agent no es un modelo de lenguaje, un Prompt ni una conversación. Es una entidad con identidad, propósito, capacidades, objetivos, memoria, herramientas y políticas propias, capaz de colaborar con otros agentes y de utilizar uno o varios modelos de IA como recursos intercambiables.

Gracias a este dominio, Atlas desacopla la inteligencia de la tecnología subyacente, permitiendo construir arquitecturas multiagente escalables, auditables y evolutivas donde el comportamiento se modela en el dominio y no en el proveedor de inteligencia artificial.