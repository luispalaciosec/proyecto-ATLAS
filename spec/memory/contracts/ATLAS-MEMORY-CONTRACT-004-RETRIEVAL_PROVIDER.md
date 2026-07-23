---
id: ATLAS-MEMORY-CONTRACT-004
title: Retrieval Provider Contract
layer: Memory
status: Frozen
version: 1.0.0
owner: Atlas Architecture Board
---

# ATLAS Memory Contract 004
# Retrieval Provider

---

# 1. Purpose

This document defines the canonical Retrieval Provider contract used by the ATLAS Memory Engine.

The Retrieval Provider is responsible for locating Memory Records that satisfy retrieval requests.

It never owns persistence.

It never owns indexing.

It never executes reasoning.

It never orchestrates execution.

---

# 2. Responsibilities

The Retrieval Provider is responsible for:

- retrieving records

- filtering records

- ranking candidate records

- combining retrieval strategies

- returning deterministic retrieval results

---

# 3. Out of Scope

The Retrieval Provider never performs:

- persistence

- indexing

- embedding generation

- planning

- reasoning

- workflow execution

- runtime orchestration

---

# 4. Architecture Position

                Memory Engine
                     │
                     ▼
           Retrieval Provider
                     │
        Storage + Index Providers

The Retrieval Provider coordinates retrieval over Storage and Index Providers.

It never bypasses the Memory Engine.

---

# 5. Retrieval Principles

## Deterministic

Equal requests produce equal retrieval results.

---

## Stateless

The provider does not maintain execution state.

---

## Provider Independent

Retrieval logic remains independent of storage implementation.

---

## Read Only

Retrieval never mutates Memory Records.

---

# 6. Retrieval Operations

Supported operations include:

Retrieve

RetrieveById

RetrieveBatch

RetrieveByNamespace

RetrieveByCollection

RetrieveByMetadata

RetrieveBySimilarity

RetrieveTopK

All operations return canonical retrieval results.

---

# 7. Retrieval Request

Every request contains:

Request Identifier

Namespace

Collection

Filters

Query

Options

Limit

Metadata

The provider never modifies the request.

---

# 8. Retrieval Result

Every result contains:

Retrieved Records

Scores (optional)

Retrieval Metadata

Execution Statistics

Timestamp

Errors (when applicable)

---

# 9. Ranking

Ranking may be based on:

metadata

semantic similarity

vector similarity

hybrid strategies

implementation-specific heuristics

The contract does not prescribe ranking algorithms.

---

# 10. Filtering

Filtering occurs before ranking whenever possible.

Supported filters may include:

namespace

collection

record status

metadata

custom implementation filters

# 11. Similarity Search

Similarity search is optional.

Implementations may support:

vector similarity

semantic similarity

keyword similarity

hybrid retrieval

The contract remains implementation independent.

---

# 12. Error Handling

Infrastructure failures are normalized into canonical Memory Errors.

Retrieval implementations never expose backend-specific exceptions.

---

# 13. Performance

Providers may optimize:

caching

parallel retrieval

hybrid retrieval

batch retrieval

stream retrieval

without changing observable behavior.

---

# 14. Health Reporting

Every provider exposes:

availability

latency

retrieval statistics

implementation version

backend status

---

# 15. Statistics

Providers may expose:

queries executed

average latency

cache hit ratio

records scanned

records returned

Statistics never modify retrieval behavior.

---

# 16. Dependency Rules

The Retrieval Provider may depend on:

Storage Provider

Index Provider

vector databases

search engines

retrieval adapters

It may never depend on:

Planning

Reasoning

Runtime

Execution

Workflow

Agent Runtime

---

# 17. Events

The Retrieval Provider never publishes platform events directly.

Only the Memory Engine emits canonical retrieval events.

---

# 18. Testing Requirements

Every Retrieval Provider implementation must verify:

record retrieval

batch retrieval

metadata filtering

ranking

similarity search

error normalization

statistics

health reporting

contract compliance

---

# 19. Compliance Requirements

A Retrieval Provider implementation is compliant only if:

✓ retrieval is deterministic

✓ retrieval is read-only

✓ ranking is consistent

✓ canonical errors are returned

✓ provider remains storage independent

✓ no orchestration logic exists

✓ no reasoning logic exists

✓ no persistence logic exists

✓ health reporting functions correctly

✓ contract tests pass

---

# 20. Versioning

Semantic Versioning applies.

MAJOR

Breaking contract changes.

MINOR

New retrieval capabilities.

PATCH

Documentation and clarification updates.

---

# 21. References

ATLAS-MEMORY-001-VISION

ATLAS-MEMORY-002-ARCHITECTURE

ATLAS-MEMORY-003-ENGINE

ATLAS-MEMORY-005-RETRIEVAL

ATLAS-MEMORY-006-INDEXING

ATLAS-MEMORY-CONTRACT-001-MEMORY_ENGINE

ATLAS-MEMORY-CONTRACT-002-STORAGE_PROVIDER

ATLAS-MEMORY-CONTRACT-003-INDEX_PROVIDER

ATLAS-SHARED-CORE

---

END OF DOCUMENT

