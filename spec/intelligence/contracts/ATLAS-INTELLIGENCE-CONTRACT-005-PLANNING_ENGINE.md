---
id: ATLAS-INTELLIGENCE-CONTRACT-005
title: Planning Engine Contract
status: approved
version: 1.0.0
owner: Atlas Architecture
category: Intelligence
layer: Contract
created: 2026-07-20
updated: 2026-07-20

depends_on:
  - ATLAS-INTELLIGENCE-006
  - ATLAS-INTELLIGENCE-CONTRACT-004
---

# Planning Engine Contract

---

# 1. Purpose

El Planning Engine constituye la abstracción responsable de transformar conclusiones cognitivas en un plan estructurado de ejecución.

Su responsabilidad consiste en decidir:

- qué debe hacerse;
- en qué orden;
- bajo qué restricciones;
- con qué dependencias.

Nunca ejecuta acciones.

Nunca interactúa directamente con agentes.

Nunca modifica conocimiento persistente.

Su único propósito consiste en construir planes.

---

# 2. Responsibility

Toda implementación del Planning Engine deberá ser capaz de:

- interpretar un Reasoning Result;
- identificar objetivos;
- dividir problemas complejos;
- establecer prioridades;
- construir secuencias lógicas;
- producir un Execution Plan.

El plan representa una estrategia.

No una ejecución.

---

# 3. Planning Independence

Atlas no depende de un algoritmo específico de planificación.

Una implementación podrá utilizar:

- planificación jerárquica;
- planificación basada en objetivos;
- planificación reactiva;
- planificación probabilística;
- planificación híbrida;
- planificación multiagente;
- futuras estrategias aún no definidas.

Todas representan implementaciones válidas del mismo contrato.

---

# 4. Input

El Planning Engine recibe exclusivamente un Reasoning Result.

Nunca consulta directamente:

- Memory;
- Retrieval;
- Knowledge;
- Context Builder.

Toda la información requerida deberá encontrarse en el resultado del razonamiento.

---

# 5. Output

El resultado será un Execution Plan.

Conceptualmente contendrá:

- objetivos;
- tareas;
- dependencias;
- prioridades;
- restricciones;
- criterios de éxito;
- puntos de decisión.

El formato concreto podrá evolucionar sin afectar el contrato.

---

# 6. Planning Principles

Todo plan generado deberá cumplir los siguientes principios:

- coherencia;
- trazabilidad;
- modularidad;
- extensibilidad;
- independencia de ejecución.

El plan describe una estrategia.

Nunca constituye una acción ejecutada.

# 7. Planning Constraints

El Planning Engine deberá respetar las siguientes restricciones:

- no ejecutar tareas;
- no invocar herramientas;
- no coordinar agentes;
- no alterar políticas de gobernanza;
- no modificar conocimiento persistente.

Su responsabilidad concluye cuando produce un Execution Plan válido.

---

# 8. Optimization

Las implementaciones podrán optimizar los planes considerando factores como:

- costo;
- tiempo;
- complejidad;
- riesgo;
- disponibilidad de recursos;
- prioridades organizacionales.

La estrategia de optimización permanece abierta.

El contrato únicamente define el comportamiento esperado.

---

# 9. Relationship with Other Contracts

El Planning Engine consume información proveniente del:

- Reasoning Engine.

Y entrega resultados al:

- Workflow Engine.

Nunca interactúa directamente con:

- Agent Runtime;
- Memory Provider;
- Retrieval Provider.

La separación entre planificación y ejecución constituye un principio arquitectónico permanente.

---

# 10. Extensibility

Nuevos motores de planificación podrán añadirse sin modificar este contrato.

Ejemplos:

- Strategic Planning Engine;
- Agile Planning Engine;
- Project Planning Engine;
- Autonomous Planning Engine;
- Multi-Agent Planning Engine.

Todos deberán preservar el mismo comportamiento observable.

---

# 11. Diagnostics

Toda implementación deberá proporcionar información suficiente para auditoría.

Ejemplos:

- duración de la planificación;
- estrategia utilizada;
- número de tareas generadas;
- complejidad estimada;
- advertencias;
- restricciones aplicadas.

Estos diagnósticos pertenecen exclusivamente al plano operacional.

---

# 12. Success Criteria

Una implementación cumple este contrato cuando:

- transforma razonamiento en un plan estructurado;
- mantiene completamente desacoplada la planificación de la ejecución;
- produce planes trazables y verificables;
- permite sustituir el motor de planificación sin afectar el resto del sistema;
- permanece compatible con la Public API de Atlas.

Este contrato constituye la especificación oficial del componente Planning Engine dentro del ecosistema Atlas.

