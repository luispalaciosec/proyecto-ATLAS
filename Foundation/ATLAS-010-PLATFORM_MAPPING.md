---
id: ATLAS-010
title: Platform Mapping
version: 1.0.0
status: draft
owner: Atlas Architecture Board
classification: foundation
created: 2026-07-17
last_updated: 2026-07-17
purpose: >
  Establecer el mapa oficial de correspondencia entre Foundation,
  Domain, Architecture, Engine, SDK y las interfaces públicas del
  ecosistema Atlas, definiendo el rol y las responsabilidades de
  cada capa dentro de la plataforma.
---

# ATLAS-010 — Platform Mapping

> "One platform. Multiple layers. One shared language."

---

# 1. Purpose

Este documento define el mapa oficial de la plataforma Atlas.

Su propósito es explicar cómo se relacionan las diferentes capas arquitectónicas del ecosistema y cuál es la responsabilidad específica de cada una.

No introduce nuevos conceptos.

No modifica la arquitectura existente.

Únicamente establece las relaciones entre los documentos oficiales.

---

# 2. Platform Vision

Atlas está organizado como una plataforma compuesta por capas independientes pero complementarias.

Cada capa responde una pregunta distinta.

```text
¿Por qué existe Atlas?

↓

¿Qué es Atlas?

↓

¿Cómo está diseñado?

↓

¿Cómo funciona?

↓

¿Cómo se consume?
```

---

# 3. Platform Layers

La plataforma se organiza en seis capas principales.

```text
Foundation

↓

Domain

↓

Architecture

↓

Engine

↓

SDK

↓

Interfaces
```

Cada capa depende únicamente de las capas inferiores conceptualmente, manteniendo una clara separación de responsabilidades.

---

# 4. Layer Responsibilities

## Foundation

Define la identidad del ecosistema.

Responde preguntas como.

- propósito;
- visión;
- principios;
- gobierno;
- lenguaje común;
- toma de decisiones.

No contiene implementaciones.

---

## Domain

Define el modelo conceptual de Atlas.

Responde preguntas como.

- qué entidades existen;
- cómo se relacionan;
- cuáles son sus responsabilidades;
- cuáles son las reglas del negocio.

No contiene infraestructura.

---

## Architecture

Define la estructura técnica del sistema.

Responde preguntas como.

- cómo se organizan los componentes;
- cómo colaboran;
- cómo se compila;
- cómo se despliega;
- cómo se escalan las capacidades.

No contiene lógica de negocio.

---

## Engine

Implementa las capacidades definidas por el dominio y la arquitectura.

Incluye.

- Compiler;
- Runtime;
- Memory Engine;
- Workflow Engine;
- Agent Runtime;
- Prompt Engine;
- Retrieval Engine.

Es el núcleo operativo de Atlas.

---

## SDK

Expone la API pública del Kernel.

Incluye.

- CLI;
- SDK TypeScript;
- SDK Python;
- Events;
- REST;
- GraphQL;
- Webhooks.

No implementa lógica de negocio.

Consume el Kernel.

---

## Interfaces

Representan los consumidores finales.

Ejemplos.

- CLI;
- aplicaciones;
- IDEs;
- Cursor;
- VS Code;
- servicios externos;
- integraciones;
- automatizaciones.

---

# 5. Relationship Map

```text
                FOUNDATION
        (Identity & Governance)
                     │
                     ▼
                 DOMAIN
         (Business Concepts)
                     │
                     ▼
              ARCHITECTURE
         (System Structure)
                     │
                     ▼
                 ENGINE
         (Kernel Components)
                     │
                     ▼
                   SDK
          (Public Contracts)
                     │
                     ▼
              INTERFACES
      (CLI · REST · GraphQL · Apps)
```

Cada nivel agrega capacidades sin modificar la responsabilidad del nivel anterior.

---

# 6. Foundation → Domain Mapping

Foundation define los conceptos estratégicos.

Domain los convierte en entidades del sistema.

| Foundation | Domain |
|------------|--------|
| Knowledge | Knowledge Domain |
| Ontology | Ontology Domain |
| Context | Context Domain |
| Memory | Memory Domain |
| Prompt | Prompt Domain |
| Workflow | Workflow Domain |
| Agent | Agent Domain |
| Runtime | Runtime Domain |

---

# 7. Domain → Engine Mapping

Cada dominio posee una implementación dentro del Engine.

| Domain | Engine |
|---------|--------|
| Knowledge | Knowledge Engine |
| Ontology | Ontology Engine |
| Context | Context Engine |
| Memory | Memory Engine |
| Retrieval | Retrieval Engine |
| Prompt | Prompt Engine |
| Workflow | Workflow Engine |
| Agent | Agent Runtime |
| Runtime | Runtime Engine |

---

# 8. Engine → SDK Mapping

El SDK expone las capacidades implementadas por el Engine.

| Engine | SDK |
|---------|-----|
| Compiler | Compiler Client |
| Runtime | Runtime Client |
| Knowledge Engine | Knowledge Client |
| Context Engine | Context Client |
| Memory Engine | Memory Client |
| Workflow Engine | Workflow Client |
| Agent Runtime | Agent Client |
| Publisher Engine | Publisher Client |

---

# 9. SDK → Interfaces Mapping

Los consumidores utilizan únicamente la API pública del SDK.

```text
CLI

↓

SDK

↓

Kernel
```

```text
REST

↓

SDK

↓

Kernel
```

```text
GraphQL

↓

SDK

↓

Kernel
```

```text
Webhooks

↓

SDK Events

↓

External Systems
```

Ninguna interfaz accede directamente al Engine.

---

# 10. Information Flow

El flujo oficial de información dentro de Atlas es.

```text
Knowledge

↓

Compiler

↓

Knowledge Graph

↓

Validation

↓

Artifacts

↓

Runtime

↓

Events

↓

SDK

↓

Consumers
```

Este flujo representa el recorrido principal de una operación dentro del ecosistema.

---

# 11. Reading Order

Los nuevos colaboradores deberán estudiar la documentación en el siguiente orden.

```text
Foundation

↓

Domain

↓

Architecture

↓

Engine

↓

SDK

↓

Workspace

↓

Applications
```

Este orden garantiza una comprensión progresiva del ecosistema.

---

# 12. Architectural Principles

Toda evolución de la plataforma deberá respetar los siguientes principios.

- una responsabilidad por capa;
- dependencias unidireccionales;
- contratos públicos estables;
- separación entre dominio e infraestructura;
- desacoplamiento entre productores y consumidores;
- compatibilidad evolutiva.

Ninguna implementación podrá alterar la semántica definida por Foundation o Domain.

---

# 13. Related Documents

## Foundation

- ATLAS-000 — README
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

## Domain

- ATLAS-DOM-000 — Domain Overview

## Architecture

- ATLAS-ARCH-000 — Architecture Overview
- ATLAS-ARCH-001 — System Architecture
- ATLAS-ARCH-002 — Package Architecture
- ATLAS-ARCH-003 — Compiler Architecture
- ATLAS-ARCH-004 — Knowledge Graph Architecture
- ATLAS-ARCH-005 — Runtime Architecture
- ATLAS-ARCH-006 — Build Compilation Pipeline

## Engine

- ATLAS-100 — Engine

## SDK

- ATLAS-200 — SDK Overview
- ATLAS-201 — SDK CLI
- ATLAS-202 — SDK TypeScript
- ATLAS-203 — SDK Python
- ATLAS-204 — SDK Events
- ATLAS-205 — REST API
- ATLAS-206 — GraphQL API
- ATLAS-207 — Webhooks

---

# Change History

| Version | Date | Description |
|----------|------------|------------------------------------------|
| 1.0.0 | 2026-07-17 | Initial platform mapping specification. |

---

# Final Statement

Platform Mapping constituye el documento de integración del ecosistema Atlas.

Su propósito es proporcionar una visión unificada de la plataforma, explicando cómo Foundation, Domain, Architecture, Engine, SDK e Interfaces colaboran para formar un único sistema coherente.

Este documento no introduce nuevas capacidades ni modifica la arquitectura existente; únicamente establece el mapa oficial de relaciones entre las distintas capas del ecosistema, facilitando su comprensión, evolución e implementación.

