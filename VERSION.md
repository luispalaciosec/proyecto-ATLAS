---
id: ATLAS-VERSION-001
title: Atlas Version Registry
version: 1.0.0
status: active
last_updated: 2026-07-18
---

# VERSION.md

## Official Atlas Version

| Field | Value |
|-------|-------|
| **Atlas Version** | `0.1.0-alpha` |
| **Kernel Version** | `0.1` |
| **Status** | **Frozen** |
| **Foundation Phase** | **Completed** |
| **Release document** | [`releases/ATLAS-RELEASE-001-KERNEL_v0.1.md`](./releases/ATLAS-RELEASE-001-KERNEL_v0.1.md) |
| **Internal RC tag** | `kernel-v0.1.0-alpha.1` (propuesto) |

---

## Kernel package versions

Versiones publicadas en `package.json` al cierre de la Fase Fundacional:

| Package | Version | Role |
|---------|---------|------|
| `@atlas/core` | 0.1.1 | Primitivas fundacionales |
| `@atlas/compiler` | 0.1.1 | Pipeline de compilación |
| `@atlas/events` | 0.1.0 | Eventos de dominio |
| `@atlas/runtime` | 0.1.0 | Ejecución de artifacts |
| `@atlas/sdk` | 0.2.0 | Fachada pública del Kernel |
| `@atlas/cli` | 0.1.0 | Interfaz de línea de comandos |

> **Nota de versionado:** La versión de producto Atlas es `0.1.0-alpha` (Kernel v0.1 congelado). Los paquetes npm mantienen semver independiente por componente; `@atlas/sdk` en `0.2.0` refleja la capa de facade completada en Sprint 4–5, no un release de producto distinto.

---

## Stub packages (Stage 2)

Los siguientes paquetes permanecen en `0.0.0` (bootstrap, sin implementación):

`agent`, `context`, `context-planner`, `graph`, `knowledge`, `memory`, `ontology`, `plugin`, `prompt`, `publisher`, `retrieval`, `search`, `validation`, `workflow`

---

## Version policy

- **Kernel v0.1 line:** contratos públicos congelados. Breaking changes requieren major version.
- **Stage 2 capabilities:** no iniciadas. Sin versiones publicadas.
- **Atlas product semver:** gobernada por este archivo y por `releases/ATLAS-RELEASE-001-KERNEL_v0.1.md`.
