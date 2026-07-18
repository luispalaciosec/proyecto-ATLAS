---
id: ATLAS-ARCH-001
title: System Architecture
version: 1.0.0
status: draft
owner: Atlas Architecture Board
classification: public
foundation_version: 1.0
architecture_version: 1.0
created: 2026-07-16
last_updated: 2026-07-16
purpose: >
  Definir la arquitectura de referencia del ecosistema Atlas,
  estableciendo las capas principales del sistema, sus
  responsabilidades, relaciones, límites y principios de
  diseño que deberán respetar todas las implementaciones
  oficiales.
---

# ATLAS-ARCH-001 — System Architecture

> "The architecture defines the structure. The implementation realizes it."

---

# 1. Purpose

Este documento define la arquitectura de referencia del software Atlas.

Su objetivo consiste en describir la organización estructural de la plataforma, identificando los principales subsistemas, sus responsabilidades, las relaciones entre ellos y las reglas arquitectónicas que garantizan una evolución coherente del ecosistema.

Este documento responde a la pregunta:

> **¿Cómo está construido Atlas?**

---

# 2. Scope

La presente arquitectura aplica a todos los componentes oficiales del ecosistema Atlas.

Incluye:

- Atlas Kernel
- Atlas Compiler
- Atlas Knowledge Platform
- Atlas Runtime
- Atlas SDK
- Atlas CLI
- Atlas Studio
- APIs oficiales
- Plugins oficiales

Toda implementación SHALL respetar los principios definidos en este documento.

---

# 3. Architectural Vision

Atlas constituye una **Knowledge Platform**.

Su propósito consiste en transformar información distribuida en conocimiento estructurado, validado y reutilizable.

La arquitectura ha sido diseñada siguiendo un principio fundamental.

**El conocimiento constituye el activo principal del sistema.**

Los documentos representan únicamente una proyección del conocimiento.

Las APIs representan otra.

Las interfaces gráficas representan otra.

El verdadero modelo del sistema reside en el **Knowledge Graph**.

---

# 4. System Layers

Atlas se organiza mediante cinco capas claramente diferenciadas.

```text
┌──────────────────────────────────────────┐
│              Applications                │
├──────────────────────────────────────────┤
│              Atlas Kernel                │
├──────────────────────────────────────────┤
│            Compiler Pipeline             │
├──────────────────────────────────────────┤
│          Knowledge Platform              │
├──────────────────────────────────────────┤
│             Infrastructure               │
└──────────────────────────────────────────┘
```

Cada capa posee responsabilidades específicas y únicamente puede depender de capas inferiores.

---

# 5. Applications Layer

La capa de aplicaciones representa todos los puntos de entrada oficiales hacia Atlas.

Ejemplos.

- Atlas CLI
- Atlas Studio
- Atlas Web
- Atlas API
- VS Code Extension

Responsibilities.

- interacción con usuarios;
- recepción de comandos;
- presentación de información;
- automatización de tareas.

Las aplicaciones SHALL NOT contener lógica de negocio.

Toda operación deberá delegarse al Kernel.

---

# 6. Atlas Kernel

El Kernel constituye el núcleo operativo de la plataforma.

Su responsabilidad consiste en coordinar todos los servicios internos del ecosistema.

Entre sus responsabilidades principales se incluyen.

- inicialización del sistema;
- administración del Workspace;
- descubrimiento de paquetes;
- descubrimiento de plugins;
- carga de configuración;
- registro de servicios;
- administración del ciclo de vida;
- logging;
- telemetría;
- eventos internos;
- caché.

El Kernel coordina.

No transforma conocimiento.

---

# 7. Compiler Pipeline

El Compiler constituye el motor de transformación de Atlas.

Su función consiste en convertir información de entrada en conocimiento estructurado.

El flujo general de compilación es el siguiente.

```text
Source

↓

Compilation Units

↓

Knowledge Nodes (HIR)

↓

Knowledge Graph (MIR)

↓

Validation

↓

Artifacts

↓

Publishers
```

Todo proceso oficial SHALL ejecutarse mediante este pipeline.

---

# 8. Knowledge Platform

La Knowledge Platform representa el dominio principal de Atlas.

Está compuesta por modelos especializados como.

- Knowledge Graph
- Ontology
- Context
- Memory
- Search
- Retrieval
- Validation

Esta capa constituye la fuente oficial de verdad del ecosistema.

Los documentos no representan el origen del conocimiento.

El Knowledge Graph sí.

---

# 9. Infrastructure

La infraestructura proporciona capacidades técnicas reutilizables.

Ejemplos.

- Filesystem
- Git
- GitHub
- Storage
- Databases
- HTTP
- Template Engines
- AI Providers

La infraestructura SHALL NOT contener reglas de negocio.

Su única responsabilidad consiste en proporcionar servicios técnicos.

---

# 10. Dependency Rules

Toda dependencia arquitectónica deberá seguir la siguiente dirección.

```text
Applications
        │
        ▼
Atlas Kernel
        │
        ▼
Compiler Pipeline
        │
        ▼
Knowledge Platform
        │
        ▼
Infrastructure
```

Las dependencias circulares quedan estrictamente prohibidas.

Las capas inferiores nunca deberán depender de capas superiores.

---

# 11. Architectural Principles

Toda implementación SHALL respetar los siguientes principios.

## Knowledge First

El conocimiento constituye el principal activo de Atlas.

---

## Graph Native

Toda representación deberá poder derivarse del Knowledge Graph.

---

## Compiler Driven

Toda transformación oficial deberá ejecutarse mediante el Compiler Pipeline.

---

## Interface First

Los componentes deberán comunicarse únicamente mediante contratos públicos.

---

## Package Oriented

Cada responsabilidad pertenecerá a un paquete independiente.

---

## Plugin Native

Las capacidades extensibles deberán implementarse mediante interfaces oficiales.

---

## Technology Independent

La arquitectura no dependerá de tecnologías específicas.

Markdown, Git, GraphQL, REST o TypeScript representan únicamente implementaciones posibles.

---

# 12. Architectural Constraints

Las siguientes restricciones constituyen normas obligatorias.

- SHALL NOT existir dependencias circulares.
- SHALL NOT existir lógica de negocio dentro de Applications.
- SHALL NOT existir acceso directo desde Applications hacia Infrastructure.
- SHALL existir separación estricta entre coordinación (Kernel) y transformación (Compiler).
- SHALL existir un único Knowledge Graph oficial por Workspace.

---

# 13. Related Documents

Foundation

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

Domain

- ATLAS-DOM-000 — Domain Overview

Architecture

- ATLAS-ARCH-000 — Architecture Overview
- ATLAS-ARCH-002 — Package Architecture
- ATLAS-ARCH-003 — Compiler Architecture
- ATLAS-ARCH-004 — Knowledge Graph Architecture
- ATLAS-ARCH-005 — Runtime Architecture
- ATLAS-ARCH-006 — Build Compilation Pipeline

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
- ATLAS-110 — Context Planner

SDK

- ATLAS-200 — SDK Overview
- ATLAS-201 — SDK CLI
- ATLAS-202 — SDK TypeScript
- ATLAS-203 — SDK Python
- ATLAS-204 — SDK Events
- ATLAS-205 — REST API
- ATLAS-206 — GraphQL API
- ATLAS-207 — Webhooks

---

# 14. Change History

| Version | Date | Description |
|----------|------------|-----------------------------------------------|
| 1.0.0 | 2026-07-16 | Initial System Architecture specification. |

---

# Final Statement

La arquitectura del sistema constituye el contrato técnico fundamental del ecosistema Atlas.

Su propósito consiste en garantizar que todas las implementaciones oficiales compartan una estructura consistente, desacoplada y escalable, preservando la separación entre coordinación, compilación, conocimiento e infraestructura.

Toda evolución futura de Atlas deberá respetar las responsabilidades, dependencias y principios definidos en este documento, asegurando la estabilidad de la plataforma y la interoperabilidad entre todos sus componentes.