---
id: ATLAS-VERSION-001
title: Atlas Version Registry
version: 1.2.0
status: active
last_updated: 2026-07-23
---

# VERSION.md

## Official Atlas Version

| Field | Value |
|-------|-------|
| **Atlas Version** | `0.1.0-alpha` |
| **Kernel Version** | `0.1` |
| **Kernel Status** | **Frozen** |
| **Architecture Phase** | **Completed** |
| **Current Phase** | **Implementation** |
| **Next Sprint** | **Sprint 11A — Memory Engine** (`@atlas/memory`) |
| **Foundation Phase** | **Completed** |
| **Repository Stabilization (Milestone 2)** | **Completed** |
| **Release document** | [`releases/ATLAS-RELEASE-001-KERNEL_v0.1.md`](./releases/ATLAS-RELEASE-001-KERNEL_v0.1.md) |
| **Architecture reference** | [`ATLAS_ARCHITECTURE_MASTER.md`](./ATLAS_ARCHITECTURE_MASTER.md) |
| **Internal RC tag** | `kernel-v0.1.0-alpha.1` |

---

## Kernel package versions

Versiones publicadas en `package.json` al cierre del Kernel y actualizaciones post-Foundation:

| Package | Version | Role | Status |
|---------|---------|------|--------|
| `@atlas/core` | 0.1.1 | Primitivas fundacionales | **Frozen** |
| `@atlas/compiler` | 0.1.1 | Pipeline de compilación | **Frozen** |
| `@atlas/events` | 0.1.0 | Eventos de dominio | **Frozen** |
| `@atlas/runtime` | 0.1.0 | Ejecución de artifacts + Pipeline Engine (Sprint 10D) | **Frozen** |
| `@atlas/sdk` | 0.3.0 | Fachada pública del Kernel (+ integración Knowledge, Sprint 9) | **Frozen** |
| `@atlas/cli` | 0.1.0 | Interfaz de línea de comandos | **Frozen** |

> **Nota de versionado:** La versión de producto Atlas es `0.1.0-alpha` (Kernel v0.1 congelado). Los paquetes npm mantienen semver independiente por componente.

---

## Capability package versions

| Package | Version | Role | Status |
|---------|---------|------|--------|
| `@atlas/knowledge` | 0.2.0 | Knowledge Capability — metamodel, domain core, projection adapter (Sprint 8–9) | **Stable** |
| `@atlas/workflow` | 0.1.0 | Workflow Definition System — graph model, WorkflowCompiler (Sprint 10E) | **Frozen** |
| `@atlas/intelligence` | 0.1.0 | Cognitive Planning Engine — Goal → WorkflowDefinition (Sprint 10F) | **Frozen** |

---

## Runtime extensions (Sprint 10A–10D)

Extensiones cognitivas dentro de `@atlas/runtime@0.1.0`. Congeladas — no modificar sin ADR.

| Sprint | Componente | Status |
|--------|------------|--------|
| 10A | Execution Aggregate, Runtime Engine, Execution Repository | **Frozen** |
| 10B | Lifecycle Manager | **Frozen** |
| 10C | Runtime State Model | **Frozen** |
| 10D | Pipeline Engine (Coordinator, Executor, Registry, Factory) | **Frozen** |

---

## Stub packages (Stage 2 — sin implementación)

Los siguientes paquetes permanecen en `0.0.0` (bootstrap):

`agent`, `context`, `context-planner`, `graph`, `memory`, `ontology`, `plugin`, `prompt`, `publisher`, `retrieval`, `search`, `validation`

---

## Version policy

- **Kernel v0.1 line:** contratos públicos congelados. Breaking changes requieren major version.
- **Runtime Sprint 10D, Workflow 10E, Planning 10F:** congelados. Cambios requieren ADR.
- **Knowledge capability:** semver independiente bajo `@atlas/knowledge`; integración transparente vía `@atlas/sdk@0.3.0`.
- **Atlas product semver:** gobernada por este archivo, `ATLAS_ARCHITECTURE_MASTER.md` y `releases/ATLAS-RELEASE-001-KERNEL_v0.1.md`.
