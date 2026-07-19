---
id: ATLAS-DOM-006
title: Prompt Domain
version: 1.0.0
status: draft
owner: Atlas Domain Board
classification: public
foundation_version: 1.0
domain_version: 1.0
created: 2026-07-16
last_updated: 2026-07-16
purpose: >
  Definir el dominio de Prompts del ecosistema Atlas,
  estableciendo el modelo mediante el cual los prompts
  son diseñados, versionados, validados, compilados,
  reutilizados y gobernados como activos de conocimiento.
---

# ATLAS-DOM-006 — Prompt Domain

> "A prompt is not text. A prompt is executable knowledge."

---

# 1. Purpose

Este documento define el dominio oficial de Prompts dentro del ecosistema Atlas.

Su propósito consiste en modelar los prompts como entidades de dominio reutilizables, versionables y compilables que permiten interactuar con modelos de inteligencia artificial de forma consistente.

Los prompts constituyen una interfaz entre el conocimiento de Atlas y los motores de inferencia.

---

# 2. Scope

El Prompt Domain aplica a todos los prompts utilizados por el ecosistema.

Incluye.

- System Prompts
- User Prompts
- Assistant Prompts
- Prompt Templates
- Prompt Components
- Prompt Variables
- Prompt Contracts
- Prompt Policies
- Prompt Versions
- Prompt Libraries

No administra modelos de IA.

No administra conversaciones.

Administra instrucciones.

---

# 3. Prompt Vision

Atlas considera un Prompt como una entidad de conocimiento.

No es simplemente texto.

Un Prompt posee.

- identidad;
- propósito;
- estructura;
- dependencias;
- contratos;
- ciclo de vida.

Puede evolucionar igual que cualquier otro activo del sistema.

---

# 4. Fundamental Principle

Todo Prompt SHALL ser una entidad gobernada.

Nunca deberá existir como texto aislado.

Todo Prompt pertenece a un dominio, posee identidad y puede ser compilado.

---

# 5. Domain Responsibilities

El Prompt Domain es responsable de.

- definir prompts;
- reutilizar prompts;
- versionar prompts;
- validar prompts;
- parametrizar prompts;
- componer prompts;
- documentar prompts.

No ejecuta modelos.

No almacena conversaciones.

---

# 6. Ubiquitous Language

El lenguaje oficial del dominio incluye.

- Prompt
- Prompt Template
- Prompt Component
- Prompt Contract
- Prompt Variable
- Prompt Input
- Prompt Output
- Prompt Version
- Prompt Library
- Prompt Registry
- Prompt Composition

Toda implementación SHALL utilizar esta terminología.

---

# 7. What is a Prompt?

En Atlas, un Prompt representa una instrucción estructurada dirigida a un motor de inferencia.

Su función consiste en transformar contexto, conocimiento y parámetros en una solicitud coherente para un modelo de IA.

---

# 8. Prompt Entity

La entidad principal del dominio es **Prompt**.

Toda entidad Prompt SHALL poseer.

- PromptId
- Name
- Description
- Version
- Purpose
- Template
- Variables
- Contracts
- Metadata
- Status

---

# 9. Prompt Categories

Atlas reconoce diferentes categorías.

Ejemplos.

- System Prompt
- User Prompt
- Assistant Prompt
- Tool Prompt
- Agent Prompt
- Workflow Prompt
- Validation Prompt
- Compiler Prompt

Cada categoría posee responsabilidades específicas.

---

# 10. Prompt Template

El Template representa la estructura reutilizable del Prompt.

Incluye.

- instrucciones;
- placeholders;
- bloques;
- componentes;
- restricciones.

El Template nunca contiene información específica de ejecución.

---

# 11. Prompt Variables

Las Variables permiten parametrizar un Prompt.

Ejemplos.

```text
{{user}}

{{language}}

{{workspace}}

{{knowledge}}

{{context}}

{{memory}}

{{goal}}
```

Toda Variable SHALL poseer definición explícita.

---

# 12. Prompt Components

Los Prompts pueden componerse mediante componentes reutilizables.

Ejemplos.

```text
Role

Objective

Knowledge

Constraints

Examples

Tools

Output Format

Policies
```

La composición reduce duplicidad y facilita el mantenimiento.

---

# 13. Prompt Contracts

Todo Prompt podrá definir contratos.

Ejemplos.

Entradas obligatorias.

Variables requeridas.

Formato esperado.

Límites.

Restricciones.

El Compiler validará dichos contratos.

---

# 14. Prompt Composition

Atlas soporta composición jerárquica.

Ejemplo.

```text
System Prompt

+

Knowledge Prompt

+

Context Prompt

+

Task Prompt

↓

Compiled Prompt
```

El resultado constituye un único Prompt ejecutable.

---

# 15. Prompt Libraries

Los Prompts podrán organizarse en bibliotecas.

Ejemplos.

```text
Marketing

Engineering

Architecture

Sales

Legal

Documentation

Development
```

Las bibliotecas favorecen reutilización y gobernanza.

---

# 16. Prompt Versioning

Todo Prompt SHALL soportar versionado.

Cada versión preservará.

- compatibilidad;
- historial;
- trazabilidad;
- dependencias.

Los cambios incompatibles requerirán una nueva versión mayor.

---

# 17. Prompt Lifecycle

Todo Prompt SHALL seguir un ciclo de vida definido.

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

Execute

↓

Monitor

↓

Improve

↓

Archive
```

Cada etapa representa una transición controlada dentro del dominio.

---

# 18. Prompt Compilation

Todo Prompt SHALL ser compilado antes de su ejecución.

El proceso de compilación consiste en transformar una definición declarativa en un Prompt completamente resuelto.

```text
Prompt Definition

↓

Resolve Variables

↓

Resolve Knowledge

↓

Resolve Memory

↓

Resolve Context

↓

Compose Components

↓

Validate Contracts

↓

Render Prompt

↓

Compiled Prompt
```

El Prompt compilado constituye el único artefacto ejecutable.

---

# 19. Prompt Resolution

La resolución consiste en obtener todos los elementos necesarios para construir el Prompt final.

Durante esta etapa Atlas resuelve.

- Variables;
- Contexto;
- Conocimiento;
- Memoria;
- Ontología;
- Políticas;
- Configuración del Runtime.

La resolución SHALL ser determinística.

---

# 20. Prompt Rendering

El Rendering transforma la estructura del Prompt en una representación lista para ser consumida por un proveedor de IA.

El proceso incluye.

- sustitución de variables;
- composición de componentes;
- normalización;
- serialización.

El formato dependerá del proveedor de inferencia.

---

# 21. Prompt Validation

Antes de compilar un Prompt, Atlas deberá validar.

- contratos;
- variables obligatorias;
- dependencias;
- componentes;
- restricciones;
- compatibilidad de versión.

Un Prompt inválido no podrá ejecutarse.

---

# 22. Prompt Registry

Todos los Prompts SHALL registrarse mediante un Prompt Registry.

El Registry es responsable de.

- descubrimiento;
- búsqueda;
- versionado;
- resolución;
- catálogo;
- dependencias.

Nunca almacena ejecuciones.

Únicamente definiciones.

---

# 23. Prompt Services

El dominio define los siguientes servicios.

- Prompt Resolution Service
- Prompt Compilation Service
- Prompt Rendering Service
- Prompt Validation Service
- Prompt Registry Service
- Prompt Composition Service
- Prompt Version Service

Los servicios encapsulan toda la lógica operacional del dominio.

---

# 24. Prompt Events

Toda modificación relevante SHALL generar eventos.

Ejemplos.

```text
PromptCreated

PromptUpdated

PromptValidated

PromptCompiled

PromptPublished

PromptExecuted

PromptArchived
```

Los eventos representan hechos históricos.

---

# 25. Prompt Policies

El dominio establece políticas oficiales.

Ejemplos.

- Version Policy
- Composition Policy
- Validation Policy
- Security Policy
- Compatibility Policy
- Publishing Policy

Las políticas gobiernan el comportamiento del dominio.

---

# 26. Prompt Specifications

Las Specifications encapsulan reglas reutilizables.

Ejemplos.

```text
ValidPromptSpecification

PromptContractSpecification

PromptVariableSpecification

PromptCompositionSpecification

PromptCompatibilitySpecification
```

Las Specifications SHALL ser independientes de Infrastructure.

---

# 27. Compiler Integration

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

Knowledge Graph

↓

Validation

↓

Artifacts
```

El Compiler genera un Prompt completamente resuelto y validado antes de cualquier ejecución.

---

# 28. Runtime Integration

Todo Runtime utilizará Prompts compilados.

Ejemplos.

- Agent Runtime
- Workflow Runtime
- CLI
- SDK
- REST API
- GraphQL API

El Runtime nunca deberá construir Prompts manualmente.

Toda composición pertenece al Prompt Domain.

---

# 29. LLM Provider Integration

El Prompt Domain es independiente del proveedor de IA.

Podrá integrarse con.

- OpenAI
- Anthropic
- Google Gemini
- Mistral
- DeepSeek
- Ollama
- Azure OpenAI
- futuros proveedores

Los adaptadores traducen el Prompt compilado al formato requerido por cada proveedor.

El dominio permanece inalterado.

---

# 30. Compliance

Toda implementación SHALL respetar.

- identidad del Prompt;
- contratos;
- composición reutilizable;
- compilación determinística;
- versionado;
- trazabilidad;
- independencia del proveedor de IA;
- integración con Compiler;
- integración con Runtime.

---

# 31. Related Documents

## Domain

- ATLAS-DOM-001 — Knowledge Domain
- ATLAS-DOM-002 — Ontology Domain
- ATLAS-DOM-003 — Context Domain
- ATLAS-DOM-004 — Memory Domain
- ATLAS-DOM-005 — Retrieval Domain

## Architecture

- ATLAS-ARCH-003 — Compiler Architecture
- ATLAS-ARCH-006 — Build Compilation Pipeline

## Engine

- ATLAS-106 — Prompt Engine
- ATLAS-109 — Validation Engine

---

# 32. Implementation Mapping

Este dominio será implementado principalmente en.

```text
packages/

prompt/
│
├── entities/
│   ├── Prompt.ts
│   ├── PromptTemplate.ts
│   ├── PromptComponent.ts
│   ├── PromptContract.ts
│   └── PromptLibrary.ts
│
├── value-objects/
│   ├── PromptId.ts
│   ├── PromptVersion.ts
│   ├── PromptVariable.ts
│   └── PromptPurpose.ts
│
├── services/
│   ├── PromptResolutionService.ts
│   ├── PromptCompilationService.ts
│   ├── PromptRenderingService.ts
│   ├── PromptValidationService.ts
│   ├── PromptCompositionService.ts
│   └── PromptRegistryService.ts
│
├── repositories/
│   └── PromptRepository.ts
│
├── specifications/
│   ├── ValidPromptSpecification.ts
│   ├── PromptContractSpecification.ts
│   ├── PromptCompositionSpecification.ts
│   └── PromptCompatibilitySpecification.ts
│
├── events/
│   ├── PromptCreated.ts
│   ├── PromptCompiled.ts
│   ├── PromptPublished.ts
│   ├── PromptExecuted.ts
│   └── PromptArchived.ts
│
└── index.ts
```

---

# 33. Cursor Implementation Checklist

```text
□ Crear Prompt Entity

□ Crear Prompt Template

□ Crear Prompt Components

□ Crear Prompt Contracts

□ Crear Prompt Repository

□ Implementar Prompt Resolution

□ Implementar Prompt Compilation

□ Implementar Prompt Rendering

□ Implementar Prompt Validation

□ Implementar Prompt Registry

□ Crear Domain Events

□ Escribir Unit Tests

□ Registrar package en Compiler

□ Registrar package en Runtime

□ Crear adapters para LLM Providers

□ Exportar package público
```

---

# Change History

| Version | Date | Description |
|----------|------------|------------------------------------------|
| 1.0.0 | 2026-07-16 | Initial Prompt Domain specification. |

---

# Final Statement

El Prompt Domain constituye la capacidad del ecosistema Atlas para transformar conocimiento estructurado en instrucciones ejecutables para motores de inteligencia artificial.

En Atlas, un Prompt deja de ser un bloque de texto y se convierte en un activo de dominio con identidad, contratos, composición, versionado y ciclo de vida propio.

Gracias a este dominio, el Compiler puede generar Prompts determinísticos, reutilizables y auditables, mientras que el Runtime y los distintos proveedores de IA consumen una representación compilada, consistente e independiente de la tecnología subyacente.

Esta separación garantiza que la evolución de los modelos de lenguaje no afecte la arquitectura del ecosistema, preservando la estabilidad y gobernanza de los Prompts como parte integral del conocimiento de Atlas.