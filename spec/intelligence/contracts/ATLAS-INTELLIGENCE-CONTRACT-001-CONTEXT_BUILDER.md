---
id: ATLAS-INTELLIGENCE-CONTRACT-001
title: Context Builder Contract
status: approved
version: 1.0.0
owner: Atlas Architecture
category: Intelligence
layer: Contract
created: 2026-07-20
updated: 2026-07-20

depends_on:
  - ATLAS-INTELLIGENCE-004
  - ATLAS-INTELLIGENCE-100
---

# Context Builder Contract

---

# 1. Purpose

El Context Builder es el componente responsable de construir el contexto cognitivo que utilizará el Intelligence Engine.

Su objetivo consiste en transformar múltiples fuentes de información dispersas en un único Context Package coherente.

No razona.

No planifica.

No toma decisiones.

Únicamente prepara el mejor contexto posible para que otros motores cognitivos puedan operar.

---

# 2. Responsibility

El Context Builder deberá:

- recibir una intención de trabajo;
- identificar las fuentes relevantes;
- recopilar información necesaria;
- eliminar ruido;
- resolver conflictos simples;
- producir un Context Package consistente.

Nunca deberá ejecutar inferencias complejas.

Nunca deberá modificar el conocimiento original.

---

# 3. Inputs

El contrato acepta información proveniente de múltiples dominios.

Ejemplos:

- User Request
- Workspace
- Knowledge Objects
- Memory
- Conversation History
- Agent State
- Workflow State
- Runtime Metadata
- Environment
- Policies

El origen de los datos es irrelevante.

Todos serán normalizados antes del ensamblaje.

---

# 4. Output

El resultado del Context Builder será un único objeto denominado:

Context Package

Conceptualmente contiene:

- objetivo;
- información relevante;
- restricciones;
- entidades;
- relaciones;
- memoria recuperada;
- contexto conversacional;
- metadatos de ejecución.

Este objeto constituye la entrada oficial del motor de razonamiento.

---

# 5. Context Assembly Pipeline

La construcción del contexto ocurre mediante etapas claramente definidas.

Pipeline conceptual:

Intent

↓

Normalization

↓

Source Discovery

↓

Retrieval

↓

Filtering

↓

Conflict Resolution

↓

Ranking

↓

Assembly

↓

Context Package

Cada etapa deberá ser reemplazable sin modificar el contrato público.

---

# 6. Determinism

Dado el mismo conjunto de entradas y la misma configuración del sistema, el Context Builder deberá producir un Context Package equivalente.

La implementación podrá variar.

El comportamiento observable deberá mantenerse estable.

La reproducibilidad constituye un requisito arquitectónico del contrato.

# 7. Public Contract

Toda implementación del Context Builder deberá garantizar las siguientes capacidades:

- construir contexto;
- enriquecer contexto;
- validar contexto;
- medir calidad del contexto;
- reportar diagnósticos;
- entregar un Context Package listo para consumo.

El contrato no prescribe cómo se implementan estas capacidades.

Solo define el comportamiento esperado.

---

# 8. Lifecycle

El ciclo de vida del Context Builder comprende las siguientes fases:

1. Recepción de la solicitud.
2. Descubrimiento de fuentes.
3. Recuperación de información.
4. Integración de resultados.
5. Validación.
6. Publicación del Context Package.

Cada fase podrá generar eventos internos para auditoría y observabilidad.

---

# 9. Error Model

El Context Builder nunca deberá detener el flujo completo del Intelligence Engine por la ausencia de una fuente de información.

Deberá clasificar los errores en categorías como:

- fuente no disponible;
- información insuficiente;
- conflicto de datos;
- contexto degradado;
- contexto inválido.

Siempre que sea posible deberá producir un contexto parcial acompañado de diagnósticos.

---

# 10. Extensibility

Nuevos mecanismos de construcción de contexto podrán incorporarse sin modificar este contrato.

Ejemplos:

- recuperación semántica;
- recuperación híbrida;
- búsqueda multimodal;
- contexto geográfico;
- contexto temporal;
- contexto organizacional;
- contexto colaborativo.

El contrato permanece estable independientemente del número de estrategias disponibles.

---

# 11. Relationship with Other Contracts

El Context Builder consume información proveniente de:

- Memory Provider;
- Retrieval Provider;
- Governance Provider.

Y entrega resultados a:

- Reasoning Engine;
- Planning Engine;
- Agent Runtime.

Nunca deberá depender directamente de implementaciones concretas.

Solo de contratos públicos.

---

# 12. Success Criteria

Una implementación cumple este contrato cuando:

- genera un Context Package consistente;
- integra múltiples fuentes de información;
- mantiene comportamiento determinista;
- produce diagnósticos verificables;
- desacopla completamente la construcción del contexto de los motores cognitivos posteriores;
- puede evolucionar sin romper la Public API.

Este contrato constituye la especificación oficial para cualquier implementación del Context Builder dentro del ecosistema Atlas.

