---
id: ATLAS-DOM-003
title: Context Domain
version: 1.0.0
status: draft
owner: Atlas Domain Board
classification: public
foundation_version: 1.0
domain_version: 1.0
created: 2026-07-16
last_updated: 2026-07-16
purpose: >
  Definir el dominio de Contexto del ecosistema Atlas,
  estableciendo el modelo que permite interpretar el conocimiento
  según las circunstancias, el entorno, los actores y las
  condiciones bajo las cuales dicho conocimiento resulta válido.
---

# ATLAS-DOM-003 — Context Domain

> "Knowledge provides facts. Ontology provides meaning. Context provides interpretation."

---

# 1. Purpose

Este documento define el dominio oficial de Contexto dentro del ecosistema Atlas.

Su propósito consiste en modelar las circunstancias que determinan cómo debe interpretarse, priorizarse y aplicarse el conocimiento.

El Contexto permite que una misma entidad pueda producir diferentes resultados dependiendo del entorno en el que sea utilizada.

---

# 2. Scope

El Context Domain aplica a toda información contextual administrada por Atlas.

Incluye.

- usuarios;
- organizaciones;
- workspaces;
- proyectos;
- ambientes;
- idioma;
- región;
- fecha;
- versión;
- permisos;
- configuración;
- preferencias;
- estado operacional.

No modifica el conocimiento.

Modifica su interpretación.

---

# 3. Context Vision

Atlas considera el Contexto como la dimensión que convierte conocimiento estático en conocimiento útil.

Una misma entidad puede ser válida en un contexto e inválida en otro.

El Contexto representa las condiciones bajo las cuales el conocimiento adquiere significado operativo.

---

# 4. Fundamental Principle

Toda interpretación del conocimiento SHALL realizarse dentro de un Contexto.

Nunca deberá asumirse que una entidad posee significado absoluto fuera de un contexto definido.

---

# 5. Domain Responsibilities

El Context Domain es responsable de.

- representar contexto;
- resolver contexto activo;
- propagar contexto durante la compilación;
- aislar contextos independientes;
- administrar herencia contextual;
- controlar visibilidad;
- resolver prioridades.

No administra contenido.

No administra semántica.

Administra circunstancias.

---

# 6. Ubiquitous Language

El lenguaje oficial del dominio incluye.

- Context
- Context Scope
- Context Boundary
- Context Provider
- Context Resolution
- Context Layer
- Active Context
- Context Inheritance
- Context Override
- Context Snapshot
- Context Variables

Toda implementación SHALL utilizar esta terminología.

---

# 7. What is Context?

En Atlas, un Context representa el conjunto de condiciones que determinan cómo debe interpretarse una entidad de conocimiento.

El Contexto nunca altera la identidad del conocimiento.

Únicamente modifica la forma en que dicho conocimiento es evaluado o utilizado.

---

# 8. Context Entity

La entidad principal del dominio es **Context**.

Todo Context SHALL poseer.

- ContextId;
- Name;
- Namespace;
- Scope;
- Variables;
- Metadata;
- Version;
- Status.

---

# 9. Context Scope

El Scope determina el alcance de un Context.

Ejemplos.

Global

Organization

Workspace

Project

Environment

User

Session

Request

Un Context de menor alcance puede sobrescribir valores heredados de un Context superior.

---

# 10. Context Variables

Las Variables representan información contextual.

Ejemplos.

```text
language

country

timezone

workspace

brand

project

environment

userRole

permissions

runtime

llmProvider
```

Las Variables deberán poseer definición explícita.

---

# 11. Context Layers

Atlas organiza el Contexto mediante capas.

```text
Global

↓

Organization

↓

Workspace

↓

Project

↓

Environment

↓

Session

↓

Request
```

Cada capa hereda información de la capa superior.

---

# 12. Context Inheritance

Los Contextos SHALL soportar herencia.

Las reglas generales son.

- heredar;
- extender;
- sobrescribir;
- bloquear.

Toda sobrescritura deberá registrarse.

---

# 13. Context Overrides

Los Overrides permiten modificar temporalmente un valor heredado.

Ejemplos.

```text
Idioma global = Español

↓

Workspace = Inglés

↓

Proyecto = Español

↓

Sesión = Portugués
```

La resolución seguirá el Scope más específico.

---

# 14. Context Resolution

La resolución consiste en construir el Contexto efectivo.

El proceso incluye.

- herencia;
- overrides;
- validación;
- consolidación.

El resultado será un único Active Context.

---

# 15. Context Snapshot

Antes de ejecutar procesos críticos.

Atlas podrá generar un Snapshot del Contexto.

El Snapshot garantiza reproducibilidad durante.

- compilación;
- generación;
- validación;
- publicación;
- ejecución.

---

# 16. Active Context

Todo proceso SHALL ejecutarse utilizando un único Active Context.

Este representa la resolución final de todas las capas contextuales.

No podrán coexistir múltiples Contextos activos para una misma operación.

---

# 17. Context Lifecycle

Todo Context SHALL seguir un ciclo de vida definido.

```text
Define

↓

Resolve

↓

Activate

↓

Propagate

↓

Consume

↓

Update

↓

Snapshot

↓

Deactivate

↓

Archive
```

## Define

Se crea una nueva definición de Contexto.

Puede originarse desde.

- configuración;
- Workspace;
- proyecto;
- usuario;
- API;
- Runtime.

---

## Resolve

Atlas construye el Contexto efectivo.

Durante esta etapa se aplican.

- herencia;
- prioridades;
- overrides;
- validaciones.

---

## Activate

El Contexto pasa a ser el Active Context de una operación.

Desde este momento todas las decisiones deberán utilizar dicha resolución.

---

## Propagate

El Active Context se propaga automáticamente entre componentes.

Ejemplos.

- Compiler
- Workflow Engine
- Prompt Engine
- Agent Runtime
- Validation Engine

---

## Consume

Los componentes utilizan el Contexto para adaptar su comportamiento.

El Contexto nunca modifica el conocimiento.

Solo modifica la interpretación y la ejecución.

---

## Update

Durante la ejecución pueden cambiar determinadas variables contextuales.

Toda actualización deberá registrarse.

---

## Snapshot

Atlas puede capturar un Snapshot completo del Contexto.

Los Snapshots garantizan reproducibilidad.

---

## Deactivate

Una vez finalizada la operación el Contexto deja de estar activo.

---

## Archive

Los Contextos históricos podrán conservarse para auditoría.

---

# 18. Context Providers

Los Context Providers suministran información contextual.

Ejemplos.

```text
Workspace Provider

Organization Provider

Project Provider

Runtime Provider

Environment Provider

User Provider

Session Provider

Configuration Provider

LLM Provider
```

Cada Provider aporta únicamente su responsabilidad.

---

# 19. Context Resolution Strategy

La resolución SHALL seguir un orden determinístico.

```text
Global

↓

Organization

↓

Workspace

↓

Project

↓

Environment

↓

User

↓

Session

↓

Request
```

Siempre prevalece el Scope más específico.

---

# 20. Context Services

El dominio define los siguientes servicios.

- Context Resolution Service
- Context Merge Service
- Context Validation Service
- Context Snapshot Service
- Context Inheritance Service
- Context Propagation Service

Los servicios encapsulan la lógica operacional del dominio.

---

# 21. Context Events

Todo cambio relevante SHALL producir eventos.

Ejemplos.

```text
ContextCreated

ContextResolved

ContextActivated

ContextUpdated

ContextSnapshotCreated

ContextDeactivated

ContextArchived
```

Los eventos representan hechos ya ocurridos.

---

# 22. Context Policies

El dominio establece políticas oficiales.

Ejemplos.

- Scope Policy
- Override Policy
- Inheritance Policy
- Visibility Policy
- Isolation Policy
- Snapshot Policy

Las políticas garantizan consistencia durante la resolución.

---

# 23. Context Specifications

Las Specifications encapsulan reglas reutilizables.

Ejemplos.

```text
ValidContextSpecification

ScopeConsistencySpecification

InheritanceSpecification

OverrideSpecification

ActiveContextSpecification
```

Las Specifications SHALL ser independientes de Infrastructure.

---

# 24. Context Repository

El acceso al Contexto SHALL realizarse mediante Context Repository.

Sus responsabilidades incluyen.

- recuperación;
- resolución;
- búsqueda;
- snapshots;
- navegación;
- versionado.

La persistencia pertenece a Infrastructure.

---

# 25. Compiler Integration

Durante la compilación.

```text
Knowledge

↓

Ontology

↓

Context

↓

Knowledge Graph

↓

Validation

↓

Artifacts
```

El Compiler utiliza el Contexto para resolver correctamente las entidades antes de generar el grafo definitivo.

---

# 26. Runtime Integration

Todo proceso ejecutado por Atlas deberá recibir un Active Context.

Ejemplos.

- Agent Runtime
- Workflow Runtime
- Prompt Runtime
- REST API
- GraphQL API
- CLI
- SDK

El Runtime nunca deberá operar sin un Contexto resuelto.

---

# 27. Knowledge Graph Integration

El Knowledge Graph almacena referencias al Contexto activo.

El Contexto permite.

- interpretar relaciones;
- resolver ambigüedades;
- seleccionar versiones;
- aplicar permisos;
- determinar visibilidad.

El Grafo permanece estable.

La interpretación depende del Contexto.

---

# 28. Versioning

Los Contextos SHALL soportar versionado.

Cada versión preservará.

- variables;
- jerarquía;
- políticas;
- metadatos;
- historial.

Los cambios deberán ser auditables.

---

# 29. Compliance

Toda implementación SHALL respetar.

- Contexto único por operación;
- resolución determinística;
- herencia consistente;
- overrides controlados;
- snapshots reproducibles;
- integración con Compiler;
- integración con Runtime;
- integración con Knowledge Graph.

---

# 30. Related Documents

## Domain

- ATLAS-DOM-000 — Domain Overview
- ATLAS-DOM-001 — Knowledge Domain
- ATLAS-DOM-002 — Ontology Domain

## Architecture

- ATLAS-ARCH-003 — Compiler Architecture
- ATLAS-ARCH-004 — Knowledge Graph Architecture

## Engine

- ATLAS-101 — Context Engine
- ATLAS-110 — Context Planner
- ATLAS-109 — Validation Engine

---

# 31. Implementation Mapping

Este dominio será implementado principalmente en.

```text
packages/

context/
│
├── entities/
│   ├── Context.ts
│   ├── ContextScope.ts
│   ├── ContextSnapshot.ts
│   └── ContextVariable.ts
│
├── value-objects/
│   ├── ContextId.ts
│   ├── Scope.ts
│   ├── ContextVersion.ts
│   └── VariableName.ts
│
├── providers/
│   ├── WorkspaceProvider.ts
│   ├── UserProvider.ts
│   ├── RuntimeProvider.ts
│   ├── EnvironmentProvider.ts
│   └── ConfigurationProvider.ts
│
├── services/
│   ├── ContextResolutionService.ts
│   ├── ContextMergeService.ts
│   ├── ContextPropagationService.ts
│   ├── ContextSnapshotService.ts
│   └── ContextValidationService.ts
│
├── repositories/
│   └── ContextRepository.ts
│
├── specifications/
│   ├── ActiveContextSpecification.ts
│   ├── ScopeSpecification.ts
│   ├── OverrideSpecification.ts
│   └── ContextConsistencySpecification.ts
│
├── events/
│   ├── ContextCreated.ts
│   ├── ContextResolved.ts
│   ├── ContextActivated.ts
│   ├── ContextUpdated.ts
│   └── ContextSnapshotCreated.ts
│
└── index.ts
```

---

# 32. Cursor Implementation Checklist

```text
□ Crear Context Entity

□ Crear Context Scope

□ Crear Context Variables

□ Implementar Context Repository

□ Implementar Context Providers

□ Implementar Context Resolution

□ Implementar Context Merge

□ Implementar Context Propagation

□ Implementar Context Snapshot

□ Implementar Context Validation

□ Crear Domain Events

□ Escribir Unit Tests

□ Registrar package en Compiler

□ Registrar package en Runtime

□ Exportar package público
```

---

# Change History

| Version | Date | Description |
|----------|------------|-------------------------------------------|
| 1.0.0 | 2026-07-16 | Initial Context Domain specification. |

---

# Final Statement

El Context Domain constituye la capa de interpretación del ecosistema Atlas.

Mientras el Knowledge Domain define las entidades y el Ontology Domain define su significado, el Context Domain determina cómo deben interpretarse y utilizarse dichas entidades en cada situación concreta.

Gracias a este dominio, Atlas puede ejecutar procesos reproducibles, resolver configuraciones complejas, adaptar el comportamiento de los agentes y mantener un modelo consistente entre el Compiler, el Runtime y el Knowledge Graph.

El Contexto no altera el conocimiento; proporciona el marco necesario para que ese conocimiento pueda aplicarse correctamente en cualquier escenario del ecosistema.