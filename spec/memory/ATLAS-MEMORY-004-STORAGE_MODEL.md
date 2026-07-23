---
id: ATLAS-MEMORY-004
title: Storage Model
version: 1.0.0
status: Draft
owner: Atlas Architecture Board
---

# Storage Model

## Purpose

The Storage Model defines the canonical representation of every piece of information managed by the Memory domain.

It specifies:

- what can be stored

- how information is identified

- how information evolves

- how records relate to one another

- how persistence providers interpret Memory structures

The Storage Model is completely independent from storage technologies.

---

# Design Principles

The Storage Model follows several principles.

## Canonical Representation

Every memory item follows the same logical model.

Providers may serialize differently but never change semantics.

---

## Technology Independence

Storage definitions never reference:

- SQL

- NoSQL

- Filesystems

- Object Storage

- Vector Databases

- Graph Databases

Those belong to implementations.

---

## Immutable Identity

Every record owns one immutable identifier.

Identifiers never change.

---

## Mutable Content

Only record content may evolve.

Identity always remains stable.

---

# Storage Hierarchy

Memory information is organized hierarchically.

```
Namespace

↓

Collection

↓

Record

↓

Version
```

Each level owns different responsibilities.

---

# Namespace

A Namespace represents a logical memory domain.

Examples:

```
workspace

organization

user

project

system
```

Namespaces isolate information.

They never overlap.

---

# Namespace Properties

Each namespace contains:

```
namespace_id

namespace_type

owner

metadata

created_at
```

Namespace identifiers remain globally unique.

---

# Collection

Collections group related records.

Examples:

```
documents

profiles

sessions

knowledge

history

tasks
```

Collections define organizational boundaries.

---

# Collection Properties

Each collection contains:

```
collection_id

namespace_id

collection_type

metadata

created_at
```

Collections never contain nested collections.

---

# Record

A Record represents one logical Memory object.

Examples:

```
Conversation

Knowledge Item

User Profile

Preference

Fact

Observation

Decision
```

Records are immutable containers of identity.

---

# Record Structure

Every Record contains:

```
record_id

namespace_id

collection_id

record_type

status

metadata

current_version

created_at

updated_at
```

The Record does not directly contain historical content.

---

# Record Identity

Record identity is permanent.

```
record_id
```

must never change regardless of:

- updates

- versions

- archival

- restoration

---

# Record Status

Possible statuses include:

```
active

archived

deleted

locked

pending
```

Status represents operational state.

Not business meaning.

---

# Record Metadata

Metadata describes the record.

Examples:

```
creator

labels

source

priority

classification

language

visibility
```

Metadata remains extensible.

---

# Version

A Version stores one immutable snapshot of a Record.

```
Version 1

↓

Version 2

↓

Version 3
```

Older versions remain immutable.

---

# Version Structure

Each Version contains:

```
version_id

record_id

revision

content

checksum

created_at

author

metadata
```

Versions never overwrite previous versions.

---

# Version Numbering

Version numbers increase monotonically.

```
1

2

3

4
```

Skipped revisions are discouraged.

---

# Content

Content represents the actual stored information.

The Storage Model does not prescribe format.

Examples:

```
JSON

Markdown

Structured Objects

Binary References

Text
```

Providers serialize content according to implementation.

---

# Content Immutability

Once created:

```
Version.content
```

never changes.

New information always creates a new Version.

---

# Relationships

Records may reference other Records.

Relationship types include:

```
parent

child

reference

dependency

related

derived
```

Relationships never duplicate content.

---

# Relationship Structure

Each relationship contains:

```
relationship_id

source_record

target_record

relationship_type

metadata
```

Relationships remain independent objects.

# Ownership Model

Every Record has exactly one owner.

Ownership may represent:

- user

- workspace

- organization

- system

Ownership determines lifecycle responsibility.

---

# Visibility

Visibility controls accessibility.

Typical values include:

```
private

shared

public

restricted
```

Authorization mechanisms remain external to the Storage Model.

---

# Version Lifecycle

Each Version follows:

```
Created

↓

Stored

↓

Referenced

↓

Archived
```

Versions are never modified after creation.

---

# Record Lifecycle

A Record evolves independently from its Versions.

```
Created

↓

Active

↓

Updated

↓

Archived

↓

Deleted
```

Deletion policies remain implementation specific.

---

# Record Evolution

Updates never mutate existing versions.

Instead:

```
Record

↓

Create Version N+1

↓

Update current_version pointer
```

Historical versions remain preserved.

---

# Logical Storage

Logical storage represents conceptual organization.

Examples:

```
Namespace

Collection

Record

Version
```

Logical storage never depends on physical layout.

---

# Physical Storage

Physical storage is implementation specific.

Possible implementations include:

- relational databases

- document databases

- object stores

- distributed storage

The Storage Model remains identical across implementations.

---

# Serialization

Serialization converts logical objects into provider representations.

Rules:

- deterministic

- reversible

- lossless

Providers may choose any serialization format.

---

# Integrity

Storage integrity guarantees:

- unique identifiers

- valid references

- consistent ownership

- immutable versions

Integrity violations invalidate storage operations.

---

# Constraints

The Storage Model defines several constraints.

## Identity Constraint

Identifiers are globally unique.

---

## Namespace Constraint

Records belong to exactly one namespace.

---

## Collection Constraint

Records belong to exactly one collection.

---

## Version Constraint

Versions belong to exactly one Record.

---

## Ownership Constraint

Every Record has one owner.

---

## Immutability Constraint

Versions never change after creation.

---

## Relationship Constraint

Relationships only connect existing Records.

---

# Storage Transactions

Logical transactions include:

- create record

- create version

- archive record

- restore record

- delete record

Transaction implementation remains provider specific.

---

# Storage Consistency

Consistency guarantees include:

- valid ownership

- valid references

- monotonic revisions

- deterministic serialization

Consistency rules are enforced by the Memory Engine and Consistency Provider.

---

# Storage Extensions

Future versions may introduce:

- encrypted records

- distributed namespaces

- temporal storage

- partial replication

- storage federation

These extensions must preserve the canonical Storage Model.

---

# Integration

The Storage Model integrates with:

```
Memory Engine

↓

Storage Provider

↓

Retrieval Provider

↓

Index Provider
```

The model never communicates directly with Runtime or Reasoning.

---

# Public Model

The Storage Model represents the canonical data model shared across all Storage Providers.

Providers may optimize implementation details but must preserve:

- identity

- hierarchy

- immutability

- versioning

- ownership

- relationships

---

# Architectural Principles

The Storage Model is governed by the following principles:

- canonical representation

- immutable identity

- immutable versions

- mutable record evolution

- provider independence

- deterministic serialization

- technology neutrality

These principles ensure that Memory remains portable across implementations while preserving semantic consistency.

---

End of Document.

