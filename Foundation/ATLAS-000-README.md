---
id: ATLAS-000
title: Atlas
subtitle: Preservamos el conocimiento. Amplificamos el criterio. Escalamos la inteligencia.
version: 2.0.0
status: active
owner: Atlas Foundation
classification: public
created: 2026-07-13
last_updated: 2026-07-17
purpose: >
  Introducir Atlas, explicar su propósito, presentar la organización
  completa del proyecto y servir como punto oficial de entrada a toda
  la documentación del ecosistema.
---

# Atlas

> **Preservamos el conocimiento. Amplificamos el criterio. Escalamos la inteligencia.**

Atlas es una plataforma para construir organizaciones inteligentes capaces de preservar, organizar y ampliar su conocimiento a lo largo del tiempo.

Su propósito no consiste en crear otra herramienta de inteligencia artificial.

Su propósito consiste en construir una infraestructura permanente para que el conocimiento, el criterio y la experiencia de una organización puedan sobrevivir a las personas, a las herramientas y a los cambios tecnológicos.

---

# ¿Qué es Atlas?

Atlas es una plataforma de ingeniería del conocimiento.

Combina modelos de dominio, compilación, grafos de conocimiento, memoria, recuperación, agentes, flujos de trabajo y runtimes para transformar conocimiento organizacional en inteligencia operativa reutilizable.

Atlas no almacena únicamente documentos.

Modela conocimiento.

Compila conocimiento.

Relaciona conocimiento.

Ejecuta conocimiento.

---

# ¿Qué NO es Atlas?

Atlas no es un chatbot.

Atlas no es un conjunto de prompts.

Atlas no es un framework de agentes.

Atlas no es un CRM.

Atlas no es un gestor documental.

Atlas no depende de un proveedor específico de IA.

Atlas no reemplaza el criterio humano.

La inteligencia artificial es una capacidad de Atlas.

No constituye su núcleo.

---

# Visión

Creemos que el activo más importante de una organización no son sus datos.

Ni siquiera su tecnología.

Es su criterio.

Las organizaciones extraordinarias toman mejores decisiones porque han construido conocimiento durante años.

Atlas existe para preservar ese conocimiento, convertirlo en criterio reutilizable y permitir que evolucione con el tiempo.

---

# Arquitectura de la Plataforma

Atlas está organizado en capas claramente separadas.

```text
Foundation
        │
        ▼
Domain
        │
        ▼
Architecture
        │
        ▼
Engine
        │
        ▼
SDK
        │
        ▼
Interfaces
```

Cada capa posee una única responsabilidad.

Las implementaciones evolucionan.

Los principios permanecen.

---

# Organización del Proyecto

El repositorio se organiza en bloques funcionales.

```text
Atlas/

├── Foundation/
│
├── Architecture/
│
├── Domain/
│
├── Engine/
│
├── SDK/
│
├── Workspace/
│
├── Apps/
│
├── packages/
│
├── tools/
│
└── docs/
```

Cada bloque representa una responsabilidad diferente dentro del ecosistema.

---

# Foundation

Foundation define la identidad permanente de Atlas.

Incluye.

- propósito;
- visión;
- principios;
- gobernanza;
- lenguaje común;
- decisiones fundamentales.

Foundation cambia lentamente.

Todo el ecosistema se construye sobre ella.

---

# Domain

Domain define el modelo conceptual de Atlas.

Describe las entidades principales del sistema.

- Knowledge
- Ontology
- Context
- Memory
- Retrieval
- Prompt
- Workflow
- Agent
- Runtime

No contiene implementaciones.

---

# Architecture

Architecture define la estructura técnica del ecosistema.

Incluye.

- arquitectura del sistema;
- arquitectura de paquetes;
- arquitectura del compilador;
- arquitectura del Knowledge Graph;
- Runtime;
- Pipeline de compilación.

---

# Engine

Engine implementa el Kernel operativo de Atlas.

Incluye.

- Compiler
- Runtime
- Memory Engine
- Workflow Engine
- Prompt Engine
- Retrieval Engine
- Agent Runtime
- Publisher Engine

Engine constituye el núcleo de ejecución.

---

# SDK

SDK expone las interfaces públicas de Atlas.

Incluye.

- CLI
- TypeScript SDK
- Python SDK
- Event System
- REST API
- GraphQL API
- Webhooks

Toda integración oficial debe consumir el SDK.

---

# Orden Oficial de Lectura

Para comprender Atlas, la documentación deberá estudiarse en el siguiente orden.

```text
ATLAS-000 — README

↓

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

Este recorrido garantiza una comprensión progresiva de la plataforma.

---

# Estado del Proyecto

| Área | Estado |
|-------|--------|
| Foundation | ✅ Completo |
| Architecture | ✅ Completo |
| Domain | ✅ Completo |
| SDK | ✅ Completo |
| Engine | 🟡 Especificación completa |
| Workspace | 🔜 Pendiente |
| Applications | 🔜 Pendiente |
| Kernel | 🚧 Implementación |

Atlas ha completado su fase de diseño arquitectónico.

La siguiente etapa consiste en implementar el Kernel siguiendo los contratos definidos por la documentación.

---

# Implementación

El desarrollo del software sigue una dependencia estricta.

```text
Foundation

↓

Domain

↓

Architecture

↓

Compiler

↓

Runtime

↓

SDK

↓

Applications
```

Ningún componente podrá implementarse contradiciendo la documentación oficial.

Toda evolución arquitectónica deberá realizarse mediante ADR (Architecture Decision Records).

---

# Documentación Principal

## Foundation

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

## Architecture

- ATLAS-ARCH-000 — Architecture Overview
- ATLAS-ARCH-001 — System Architecture
- ATLAS-ARCH-002 — Package Architecture
- ATLAS-ARCH-003 — Compiler Architecture
- ATLAS-ARCH-004 — Knowledge Graph Architecture
- ATLAS-ARCH-005 — Runtime Architecture
- ATLAS-ARCH-006 — Build Compilation Pipeline

## Domain

- ATLAS-DOM-000 — Domain Overview
- ATLAS-DOM-001 — Knowledge Domain
- ATLAS-DOM-002 — Ontology Domain
- ATLAS-DOM-003 — Context Domain
- ATLAS-DOM-004 — Memory Domain
- ATLAS-DOM-005 — Retrieval Domain
- ATLAS-DOM-006 — Prompt Domain
- ATLAS-DOM-007 — Workflow Domain
- ATLAS-DOM-008 — Agent Domain
- ATLAS-DOM-009 — Runtime Domain

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

# Final Statement

Atlas no es una aplicación.

No es un framework.

No es un producto aislado.

Atlas es una plataforma para preservar el conocimiento, amplificar el criterio y escalar la inteligencia de las organizaciones mediante un Kernel capaz de transformar conocimiento estructurado en capacidades operativas reutilizables.

La documentación oficial constituye el contrato arquitectónico del ecosistema.

Toda implementación futura deberá respetar los principios, dominios y contratos definidos en Foundation, Architecture, Domain y SDK para garantizar la evolución coherente de la plataforma.