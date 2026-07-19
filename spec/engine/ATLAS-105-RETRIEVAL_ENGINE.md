---
id: ATLAS-105
title: Atlas Retrieval Engine
version: 1.0.0
status: draft
owner: Atlas Core Team
classification: public
foundation_version: 1.0
engine_version: 1.0
created: 2026-07-13
last_updated: 2026-07-13
purpose: >
  Definir el Retrieval Engine, el componente responsable de seleccionar,
  priorizar, justificar y preparar la información que será utilizada para
  construir el Context Package del Atlas Engine.
---

# ATLAS-105 — Retrieval Engine

> "Buscar descubre posibilidades. Recuperar selecciona evidencia."

---

# 1. Purpose

El Retrieval Engine constituye el componente responsable de transformar un conjunto de candidatos en un conjunto de evidencia validada.

Su propósito consiste en seleccionar únicamente la información que maximiza el valor del contexto respetando políticas, prioridades y restricciones definidas por Atlas.

---

# 2. Responsibilities

El Retrieval Engine SHALL:

- recibir Search Results.
- consultar Knowledge Packages.
- consultar Memory Packages.
- aplicar políticas de recuperación.
- eliminar información irrelevante.
- resolver conflictos.
- priorizar evidencia.
- construir un Retrieval Package.
- justificar todas las selecciones.

El Retrieval Engine SHALL NOT:

- ejecutar búsquedas.
- interpretar lenguaje natural.
- construir prompts.
- ejecutar agentes.
- modificar conocimiento.

---

# 3. Design Principles

## Evidence First

Toda información recuperada constituye evidencia.

Nunca una suposición.

---

## Explainable Retrieval

Cada elemento recuperado deberá responder:

- ¿Por qué fue seleccionado?
- ¿Cuál fue su origen?
- ¿Qué política lo eligió?
- ¿Qué nivel de confianza posee?

---

## Minimal Context

Recuperar menos información de mayor calidad produce mejores resultados que recuperar grandes cantidades de información irrelevante.

---

## Policy Driven

Toda decisión de recuperación deberá obedecer políticas explícitas.

Nunca heurísticas ocultas.

---

## Deterministic Retrieval

Ante las mismas entradas y políticas, el Retrieval Engine deberá producir el mismo resultado.

---

# 4. Retrieval Lifecycle

```text
Search Result

↓

Candidate Analysis

↓

Knowledge Resolution

↓

Memory Resolution

↓

Ranking

↓

Filtering

↓

Conflict Resolution

↓

Budget Optimization

↓

Retrieval Package
```

Todo proceso de recuperación seguirá este ciclo.

---

# 5. Internal Architecture

```text
Retrieval Engine

│

├── Candidate Analyzer

├── Evidence Collector

├── Ranking Engine

├── Policy Evaluator

├── Conflict Resolver

├── Budget Optimizer

└── Retrieval Resolver
```

Cada componente posee una responsabilidad única.

---

# 6. Core Components

## Candidate Analyzer

Analiza los candidatos provenientes del Search Engine.

---

## Evidence Collector

Obtiene información del Knowledge Engine y del Memory Engine.

---

## Ranking Engine

Ordena la evidencia según criterios definidos.

---

## Policy Evaluator

Aplica reglas organizacionales y restricciones de recuperación.

---

## Conflict Resolver

Resuelve inconsistencias entre múltiples fuentes.

---

## Budget Optimizer

Optimiza el contenido recuperado respetando el presupuesto de contexto.

---

## Retrieval Resolver

Entrega el Retrieval Package al Context Engine.

---

# 7. Retrieval Request

El Retrieval Engine recibe el siguiente contrato.

```yaml
retrieval_request:

context_plan:

search_result:

knowledge_package:

memory_package:

policies:

context_budget:

metadata:
```

---

# 8. Retrieval Package

El resultado oficial del Retrieval Engine es:

```text
RetrievalPackage
```

Canonical Structure

```yaml
retrieval_package_id:

selected_evidence:

discarded_candidates:

ranking:

policies_applied:

budget_usage:

confidence:

generated_at:

metadata:
```

El Retrieval Package constituye la entrada oficial del Context Engine.

---

# 9. Evidence Model

Toda evidencia deberá contener como mínimo:

```yaml
evidence_id:

source:

origin:

type:

confidence:

relevance:

priority:

relationships:

justification:

content:
```

La evidencia constituye la unidad mínima utilizada por el Retrieval Engine.

# 10. Ranking Strategies

El Retrieval Engine podrá aplicar diferentes estrategias de priorización.

## Relevance Ranking

Ordena la evidencia según su relevancia respecto al Context Plan.

---

## Confidence Ranking

Prioriza evidencia con mayor nivel de confianza.

---

## Authority Ranking

Prioriza información proveniente de fuentes autorizadas.

---

## Freshness Ranking

Favorece conocimiento y memoria recientes cuando la política lo requiera.

---

## Graph Ranking

Incrementa la prioridad de evidencia altamente conectada dentro del Knowledge Graph.

---

## Hybrid Ranking

Combina múltiples estrategias.

Esta constituye la estrategia recomendada por Atlas.

---

# 11. Conflict Resolution

Durante la recuperación pueden existir evidencias contradictorias.

El Conflict Resolver aplicará el siguiente orden de prioridad.

1. Policy
2. Standard
3. Approved Knowledge
4. Organizational Memory
5. Episodic Memory

Toda resolución deberá registrarse para auditoría.

---

# 12. Context Budget Optimization

El Retrieval Engine deberá respetar el presupuesto definido por el Context Planner.

El Budget Optimizer podrá:

- eliminar evidencia redundante.
- resumir evidencia.
- fusionar evidencia equivalente.
- priorizar evidencia crítica.
- descartar evidencia de baja relevancia.

Toda optimización deberá preservar trazabilidad.

---

# 13. Retrieval Policies

Las políticas de recuperación determinan cómo debe seleccionarse la evidencia.

Ejemplos.

```text
HighestConfidence

LowestLatency

OrganizationOnly

ApprovedOnly

LatestVersion

GraphExpansion

MemoryEnabled

KnowledgeOnly

Balanced
```

Las organizaciones podrán definir políticas adicionales.

---

# 14. Retrieval Events

El Retrieval Engine podrá emitir los siguientes eventos.

```text
RetrievalStarted

CandidatesAnalyzed

EvidenceCollected

RankingCompleted

ConflictsResolved

BudgetOptimized

RetrievalCompleted

RetrievalFailed
```

Todos los eventos deberán registrarse mediante el módulo de Observability.

---

# 15. Validation

Antes de generar un Retrieval Package deberá verificarse:

- evidencia válida.
- fuentes autorizadas.
- políticas aplicadas.
- conflictos resueltos.
- presupuesto respetado.
- justificaciones presentes.
- trazabilidad completa.

Todo Retrieval Package inválido deberá rechazarse.

---

# 16. Performance Requirements

El Retrieval Engine deberá optimizar:

- precisión.
- relevancia.
- cobertura.
- velocidad.
- consumo del presupuesto de contexto.
- explicabilidad.

Las implementaciones podrán utilizar algoritmos propios siempre que respeten el contrato oficial.

---

# 17. Extensibility

Las implementaciones podrán incorporar:

- nuevos algoritmos de ranking.
- nuevas políticas.
- nuevos optimizadores.
- nuevos mecanismos de resolución de conflictos.
- nuevos modelos de evidencia.

Toda extensión deberá mantener compatibilidad con Atlas.

---

# 18. Compliance

Una implementación será compatible con Atlas Retrieval Engine cuando:

- implemente Retrieval Request.
- produzca un Retrieval Package válido.
- utilice Evidence Units.
- preserve trazabilidad.
- justifique toda selección.
- respete el Context Budget.
- mantenga independencia tecnológica.

---

# 19. Related Documents

Foundation

- ATLAS-001 — Manifesto
- ATLAS-002 — Constitution
- ATLAS-003 — Principles
- ATLAS-004 — Domain Model
- ATLAS-005 — Boundaries
- ATLAS-006 — Governance
- ATLAS-007 — Decision Model
- ATLAS-008 — Ontology
- ATLAS-009 — Glossary
- ATLAS-010 — Platform Mapping

Engine

- ATLAS-100 — Engine
- ATLAS-101 — Context Engine
- ATLAS-102 — Knowledge Engine
- ATLAS-103 — Memory Engine
- ATLAS-104 — Search Engine
- ATLAS-106 — Prompt Engine
- ATLAS-107 — Agent Runtime
- ATLAS-108 — Workflow Engine
- ATLAS-109 — Validation Engine
- ATLAS-110 — Context Planner

---

# 20. Change History

| Version | Date | Description |
|----------|------------|-----------------------------------------------|
| 1.0.0 | 2026-07-13 | Initial Retrieval Engine specification. |

---

# Final Statement

El Retrieval Engine constituye el mecanismo de selección de evidencia del ecosistema Atlas.

Mientras el Search Engine descubre recursos potencialmente relevantes, el Retrieval Engine evalúa, prioriza y justifica qué información merece formar parte del contexto operativo.

Toda decisión de recuperación deberá ser explicable, reproducible y trazable.

Atlas no fundamenta sus respuestas en documentos completos ni en coincidencias textuales.

Atlas fundamenta sus decisiones en evidencia seleccionada mediante políticas explícitas, conocimiento estructurado, memoria organizacional y restricciones de contexto.

La calidad del razonamiento depende de la calidad de la evidencia.

Por ello, el Retrieval Engine representa el puente entre el conocimiento disponible y la inteligencia ejecutable.