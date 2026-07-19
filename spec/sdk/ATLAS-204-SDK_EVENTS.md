---
id: ATLAS-204
title: SDK Events
version: 1.0.0
status: draft
owner: Atlas SDK Board
classification: public
sdk_version: 1.0
created: 2026-07-16
last_updated: 2026-07-16
purpose: >
  Definir el modelo oficial de eventos del ecosistema Atlas,
  estableciendo el contrato mediante el cual el Compiler,
  Runtime, SDK, CLI, Plugins y demás componentes comunican
  hechos relevantes durante su ejecución.
---

# ATLAS-204 — SDK Events

> "Everything important that happens in Atlas becomes an event."

---

# 1. Purpose

Este documento define el modelo oficial de eventos del ecosistema Atlas.

Los eventos representan hechos ocurridos durante la operación del Kernel y constituyen el mecanismo estándar de comunicación entre componentes desacoplados.

Todo componente del ecosistema podrá producir y consumir eventos mediante contratos públicos.

---

# 2. Scope

El modelo de eventos aplica a.

- Compiler;
- Runtime;
- SDK;
- CLI;
- Plugins;
- Agents;
- Workflows;
- Publishers;
- Providers;
- Observability.

Todos los componentes comparten un lenguaje común de eventos.

---

# 3. Event Philosophy

Atlas considera un evento como un hecho histórico.

Un evento representa algo que ya ocurrió.

Los eventos nunca representan comandos.

Los eventos nunca modifican el estado del dominio.

Su función consiste en informar.

---

# 4. Design Principles

Todo evento SHALL cumplir.

- inmutabilidad;
- tipado fuerte;
- identificador único;
- trazabilidad;
- orden temporal;
- serialización.

Los eventos deberán poder almacenarse y reproducirse.

---

# 5. Event Architecture

```text
Component

↓

Event

↓

Event Bus

↓

Subscribers

↓

Handlers
```

Los productores desconocen quién consume los eventos.

---

# 6. Event Lifecycle

Todo evento sigue el ciclo.

```text
Created

↓

Published

↓

Delivered

↓

Processed

↓

Archived
```

Cada transición SHALL ser observable.

---

# 7. Event Structure

Todo evento deberá contener como mínimo.

```text
EventId

EventType

Timestamp

Source

Version

CorrelationId

Payload

Metadata
```

La estructura SHALL permanecer estable entre versiones compatibles.

---

# 8. Event Categories

Atlas clasifica los eventos por dominio.

```text
Compiler Events

Runtime Events

Knowledge Events

Memory Events

Retrieval Events

Prompt Events

Workflow Events

Agent Events

Plugin Events

Publisher Events

System Events
```

Cada categoría define su propio conjunto de eventos especializados.

---

# 9. Event Naming

Los nombres SHALL seguir el patrón.

```text
<Resource>.<Action>
```

Ejemplos.

```text
compiler.started

compiler.completed

workflow.started

workflow.completed

agent.created

runtime.failed

plugin.installed
```

La nomenclatura deberá ser consistente en todo el ecosistema.

---

# 10. Event Versioning

Todo evento SHALL incluir versión.

```text
1.0

1.1

2.0
```

Los consumidores podrán manejar múltiples versiones simultáneamente.

---

# 11. Event Metadata

Todo evento podrá transportar metadatos adicionales.

Ejemplos.

- usuario;
- workspace;
- organización;
- entorno;
- etiquetas;
- origen.

Los metadatos nunca modificarán el significado del evento.

---

# 12. Event Ordering

Cuando exista dependencia temporal, los eventos deberán preservar el orden de publicación.

Cuando no exista dependencia, el sistema podrá procesarlos en paralelo.

---

# 13. Event Delivery

Atlas no impone una implementación específica de transporte.

Los eventos podrán distribuirse mediante.

- memoria;
- colas;
- brokers;
- WebSockets;
- HTTP;
- gRPC.

El contrato permanece independiente de la infraestructura.

---

# 14. Event Bus

El Event Bus constituye el mecanismo oficial de distribución de eventos dentro del ecosistema Atlas.

Su responsabilidad consiste en desacoplar productores y consumidores de eventos.

```text
Producer

↓

Event Bus

↓

Subscribers
```

El Event Bus no implementa lógica de negocio.

Su única responsabilidad consiste en transportar eventos.

---

# 15. Event Publishers

Todo componente podrá actuar como Publisher.

Ejemplos.

```text
Compiler

Runtime

Workflow Engine

Agent Runtime

Memory Engine

Plugin System
```

Los Publishers únicamente generan eventos.

Nunca conocen quién los consume.

---

# 16. Event Subscribers

Todo componente podrá suscribirse a eventos.

Ejemplos.

```text
Logger

Metrics

Tracing

Notification System

Plugin

Workflow

Agent

Dashboard
```

Los Subscribers procesan eventos de forma independiente.

---

# 17. Event Handlers

Los Event Handlers encapsulan la lógica asociada a un evento.

Ejemplo.

```text
Event

↓

Handler

↓

Action
```

Cada Handler SHALL tener una única responsabilidad.

---

# 18. Standard Events

Atlas define un conjunto oficial de eventos compartidos.

## Compiler

```text
compiler.started

compiler.completed

compiler.failed

compiler.validated

compiler.published
```

## Runtime

```text
runtime.started

runtime.stopped

runtime.failed

runtime.restarted
```

## Knowledge

```text
knowledge.created

knowledge.updated

knowledge.deleted

knowledge.indexed
```

## Memory

```text
memory.stored

memory.updated

memory.deleted

memory.expired
```

## Retrieval

```text
retrieval.started

retrieval.completed

retrieval.failed
```

## Prompt

```text
prompt.compiled

prompt.validated

prompt.executed
```

## Workflow

```text
workflow.started

workflow.paused

workflow.resumed

workflow.completed

workflow.failed
```

## Agent

```text
agent.created

agent.started

agent.reasoned

agent.delegated

agent.completed

agent.failed
```

## Plugin

```text
plugin.installed

plugin.updated

plugin.loaded

plugin.unloaded

plugin.removed
```

## Publisher

```text
publisher.started

publisher.completed

publisher.failed
```

---

# 19. Event Correlation

Eventos relacionados deberán compartir un mismo Correlation ID.

Ejemplo.

```text
Workflow

↓

Agent

↓

Compiler

↓

Publisher
```

Todos los eventos generados durante la misma operación podrán reconstruirse posteriormente.

---

# 20. Event Replay

El modelo soporta reproducción de eventos.

Capacidades.

- auditoría;
- diagnóstico;
- depuración;
- reconstrucción de estado;
- análisis histórico.

El Replay SHALL respetar el orden original de publicación.

---

# 21. Event Persistence

La persistencia de eventos dependerá de la implementación.

Podrán utilizarse.

- memoria;
- archivos;
- bases de datos;
- brokers;
- sistemas distribuidos.

El contrato no depende del mecanismo de almacenamiento.

---

# 22. Observability Integration

Todos los eventos podrán integrarse con herramientas de observabilidad.

Ejemplos.

- OpenTelemetry;
- Jaeger;
- Grafana;
- Prometheus;
- Elastic;
- Datadog.

La observabilidad consume eventos.

Nunca modifica el dominio.

---

# 23. Event Security

Todo evento SHALL respetar las políticas de seguridad.

Incluyendo.

- autenticación;
- autorización;
- auditoría;
- privacidad;
- clasificación.

Los eventos nunca deberán exponer información sensible sin autorización.

---

# 24. Performance

El sistema de eventos deberá diseñarse para.

- procesamiento asíncrono;
- alta concurrencia;
- bajo acoplamiento;
- mínima latencia;
- escalabilidad horizontal.

La arquitectura no deberá bloquear la ejecución del Kernel.

---

# 25. Related Documents

## Foundation

- ATLAS-000 — README
- ATLAS-010 — Platform Mapping

## Architecture

- ATLAS-ARCH-003 — Compiler Architecture
- ATLAS-ARCH-006 — Build Compilation Pipeline

## Domain

- ATLAS-DOM-004 — Memory Domain
- ATLAS-DOM-007 — Workflow Domain
- ATLAS-DOM-008 — Agent Domain
- ATLAS-DOM-009 — Runtime Domain

## SDK

- ATLAS-200 — SDK Overview
- ATLAS-201 — SDK CLI
- ATLAS-202 — SDK TypeScript
- ATLAS-203 — SDK Python

---

# 26. Implementation Mapping

Este documento será implementado principalmente en.

```text
packages/

events/
│
├── Event.ts
├── EventBus.ts
├── EventPublisher.ts
├── EventSubscriber.ts
├── EventHandler.ts
├── EventRegistry.ts
├── EventDispatcher.ts
├── EventStore.ts
│
├── handlers/
├── publishers/
├── subscribers/
├── serialization/
├── transport/
├── adapters/
├── tracing/
├── metrics/
└── index.ts
```

El paquete `events` constituye una infraestructura transversal compartida por todo el ecosistema Atlas.

---

# 27. Cursor Implementation Checklist

```text
□ Implementar Event

□ Implementar Event Bus

□ Implementar Event Dispatcher

□ Implementar Publisher

□ Implementar Subscriber

□ Implementar Handler

□ Implementar Registry

□ Implementar Correlation ID

□ Implementar Event Store

□ Implementar Replay

□ Implementar Serialización

□ Implementar Logging

□ Integrar OpenTelemetry

□ Integrar Compiler

□ Integrar Runtime

□ Integrar Workflow Engine

□ Integrar Agent Runtime

□ Agregar pruebas unitarias

□ Documentar catálogo oficial de eventos
```

---

# Change History

| Version | Date | Description |
|----------|------------|------------------------------------------|
| 1.0.0 | 2026-07-16 | Initial SDK Events specification. |

---

# Final Statement

El modelo de eventos constituye el mecanismo oficial de comunicación del ecosistema Atlas.

Su propósito es garantizar que todos los componentes del Kernel, incluyendo el Compiler, Runtime, SDKs, CLI, Plugins, Agents y Workflows, puedan intercambiar información mediante eventos tipados, inmutables y desacoplados, preservando la trazabilidad, la observabilidad y la escalabilidad del sistema.

Al establecer un contrato común para la publicación y el consumo de eventos, Atlas asegura que la evolución del ecosistema pueda realizarse sin introducir dependencias directas entre sus componentes, manteniendo una arquitectura modular, extensible y preparada para sistemas distribuidos.

