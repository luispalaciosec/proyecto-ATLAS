---
id: ATLAS-201
title: SDK CLI
version: 1.0.0
status: draft
owner: Atlas SDK Board
classification: public
sdk_version: 1.0
created: 2026-07-16
last_updated: 2026-07-16
purpose: >
  Definir la interfaz oficial de línea de comandos (CLI)
  del ecosistema Atlas, estableciendo los comandos,
  contratos y comportamiento esperado para interactuar
  con el Compiler y el Runtime.
---

# ATLAS-201 — SDK CLI

> "The CLI is the primary human interface to the Atlas Kernel."

---

# 1. Purpose

Este documento define la interfaz oficial de línea de comandos del ecosistema Atlas.

El CLI constituye la puerta de entrada principal para desarrolladores, automatizaciones y herramientas externas que interactúan con el Kernel.

Su responsabilidad consiste en exponer una interfaz estable, consistente y desacoplada de la implementación interna.

---

# 2. Scope

El SDK CLI permite interactuar con.

- Compiler;
- Runtime;
- Knowledge;
- Workflows;
- Agents;
- Projects;
- Plugins;
- Publishers.

No implementa lógica de negocio.

No contiene reglas de dominio.

Actúa como consumidor del Kernel.

---

# 3. Design Principles

El CLI SHALL cumplir los siguientes principios.

- simplicidad;
- consistencia;
- composabilidad;
- automatización;
- estabilidad;
- extensibilidad.

Todo comando deberá ser predecible.

---

# 4. Architecture

```text
Developer

↓

CLI

↓

SDK

↓

Compiler

↓

Runtime

↓

Kernel
```

El CLI nunca accede directamente a paquetes internos.

Toda interacción ocurre mediante la API pública del SDK.

---

# 5. Command Structure

Todo comando seguirá la estructura.

```text
atlas <resource> <action> [options]
```

Ejemplos.

```text
atlas build

atlas validate

atlas publish

atlas workflow run

atlas agent execute

atlas memory inspect

atlas plugin install
```

---

# 6. Global Options

Todos los comandos soportarán.

```text
--help

--version

--verbose

--debug

--json

--yaml

--config

--workspace

--profile

--no-color
```

Estas opciones deberán comportarse de forma consistente en todo el CLI.

---

# 7. Command Categories

El CLI organiza los comandos por dominios.

```text
Compiler

Runtime

Knowledge

Memory

Prompt

Workflow

Agent

Plugin

Project

Publisher
```

Cada categoría constituye un módulo independiente.

---

# 8. Core Commands

El CLI expone un conjunto de comandos oficiales organizados por dominio.

## Project

```text
atlas init
atlas create
atlas doctor
atlas info
atlas config
```

## Compiler

```text
atlas build

atlas compile

atlas validate

atlas clean

atlas watch
```

## Runtime

```text
atlas run

atlas stop

atlas status

atlas monitor
```

## Knowledge

```text
atlas knowledge list

atlas knowledge import

atlas knowledge export

atlas knowledge validate
```

## Context

```text
atlas context show

atlas context resolve

atlas context validate
```

## Memory

```text
atlas memory inspect

atlas memory clear

atlas memory export

atlas memory statistics
```

## Prompt

```text
atlas prompt validate

atlas prompt compile

atlas prompt render

atlas prompt test
```

## Workflow

```text
atlas workflow run

atlas workflow validate

atlas workflow graph

atlas workflow list
```

## Agent

```text
atlas agent list

atlas agent run

atlas agent inspect

atlas agent validate
```

## Plugin

```text
atlas plugin install

atlas plugin remove

atlas plugin update

atlas plugin list
```

## Publisher

```text
atlas publish

atlas deploy

atlas release
```

---

# 9. Execution Flow

Todo comando SHALL seguir el mismo flujo interno.

```text
CLI

↓

Parse Arguments

↓

Load Configuration

↓

Resolve Workspace

↓

Initialize SDK

↓

Execute Command

↓

Generate Output

↓

Exit
```

El comportamiento SHALL ser consistente para todos los comandos.

---

# 10. Exit Codes

Atlas define códigos oficiales.

| Code | Meaning |
|-------|---------|
| 0 | Success |
| 1 | General Error |
| 2 | Invalid Arguments |
| 3 | Validation Error |
| 4 | Configuration Error |
| 5 | Compilation Error |
| 6 | Runtime Error |
| 7 | Plugin Error |
| 8 | Internal Error |

Todo comando SHALL finalizar utilizando estos códigos.

---

# 11. Output Formats

El CLI soporta múltiples formatos de salida.

```text
Human

JSON

YAML

Markdown
```

Ejemplos.

```bash
atlas build --json

atlas validate --yaml

atlas doctor --markdown
```

La salida estructurada está destinada a automatizaciones y herramientas externas.

---

# 12. Configuration

El CLI obtiene configuración desde múltiples fuentes.

Orden de precedencia.

```text
CLI Arguments

↓

Environment Variables

↓

atlas.config.*

↓

Workspace Configuration

↓

Default Values
```

La precedencia SHALL ser determinística.

---

# 13. Workspace Discovery

Todo comando intenta localizar automáticamente un Workspace Atlas.

Orden de búsqueda.

```text
Current Directory

↓

Parent Directories

↓

Explicit Path (--workspace)

↓

Global Configuration
```

Si no existe Workspace, el CLI devuelve un error controlado.

---

# 14. Logging

Todos los comandos producen eventos de ejecución.

Niveles soportados.

```text
Trace

Debug

Info

Warning

Error

Fatal
```

El nivel se controla mediante configuración o parámetros.

---

# 15. Error Handling

Todo error SHALL incluir.

- código;
- mensaje;
- causa;
- sugerencia de resolución.

Ejemplo.

```text
ATLAS-COMPILER-001

Knowledge Graph contains unresolved references.

Suggestion:

Run:

atlas validate
```

El CLI nunca expondrá excepciones internas sin procesar.

---

# 16. Plugin Integration

Los Plugins pueden registrar nuevos comandos.

```text
Plugin

↓

Command Registration

↓

CLI Registry

↓

Execution
```

El Kernel controla el ciclo de vida de los plugins.

---

# 17. SDK Integration

El CLI interactúa exclusivamente con la API pública del SDK.

```text
CLI

↓

Atlas SDK

↓

Compiler

↓

Runtime
```

Nunca invoca paquetes internos directamente.

---

# 18. Runtime Integration

Los comandos de ejecución utilizan el Runtime.

Ejemplos.

```text
atlas run

atlas workflow run

atlas agent run
```

El Runtime administra la ejecución.

El CLI únicamente inicia la operación.

---

# 19. Compiler Integration

Los comandos de compilación utilizan el Compiler.

```text
atlas build

atlas compile

atlas validate

atlas publish
```

Toda compilación ocurre dentro del Compiler.

---

# 20. Security

El CLI SHALL respetar.

- autenticación;
- autorización;
- permisos;
- aislamiento;
- auditoría.

Nunca almacenará credenciales en texto plano.

---

# 21. Related Documents

## Foundation

- ATLAS-000 — README
- ATLAS-010 — Platform Mapping

## Architecture

- ATLAS-ARCH-003 — Compiler Architecture
- ATLAS-ARCH-006 — Build Compilation Pipeline

## Domain

- ATLAS-DOM-007 — Workflow Domain
- ATLAS-DOM-008 — Agent Domain
- ATLAS-DOM-009 — Runtime Domain

## Engine

- ATLAS-100 — Engine
- ATLAS-107 — Agent Runtime
- ATLAS-108 — Workflow Engine

---

# 22. Implementation Mapping

Este documento será implementado principalmente en.

```text
packages/

cli/
│
├── application/
│
├── commands/
│
├── registry/
│
├── parsers/
│
├── output/
│
├── logging/
│
├── configuration/
│
├── plugins/
│
├── services/
│
└── index.ts
```

---

# 23. Cursor Implementation Checklist

```text
□ Implementar Parser

□ Implementar Command Registry

□ Implementar Output Renderer

□ Implementar Logger

□ Implementar Configuration Loader

□ Implementar Workspace Discovery

□ Implementar Error Handler

□ Implementar Plugin Loader

□ Integrar Atlas SDK

□ Integrar Compiler

□ Integrar Runtime

□ Soportar JSON

□ Soportar YAML

□ Soportar Markdown

□ Agregar Tests

□ Publicar paquete CLI
```

---

# Change History

| Version | Date | Description |
|----------|------------|------------------------------------------|
| 1.0.0 | 2026-07-16 | Initial SDK CLI specification. |

---

# Final Statement

El SDK CLI constituye la interfaz oficial de línea de comandos del ecosistema Atlas.

Su propósito es proporcionar una experiencia consistente, estable y extensible para interactuar con el Compiler, el Runtime y el resto de los dominios mediante una API pública desacoplada de la implementación interna.

El CLI actúa como un consumidor del Kernel, nunca como propietario de la lógica de negocio, garantizando que toda operación sea ejecutada a través de los contratos oficiales del SDK y preservando la separación entre la experiencia del desarrollador y la arquitectura interna del sistema.

