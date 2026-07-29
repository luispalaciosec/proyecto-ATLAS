# ADR-0004 — Execution Model and Runtime Ownership

**Status:** Accepted

**Date:** 2026-07-27

**Amended:** 2026-07-27 — incorporated independent architecture review observations (status correction, SDK scope consolidation, Task Scheduler clarification, DOM-008/CONTRACT-007 open issues, CI compliance-gate open issue).

**Authors:** ATLAS Architecture Board

**Supersedes:** None

**Related ADRs:**
- ADR-0001 — Document ID Namespace Resolution
- ADR-0002 — Planning Consolidation
- ADR-0003 — Memory Architecture Resolution

**Referenced Specifications:**
- ATLAS_ARCHITECTURE_MASTER.md
- ATLAS-RUNTIME-009-RUNTIME_ARCHITECTURE
- ATLAS-INTELLIGENCE-CONTRACT-006-WORKFLOW_ENGINE
- ATLAS-INTELLIGENCE-CONTRACT-007-AGENT_RUNTIME
- ATLAS-DOM-008-AGENT_DOMAIN
- VERSION.md

---

# 1. Executive Summary

Este ADR establece el **Modelo Oficial de Ejecución (Execution Model)** de ATLAS y define de manera definitiva la responsabilidad arquitectónica de los componentes **Runtime**, **Pipeline Runtime**, **Workflow Engine** y **Agent Runtime**.

Su objetivo es resolver una contradicción detectada durante la revisión arquitectónica posterior a la certificación completa de Sprint 11D (`memory-providers-certified`).

Durante dicha revisión se comprobó que existen dos especificaciones aprobadas que describen arquitecturas incompatibles respecto a la propiedad de Workflow Engine y Agent Runtime.

Por un lado:

**ATLAS-RUNTIME-009** define ambos componentes como subsistemas internos del Runtime perteneciente al Kernel.

Por otro:

**ATLAS-INTELLIGENCE-CONTRACT-006** y **ATLAS-INTELLIGENCE-CONTRACT-007** los definen como componentes independientes de la capa Intelligence/Capability que utilizan Runtime únicamente como infraestructura de ejecución.

Ambas interpretaciones no pueden coexistir.

Este ADR resuelve oficialmente dicha contradicción.

La decisión adoptada preserva todos los principios fundacionales definidos por ATLAS:

- separación estricta entre capas;
- Kernel completamente agnóstico del dominio;
- dependencias unidireccionales;
- composición de infraestructura por parte de las Capabilities;
- separación entre ejecución determinista y comportamiento cognitivo no determinista.

Como consecuencia, este ADR introduce oficialmente dos conceptos distintos que hasta ahora compartían el mismo nombre:

- **Pipeline Runtime**
- **Agent Runtime**

Esta taxonomía pasa a formar parte del vocabulario constitucional de ATLAS y será normativa para cualquier capability futura.

---

# 2. Context

Hasta Sprint 11D la evolución de ATLAS siguió un crecimiento incremental.

Los primeros sprints consolidaron el Kernel.

Posteriormente se desarrolló Knowledge.

Después Planning.

Finalmente Memory fue completamente rediseñado mediante ADR-0003, obteniendo cuatro certificaciones independientes:

- memory-architecture-certified
- memory-application-certified
- memory-engine-operations-certified
- memory-providers-certified

La revisión arquitectónica realizada inmediatamente después de dicha certificación tuvo un propósito distinto al de las auditorías anteriores.

No consistía en validar código.

Consistía en comprobar que la arquitectura completa de ATLAS seguía siendo coherente antes de iniciar las siguientes capabilities:

- Sessions
- Retrieval
- Context
- Reasoning
- Agent Runtime

Durante dicha revisión se detectó una inconsistencia estructural que había permanecido oculta debido a que los componentes implicados todavía no habían sido implementados completamente.

La contradicción no proviene del código.

Proviene de la coexistencia de dos especificaciones aprobadas que asignan responsabilidades incompatibles a los mismos componentes.

Dado que ambos documentos pertenecen al mismo nivel jerárquico dentro del sistema de gobernanza documental definido por ATLAS, la jerarquía establecida en el Architecture Master resulta insuficiente para resolver el conflicto.

En consecuencia, el Architecture Board determina que la única resolución válida consiste en emitir un nuevo ADR constitucional.

---

# 3. Problem Statement

La arquitectura oficial presenta una contradicción respecto a la propiedad de los componentes responsables de la ejecución inteligente.

Concretamente:

**ATLAS-RUNTIME-009** establece que Runtime contiene internamente:

- Workflow Engine
- Agent Runtime
- Task Scheduler

Sin embargo:

**ATLAS-INTELLIGENCE-CONTRACT-006** establece que Workflow Engine constituye un componente independiente responsable de:

- interpretar Execution Plans;
- coordinar dependencias;
- controlar estados;
- delegar unidades de trabajo.

**ATLAS-INTELLIGENCE-CONTRACT-007** establece que Agent Runtime constituye un componente independiente responsable de:

- ejecutar unidades de trabajo;
- seleccionar agentes;
- utilizar capacidades cognitivas;
- utilizar herramientas;
- gestionar ejecución distribuida.

Las responsabilidades descritas por ambos contratos exceden ampliamente el alcance permitido para un componente perteneciente al Kernel.

Si Runtime incorporara dichas capacidades:

- conocería conceptos de dominio;
- conocería agentes;
- conocería herramientas;
- conocería memoria;
- conocería razonamiento;
- conocería coordinación de negocio.

Todo ello contradice directamente los principios arquitectónicos definidos por ATLAS.

El conflicto no puede resolverse mediante implementación.

Debe resolverse previamente mediante una decisión arquitectónica.

---

# 4. Evidence Collected

Las decisiones contenidas en este ADR se fundamentan exclusivamente en evidencia verificable.

No constituyen reinterpretaciones informales.

## Evidencia A — Layer Model

El Architecture Master define la siguiente jerarquía:

Interfaces

↓

SDK

↓

Intelligence Engine

↓

Capabilities

↓

Workflow

↓

Runtime

↓

Compiler

↓

Core

Este diagrama establece explícitamente que Workflow depende de Runtime.

Nunca al contrario.

---

## Evidencia B — Kernel Agnostic Principle

El Architecture Master establece como principio fundacional:

> "Kernel knows nothing about any capability."

Runtime pertenece al Kernel.

Por definición, Runtime no puede conocer ninguna capability.

---

## Evidencia C — Agent Domain

ATLAS-DOM-008 define Agent como una entidad de dominio compuesta por:

- identidad;
- capacidades;
- herramientas;
- políticas;
- objetivos;
- comportamiento;
- colaboración.

Todos ellos constituyen conceptos propios del dominio.

---

## Evidencia D — Agent Runtime Contract

ATLAS-INTELLIGENCE-CONTRACT-007 define Agent Runtime como un componente capaz de:

- gestionar múltiples agentes;
- soportar ejecución distribuida;
- soportar ejecución humana;
- soportar ejecución mediante LLM;
- mantener un ciclo de vida propio.

Estas características corresponden claramente a una Capability.

No a infraestructura Kernel.

---

## Evidencia E — Workflow Contract

ATLAS-INTELLIGENCE-CONTRACT-006 define Workflow Engine como el responsable de:

- interpretar Execution Plans;
- controlar estados;
- coordinar dependencias;
- delegar trabajo.

El contrato establece explícitamente que Workflow Engine nunca ejecuta directamente el trabajo delegado.

---

## Evidencia F — Código Fuente

El paquete Runtime contiene actualmente implementaciones placeholder de:

- `packages/runtime/src/workflow/`
- `packages/runtime/src/agents/`

Dichas implementaciones no contienen comportamiento funcional.

Constituyen únicamente scaffolding arquitectónico.

Su existencia no puede utilizarse como evidencia normativa para determinar ownership.

---

## Evidencia G — Gobernanza Documental

ATLAS_ARCHITECTURE_MASTER.md establece el siguiente orden de precedencia documental:

1. ADR
2. Specifications
3. Architecture Master
4. Releases
5. README
6. Source Code

Sin embargo, no existe ninguna regla que permita resolver discrepancias entre documentos pertenecientes al mismo nivel jerárquico.

Este vacío de gobernanza constituye una de las causas directas del conflicto descrito en este ADR.

---

# 5. Architectural Principles Applied

Las decisiones contenidas en este ADR aplican los principios ya aprobados por la arquitectura de ATLAS.

## Principle 1 — Kernel is Domain Agnostic

El Kernel nunca conoce entidades de negocio.

Nunca conoce agentes.

Nunca conoce memoria.

Nunca conoce contexto.

Nunca conoce razonamiento.

---

## Principle 2 — Capabilities Compose Infrastructure

Las capabilities utilizan Runtime.

Runtime nunca utiliza capabilities.

La dirección de dependencia siempre apunta hacia abajo.

---

## Principle 3 — Deterministic Execution is Isolated

Toda ejecución determinista pertenece exclusivamente al Kernel.

La ejecución determinista debe permanecer independiente del dominio.

---

## Principle 4 — Cognitive Behaviour Belongs Outside the Kernel

Toda decisión basada en IA pertenece exclusivamente a las capas cognitivas.

Nunca al Kernel.

---

## Principle 5 — Coordination is Different from Execution

Coordinar un proceso no equivale a ejecutar un proceso.

Workflow Engine y Runtime poseen responsabilidades diferentes.

---

## Principle 6 — Infrastructure Must Remain Reusable

Pipeline Runtime debe poder reutilizarse por cualquier capability futura.

Para lograrlo debe permanecer completamente agnóstico del dominio.

---

# 6. Scope

Este ADR únicamente define:

- Runtime
- Pipeline Runtime
- Agent Runtime
- Workflow Engine
- Ownership
- Relaciones entre dichos componentes

Este ADR no modifica el comportamiento funcional de:

- Memory
- Retrieval
- Context
- Reasoning
- Planning
- SDK
- Compiler
- Core

salvo en aquello estrictamente necesario para preservar la coherencia arquitectónica del modelo de ejecución.

# 7. Official Execution Model

## Decision

A partir de la aprobación de este ADR, ATLAS reconoce oficialmente la existencia de **dos motores de ejecución distintos**, pertenecientes a capas arquitectónicas diferentes.

Estos motores nunca deberán considerarse sinónimos.

La reutilización histórica del término **Runtime** queda oficialmente desambiguada.

---

## Official Runtime Taxonomy

### 1. Pipeline Runtime

Layer:

Kernel

Package:

`@atlas/runtime`

Responsabilidad:

Ejecutar artefactos completamente deterministas previamente compilados.

Conoce únicamente:

- PipelineDefinition
- RuntimeContext
- RuntimeState
- PipelineExecutor
- ExecutionGraph
- RuntimeEvents

Nunca conoce:

- Agent
- Memory
- Context
- Retrieval
- Reasoning
- Persona
- Tools
- LLM
- Policies

Su comportamiento debe permanecer completamente determinista.

Dos ejecuciones con los mismos artefactos deberán producir exactamente el mismo resultado.

---

### 2. Agent Runtime

Layer:

Capability

Package:

`@atlas/agent`

Responsabilidad:

Ejecutar unidades de trabajo delegadas por Workflow Engine utilizando agentes definidos por el dominio.

Conoce:

- Agent
- AgentDefinition
- AgentCapabilities
- Persona
- Skills
- Policies
- Tool Registry
- Execution Memory
- LLM Providers
- Human Executors
- Distributed Executors

Su comportamiento puede ser no determinista.

Puede utilizar:

- modelos LLM;
- intervención humana;
- herramientas externas;
- memoria;
- razonamiento.

El Agent Runtime nunca forma parte del Kernel.

---

## Architectural Consequence

La palabra **Runtime**, utilizada de forma aislada, deja de ser un término arquitectónicamente válido.

A partir de este ADR deberá utilizarse siempre uno de los siguientes nombres:

- Pipeline Runtime
- Agent Runtime

El término genérico Runtime únicamente podrá emplearse cuando el contexto elimine completamente cualquier ambigüedad.

---

# 8. Ownership Resolution

## Decision

La propiedad arquitectónica oficial de los componentes queda establecida de la siguiente manera.

| Component | Owner Layer | Package |
|------------|------------|----------|
| Pipeline Runtime | Kernel | @atlas/runtime |
| Workflow Engine | Capability | @atlas/workflow |
| Agent Runtime | Capability | @atlas/agent |
| Task Scheduler (execution) | Kernel | @atlas/runtime |
| Task Scheduling Policy | Workflow | @atlas/workflow |

---

## Pipeline Runtime Owns

Pipeline Runtime es responsable exclusivamente de infraestructura.

Incluye:

- ejecución determinista;
- control de estado interno;
- manejo de errores técnicos;
- control de concurrencia;
- ejecución de pipelines compilados;
- eventos internos;
- métricas técnicas.

No puede contener lógica de negocio.

No puede contener conocimiento de dominio.

No puede contener IA.

---

## Workflow Engine Owns

Workflow Engine es responsable de la coordinación del proceso.

Incluye:

- interpretación de Execution Plans;
- coordinación de dependencias;
- control del ciclo de vida del workflow;
- delegación de unidades de trabajo;
- reintentos funcionales;
- pausas;
- compensaciones;
- human-in-the-loop.

Workflow Engine nunca ejecuta directamente trabajo.

Siempre delega.

---

## Agent Runtime Owns

Agent Runtime es responsable exclusivamente de la ejecución inteligente.

Incluye:

- selección del agente;
- resolución de herramientas;
- selección del proveedor LLM;
- recuperación de memoria;
- recuperación de contexto;
- razonamiento;
- ejecución distribuida;
- ejecución humana.

Nunca coordina procesos completos.

Nunca interpreta Execution Plans.

---

# 9. Execution Responsibility Matrix

## Pipeline Runtime

Responde a la pregunta:

> ¿Cómo ejecuto correctamente un pipeline?

No responde:

> ¿Qué debería ejecutarse?

---

## Workflow Engine

Responde:

> ¿Qué debe ejecutarse?

> ¿En qué orden?

> ¿Cuándo?

> ¿Qué depende de qué?

No responde:

> ¿Cómo piensa un agente?

---

## Agent Runtime

Responde:

> ¿Cómo realiza este agente la tarea que recibió?

No responde:

> ¿Qué tarea viene después?

---

# 10. Canonical Execution Flow

La secuencia oficial de ejecución queda definida como:

```text
Planning Engine
        │
        ▼
Execution Plan
        │
        ▼
Workflow Engine
        │
        ▼
Task Delegation
        │
        ▼
Agent Runtime
        │
        ▼
Pipeline Runtime
        │
        ▼
Pipeline Executor
        │
        ▼
Compiled Pipeline
        │
        ▼
Execution Result
        │
        ▼
Agent Runtime
        │
        ▼
Workflow Engine
        │
        ▼
Workflow State Update
```

---

## Interpretation

Cada componente posee una única responsabilidad.

La coordinación siempre fluye hacia abajo.

Los resultados siempre regresan hacia arriba.

En ningún punto Pipeline Runtime conoce Workflow.

En ningún punto Pipeline Runtime conoce Agent.

En ningún punto Workflow conoce Memory.

En ningún punto Workflow conoce Reasoning.

Toda interacción cognitiva ocurre exclusivamente dentro de Agent Runtime.

---

# 11. Dependency Rules

Las siguientes reglas pasan a ser normativas.

## Rule 1

Pipeline Runtime nunca importa paquetes Capability.

Permitido:

```
Pipeline Runtime

↓

Core

Compiler

Events
```

Prohibido:

```
Pipeline Runtime

↓

Memory
```

---

## Rule 2

Workflow Engine depende de Pipeline Runtime.

Nunca al revés.

---

## Rule 3

Agent Runtime depende de:

- Memory
- Retrieval
- Context
- Reasoning
- Pipeline Runtime

Nunca Pipeline Runtime depende de Agent Runtime.

---

## Rule 4

Capabilities siempre componen infraestructura.

Infraestructura nunca compone capabilities.

---

## SDK Direction (Non-Binding)

Future SDK evolution SHOULD converge toward a single orchestration façade in order to preserve the dependency direction established by this ADR.

This ADR does not mandate a specific SDK implementation. The implementation strategy will be defined in a future ADR. See OI-0006.

---

# 12. Rationale

El Architecture Board evaluó tres alternativas.

## Alternative A

Mover Workflow Engine al Kernel.

Resultado:

Rechazada.

Viola el principio Kernel is Domain Agnostic.

---

## Alternative B

Mantener Workflow y Agent Runtime como capabilities independientes.

Resultado:

Aceptada.

Respeta:

- separación por capas;
- composición descendente;
- reutilización del Kernel.

---

## Alternative C

Fusionar Workflow y Agent Runtime.

Resultado:

Rechazada.

Ambos poseen responsabilidades distintas.

Workflow coordina.

Agent ejecuta.

Fusionarlos produciría un componente con múltiples razones para cambiar, violando el principio de responsabilidad única.

# 13. Migration Plan

Este ADR no introduce cambios funcionales inmediatos.

Introduce una transición arquitectónica controlada.

El objetivo consiste en eliminar progresivamente la ambigüedad entre Pipeline Runtime y Agent Runtime sin afectar la estabilidad del Kernel ni romper compatibilidad con las capabilities ya certificadas.

---

# Phase 1 — Architectural Freeze

**Estado:** Inmediato

Durante esta fase no se modifica comportamiento alguno.

Únicamente queda oficialmente establecido el nuevo modelo de ownership.

Las siguientes decisiones pasan a ser obligatorias:

- Pipeline Runtime pertenece al Kernel.
- Workflow Engine pertenece a `@atlas/workflow`.
- Agent Runtime pertenece a `@atlas/agent`.
- Runtime deja de ser un término genérico.
- Pipeline Runtime y Agent Runtime pasan a formar parte del vocabulario oficial de ATLAS.

---

# Phase 2 — Runtime Cleanup

**Estado:** Antes de iniciar Agent Runtime

Los siguientes componentes existentes dentro de `@atlas/runtime` deberán ser retirados del Kernel:

```
packages/runtime/src/agents/
```

```
packages/runtime/src/workflow/
```

Su eliminación no implica pérdida funcional, ya que actualmente constituyen únicamente scaffolding arquitectónico.

No contienen lógica de dominio.

No contienen implementación funcional.

Su existencia únicamente reserva nombres públicos.

---

## Task Scheduler Clarification

`packages/runtime/src/tasks/task-scheduler.ts` queda explícitamente excluido de este retiro.

Según Superseded Statement 3 (Sección 17), Task Scheduler queda solo parcialmente sustituido: su implementación actual corresponde a Execution Scheduler (timers, concurrencia, colas técnicas, reintentos técnicos), infraestructura que permanece válida dentro del Kernel bajo este ADR.

Deberá revisarse — no eliminarse — para confirmar que no contiene lógica de Scheduling Policy (cuándo/si ejecutar, dependencias, reglas funcionales). Cualquier lógica de ese tipo encontrada deberá migrarse a `@atlas/workflow`.

---

## API Impact

Las siguientes exportaciones deberán desaparecer de la API pública del Kernel:

```
AgentRuntime
```

```
WorkflowEngine
```

```
createAgentRuntime()
```

```
createWorkflowEngine()
```

Estas APIs nunca llegaron a representar componentes funcionales certificados.

Por tanto, su eliminación no rompe comportamiento de producción.

---

# Phase 3 — Package Creation

Cuando el roadmap alcance las correspondientes capabilities se crearán los siguientes paquetes:

```
@atlas/workflow
```

(con implementación completa del Workflow Engine)

y

```
@atlas/agent
```

(con implementación completa del Agent Runtime)

Ambos paquetes utilizarán Pipeline Runtime como infraestructura.

Nunca al contrario.

---

# Phase 4 — Composition

Una vez implementado Agent Runtime, la composición oficial será:

```text
Agent Runtime

↓

Pipeline Runtime

↓

Compiler

↓

Core
```

Agent Runtime nunca reimplementará infraestructura de ejecución.

Siempre reutilizará Pipeline Runtime.

Esto evita duplicación de:

- scheduler técnico;
- ejecución determinista;
- manejo de estados internos;
- pipeline execution;
- observabilidad;
- métricas técnicas.

---

# 14. Compatibility

Este ADR preserva completamente:

- ADR-0001
- ADR-0002
- ADR-0003

No modifica:

- Memory Architecture
- Compiler
- Core
- Events
- SDK
- Knowledge

No modifica ningún contrato certificado de Memory.

No altera ningún comportamiento funcional existente.

---

# Backward Compatibility

Las capacidades futuras deberán respetar este ADR.

Los componentes existentes podrán mantener temporalmente imports internos mientras dure la transición.

Sin embargo:

ninguna nueva capability podrá introducir dependencias contrarias al modelo definido aquí.

---

# Semantic Compatibility

Este ADR no redefine responsabilidades existentes.

Únicamente aclara ownership.

Por tanto:

Workflow sigue coordinando.

Agent sigue ejecutando.

Pipeline Runtime sigue ejecutando pipelines.

Memory sigue administrando memoria.

Reasoning sigue razonando.

No existe ninguna reasignación funcional.

Existe únicamente una reasignación arquitectónica de ownership.

---

# 15. Architectural Consequences

La aprobación de este ADR produce las siguientes consecuencias.

---

## Consequence 1

Pipeline Runtime queda oficialmente consolidado como infraestructura reutilizable para todas las capabilities futuras.

No volverá a incorporar conceptos de dominio.

---

## Consequence 2

Workflow Engine deja de ser considerado un posible subsistema interno del Kernel.

Su única ubicación válida pasa a ser:

```
@atlas/workflow
```

---

## Consequence 3

Agent Runtime deja de ser considerado infraestructura.

Pasa a ser oficialmente una Capability.

Su única ubicación válida pasa a ser:

```
@atlas/agent
```

---

## Consequence 4

El concepto de Runtime queda desambiguado definitivamente.

Las futuras especificaciones deberán utilizar únicamente uno de estos términos:

- Pipeline Runtime
- Agent Runtime

No se aceptarán nuevos documentos que utilicen simplemente "Runtime" cuando exista posibilidad de ambigüedad.

---

## Consequence 5

Las futuras capabilities deberán componerse sobre Pipeline Runtime.

Nunca deberán extenderlo.

Nunca deberán modificarlo.

Nunca deberán incorporar lógica de dominio dentro del Kernel.

---

## Consequence 6

Future SDK evolution SHOULD converge toward a single orchestration façade in order to preserve the dependency direction established by this ADR.

This ADR does not mandate a specific implementation.

The implementation strategy will be defined in a future ADR. See OI-0006.

---

# 16. Validation Rules

Toda futura auditoría arquitectónica deberá verificar como mínimo las siguientes condiciones.

## Rule A

Pipeline Runtime no importa ningún paquete capability.

Resultado esperado:

PASS

---

## Rule B

Workflow Engine depende de Pipeline Runtime.

Pipeline Runtime no depende de Workflow Engine.

Resultado esperado:

PASS

---

## Rule C

Agent Runtime depende de Pipeline Runtime.

Pipeline Runtime no depende de Agent Runtime.

Resultado esperado:

PASS

---

## Rule D

El Kernel permanece completamente agnóstico del dominio.

Resultado esperado:

PASS

---

## Rule E

Ningún documento aprobado utiliza el término "Runtime" de forma ambigua.

Resultado esperado:

PASS

---

## Rule F

No existen implementaciones duplicadas de Workflow Engine ni Agent Runtime dentro del Kernel.

Resultado esperado:

PASS

# 17. Superseded Statements

A partir de la aprobación de este ADR, las siguientes afirmaciones dejan de ser consideradas normativas.

## Superseded Statement 1

**Documento:**

ATLAS-RUNTIME-009-RUNTIME_ARCHITECTURE

**Estado anterior:**

Workflow Engine forma parte del Runtime.

**Nuevo estado:**

Obsoleto.

Workflow Engine pertenece oficialmente a la capa Capability y su implementación deberá residir en `@atlas/workflow`.

---

## Superseded Statement 2

**Documento:**

ATLAS-RUNTIME-009-RUNTIME_ARCHITECTURE

**Estado anterior:**

Agent Runtime forma parte del Runtime.

**Nuevo estado:**

Obsoleto.

Agent Runtime pertenece oficialmente a la capa Capability y su implementación deberá residir en `@atlas/agent`.

---

## Superseded Statement 3

**Documento:**

ATLAS-RUNTIME-009-RUNTIME_ARCHITECTURE

**Estado anterior:**

Task Scheduler representa la planificación funcional del sistema.

**Nuevo estado:**

Parcialmente sustituido.

A partir de este ADR se distingue entre:

**Execution Scheduler**

Responsabilidad del Kernel.

Gestiona únicamente:

- timers;
- concurrencia;
- colas técnicas;
- reintentos técnicos.

y

**Scheduling Policy**

Responsabilidad de Workflow Engine.

Gestiona:

- cuándo ejecutar;
- dependencias;
- pausas;
- compensaciones;
- reglas funcionales.

---

# 18. Open Issues

La aprobación de este ADR no resuelve automáticamente todas las cuestiones arquitectónicas pendientes.

Quedan registradas las siguientes acciones futuras.

---

## OI-0001

Actualizar ATLAS-RUNTIME-009-RUNTIME_ARCHITECTURE.

Su contenido deberá alinearse completamente con este ADR.

---

## OI-0002

Actualizar el Architecture Master para introducir oficialmente el término:

**Pipeline Runtime**

como denominación del Runtime perteneciente al Kernel.

---

## OI-0003

Actualizar el glosario oficial de términos arquitectónicos.

El término Runtime deberá quedar reservado exclusivamente para referencias no ambiguas.

---

## OI-0004

Durante la implementación de `@atlas/agent` deberá verificarse que Pipeline Runtime pueda ser reutilizado sin modificaciones.

Si fuese necesaria cualquier modificación del Kernel para soportar Agent Runtime, deberá emitirse un nuevo ADR.

---

## OI-0005

Cuando se implemente Retrieval deberá revisarse el conflicto terminológico existente entre:

- Retrieval Provider (Capability)
- RetrievalProvider (interno de Memory)

Este ADR únicamente registra el problema.

No modifica su nomenclatura.

---

## OI-0006

Future SDK evolution SHOULD converge toward a single orchestration façade in order to preserve the dependency direction established by this ADR.

This ADR does not mandate a specific implementation. The implementation strategy will be defined in a future ADR (SDK Orchestration Façade).

---

## OI-0007

Promover `ATLAS-DOM-008-AGENT_DOMAIN` de `status: draft` a `status: approved`.

La Evidencia C de este ADR (Sección 4) se fundamenta en ATLAS-DOM-008. Hasta que dicho documento sea formalmente aprobado, la base evidencial de este ADR para el modelo de entidad Agent permanece condicionada a un documento de menor madurez que el propio ADR.

---

## OI-0008

Actualizar `ATLAS-INTELLIGENCE-CONTRACT-007-AGENT_RUNTIME` para referenciar explícitamente a Pipeline Runtime como la infraestructura de ejecución compuesta introducida por este ADR.

El contrato original es anterior a la distinción Pipeline Runtime / Agent Runtime y no describe esta relación de composición.

---

## OI-0009

Definir gates automáticos de cumplimiento arquitectónico para ADR-0004.

El CI futuro deberá validar las Reglas A–F (Sección 16) de forma automática.

**Trigger:** debe resolverse antes de que inicie la Fase 3 (Package Creation).

---

# 19. Decision Record

El Architecture Board adopta las siguientes decisiones constitucionales.

## D1

Pipeline Runtime constituye la única infraestructura oficial de ejecución determinista de ATLAS.

---

## D2

Workflow Engine pertenece exclusivamente a `@atlas/workflow`.

---

## D3

Agent Runtime pertenece exclusivamente a `@atlas/agent`.

---

## D4

Agent Runtime reutiliza Pipeline Runtime.

Pipeline Runtime nunca reutiliza Agent Runtime.

---

## D5

Las Capabilities componen infraestructura.

La infraestructura nunca compone Capabilities.

---

## D6

El Kernel permanece completamente agnóstico del dominio.

Esta regla adquiere carácter constitucional.

---

## D7

El término Runtime queda oficialmente desambiguado.

Toda documentación futura deberá utilizar:

- Pipeline Runtime

o

- Agent Runtime

según corresponda.

---

## D8

Las implementaciones placeholder existentes dentro de `@atlas/runtime` correspondientes a Workflow Engine y Agent Runtime deberán eliminarse durante la transición arquitectónica.

---

# 20. Architecture Compliance

Todo cambio futuro relacionado con ejecución deberá demostrar cumplimiento explícito de este ADR.

Las revisiones arquitectónicas deberán verificar obligatoriamente:

- ownership;
- dirección de dependencias;
- aislamiento del Kernel;
- reutilización de Pipeline Runtime;
- ausencia de conceptos de dominio dentro del Kernel.

Cualquier excepción requerirá un nuevo ADR.

---

# 21. Final Resolution

El Architecture Board determina que:

- existe un único Runtime perteneciente al Kernel;

- dicho Runtime pasa a denominarse oficialmente **Pipeline Runtime**;

- Workflow Engine no forma parte del Kernel;

- Agent Runtime no forma parte del Kernel;

- ambos pertenecen a la capa Capability;

- ambos reutilizan Pipeline Runtime como infraestructura de ejecución;

- la dirección oficial de dependencias queda establecida como:

```text
Planning
      │
      ▼
Workflow Engine
      │
      ▼
Agent Runtime
      │
      ▼
Pipeline Runtime
      │
      ▼
Compiler
      │
      ▼
Core
```

Con esta decisión queda resuelta la contradicción existente entre las especificaciones previamente aprobadas y se establece un único Modelo Oficial de Ejecución para todas las evoluciones futuras de ATLAS.

---

# 22. Approval

**Architecture Review Board**

Status:

**Accepted**

Effective Date:

2026-07-27

This ADR becomes part of the constitutional architecture of ATLAS and takes precedence over conflicting architectural statements contained in specifications of equal or lower authority until those documents are updated accordingly.

