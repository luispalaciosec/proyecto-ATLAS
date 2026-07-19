---
id: ATLAS-106
title: Atlas Prompt Engine
version: 1.0.0
status: draft
owner: Atlas Core Team
classification: public
foundation_version: 1.0
engine_version: 1.0
created: 2026-07-13
last_updated: 2026-07-13
purpose: >
  Definir el Prompt Engine, el componente responsable de transformar
  un Context Package estructurado en instrucciones optimizadas para
  cualquier modelo de lenguaje compatible con Atlas.
---

# ATLAS-106 — Prompt Engine

> "Los modelos ejecutan prompts. Atlas compila inteligencia."

---

# 1. Purpose

El Prompt Engine constituye el componente responsable de convertir un Context Package en un Prompt Package listo para ser ejecutado por un modelo de inteligencia artificial.

El Prompt Engine no genera conocimiento.

No toma decisiones.

No interpreta políticas.

Su responsabilidad consiste únicamente en compilar instrucciones utilizando los contratos definidos por Atlas.

---

# 2. Responsibilities

El Prompt Engine SHALL:

- recibir un Context Package.
- ensamblar instrucciones.
- aplicar plantillas.
- respetar políticas.
- optimizar el presupuesto de tokens.
- adaptar el formato al proveedor.
- producir un Prompt Package.
- preservar trazabilidad.

El Prompt Engine SHALL NOT:

- ejecutar modelos.
- modificar conocimiento.
- recuperar información.
- interpretar lenguaje natural.
- cambiar políticas organizacionales.

---

# 3. Design Principles

## Context First

Todo Prompt deberá originarse a partir de un Context Package válido.

---

## Provider Agnostic

El Prompt Engine nunca dependerá de un proveedor específico.

---

## Deterministic Compilation

Con las mismas entradas deberá producir exactamente el mismo Prompt Package.

---

## Explainable Prompt

Todo Prompt deberá poder explicar:

- qué evidencia utilizó.
- qué políticas aplicó.
- qué plantilla utilizó.
- qué versión del compilador utilizó.

---

## Minimal Prompt

El Prompt deberá contener únicamente la información necesaria.

Nunca información redundante.

---

# 4. Prompt Lifecycle

```text
Context Package

↓

Template Selection

↓

Instruction Assembly

↓

Policy Injection

↓

Token Optimization

↓

Provider Adaptation

↓

Prompt Package
```

Todo Prompt seguirá este ciclo.

---

# 5. Internal Architecture

```text
Prompt Engine

│

├── Template Registry

├── Instruction Builder

├── Policy Injector

├── Token Optimizer

├── Provider Adapter

└── Prompt Compiler
```

Cada componente posee una responsabilidad única.

---

# 6. Core Components

## Template Registry

Mantiene las plantillas oficiales utilizadas para construir prompts.

---

## Instruction Builder

Convierte el Context Package en instrucciones estructuradas.

---

## Policy Injector

Incorpora restricciones, normas y políticas obligatorias.

---

## Token Optimizer

Optimiza longitud y estructura respetando el Context Budget.

---

## Provider Adapter

Adapta el Prompt Package al formato requerido por cada modelo.

---

## Prompt Compiler

Produce el Prompt Package final.

---

# 7. Prompt Request

El Prompt Engine recibe el siguiente contrato.

```yaml
prompt_request:

context_package:

provider:

model:

profile:

policies:

context_budget:

metadata:
```

---

# 8. Prompt Package

El resultado oficial del Prompt Engine es:

```text
PromptPackage
```

Canonical Structure

```yaml
prompt_package_id:

provider:

model:

instructions:

system_prompt:

user_prompt:

tool_instructions:

policies:

estimated_tokens:

compiler_version:

generated_at:

metadata:
```

El Prompt Package constituye el contrato oficial entre Atlas y cualquier modelo compatible.

---

# 9. Prompt Templates

Toda compilación utilizará una plantilla registrada.

Ejemplos.

- Assistant Template
- Analyst Template
- Planner Template
- Research Template
- Coding Template
- Reviewer Template
- Executive Template

Las organizaciones podrán registrar plantillas propias respetando el contrato oficial.

# 10. Compilation Profiles

El Prompt Engine podrá utilizar diferentes perfiles de compilación.

## Balanced

Equilibra precisión, costo y longitud.

---

## Maximum Accuracy

Prioriza calidad sobre consumo de tokens.

---

## Low Cost

Reduce el tamaño del Prompt manteniendo la información esencial.

---

## Low Latency

Optimiza la velocidad de procesamiento.

---

## Deep Reasoning

Prioriza contexto, instrucciones y evidencia para tareas complejas.

---

## Custom

Las organizaciones podrán definir perfiles propios.

---

# 11. Provider Adaptation

Cada proveedor podrá requerir formatos distintos.

El Provider Adapter será responsable de traducir el Prompt Package al formato específico requerido.

Ejemplos.

```text
OpenAI

↓

Messages API

------------------

Anthropic

↓

Messages Format

------------------

Google Gemini

↓

Content Parts

------------------

Llama

↓

Chat Template

------------------

Mistral

↓

Instruction Format
```

La adaptación nunca modificará el significado del Prompt.

---

# 12. Prompt Validation

Antes de entregar un Prompt Package deberán verificarse:

- estructura válida.
- políticas aplicadas.
- plantilla registrada.
- presupuesto de tokens respetado.
- proveedor soportado.
- instrucciones consistentes.
- referencias completas.

Todo Prompt Package inválido deberá rechazarse.

---

# 13. Prompt Events

El Prompt Engine podrá emitir los siguientes eventos.

```text
PromptCompilationStarted

TemplateSelected

InstructionsAssembled

PoliciesInjected

TokensOptimized

ProviderAdapted

PromptValidated

PromptCompiled

PromptCompilationFailed
```

Todos los eventos deberán registrarse mediante el módulo de Observability.

---

# 14. Performance Requirements

El Prompt Engine deberá optimizar:

- tiempo de compilación.
- reutilización de plantillas.
- consumo de tokens.
- consistencia.
- independencia del proveedor.
- trazabilidad.

Las implementaciones podrán utilizar algoritmos propios de optimización siempre que respeten el contrato oficial.

---

# 15. Extensibility

Las implementaciones podrán incorporar:

- nuevos perfiles.
- nuevos Provider Adapters.
- nuevos optimizadores.
- nuevos compiladores.
- nuevos formatos de salida.

Toda extensión deberá preservar compatibilidad con Atlas.

---

# 16. Compliance

Una implementación será compatible con Atlas Prompt Engine cuando:

- implemente Prompt Request.
- produzca un Prompt Package válido.
- utilice plantillas registradas.
- preserve trazabilidad.
- mantenga independencia del proveedor.
- respete políticas.
- optimice el presupuesto de tokens.

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

Engine

- ATLAS-100 — Engine
- ATLAS-101 — Context Engine
- ATLAS-102 — Knowledge Engine
- ATLAS-103 — Memory Engine
- ATLAS-104 — Search Engine
- ATLAS-105 — Retrieval Engine
- ATLAS-107 — Agent Runtime
- ATLAS-108 — Workflow Engine
- ATLAS-109 — Validation Engine
- ATLAS-110 — Context Planner

---

# 18. Change History

| Version | Date | Description |
|----------|------------|--------------------------------------------|
| 1.0.0 | 2026-07-13 | Initial Prompt Engine specification. |

---

# Final Statement

El Prompt Engine constituye el compilador oficial entre la inteligencia organizacional de Atlas y los modelos de inteligencia artificial.

Su responsabilidad consiste en transformar un Context Package estructurado en un Prompt Package optimizado, reproducible y trazable, preservando la independencia tecnológica del ecosistema.

Los prompts no representan conocimiento.

No representan memoria.

No representan decisiones.

Representan únicamente la forma mediante la cual Atlas comunica su inteligencia a un motor de inferencia.

Gracias a esta separación, Atlas puede evolucionar independientemente de cualquier proveedor de IA, garantizando que el conocimiento, las políticas y el contexto permanezcan bajo control de la organización.

Los modelos cambian.

El conocimiento permanece.

Atlas traduce uno hacia el otro sin comprometer ninguno.

