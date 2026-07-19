---
id: ATLAS-ARCH-003
title: Compiler Architecture
version: 1.0.0
status: draft
owner: Atlas Architecture Board
classification: public
foundation_version: 1.0
architecture_version: 1.0
created: 2026-07-16
last_updated: 2026-07-19
purpose: >
  Definir la arquitectura del Atlas Compiler, estableciendo
  su modelo de compilación, responsabilidades, pipeline,
  representaciones intermedias y principios de diseño que
  gobiernan la transformación de información en conocimiento
  estructurado.
---

# ATLAS-ARCH-003 — Compiler Architecture

> "The Compiler is the intelligence engine of Atlas."

---

# 1. Purpose

El Atlas Compiler constituye el núcleo de procesamiento de la plataforma.

Su responsabilidad consiste en transformar múltiples fuentes de información en un modelo de conocimiento consistente, validado y reutilizable mediante un pipeline de compilación determinístico.

Este documento define la arquitectura de referencia del Compiler y establece las reglas que deberán respetar todas sus implementaciones oficiales.

---

# 2. Scope

La presente arquitectura aplica a todos los procesos oficiales de compilación del ecosistema Atlas.

Incluye.

- Atlas Compiler
- Compiler Pipeline
- Compilation Units
- Intermediate Representations
- Knowledge Graph
- Validation
- Artifact Generation
- Publishers
- Compiler Plugins

---

# 3. Compiler Vision

Atlas no interpreta documentos.

Atlas compila conocimiento.

Al igual que un compilador tradicional transforma código fuente en ejecutables, Atlas transforma información distribuida en un modelo de conocimiento estructurado.

El resultado principal del proceso no son documentos.

Es un **Knowledge Graph**.

Los documentos, APIs y demás artefactos representan únicamente distintas proyecciones del mismo conocimiento.

---

# 4. Compiler Responsibilities

El Compiler SHALL ser responsable de.

- descubrir fuentes de información;
- construir unidades de compilación;
- transformar documentos en nodos de conocimiento;
- resolver relaciones semánticas;
- construir el Knowledge Graph;
- validar consistencia;
- generar artefactos;
- coordinar Publishers.

El Compiler SHALL NOT interactuar directamente con interfaces de usuario.

---

# 5. Architectural Principles

Toda implementación del Compiler deberá respetar los siguientes principios.

## Deterministic Compilation

La misma entrada deberá producir exactamente el mismo resultado.

---

## Immutable Context

El contexto de compilación SHALL ser tratado como inmutable durante cada etapa del pipeline.

---

## Pass Oriented

Cada transformación SHALL implementarse como un Compiler Stage independiente.

---

## Graph Native

El modelo oficial de salida SHALL ser el Knowledge Graph.

---

## Extensible by Design

Toda nueva capacidad SHALL incorporarse mediante interfaces públicas.

---

## Incremental Ready

La arquitectura SHALL permitir compilación incremental sin modificar el diseño fundamental.

---

# 6. Compiler Overview

El Atlas Compiler se organiza como un pipeline de transformación compuesto por etapas especializadas.

Cada etapa recibe un contexto de compilación, ejecuta una responsabilidad específica y produce un nuevo contexto enriquecido.

La comunicación entre etapas SHALL realizarse exclusivamente mediante contratos definidos por el núcleo del Compiler.

---

# 7. Compiler Pipeline

El flujo lógico de compilación es el siguiente.

```text
Sources

↓

Compilation Units

↓

Lowering

↓

Knowledge Nodes (HIR)

↓

Knowledge Graph (MIR)

↓

Validation

↓

Artifact Generation

↓

Publishing
```

Cada etapa representa una transformación independiente.

La salida de una etapa constituye la entrada de la siguiente.

---

# 8. Compilation Units

Toda fuente de información deberá convertirse primero en una **Compilation Unit**.

Una Compilation Unit representa una unidad independiente de compilación.

Ejemplos.

- documento Markdown;
- archivo YAML;
- definición JSON;
- Prompt;
- Workflow;
- Ontology;
- API Specification.

Las unidades SHALL ser autocontenidas y trazables.

---

# 9. High-Level Intermediate Representation (HIR)

El HIR representa la primera representación semántica del conocimiento.

Durante esta etapa desaparecen los detalles propios del formato de entrada.

Todos los elementos pasan a representarse mediante entidades del dominio Atlas.

Ejemplos.

- KnowledgeNode
- DocumentNode
- ADRNode
- AEPNode
- OntologyNode
- ContextNode

El HIR constituye la representación oficial del dominio.

Todavía no existen relaciones completamente resueltas.

---

# 10. Mid-Level Intermediate Representation (MIR)

El MIR representa el conocimiento una vez resueltas las relaciones semánticas.

Su implementación oficial corresponde al **Knowledge Graph**.

Durante esta etapa el sistema identifica.

- referencias;
- dependencias;
- jerarquías;
- relaciones semánticas;
- trazabilidad;
- consistencia.

El Knowledge Graph constituye la principal salida lógica del proceso de compilación.

---

# 11. Compilation Context

Toda compilación SHALL ejecutarse sobre un único **CompilationContext**.

Este contexto representa el estado completo del proceso de compilación.

Incluye.

- configuración;
- Workspace;
- paquetes cargados;
- plugins;
- diagnósticos;
- HIR;
- MIR;
- artefactos generados.

Cada Compiler Stage recibirá un contexto y devolverá un nuevo contexto enriquecido.

El contexto SHALL tratarse como inmutable.

---

# 12. Compiler Contracts

El núcleo del Compiler define los siguientes contratos principales.

- Compiler
- CompilerPipeline
- CompilerStage
- CompilationContext
- CompilationUnit
- KnowledgeNode
- KnowledgeGraph
- Diagnostic
- Artifact
- Generator
- Publisher

Las implementaciones concretas SHALL depender únicamente de estos contratos.

---

# 13. Stage Model

Cada etapa del pipeline deberá implementar una única responsabilidad.

Una etapa SHALL.

- recibir un CompilationContext;
- validar sus precondiciones;
- ejecutar una transformación;
- producir un nuevo CompilationContext.

Las etapas SHALL NOT modificar directamente el contexto recibido.

---

# 14. Compiler Lifecycle

Toda compilación seguirá el siguiente ciclo de vida.

```text
Initialize

↓

Discover Sources

↓

Create Compilation Units

↓

Lower

↓

Resolve

↓

Validate

↓

Generate

↓

Publish

↓

Complete
```

Cada transición representa un estado claramente definido del proceso.

---

# 15. Related Documents

Architecture

- ATLAS-ARCH-000 — Architecture Overview
- ATLAS-ARCH-001 — System Architecture
- ATLAS-ARCH-002 — Package Architecture
- ATLAS-ARCH-004 — Knowledge Graph Architecture
- ATLAS-ARCH-005 — Runtime Architecture
- ATLAS-ARCH-006 — Build Compilation Pipeline

Engine

- ATLAS-100 — Engine
- ATLAS-102 — Knowledge Engine
- ATLAS-104 — Search Engine
- ATLAS-105 — Retrieval Engine

SDK

- ATLAS-200 — SDK Overview

---

# 16. Change History

| Version | Date | Description |
|----------|------------|---------------------------------------------|
| 1.0.0 | 2026-07-16 | Initial Compiler Architecture specification. |

---

# Final Statement

El Atlas Compiler constituye el núcleo de procesamiento del ecosistema Atlas.

Su arquitectura ha sido diseñada para transformar información distribuida en conocimiento estructurado mediante un pipeline determinístico, extensible y desacoplado.

Toda implementación oficial SHALL respetar los principios, contratos y etapas definidos en este documento, garantizando que el conocimiento generado preserve consistencia, trazabilidad y capacidad de evolución a largo plazo.

---

# 17. Compiler Pipeline Architecture

El Compiler SHALL implementar una arquitectura basada en **Pipeline Stages**.

Cada etapa constituye una transformación independiente, determinística y desacoplada.

Las etapas deberán ejecutarse siguiendo el orden establecido por el Pipeline oficial.

```text
Discovery
        │
        ▼
Ingestion
        │
        ▼
Lowering
        │
        ▼
Resolution
        │
        ▼
Graph Construction
        │
        ▼
Validation
        │
        ▼
Generation
        │
        ▼
Publishing
```

Cada etapa podrá enriquecerse en futuras versiones sin modificar las demás.

---

# 18. Compiler Stages

Toda transformación SHALL implementarse mediante un **Compiler Stage**.

Cada Stage representa una responsabilidad única.

Ejemplos.

- Discovery Stage
- Parsing Stage
- Lowering Stage
- Ontology Resolution Stage
- Context Resolution Stage
- Graph Builder Stage
- Validation Stage
- Artifact Generation Stage
- Publishing Stage

Cada Stage SHALL cumplir el principio de responsabilidad única.

---

# 19. Discovery Stage

La etapa Discovery identifica todas las fuentes que forman parte del Workspace.

Entre ellas.

- Markdown
- YAML
- JSON
- Assets
- Plugins
- APIs
- Configuración

Su resultado consiste en un conjunto de Compilation Units.

---

# 20. Lowering Stage

El proceso de Lowering transforma las Compilation Units en entidades del dominio Atlas.

Durante esta etapa desaparecen los detalles propios del formato de origen.

El resultado SHALL ser el HIR oficial.

---

# 21. Resolution Stage

La etapa Resolution resuelve todas las referencias existentes.

Incluye.

- referencias cruzadas;
- dependencias;
- herencia;
- ontologías;
- namespaces;
- aliases;
- relaciones semánticas.

Su salida consiste en un modelo de conocimiento consistente.

---

# 22. Graph Construction

El Graph Builder transforma el modelo semántico en el Knowledge Graph oficial.

Durante este proceso se generan.

- nodos;
- relaciones;
- índices;
- metadatos;
- trazabilidad;
- dependencias.

El Knowledge Graph SHALL representar la única fuente oficial de conocimiento del Workspace.

---

# 23. Validation Architecture

La validación SHALL ejecutarse como una etapa independiente.

Los validadores podrán pertenecer a distintas categorías.

## Structural Validation

Verifica la integridad del modelo.

---

## Semantic Validation

Verifica significado y relaciones.

---

## Architectural Validation

Verifica cumplimiento de reglas Atlas.

---

## Policy Validation

Evalúa restricciones organizacionales.

---

## Plugin Validation

Permite incorporar reglas definidas por terceros.

---

Todos los resultados SHALL representarse mediante Diagnostics.

---

# 24. Diagnostic System

Toda incidencia detectada por el Compiler SHALL representarse mediante un Diagnostic.

Los Diagnostics incluyen.

- Errors
- Warnings
- Information
- Suggestions

Cada Diagnostic deberá contener.

- identificador;
- severidad;
- ubicación;
- mensaje;
- causa;
- posible solución.

Los Diagnostics SHALL preservar trazabilidad completa.

---

# 25. Generator Architecture

Los artefactos no son producidos directamente por el Compiler.

Son responsabilidad de los **Generators**.

Ejemplos.

- Markdown Generator
- Documentation Generator
- REST Generator
- GraphQL Generator
- SDK Generator
- JSON Generator
- OpenAPI Generator

Todos los Generators SHALL implementar el contrato oficial.

---

# 26. Generator Registry

El descubrimiento de Generators SHALL realizarse mediante un Registry.

Sus responsabilidades incluyen.

- descubrimiento;
- registro;
- resolución;
- versionado;
- compatibilidad.

Los Generators podrán incorporarse sin modificar el núcleo del Compiler.

---

# 27. Publisher Architecture

Los Publishers representan el último paso del proceso de compilación.

Su responsabilidad consiste en distribuir los artefactos generados.

Ejemplos.

- Git Publisher
- GitHub Publisher
- Local Publisher
- Filesystem Publisher
- S3 Publisher

Los Publishers SHALL operar únicamente sobre Artifacts.

Nunca sobre Knowledge Nodes.

---

# 28. Publisher Registry

El sistema SHALL descubrir automáticamente los Publishers disponibles.

Cada Publisher declarará.

- capacidades;
- formatos soportados;
- requisitos;
- prioridades;
- configuración.

---

# 29. Incremental Compilation

La arquitectura SHALL soportar compilación incremental.

Cuando únicamente cambien determinados documentos.

El sistema SHALL recompilar únicamente las unidades afectadas.

Las etapas restantes podrán reutilizar resultados previamente generados.

Este comportamiento constituye un objetivo arquitectónico prioritario.

---

# 30. Parallel Compilation

Las etapas independientes MAY ejecutarse en paralelo.

La paralelización nunca deberá modificar el resultado lógico de la compilación.

La compilación paralela constituye una optimización.

No una diferencia funcional.

---

# 31. Cache Architecture

El Compiler MAY mantener distintos niveles de caché.

Ejemplos.

- Source Cache
- Parsing Cache
- HIR Cache
- Graph Cache
- Artifact Cache

Toda caché SHALL invalidarse automáticamente cuando cambien sus dependencias.

---

# 32. Plugin Extension Model

Los Plugins podrán extender el Compiler mediante contratos oficiales.

Entre otros.

- nuevos Stages;
- Validators;
- Generators;
- Publishers;
- Diagnostics;
- Context Resolvers.

Los Plugins SHALL NOT modificar el comportamiento interno del núcleo.

---

# 33. Performance Considerations

La arquitectura del Compiler deberá optimizar.

- tiempo de compilación;
- consumo de memoria;
- compilación incremental;
- paralelización;
- reutilización de resultados;
- escalabilidad.

Las optimizaciones nunca deberán comprometer el determinismo del proceso.

---

# 34. Knowledge Projection Boundary (Sprint 9)

Sprint 9 introduces a **projection layer** outside the Compiler package.

```text
KnowledgeObject  →  KnowledgeProjectionAdapter  →  CompilationUnit  →  Compiler
```

Rules:

- The Compiler SHALL continue accepting only `CompilationUnit` inputs.
- The Compiler SHALL NOT depend on `@atlas/knowledge`.
- Projection is strictly one-way; the Compiler SHALL NOT modify or reconstruct KnowledgeObjects.
- `CompilationUnit` instances produced by projection are disposable compiler artifacts.
- The public SDK entry point remains `atlas.compiler.compile(...)`; projection is transparent to SDK consumers.

See `Release/SPRINT9_IMPLEMENTATION_REPORT.md`.

---

# 35. Future Evolution

La arquitectura permite incorporar futuras capacidades como.

- compilación distribuida;
- procesamiento remoto;
- AI-assisted compilation;
- múltiples Knowledge Graphs;
- compilación federada;
- streaming compilation.

Estas capacidades no requerirán modificar la arquitectura fundamental del Compiler.

---

# 36. Compliance

Toda implementación oficial SHALL cumplir.

- Pipeline oficial;
- Compilation Context;
- Compiler Stages;
- Knowledge Graph;
- Diagnostics;
- Generator Registry;
- Publisher Registry;
- determinismo;
- trazabilidad;
- extensibilidad.

---

# Final Statement

El Atlas Compiler constituye el corazón tecnológico del ecosistema Atlas.

Su arquitectura ha sido diseñada siguiendo principios de compiladores modernos, adaptando conceptos como **Intermediate Representations**, **Compiler Passes**, **Diagnostics**, **Registries** y **Pipeline Stages** al dominio de la gestión del conocimiento.

Esta arquitectura permite que Atlas evolucione desde una plataforma de documentación hacia un sistema capaz de comprender, validar, transformar y publicar conocimiento de forma consistente, escalable y extensible.

Toda implementación futura SHALL preservar esta arquitectura como fundamento del ecosistema Atlas.