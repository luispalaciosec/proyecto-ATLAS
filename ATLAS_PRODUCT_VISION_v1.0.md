---
id: ATLAS-PRODUCT-VISION-001
title: ATLAS Product Vision v1.0
version: 1.2.0
status: Active
created: 2026-08-04
last_updated: 2026-09-09
owner: Luis Palacios
supersedes: none
relationship_to_governance: complementary to ADR-0001–ADR-0005, VERSION.md, ATLAS_ARCHITECTURE_MASTER.md
changelog: "v1.2.0 — estado actual ATLAS 4.x (INT-001–009): integración consolidada, LLM+Org+Governance+feedback warranty, persistencia Web; distingue capacidad actual vs visión futura. v1.1.0 — roadmap Phase 2 revisado."
---

# ATLAS Product Vision v1.0

## 1. Propósito de este documento

Este documento no es un ADR ni una decisión de arquitectura. Phase 1 (Foundation & MVP) está cerrada, verificada y congelada — ver `VERSION.md`. A partir de aquí, cualquier cambio de arquitectura debe surgir como consecuencia de una necesidad real descubierta durante el uso del producto, no al revés.

Este documento define **qué es ATLAS para quien lo usa**, no cómo está construido por dentro. Es la guía de referencia para decidir qué se construye en Phase 2 — Product, en qué orden, y qué queda deliberadamente fuera.

## 2. Dónde está ATLAS hoy

> **Distinción:** esta sección describe el **estado actual del producto** (post INT-001–009, ver `VERSION.md`). Las secciones 7–8 conservan el **roadmap Phase 2 original** como referencia histórica de planificación; varios frentes ya están entregados.

### Capacidad actual (ATLAS 4.x integrado)

- **Kernel Frozen v0.1** — `core`, `compiler`, `retrieval` sin cambios; integración en SDK/CLI/Web/Knowledge.
- **LLM generativo (P2.1–P2.2)** — `@atlas/llm` con tool-calling; `atlas chat`, Web `/chat`.
- **Marcas y workspaces (P2.3)** — memoria aislada por marca (`JsonFileStorageProvider` por workspace).
- **Feedback (P2.4 + INT-009)** — `/correct` en CLI; corrección estructurada warranty (45→60 días) persiste en OrgMemory y es retrievable; señales genéricas en Memory (camino paralelo, no aprendizaje automático general).
- **Web UI (P2.5 + Fase 3)** — SPA completa; persistencia conversación/actividad por workspace (INT-008).
- **Organización ATLAS 4.x** — entidades, políticas, decisiones, evidencia, versionado (OrgMemory).
- **Integración INT-001–009** — Retrieval unificado, Context Builder, Governance, resultados operacionales, ingest KnowledgeObject.
- **Tests (2026-09-09, `--force`):** SDK 158/158, Web 243/243, CLI 78/78, turbo 46/46 tasks, doctor HEALTHY.

### Lo que ATLAS aún no es (limitaciones reales)

- **No** es aprendizaje genérico de feedback — el caso canónico probado es warranty 45→60.
- **No** es cloud multi-dispositivo (P2.6 condicional, no autorizado).
- **No** es multi-usuario / RBAC.
- **No** es ATLAS 5 — el motor cognitivo completo (Reasoning → Planning estructurado) sigue siendo evolución futura sobre el Kernel congelado.

### Histórico — cierre Phase 1 (2026-08-04)

Al redactar la v1.0 de esta visión, Phase 1 había cerrado con Kernel congelado, capabilities certificadas y CLI MVP, **sin capacidad generativa**. Esa brecha motivó P2.1–P2.5. P2.1+ ya la cerró; el párrafo anterior ya no describe el producto actual.

## 3. Quién es el usuario

No es un desarrollador buscando "otro framework de agentes". Es Luis operando varios negocios pequeños en paralelo (Geeks, Revital, BlessLight, Iglesia, Stack) que necesita un sistema que:

- recuerde contexto de cada negocio sin que él tenga que repetirlo,
- ejecute trabajo real (planear, redactar, organizar) sin que él tenga que orquestar manualmente entre ChatGPT, notas sueltas y hojas de cálculo,
- se use hablando, no aprendiendo comandos.

El público objetivo de v1.0 es exactamente ese perfil: dueño de negocio pequeño con varias unidades/marcas, sin equipo técnico, que hoy usa una mezcla de ChatGPT + Notion + WhatsApp + memoria propia para sostener la operación.

## 4. Problema que resuelve

Hoy, gestionar varios negocios pequeños significa reconstruir el contexto cada vez: volver a explicarle a ChatGPT quién es el cliente, qué tono usa la marca, qué se decidió la semana pasada. La memoria vive en la cabeza del dueño, no en ninguna herramienta. Las herramientas de gestión (Notion, ClickUp, Monday) organizan tareas pero no piensan; los asistentes de IA (ChatGPT, Claude) piensan pero no recuerdan ni ejecutan.

ATLAS existe para cerrar esa brecha: un sistema que retiene contexto por negocio, razona sobre él, y ejecuta — sin que el usuario tenga que ser el pegamento entre herramientas.

## 5. Con quién compite (y con quién no)

**No** compite con ChatGPT, Claude o Cursor como modelos de lenguaje — ATLAS no entrena ni sirve un LLM propio, los orquesta.

**Sí** compite, en el terreno de gestión de conocimiento y trabajo, con Notion, ClickUp, Monday, Asana, Confluence, Obsidian — pero con inteligencia integrada desde el núcleo del sistema, no como un chatbot pegado encima de tableros estáticos.

La visión no es "el mejor framework de agentes". Es: **el sistema operativo para gestionar conocimiento y trabajo de empresas pequeñas.**

## 6. Experiencia objetivo

Hoy:

```bash
atlas plan --goal "..."
atlas memory search --query "..."
atlas retrieval ...
```

Objetivo de v1.0:

```bash
atlas
```

Y conversar. Un solo punto de entrada, contexto cargado automáticamente por marca/workspace, sin que el usuario necesite saber que por debajo hay Retrieval, Planning, Workflow y Memory como capabilities separadas.

## 7. Roadmap de Phase 2 — Product

Seis frentes, en el orden que determina cuál habilita a cuál — no en el orden en que suenan más atractivos. Esta secuencia es la v2 del roadmap: corrige y fusiona una primera propuesta (5 frentes) y una segunda propuesta externa (7 frentes, incluía "Plugins") tras evaluar dependencias reales entre ellos.

### P2.1 — LLM Adapter (bloqueante, va primero)

Conectar un modelo real (OpenAI, Claude, Gemini o local) al pipeline de Planning/Workflow, **incluyendo tool-calling hacia las capabilities internas de ATLAS desde el día uno** (Memory, Workflow) — no solo generación de texto. Hoy no existe ninguna llamada generativa en el código, y sin la capacidad de que el modelo invoque acciones reales sobre Memory/Workflow, todo lo que produzca es texto que nadie ejecuta. Es la pieza que falta para que cualquier otra cosa en este roadmap tenga sentido.

**Criterio de aceptación no negociable:** control de costo desde el inicio — límite de tokens/presupuesto configurable por invocación. No es una fase aparte, es parte de dar por cerrado P2.1.

**Nota de secuencia:** un borrador anterior ponía LLM Adapter en paralelo con UX, y una propuesta externa separaba "Tools" como frente independiente después de Brands. Ambas se corrigen aquí: sin tool-calling interno desde P2.1, el "momento wow" de P2.3 es literalmente imposible de construir.

### P2.2 — Conversación

Colapsar `atlas memory` / `atlas plan` / `atlas retrieval` en una sola experiencia: `atlas`, y conversar. Esto es principalmente una capa sobre `atlas chat` (ya existe y tiene tests) más el LLM Adapter de P2.1 — no requiere arquitectura nueva.

### P2.3 — Brands & Workspaces

El mayor valor de producto de todo el roadmap, y se construyen juntos porque uno sin el otro no funciona: `atlas brand geeks` carga automáticamente propósito, tono, procesos, memoria, clientes, prompts y reglas de esa marca — pero solo tiene sentido si esa memoria está **aislada** de Revital, BlessLight, Iglesia y Stack. Brand sin Workspace es una etiqueta sobre memoria compartida, no aislamiento real. Después de esto: *"Haz una campaña para Banco Machala"* y ATLAS produce algo usable, con el contexto correcto ya cargado y sin contaminación de otro negocio. Este es el primer momento en que un usuario diría "esto no lo hace ni ChatGPT ni Notion".

**Nota de esfuerzo:** esto no es wiring, es diseño de dominio nuevo. Memory hoy opera sobre un único namespace fijo (`cli.default`) en el código del MVP. Modelar "Brand/Workspace" como concepto de primera clase — con su propio contexto, memoria aislada y reglas — es trabajo real, aunque reutilice Memory y Retrieval tal como están certificados.

### P2.4 — Feedback Loop

Ninguna versión anterior de este roadmap cubría cómo ATLAS mejora con el uso. Sin esto, cada campaña o plan parte del mismo punto de partida para siempre. Cuando Luis corrija o rechace un output de una marca, esa corrección se guarda en Memory como señal asociada a ese Workspace — reutiliza Memory tal como está certificado, no requiere capability nueva. Es lo que convierte a ATLAS en algo que compone valor con el tiempo en vez de repetir la misma calidad cada vez.

### P2.5 — Web UI

Deliberadamente después de que el núcleo conversacional (P2.1–P2.4) funcione bien en CLI. Construir interfaz gráfica antes de validar que la conversación + Brands + feedback funcionan sería invertir esfuerzo en la capa equivocada primero.

### P2.6 — Cloud

No se activa por defecto ni por completar la lista. Se activa solo si aparece la necesidad real de acceder a ATLAS desde otro dispositivo (teléfono, otra laptop). Implica una decisión de infraestructura real — hosting, manejo de secretos/API keys, y probablemente reemplazar `JsonFileStorageProvider` por un storage remoto — comparable en magnitud a una decisión de arquitectura, aunque no requiera un ADR si surge de una necesidad de uso concreta (ver Sección 9).

**Explícitamente fuera de Phase 2: Plugins.** Un sistema de extensibilidad para terceros resuelve un problema de escala que no existe — hoy ATLAS tiene un solo usuario. Ver Sección 8.

## 8. Dentro y fuera de alcance para v1.0

**Dentro:**

- P2.1 LLM Adapter con al menos un proveedor real, con tool-calling interno y control de costo desde el inicio.
- P2.2 experiencia conversacional unificada (`atlas` como único comando de entrada).
- P2.3 Brand + Workspace como concepto único, con memoria aislada por negocio.
- P2.4 feedback loop básico (corrección → señal guardada en Memory del Workspace correspondiente).
- Persistencia de memoria por workspace (ya existe la base: `JsonFileStorageProvider`).

**Fuera de v1.0 (explícitamente, no por olvido):**

- ~~Web UI (P2.5)~~ — **Entregada** (Fase 3 + persistencia INT-008).
- Cloud (P2.6) — solo si aparece necesidad real de acceso multi-dispositivo; no es un entregable garantizado de v1.0.
- **Plugins** — sistema de extensibilidad para terceros. Resuelve un problema de escala que no existe con un solo usuario. No entra en Phase 2; se reevalúa solo si el uso real de 2 meses muestra una necesidad concreta.
- Multi-usuario / permisos — ATLAS v1.0 es de un solo operador.
- Integraciones externas (WhatsApp, email, CRMs) — se evalúan solo si aparece una necesidad real de un workspace concreto.
- Cualquier nuevo ADR, contrato o revisión arquitectónica que no derive de un bloqueo real de uso.

## 9. Gobernanza durante Phase 2

Arquitectura congelada por los próximos 2 meses. Durante ese periodo solo se aceptan tres tipos de cambio:

1. Bugs.
2. Performance.
3. Cambios descubiertos porque un usuario (Luis, en la práctica) quiso hacer algo concreto y no pudo.

Nada de refactors especulativos, nada de "mientras estamos aquí mejoremos X". Este documento — no un ADR nuevo — es la referencia para decidir si algo entra en el roadmap.

## 10. Criterio de éxito

ATLAS v1.0 (Phase 2 completa) se considera exitoso si, para al menos un negocio real de Luis:

- se puede invocar `atlas brand <nombre>` y obtener una respuesta con el contexto correcto de esa marca, sin repetir información manualmente;
- el resultado de una tarea (ej. una campaña, un resumen, un plan) es usable sin edición pesada;
- Luis prefiere usar ATLAS antes que abrir ChatGPT + Notion por separado para esa tarea específica.

Si no se cumple lo anterior para ningún negocio después de P2.3, la prioridad de los frentes siguientes (P2.4–P2.6) se reevalúa — no se avanza por inercia de roadmap.

## 11. Preguntas abiertas para el Owner

- ¿Qué proveedor de LLM para P2.1: OpenAI, Claude, Gemini, o modelo local? Afecta costo y latencia, no arquitectura.
- ¿Cuál de los cinco negocios sirve como primer caso de prueba de P2.3 (Brands & Workspaces)?
- ¿El criterio de éxito de la sección 10 se valida informalmente (uso real de Luis) o se define un checklist explícito antes de declarar P2.3 cerrado?
- ¿Qué forma toma el feedback de P2.4 en la práctica: un comando explícito (`atlas correct ...`), o detección implícita de que Luis reescribió/descartó un output?

Estas preguntas no bloquean el inicio de P2.1 — se resuelven en paralelo.
