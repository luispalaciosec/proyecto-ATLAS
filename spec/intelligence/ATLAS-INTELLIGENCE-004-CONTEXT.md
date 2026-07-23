---
id: ATLAS-INTELLIGENCE-004
title: Atlas Context Model
status: approved
version: 1.0.0
owner: Atlas Architecture
category: Intelligence
layer: Specification
created: 2026-07-19
updated: 2026-07-19
depends_on:
  - ATLAS-INTELLIGENCE-001
  - ATLAS-INTELLIGENCE-002
  - ATLAS-INTELLIGENCE-003
  - ATLAS-KNOWLEDGE-001
---

# Atlas Context Model

---

# 1. Purpose

Este documento define el modelo conceptual de Context dentro de Atlas.

Context representa la información activa que un proceso inteligente necesita para ejecutar una tarea determinada.

No representa conocimiento.

No representa memoria.

No representa una conversación.

Representa una composición dinámica de múltiples fuentes de información.

---

# 2. Context

Knowledge preserva hechos.

Memory preserva experiencias.

Retrieval selecciona información relevante.

Sin embargo, un proceso inteligente aún necesita una representación unificada sobre la cual razonar.

Esa representación recibe el nombre de Context.

---

# 3. Fundamental Principle

Context no almacena información.

Context organiza información.

Toda instancia de Context es efímera.

Puede reconstruirse en cualquier momento utilizando:

- Knowledge
- Memory
- Retrieval
- Inputs
- Estado de ejecución

Por esta razón Context nunca constituye una fuente de verdad.

---

# 4. Context as a Projection

Atlas considera Context como una proyección temporal del estado del sistema.

No existe de forma permanente.

Se construye para cumplir un objetivo específico.

Cuando dicho objetivo termina, el Context desaparece.

El conocimiento permanece.

---

# 5. Context Sources

Una instancia de Context puede incorporar información proveniente de múltiples capas.

## Knowledge

Objetos canónicos.

---

## Memory

Experiencias relevantes.

---

## Retrieval

Resultados seleccionados para la tarea actual.

---

## Runtime

Estado actual de ejecución.

---

## User Input

Información entregada por el usuario.

---

## Environment

Variables del entorno.

---

## Agent State

Información específica del agente que ejecuta la tarea.

Todas estas fuentes pueden coexistir dentro de un mismo Context.

Ninguna posee prioridad absoluta.

# 6. Context Lifecycle

Todo Context atraviesa un ciclo de vida.

Request

↓

Build

↓

Enrich

↓

Consume

↓

Dispose

Context nunca se reutiliza indefinidamente.

Cada ejecución genera un nuevo contexto.

---

# 7. Context Properties

Toda implementación deberá garantizar las siguientes propiedades.

## Ephemeral

Context existe únicamente durante la ejecución.

---

## Reproducible

Ante las mismas entradas deberá poder reconstruirse.

---

## Explainable

Debe poder indicar qué información contiene y por qué.

---

## Observable

Debe producir métricas sobre su construcción y utilización.

---

## Immutable During Reasoning

Una vez iniciado el proceso de razonamiento, el Context deberá permanecer estable.

Las modificaciones posteriores producirán un nuevo Context.

---

# 8. Context Composition

Atlas no impone un formato específico.

Sin embargo, todo Context deberá ser capaz de representar al menos:

- objetivo actual;
- conocimiento relevante;
- memorias relevantes;
- restricciones;
- actores involucrados;
- estado de ejecución;
- historial necesario;
- recursos disponibles.

Las implementaciones futuras podrán extender esta composición.

---

# 9. Relationship with Reasoning

Reasoning nunca consulta directamente Knowledge.

Reasoning opera exclusivamente sobre Context.

Esto desacopla el motor de razonamiento de las fuentes originales de información.

Gracias a ello diferentes estrategias de Retrieval podrán producir Context distintos sin modificar el razonador.

---

# 10. Long-Term Vision

Atlas evolucionará hacia un sistema donde múltiples Context puedan coexistir simultáneamente.

Por ejemplo:

- Context estratégico;
- Context operativo;
- Context financiero;
- Context creativo;
- Context legal.

Cada uno contendrá únicamente la información necesaria para su dominio.

---

# 11. Out of Scope

Este documento no define:

- prompts;
- ventanas de contexto de modelos LLM;
- tokenización;
- embeddings;
- serialización;
- formatos JSON específicos.

Estos aspectos pertenecen a implementaciones concretas.

---

# 12. Success Criteria

El modelo de Context se considerará correctamente implementado cuando:

- pueda construirse desde múltiples fuentes de información;
- permanezca efímero y reproducible;
- desacople el razonamiento del almacenamiento de conocimiento;
- permita explicar completamente su composición;
- sirva como única entrada para los procesos de inteligencia.

Hasta entonces, este documento constituye la especificación oficial del modelo de Context dentro de Atlas.
