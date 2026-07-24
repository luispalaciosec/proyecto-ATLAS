# ATLAS-MEMORY-CONTRACT-007-MEMORY_STORE

Version: 1.0
Status: Frozen
Owner: Memory
Source: ATLAS-MEMORY-008-PUBLIC_API.md §11

---

# Purpose

Define the abstraction representing a Memory Store.

A Memory Store groups Memory Records under a common persistence boundary.

It represents a logical repository, not a physical database.

The official interface is defined in **ATLAS-MEMORY-008-PUBLIC_API.md** §11.

---

# Responsibilities

The Memory Store SHALL:

- contain Memory Records
- expose put(), get(), remove(), and search()
- represent a logical container for memory operations

---

# Store Types

Supported logical stores MAY include:

- Persistent
- Volatile
- Cache
- Session
- Hybrid

A store may represent:

- episodic memory
- semantic memory
- procedural memory

without exposing implementation.

---

# Public Interface

```typescript
export interface MemoryStore {

    put()

    get()

    remove()

    search()

}
```

See ATLAS-MEMORY-008-PUBLIC_API.md §11 for the authoritative definition.

---

# Lifecycle

Store lifecycle:

- created
- active
- archived
- deleted

---

# Guarantees

A Memory Store SHALL:

- preserve identifiers
- preserve metadata
- preserve ownership
- preserve consistency

---

# Compatibility

The Memory Store SHALL integrate with:

- Memory Engine
- Storage Provider
- Index Provider
- Retrieval Provider
- Memory Session

It SHALL remain independent from Runtime,
Reasoning,
Pipeline,
Workflow.

---

END OF CONTRACT
