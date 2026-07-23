---
id: ATLAS-MEMORY-008
title: Memory Public API
status: Draft
version: 1.0.0
owners:
  - Atlas Architecture Board
tags:
  - memory
  - api
  - sdk
  - contracts
---

# ATLAS-MEMORY-008 — Public API

---

# 1. Purpose

This document defines the complete public API exposed by:

```text
@atlas/memory
```

It specifies:

- exported interfaces
- factories
- repositories
- retrieval services
- indexing services
- storage services
- session API
- lifecycle API

This document defines the contract visible to every Atlas package.

---

# 2. Design Principles

The API must be:

- deterministic
- immutable
- storage-independent
- provider-independent
- thread-safe
- asynchronous
- composable

Memory never exposes internal persistence structures.

---

# 3. Package Entry Point

```
@atlas/memory
```

Only this package is imported by external consumers.

Internal folders remain private.

---

# 4. Public Interfaces

The package exposes:

- MemoryEngine
- MemoryRepository
- RetrievalEngine
- StorageEngine
- IndexingEngine
- MemorySession
- MemoryStore
- MemoryRecord
- MemorySnapshot

---

# 5. MemoryEngine

Responsible for the complete orchestration of memory.

```typescript
interface MemoryEngine {

    initialize()

    shutdown()

    createSession()

    closeSession()

    store()

    retrieve()

    search()

    delete()

    update()

    snapshot()

}
```

MemoryEngine is the primary entry point.

---

# 6. MemoryRepository

Responsible for persistence abstraction.

```typescript
interface MemoryRepository {

    save(record)

    load(id)

    update(record)

    remove(id)

    exists(id)

    list(query)

}
```

Repository never exposes implementation details.

---

# 7. RetrievalEngine

Responsible for querying memory.

```typescript
interface RetrievalEngine {

    retrieve(query)

    similarity(query)

    nearest(query)

    hybrid(query)

}
```

Retrieval is deterministic.

---

# 8. StorageEngine

Responsible for writing data.

```typescript
interface StorageEngine {

    write(record)

    overwrite(record)

    delete(id)

    flush()

}
```

Storage providers are replaceable.

---

# 9. IndexingEngine

Responsible for indexes.

```typescript
interface IndexingEngine {

    build()

    rebuild()

    update()

    remove()

    optimize()

}
```

Indexes remain hidden behind this interface.

---

# 10. MemorySession

Represents one isolated memory execution.

```typescript
interface MemorySession {

    id

    context

    metadata

    start()

    finish()

}
```

Every Runtime execution owns one MemorySession.

---

# 11. MemoryStore

Abstract logical container.

```typescript
interface MemoryStore {

    put()

    get()

    remove()

    search()

}
```

A store may represent:

- episodic memory
- semantic memory
- procedural memory

without exposing implementation.

---

# 12. MemoryRecord

Minimal immutable unit.

```typescript
interface MemoryRecord {

    id

    type

    content

    embedding?

    metadata

    timestamp

}
```

Records are immutable.

Updates create new versions.

---

# 13. MemorySnapshot

Represents a frozen state.

```typescript
interface MemorySnapshot {

    id

    created_at

    records

    checksum

}
```

Snapshots are read-only.

---

# 14. Factory Functions

The package exposes factories.

```typescript
createMemoryEngine()

createMemoryRepository()

createRetrievalEngine()

createStorageEngine()

createIndexingEngine()

createMemorySession()

createMemoryStore()
```

Factories return interfaces.

Never concrete implementations.

---

# 15. Public Types

The package exports:

- MemoryRecord
- MemorySnapshot
- MemoryQuery
- RetrievalResult
- SearchResult
- SimilarityResult
- MemoryMetadata
- MemoryStatistics

No internal models are exported.

---

# 16. Error Types

Public errors include:

- MemoryNotFoundError
- MemoryStorageError
- MemoryIndexError
- MemoryRetrievalError
- InvalidMemoryRecordError
- InvalidQueryError

Errors are deterministic.

---

# 17. Events

The package may publish:

- MemoryInitialized
- MemoryStored
- MemoryRetrieved
- MemoryUpdated
- MemoryDeleted
- MemoryIndexed
- MemorySnapshotCreated

Events are immutable.

---

# 18. Thread Safety

Implementations must guarantee:

- concurrent reads

- isolated writes

- deterministic retrieval

- atomic updates

---

# 19. Compatibility

The API is consumed by:

- Runtime
- Reasoning
- Planning
- Workflow
- Agents
- Intelligence
- SDK

None of these packages depend on internal storage.

---

# 20. Extension Points

Providers may implement:

- Vector databases
- SQL
- NoSQL
- Filesystem
- Redis
- Cloud storage

without modifying consumers.

---

# 21. Versioning

Breaking changes require:

- major version increment

- migration documentation

- compatibility report

---

# 22. Non Goals

This API does not define:

- storage implementation

- embedding providers

- retrieval algorithms

- vector database vendors

These belong to provider implementations.

---

# 23. Summary

This document defines the official public API of `@atlas/memory`.

All consumers interact exclusively through these interfaces.

No implementation details leak outside the package.

