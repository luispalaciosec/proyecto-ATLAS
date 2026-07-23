---
id: ATLAS-INTELLIGENCE-CONTRACT-004
title: Reasoning Engine Contract
status: approved
version: 1.0.0
owner: Atlas Architecture
category: Intelligence
layer: Contract
created: 2026-07-20
updated: 2026-07-20

depends_on:
  - ATLAS-INTELLIGENCE-005
  - ATLAS-INTELLIGENCE-CONTRACT-001
---

# Reasoning Engine Contract

---

# 1. Purpose

El Reasoning Engine constituye la abstracción responsable de transformar contexto en criterio.

Su función consiste en analizar un Context Package y producir conclusiones estructuradas que sirvan de base para la planificación.

No ejecuta acciones.

No coordina workflows.

No interactúa con herramientas externas.

Su única responsabilidad consiste en razonar.

---

# 2. Responsibility

Toda implementación del Reasoning Engine deberá ser capaz de:

- comprender el contexto disponible;
- identificar relaciones relevantes;
- evaluar evidencia;
- generar inferencias;
- detectar inconsistencias;
- producir conclusiones justificables.

Nunca deberá ejecutar planes ni modificar el conocimiento persistente.

---

# 3. Reasoning Independence

Atlas no depende de un mecanismo específico de razonamiento.

Una implementación podrá utilizar:

- modelos fundacionales (LLMs);
- motores simbólicos;
- sistemas basados en reglas;
- motores probabilísticos;
- razonamiento híbrido;
- razonamiento determinista;
- futuros mecanismos aún no definidos.

Todas representan implementaciones válidas del mismo contrato.

---

# 4. Input

El Reasoning Engine recibe exclusivamente un Context Package.

No consulta directamente:

- Memory;
- Retrieval;
- Knowledge;
- Workflow;
- Agents.

Toda la información necesaria deberá encontrarse dentro del contexto recibido.

Esta separación garantiza el desacoplamiento arquitectónico.

---

# 5. Output

El resultado del Reasoning Engine será un Reasoning Result.

Conceptualmente contendrá:

- conclusiones;
- hipótesis;
- evidencia utilizada;
- nivel de confianza;
- restricciones detectadas;
- incertidumbres;
- recomendaciones para la siguiente etapa.

El formato interno podrá evolucionar sin modificar el contrato.

---

# 6. Explainability

Toda conclusión producida deberá poder justificarse.

El motor deberá conservar suficiente información para explicar:

- por qué llegó a una conclusión;
- qué evidencia utilizó;
- qué alternativas descartó;
- qué incertidumbres permanecen.

La capacidad de explicación constituye un requisito arquitectónico obligatorio.

# 7. Reasoning Constraints

El Reasoning Engine deberá respetar las siguientes restricciones:

- no modificar el conocimiento persistente;
- no ejecutar acciones externas;
- no interactuar directamente con herramientas;
- no alterar políticas de gobernanza;
- no iniciar workflows.

Su responsabilidad termina al producir un Reasoning Result.

---

# 8. Determinism

Cuando la implementación sea determinista, iguales entradas deberán producir iguales resultados.

Cuando la implementación sea probabilística, deberá permitir mecanismos de control que favorezcan la reproducibilidad cuando el contexto operativo lo requiera.

El contrato no obliga a un único modelo de ejecución.

---

# 9. Relationship with Other Contracts

El Reasoning Engine consume información proveniente del:

- Context Builder.

Y entrega resultados al:

- Planning Engine.

Nunca deberá interactuar directamente con:

- Memory Provider;
- Retrieval Provider;
- Workflow Engine;
- Agent Runtime.

El flujo cognitivo permanece estrictamente secuencial.

---

# 10. Extensibility

Nuevos motores de razonamiento podrán incorporarse sin modificar este contrato.

Ejemplos:

- Symbolic Reasoning Engine;
- LLM Reasoning Engine;
- Hybrid Reasoning Engine;
- Rule-Based Reasoning Engine;
- Strategic Reasoning Engine;
- Domain-Specific Reasoning Engine.

Todos deberán preservar el comportamiento observable definido por esta especificación.

---

# 11. Diagnostics

Toda implementación deberá proporcionar información suficiente para auditoría.

Ejemplos:

- duración del razonamiento;
- estrategia utilizada;
- confianza global;
- número de inferencias generadas;
- advertencias;
- errores de razonamiento.

Estos diagnósticos pertenecen al plano operacional y nunca forman parte del conocimiento persistente.

---

# 12. Success Criteria

Una implementación cumple este contrato cuando:

- transforma contexto en conclusiones útiles;
- mantiene completamente desacoplado el razonamiento de la planificación;
- produce resultados explicables;
- preserva la trazabilidad de la evidencia;
- permite sustituir el motor de razonamiento sin modificar el resto de la arquitectura;
- permanece compatible con la Public API de Atlas.

Este contrato constituye la especificación oficial del componente Reasoning Engine dentro del ecosistema Atlas.

