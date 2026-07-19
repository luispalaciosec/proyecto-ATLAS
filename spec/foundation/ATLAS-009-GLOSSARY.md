---
id: ATLAS-009
title: Atlas Glossary
version: 1.0.0
status: draft
owner: Atlas Foundation
classification: public
created: 2026-07-13
last_updated: 2026-07-13
purpose: >
  Definir el vocabulario oficial de Atlas. Este documento establece el
  significado normativo de los términos utilizados en Foundation y garantiza
  un lenguaje consistente entre personas, agentes de IA y futuras
  implementaciones.
---

# ATLAS-009 — Glossary

> "Un lenguaje compartido es la base de una inteligencia compartida."

---

# 1. Purpose

El Glossary constituye el vocabulario oficial de Atlas.

Su objetivo es asegurar que todos los participantes del ecosistema interpreten
los conceptos de la misma manera.

Cuando exista una diferencia de interpretación entre documentos, este Glossary
tendrá prioridad sobre el significado coloquial de las palabras.

---

# 2. Scope

Este documento aplica a:

- Atlas Foundation
- Atlas Engine
- Atlas Knowledge
- Atlas Organization
- Atlas Brands
- Atlas Agents
- Toda implementación derivada

---

# 3. Usage Rules

- Cada término posee un único significado oficial.
- Los términos definidos aquí SHALL utilizarse de forma consistente.
- Ningún documento podrá redefinir estos términos.
- Las futuras versiones podrán ampliar el vocabulario, pero no modificar el
  significado de términos existentes sin una nueva versión mayor.

---

# 4. Glossary

---

## Agent

Entidad capaz de ejecutar trabajo dentro del ecosistema Atlas.

Un Agent puede ser humano, inteligencia artificial o híbrido.

Los Agents ejecutan tareas.

Nunca poseen autoridad organizacional.

Related:

- Governance
- Workflow
- Role

---

## Architecture

Conjunto de principios, estructuras y relaciones que organizan el ecosistema Atlas.

La arquitectura describe cómo está organizado el sistema, no cómo se implementa.

---

## Asset

Recurso reutilizable utilizado por uno o más Domains.

Ejemplos:

- Documento
- Plantilla
- Prompt
- Video
- Imagen
- Código
- Dataset
- Modelo

Todo Asset posee un Owner.

---

## Boundary

Límite explícito entre dos Domains.

Define responsabilidades y evita acoplamiento innecesario.

---

## Brand

Identidad administrada por una Organization.

Una Brand posee:

- personalidad
- posicionamiento
- tono
- identidad visual
- audiencia

---

## Capability

Capacidad permanente de producir valor.

No representa personas.

No representa procesos.

Representa habilidades organizacionales.

---

## Constitution

Documento fundamental que establece las reglas permanentes de Atlas.

Tiene prioridad sobre cualquier implementación.

---

## Decision

Elección registrada realizada por una autoridad responsable.

Toda Decision:

- posee contexto
- utiliza evidencia
- genera aprendizaje
- produce Knowledge

---

## Domain

Área claramente delimitada de responsabilidad dentro del ecosistema Atlas.

Cada Domain posee:

- propósito
- Owner
- límites
- responsabilidades

---

## Domain Model

Modelo conceptual oficial que describe las entidades y relaciones del universo Atlas.

---

## Evidence

Información utilizada para respaldar una Decision.

Puede ser:

- Opinión
- Juicio experto
- Evidencia histórica
- Datos cuantitativos
- Experimentación

---

## Foundation

Conjunto de documentos normativos que definen Atlas.

Foundation constituye la base permanente del ecosistema.

---

## Governance

Sistema mediante el cual Atlas distribuye autoridad, protege la arquitectura y supervisa la evolución del ecosistema.

---

## Knowledge

Conocimiento estructurado reutilizable.

Representa el activo más importante de Atlas.

Todo Knowledge posee:

- Owner
- versión
- estado
- origen
- evidencia

---

## Manifesto

Documento que expresa el propósito y la visión de Atlas.

Representa la filosofía del proyecto.

---

## Metric

Medición utilizada para evaluar resultados.

Las Metrics apoyan decisiones.

Nunca reemplazan criterio.

---

## Ontology

Lenguaje oficial de Atlas.

Define el significado preciso de todos los conceptos fundamentales del ecosistema.

---

## Organization

Entidad capaz de perseguir objetivos mediante personas, conocimiento y capacidades.

Puede representar:

- Empresa
- Agencia
- Iglesia
- Fundación
- Startup
- Equipo

---

## Owner

Persona o rol responsable de una Entity.

Todo elemento importante de Atlas posee exactamente un Owner.

---

## Policy

Regla organizacional que gobierna comportamientos.

Las Policies restringen.

Nunca ejecutan trabajo.

---

## Principle

Ley arquitectónica que guía el diseño y evolución de Atlas.

Los Principles tienen prioridad sobre implementaciones específicas.

---

## Process

Secuencia estable de actividades orientadas a producir un resultado.

Los Processes describen.

Los Workflows ejecutan.

---

## Process Owner

Persona o Role responsable de mantener, mejorar y supervisar un Process.

El Process Owner no necesariamente ejecuta el proceso.

Su responsabilidad consiste en garantizar su calidad y evolución.

---

## Role

Conjunto de responsabilidades asignables dentro de una Organization.

Un Role representa una función.

Nunca representa una persona específica.

Una persona puede desempeñar múltiples Roles.

Un Role puede ser desempeñado por múltiples personas a lo largo del tiempo.

---

## Standard

Conjunto de reglas o especificaciones utilizadas para garantizar consistencia entre múltiples implementaciones.

Los Standards reducen variabilidad.

---

## Strategy

Conjunto de objetivos y decisiones que orientan la evolución de una Organization.

La Strategy define dirección.

No define ejecución.

---

## Supervisor

Persona responsable de revisar y aprobar el trabajo realizado por uno o más Agents.

Todo Agent deberá operar bajo un Supervisor.

---

## Traceability

Capacidad de reconstruir completamente el historial de una Entity.

La trazabilidad permite responder:

- qué cambió
- quién lo cambió
- cuándo ocurrió
- por qué ocurrió
- qué impacto produjo

La trazabilidad constituye uno de los pilares de Atlas.

---

## Version

Identificador utilizado para representar la evolución de una Entity.

Atlas recomienda utilizar Semantic Versioning.

Ejemplo.

```text
Major.Minor.Patch

1.0.0
```

---

## Vision

Estado futuro deseado por una Organization.

La Vision orienta la Strategy.

La Strategy orienta la operación.

---

## Workflow

Instancia operacional de un Process.

Mientras un Process representa el diseño,

un Workflow representa la ejecución.

Todo Workflow:

- pertenece a un Process
- genera evidencia
- produce Knowledge
- puede ser ejecutado por personas o Agents

---

## Workflow Owner

Persona responsable de la correcta ejecución y mejora continua de un Workflow.

El Workflow Owner garantiza que la ejecución permanezca alineada con el Process correspondiente.

---

# 5. Acronyms

| Acronym | Meaning |
|----------|---------|
| AI | Artificial Intelligence |
| ADR | Architecture Decision Record |
| API | Application Programming Interface |
| KPI | Key Performance Indicator |
| OKR | Objectives and Key Results |
| SOP | Standard Operating Procedure |
| RFC | Request for Comments |

Las implementaciones podrán añadir nuevos acrónimos siempre que no entren en conflicto con este documento.

---

# 6. Naming Conventions

Atlas adopta las siguientes convenciones de nomenclatura.

## Documents

```text
ATLAS-XXX-NAME.md
```

Ejemplos.

```text
ATLAS-001-MANIFESTO.md

ATLAS-006-GOVERNANCE.md
```

---

## Domains

Los nombres de Domains utilizarán PascalCase.

Ejemplos.

```text
Knowledge

Capability

Workflow

Decision
```

---

## Files

Los archivos utilizarán MAYÚSCULAS para el identificador y guiones para separar palabras.

Ejemplo.

```text
ATLAS-004-DOMAIN_MODEL.md
```

---

## Entities

Las Entities deberán poseer nombres descriptivos, únicos dentro de su contexto y estables en el tiempo.

---

# 7. Reserved Words

Los siguientes términos quedan reservados dentro del ecosistema Atlas.

- Agent
- Architecture
- Asset
- Boundary
- Brand
- Capability
- Constitution
- Decision
- Domain
- Evidence
- Foundation
- Governance
- Knowledge
- Manifesto
- Metric
- Ontology
- Organization
- Owner
- Policy
- Principle
- Process
- Role
- Strategy
- Supervisor
- Traceability
- Version
- Vision
- Workflow

Estos términos no deberán redefinirse en documentos posteriores.

---

# 8. Cross References

Este Glossary consolida la terminología utilizada por:

- ATLAS-001 — Manifesto
- ATLAS-002 — Constitution
- ATLAS-003 — Principles
- ATLAS-004 — Domain Model
- ATLAS-005 — Boundaries
- ATLAS-006 — Governance
- ATLAS-007 — Decision Model
- ATLAS-008 — Ontology
- ATLAS-010 — Platform Mapping

Toda nueva documentación deberá utilizar este vocabulario como referencia oficial.

---

# 9. Evolution Rules

El Glossary podrá evolucionar siguiendo las siguientes reglas.

- Nuevos términos MAY añadirse.
- Los términos existentes SHALL preservar su significado.
- Las redefiniciones conceptuales requerirán una nueva versión mayor de Foundation.
- Toda modificación deberá registrarse en el historial de cambios.

---

# 10. Change History

| Version | Date | Description |
|----------|------------|-----------------------------------------|
| 1.0.0 | 2026-07-13 | Initial glossary specification. |

---

# Final Statement

El Glossary constituye el vocabulario oficial del ecosistema Atlas.

Su propósito no es únicamente definir palabras, sino preservar un lenguaje común entre personas, organizaciones y agentes de inteligencia artificial.

Cada término representa un concepto estable sobre el cual se construyen los documentos, procesos y capacidades de Atlas.

Mientras el **Manifesto** define el propósito, la **Constitution** establece las reglas, los **Principles** orientan el diseño, el **Domain Model** describe la estructura, la **Ontology** define el significado, **Governance** protege la evolución y el **Decision Model** guía el razonamiento, el **Glossary** asegura que todos hablen exactamente el mismo idioma.

Preservamos el conocimiento.

Amplificamos el criterio.

Escalamos la inteligencia.