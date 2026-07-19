---
id: ATLAS-200
title: Atlas SDK Overview
version: 1.0.0
status: draft
owner: Atlas Core Team
classification: public
foundation_version: 1.0
engine_version: 1.0
sdk_version: 1.0
created: 2026-07-13
last_updated: 2026-07-13
purpose: >
  Definir la arquitectura, principios y contratos generales del
  Software Development Kit (SDK) oficial de Atlas, proporcionando
  una interfaz consistente para que cualquier lenguaje de
  programación interactúe con el ecosistema Atlas.
---

# ATLAS-200 — SDK Overview

> "El Engine define la inteligencia. El SDK la hace accesible."

---

# 1. Purpose

El Atlas SDK constituye la interfaz oficial entre las aplicaciones y el ecosistema Atlas.

Su propósito consiste en proporcionar una experiencia consistente, tipada y segura para consumir las capacidades del Atlas Engine desde cualquier lenguaje de programación compatible.

El SDK no implementa la lógica del Engine.

Su responsabilidad consiste únicamente en exponer los contratos oficiales definidos por Atlas.

---

# 2. Responsibilities

El SDK SHALL:

- implementar los contratos oficiales.
- exponer clientes tipados.
- administrar autenticación.
- administrar sesiones.
- manejar errores.
- facilitar integración.
- mantener compatibilidad entre versiones.
- preservar trazabilidad.

El SDK SHALL NOT:

- contener lógica de negocio.
- modificar políticas.
- alterar contratos.
- almacenar conocimiento.
- ejecutar Workflows internamente.

---

# 3. Design Principles

## Contract First

Toda funcionalidad implementada por el SDK deberá derivarse de un contrato oficial de Atlas.

---

## Language Native

Cada SDK respetará las convenciones del lenguaje donde se implemente.

---

## Provider Independent

El SDK nunca dependerá de un proveedor específico de IA.

---

## Strongly Typed

Siempre que el lenguaje lo permita, el SDK utilizará tipos explícitos.

---

## Backward Compatible

Las versiones compatibles deberán minimizar cambios incompatibles.

---

## Secure by Default

Las configuraciones predeterminadas deberán priorizar seguridad y buenas prácticas.

---

# 4. SDK Architecture

```text
Application

↓

Atlas SDK

↓

Atlas API

↓

Atlas Engine

↓

Providers
```

El SDK constituye la única interfaz oficial entre las aplicaciones y Atlas.

---

# 5. SDK Modules

Todo SDK oficial podrá incluir los siguientes módulos.

```text
Authentication

Client

Context

Knowledge

Memory

Search

Workflow

Agent

Validation

Administration

Utilities
```

Cada implementación podrá distribuir estos módulos en paquetes independientes.

---

# 6. SDK Lifecycle

```text
Install

↓

Configure

↓

Authenticate

↓

Create Client

↓

Execute Operations

↓

Handle Results

↓

Close Session
```

Todo SDK seguirá este ciclo de uso.

---

# 7. Atlas Client

El punto de entrada oficial será el Atlas Client.

Ejemplo conceptual.

```text
Application

↓

Atlas Client

↓

Atlas Services

↓

Atlas Engine
```

El Atlas Client coordinará todos los servicios disponibles.

---

# 8. Client Services

El Atlas Client expondrá servicios especializados.

Ejemplos.

- Context Service
- Knowledge Service
- Memory Service
- Search Service
- Retrieval Service
- Agent Service
- Workflow Service
- Validation Service

Cada servicio implementará un contrato independiente.

---

# 9. Authentication

Todo SDK deberá soportar mecanismos estándar de autenticación.

Ejemplos.

- API Key
- OAuth 2.0
- OpenID Connect
- Service Accounts
- JWT
- Enterprise SSO

La implementación concreta dependerá del despliegue de Atlas.

# 10. Error Handling

Todo SDK deberá proporcionar un modelo consistente para el manejo de errores.

Las implementaciones deberán clasificar los errores al menos en las siguientes categorías.

```text
AuthenticationError

AuthorizationError

ValidationError

ContractError

PolicyError

NetworkError

TimeoutError

ProviderError

WorkflowError

InternalError
```

Los errores deberán incluir:

- código;
- mensaje;
- causa;
- contexto;
- identificador de trazabilidad;
- recomendaciones cuando sea posible.

---

# 11. Versioning

Todos los SDK oficiales seguirán Semantic Versioning.

```text
MAJOR.MINOR.PATCH
```

Las versiones deberán mantener compatibilidad con los contratos oficiales publicados por Atlas.

Toda ruptura de compatibilidad requerirá una nueva versión mayor.

---

# 12. Observability

El SDK deberá facilitar la integración con plataformas de observabilidad.

Ejemplos.

- Logging
- Metrics
- Distributed Tracing
- OpenTelemetry
- Audit Events

La instrumentación nunca modificará el comportamiento funcional del SDK.

---

# 13. Security

El SDK deberá implementar por defecto buenas prácticas de seguridad.

Entre ellas:

- almacenamiento seguro de credenciales;
- uso obligatorio de HTTPS;
- validación de certificados;
- protección contra replay attacks;
- renovación automática de tokens cuando sea posible;
- minimización de exposición de información sensible.

---

# 14. Reference Implementations

Atlas podrá publicar implementaciones oficiales para distintos lenguajes.

Ejemplos.

```text
Python

TypeScript

Java

.NET

Go

Rust
```

Todas deberán implementar exactamente los mismos contratos.

---

# 15. Extensibility

Las implementaciones podrán incorporar:

- nuevos clientes;
- nuevos módulos;
- nuevas estrategias de autenticación;
- nuevos adaptadores;
- nuevas utilidades.

Toda extensión deberá preservar compatibilidad con los contratos oficiales.

---

# 16. Compliance

Una implementación será compatible con Atlas SDK cuando:

- implemente los contratos oficiales;
- respete los principios definidos por Atlas;
- mantenga compatibilidad con el Engine;
- preserve trazabilidad;
- utilice autenticación soportada;
- exponga una API consistente con el resto de los SDK oficiales.

---

# 17. Related Documents

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

- ATLAS-201 — SDK CLI
- ATLAS-202 — SDK TypeScript
- ATLAS-203 — SDK Python
- ATLAS-204 — SDK Events
- ATLAS-205 — REST API
- ATLAS-206 — GraphQL API
- ATLAS-207 — Webhooks

---

# 18. Change History

| Version | Date | Description |
|----------|------------|--------------------------------------------|
| 1.0.0 | 2026-07-13 | Initial SDK Overview specification. |

---

# Final Statement

El Atlas SDK constituye la interfaz oficial entre las aplicaciones y el ecosistema Atlas.

Su responsabilidad consiste en exponer de manera consistente, segura y tipada las capacidades definidas por la especificación, permitiendo que desarrolladores de distintos lenguajes interactúen con Atlas sin conocer los detalles internos de su implementación.

El SDK no implementa inteligencia.

No contiene lógica de negocio.

No reemplaza al Engine.

Representa el contrato estable que conecta aplicaciones, servicios y desarrolladores con la inteligencia organizacional definida por Atlas.

Gracias a esta separación, Atlas puede evolucionar internamente sin romper las integraciones existentes, preservando estabilidad, compatibilidad y una experiencia uniforme para toda la comunidad de desarrolladores.