---
id: ATLAS-REASONING-004
title: Reasoning Strategies
version: 1.0.0
status: Draft
owner: Atlas Architecture Board
---

# ATLAS Reasoning Strategies

## Purpose

Reasoning Strategies define how the Reasoning Engine transforms evidence into decisions.

A strategy is a deterministic cognitive algorithm.

Strategies never execute workflows.

Strategies never create runtime state.

Strategies never access providers directly.

Their only responsibility is producing reasoning.

---

# Strategy Model

Every strategy implements the same contract.

```
Reasoning Request

↓

Reasoning Strategy

↓

Reasoning Result
```

Every implementation must remain deterministic.

---

# Strategy Selection

The Reasoning Engine selects a strategy according to:

- goal type

- context

- available evidence

- governance policies

- requested reasoning mode

The selection process is deterministic.

---

# Available Strategies

Version 1 defines the following strategies.

```
Reasoning Strategies

├── Sequential

├── Rule Based

├── Evidence Based

├── Graph

├── Comparative

├── Constraint

├── Composite
```

Future strategies may be added without modifying existing contracts.

---

# Sequential Strategy

Purpose

Evaluate information in ordered steps.

Suitable for:

- procedural reasoning

- linear analysis

- deterministic workflows

Execution

```
Evidence

↓

Step 1

↓

Step 2

↓

Step 3

↓

Conclusion
```

---

# Rule Based Strategy

Purpose

Apply explicit reasoning rules.

Suitable for:

- governance

- validation

- policy enforcement

Execution

```
Evidence

↓

Rule Evaluation

↓

Decision
```

Rules are immutable.

---

# Evidence Based Strategy

Purpose

Evaluate the strength of available evidence.

Suitable for:

- recommendation systems

- confidence evaluation

- decision support

Execution

```
Evidence

↓

Classification

↓

Ranking

↓

Decision
```

Only verified evidence influences conclusions.

---

# Graph Strategy

Purpose

Analyze relationships between entities.

Suitable for:

- dependency analysis

- semantic reasoning

- knowledge graphs

Execution

```
Evidence Graph

↓

Relationship Analysis

↓

Inference

↓

Decision
```

# Comparative Strategy

Purpose

Compare multiple alternatives.

Suitable for:

- option selection

- prioritization

- trade-off analysis

Execution

```
Alternative A

Alternative B

Alternative C

↓

Comparison Matrix

↓

Ranking

↓

Decision
```

Every comparison must expose explicit evaluation criteria.

---

# Constraint Strategy

Purpose

Produce decisions under constraints.

Examples of constraints:

- policies

- budgets

- permissions

- resources

Execution

```
Goal

+

Constraints

↓

Feasible Solutions

↓

Best Solution
```

Constraints are never ignored.

---

# Composite Strategy

Purpose

Combine multiple reasoning strategies.

Execution

```
Sequential

+

Evidence

+

Graph

↓

Merge Results

↓

Decision
```

Composite execution remains deterministic.

---

# Strategy Contract

Every strategy exposes:

- strategy identifier

- supported goal types

- supported context types

- execution method

- metadata

Strategies never expose provider-specific information.

---

# Strategy Lifecycle

Every strategy follows:

Requested

↓

Preparing

↓

Executing

↓

Evaluating

↓

Completed

or

Failed

The lifecycle is immutable.

---

# Strategy Outputs

Every strategy produces:

- conclusions

- assumptions

- supporting evidence

- confidence

- trace entries

The output format is identical for every strategy.

Only internal reasoning differs.

---

# Strategy Registration

Strategies are registered through the Strategy Registry.

The registry provides:

- registration

- lookup

- discovery

- validation

The Reasoning Engine never instantiates strategies directly.

---

# Future Strategies

Future versions may introduce:

- probabilistic reasoning

- symbolic reasoning

- causal reasoning

- Bayesian reasoning

- semantic reasoning

- temporal reasoning

- recursive reasoning

- multi-agent reasoning

These additions must remain compatible with the existing strategy contract.

---

# Architecture Constraints

Strategies must:

- remain deterministic

- remain immutable

- remain provider independent

- produce explainable decisions

- expose reasoning traces

No strategy may communicate directly with Runtime, Workflow, Pipeline or external providers.

---

End of Document.

