# ATLAS-MEMORY-CONTRACT-008-MEMORY_QUERY

Version: 1.0
Status: Frozen
Owner: Memory

---

# Purpose

Define the abstraction representing a Memory Query.

A Memory Query describes WHAT should be retrieved.

It never specifies HOW retrieval is executed.

Execution belongs exclusively to the Retrieval Provider.

---

# Responsibilities

A Memory Query SHALL define:

- query identifier
- filters
- constraints
- ordering
- pagination
- metadata

---

# Query Types

Supported query types MAY include:

- Exact
- Semantic
- Hybrid
- Metadata
- Session
- Graph

---

# Filters

Queries MAY filter by:

- tags
- type
- source
- author
- session
- timestamp
- metadata

---

# Ordering

Queries MAY request:

- relevance
- timestamp
- score
- custom ordering


# Public Interface

```typescript
export interface MemoryQuery {

    readonly identity: QueryIdentity;

    readonly filters: QueryFilters;

    readonly constraints: QueryConstraints;

}
```

---

# QueryIdentity

```typescript
interface QueryIdentity {

    query_id: string;

}
```

---

# QueryConstraints

```typescript
interface QueryConstraints {

    limit?: number;

    offset?: number;

    timeout_ms?: number;

}
```

---

# Guarantees

A Memory Query SHALL be:

- immutable
- deterministic
- serializable
- transportable

---

# Compatibility

Memory Query SHALL integrate with:

- Retrieval Provider
- Memory Engine
- Memory Store

It SHALL NOT depend on:

- Runtime
- Workflow
- Pipeline
- Reasoning
- Execution

---

END OF CONTRACT
