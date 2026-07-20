---
id: ATLAS-VERSION-001
title: Atlas Version Registry
version: 1.1.0
status: active
last_updated: 2026-07-19
---

# VERSION.md

## Official Atlas Version

| Field | Value |
|-------|-------|
| **Atlas Version** | `0.1.0-alpha` |
| **Kernel Version** | `0.1` |
| **Kernel Status** | **Frozen** |
| **Foundation Phase** | **Completed** |
| **Repository Stabilization (Milestone 2)** | **Completed** |
| **Release document** | [`releases/ATLAS-RELEASE-001-KERNEL_v0.1.md`](./releases/ATLAS-RELEASE-001-KERNEL_v0.1.md) |
| **Internal RC tag** | `kernel-v0.1.0-alpha.1` (propuesto) |

---

## Kernel package versions

Versiones publicadas en `package.json` al cierre del Kernel y actualizaciones post-Foundation:

| Package | Version | Role |
|---------|---------|------|
| `@atlas/core` | 0.1.1 | Primitivas fundacionales |
| `@atlas/compiler` | 0.1.1 | Pipeline de compilación |
| `@atlas/events` | 0.1.0 | Eventos de dominio |
| `@atlas/runtime` | 0.1.0 | Ejecución de artifacts |
| `@atlas/sdk` | 0.3.0 | Fachada pública del Kernel (+ integración Knowledge, Sprint 9) |
| `@atlas/cli` | 0.1.0 | Interfaz de línea de comandos |

> **Nota de versionado:** La versión de producto Atlas es `0.1.0-alpha` (Kernel v0.1 congelado). Los paquetes npm mantienen semver independiente por componente.

---

## Capability package versions

| Package | Version | Role |
|---------|---------|------|
| `@atlas/knowledge` | 0.2.0 | Knowledge Capability — metamodel, domain core, projection adapter (Sprint 8–9) |

---

## Stub packages (Stage 2 — sin implementación)

Los siguientes paquetes permanecen en `0.0.0` (bootstrap):

`agent`, `context`, `context-planner`, `graph`, `memory`, `ontology`, `plugin`, `prompt`, `publisher`, `retrieval`, `search`, `validation`, `workflow`

---

## Version policy

- **Kernel v0.1 line:** contratos públicos congelados. Breaking changes requieren major version.
- **Knowledge capability:** semver independiente bajo `@atlas/knowledge`; integración transparente vía `@atlas/sdk@0.3.0`.
- **Atlas product semver:** gobernada por este archivo y por `releases/ATLAS-RELEASE-001-KERNEL_v0.1.md`.
