---
id: ATLAS-000
title: Atlas
subtitle: Preservamos el conocimiento. Amplificamos el criterio. Escalamos la inteligencia.
version: 2.0.0
status: active
owner: Atlas Foundation
classification: public
created: 2026-07-13
last_updated: 2026-07-23
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

Tras el **Milestone 2 (Repository Stabilization)**, el repositorio se organiza por **responsabilidad**, no por capas sueltas en la raíz. Toda especificación normativa vive bajo `spec/`. La implementación vive en `packages/`. La evolución del proyecto se documenta en `releases/`.

Ver gobernanza completa: [`spec/foundation/ATLAS-012-REPOSITORY_GOVERNANCE.md`](./ATLAS-012-REPOSITORY_GOVERNANCE.md).

```text
ATLAS/

├── spec/                    # Especificaciones normativas (QUÉ es Atlas)
│   ├── foundation/          # Identidad, principios, gobernanza
│   ├── architecture/        # Arquitectura del sistema y del monorepo
│   ├── domain/              # Modelo de dominio
│   ├── engine/              # Especificaciones de motores
│   ├── sdk/                 # SDK, CLI, APIs
│   ├── capabilities/        # Capabilities (p. ej. knowledge/)
│   ├── runtime/             # Runtime specs (Sprint 10A–10D)
│   ├── intelligence/        # Intelligence Layer specs (+ contracts/)
│   ├── memory/              # Memory Engine specs (+ contracts/)
│   ├── reasoning/           # Reasoning Engine specs (+ contracts/)
│   └── product/             # Modelo conceptual de producto
│
├── packages/                # Implementación ejecutable (@atlas/*)
├── workspaces/              # Proyectos Atlas de referencia
├── examples/                # Demos técnicas
├── releases/                # Releases, reportes de sprint, planes
├── docs/                    # Documentación humana + proposals/rfc
├── adr/                     # Architecture Decision Records
├── ATLAS_ARCHITECTURE_MASTER.md  # Referencia arquitectónica consolidada
├── apps/                    # Aplicaciones (reservado)
├── plugins/                 # Extensiones (reservado)
├── templates/               # Plantillas reutilizables
├── tools/                   # Herramientas de desarrollo
├── scripts/                 # Automatización
└── tests/                   # Tests cross-package (reservado)
```

Cada bloque responde a una única pregunta. Las capas conceptuales (Foundation, Domain, Architecture, Engine, SDK) **permanecen como modelo mental**, pero **físicamente** viven bajo `spec/`.

---

# Foundation

Foundation define la identidad permanente de Atlas.

Ubicación: [`spec/foundation/`](./)

Incluye.

- propósito;
- visión;
- principios;
- gobernanza del repositorio (`ATLAS-012`, `ATLAS-013`);
- lenguaje común;
- decisiones fundamentales.

Foundation cambia lentamente.

Todo el ecosistema se construye sobre ella.

---

# Domain

Domain define el modelo conceptual de Atlas.

Ubicación: [`spec/domain/`](../domain/)

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

Ubicación: [`spec/architecture/`](../architecture/)

Incluye.

- arquitectura del sistema;
- arquitectura de paquetes;
- arquitectura del compilador;
- arquitectura del Knowledge Graph;
- Runtime;
- Pipeline de compilación.

---

# Engine

Engine especifica el Kernel operativo de Atlas.

Ubicación: [`spec/engine/`](../engine/)

Incluye.

- Compiler
- Runtime
- Memory Engine
- Workflow Engine
- Prompt Engine
- Retrieval Engine
- Agent Runtime
- Publisher Engine

Las implementaciones correspondientes viven en `packages/`.

---

# SDK

SDK especifica las interfaces públicas de Atlas.

Ubicación: [`spec/sdk/`](../sdk/)

Incluye.

- CLI
- TypeScript SDK
- Python SDK
- Event System
- REST API
- GraphQL API
- Webhooks

Toda integración oficial debe consumir el SDK (`@atlas/sdk`).

---

# Capabilities

Las capabilities extienden el Kernel con dominios de valor.

Ubicación: [`spec/capabilities/`](../capabilities/)

La primera capability implementada es **Knowledge** (`spec/capabilities/knowledge/`, `@atlas/knowledge`).

---

# Orden Oficial de Lectura

Para comprender Atlas, la documentación deberá estudiarse en el siguiente orden.

```text
spec/foundation/ATLAS-000-README.md

↓

spec/foundation/

↓

spec/domain/

↓

spec/architecture/

↓

spec/engine/

↓

spec/sdk/

↓

spec/capabilities/ (según capability)

↓

workspaces/

↓

packages/ (implementación)
```

Este recorrido garantiza una comprensión progresiva de la plataforma.

---

# Estado del Proyecto

| Área | Estado |
|-------|--------|
| Foundation (spec) | ✅ Completo |
| Architecture (spec) | ✅ Completo |
| Domain (spec) | ✅ Completo |
| Engine (spec) | ✅ Especificación completa |
| Runtime (spec) | ✅ Completo |
| Intelligence (spec) | ✅ Completo |
| Memory (spec) | ✅ Completo |
| Reasoning (spec) | ✅ Completo |
| SDK (spec) | ✅ Completo |
| Architecture Phase | ✅ Completada |
| Current Phase | 🚧 Implementation |
| Next Sprint | Sprint 11A — Memory Engine |
| Repository Stabilization (Milestone 2) | ✅ Completado |
| Kernel (`@atlas/core`, compiler, events, runtime, sdk, cli) | ✅ Implementado — v0.1 congelado |
| Knowledge Capability (`@atlas/knowledge`) | ✅ Stable (Sprint 8–9) |
| Workflow (`@atlas/workflow`) | ✅ Frozen (Sprint 10E) |
| Planning (`@atlas/intelligence`) | ✅ Frozen (Sprint 10F) |
| Runtime extensions (10A–10D) | ✅ Frozen |
| Workspaces | ✅ Referencia (`first-atlas-workspace`) |
| Applications (`apps/`) | 🔜 Reservado |

Atlas completó oficialmente su fase de arquitectura.

La etapa activa consiste en implementar capabilities sobre el Kernel congelado, comenzando por Memory (Sprint 11A), respetando `spec/` como contrato.

---

# Implementación

El desarrollo del software sigue una dependencia estricta.

```text
spec/ (contrato normativo)

↓

packages/ (implementación)

↓

workspaces/ + examples/ (consumo)
```

Ningún componente podrá implementarse contradiciendo la documentación oficial en `spec/`.

Toda evolución arquitectónica deberá realizarse mediante ADR en [`adr/`](../../adr/).

Reportes de sprint, releases e implementation plans viven en [`releases/`](../../releases/) — no son normativos.

---

# Documentación Principal

## Foundation — `spec/foundation/`

- ATLAS-000 — README (este documento)
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
- ATLAS-012 — Repository Governance
- ATLAS-013 — Naming Conventions

## Architecture — `spec/architecture/`

- ATLAS-ARCH-000 — Architecture Overview
- ATLAS-ARCH-001 — System Architecture
- ATLAS-ARCH-002 — Package Architecture
- ATLAS-ARCH-003 — Compiler Architecture
- ATLAS-ARCH-004 — Knowledge Graph Architecture
- ATLAS-ARCH-005 — Plugin Architecture
- ATLAS-ARCH-006 — Build Compilation Pipeline

## Domain — `spec/domain/`

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

## Engine — `spec/engine/`

- ATLAS-100 — Engine Overview
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

## SDK — `spec/sdk/`

- ATLAS-200 — SDK Overview
- ATLAS-201 — SDK CLI
- ATLAS-202 — SDK TypeScript
- ATLAS-203 — SDK Python
- ATLAS-204 — SDK Events
- ATLAS-205 — REST API
- ATLAS-206 — GraphQL API
- ATLAS-207 — Webhooks

## Capabilities — `spec/capabilities/`

- KNOWLEDGE-001 … KNOWLEDGE-008 — Knowledge Capability (`spec/capabilities/knowledge/`)

## Runtime — `spec/runtime/`

- ATLAS-RUNTIME-001 … ATLAS-RUNTIME-009 — Runtime models and architecture
- ATLAS-RUNTIME-100 — Runtime Public API

## Intelligence — `spec/intelligence/`

- ATLAS-INTELLIGENCE-001 … ATLAS-INTELLIGENCE-011 — Intelligence Layer
- ATLAS-INTELLIGENCE-100 — Intelligence Public API
- ATLAS-INTELLIGENCE-007 — Workflow (capability spec)
- [`spec/intelligence/contracts/`](../../intelligence/contracts/) — Intelligence contracts

## Memory — `spec/memory/`

- ATLAS-MEMORY-001 … ATLAS-MEMORY-008 — Memory Engine
- [`spec/memory/contracts/`](../../memory/contracts/) — Memory contracts

## Reasoning — `spec/reasoning/`

- ATLAS-REASONING-001 … ATLAS-REASONING-007 — Reasoning Engine
- [`spec/reasoning/contracts/`](../../reasoning/contracts/) — Reasoning contracts

## Product — `spec/product/`

- ATLAS-002 — Conceptual Model (ver ADR-0001 sobre namespace de IDs)

## Operación — `releases/`, `adr/`, `docs/`

- [`releases/`](../../releases/) — Releases oficiales, sprint reports, implementation plans
- [`adr/`](../../adr/) — Architecture Decision Records (ADR-0001, ADR-0002)
- [`docs/`](../../docs/) — Documentación humana y RFCs (`docs/proposals/rfc/`)
- [`ATLAS_ARCHITECTURE_MASTER.md`](../../ATLAS_ARCHITECTURE_MASTER.md) — Referencia arquitectónica consolidada

---

# Final Statement

Atlas no es una aplicación.

No es un framework.

No es un producto aislado.

Atlas es una plataforma para preservar el conocimiento, amplificar el criterio y escalar la inteligencia de las organizaciones mediante un Kernel capaz de transformar conocimiento estructurado en capacidades operativas reutilizables.

La documentación oficial constituye el contrato arquitectónico del ecosistema.

Toda implementación futura deberá respetar los principios, dominios y contratos definidos en `spec/` para garantizar la evolución coherente de la plataforma.