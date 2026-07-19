---
id: ATLAS-203
title: SDK Python
version: 1.0.0
status: draft
owner: Atlas SDK Board
classification: public
sdk_version: 1.0
created: 2026-07-16
last_updated: 2026-07-16
purpose: >
  Definir el SDK oficial de Python del ecosistema Atlas,
  estableciendo la API pública mediante la cual aplicaciones,
  scripts, servicios y herramientas basadas en Python
  interactúan con el Kernel de Atlas.
---

# ATLAS-203 — SDK Python

> "Python enables Atlas to participate in the broader AI ecosystem."

---

# 1. Purpose

Este documento define el SDK oficial de Python del ecosistema Atlas.

El SDK proporciona una interfaz estable para que aplicaciones, herramientas de automatización, notebooks, servicios y agentes desarrollados en Python puedan consumir las capacidades del Kernel de Atlas.

Toda interacción con Atlas desde Python deberá realizarse mediante este SDK.

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

El SDK no implementa lógica del dominio.

Consume exclusivamente la API pública del Kernel.

---

# 3. Design Principles

El SDK SHALL respetar los siguientes principios.

- simplicidad;
- tipado explícito;
- estabilidad;
- legibilidad;
- extensibilidad;
- compatibilidad con el ecosistema Python.

Toda API deberá seguir las convenciones oficiales del lenguaje.

---

# 4. Architecture

```text
Python Application

↓

Atlas Python SDK

↓

Compiler

↓

Runtime

↓

Atlas Kernel
```

El SDK representa la única interfaz soportada para aplicaciones Python.

---

# 5. Responsibilities

El SDK es responsable de.

- exponer la API pública;
- administrar configuración;
- validar parámetros;
- simplificar la integración;
- encapsular la comunicación con el Kernel.

No reemplaza al Compiler.

No reemplaza al Runtime.

---

# 6. Supported Environments

El SDK soportará oficialmente.

- Python 3.11+
- Linux
- macOS
- Windows

Podrá utilizarse desde.

- aplicaciones;
- scripts;
- notebooks;
- servidores;
- herramientas CLI;
- frameworks de IA.

---

# 7. Installation

La distribución oficial SHALL realizarse mediante PyPI.

Ejemplo.

```bash
pip install atlas-sdk
```

También podrá instalarse mediante.

```bash
poetry add atlas-sdk

uv add atlas-sdk

pipenv install atlas-sdk
```

La distribución oficial será publicada en PyPI.

---

# 8. Entry Point

Toda aplicación inicia mediante un único punto de entrada.

```python
from atlas import Atlas
```

La clase `Atlas` constituye la fachada oficial del SDK.

---

# 9. Client Creation

La creación del cliente sigue un modelo uniforme.

```python
from atlas import Atlas

atlas = Atlas(
    workspace="./atlas",
    profile="default"
)
```

La configuración podrá obtenerse desde archivos, variables de entorno o parámetros explícitos.

---

# 10. Configuration

El SDK soporta múltiples mecanismos de configuración.

- código;
- archivos;
- variables de entorno;
- perfiles;
- configuración dinámica.

La precedencia SHALL ser consistente con el SDK de TypeScript y con el CLI.

---

# 11. Type System

El SDK utilizará tipado estático mediante `typing`.

Ejemplo.

```python
from typing import Optional

def compile(workspace: str) -> bool:
    ...
```

Todas las entidades públicas deberán estar correctamente tipadas.

---

# 12. Error Model

Toda excepción SHALL derivar de una jerarquía común.

Ejemplo.

```text
AtlasError

├── CompilerError

├── RuntimeError

├── ValidationError

├── ConfigurationError

└── PluginError
```

Los errores incluirán.

- código;
- mensaje;
- contexto;
- sugerencia de resolución.

---

# 13. Async Support

El SDK soportará operaciones síncronas y asíncronas.

Ejemplo.

```python
await atlas.compiler.build()

await atlas.workflow.run()

await atlas.agent.run()
```

Toda operación de larga duración deberá disponer de una versión asíncrona.

```
---

# 14. Public API

El SDK expone una única fachada pública.

```python
from atlas import Atlas

atlas = Atlas()
```

La instancia proporciona acceso a todos los módulos oficiales del Kernel.

```python
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

Las aplicaciones nunca deberán acceder directamente a paquetes internos.

---

# 15. Compiler Module

El módulo Compiler expone las operaciones oficiales de compilación.

Ejemplos.

```python
atlas.compiler.build()

atlas.compiler.compile()

atlas.compiler.validate()

atlas.compiler.publish()

atlas.compiler.watch()
```

Toda compilación SHALL ejecutarse mediante este módulo.

---

# 16. Runtime Module

El Runtime administra la ejecución de artefactos compilados.

Ejemplos.

```python
atlas.runtime.start()

atlas.runtime.execute()

atlas.runtime.stop()

atlas.runtime.status()
```

El Runtime únicamente ejecuta artefactos previamente compilados.

---

# 17. Knowledge Module

El módulo Knowledge proporciona acceso al Knowledge Graph.

Ejemplos.

```python
atlas.knowledge.find()

atlas.knowledge.search()

atlas.knowledge.import_data()

atlas.knowledge.export()
```

El SDK nunca modifica directamente el grafo.

Consume los contratos del Knowledge Domain.

---

# 18. Memory Module

El módulo Memory administra la memoria del ecosistema.

Ejemplos.

```python
atlas.memory.store()

atlas.memory.retrieve()

atlas.memory.forget()

atlas.memory.statistics()
```

Las políticas de memoria permanecen dentro del dominio correspondiente.

---

# 19. Workflow Module

El módulo Workflow permite ejecutar procesos definidos en Atlas.

Ejemplos.

```python
atlas.workflow.run()

atlas.workflow.validate()

atlas.workflow.pause()

atlas.workflow.resume()
```

Toda ejecución ocurre mediante el Runtime.

---

# 20. Agent Module

El módulo Agent expone la API oficial para agentes.

Ejemplos.

```python
atlas.agent.run()

atlas.agent.plan()

atlas.agent.reason()

atlas.agent.delegate()

atlas.agent.observe()
```

Los agentes representan entidades del dominio.

No modelos de IA específicos.

---

# 21. Plugin Module

El SDK soporta la instalación y administración de Plugins.

Ejemplos.

```python
atlas.plugin.install()

atlas.plugin.remove()

atlas.plugin.list()

atlas.plugin.update()
```

La carga de Plugins SHALL realizarse mediante contratos públicos.

---

# 22. Event System

El SDK proporciona un sistema oficial de eventos.

Ejemplo.

```python
atlas.on("build.completed")

atlas.on("workflow.started")

atlas.on("agent.finished")

atlas.on("runtime.error")
```

Todos los eventos deberán estar tipados y documentados.

---

# 23. Dependency Injection

El SDK soporta inversión de dependencias.

Ejemplo.

```python
atlas = Atlas(

    compiler=compiler,

    runtime=runtime,

    publisher=publisher,

    logger=logger
)
```

Toda implementación podrá sustituirse mediante contratos.

---

# 24. AI Ecosystem Integration

El SDK está diseñado para integrarse con el ecosistema moderno de IA.

Ejemplos.

- LangChain
- LlamaIndex
- CrewAI
- AutoGen
- OpenAI SDK
- Anthropic SDK
- Google GenAI SDK

Estas integraciones SHALL implementarse mediante adaptadores, preservando la independencia del Kernel.

---

# 25. Observability

El SDK soporta observabilidad integrada.

Capacidades.

- logging;
- métricas;
- tracing;
- eventos;
- diagnóstico.

La observabilidad podrá integrarse con OpenTelemetry y otras plataformas.

---

# 26. Versioning

Toda API pública SHALL seguir Semantic Versioning.

```text
MAJOR.MINOR.PATCH
```

Las versiones incompatibles requerirán incremento de versión mayor.

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
- ATLAS-202 — SDK TypeScript

---

# 28. Implementation Mapping

Este documento será implementado principalmente en.

```text
packages/

sdk-python/
│
├── atlas/
│   ├── __init__.py
│   ├── atlas.py
│   ├── compiler.py
│   ├── runtime.py
│   ├── knowledge.py
│   ├── context.py
│   ├── memory.py
│   ├── retrieval.py
│   ├── prompt.py
│   ├── workflow.py
│   ├── agent.py
│   ├── plugin.py
│   ├── publisher.py
│   │
│   ├── events/
│   ├── adapters/
│   ├── providers/
│   ├── configuration/
│   ├── exceptions/
│   ├── types/
│   └── utils/
│
├── pyproject.toml
└── README.md
```

---

# 29. Cursor Implementation Checklist

```text
□ Crear paquete atlas

□ Implementar clase Atlas

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

□ Implementar sistema de eventos

□ Implementar configuración

□ Implementar manejo uniforme de excepciones

□ Publicar paquete en PyPI

□ Agregar pruebas unitarias

□ Generar documentación oficial
```

---

# Change History

| Version | Date | Description |
|----------|------------|------------------------------------------|
| 1.0.0 | 2026-07-16 | Initial Python SDK specification. |

---

# Final Statement

El SDK de Python constituye la interfaz oficial del ecosistema Atlas para aplicaciones y herramientas desarrolladas en Python.

Su propósito es ofrecer una API estable, idiomática y completamente tipada que permita consumir las capacidades del Kernel de Atlas respetando las convenciones del lenguaje y manteniendo una separación estricta entre la lógica de dominio y las implementaciones de infraestructura.

Al compartir la misma arquitectura conceptual que el SDK de TypeScript, ambos SDKs garantizan una experiencia consistente para los desarrolladores, independientemente del lenguaje utilizado, fortaleciendo la visión de Atlas como un ecosistema multiplataforma y extensible.