---
id: ATLAS-205
title: Atlas REST API
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
  Definir el contrato oficial HTTP REST del ecosistema Atlas,
  estableciendo recursos, convenciones, versionado, autenticación
  y principios de interoperabilidad para todas las implementaciones.
---

# ATLAS-205 — REST API

> "El Engine piensa. La API comunica."

---

# 1. Purpose

La REST API constituye la interfaz HTTP oficial del ecosistema Atlas.

Su propósito consiste en permitir que aplicaciones, SDKs y servicios externos interactúen con Atlas mediante contratos estables, versionados y completamente documentados.

---

# 2. Responsibilities

La REST API SHALL:

- exponer recursos oficiales.
- implementar contratos HTTP.
- administrar autenticación.
- validar solicitudes.
- devolver respuestas normalizadas.
- preservar trazabilidad.
- respetar versionado.

La REST API SHALL NOT:

- contener lógica de negocio.
- almacenar conocimiento.
- ejecutar workflows directamente.
- modificar políticas.
- depender de un SDK específico.

---

# 3. Design Principles

## Resource Oriented

Toda operación se realizará sobre recursos del dominio Atlas.

---

## Stateless

Cada solicitud deberá contener toda la información necesaria para ser procesada.

---

## Versioned

Toda API oficial incluirá una versión explícita.

Ejemplo.

```
/api/v1/
```

---

## Consistent

Todos los recursos seguirán las mismas convenciones.

---

## Secure by Default

Toda comunicación utilizará HTTPS y autenticación obligatoria.

---

# 4. Base URL

Formato general.

```text
https://atlas.example.com/api/v1/
```

Toda implementación compatible deberá exponer una ruta equivalente.

---

# 5. Resource Model

Los recursos oficiales incluyen:

```text
/workspaces

/organizations

/users

/agents

/workflows

/context

/knowledge

/memory

/search

/retrieval

/prompts

/validation

/tools

/providers

/events
```

Las implementaciones podrán añadir recursos propios bajo espacios de nombres específicos.

---

# 6. HTTP Methods

Atlas utilizará los métodos HTTP estándar.

| Method | Purpose |
|---------|---------|
| GET | Consultar recursos |
| POST | Crear recursos o iniciar procesos |
| PUT | Reemplazar recursos |
| PATCH | Actualizar parcialmente |
| DELETE | Eliminar recursos |
| OPTIONS | Descubrir capacidades |

---

# 7. Standard Response

Toda respuesta seguirá una estructura consistente.

```json
{
  "success": true,
  "data": {},
  "metadata": {},
  "trace_id": "",
  "timestamp": ""
}
```

---

# 8. Error Response

Los errores utilizarán una estructura uniforme.

```json
{
  "success": false,
  "error": {
    "code": "",
    "message": "",
    "details": []
  },
  "trace_id": "",
  "timestamp": ""
}
```

---

# 9. Authentication

La API deberá soportar:

- API Keys
- OAuth 2.0
- JWT
- OpenID Connect
- Enterprise SSO

Toda solicitud autenticada deberá incluir las credenciales mediante mecanismos estándar HTTP.

# 10. Pagination

Los recursos que devuelvan colecciones deberán soportar paginación.

Parámetros estándar.

```text
?page=1

&page_size=25
```

Respuesta.

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 25,
    "total_items": 540,
    "total_pages": 22
  },
  "trace_id": ""
}
```

---

# 11. Filtering

Todos los recursos podrán soportar filtros.

Ejemplos.

```text
GET /agents?status=active

GET /knowledge?type=policy

GET /workflows?owner=luis

GET /events?severity=warning
```

Las implementaciones podrán añadir filtros específicos.

---

# 12. Sorting

La API soportará ordenamiento.

Ejemplos.

```text
?sort=name

?sort=-created_at

?sort=priority
```

El prefijo "-" indica orden descendente.

---

# 13. Idempotency

Las operaciones críticas deberán soportar Idempotency Keys.

Cabecera recomendada.

```text
Idempotency-Key:
```

Esto evita ejecuciones duplicadas por reintentos.

---

# 14. HTTP Status Codes

Atlas utilizará códigos HTTP estándar.

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 202 | Accepted |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

No deberán utilizarse códigos propietarios.

---

# 15. API Versioning

Las versiones deberán expresarse en la URI.

Ejemplo.

```text
/api/v1/
/api/v2/
```

Las versiones anteriores deberán mantenerse según la política oficial de compatibilidad.

---

# 16. Observability

Toda solicitud deberá poder registrar:

- request_id;
- trace_id;
- correlation_id;
- timestamp;
- authenticated user;
- execution duration;
- endpoint;
- response status.

Esta información facilitará auditoría y diagnóstico.

---

# 17. OpenAPI Specification

Toda implementación oficial deberá publicar una especificación OpenAPI.

Ejemplo.

```text
/openapi.json

/openapi.yaml
```

La documentación podrá generarse automáticamente a partir de esta especificación.

---

# 18. Extensibility

Las implementaciones podrán incorporar:

- nuevos recursos;
- nuevos filtros;
- nuevas estrategias de autenticación;
- nuevos formatos de respuesta;
- nuevos encabezados HTTP.

Toda extensión deberá preservar compatibilidad con el contrato oficial.

---

# 19. Compliance

Una implementación será compatible con Atlas REST API cuando:

- implemente los recursos oficiales;
- respete las convenciones HTTP;
- mantenga compatibilidad con los contratos publicados;
- preserve trazabilidad;
- implemente autenticación soportada;
- publique una especificación OpenAPI válida.

---

# 20. Related Documents

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
- ATLAS-201 — SDK CLI
- ATLAS-202 — SDK TypeScript
- ATLAS-203 — SDK Python
- ATLAS-204 — SDK Events
- ATLAS-206 — GraphQL API
- ATLAS-207 — Webhooks

---

# 21. Change History

| Version | Date | Description |
|----------|------------|---------------------------------------------|
| 1.0.0 | 2026-07-13 | Initial REST API specification. |

---

# Final Statement

La REST API constituye el contrato HTTP oficial del ecosistema Atlas.

Su responsabilidad consiste en exponer los recursos, capacidades y servicios del Atlas Engine mediante una interfaz consistente, versionada y completamente documentada, preservando la independencia entre clientes e implementación.

La REST API no contiene lógica de negocio.

No implementa inteligencia.

No sustituye al Engine.

Representa el mecanismo estándar de interoperabilidad entre Atlas y cualquier aplicación, servicio o plataforma externa.

Gracias a esta separación, Atlas garantiza estabilidad, compatibilidad y evolución continua sin comprometer las integraciones existentes, permitiendo que múltiples SDK, herramientas y clientes compartan un único contrato oficial de comunicación.

