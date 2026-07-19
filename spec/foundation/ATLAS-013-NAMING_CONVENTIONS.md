---
id: ATLAS-013
title: Naming Conventions
version: 1.0.0
status: approved
owner: Atlas Architecture Board
created: 2026-07-19
updated: 2026-07-19
depends_on:
  - ATLAS-002-CONSTITUTION
  - ATLAS-012-REPOSITORY_GOVERNANCE
---

# Naming Conventions

---

# 1. Purpose

This document defines the official naming conventions for every artifact within Atlas.

Consistency is considered an architectural requirement.

Naming is not a stylistic preference.

It directly affects:

- discoverability
- navigation
- maintainability
- tooling
- automation
- AI-assisted development

All contributors and automated agents must follow these conventions.

---

# 2. Guiding Principles

Atlas naming follows five principles.

## 2.1 Consistency

The same concept must always use the same name.

Never introduce synonyms.

Example:

KnowledgeObject

Never:

KnowledgeEntity

KnowledgeNode

KnowledgeItem

unless they represent different domain concepts.

---

## 2.2 Explicitness

Names should describe intent.

Avoid abbreviations.

Good:

KnowledgeRelationship

Bad:

KR

---

## 2.3 Stability

Identifiers are permanent.

File names may evolve.

Identifiers never change.

Example:

ATLAS-001

remains forever.

The filename may evolve.

---

## 2.4 Determinism

The same input should always generate the same name.

No random naming.

No timestamps inside identifiers.

---

## 2.5 Human Readability

Names should be understandable without documentation.

---

# 3. Language

The official language of Atlas is English.

Specifications

Code

Directories

Classes

Interfaces

Packages

Variables

Documentation

All use English.

Exception:

Historical records.

Legal documents.

Third-party resources.

---

# 4. Repository Directories

Top-level directories use:

lowercase

plural when applicable

Examples:

packages/

examples/

plugins/

workspaces/

scripts/

tools/

templates/

assets/

docs/

spec/

releases/

Never:

Packages/

Plugin/

Workspace/

Release/

---

# 5. Package Names

All packages follow:

@atlas/<package>

Examples:

@atlas/core

@atlas/compiler

@atlas/runtime

@atlas/events

@atlas/sdk

Capabilities:

@atlas/knowledge

@atlas/memory

@atlas/retrieval

Never:

AtlasCore

atlas_core

atlas-core-sdk

---

# 6. Directory Naming

Directories use:

lowercase

hyphen-separated

Examples:

compiler-adapter

knowledge-store

runtime-engine

Never:

CompilerAdapter

knowledge_store

RuntimeEngine

---

# 7. Files

Markdown

UPPERCASE prefix

Examples:

ATLAS-001-CONSTITUTION.md

ATLAS-013-NAMING_CONVENTIONS.md

Knowledge specifications:

KNOWLEDGE-001-INTRODUCTION.md

---

Source files

lowercase

hyphen-separated

Examples:

compiler-stage.ts

knowledge-object.ts

runtime-engine.ts

Never:

CompilerStage.ts

KnowledgeObject.ts

knowledge_object.ts

---

# 8. Classes

PascalCase

Examples:

KnowledgeObject

KnowledgeRelationship

AtlasCompiler

AtlasRuntime

KnowledgeProjectionAdapter

---

# 9. Interfaces

PascalCase.

Do not prefix with I.

Correct:

CompilerStage

KnowledgeStore

Incorrect:

ICompilerStage

IKnowledgeStore

---

# 10. Functions

camelCase

Examples:

createKnowledgeObject

compileWorkspace

projectKnowledge

loadWorkspace

Never:

CreateKnowledgeObject()

compile_workspace()

---

# 11. TypeScript Types

Type aliases use PascalCase.

Examples:

CompilationResult

KnowledgeIdentifier

RuntimeStatus

Never:

compilationResult

COMPILATION_RESULT

---

# 12. Enums

Enums use PascalCase.

Members use PascalCase.

Example:

enum RuntimeLifecycle {

    Created,

    Initialized,

    Running,

    Completed,

    Failed

}

---

# 13. Constants

Compile-time constants use:

UPPER_SNAKE_CASE

Examples:

DEFAULT_TIMEOUT

MAX_COMPILATION_UNITS

SDK_VERSION

Reserved identifiers:

ATLAS_VERSION

SCHEMA_VERSION

API_VERSION

---

# 14. Events

Events follow:

<bounded-context>.<event>

Examples:

compiler.completed

compiler.failed

runtime.started

runtime.completed

knowledge.projected

Future evolution may introduce:

atlas.compiler.completed

atlas.runtime.started

without changing the semantic convention.

---

# 15. Error Codes

Every Atlas error has:

DOMAIN-CATEGORY-NUMBER

Examples:

CORE-VALIDATION-001

COMPILER-PIPELINE-004

KNOWLEDGE-PROJECTION-002

RUNTIME-EXECUTION-003

Characteristics:

Globally unique

Never reused

Never renumbered

Permanent

---

# 16. Specification Identifiers

Every specification receives a permanent identifier.

Examples:

ATLAS-001

ATLAS-013

KNOWLEDGE-001

SDK-202

ARCH-003

Identifiers are immutable.

Document titles may evolve.

Identifiers never change.

---

# 17. Versioning

Atlas follows Semantic Versioning.

MAJOR.MINOR.PATCH

Examples:

1.0.0

2.1.4

0.3.0

Rules:

MAJOR

Breaking architectural changes

MINOR

Backward-compatible features

PATCH

Corrections

Documentation updates that do not affect architecture may remain PATCH.

---

# 18. Release Tags

Git tags follow:

kernel-vX.Y.Z

Examples:

kernel-v0.1.0-alpha.1

kernel-v0.1.0-beta.1

kernel-v1.0.0

Capability packages may additionally use:

knowledge-v1.0.0

memory-v1.0.0

Only after becoming independently releasable.

---

# 19. Git Branches

Permanent branches:

main

release

Temporary branches:

feature/<name>

bugfix/<name>

hotfix/<name>

refactor/<name>

experiment/<name>

Examples:

feature/runtime-engine

bugfix/compiler-validation

refactor/repository-structure

---

# 20. Commit Messages

Atlas follows Conventional Commits.

Examples:

feat(runtime): add execution lifecycle

fix(compiler): preserve diagnostics ordering

docs(knowledge): update graph model

refactor(core): simplify value objects

test(events): improve event bus coverage

chore(release): prepare kernel alpha

---

# 21. Workspace Names

Workspace identifiers use:

lowercase

hyphen-separated

Examples:

marketing-workspace

church-production

personal-kb

Never:

MarketingWorkspace

Workspace1

MyWorkspace

---

# 22. Plugin Names

Plugin packages follow:

@atlas/plugin-<name>

Examples:

@atlas/plugin-openai

@atlas/plugin-notion

@atlas/plugin-slack

Directories:

plugin-openai

plugin-notion

---

# 23. Configuration Files

Configuration files use:

lowercase

Examples:

atlas.config.json

atlas.workspace.json

atlas.settings.json

atlas.lock.json

Never:

AtlasConfig.json

workspace.JSON

---

# 24. Reserved Names

The following names are reserved by the platform:

Atlas

Kernel

Compiler

Runtime

SDK

Knowledge

Memory

Workflow

Retrieval

Events

Core

CLI

Engine

These names must not be reused for unrelated concepts.

---

# 25. Naming Evolution

Existing names may evolve only when:

the architecture changes

a migration strategy exists

backward compatibility is documented

all references are updated

Renaming for stylistic reasons alone is discouraged.

---

# 26. Governance

This document has constitutional authority over every identifier inside Atlas.

All future packages, specifications, plugins, workspaces, capabilities, APIs and documentation must comply with these conventions.

Automated agents (Cursor, Claude Code, Codex, etc.) are expected to follow this document as a mandatory constraint.

---

# 27. Final Statement

Naming is part of the Atlas architecture.

A consistent naming system enables deterministic navigation, automated tooling, long-term maintainability and reliable collaboration between humans and intelligent agents.

Every new artifact introduced into Atlas shall follow these conventions unless an explicit architectural exception has been approved and documented.