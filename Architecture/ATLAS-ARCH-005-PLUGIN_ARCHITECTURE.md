---
id: ATLAS-ARCH-005
title: Plugin Architecture
version: 1.0.0
status: draft
owner: Atlas Architecture Board
classification: public
foundation_version: 1.0
architecture_version: 1.0
created: 2026-07-16
last_updated: 2026-07-16
purpose: >
  Definir la arquitectura oficial de extensibilidad de Atlas,
  estableciendo el modelo de plugins, los puntos de extensión,
  el descubrimiento dinámico de capacidades y las reglas que
  permiten evolucionar la plataforma sin modificar su núcleo.
---

# ATLAS-ARCH-005 — Runtime Architecture

> "The kernel provides the platform. Plugins provide the capabilities."

---

# 1. Purpose

Este documento define la arquitectura oficial de plugins del ecosistema Atlas.

Su propósito consiste en establecer cómo nuevas capacidades pueden incorporarse al sistema sin modificar el núcleo de la plataforma.

Toda extensión oficial SHALL implementarse mediante el modelo descrito en este documento.

---

# 2. Scope

La presente arquitectura aplica a todos los mecanismos de extensibilidad de Atlas.

Incluye.

- Compiler Plugins
- Generator Plugins
- Publisher Plugins
- Validator Plugins
- Agent Plugins
- SDK Plugins
- Runtime Plugins
- CLI Plugins
- Future Extensions

---

# 3. Plugin Vision

Atlas ha sido diseñado como una plataforma extensible.

El núcleo proporciona únicamente las capacidades fundamentales.

Toda funcionalidad adicional deberá implementarse mediante plugins.

La evolución del ecosistema dependerá de este modelo.

---

# 4. Architectural Principles

Todo plugin SHALL respetar.

## Interface First

Toda comunicación se realizará mediante contratos públicos.

---

## Zero Core Modification

Un plugin nunca modificará el código del Kernel.

---

## Discoverable

Toda extensión deberá poder descubrirse automáticamente.

---

## Isolated

Los plugins deberán ejecutarse de forma desacoplada.

---

## Replaceable

Un plugin podrá sustituirse por otro compatible.

---

## Versioned

Todo plugin deberá declarar su compatibilidad.

---

# 5. Plugin Architecture

```text
Applications

↓

Atlas Kernel

↓

Plugin Manager

↓

Extension Points

↓

Plugins
```

El Kernel coordina.

Los plugins implementan capacidades.

---

# 6. Plugin Lifecycle

Todo plugin seguirá el siguiente ciclo.

```text
Discovery

↓

Registration

↓

Validation

↓

Initialization

↓

Execution

↓

Shutdown

↓

Unload
```

---

# 7. Plugin Manifest

Todo plugin SHALL declarar.

- identifier
- name
- version
- author
- capabilities
- dependencies
- compatibility
- configuration

El manifiesto constituye el contrato de descubrimiento.

---

# 8. Extension Points

Atlas define puntos oficiales donde un plugin puede integrarse.

Ejemplos.

- Compiler Stage
- Validator
- Generator
- Publisher
- Context Resolver
- Search Provider
- Memory Provider
- Runtime Service
- CLI Command
- AI Provider

Fuera de estos puntos no se permitirá modificar el comportamiento del sistema.

---

# 9. Plugin Categories

Las categorías oficiales incluyen.

- Compiler Plugins
- Knowledge Plugins
- Runtime Plugins
- SDK Plugins
- Integration Plugins
- AI Plugins
- Developer Plugins
- Enterprise Plugins

---

# 10. Capability Model

Un plugin no se registra por su implementación.

Se registra por las capacidades que ofrece.

Ejemplos.

- markdown.generator
- github.publisher
- openapi.generator
- vector.search
- semantic.validator
- context.resolver

El Kernel resolverá las capacidades disponibles dinámicamente.

---

# 11. Dependency Model

Los plugins podrán depender únicamente de.

- contratos públicos;
- SDK oficial;
- Extension Points.

Nunca podrán depender de implementaciones internas del Kernel.

---

# 12. Isolation

Los plugins SHALL ejecutarse de forma aislada.

El fallo de un plugin no deberá comprometer la estabilidad del sistema.

---

# 13. Discovery

El Kernel SHALL descubrir automáticamente los plugins disponibles.

Las estrategias podrán incluir.

- registro local;
- paquetes instalados;
- directorios;
- repositorios remotos.

---

# 14. Compatibility

Todo plugin deberá declarar.

- versión mínima soportada;
- versión máxima compatible;
- capacidades requeridas;
- dependencias obligatorias.

Los plugins incompatibles no serán cargados.

---

# 15. Security

El Kernel podrá aplicar políticas de seguridad sobre cada plugin.

Ejemplos.

- permisos;
- acceso al Workspace;
- acceso al Graph;
- acceso a red;
- acceso al sistema de archivos.

---

# 16. Related Documents

Architecture

- ATLAS-ARCH-000 — Architecture Overview
- ATLAS-ARCH-001 — System Architecture
- ATLAS-ARCH-002 — Package Architecture
- ATLAS-ARCH-003 — Compiler Architecture
- ATLAS-ARCH-004 — Knowledge Graph Architecture
- ATLAS-ARCH-006 — Build Compilation Pipeline

Engine

- ATLAS-107 — Agent Runtime
- ATLAS-108 — Workflow Engine

SDK

- ATLAS-200 — SDK Overview

---

# 17. Change History

| Version | Date | Description |
|----------|------------|----------------------------------------------|
| 1.0.0 | 2026-07-16 | Initial Plugin Architecture specification. |

---

# Final Statement

La arquitectura de plugins constituye el mecanismo oficial de evolución del ecosistema Atlas.

Toda nueva capacidad deberá incorporarse mediante contratos públicos, puntos de extensión definidos y un modelo de descubrimiento dinámico que preserve la estabilidad del Kernel y garantice la interoperabilidad entre todos los componentes de la plataforma.

---

# 18. Plugin Manager

El **Plugin Manager** constituye el componente responsable de administrar el ciclo de vida completo de todos los plugins.

Sus responsabilidades incluyen.

- descubrimiento;
- instalación;
- carga;
- activación;
- actualización;
- desactivación;
- descarga;
- eliminación.

El Plugin Manager SHALL ser el único componente autorizado para administrar plugins.

Ningún otro componente podrá cargar plugins directamente.

---

# 19. Capability Registry

Atlas no descubre implementaciones.

Atlas descubre **capacidades**.

El Capability Registry mantiene el catálogo oficial de todas las capacidades disponibles dentro del Workspace.

Ejemplos.

```text
markdown.generator

openapi.generator

typescript.sdk

github.publisher

git.publisher

vector.search

semantic.validator

context.resolver

workflow.executor

agent.provider
```

Cada capacidad posee.

- identificador único;
- versión;
- proveedor;
- prioridad;
- estado;
- contrato asociado.

---

# 20. Service Registry

Mientras el Capability Registry registra capacidades, el Service Registry mantiene las implementaciones activas.

Su responsabilidad consiste en resolver servicios durante la ejecución.

Ejemplos.

```text
Compiler

↓

Service Registry

↓

Generator Service

↓

Markdown Generator
```

El Runtime nunca dependerá de implementaciones concretas.

Siempre resolverá servicios mediante el Registry.

---

# 21. Dependency Injection

Todo componente extensible SHALL obtener sus dependencias mediante el contenedor oficial del Kernel.

La creación manual de dependencias queda desaconsejada.

El Dependency Injection Container permitirá.

- resolución dinámica;
- reemplazo de implementaciones;
- pruebas unitarias;
- composición modular.

---

# 22. Plugin Sandbox

Los plugins deberán ejecutarse dentro de un entorno controlado.

El Sandbox limita el acceso a recursos sensibles.

Ejemplos.

- sistema de archivos;
- red;
- variables de entorno;
- credenciales;
- Workspace;
- Knowledge Graph.

Los permisos deberán declararse explícitamente.

---

# 23. Event Architecture

Los plugins podrán reaccionar a eventos emitidos por el Kernel.

Ejemplos.

```text
CompilationStarted

CompilationCompleted

GraphUpdated

ArtifactGenerated

WorkspaceOpened

WorkspaceClosed

PluginInstalled

PluginRemoved
```

La comunicación SHALL basarse en eventos desacoplados.

Nunca mediante dependencias directas.

---

# 24. Plugin Lifecycle Events

Todo plugin podrá implementar los siguientes eventos.

```text
onInstall()

onLoad()

onInitialize()

onActivate()

onExecute()

onDeactivate()

onUnload()

onUninstall()
```

Cada evento representa una transición oficial del ciclo de vida.

El Kernel garantizará el orden de ejecución.

---

# 25. Plugin Configuration

Todo plugin podrá declarar configuración propia.

La configuración SHALL ser.

- tipada;
- validable;
- versionada;
- documentada.

Las modificaciones deberán realizarse sin alterar el código fuente del plugin.

---

# 26. Hot Reload

La arquitectura permitirá la recarga dinámica de plugins.

Cuando un plugin sea actualizado.

El Kernel podrá.

- descargar la versión anterior;
- validar la nueva;
- cargar la actualización;
- restaurar el estado cuando resulte posible.

El Hot Reload constituye una optimización del entorno de desarrollo.

---

# 27. Plugin Marketplace

Atlas podrá incorporar un repositorio oficial de extensiones.

El Marketplace permitirá.

- descubrimiento;
- instalación;
- actualización;
- verificación;
- publicación.

Todo plugin distribuido oficialmente deberá superar el proceso de validación definido por Atlas.

---

# 28. Trust Model

Cada plugin deberá poseer un nivel de confianza.

Ejemplos.

```text
Official

Verified

Community

Experimental

Local
```

El nivel de confianza podrá influir en las políticas de ejecución y permisos.

---

# 29. Plugin Dependencies

Los plugins podrán depender de otros plugins.

El Kernel SHALL resolver automáticamente.

- dependencias obligatorias;
- dependencias opcionales;
- incompatibilidades;
- conflictos de versión.

Las dependencias circulares quedan prohibidas.

---

# 30. Version Compatibility

Todo plugin declarará.

- versión mínima de Atlas;
- versión máxima compatible;
- contratos utilizados;
- capacidades requeridas.

El Kernel SHALL impedir la carga de plugins incompatibles.

---

# 31. Plugin Isolation

Cada plugin SHALL ejecutarse como una unidad independiente.

El fallo de un plugin.

- no deberá detener el Compiler;
- no deberá corromper el Knowledge Graph;
- no deberá afectar otros plugins.

La resiliencia constituye un requisito obligatorio.

---

# 32. Observability

Toda operación relevante relacionada con plugins SHALL generar eventos observables.

Ejemplos.

- instalación;
- activación;
- error;
- actualización;
- eliminación;
- consumo de recursos.

Estos eventos facilitarán auditoría y diagnóstico.

---

# 33. Future Plugin Types

La arquitectura reserva espacio para futuras categorías.

Ejemplos.

- AI Providers;
- LLM Providers;
- Embedding Providers;
- Vector Databases;
- Knowledge Providers;
- Cloud Providers;
- Authentication Providers;
- Monitoring Providers;
- Billing Providers.

La incorporación de nuevas categorías no requerirá modificar la arquitectura del Kernel.

---

# 34. Compliance

Toda implementación SHALL respetar.

- contratos públicos;
- aislamiento;
- descubrimiento dinámico;
- registros oficiales;
- seguridad;
- versionado;
- permisos;
- resiliencia;
- trazabilidad.

---

# Final Statement

La arquitectura de plugins constituye el mecanismo oficial mediante el cual Atlas evoluciona sin comprometer la estabilidad de su núcleo.

El Kernel permanece deliberadamente pequeño y estable, mientras que las capacidades del ecosistema se incorporan mediante plugins desacoplados, descubiertos dinámicamente y gobernados por contratos públicos.

Esta arquitectura permite que Atlas crezca de forma sostenible, facilite la participación de terceros y mantenga una plataforma extensible, segura y preparada para evolucionar durante los próximos años sin sacrificar coherencia, mantenibilidad ni compatibilidad.