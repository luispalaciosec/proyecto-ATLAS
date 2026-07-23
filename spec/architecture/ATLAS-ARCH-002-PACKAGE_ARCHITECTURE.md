---
id: ATLAS-ARCH-002
title: Package Architecture
version: 1.1.0
status: draft
owner: Atlas Architecture Board
classification: public
foundation_version: 1.0
architecture_version: 1.0
created: 2026-07-16
last_updated: 2026-07-23
depends_on:
  - ATLAS-012-REPOSITORY_GOVERNANCE
purpose: >
  Definir la arquitectura física del ecosistema Atlas,
  estableciendo la organización del monorepo, la estructura
  de paquetes, las reglas de dependencia, visibilidad,
  versionado y extensión mediante plugins.
---

# ATLAS-ARCH-002 — Package Architecture

> "A good architecture is reflected in the structure of its code."

---

# 1. Purpose

Este documento define la arquitectura física del código fuente de Atlas.

Su objetivo consiste en establecer cómo se organiza el monorepo, cuáles son las categorías oficiales de paquetes, las reglas de dependencia entre ellos y las convenciones que deberán respetarse durante el desarrollo de la plataforma.

Este documento responde a la pregunta:

> **¿Cómo debe organizarse el código de Atlas?**

---

# 2. Scope

La presente especificación aplica a todos los paquetes oficiales del ecosistema Atlas.

Incluye.

- paquetes del Kernel;
- Compiler;
- Knowledge Platform;
- Runtime;
- SDK;
- aplicaciones oficiales;
- plugins;
- herramientas de desarrollo.

Todo paquete SHALL cumplir las reglas definidas en este documento.

---

# 3. Design Goals

La arquitectura de paquetes persigue los siguientes objetivos.

- minimizar el acoplamiento;
- favorecer la cohesión;
- facilitar el mantenimiento;
- permitir evolución independiente;
- soportar crecimiento del monorepo;
- habilitar extensibilidad mediante plugins;
- preservar compatibilidad a largo plazo.

---

# 4. Monorepo Structure

Tras el **Milestone 2 (Repository Stabilization)**, la estructura oficial del repositorio SHALL seguir el modelo definido en `ATLAS-012-REPOSITORY_GOVERNANCE.md`.

```text
ATLAS/

├── spec/                    # Layer 1 — Specifications (normative, no executable code)
│   ├── foundation/
│   ├── architecture/
│   ├── domain/
│   ├── engine/
│   ├── sdk/
│   ├── capabilities/
│   ├── runtime/
│   ├── intelligence/
│   ├── memory/
│   ├── reasoning/
│   └── product/
│
├── ATLAS_ARCHITECTURE_MASTER.md
│
├── packages/                # Layer 2 — Implementation (@atlas/* npm packages)
├── workspaces/              # Real Atlas consumer projects
├── examples/                # Disposable demonstrations
├── releases/                # Layer 4 — Operations (reports, release notes, plans)
├── docs/                    # Layer 3 — Human documentation + proposals/rfc
├── adr/                     # Architecture Decision Records
│
├── apps/                    # Reserved — executable applications
├── plugins/                 # Reserved — third-party extensions
├── templates/               # Reusable templates
├── tools/                   # Development utilities
├── scripts/                 # Automation scripts
├── tests/                   # Reserved — cross-package integration tests
│
├── README.md
├── VERSION.md
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── .github/
```

### 4.1 Separation: spec/ vs packages/

| Layer | Directory | Contains | MUST NOT contain |
|-------|-----------|----------|------------------|
| Specifications | `spec/` | Normative WHAT documents | Executable code |
| Implementation | `packages/` | TypeScript source, tests, CHANGELOG | Architectural specifications |
| Documentation | `docs/` | Tutorials, guides, RFC proposals | Normative specs |
| Operations | `releases/` | Sprint reports, release notes, plans | Normative specs |
| Decisions | `adr/` | ADRs (WHY decisions were made) | Normative specs |

Specifications define behavior. Packages implement it. `releases/` and `adr/` document evolution — they do not define Atlas.

### 4.2 Workspace membership (pnpm)

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'tools/*'
  - 'examples/*'
  - 'workspaces/*'
```

Cada directorio posee una responsabilidad claramente definida.

---

# 5. Directory Responsibilities

## spec/

Contiene **todas** las especificaciones normativas de Atlas.

Subdirectorios oficiales: `foundation/`, `architecture/`, `domain/`, `engine/`, `sdk/`, `capabilities/`, `runtime/`, `intelligence/`, `memory/`, `reasoning/`, `product/`.

No contiene código ejecutable. Ver `ATLAS-012 §5`.

---

## releases/

Contiene la evolución operativa del proyecto.

Ejemplos: release notes, sprint reports, implementation plans, migration reports.

No define el comportamiento de Atlas. Ver `ATLAS-012 §10`.

---

## adr/

Contiene Architecture Decision Records.

Documenta decisiones puntuales (contexto, alternativas, consecuencias). Complementa `spec/` — no lo reemplaza.

---

## docs/

Documentación orientada a humanos: índices, guías, tutoriales.

Las propuestas en revisión (RFCs) viven en `docs/proposals/rfc/`.

No contiene especificaciones normativas. Ver `ATLAS-012 §7`.

---

## apps/

Contiene aplicaciones ejecutables.

Ejemplos.

- atlas-cli
- atlas-api
- atlas-web
- atlas-studio
- atlas-vscode

Las aplicaciones SHALL consumir la plataforma.

Nunca implementarla.

---

## packages/

Contiene la implementación ejecutable de Atlas.

Todos los paquetes npm `@atlas/*` pertenecen a este directorio.

### 5.1 Current packages (2026-07-23)

| Package | Version | Category | Status |
|---------|---------|----------|--------|
| `@atlas/core` | 0.1.1 | Kernel | ✅ Frozen |
| `@atlas/events` | 0.1.0 | Kernel | ✅ Frozen |
| `@atlas/compiler` | 0.1.1 | Kernel | ✅ Frozen |
| `@atlas/runtime` | 0.1.0 | Kernel (+ Sprint 10D Pipeline) | ✅ Frozen |
| `@atlas/sdk` | 0.3.0 | Integration | ✅ Frozen |
| `@atlas/cli` | 0.1.0 | Integration | ✅ Frozen |
| `@atlas/knowledge` | 0.2.0 | Capability | ✅ Stable |
| `@atlas/workflow` | 0.1.0 | Capability | ✅ Frozen (Sprint 10E) |
| `@atlas/intelligence` | 0.1.0 | Capability | ✅ Frozen (Sprint 10F) |
| `@atlas/agent` | 0.0.0 | Capability stub | 🔒 Bootstrap |
| `@atlas/context` | 0.0.0 | Capability stub | 🔒 Bootstrap |
| `@atlas/context-planner` | 0.0.0 | Capability stub | 🔒 Bootstrap |
| `@atlas/graph` | 0.0.0 | Capability stub | 🔒 Bootstrap |
| `@atlas/memory` | 0.0.0 | Capability stub | 🔒 Bootstrap — Sprint 11A next |
| `@atlas/ontology` | 0.0.0 | Capability stub | 🔒 Bootstrap |
| `@atlas/plugin` | 0.0.0 | Infra stub | 🔒 Bootstrap |
| `@atlas/prompt` | 0.0.0 | Capability stub | 🔒 Bootstrap |
| `@atlas/publisher` | 0.0.0 | Infra stub | 🔒 Bootstrap |
| `@atlas/retrieval` | 0.0.0 | Capability stub | 🔒 Bootstrap |
| `@atlas/search` | 0.0.0 | Capability stub | 🔒 Bootstrap |
| `@atlas/validation` | 0.0.0 | Infra stub | 🔒 Bootstrap |

Ver [`VERSION.md`](../../VERSION.md) para el registro oficial de versiones.

### 5.2 Kernel dependency graph (implemented)

```text
@atlas/core
    ↓
@atlas/events
    ↓
@atlas/compiler
    ↓
@atlas/runtime
    ↓
@atlas/sdk  ← also depends on @atlas/knowledge (Sprint 9)
    ↓
@atlas/cli
```

---

## workspaces/

Contiene proyectos Atlas completos de referencia.

Ejemplo: `workspaces/first-atlas-workspace/`.

Un workspace consume la plataforma; nunca la implementa. Ver `ATLAS-012 §9`.

---

## plugins/

Contiene extensiones independientes.

Los plugins SHALL comunicarse únicamente mediante contratos públicos.

---

## docs/

Documentación humana e índices. Las RFCs en revisión viven en `docs/proposals/rfc/`.

No contiene lógica ejecutable ni especificaciones normativas.

---

## examples/

Ejemplos completos de uso.

---

## templates/

Plantillas utilizadas por Generators.

---

## tests/

Pruebas compartidas.

---

## tools/

Herramientas internas del proyecto.

---

# 6. Package Categories

Los paquetes oficiales se clasifican en las siguientes categorías.

## Foundation Packages

Componentes fundamentales compartidos.

Ejemplos.

- shared
- types
- errors

---

## Platform Packages

Implementan el dominio principal.

Ejemplos.

- core
- compiler
- graph
- knowledge
- ontology
- context
- memory

---

## Runtime Packages

Gestionan la ejecución.

Ejemplos.

- runtime
- workflow
- events

---

## Integration Packages

Permiten comunicación externa.

Ejemplos.

- sdk
- rest
- graphql
- webhooks

---

## Infrastructure Packages

Proporcionan capacidades técnicas.

Ejemplos.

- generators
- publishers
- storage
- telemetry

---

## Plugin Packages

Extensiones desarrolladas por terceros.

---

# 7. Official Package Layout

Cada paquete SHALL respetar la siguiente estructura mínima.

```text
package/

src/
tests/
docs/

package.json

README.md

CHANGELOG.md

LICENSE
```

Podrán añadirse directorios adicionales cuando resulte necesario.

---

# 8. Package Naming

Los paquetes oficiales utilizarán el siguiente formato.

```text
@atlas/<package>
```

Ejemplos.

```text
@atlas/compiler

@atlas/core

@atlas/runtime

@atlas/sdk
```

Los nombres SHALL ser.

- descriptivos;
- breves;
- estables;
- consistentes.

---

# 9. Dependency Model

Toda dependencia deberá respetar el siguiente flujo.

```text
Applications

↓

Runtime

↓

SDK

↓

Compiler

↓

Knowledge Platform

↓

Shared
```

Las dependencias inversas quedan prohibidas.

---

# 10. Dependency Rules

Todo paquete SHALL depender únicamente de contratos públicos.

Los paquetes SHALL NOT acceder a implementaciones internas de otros paquetes.

Las dependencias circulares quedan estrictamente prohibidas.

Cada paquete SHALL mantener responsabilidades claramente delimitadas.

---

# 11. Public API

Cada paquete expondrá únicamente una API pública.

Las implementaciones internas permanecerán encapsuladas.

Se recomienda la siguiente estructura.

```text
src/

index.ts

internal/

contracts/

services/

adapters/
```

Todo elemento ubicado dentro de `internal/` SHALL considerarse privado.

---

# 12. Package Lifecycle

Todo paquete oficial seguirá el siguiente ciclo de vida.

```text
Proposal

↓

Architecture Review

↓

Implementation

↓

Validation

↓

Release

↓

Maintenance

↓

Deprecation

↓

Removal
```

Toda creación de nuevos paquetes SHALL contar con aprobación arquitectónica.

---

# 13. Versioning

Todos los paquetes utilizarán Semantic Versioning.

```text
MAJOR.MINOR.PATCH
```

Las reglas serán.

- MAJOR → cambios incompatibles.
- MINOR → nuevas capacidades compatibles.
- PATCH → correcciones.

---

# 14. Ownership

Cada paquete SHALL poseer un responsable claramente identificado.

El propietario será responsable de.

- evolución;
- mantenimiento;
- documentación;
- compatibilidad;
- revisiones.

---

# 15. Future Packages

La arquitectura reserva espacio para futuros paquetes.

Ejemplos.

```text
@atlas/ai

@atlas/security

@atlas/vector

@atlas/events

@atlas/cloud

@atlas/runtime

@atlas/studio

@atlas/telemetry

@atlas/observability
```

La incorporación de nuevos paquetes SHALL respetar las reglas definidas en este documento.

---

# 16. Compliance

Toda implementación oficial SHALL cumplir.

- arquitectura del monorepo;
- reglas de dependencia;
- convenciones de nombres;
- aislamiento mediante interfaces;
- versionado semántico;
- responsabilidades claramente delimitadas.

---

# 17. Related Documents

Architecture

- ATLAS-ARCH-000 — Architecture Overview
- ATLAS-ARCH-001 — System Architecture
- ATLAS-ARCH-003 — Compiler Architecture
- ATLAS-ARCH-004 — Knowledge Graph Architecture
- ATLAS-ARCH-005 — Runtime Architecture
- ATLAS-ARCH-006 — Build Compilation Pipeline

---

# 18. Change History

| Version | Date | Description |
|----------|------------|---------------------------------------------|
| 1.1.0 | 2026-07-19 | Aligned with Milestone 2 repository structure (`spec/`, `releases/`, `adr/`, `docs/`). Added current package inventory and spec/implementation separation. Sprint 9.1. |
| 1.0.0 | 2026-07-16 | Initial Package Architecture specification. |

---

# Final Statement

La arquitectura de paquetes constituye el contrato estructural del código fuente de Atlas.

Su propósito consiste en garantizar una organización consistente del monorepo, preservar el desacoplamiento entre componentes y facilitar la evolución independiente de cada módulo del ecosistema.

Toda implementación futura SHALL respetar las categorías de paquetes, las reglas de dependencia y las convenciones definidas en este documento para asegurar la mantenibilidad y escalabilidad de la plataforma.