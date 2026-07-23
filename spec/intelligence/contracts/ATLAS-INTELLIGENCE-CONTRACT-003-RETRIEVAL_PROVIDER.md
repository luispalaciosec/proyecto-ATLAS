---
id: ATLAS-INTELLIGENCE-CONTRACT-003
title: Retrieval Provider Contract
status: approved
version: 1.0.0
owner: Atlas Architecture
category: Intelligence
layer: Contract
created: 2026-07-20
updated: 2026-07-20

depends_on:
  - ATLAS-INTELLIGENCE-003
  - ATLAS-INTELLIGENCE-CONTRACT-002
---

# Retrieval Provider Contract

---

# 1. Purpose

El Retrieval Provider constituye la abstracción responsable de localizar y recuperar el conocimiento más relevante para una determinada intención.

No almacena conocimiento.

No modifica conocimiento.

No genera razonamiento.

Su única responsabilidad consiste en encontrar la información correcta en el momento adecuado.

---

# 2. Responsibility

Toda implementación del Retrieval Provider deberá permitir:

- localizar información relevante;
- ordenar resultados;
- aplicar filtros;
- eliminar ruido;
- priorizar evidencia;
- entregar resultados listos para el Context Builder.

El contrato no prescribe una técnica específica de recuperación.

---

# 3. Retrieval Independence

Atlas no depende de un algoritmo concreto.

Una implementación podrá utilizar:

- búsqueda léxica;
- búsqueda semántica;
- búsqueda híbrida;
- recorrido sobre grafos;
- recuperación basada en embeddings;
- recuperación contextual;
- recuperación jerárquica;
- recuperación multimodal.

Todas representan implementaciones válidas del mismo contrato.

---

# 4. Query Model

El Retrieval Provider opera sobre consultas conceptuales.

Una consulta puede contener:

- intención;
- entidades;
- restricciones;
- contexto parcial;
- filtros;
- preferencias;
- límites de recuperación.

La representación concreta queda a criterio de la implementación.

---

# 5. Ranking

Los resultados recuperados deberán entregarse ordenados por relevancia.

La estrategia de ranking podrá considerar:

- similitud semántica;
- proximidad estructural;
- relaciones del Knowledge Graph;
- actualidad;
- frecuencia;
- confianza;
- políticas organizacionales.

El contrato no impone una fórmula específica.

---

# 6. Retrieval Result

Toda recuperación produce una colección de elementos relevantes.

Cada resultado deberá conservar suficiente información para que el Context Builder pueda:

- identificar su origen;
- comprender su significado;
- evaluar su calidad;
- integrarlo dentro del contexto cognitivo.

# 7. Filtering Policy

Toda implementación deberá permitir filtrar resultados.

Ejemplos:

- dominio;
- workspace;
- organización;
- usuario;
- versión;
- estado;
- idioma;
- clasificación.

Los filtros representan restricciones declarativas.

Nunca alteran el conocimiento almacenado.

---

# 8. Retrieval Quality

El Retrieval Provider deberá optimizar simultáneamente dos objetivos:

## Precision

Recuperar únicamente información relevante.

---

## Recall

Evitar omitir información importante.

Cada implementación podrá equilibrar ambos objetivos según el contexto de ejecución.

---

# 9. Relationship with Other Contracts

El Retrieval Provider consume información desde:

- Memory Provider.

Y produce resultados para:

- Context Builder.

Nunca interactúa directamente con:

- Reasoning Engine;
- Planning Engine;
- Agent Runtime.

Su responsabilidad termina una vez entregados los resultados recuperados.

---

# 10. Extensibility

Nuevas estrategias de recuperación podrán incorporarse sin modificar este contrato.

Ejemplos:

- Hybrid Retrieval Provider;
- Graph Retrieval Provider;
- Enterprise Retrieval Provider;
- Local Retrieval Provider;
- Federated Retrieval Provider;
- Multimodal Retrieval Provider.

Todas deberán preservar el mismo comportamiento observable.

---

# 11. Diagnostics

Toda implementación deberá exponer información suficiente para observabilidad.

Ejemplos:

- tiempo de búsqueda;
- número de resultados;
- estrategia utilizada;
- puntuaciones de relevancia;
- fuentes consultadas;
- advertencias de recuperación.

Estos diagnósticos pertenecen al plano operacional.

No forman parte del conocimiento recuperado.

---

# 12. Success Criteria

Una implementación cumple este contrato cuando:

- recupera conocimiento relevante;
- desacopla completamente la estrategia de búsqueda del almacenamiento;
- permite múltiples algoritmos de recuperación;
- entrega resultados ordenados y verificables;
- preserva trazabilidad de las fuentes;
- permanece compatible con la Public API de Atlas.

Este contrato constituye la especificación oficial del componente Retrieval Provider dentro del ecosistema Atlas.

