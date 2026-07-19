---
id: ATLAS-012
title: Repository Governance
version: 1.0.0
status: approved
owner: Atlas Architecture Board
created: 2026-07-19
updated: 2026-07-19
depends_on:
  - ATLAS-002-CONSTITUTION
  - ATLAS-003-PRINCIPLES
  - ATLAS-010-PLATFORM_MAPPING
---

# Repository Governance

---

# 1. Purpose

This document defines the permanent governance rules of the ATLAS repository.

Its objective is to guarantee that the repository remains understandable, scalable and maintainable regardless of:

- number of packages
- number of contributors
- number of capabilities
- number of documents
- number of workspaces
- project lifetime

This document has constitutional authority over the repository organization.

No folder may be created unless it complies with this governance.

---

# 2. Guiding Principle

The repository is organized by **responsibility**, never by convenience.

Each directory must answer exactly one question.

Examples:

spec/
→ Where does Atlas define itself?

packages/
→ Where is Atlas implemented?

docs/
→ How do humans learn Atlas?

workspaces/
→ What real Atlas projects exist?

examples/
→ How is Atlas used?

releases/
→ What has been delivered?

No directory may have multiple responsibilities.

---

# 3. Repository Layers

Atlas is divided into independent architectural layers.

Layer 1

Specifications

Defines WHAT Atlas is.

Contains only normative documents.

No executable code.

Layer 2

Implementation

Contains executable source code.

No architectural specifications.

Layer 3

Documentation

Human-oriented documentation.

Tutorials.

Guides.

Examples.

Layer 4

Operations

Everything related to project evolution.

Releases.

Reports.

Migration logs.

Planning.

Layer 5

Assets

Reusable project resources.

Templates.

Images.

Scripts.

---

# 4. Repository Root

The repository root must remain intentionally small.

Only global project artifacts may exist at the root.

Allowed:

README.md

LICENSE

VERSION.md

CHANGELOG.md

package.json

pnpm-workspace.yaml

turbo.json

tsconfig.json

.gitignore

.github/

spec/

packages/

docs/

examples/

workspaces/

releases/

templates/

tools/

scripts/

plugins/

assets/

No additional directories may be created at root without updating this governance document.

---

# 5. Specifications

All architectural specifications belong under:

spec/

The specification tree represents the official source of truth for Atlas.

Specifications never contain executable code.

Specifications are immutable historical records.

Typical structure:

spec/

foundation/

architecture/

domain/

knowledge/

capabilities/

interfaces/

product/

organization/

Every specification must have:

identifier

version

owner

status

dependencies

history

---

# 6. Packages

packages/

contains executable implementation only.

Every package must be independently buildable.

Every package owns:

README.md

CHANGELOG.md

package.json

src/

tests/

No package may contain architectural specifications.

Package documentation must describe implementation only.

---

# 7. Documentation

docs/

contains documentation for humans.

Examples:

installation

tutorials

guides

reference

faq

architecture overviews

No normative specifications belong here.

If changing a document modifies Atlas behavior, that document belongs under spec/.

---

# 8. Examples

examples/

contains demonstrations.

Examples are disposable.

Deleting an example must never affect the platform.

Examples may depend on packages.

Packages must never depend on examples.

---

# 9. Workspaces

workspaces/

contains real Atlas projects.

Each workspace represents a complete Atlas environment.

A workspace may contain:

knowledge

configuration

assets

examples

domain content

A workspace never contains platform implementation.

---

# 10. Releases

releases/

contains project evolution.

Examples:

Release Notes

Implementation Reports

Migration Reports

Sprint Reports

Audit Reports

Release Checklists

Nothing inside releases defines Atlas.

It only documents its evolution.

---

# 11. Assets

assets/

contains non-executable reusable resources shared across Atlas.

Examples:

logos

icons

diagrams

illustrations

fonts

media

No source code may exist inside assets/.

---

# 12. Templates

templates/

contains reusable templates.

Examples:

workspace templates

plugin templates

document templates

configuration templates

generator templates

Templates are blueprints.

They are never considered runtime artifacts.

---

# 13. Scripts

scripts/

contains automation scripts used during development.

Examples:

bootstrap

release

migration

validation

maintenance

Scripts may automate Atlas but are never part of the Atlas runtime.

---

# 14. Tools

tools/

contains utilities used to build, validate or maintain Atlas.

Examples:

code generators

documentation generators

schema validators

development tooling

Tools may be executed by developers or CI pipelines.

They are not distributed as part of the platform.

---

# 15. Plugins

plugins/

contains external extensions that expand Atlas without modifying the Kernel.

Plugins must depend on public APIs only.

The Kernel must never depend on plugins.

Dependency direction:

Plugins
↓

SDK

↓

Kernel

Never the opposite.

---

# 16. Dependency Rules

The repository follows strict dependency direction.

Allowed:

Specifications

↓

Implementation

↓

Documentation

Forbidden:

Implementation depending on Documentation

Implementation depending on Releases

Specifications depending on Packages

Packages depending on Examples

Packages depending on Workspaces

Plugins modifying Kernel internals

Violations of dependency direction are architectural defects.

---

# 17. Directory Creation Policy

Creating a new top-level directory requires:

Architectural justification

Governance review

Documentation update

Approval from the Architecture Board

Top-level directories are considered part of the platform architecture.

They are not created for temporary convenience.

---

# 18. Package Creation Policy

A new package may only be created when:

it owns a bounded responsibility

it exposes a stable public API

it can evolve independently

it cannot reasonably belong to an existing package

Packages must not be created merely to reduce file size.

---

# 19. Documentation Classification

Every document must belong to exactly one category.

Categories include:

Specification

Reference

Tutorial

Guide

Proposal (RFC)

Decision (ADR)

Release Report

Sprint Report

Migration Report

Implementation Plan

No document may belong to multiple categories simultaneously.

---

# 20. Repository Evolution

Repository evolution follows three phases.

Phase 1

Architectural Design

New ideas.

RFC.

Research.

No implementation.

Phase 2

Implementation

Approved specifications become executable code.

Phase 3

Operations

Release.

Maintenance.

Migration.

Audit.

Every change must clearly identify its phase.

---

# 21. Migration Policy

Repository reorganizations must preserve:

Git history

Specification identifiers

Document versions

Package identities

Public APIs

Internal links

Migration reports are mandatory for structural changes.

---

# 22. Repository Health

The repository should always satisfy the following properties:

Single source of truth

No duplicated specifications

No orphan documents

No circular dependencies

Deterministic structure

Predictable navigation

Every directory has exactly one responsibility

Every artifact has one canonical location

---

# 23. Governance Authority

This document is part of the constitutional layer of Atlas.

Changes require:

Architecture review

Repository impact analysis

Migration strategy (if applicable)

Version increment

Approval from the Architecture Board

Repository governance is intentionally conservative.

Stability has priority over convenience.

---

# 24. Success Criteria

A repository governed by this document shall exhibit:

Clear separation between specification and implementation.

Deterministic organization.

Scalable growth to hundreds of packages.

Minimal architectural debt.

Fast onboarding of contributors.

Long-term maintainability.

Consistent navigation.

Compatibility with automated agents.

Support for future capabilities without structural redesign.

---

# 25. Final Statement

The Atlas repository is not merely a code repository.

It is the canonical knowledge system that preserves the architecture, implementation and evolution of the platform.

Every directory exists to serve a single responsibility.

Every document has a defined place.

Every package has a defined boundary.

Repository organization is considered part of the Atlas architecture itself.

Therefore, changes to the repository structure are architectural decisions, not operational ones.