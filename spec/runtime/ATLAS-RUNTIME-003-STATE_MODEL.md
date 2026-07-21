---
id: ATLAS-RUNTIME-003
title: State Model
status: approved
version: 1.0.0
owner: Atlas Architecture
category: Runtime
layer: Runtime
created: 2026-07-20
updated: 2026-07-20

depends_on:
  - ATLAS-RUNTIME-001
  - ATLAS-RUNTIME-002
---

# State Model

---

# 1. Purpose

El State Model constituye la especificación oficial que describe cómo evolucionan los estados internos durante la ejecución del Runtime.

Todo elemento ejecutable dentro de Atlas posee un estado observable.

Los estados representan la situación actual de un componente dentro de su ciclo de vida.

No representan eventos.

No representan comandos.

No representan decisiones.

Representan únicamente la condición actual de una entidad durante la ejecución.

---

# 2. State Philosophy

Atlas adopta un modelo de estados explícitos.

Ningún componente cambia de estado de manera implícita.

Toda transición deberá:

- ser válida;
- ser observable;
- generar eventos;
- ser trazable;
- preservar consistencia.

---

# 3. State Ownership

Cada componente administra exclusivamente su propio estado.

Ejemplos:

Execution Unit

Workflow

Task

Agent Execution

Planning Session

Reasoning Session

Context Build

Knowledge Projection

Ningún componente modifica directamente el estado de otro.

Las interacciones ocurren únicamente mediante eventos y contratos públicos.

---

# 4. State Machine Principle

Todo objeto con ciclo de vida deberá comportarse como una máquina de estados finita.

Conceptualmente:

Current State

↓

Transition

↓

Next State

Toda transición deberá estar definida previamente.

Las transiciones no autorizadas deberán rechazarse.

---

# 5. State Categories

Atlas distingue distintos niveles de estado.

Conceptualmente:

Execution State

Workflow State

Task State

Agent State

Knowledge State

Context State

Planning State

Reasoning State

Cada categoría mantiene su independencia semántica.

---

# 6. Initial State

Toda entidad administrada por el Runtime deberá poseer un estado inicial claramente definido.

Ejemplos conceptuales:

Execution Unit → Created

Workflow → Created

Task → Pending

Agent Execution → Assigned

Planning Session → Initialized

Reasoning Session → Initialized

Nunca deberán existir estados indefinidos.

# 7. State Transitions

Toda transición deberá cumplir las siguientes reglas:

- partir de un estado válido;
- finalizar en un estado permitido;
- ser atómica;
- generar eventos;
- preservar consistencia.

Las transiciones parciales no forman parte del modelo.

---

# 8. Terminal States

Algunos estados representan el final del ciclo de vida.

Ejemplos:

Completed

Cancelled

Failed

Archived

Una vez alcanzado un estado terminal, la entidad no podrá regresar a estados anteriores salvo que una implementación defina explícitamente un nuevo ciclo de vida.

---

# 9. Invalid Transitions

Las siguientes situaciones constituyen errores del Runtime:

- saltar estados obligatorios;
- regresar arbitrariamente a estados previos;
- ejecutar múltiples transiciones incompatibles simultáneamente;
- modificar estados desde componentes no autorizados.

Toda transición inválida deberá registrarse como error operacional.

---

# 10. Relationship with Events

Toda transición de estado deberá producir uno o más eventos.

Ejemplo conceptual:

Planning Session

Initialized

↓

PlanningStarted

↓

Running

↓

PlanningCompleted

↓

Completed

El estado representa la condición.

El evento representa el hecho ocurrido.

Ambos conceptos permanecen separados.

---

# 11. Extensibility

Nuevos estados podrán incorporarse siempre que:

- mantengan compatibilidad con el ciclo de vida existente;
- no rompan transiciones previamente definidas;
- respeten las reglas del Runtime.

Cada implementación podrá especializar estados siempre que preserve el comportamiento observable definido por este documento.

---

# 12. Success Criteria

El State Model cumple su propósito cuando:

- describe claramente la evolución de todas las entidades del Runtime;
- mantiene completamente separadas las nociones de estado y evento;
- garantiza transiciones válidas y trazables;
- soporta máquinas de estados independientes para distintos componentes;
- permite evolucionar el Runtime sin romper compatibilidad;
- constituye la referencia oficial para la administración de estados dentro de Atlas.

Este documento constituye la especificación oficial del modelo de estados del Runtime de Atlas.

