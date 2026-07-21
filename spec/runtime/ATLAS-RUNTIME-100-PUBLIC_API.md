---
id: ATLAS-RUNTIME-100
title: Runtime Public API
status: approved
version: 1.0.0
owner: Atlas Architecture
category: Runtime
layer: Public API
created: 2026-07-20
updated: 2026-07-20

depends_on:
  - ATLAS-RUNTIME-001
  - ATLAS-RUNTIME-009
---

# Runtime Public API

---

# 1. Purpose

Este documento constituye la especificación oficial de la API pública del módulo Runtime.

Define los componentes que podrán ser utilizados por otros módulos del ecosistema Atlas.

Toda implementación del paquete **@atlas/runtime** deberá respetar esta superficie pública.

La API pública constituye un contrato estable.

Las implementaciones internas podrán evolucionar libremente siempre que esta API permanezca compatible.

---

# 2. Public Responsibilities

El Runtime expone capacidades relacionadas exclusivamente con la coordinación de ejecuciones.

Conceptualmente la API pública permite:

- iniciar ejecuciones;
- consultar ejecuciones;
- administrar el ciclo de vida;
- observar estados;
- consultar eventos;
- administrar tareas;
- obtener resultados.

Nunca expone detalles internos del Pipeline.

---

# 3. Public Surface

La API pública del Runtime se organiza conceptualmente en los siguientes grupos.

Execution API

Lifecycle API

Task API

Workflow API

Event API

Diagnostics API

Cada grupo representa una responsabilidad claramente definida.

---

# 4. Execution API

La Execution API representa el punto oficial para iniciar ejecuciones.

Conceptualmente permitirá:

- crear una ejecución;
- iniciar una ejecución;
- cancelar una ejecución;
- consultar estado;
- obtener resultado.

No expone detalles internos del Runtime.

---

# 5. Lifecycle API

La Lifecycle API administra la evolución temporal de una ejecución.

Conceptualmente permitirá:

- suspender;
- reanudar;
- finalizar;
- archivar;
- consultar historial.

El control interno continúa perteneciendo al Runtime.

---

# 6. Task API

La Task API permite observar las tareas asociadas a una ejecución.

Conceptualmente permitirá:

- listar tareas;
- consultar estado;
- obtener resultados;
- consultar dependencias.

Nunca ejecuta tareas directamente.

Toda ejecución permanece bajo responsabilidad del Runtime.

# 7. Workflow API

La Workflow API expone información relacionada con los workflows generados durante una ejecución.

Conceptualmente permitirá:

- consultar workflows;
- obtener progreso;
- consultar etapas completadas;
- recuperar información operacional.

No expone mecanismos internos de coordinación.

---

# 8. Event API

La Event API permite acceder al flujo observable de eventos generado por el Runtime.

Conceptualmente permitirá:

- consultar eventos;
- filtrar eventos;
- suscribirse a eventos;
- recuperar historial.

El modelo de eventos permanece definido por ATLAS-RUNTIME-002.

---

# 9. Diagnostics API

La Diagnostics API proporciona información útil para monitoreo y análisis operacional.

Conceptualmente podrá exponer:

- métricas;
- tiempos;
- trazas;
- errores;
- advertencias;
- estadísticas de ejecución.

Nunca modifica el comportamiento funcional del Runtime.

---

# 10. Compatibility Rules

Toda implementación del paquete **@atlas/runtime** deberá preservar las siguientes garantías.

Compatibilidad hacia atrás.

Estabilidad semántica.

Desacoplamiento respecto de implementaciones internas.

Consistencia con el resto del ecosistema Atlas.

La API pública constituye el único punto oficial de integración con el Runtime.

---

# 11. Evolution Policy

La API pública podrá evolucionar únicamente mediante versiones controladas.

Toda modificación deberá respetar las políticas de versionado establecidas por Atlas.

Las implementaciones podrán agregar capacidades nuevas sin romper compatibilidad con consumidores existentes.

---

# 12. Success Criteria

La Runtime Public API cumple su propósito cuando:

- define claramente la superficie pública del módulo Runtime;
- desacopla consumidores de implementaciones internas;
- preserva estabilidad evolutiva;
- mantiene consistencia con Knowledge, Intelligence y SDK;
- soporta crecimiento incremental del ecosistema;
- constituye la referencia oficial para toda integración con el Runtime.

Este documento constituye la especificación oficial de la API pública del módulo Runtime de Atlas.