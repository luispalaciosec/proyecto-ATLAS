---
id: ATLAS-DOM-005
title: Retrieval Domain
version: 1.0.0
status: draft
owner: Atlas Domain Board
classification: public
foundation_version: 1.0
domain_version: 1.0
created: 2026-07-16
last_updated: 2026-07-16
purpose: >
  Definir el dominio de Recuperación del ecosistema Atlas,
  estableciendo el modelo mediante el cual el conocimiento,
  la memoria y las relaciones semánticas pueden localizarse,
  priorizarse y entregarse de forma eficiente y contextual.
---

# ATLAS-DOM-005 — Retrieval Domain

> "Knowledge that cannot be found is indistinguishable from knowledge that does not exist."

---

# 1. Purpose

Este documento define el dominio oficial de Recuperación (Retrieval) dentro del ecosistema Atlas.

Su propósito consiste en modelar los procesos mediante los cuales Atlas localiza, selecciona, ordena y entrega el conocimiento más relevante para una operación determinada.

El Retrieval constituye el puente entre el conocimiento almacenado y el conocimiento utilizado.

---

# 2. Scope

El Retrieval Domain aplica a todo proceso de búsqueda dentro del ecosistema.

Incluye.

- búsqueda
- recuperación
- ranking
- scoring
- filtrado
- navegación
- expansión
- selección
- enriquecimiento
- agregación

No genera conocimiento.

No interpreta conocimiento.

Localiza conocimiento.

---

# 3. Retrieval Vision

Atlas considera Retrieval como una capacidad transversal.

No depende de una tecnología específica.

Podrá utilizar.

- búsqueda textual;
- búsqueda vectorial;
- búsqueda híbrida;
- navegación por Knowledge Graph;
- reglas semánticas;
- índices;
- embeddings;
- algoritmos futuros.

El dominio permanece estable independientemente del mecanismo utilizado.

---

# 4. Fundamental Principle

Toda recuperación SHALL comenzar con una intención explícita.

El Retrieval nunca buscará "todo".

Buscará únicamente aquello que resulte relevante para el contexto activo.

---

# 5. Domain Responsibilities

El Retrieval Domain es responsable de.

- localizar entidades;
- recuperar memorias;
- consultar relaciones;
- priorizar resultados;
- eliminar ruido;
- enriquecer respuestas;
- soportar navegación inteligente.

No administra almacenamiento.

No administra memoria.

No administra inferencias.

---

# 6. Ubiquitous Language

El lenguaje oficial del dominio incluye.

- Retrieval
- Query
- Retrieval Strategy
- Retrieval Result
- Recall
- Ranking
- Relevance
- Candidate
- Search Index
- Similarity
- Hybrid Search
- Retrieval Context

Toda implementación SHALL utilizar esta terminología.

---

# 7. What is Retrieval?

En Atlas, Retrieval representa el proceso mediante el cual una necesidad de información se transforma en un conjunto priorizado de conocimiento útil.

El Retrieval responde a la pregunta.

> ¿Qué conocimiento necesito ahora?

---

# 8. Retrieval Entity

La entidad principal del dominio es **Retrieval Request**.

Toda solicitud SHALL contener.

- RetrievalId
- Query
- Context
- Scope
- Strategy
- Filters
- Ranking Policy
- Metadata

---

# 9. Query

Una Query representa la intención de búsqueda.

Puede originarse desde.

- usuario;
- agente;
- compilador;
- workflow;
- API;
- runtime.

La Query describe el problema.

No la implementación.

---

# 10. Retrieval Scope

El Scope limita dónde buscar.

Ejemplos.

Global

Organization

Workspace

Project

Knowledge

Memory

Ontology

Graph

Artifacts

Cada búsqueda deberá definir su alcance.

---

# 11. Retrieval Sources

Atlas puede recuperar información desde múltiples fuentes.

Ejemplos.

- Knowledge Domain
- Memory Domain
- Knowledge Graph
- Ontology
- Context
- Documents
- APIs
- Indexes
- Vector Stores
- External Providers

La tecnología utilizada es transparente para el dominio.

---

# 12. Retrieval Strategies

Atlas soporta múltiples estrategias.

Ejemplos.

- Exact Search
- Semantic Search
- Vector Search
- Hybrid Search
- Graph Traversal
- Rule-Based Retrieval
- Metadata Search

Nuevas estrategias podrán incorporarse mediante plugins.

---

# 13. Candidate Generation

Toda búsqueda produce inicialmente un conjunto de candidatos.

Los candidatos serán posteriormente evaluados.

La generación de candidatos prioriza cobertura.

No precisión.

---

# 14. Ranking

El Ranking organiza los candidatos según relevancia.

Podrán considerarse factores como.

- similitud;
- contexto;
- autoridad;
- actualidad;
- popularidad;
- confianza;
- distancia en el grafo.

El algoritmo de ranking es intercambiable.

---

# 15. Relevance

La relevancia representa la utilidad esperada de un resultado.

No depende exclusivamente de similitud vectorial.

La relevancia considera.

- contexto;
- ontología;
- memoria;
- relaciones;
- prioridad.

---

# 16. Retrieval Result

El resultado de una búsqueda podrá contener.

- entidades;
- memorias;
- documentos;
- relaciones;
- contexto;
- metadatos;
- score;
- explicación del ranking.

Todo resultado deberá ser trazable hasta su origen.

---

# 17. Retrieval Pipeline

Toda operación de recuperación SHALL seguir un pipeline determinístico.

```text
Receive Query

↓

Resolve Context

↓

Select Strategy

↓

Generate Candidates

↓

Expand Query

↓

Retrieve

↓

Rank

↓

Filter

↓

Aggregate

↓

Explain

↓

Return Results
```

## Receive Query

El sistema recibe una intención de búsqueda desde cualquier consumidor.

Ejemplos.

- CLI
- SDK
- Agent
- Workflow
- REST API
- GraphQL API

---

## Resolve Context

Antes de buscar.

Atlas resuelve el Context activo.

Toda búsqueda dependerá del Contexto.

Nunca únicamente de la Query.

---

## Select Strategy

El motor selecciona automáticamente la estrategia más adecuada.

Puede utilizar una o varias simultáneamente.

---

## Generate Candidates

Se obtiene un conjunto amplio de candidatos.

Esta etapa privilegia cobertura.

No precisión.

---

## Expand Query

La consulta puede enriquecerse utilizando.

- Ontología;
- sinónimos;
- relaciones;
- taxonomías;
- contexto;
- memoria.

---

## Retrieve

Los candidatos son recuperados desde los distintos proveedores.

---

## Rank

Los candidatos reciben una puntuación.

La relevancia nunca dependerá únicamente de similitud textual.

---

## Filter

Se eliminan resultados.

- duplicados;
- inválidos;
- sin permisos;
- fuera del contexto.

---

## Aggregate

Atlas combina resultados provenientes de múltiples fuentes.

---

## Explain

Todo resultado podrá explicar por qué fue recuperado.

La explicabilidad constituye una capacidad del dominio.

---

## Return Results

El Retrieval devuelve un conjunto priorizado de resultados.

---

# 18. Retrieval Strategies

El dominio soporta múltiples estrategias.

Ejemplos.

```text
Exact Retrieval

Semantic Retrieval

Vector Retrieval

Hybrid Retrieval

Graph Traversal

Rule-Based Retrieval

Metadata Retrieval

Temporal Retrieval

Contextual Retrieval
```

Cada estrategia implementa el mismo contrato público.

---

# 19. Query Expansion

Las consultas podrán enriquecerse automáticamente.

Ejemplos.

```text
Usuario

↓

"Crear workflow"

↓

Ontology

↓

Workflow

Automation

Pipeline

Process

Execution
```

La expansión mejora Recall sin modificar la intención original.

---

# 20. Ranking Engine

El Ranking Engine calcula la relevancia de cada candidato.

Factores posibles.

- similitud;
- contexto;
- relaciones;
- autoridad;
- actualidad;
- confianza;
- frecuencia;
- proximidad en el grafo;
- calidad del conocimiento.

El algoritmo SHALL ser intercambiable.

---

# 21. Result Aggregation

Atlas podrá combinar múltiples resultados.

Ejemplo.

```text
Knowledge

+

Memory

+

Ontology

+

Graph

↓

Unified Result
```

La agregación ocurre antes de la respuesta final.

---

# 22. Retrieval Services

El dominio define los siguientes servicios.

- Query Resolution Service
- Candidate Generation Service
- Retrieval Strategy Service
- Ranking Service
- Aggregation Service
- Explanation Service
- Retrieval Orchestration Service

Los servicios encapsulan la lógica operacional del dominio.

---

# 23. Retrieval Events

Toda recuperación significativa SHALL producir eventos.

Ejemplos.

```text
QueryReceived

CandidatesGenerated

QueryExpanded

RetrievalCompleted

RankingCompleted

ResultsFiltered

ResultsReturned
```

Los eventos representan hechos ya ocurridos.

---

# 24. Retrieval Policies

El dominio establece políticas oficiales.

Ejemplos.

- Ranking Policy
- Recall Policy
- Context Policy
- Search Policy
- Privacy Policy
- Aggregation Policy

Las políticas gobiernan el comportamiento del motor.

---

# 25. Retrieval Specifications

Las Specifications encapsulan reglas reutilizables.

Ejemplos.

```text
ValidQuerySpecification

RankingSpecification

ContextSpecification

RecallSpecification

AggregationSpecification
```

Las Specifications SHALL ser independientes de Infrastructure.

---

# 26. Compiler Integration

Durante la compilación.

```text
Knowledge

↓

Ontology

↓

Context

↓

Memory

↓

Retrieval

↓

Knowledge Graph

↓

Validation

↓

Artifacts
```

El Compiler utiliza Retrieval para localizar entidades ya existentes y evitar duplicaciones durante el proceso de construcción.

---

# 27. Runtime Integration

Todo Runtime podrá utilizar Retrieval.

Ejemplos.

- Agent Runtime
- Workflow Runtime
- Prompt Runtime
- CLI
- SDK
- REST API
- GraphQL API

El Runtime nunca consulta directamente las fuentes.

Siempre utiliza el dominio Retrieval.

---

# 28. Knowledge Graph Integration

El Retrieval podrá navegar el Knowledge Graph.

Ejemplos.

```text
KnowledgeNode

↓

related_to

↓

Prompt

↓

Workflow

↓

Agent
```

La navegación por grafos constituye una estrategia más del dominio.

No reemplaza las demás.

---

# 29. Compliance

Toda implementación SHALL respetar.

- separación entre Query y Strategy;
- resolución contextual;
- estrategias intercambiables;
- ranking determinístico;
- explicabilidad;
- integración con Memory;
- integración con Ontology;
- integración con Knowledge Graph;
- integración con Compiler.

---

# 30. Related Documents

## Domain

- ATLAS-DOM-001 — Knowledge Domain
- ATLAS-DOM-002 — Ontology Domain
- ATLAS-DOM-003 — Context Domain
- ATLAS-DOM-004 — Memory Domain

## Architecture

- ATLAS-ARCH-003 — Compiler Architecture
- ATLAS-ARCH-004 — Knowledge Graph Architecture

## Engine

- ATLAS-105 — Retrieval Engine
- ATLAS-109 — Validation Engine

---

# 31. Implementation Mapping

Este dominio será implementado principalmente en.

```text
packages/

retrieval/
│
├── entities/
│   ├── RetrievalRequest.ts
│   ├── RetrievalResult.ts
│   ├── RetrievalCandidate.ts
│   └── RetrievalExplanation.ts
│
├── value-objects/
│   ├── RetrievalId.ts
│   ├── Query.ts
│   ├── RelevanceScore.ts
│   └── RankingPolicy.ts
│
├── strategies/
│   ├── ExactRetrievalStrategy.ts
│   ├── SemanticRetrievalStrategy.ts
│   ├── VectorRetrievalStrategy.ts
│   ├── HybridRetrievalStrategy.ts
│   ├── GraphRetrievalStrategy.ts
│   └── MetadataRetrievalStrategy.ts
│
├── services/
│   ├── QueryResolutionService.ts
│   ├── CandidateGenerationService.ts
│   ├── RankingService.ts
│   ├── AggregationService.ts
│   ├── ExplanationService.ts
│   └── RetrievalOrchestrationService.ts
│
├── repositories/
│   └── RetrievalRepository.ts
│
├── specifications/
│   ├── ValidQuerySpecification.ts
│   ├── RankingSpecification.ts
│   ├── RecallSpecification.ts
│   └── RetrievalConsistencySpecification.ts
│
├── events/
│   ├── QueryReceived.ts
│   ├── RetrievalCompleted.ts
│   ├── RankingCompleted.ts
│   ├── ResultsReturned.ts
│   └── QueryExpanded.ts
│
└── index.ts
```

---

# 32. Cursor Implementation Checklist

```text
□ Crear Retrieval Request

□ Crear Retrieval Result

□ Crear Candidate Entity

□ Implementar Strategy Pattern

□ Implementar Query Expansion

□ Implementar Ranking Engine

□ Implementar Aggregation Service

□ Implementar Explanation Service

□ Crear Repository

□ Crear Domain Events

□ Escribir Unit Tests

□ Registrar package en Compiler

□ Registrar package en Runtime

□ Integrar con Memory

□ Integrar con Knowledge Graph

□ Exportar package público
```

---

# Change History

| Version | Date | Description |
|----------|------------|--------------------------------------------|
| 1.0.0 | 2026-07-16 | Initial Retrieval Domain specification. |

---

# Final Statement

El Retrieval Domain constituye la capacidad del ecosistema Atlas para transformar una necesidad de información en conocimiento útil, relevante y contextualizado.

A diferencia de un motor de búsqueda tradicional o de una implementación específica de RAG, el dominio de Recuperación abstrae las estrategias tecnológicas y proporciona un modelo estable basado en intención, contexto, relevancia y explicabilidad.

Gracias a este dominio, Atlas puede localizar conocimiento distribuido entre documentos, memorias, ontologías, grafos y fuentes externas, entregando siempre los resultados más adecuados para cada situación y permitiendo que el Compiler, el Runtime y los agentes operen sobre una base de conocimiento accesible, consistente y evolutiva.