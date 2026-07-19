---
id: ATLAS-003
title: Atlas Principles
version: 1.0.0
status: draft
owner: Atlas Foundation
classification: public
created: 2026-07-13
last_updated: 2026-07-13
purpose: >
  Definir los principios fundamentales que gobiernan el diseño, evolución,
  implementación y operación de Atlas. Estos principios representan las leyes
  arquitectónicas del ecosistema y sirven como criterio para la toma de
  decisiones tanto humanas como asistidas por inteligencia artificial.
---

# ATLAS-003 — Principles

> "Los principios permanecen. Las implementaciones evolucionan."

---

# 1. Purpose

Los Principles representan el conjunto de leyes fundamentales que gobiernan Atlas.

Mientras el **Domain Model** describe **qué existe**, los **Principles** describen **cómo debe comportarse** el sistema.

Todo componente, dominio, proceso, agente o implementación deberá respetar estos principios.

Cuando exista conflicto entre una implementación y un Principle, el Principle prevalecerá.

---

# 2. Scope

Estos principios aplican a:

- Atlas Foundation
- Atlas Engine
- Atlas Knowledge
- Atlas Organization
- Atlas Agents
- Atlas Brands
- Atlas Academy
- Cualquier implementación futura basada en Atlas

---

# 3. Normative Language

Atlas adopta la terminología definida por **RFC 2119**.

- **MUST**: requisito obligatorio.
- **MUST NOT**: prohibido.
- **SHOULD**: altamente recomendado.
- **SHOULD NOT**: desaconsejado.
- **MAY**: opcional según el contexto.

---

# 4. Principle Structure

Cada principio se compone de:

- Definition
- Rationale
- Rules
- Examples
- Anti-patterns
- Related Domains

---

# Principle 01 — Knowledge First

## Definition

El conocimiento constituye el activo principal de Atlas.

Toda decisión, proceso, aprendizaje y resultado debe contribuir a la creación, preservación o mejora del conocimiento organizacional.

---

## Rationale

Las organizaciones cambian.

Las personas cambian.

Las tecnologías cambian.

El conocimiento es el único activo capaz de incrementar su valor cuando es compartido y reutilizado.

Atlas existe para preservar ese conocimiento.

---

## Rules

- Knowledge MUST ser preservado.
- Knowledge MUST tener propietario.
- Knowledge MUST ser versionado.
- Knowledge SHOULD ser reutilizable.
- Knowledge MUST NOT depender exclusivamente de personas.

---

## Examples

Correcto.

```
Decisión

↓

Documentación

↓

Playbook

↓

Conocimiento reutilizable
```

Incorrecto.

```
Decisión

↓

Memoria del empleado
```

---

## Anti-patterns

- Conocimiento únicamente verbal.
- Documentación sin propietario.
- Aprendizajes no registrados.

---

## Related Domains

- Knowledge
- Decision
- Asset
- Organization

---

# Principle 02 — Human Governance

## Definition

La autoridad siempre pertenece a las personas.

La inteligencia artificial amplifica capacidades.

Nunca gobierna la organización.

---

## Rationale

Los modelos de IA evolucionan constantemente.

La responsabilidad legal, ética y estratégica permanece en las personas.

Atlas preserva esa separación.

---

## Rules

- AI MUST NOT definir políticas.
- AI MUST NOT aprobar decisiones críticas.
- Toda decisión estratégica MUST tener responsable humano.
- Los agentes MAY proponer.
- Los humanos MUST decidir.

---

## Examples

Correcto.

```
AI

↓

Propuesta

↓

Director

↓

Aprobación
```

Incorrecto.

```
AI

↓

Publicación automática

↓

Sin supervisión
```

---

## Anti-patterns

- Agentes autónomos sin supervisión.
- IA aprobando contratos.
- IA modificando políticas organizacionales.

---

## Related Domains

- Agent
- Policy
- Decision
- Governance

---

# Principle 03 — AI Agnostic

## Definition

Atlas nunca dependerá de un proveedor específico de inteligencia artificial.

---

## Rationale

Las tecnologías cambian.

La arquitectura debe permanecer estable.

---

## Rules

- Atlas MUST funcionar con diferentes modelos.
- Ningún dominio MAY depender de un LLM específico.
- Toda integración SHOULD ser intercambiable.

---

## Examples

Correcto.

```
Atlas

↓

OpenAI

Claude

Gemini

Mistral

Llama
```

Incorrecto.

```
Atlas

↓

Proveedor único
```

---

## Anti-patterns

- Prompts diseñados únicamente para un modelo.
- Arquitectura acoplada a un proveedor.

---

## Related Domains

- Agent
- Knowledge
- Workflow

---

# Principle 04 — Domain Driven

## Definition

Toda organización debe modelarse mediante dominios claramente definidos.

---

## Rationale

Los dominios reducen complejidad.

Permiten evolución independiente.

Facilitan escalabilidad.

---

## Rules

- Todo componente MUST pertenecer a un Domain.
- Los Domains MUST tener límites explícitos.
- Los Domains SHOULD evolucionar independientemente.

---

## Examples

```
Organization

↓

Brand

↓

Marketing

↓

Creative

↓

Knowledge
```

---

## Anti-patterns

- Responsabilidades mezcladas.
- Dominios ambiguos.
- Dominios duplicados.

---

## Related Domains

Todos.

---

# Principle 05 — Explicit Over Implicit

## Definition

Todo conocimiento importante debe existir de forma explícita.

Nunca implícita.

---

## Rationale

Los sistemas implícitos generan dependencia de personas.

Atlas elimina esa dependencia.

---

## Rules

- Las decisiones MUST documentarse.
- Las políticas MUST escribirse.
- Los procesos MUST describirse.
- Los workflows SHOULD ser reproducibles.

---

## Examples

Correcto.

```
Proceso documentado

↓

Repetible
```

Incorrecto.

```
"Siempre lo hacemos así."
```

---

## Anti-patterns

- Reglas ocultas.
- Suposiciones.
- Conocimiento tribal.

---

## Related Domains

- Process
- Workflow
- Knowledge
- Policy

# Principle 06 — Single Source of Truth

## Definition

Cada pieza de conocimiento debe tener una única fuente oficial.

Atlas evita duplicaciones, versiones paralelas y conflictos de información.

---

## Rationale

La duplicidad genera inconsistencias.

Una organización inteligente siempre sabe cuál es la versión oficial.

---

## Rules

- Todo documento MUST tener una fuente oficial.
- Todo Asset MUST tener un Owner.
- Las copias SHOULD referenciar el origen.
- La información duplicada MUST NOT convertirse en fuente independiente.

---

## Examples

Correcto.

```
Policy

↓

Repositorio Oficial

↓

Referencias
```

Incorrecto.

```
Policy

↓

Google Drive

↓

Notion

↓

Word

↓

PDF

↓

Todas diferentes
```

---

## Anti-patterns

- Documentación duplicada.
- Versiones paralelas.
- Múltiples verdades.

---

## Related Domains

- Knowledge
- Asset
- Policy

---

# Principle 07 — Separation of Concerns

## Definition

Cada Domain debe tener una única responsabilidad claramente definida.

---

## Rationale

La simplicidad favorece la evolución.

Los sistemas complejos aparecen cuando las responsabilidades se mezclan.

---

## Rules

- Cada Domain MUST tener una responsabilidad principal.
- Los Domains MUST NOT invadir responsabilidades ajenas.
- Los cambios SHOULD permanecer dentro de su Domain.

---

## Examples

Correcto.

```
Brand

↓

Identidad
```

```
Knowledge

↓

Conocimiento
```

Incorrecto.

```
Brand

↓

Identidad

↓

Finanzas

↓

RRHH
```

---

## Anti-patterns

- Mega Domains.
- Responsabilidades mezcladas.
- Dependencias innecesarias.

---

## Related Domains

Todos.

---

# Principle 08 — Continuous Learning

## Definition

Toda experiencia debe convertirse en aprendizaje.

Todo aprendizaje debe convertirse en conocimiento.

---

## Rationale

Atlas aprende continuamente.

No repite errores.

---

## Rules

- Todo proyecto SHOULD generar Lessons Learned.
- Todo incidente SHOULD producir conocimiento.
- Todo aprendizaje relevante MUST preservarse.

---

## Examples

```
Proyecto

↓

Retrospectiva

↓

Knowledge Base
```

---

## Anti-patterns

- Repetir errores.
- No documentar retrospectivas.

---

## Related Domains

- Knowledge
- Process
- Workflow

---

# Principle 09 — Traceable Decisions

## Definition

Las decisiones importantes deben ser completamente trazables.

---

## Rationale

El contexto desaparece con el tiempo.

Atlas preserva el razonamiento.

---

## Rules

Toda Decision MUST registrar:

- Responsable
- Fecha
- Contexto
- Evidencia
- Alternativas
- Resultado

---

## Examples

```
Decision

↓

Evidence

↓

Knowledge
```

---

## Anti-patterns

- Decisiones sin contexto.
- Decisiones anónimas.

---

## Related Domains

- Decision
- Knowledge

---

# Principle 10 — Long-Term Thinking

## Definition

Atlas favorece decisiones sostenibles sobre soluciones temporales.

---

## Rationale

La arquitectura debe sobrevivir a las herramientas.

---

## Rules

- Las soluciones SHOULD minimizar deuda técnica.
- Las decisiones MUST considerar evolución futura.

---

## Anti-patterns

- Soluciones rápidas sin visión.
- Dependencias irreversibles.

---

## Related Domains

Todos.

---

# Principle 11 — Composable by Design

## Definition

Atlas se construye mediante componentes independientes que pueden combinarse.

---

## Rationale

La composición favorece reutilización y escalabilidad.

---

## Rules

- Los Domains SHOULD ser reutilizables.
- Los Assets SHOULD ser componibles.
- Los Workflows MAY reutilizar componentes existentes.

---

## Examples

```
Knowledge

+

Workflow

+

Agent

↓

Nuevo proceso
```

---

## Anti-patterns

- Componentes monolíticos.
- Dependencias rígidas.

---

## Related Domains

Todos.

---

# Principle 12 — Automation with Accountability

## Definition

Toda automatización debe tener un responsable identificado.

---

## Rationale

Automatizar no elimina la responsabilidad.

---

## Rules

- Toda automatización MUST tener Owner.
- Todo Agent MUST tener Supervisor.
- Toda acción automática SHOULD poder auditarse.

---

## Anti-patterns

- Automatizaciones huérfanas.
- Agentes sin supervisión.

---

## Related Domains

- Agent
- Workflow
- Governance

---

# Principle 13 — Reuse Before Creation

## Definition

Antes de crear un nuevo activo debe evaluarse la reutilización de uno existente.

---

## Rationale

La reutilización reduce complejidad y mejora consistencia.

---

## Rules

- Los Assets existentes SHOULD evaluarse primero.
- La duplicación MUST justificarse.

---

## Anti-patterns

- Crear desde cero por costumbre.
- Ignorar conocimiento existente.

---

## Related Domains

- Asset
- Knowledge

---

# Principle 14 — Security by Default

## Definition

La protección del conocimiento forma parte del diseño.

No constituye una etapa posterior.

---

## Rationale

El conocimiento organizacional representa uno de los activos más valiosos.

---

## Rules

- Todo Knowledge SHOULD clasificarse.
- Los accesos MUST respetar las Policies.
- Los Assets sensibles MUST protegerse.

---

## Anti-patterns

- Acceso irrestricto.
- Información sin clasificación.

---

## Related Domains

- Knowledge
- Policy
- Asset

---

# Principle 15 — Evolution over Revolution

## Definition

Atlas evoluciona mediante mejoras incrementales.

Evita cambios disruptivos innecesarios.

---

## Rationale

Los sistemas sostenibles evolucionan continuamente.

---

## Rules

- Los cambios SHOULD preservar compatibilidad.
- Los Domains MAY evolucionar sin afectar todo el ecosistema.

---

## Anti-patterns

- Reescrituras completas.
- Cambios incompatibles sin justificación.

---

## Related Domains

Todos.

---

# 5. Compliance

Toda implementación de Atlas SHALL cumplir estos Principles.

Las extensiones MAY agregar principios específicos.

Las extensiones SHALL NOT contradecir los Principles definidos en este documento.

---

# 6. Relationship with Other Foundation Documents

Este documento complementa:

- **ATLAS-001 — Manifesto**, que define el propósito y la visión de Atlas.
- **ATLAS-002 — Constitution**, que establece las normas fundamentales del sistema.
- **ATLAS-004 — Domain Model**, que define las entidades y relaciones del universo Atlas.
- **ATLAS-010 — Platform Mapping**, que establece el mapa oficial entre capas de la plataforma.

Los Principles representan el puente entre la filosofía y la implementación.

---

# 7. Change History

| Version | Date | Description |
|----------|------------|--------------------------------|
| 1.0.0 | 2026-07-13 | Initial Principles specification. |

---

# Final Statement

Los Principles de Atlas no describen una implementación tecnológica.

Describen una forma de diseñar organizaciones capaces de preservar conocimiento, escalar criterio y evolucionar con independencia de las herramientas.

Toda decisión arquitectónica futura deberá poder justificarse utilizando uno o más de estos Principles.

Cuando exista duda sobre una decisión de diseño, este documento tendrá prioridad sobre cualquier implementación específica.

