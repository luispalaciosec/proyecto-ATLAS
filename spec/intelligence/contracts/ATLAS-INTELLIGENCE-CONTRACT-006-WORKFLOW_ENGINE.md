---
id: ATLAS-INTELLIGENCE-CONTRACT-006
title: Workflow Engine Contract
status: approved
version: 1.0.0
owner: Atlas Architecture
category: Intelligence
layer: Contract
created: 2026-07-20
updated: 2026-07-20

depends_on:
  - ATLAS-INTELLIGENCE-007
  - ATLAS-INTELLIGENCE-CONTRACT-005
---

# Workflow Engine Contract

---

# 1. Purpose

El Workflow Engine constituye la abstracción responsable de coordinar la ejecución de un Execution Plan.

Su responsabilidad consiste en transformar un plan estático en un proceso dinámico de ejecución.

No genera planes.

No toma decisiones estratégicas.

No ejecuta tareas directamente.

Su única responsabilidad consiste en coordinar el flujo de trabajo.

---

# 2. Responsibility

Toda implementación del Workflow Engine deberá ser capaz de:

- interpretar un Execution Plan;
- iniciar un workflow;
- coordinar tareas;
- administrar dependencias;
- controlar estados;
- supervisar la ejecución;
- finalizar correctamente el proceso.

Nunca deberá modificar el plan recibido.

---

# 3. Workflow Independence

Atlas no depende de un motor específico de workflows.

Una implementación podrá utilizar:

- DAGs;
- State Machines;
- BPMN;
- Event-Driven Workflows;
- Orquestadores distribuidos;
- Sistemas reactivos;
- Motores propietarios.

Todos representan implementaciones válidas del mismo contrato.

---

# 4. Input

El Workflow Engine recibe exclusivamente un Execution Plan.

Nunca consulta directamente:

- Reasoning Engine;
- Memory Provider;
- Retrieval Provider;
- Context Builder.

Toda la información necesaria deberá encontrarse en el plan recibido.

---

# 5. Output

El resultado del Workflow Engine será un Workflow Execution.

Conceptualmente contendrá:

- estado del workflow;
- tareas pendientes;
- tareas completadas;
- tareas fallidas;
- dependencias activas;
- eventos generados;
- resultado consolidado.

---

# 6. Workflow Lifecycle

Todo workflow deberá recorrer un ciclo de vida claramente definido.

Conceptualmente:

Created

↓

Scheduled

↓

Running

↓

Paused

↓

Resumed

↓

Completed

↓

Archived

Las implementaciones podrán ampliar este ciclo siempre que preserven la semántica general.

# 7. Coordination Principles

Toda implementación deberá respetar los siguientes principios:

- coordinación desacoplada;
- ejecución observable;
- control explícito de estados;
- manejo de dependencias;
- tolerancia a fallos;
- capacidad de reanudación.

El Workflow Engine coordina.

Nunca ejecuta directamente el trabajo.

---

# 8. Failure Management

Toda implementación deberá gestionar adecuadamente:

- errores recuperables;
- errores críticos;
- reintentos;
- cancelaciones;
- compensaciones;
- recuperación parcial.

La política concreta dependerá de cada implementación.

El contrato únicamente define el comportamiento esperado.

---

# 9. Relationship with Other Contracts

El Workflow Engine consume información proveniente del:

- Planning Engine.

Y delega actividades al:

- Agent Runtime.

Nunca interactúa directamente con:

- Memory Provider;
- Retrieval Provider;
- Reasoning Engine.

La coordinación permanece completamente desacoplada de la ejecución.

---

# 10. Extensibility

Nuevos motores de workflow podrán incorporarse sin modificar este contrato.

Ejemplos:

- Distributed Workflow Engine;
- Business Workflow Engine;
- Event Workflow Engine;
- Autonomous Workflow Engine;
- Human-in-the-Loop Workflow Engine.

Todos deberán preservar el comportamiento observable definido por este contrato.

---

# 11. Diagnostics

Toda implementación deberá proporcionar información suficiente para auditoría.

Ejemplos:

- duración del workflow;
- estado actual;
- número de tareas;
- eventos generados;
- tiempos por etapa;
- errores;
- reintentos.

Esta información pertenece al plano operacional.

Nunca forma parte del conocimiento persistente.

---

# 12. Success Criteria

Una implementación cumple este contrato cuando:

- coordina correctamente un Execution Plan;
- mantiene completamente desacoplada la coordinación de la ejecución;
- controla estados de manera consistente;
- soporta recuperación ante fallos;
- permite sustituir el motor de workflows sin modificar el resto de la arquitectura;
- permanece compatible con la Public API de Atlas.

Este contrato constituye la especificación oficial del componente Workflow Engine dentro del ecosistema Atlas.

