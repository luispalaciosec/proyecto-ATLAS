---
id: ATLAS-202
title: SDK TypeScript
version: 1.0.0
status: draft
owner: Atlas SDK Board
classification: public
sdk_version: 1.0
created: 2026-07-16
last_updated: 2026-07-16
purpose: >
  Definir el SDK oficial de TypeScript del ecosistema Atlas,
  estableciendo la API pública mediante la cual aplicaciones,
  herramientas, plugins y servicios interactúan con el Kernel.
---

# ATLAS-202 — SDK TypeScript

> "The SDK is the public face of the Atlas Kernel."

---

# 1. Purpose

Este documento define el SDK oficial de TypeScript del ecosistema Atlas.

El SDK constituye la API pública utilizada por aplicaciones, servicios, herramientas y plugins para interactuar con el Kernel de Atlas.

Toda funcionalidad del Kernel deberá estar accesible mediante el SDK.

---

# 2. Scope

El SDK proporciona acceso a.

- Compiler;
- Runtime;
- Knowledge;
- Ontology;
- Context;
- Memory;
- Retrieval;
- Prompt;
- Workflow;
- Agent;
- Plugins;
- Publishers.

El SDK no implementa lógica de negocio.

Consume exclusivamente los contratos públicos del Kernel.

---

# 3. Design Principles

El SDK SHALL cumplir los siguientes principios.

- estabilidad;
- simplicidad;
- tipado fuerte;
- composabilidad;
- extensibilidad;
- independencia de infraestructura.

Toda API deberá ser consistente y predecible.

---

# 4. Architecture

```text
Application

↓

Atlas SDK

↓

Compiler

↓

Runtime

↓

Kernel
```

Las aplicaciones nunca interactúan directamente con los paquetes internos.

---

# 5. SDK Responsibilities

El SDK es responsable de.

- exponer la API pública;
- validar parámetros;
- administrar configuración;
- facilitar la integración;
- encapsular complejidad.

No reemplaza al Compiler.

No reemplaza al Runtime.

---

# 6. Public Modules

El SDK expone los siguientes módulos.

```text
Compiler

Runtime

Knowledge

Context

Memory

Retrieval

Prompt

Workflow

Agent

Plugin

Publisher
```

Cada módulo representa una capacidad oficial del Kernel.

---

# 7. SDK Entry Point

Toda aplicación inicia mediante un único punto de entrada.

```typescript
import { Atlas } from "@atlas/sdk";
```

El objeto `Atlas` constituye la fachada principal del SDK.

---

# 8. Client Creation

La creación del cliente SHALL seguir un patrón uniforme.

```typescript
const atlas = new Atlas({
    workspace: "./atlas",
    profile: "default"
});
```

La configuración podrá obtenerse desde archivos, variables de entorno o parámetros explícitos.

---

# 9. Configuration

El SDK admite configuración mediante.

- código;
- archivos;
- variables de entorno;
- perfiles;
- opciones dinámicas.

La precedencia SHALL ser consistente con el CLI.

---

# 10. Authentication

El SDK soportará múltiples mecanismos de autenticación.

Ejemplos.

- API Keys;
- OAuth;
- Tokens;
- Service Accounts.

La autenticación será responsabilidad de los adaptadores correspondientes.

---

# 11. Type Safety

Toda API SHALL estar completamente tipada.

No se permitirá el uso de tipos dinámicos cuando exista un contrato de dominio equivalente.

Los tipos publicados deberán derivarse de las entidades oficiales del Kernel.

---

# 12. Error Model

El SDK utilizará un modelo uniforme de errores.

Toda excepción deberá contener.

- código;
- mensaje;
- causa;
- contexto;
- sugerencia.

Los errores estarán alineados con los códigos definidos para el CLI.

---

# 13. Asynchronous Model

Todas las operaciones potencialmente costosas SHALL ser asíncronas.

Ejemplos.

- compilación;
- ejecución;
- publicación;
- recuperación;
- consultas externas.

La API utilizará `Promise` como mecanismo oficial.

---

# 14. Public API

El SDK expone una única fachada pública.

```typescript
const atlas = new Atlas();
```

La fachada proporciona acceso a todos los módulos oficiales del ecosistema.

```typescript
atlas.compiler

atlas.runtime

atlas.knowledge

atlas.context

atlas.memory

atlas.retrieval

atlas.prompt

atlas.workflow

atlas.agent

atlas.plugin

atlas.publisher
```

Las aplicaciones nunca interactúan directamente con implementaciones internas.

---

# 15. Compiler Module

El módulo Compiler expone las operaciones oficiales de compilación.

Ejemplos.

```typescript
await atlas.compiler.build();

await atlas.compiler.compile();

await atlas.compiler.validate();

await atlas.compiler.publish();

await atlas.compiler.watch();
```

Toda compilación SHALL ejecutarse mediante este módulo.

---

# 16. Runtime Module

El módulo Runtime administra la ejecución de artefactos compilados.

Ejemplos.

```typescript
await atlas.runtime.start();

await atlas.runtime.execute();

await atlas.runtime.stop();

await atlas.runtime.status();
```

El Runtime nunca modifica entidades del dominio.

---

# 17. Knowledge Module

El módulo Knowledge proporciona acceso al Knowledge Graph.

Ejemplos.

```typescript
await atlas.knowledge.find();

await atlas.knowledge.search();

await atlas.knowledge.import();

await atlas.knowledge.export();
```

Las consultas deberán respetar las políticas del dominio.

---

# 18. Memory Module

El módulo Memory administra la memoria del ecosistema.

Ejemplos.

```typescript
await atlas.memory.store();

await atlas.memory.retrieve();

await atlas.memory.forget();

await atlas.memory.statistics();
```

El SDK no implementa algoritmos de memoria.

Consume el Memory Domain.

---

# 19. Workflow Module

El módulo Workflow permite ejecutar procesos definidos en Atlas.

Ejemplos.

```typescript
await atlas.workflow.run();

await atlas.workflow.validate();

await atlas.workflow.pause();

await atlas.workflow.resume();
```

Toda ejecución ocurre mediante el Runtime.

---

# 20. Agent Module

El módulo Agent expone la API oficial para agentes.

Ejemplos.

```typescript
await atlas.agent.run();

await atlas.agent.plan();

await atlas.agent.reason();

await atlas.agent.delegate();

await atlas.agent.observe();
```

Los agentes representan entidades de dominio.

No modelos de IA.

---

# 21. Plugin Module

El SDK soporta extensibilidad mediante Plugins.

Ejemplos.

```typescript
await atlas.plugin.install();

await atlas.plugin.remove();

await atlas.plugin.list();

await atlas.plugin.update();
```

Los Plugins se comunican mediante contratos públicos.

---

# 22. Event System

Toda operación relevante genera eventos.

Ejemplos.

```typescript
atlas.on("build.completed");

atlas.on("workflow.started");

atlas.on("agent.finished");

atlas.on("runtime.error");
```

Los eventos SHALL ser tipados.

---

# 23. Dependency Injection

El SDK soporta inversión de dependencias.

Ejemplo.

```typescript
const atlas = new Atlas({

    compiler,

    runtime,

    publisher,

    logger
});
```

Las implementaciones podrán sustituirse sin modificar la API pública.

---

# 24. Provider Abstraction

Los proveedores externos se abstraen mediante adaptadores.

Ejemplos.

```text
OpenAI

Anthropic

Gemini

Ollama

GitHub

Slack

Notion
```

El SDK nunca depende directamente de un proveedor específico.

---

# 25. Observability

El SDK soporta observabilidad integrada.

Capacidades.

- logs;
- métricas;
- eventos;
- trazabilidad;
- diagnóstico.

La observabilidad podrá integrarse con herramientas externas.

---

# 26. Versioning

Toda API pública SHALL seguir Semantic Versioning.

```text
MAJOR.MINOR.PATCH
```

Los cambios incompatibles requieren incremento de versión mayor.

---

# 27. Related Documents

## Foundation

- ATLAS-000 — README
- ATLAS-001 — Manifesto
- ATLAS-002 — Constitution
- ATLAS-010 — Platform Mapping

## Architecture

- ATLAS-ARCH-002 — Package Architecture
- ATLAS-ARCH-003 — Compiler Architecture

## Domain

- ATLAS-DOM-008 — Agent Domain
- ATLAS-DOM-009 — Runtime Domain

## SDK

- ATLAS-200 — SDK Overview
- ATLAS-201 — SDK CLI

---

# 28. Implementation Mapping

Este documento será implementado principalmente en.

```text
packages/

sdk/
│
├── Atlas.ts
├── CompilerClient.ts
├── RuntimeClient.ts
├── KnowledgeClient.ts
├── ContextClient.ts
├── MemoryClient.ts
├── RetrievalClient.ts
├── PromptClient.ts
├── WorkflowClient.ts
├── AgentClient.ts
├── PluginClient.ts
├── PublisherClient.ts
│
├── configuration/
├── events/
├── providers/
├── adapters/
├── types/
├── errors/
└── index.ts
```

---

# 29. Cursor Implementation Checklist

```text
□ Crear clase Atlas

□ Implementar CompilerClient

□ Implementar RuntimeClient

□ Implementar KnowledgeClient

□ Implementar ContextClient

□ Implementar MemoryClient

□ Implementar RetrievalClient

□ Implementar PromptClient

□ Implementar WorkflowClient

□ Implementar AgentClient

□ Implementar PluginClient

□ Implementar PublisherClient

□ Implementar Event System

□ Implementar Dependency Injection

□ Crear tipos públicos

□ Implementar manejo uniforme de errores

□ Agregar pruebas unitarias

□ Publicar paquete @atlas/sdk
```

---

# Change History

| Version | Date | Description |
|----------|------------|------------------------------------------|
| 1.0.0 | 2026-07-16 | Initial TypeScript SDK specification. |

---

# Final Statement

El SDK de TypeScript constituye la API pública oficial del ecosistema Atlas para el entorno JavaScript y TypeScript.

Su objetivo es proporcionar una interfaz estable, completamente tipada y desacoplada que permita a aplicaciones, herramientas, servicios y plugins interactuar con el Kernel de Atlas mediante contratos consistentes, preservando la independencia entre la implementación interna y los consumidores del ecosistema.

El SDK actúa como la fachada oficial del Kernel, garantizando que toda interacción con el Compiler, el Runtime y los dominios fundamentales se realice a través de interfaces públicas, extensibles y compatibles con la evolución futura de Atlas.