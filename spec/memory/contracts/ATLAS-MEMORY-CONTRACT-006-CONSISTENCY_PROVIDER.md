# ATLAS-MEMORY-CONTRACT-006-CONSISTENCY_PROVIDER

Version: 1.0
Status: Frozen
Owner: Memory
Source: ATLAS-MEMORY-007-CONSISTENCY.md

---

# Purpose

Define the contract responsible for maintaining Memory consistency.

This provider guarantees that every mutation performed over Memory
preserves structural integrity, indexing integrity and retrieval integrity.

It is NOT responsible for persistence.

It is NOT responsible for retrieval.

It is NOT responsible for indexing.

Its responsibility is validating and coordinating consistency rules.

---

# Responsibilities

The Consistency Provider SHALL:

- validate mutations
- validate references
- validate identifiers
- validate indexes after mutation
- validate storage references
- detect corrupted entries
- repair recoverable inconsistencies
- reject invalid operations

---

# It SHALL NOT

The provider SHALL NOT:

- execute searches
- generate embeddings
- store documents
- retrieve memories
- execute reasoning
- execute workflows

---

# Consistency Scope

The provider validates consistency for:

- MemoryRecord (see ATLAS-MEMORY-008 §12; canonical structure in ATLAS-MEMORY-004)
- MemoryStore
- Indexes
- References
- Sessions
- Metadata
- Relationships

---

# Consistency Levels

The implementation SHALL support:

- Strong Consistency
- Eventual Consistency

The implementation MAY support additional models.

---

# Validation Categories

Structural Validation

- duplicated ids
- invalid metadata
- invalid references

Logical Validation

- invalid parent
- invalid relationship
- orphan nodes

Storage Validation

- missing records
- duplicated records

Index Validation

- stale indexes
- orphan indexes

Session Validation

- invalid session state

---

# Repair

Recoverable inconsistencies MAY be repaired.

Non-recoverable inconsistencies SHALL return an error.


# Public Interface

```typescript
export interface ConsistencyProvider {

    validateRecord(
        record: MemoryRecord
    ): Promise<ValidationResult>;

    validateStore(): Promise<ValidationResult>;

    validateIndexes(): Promise<ValidationResult>;

    validateSessions(): Promise<ValidationResult>;

    repair(
        options?: RepairOptions
    ): Promise<RepairResult>;

}
```

---

# ValidationResult

```typescript
interface ValidationResult {

    valid: boolean;

    issues: ValidationIssue[];

}
```

---

# RepairResult

```typescript
interface RepairResult {

    repaired: number;

    skipped: number;

    failed: number;

}
```

---

# Errors

Possible errors include:

- InvalidEntry
- DuplicateIdentifier
- BrokenReference
- MissingIndex
- CorruptedRecord
- SessionCorrupted

---

# Guarantees

A successful validation guarantees:

- valid graph
- valid indexes
- valid identifiers
- valid metadata
- consistent references

---

# Compatibility

The Consistency Provider SHALL integrate with:

- Memory Engine
- Storage Provider
- Index Provider
- Retrieval Provider
- Memory Session
- Memory Store

It SHALL remain independent from Runtime,
Reasoning,
Workflow,
Pipeline,
Execution.

---

END OF CONTRACT