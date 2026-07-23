---
id: ATLAS-MEMORY-CONTRACT-002
title: Storage Provider Contract
layer: Memory
status: Frozen
version: 1.0.0
owner: Atlas Architecture Board
---

# ATLAS Memory Contract 002
# Storage Provider

---

# 1. Purpose

This document defines the canonical Storage Provider contract used by the ATLAS Memory Engine.

The Storage Provider is responsible only for persisting and retrieving Memory Records.

It never performs retrieval optimization.

It never performs indexing.

It never executes ranking.

It never owns orchestration.

---

# 2. Responsibilities

The Storage Provider is responsible for:

- storing records

- updating records

- deleting records

- loading records

- batch persistence

- snapshot persistence

- record existence checks

- metadata persistence

---

# 3. Out of Scope

The Storage Provider never performs:

- semantic search

- vector search

- ranking

- similarity scoring

- embedding generation

- planning

- reasoning

- execution

Those belong to other providers.

---

# 4. Position in Architecture

                Memory Engine
                     │
                     ▼
             Storage Provider
                     │
          Persistent Storage

The Storage Provider is always coordinated by the Memory Engine.

No component may access it directly.

---

# 5. Storage Principles

## Single Responsibility

The provider persists data.

Nothing else.

---

## Storage Agnostic

The contract does not assume:

SQL

NoSQL

File System

Cloud Storage

Object Storage

Vector DB

Any implementation is acceptable.

---

## Deterministic

Equal requests

must produce

equal storage behavior.

---

## Immutable Interface

Implementations change.

Contract remains stable.

---

# 6. Storage Operations

The provider supports:

Store

Update

Delete

Load

LoadBatch

Exists

Snapshot

Restore

Statistics

Health

Every operation returns canonical results.

---

# 7. Record Model

Every stored record contains:

Record ID

Namespace

Collection

Payload

Metadata

Version

Timestamp

Status

The provider never modifies record semantics.

---

# 8. Batch Operations

Batch operations are atomic whenever supported.

If atomicity is unavailable

the provider reports partial failures explicitly.

---

# 9. Version Handling

Records may contain versions.

The provider preserves versions exactly.

No automatic conflict resolution occurs.

---

# 10. Metadata Rules

Metadata is stored exactly as received.

The provider never derives metadata automatically.


# 11. Error Handling

Storage implementations normalize all failures.

Raw infrastructure errors never leave the provider.

Canonical Memory Errors are returned instead.

---

# 12. Concurrency

Concurrent writes must be handled safely.

Implementations define locking strategy.

The contract only guarantees consistency semantics.

---

# 13. Performance

Implementations should optimize:

batch writes

stream writes

lazy loading

bulk persistence

without changing observable behavior.

---

# 14. Health Checks

Every provider exposes health information including:

availability

latency

storage status

capacity (optional)

implementation version

---

# 15. Statistics

The provider may expose:

record count

collection count

namespace count

storage size

operation counters

Statistics never modify stored data.

---

# 16. Dependency Rules

The Storage Provider may depend on:

database drivers

filesystem APIs

cloud SDKs

object stores

storage adapters

It may never depend on:

Reasoning

Planning

Workflow

Runtime

Execution

Agent Runtime

---

# 17. Events

The provider itself does not publish platform events.

Only the Memory Engine publishes canonical events.

---

# 18. Testing Requirements

Every Storage Provider implementation must verify:

store

update

delete

exists

load

batch operations

snapshots

error normalization

health reporting

contract compliance

---

# 19. Compliance Requirements

A Storage Provider implementation is compliant only if:

✓ all operations follow this contract

✓ deterministic behavior is preserved

✓ metadata remains unchanged

✓ versions are preserved

✓ infrastructure errors are normalized

✓ no orchestration logic exists

✓ no retrieval logic exists

✓ no indexing logic exists

✓ no reasoning dependencies exist

✓ contract tests pass

---

# 20. Versioning

Semantic Versioning applies.

MAJOR

Breaking contract changes.

MINOR

New supported operations.

PATCH

Clarifications and documentation updates.

---

# 21. References

ATLAS-MEMORY-001-VISION

ATLAS-MEMORY-002-ARCHITECTURE

ATLAS-MEMORY-003-ENGINE

ATLAS-MEMORY-004-STORAGE_MODEL

ATLAS-MEMORY-007-CONSISTENCY

ATLAS-MEMORY-CONTRACT-001-MEMORY_ENGINE

ATLAS-MEMORY-CONTRACT-003-INDEX_PROVIDER

ATLAS-SHARED-CORE

---

END OF DOCUMENT

