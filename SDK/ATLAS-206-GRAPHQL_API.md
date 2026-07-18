---
id: ATLAS-206
title: Atlas GraphQL API
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
  Definir el contrato oficial GraphQL del ecosistema Atlas,
  estableciendo el modelo de consultas, mutaciones,
  suscripciones y tipos compartidos para todas las
  implementaciones compatibles.
---

# ATLAS-206 — GraphQL API

> "REST organiza recursos. GraphQL organiza conocimiento."

---

# 1. Purpose

La GraphQL API constituye la interfaz oficial basada en GraphQL del ecosistema Atlas.

Su propósito consiste en permitir consultas flexibles, tipadas y eficientes sobre los recursos definidos por Atlas, preservando exactamente los mismos contratos funcionales que la REST API.

---

# 2. Responsibilities

La GraphQL API SHALL:

- exponer el Schema oficial.
- soportar Queries.
- soportar Mutations.
- soportar Subscriptions.
- validar solicitudes.
- preservar trazabilidad.
- respetar autenticación.
- mantener compatibilidad entre versiones.

La GraphQL API SHALL NOT:

- modificar contratos.
- contener lógica de negocio.
- ejecutar inteligencia.
- depender de un SDK específico.
- introducir capacidades exclusivas.

---

# 3. Design Principles

## Schema First

Toda implementación deberá partir del Schema oficial.

---

## Strong Typing

Todos los tipos deberán definirse explícitamente.

---

## Contract Consistency

Todo recurso GraphQL representará exactamente el mismo modelo definido por Atlas.

---

## Client Driven Queries

Los clientes solicitarán únicamente los datos necesarios.

---

## Provider Independent

La implementación será independiente de cualquier proveedor de IA.

---

# 4. Endpoint

Toda implementación deberá exponer un endpoint oficial.

```text
/graphql
```

---

# 5. Root Operations

Toda implementación deberá soportar.

```text
Query

Mutation

Subscription
```

---

# 6. Query

Las Queries permitirán consultar recursos.

Ejemplos.

```graphql
query {

  agents {

    id

    name

    status

  }

}
```

---

# 7. Mutation

Las Mutations modificarán el estado del sistema.

Ejemplo.

```graphql
mutation {

  createWorkflow(

    input: {}

  ) {

    id

    status

  }

}
```

---

# 8. Subscription

Las Subscriptions permitirán recibir eventos en tiempo real.

Ejemplo.

```graphql
subscription {

  workflowCompleted {

    workflowId

    completedAt

  }

}
```

---

# 9. Core Types

El Schema oficial incluirá tipos equivalentes a los recursos Atlas.

Ejemplos.

```text
Organization

Workspace

User

Agent

Workflow

Context

Knowledge

Memory

SearchResult

ValidationReport

Provider

Tool
```

Todos los tipos deberán derivarse del Domain Model oficial.


# 10. Input Types

Toda Mutation deberá recibir un Input Type explícito.

Ejemplo.

```graphql
input CreateWorkflowInput {

  name: String!

  description: String

  ownerId: ID!

}
```

No deberán utilizarse parámetros sueltos cuando exista un objeto de dominio equivalente.

---

# 11. Interfaces

Los tipos compartidos deberán implementarse mediante Interfaces.

Ejemplo.

```graphql
interface AtlasResource {

  id: ID!

  version: String!

  createdAt: DateTime!

  updatedAt: DateTime!

}
```

Todos los recursos oficiales podrán implementar esta interfaz.

---

# 12. Union Types

Cuando una operación pueda devolver distintos tipos de resultados, deberá utilizarse una Union.

Ejemplo.

```graphql
union SearchResult =

Knowledge

Workflow

Agent

Context
```

Esto permitirá representar resultados heterogéneos de forma tipada.

---

# 13. Error Handling

Toda respuesta deberá utilizar un modelo consistente de errores.

Categorías recomendadas.

```text
AuthenticationError

AuthorizationError

ValidationError

ContractError

PolicyError

ProviderError

WorkflowError

InternalError
```

Los errores deberán incluir:

- código;
- mensaje;
- causa;
- trace_id;
- metadata.

---

# 14. Pagination

Las consultas que devuelvan colecciones deberán soportar Cursor Pagination.

Ejemplo.

```graphql
query {

  agents(

    first: 20,

    after: "cursor"

  ) {

    edges {

      node {

        id

        name

      }

    }

    pageInfo {

      hasNextPage

      endCursor

    }

  }

}
```

Este mecanismo será el recomendado para implementaciones oficiales.

---

# 15. Observability

Toda operación deberá registrar como mínimo:

- operation_name;
- execution_time;
- trace_id;
- correlation_id;
- authenticated_user;
- variables;
- endpoint;
- response_status.

Esta información facilitará monitoreo y auditoría.

---

# 16. Introspection

Las implementaciones podrán ofrecer introspección del Schema.

En entornos sensibles podrá limitarse mediante políticas organizacionales.

Toda restricción deberá documentarse.

---

# 17. Extensibility

Las implementaciones podrán incorporar:

- nuevos tipos;
- nuevas Queries;
- nuevas Mutations;
- nuevas Subscriptions;
- nuevas directivas;
- nuevos scalars personalizados.

Toda extensión deberá preservar compatibilidad con el Schema oficial.

---

# 18. Compliance

Una implementación será compatible con Atlas GraphQL API cuando:

- implemente el Schema oficial;
- respete los contratos del Domain Model;
- preserve trazabilidad;
- soporte Query, Mutation y Subscription;
- mantenga autenticación soportada;
- garantice compatibilidad entre versiones.

---

# 19. Related Documents

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
- ATLAS-207 — Webhooks

---

# 20. Change History

| Version | Date | Description |
|----------|------------|-----------------------------------------------|
| 1.0.0 | 2026-07-13 | Initial GraphQL API specification. |

---

# Final Statement

La GraphQL API constituye la interfaz oficial basada en GraphQL del ecosistema Atlas.

Su responsabilidad consiste en ofrecer un modelo tipado, flexible y eficiente para consultar y operar sobre los recursos definidos por Atlas, preservando exactamente los mismos contratos funcionales establecidos por el Atlas Protocol.

La GraphQL API no implementa inteligencia.

No contiene lógica de negocio.

No sustituye al Engine.

Representa una implementación alternativa del Atlas Protocol orientada a clientes que requieren consultas declarativas, selección precisa de datos y comunicación eficiente.

Gracias a esta separación, Atlas permite que REST, GraphQL, SDKs y futuras implementaciones compartan un único modelo de dominio y un único contrato de interoperabilidad, garantizando consistencia, evolución controlada y compatibilidad a largo plazo.