---
id: ATLAS-207
title: Atlas Webhooks
version: 1.0.0
status: draft
owner: Atlas Core Team
classification: public
foundation_version: 1.0
engine_version: 1.0
sdk_version: 1.0
api_version: v1
created: 2026-07-13
last_updated: 2026-07-13
purpose: >
  Definir el contrato oficial de Webhooks del ecosistema Atlas,
  estableciendo el modelo de eventos, entrega, seguridad y
  suscripción para todas las implementaciones compatibles.
---

# ATLAS-207 — Webhooks

> "Los eventos cuentan lo que ocurrió. Nunca ordenan lo que debe ocurrir."

---

# 1. Purpose

Los Webhooks constituyen el mecanismo oficial de comunicación asíncrona del ecosistema Atlas.

Su propósito consiste en notificar a sistemas externos sobre eventos relevantes ocurridos dentro del Engine, preservando consistencia, trazabilidad y desacoplamiento.

---

# 2. Responsibilities

El sistema de Webhooks SHALL:

- publicar eventos oficiales.
- entregar eventos suscritos.
- garantizar trazabilidad.
- firmar las solicitudes.
- soportar reintentos.
- registrar auditoría.

El sistema SHALL NOT:

- ejecutar lógica de negocio.
- modificar eventos.
- garantizar entrega exactamente una vez.
- depender de un proveedor específico.

---

# 3. Design Principles

## Event Driven

Toda comunicación representa un hecho ocurrido.

---

## Immutable Events

Los eventos publicados nunca podrán modificarse.

---

## At Least Once Delivery

Los eventos podrán reenviarse cuando sea necesario.

---

## Secure by Default

Toda entrega deberá verificarse mediante firmas.

---

## Provider Independent

La implementación será independiente de la infraestructura utilizada.

---

# 4. Webhook Lifecycle

```text
Domain Event

↓

Event Validation

↓

Webhook Resolution

↓

Delivery Queue

↓

HTTP Delivery

↓

Acknowledgement

↓

Audit Log
```

Todo evento seguirá este ciclo.

---

# 5. Event Model

Todo Webhook representa un evento del dominio Atlas.

Ejemplos.

```text
workflow.created

workflow.started

workflow.completed

workflow.failed

agent.created

agent.updated

knowledge.created

knowledge.updated

validation.completed

search.executed
```

Las implementaciones podrán definir eventos adicionales dentro de sus propios espacios de nombres.

---

# 6. Subscription Model

Toda suscripción incluirá como mínimo:

```yaml
subscription:

id:

endpoint:

enabled:

events:

secret:

retry_policy:

status:

metadata:
```

---

# 7. Event Payload

Todo evento seguirá una estructura consistente.

```json
{
  "id": "",
  "event": "",
  "version": "1.0",
  "occurred_at": "",
  "organization_id": "",
  "workspace_id": "",
  "resource": {},
  "trace_id": "",
  "metadata": {}
}
```

---

# 8. Delivery

Los eventos serán enviados mediante HTTP POST.

Cabeceras recomendadas.

```text
Content-Type: application/json

X-Atlas-Event

X-Atlas-Signature

X-Atlas-Delivery

X-Atlas-Trace-Id
```

---

# 9. Security

Toda entrega deberá soportar mecanismos de autenticación.

Ejemplos.

- HMAC SHA-256
- Signed Headers
- JWT
- Mutual TLS (opcional)

La validación de la firma será responsabilidad del consumidor.

# 10. Retry Policy

Las implementaciones deberán soportar políticas configurables de reintento.

Ejemplo.

```text
Maximum Retries

Retry Interval

Exponential Backoff

Maximum Retry Window
```

Cada intento deberá registrarse para fines de auditoría.

---

# 11. Idempotency

Los consumidores deberán asumir que un mismo evento puede recibirse más de una vez.

Cada evento incluirá un identificador único.

```text
event.id
```

Este identificador permitirá detectar entregas duplicadas.

---

# 12. HTTP Response Codes

Los consumidores deberán responder utilizando códigos HTTP estándar.

| Code | Meaning |
|------|---------|
| 200 | Evento procesado correctamente |
| 202 | Evento aceptado para procesamiento |
| 400 | Solicitud inválida |
| 401 | Firma inválida |
| 403 | Acceso denegado |
| 404 | Endpoint inexistente |
| 409 | Evento duplicado |
| 429 | Límite de solicitudes excedido |
| 500 | Error interno del consumidor |
| 503 | Servicio temporalmente no disponible |

Las respuestas 5xx podrán activar la política de reintentos.

---

# 13. Event Versioning

Todo evento incluirá una versión explícita.

Ejemplo.

```json
{
  "event": "workflow.completed",
  "version": "1.0"
}
```

Las nuevas versiones deberán preservar compatibilidad siempre que sea posible.

---

# 14. Observability

Toda entrega deberá registrar:

- event_id;
- event_type;
- delivery_id;
- trace_id;
- correlation_id;
- destination_endpoint;
- response_code;
- execution_duration;
- retry_count;
- delivery_status.

Estos datos deberán integrarse con el sistema oficial de observabilidad de Atlas.

---

# 15. CloudEvents Compatibility

Las implementaciones podrán ofrecer compatibilidad con la especificación CNCF CloudEvents.

La representación deberá mantener equivalencia semántica con el modelo oficial de Atlas.

---

# 16. Extensibility

Las implementaciones podrán incorporar:

- nuevos eventos;
- nuevos mecanismos de autenticación;
- nuevos algoritmos de firma;
- nuevas políticas de reintento;
- nuevos adaptadores de transporte.

Toda extensión deberá preservar compatibilidad con el contrato oficial.

---

# 17. Compliance

Una implementación será compatible con Atlas Webhooks cuando:

- publique eventos oficiales;
- preserve inmutabilidad;
- implemente entrega "at least once";
- soporte autenticación mediante firma;
- registre auditoría completa;
- preserve trazabilidad extremo a extremo.

---

# 18. Related Documents

Foundation

- ATLAS-001 — Manifesto
- ATLAS-002 — Constitution
- ATLAS-003 — Principles
- ATLAS-004 — Domain Model
- ATLAS-005 — Boundaries
- ATLAS-006 — Governance
- ATLAS-007 — Decision Model
- ATLAS-008 — Ontology
- ATLAS-009 — Glossary
- ATLAS-010 — Platform Mapping

Domain

- ATLAS-DOM-000 — Domain Overview

Engine

- ATLAS-100 — Engine
- ATLAS-101 — Context Engine
- ATLAS-102 — Knowledge Engine
- ATLAS-103 — Memory Engine
- ATLAS-104 — Search Engine
- ATLAS-105 — Retrieval Engine
- ATLAS-106 — Prompt Engine
- ATLAS-107 — Agent Runtime
- ATLAS-108 — Workflow Engine
- ATLAS-109 — Validation Engine
- ATLAS-110 — Context Planner

SDK

- ATLAS-200 — SDK Overview
- ATLAS-205 — REST API
- ATLAS-206 — GraphQL API

---

# 19. Change History

| Version | Date | Description |
|----------|------------|--------------------------------------------|
| 1.0.0 | 2026-07-13 | Initial Webhooks specification. |

---

# Final Statement

Los Webhooks constituyen el mecanismo oficial de comunicación asíncrona del ecosistema Atlas.

Su responsabilidad consiste en notificar de forma segura, trazable y confiable los eventos producidos por el Atlas Engine, permitiendo la integración desacoplada con aplicaciones, plataformas y servicios externos.

Los Webhooks no ejecutan comandos.

No implementan lógica de negocio.

No contienen inteligencia.

Representan la proyección de los eventos del dominio Atlas hacia el exterior, preservando la integridad del modelo, la auditabilidad y la interoperabilidad entre implementaciones.

Gracias a esta arquitectura basada en eventos, Atlas puede integrarse con ecosistemas distribuidos, automatizar procesos y sincronizar información sin comprometer la independencia entre productores y consumidores de eventos.