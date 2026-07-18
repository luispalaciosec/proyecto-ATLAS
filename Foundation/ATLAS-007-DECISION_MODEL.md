---
id: ATLAS-007
title: Atlas Decision Model
version: 1.0.0
status: draft
owner: Atlas Foundation
classification: public
created: 2026-07-13
last_updated: 2026-07-13
purpose: >
  Definir el modelo oficial para la toma de decisiones dentro de Atlas,
  estableciendo un proceso estructurado, trazable y basado en evidencia que
  pueda ser utilizado por personas, equipos y agentes de inteligencia
  artificial.
---

# ATLAS-007 — Decision Model

> "Las organizaciones no son mejores por tomar más decisiones. Son mejores por tomar mejores decisiones."

---

# 1. Purpose

El Decision Model define cómo deben tomarse las decisiones dentro del ecosistema Atlas.

Su propósito es asegurar que todas las decisiones relevantes sean:

- conscientes,
- trazables,
- justificables,
- reproducibles,
- medibles.

Toda decisión deberá poder explicarse utilizando el presente modelo.

---

# 2. Scope

Este documento aplica a:

- Personas
- Equipos
- Organizations
- Domains
- Agents
- Automatizaciones
- Procesos de negocio

Toda implementación basada en Atlas deberá respetar este modelo.

---

# 3. Decision Philosophy

Atlas entiende una decisión como un proceso, no como un evento.

Una buena decisión no depende únicamente del resultado obtenido.

Depende de la calidad del razonamiento utilizado.

Por ello Atlas privilegia:

- evidencia sobre intuición,
- contexto sobre velocidad,
- aprendizaje sobre perfección,
- criterio sobre automatización.

---

# 4. Decision Lifecycle

Toda decisión sigue el siguiente ciclo.

```text
Observation

↓

Context

↓

Evidence

↓

Analysis

↓

Alternatives

↓

Evaluation

↓

Decision

↓

Execution

↓

Measurement

↓

Learning

↓

Knowledge
```

El ciclo no termina con la ejecución.

Toda decisión deberá generar aprendizaje.

---

# 5. Decision Types

Atlas clasifica las decisiones según su impacto.

## Strategic Decision

Define la dirección de la organización.

Ejemplos:

- Nueva unidad de negocio.
- Cambio de posicionamiento.
- Nueva estrategia.

Frecuencia: baja.

Impacto: muy alto.

---

## Architectural Decision

Modifica la estructura del sistema.

Ejemplos:

- Nuevo Domain.
- Cambio de Ontology.
- Nuevo Principle.
- Cambio de Governance.

Frecuencia: baja.

Impacto: alto.

---

## Operational Decision

Optimiza la operación.

Ejemplos:

- Nuevo proceso.
- Automatización.
- Nuevo Workflow.
- Cambio operativo.

Frecuencia: media.

Impacto: medio.

---

## Tactical Decision

Afecta únicamente la ejecución diaria.

Ejemplos:

- Priorización de tareas.
- Ajustes de contenido.
- Asignación de recursos.
- Corrección documental.

Frecuencia: alta.

Impacto: bajo.

---

# 6. Decision Components

Toda Decision deberá contener los siguientes elementos.

## Observation

¿Qué ocurrió?

---

## Context

¿Por qué es importante?

---

## Problem

¿Qué se intenta resolver?

---

## Objective

¿Qué resultado se espera?

---

## Evidence

¿Qué información respalda la decisión?

---

## Alternatives

¿Qué opciones existen?

---

## Evaluation

¿Cómo se compararon las alternativas?

---

## Decision

¿Qué alternativa fue elegida?

---

## Responsible

¿Quién tomó la decisión?

---

## Date

¿Cuándo fue tomada?

---

## Expected Outcome

¿Qué resultado se espera?

---

## Metrics

¿Cómo se evaluará el éxito?

---

## Lessons Learned

¿Qué se aprendió?

---

# 7. Evidence Model

Atlas clasifica la evidencia en cinco niveles.

## Level 1 — Opinion

Basada únicamente en experiencia personal.

Nivel de confianza: Bajo.

---

## Level 2 — Expert Judgment

Respaldada por especialistas.

Nivel de confianza: Medio.

---

## Level 3 — Historical Evidence

Respaldada por experiencias anteriores.

Nivel de confianza: Medio-Alto.

---

## Level 4 — Quantitative Evidence

Respaldada por datos medibles.

Nivel de confianza: Alto.

---

## Level 5 — Experimental Evidence

Respaldada por experimentación controlada.

Nivel de confianza: Muy Alto.

---

Las decisiones SHOULD utilizar el mayor nivel de evidencia disponible.

---

# 8. Decision Criteria

Las alternativas deberán evaluarse utilizando criterios explícitos.

Ejemplos.

- Impacto
- Riesgo
- Costo
- Tiempo
- Complejidad
- Escalabilidad
- Reutilización
- Alineación estratégica
- Calidad
- Sostenibilidad

Los criterios deberán definirse antes de seleccionar una alternativa.

---

# 9. Decision Matrix

Atlas recomienda utilizar una matriz de evaluación.

| Criterion | Weight | Option A | Option B | Option C |
|------------|--------|----------|----------|----------|
| Impact | 30% | | | |
| Cost | 20% | | | |
| Risk | 20% | | | |
| Time | 15% | | | |
| Scalability | 15% | | | |

La alternativa con mayor puntuación no necesariamente será seleccionada.

La decisión final pertenece al responsable humano.

# 10. Decision Authority

Toda decisión deberá tener una autoridad claramente definida.

Atlas establece el siguiente modelo.

| Decision Type | Primary Authority | Escalation |
|---------------|-------------------|------------|
| Strategic | Executive Leadership | Board |
| Architectural | Governance Board | Executive Leadership |
| Operational | Domain Owner | Governance Board |
| Tactical | Process Owner | Domain Owner |

Ninguna decisión relevante podrá carecer de un responsable identificado.

Los Agents nunca constituyen la autoridad final.

---

# 11. Decision Quality

La calidad de una decisión no depende únicamente de su resultado.

Atlas evalúa una decisión utilizando cinco dimensiones.

## Context Quality

¿Se comprendió correctamente el problema?

---

## Evidence Quality

¿La decisión utilizó evidencia suficiente?

---

## Reasoning Quality

¿Las alternativas fueron evaluadas objetivamente?

---

## Execution Quality

¿La decisión fue implementada correctamente?

---

## Learning Quality

¿La organización aprendió algo después de ejecutarla?

---

## Decision Score

Atlas recomienda evaluar cada decisión utilizando una escala de 1 a 5.

| Dimension | Score |
|-----------|------:|
| Context | 1–5 |
| Evidence | 1–5 |
| Analysis | 1–5 |
| Execution | 1–5 |
| Learning | 1–5 |

La puntuación no sustituye el criterio humano.

Su propósito es facilitar la mejora continua.

---

# 12. Decision Records

Toda decisión importante deberá registrarse.

El registro mínimo recomendado es el siguiente.

```text
Decision ID

Title

Type

Status

Owner

Context

Problem

Objective

Evidence

Alternatives

Evaluation

Decision

Expected Outcome

Metrics

Risks

Dependencies

Related Domains

Lessons Learned

Created At

Updated At

Version
```

Los Decision Records constituyen conocimiento organizacional.

---

# 13. AI-Assisted Decisions

Atlas reconoce que los Agents pueden asistir en la toma de decisiones.

Sin embargo, la responsabilidad permanece siempre en una persona.

## Agents MAY

- recopilar información.
- resumir evidencia.
- identificar patrones.
- generar alternativas.
- comparar opciones.
- estimar riesgos.
- redactar recomendaciones.

---

## Agents MUST NOT

- aprobar Strategy.
- modificar Governance.
- cambiar Policies.
- redefinir Domains.
- eliminar Knowledge.
- aprobar decisiones críticas.

---

## Human Responsibilities

Toda decisión asistida por IA deberá contar con una persona que:

- valide el contexto.
- revise la evidencia.
- evalúe la recomendación.
- apruebe la decisión.
- asuma la responsabilidad.

---

# 14. Decision Anti-patterns

Los siguientes comportamientos representan malas prácticas.

## Decision by Habit

Tomar decisiones porque "siempre se ha hecho así".

---

## Decision without Context

Elegir una solución sin comprender el problema.

---

## Decision without Evidence

Tomar decisiones únicamente por intuición cuando existe evidencia disponible.

---

## Decision by Majority

Elegir una alternativa únicamente porque la mayoría está de acuerdo.

El consenso no garantiza calidad.

---

## Analysis Paralysis

Retrasar indefinidamente una decisión buscando información perfecta.

La incertidumbre forma parte de toda decisión.

---

## Automation Bias

Aceptar automáticamente la recomendación de un Agent sin revisión crítica.

---

## Outcome Bias

Juzgar una decisión únicamente por el resultado obtenido.

Una buena decisión puede producir un mal resultado debido a factores externos.

---

## Survivorship Bias

Analizar únicamente los casos exitosos ignorando los fracasos.

---

## Hidden Decisions

Modificar procesos o estrategias sin registrar la decisión.

---

# 15. Continuous Learning

Toda decisión deberá alimentar el conocimiento organizacional.

El ciclo oficial es.

```text
Decision

↓

Execution

↓

Measurement

↓

Review

↓

Lessons Learned

↓

Knowledge

↓

Better Decisions
```

Atlas considera este ciclo como un proceso continuo.

El aprendizaje organizacional nunca finaliza.

---

# 16. Compliance

Una implementación será compatible con Atlas Decision Model cuando:

- Todas las decisiones relevantes estén registradas.
- Toda decisión tenga un Owner.
- Exista evidencia asociada.
- Se documenten las alternativas consideradas.
- La autoridad de aprobación sea explícita.
- Los resultados sean medibles.
- Se registren los aprendizajes obtenidos.

---

# 17. Decision Review Checklist

Antes de aprobar una decisión importante deberán responderse afirmativamente las siguientes preguntas.

## Context

- ¿El problema está claramente definido?
- ¿El objetivo es explícito?

---

## Evidence

- ¿Existe evidencia suficiente?
- ¿La información es confiable?
- ¿Las fuentes están identificadas?

---

## Alternatives

- ¿Se evaluaron múltiples opciones?
- ¿Los criterios fueron definidos previamente?

---

## Governance

- ¿La autoridad es correcta?
- ¿La decisión respeta la Constitution?
- ¿Respeta los Principles?
- ¿Respeta los Boundaries?

---

## Learning

- ¿Cómo se medirá el resultado?
- ¿Cómo se capturarán las lecciones aprendidas?

---

Si alguna respuesta es negativa, la decisión deberá revisarse antes de aprobarse.

---

# 18. Related Documents

Este documento complementa:

- ATLAS-001 — Manifesto
- ATLAS-002 — Constitution
- ATLAS-003 — Principles
- ATLAS-004 — Domain Model
- ATLAS-005 — Boundaries
- ATLAS-006 — Governance
- ATLAS-008 — Ontology
- ATLAS-009 — Glossary
- ATLAS-010 — Platform Mapping

---

# 19. Change History

| Version | Date | Description |
|----------|------------|-----------------------------------------|
| 1.0.0 | 2026-07-13 | Initial Decision Model specification. |

---

# Final Statement

Las decisiones representan el mecanismo mediante el cual una organización transforma conocimiento en acción.

Atlas establece un modelo donde toda decisión es:

- consciente,
- contextual,
- basada en evidencia,
- trazable,
- medible,
- responsable,
- orientada al aprendizaje.

Los procesos ejecutan.

Los Agents asisten.

Las métricas informan.

El conocimiento preserva.

Las personas deciden.

Esta separación garantiza que Atlas pueda incorporar nuevas tecnologías sin perder el criterio humano que constituye el núcleo de toda organización inteligente.