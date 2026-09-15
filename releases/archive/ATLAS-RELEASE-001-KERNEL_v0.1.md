---
id: ATLAS-RELEASE-001
title: Kernel v0.1.0-alpha
version: 1.1.0
status: Approved
phase: Release
category: Product
owner: Architecture Board
last_updated: 2026-07-18
related:
  - VERSION.md
  - RELEASE_READINESS_REPORT.md
---

# ATLAS Release 001

# Kernel v0.1.0-alpha

**Atlas Version:** `0.1.0-alpha` · **Kernel Version:** `0.1` · **Status:** Frozen  
**Version registry:** [`VERSION.md`](../VERSION.md)

---

# Purpose

This document officially declares the completion of the ATLAS Foundation Phase and freezes the first stable version of the ATLAS Kernel.

From this release onward, the Kernel becomes the stable execution platform upon which all future capabilities will be built.

This release does **not** represent a complete product.

It represents the first stable platform.

---

# Vision

Atlas is divided into two major stages.

## Stage 1

Platform

Responsible for:

- compilation
- execution
- runtime
- sdk
- cli

Status

Completed.

---

## Stage 2

Capabilities

Responsible for:

- knowledge
- memory
- retrieval
- workflow
- agents
- plugins
- publishers

Status

Not started.

---

# Kernel Composition

The official Kernel is composed of the following packages.

| Package | Version | Status | Responsibility |
|---------|---------|--------|----------------|
| @atlas/core | 0.1.1 | Stable | Fundamental primitives |
| @atlas/compiler | 0.1.1 | Stable | Knowledge compilation |
| @atlas/events | 0.1.0 | Stable | Domain events |
| @atlas/runtime | 0.1.0 | Stable | Artifact execution |
| @atlas/sdk | 0.2.0 | Stable | Public API facade |
| @atlas/cli | 0.1.0 | Stable | Human interface |

> Versiones verificadas contra `package.json` al 18/07/2026. La versión de producto Atlas es `0.1.0-alpha`; los paquetes npm mantienen semver independiente por componente.

---

# Supported Capabilities

Kernel v0.1 officially supports:

- Workspace loading
- Compilation
- Runtime execution
- Domain events
- SDK public API
- CLI
- Artifact generation
- Artifact execution

---

# Official User Flow

```text
Developer

↓

atlas doctor

↓

atlas compile

↓

Artifact

↓

atlas run

↓

Output
```

---

# Architectural State

The Kernel is considered:

Stable

Deterministic

Layered

Modular

Package boundaries validated

Dependency graph validated

Workspace validated

CLI validated

---

# Frozen Contracts

The following public APIs are frozen for the v0.1 line.

- @atlas/core
- @atlas/compiler
- @atlas/events
- @atlas/runtime
- @atlas/sdk
- @atlas/cli

Breaking changes require a major version.

---

# Out of Scope

The following components are intentionally excluded from Kernel v0.1.

- Knowledge Engine
- Memory Engine
- Retrieval Engine
- Workflow Engine
- Agent Engine
- Plugin System
- Publisher Engine
- Semantic Search
- Distributed Runtime
- Multi-Agent Execution

---

# Quality Gates

The following quality gates have been completed and verified against the repository state on **2026-07-18**.

## Specification gates

✓ Foundation  
✓ Domain  
✓ Architecture  
✓ SDK Specifications  

## Implementation gates

✓ Core  
✓ Compiler  
✓ Runtime  
✓ Events  
✓ SDK  
✓ CLI  
✓ Workspace (Milestone 1)  
✓ Integration Demo  

## CI pipeline (`.github/workflows/ci.yml`)

Verified locally on 2026-07-18:

| Step | Command | Status |
|------|---------|--------|
| Format | `pnpm format:check` | ✅ Pass |
| Lint | `pnpm lint` | ✅ Pass |
| Typecheck | `pnpm typecheck` | ✅ Pass |
| Build | `pnpm build` | ✅ Pass |
| Test | `pnpm test` | ✅ Pass |

Full sequence:

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm build && pnpm test
```

## Release readiness

✓ Release Sprint v0.1.0-alpha completed  
✓ Git history initialized  
✓ `README.md` and `VERSION.md` created  
✓ Readiness report: [`RELEASE_READINESS_REPORT.md`](./RELEASE_READINESS_REPORT.md)

---

# Milestones

Milestone 0

Architecture

Completed

Milestone 1

First Atlas Workspace

Completed

---

# Next Release

The next architectural phase begins with the implementation of the Knowledge Capability Layer.

No new Kernel components shall be introduced before completing the Product Release process.

---

# Product Decision

The Architecture Board declares the Kernel frozen.

Future work shall focus on capabilities instead of infrastructure.

---

Approved by

Architecture Board

Product Owner