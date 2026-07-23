---
id: ATLAS-REASONING-CONTRACT-006
title: Request Validator Contract
version: 1.0.0
status: Draft
owner: Atlas Architecture Board
---

# Request Validator Contract

## Purpose

The Request Validator is responsible for validating every reasoning request before it reaches the Reasoning Engine.

Its objective is to guarantee that every reasoning execution starts from a valid, complete and deterministic request.

The validator never performs reasoning.

It only validates.

---

# Responsibilities

The Request Validator is responsible for:

- validating request structure

- validating mandatory fields

- validating supported versions

- validating reasoning goals

- validating metadata

- validating context integrity

The validator is never responsible for:

- reasoning

- planning

- workflow generation

- confidence evaluation

- trace generation

---

# Validator Identity

Every validator exposes an immutable identity.

Example

```
validator_id

validator_name

validator_version
```

Identity never changes during execution.

---

# Input

The validator receives one immutable object.

```
ReasoningRequest
```

The request is never modified.

---

# Output

The validator returns exactly one immutable object.

```
ValidationResult
```

The validator never transforms requests.

Transformation belongs to later stages.

---

# Validation Scope

The validator verifies:

- request identity

- request version

- request schema

- goal definition

- context availability

- metadata integrity

- supported options

Everything outside these responsibilities is ignored.

---

# Validation Rules

Typical validation rules include:

- required fields

- supported version

- non-empty goal

- valid identifiers

- immutable metadata

- supported execution mode

Rules are deterministic.

---

# Preconditions

Before validation:

- request must exist

- request must be immutable

- validator must be initialized

Missing prerequisites immediately terminate validation.

---

# Postconditions

After validation:

- request remains unchanged

- validation result becomes immutable

- no reasoning has been executed

- no state has been modified

---

# Validation Lifecycle

```
Receive Request

↓

Validate Structure

↓

Validate Metadata

↓

Validate Goal

↓

Validate Context

↓

Generate Validation Result

↓

Return
```

No reasoning occurs during this lifecycle.

---

# Determinism

Validation is deterministic.

Equal requests always generate identical validation results.

Random validation behavior is prohibited.

---

# Validation Categories

Validation may classify findings into:

- errors

- warnings

- informational messages

Only errors prevent reasoning execution.

# Error Handling

The Request Validator returns standardized validation errors.

Examples include:

- Missing Request

- Invalid Request Identifier

- Invalid Goal

- Unsupported Version

- Missing Context

- Invalid Metadata

- Validator Not Initialized

Errors never modify the request.

---

# Thread Safety

The validator supports concurrent validation.

Each request is validated independently.

Shared mutable state is prohibited.

---

# Immutability

Validation results are immutable.

Once produced:

- errors cannot change

- warnings cannot change

- validation status cannot change

Consumers receive read-only objects.

---

# Performance

Validation should optimize:

- schema verification

- required field validation

- metadata inspection

Performance optimizations must never affect validation results.

---

# Observability

The validator exposes:

- validation start

- validation completion

- validation duration

- validation status

- validator version

Observability data never changes validation behavior.

---

# Architecture Constraints

The Request Validator must never depend directly on:

- Runtime

- Workflow

- Planning

- Agent Runtime

- Confidence Provider

- Trace Provider

It depends only on Reasoning request contracts.

---

# Relationship with Reasoning Engine

The validator executes before the Reasoning Engine.

```
Reasoning Request

↓

Request Validator

↓

Reasoning Engine
```

Invalid requests never reach the engine.

---

# Relationship with Planning

Planning begins only after successful validation.

The validator never invokes planning.

---

# Relationship with Strategies

Strategy selection happens after validation.

The validator never selects strategies.

---

# Compatibility

Future validator implementations may include:

- schema validation

- policy validation

- domain validation

- plugin validators

Consumers remain independent from implementation details.

---

# Contract Diagram

```
Reasoning Request

↓

Request Validator

↓

Validation Result

↓

Reasoning Engine

↓

Reasoning Outcome
```

This contract defines only request validation.

---

# Design Principles

The Request Validator follows these principles:

- deterministic validation

- immutable requests

- immutable validation results

- fail fast

- implementation independence

- separation of concerns

These principles ensure that every reasoning execution starts from a verified and deterministic request.

---

End of Document.

