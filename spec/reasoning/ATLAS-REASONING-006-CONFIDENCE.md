---
id: ATLAS-REASONING-006
title: Confidence Model
version: 1.0.0
status: Draft
owner: Atlas Architecture Board
---

# ATLAS Confidence Model

## Purpose

The Confidence Model defines how ATLAS evaluates the reliability of every reasoning result.

Confidence is an objective property of the reasoning process.

It is not the confidence of an AI provider.

It is not a probability estimate.

It is the measurable confidence of the reasoning performed by the Reasoning Engine.

---

# Principles

The Confidence Model follows six principles.

## Deterministic

The same reasoning produces the same confidence.

---

## Explainable

Every confidence value can be explained.

---

## Reproducible

Confidence calculations can always be reconstructed.

---

## Immutable

Confidence never changes after the reasoning session is completed.

---

## Provider Independent

Confidence never depends on:

- OpenAI

- Claude

- Gemini

- Ollama

- DeepSeek

It depends only on reasoning quality.

---

## Observable

Every confidence calculation is traceable.

---

# Confidence Scale

Confidence is normalized.

```
0.0

↓

1.0
```

Recommended interpretation:

| Range | Interpretation |
|--------|----------------|
| 0.90 – 1.00 | Very High |
| 0.75 – 0.89 | High |
| 0.50 – 0.74 | Medium |
| 0.25 – 0.49 | Low |
| 0.00 – 0.24 | Very Low |

Applications may define visualization rules without modifying this model.

---

# Confidence Factors

Confidence is calculated from multiple dimensions.

Primary factors include:

- Evidence Quality

- Evidence Quantity

- Assumption Weight

- Strategy Consistency

- Context Completeness

- Policy Compliance

- Internal Consistency

No single factor determines the final confidence.

---

# Evidence Quality

Evidence quality measures the reliability of supporting information.

Factors include:

- trusted origin

- freshness

- completeness

- consistency

Higher-quality evidence increases confidence.

---

# Evidence Quantity

The model evaluates the amount of useful evidence.

Large quantities of weak evidence do not necessarily increase confidence.

Quality has priority over quantity.

---

# Assumption Weight

Generated assumptions reduce confidence.

Each assumption contributes according to:

- uncertainty

- impact

- dependency

Explicit assumptions always produce a measurable effect.

---

# Strategy Consistency

Every reasoning strategy reports its internal consistency.

Examples:

- rule coverage

- graph completeness

- comparison quality

- constraint satisfaction

Consistency contributes positively to confidence.

# Context Completeness

The model evaluates whether the available context is sufficient.

Examples include:

- missing variables

- incomplete inputs

- unavailable references

Incomplete context decreases confidence.

---

# Policy Compliance

Reasoning is evaluated against active governance policies.

Policy violations reduce confidence.

Fully compliant reasoning contributes positively.

---

# Internal Consistency

The Reasoning Engine verifies that conclusions are internally coherent.

Checks may include:

- contradiction detection

- logical consistency

- dependency validation

Internal inconsistencies lower confidence.

---

# Confidence Calculation

The exact calculation algorithm is implementation specific.

However, every implementation must satisfy:

- determinism

- reproducibility

- explainability

The algorithm must expose all contributing factors.

No hidden weighting is permitted.

---

# Confidence Output

Every Reasoning Result includes:

- confidence value

- confidence level

- contributing factors

- calculation metadata

Applications should never receive only a numeric score.

Confidence must remain interpretable.

---

# Confidence Trace

Every confidence calculation is recorded in the Reasoning Trace.

Recorded information includes:

- evaluated factors

- intermediate values

- final score

- timestamps

This enables complete auditing.

---

# Relationship with Other Domains

Confidence interacts with the architecture as follows.

```
Evidence

↓

Reasoning

↓

Confidence

↓

Reasoning Result

↓

Planning
```

Planning consumes the confidence but never modifies it.

Runtime receives the confidence only as informational metadata.

---

# Future Evolution

Future versions may introduce:

- Bayesian confidence models

- probabilistic confidence estimators

- confidence decay

- confidence aggregation

- adaptive confidence policies

These extensions must preserve backward compatibility.

---

# Architecture Constraints

The Confidence Model must:

- remain deterministic

- remain immutable

- remain explainable

- remain provider independent

- expose every contributing factor

No implementation may generate confidence values without exposing how they were derived.

---

End of Document.