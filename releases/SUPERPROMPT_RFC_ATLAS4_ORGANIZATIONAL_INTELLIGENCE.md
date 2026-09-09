# Superprompt — ATLAS 4: Auditoría + RFC de Organizational Intelligence (sin código)

## Contexto

ATLAS 3 (Pilot Foundation) está prácticamente conseguido: Web, Chat, Marcas,
Knowledge, búsqueda, biblioteca, Excel, correcciones, accesibilidad,
responsive, estabilidad. El siguiente paso NO es otra feature de UI — es que
ATLAS deje de razonar sobre **documentos** y empiece a razonar sobre
**entidades, hechos, relaciones, políticas y decisiones**.

Ya tenemos dos casos reales validados en pruebas en vivo (no hipótesis) que
este trabajo debe explicar:

1. **Descuento condicionado a política.** "¿Puedo ofrecerle 12% de descuento
   a Constructora Andes?" → requiere cruzar: cliente VIP, renovación activa,
   política de descuento ≤10% autónomo, quién aprueba por encima de eso.
2. **Conocimiento que cambia en el tiempo.** El plazo de garantía pasó de 45
   a 60 días. ATLAS necesita poder distinguir la política vigente de la
   política anterior, no solo devolver ambos números sin saber cuál manda.

## Regla no negociable

- **No se escribe ni modifica código en esta tarea.** Es investigación +
  un documento. Ningún archivo de implementación se toca.
- No se necesita ADR para esta tarea porque no hay cambios — pero el RFC
  resultante SÍ debe decir explícitamente si su implementación futura
  tocaría la superficie pública de `@atlas/memory` (certified) y por tanto
  requeriría ADR, o si se puede hacer completo en `@atlas/sdk` sin tocarlo.
- El único entregable es un archivo Markdown:
  `releases/RFC_ATLAS4_ORGANIZATIONAL_INTELLIGENCE.md`.

## Paso 1 (obligatorio, primero) — Auditoría de lo que YA existe en `@atlas/memory`

Antes de diseñar nada nuevo, hay que confirmar qué de esto ya está construido
en el paquete certificado `@atlas/memory` y simplemente no se usa. Ya
verifiqué esto parcialmente leyendo el código — confírmalo y profundízalo:

Leer y reportar sobre:
- `packages/memory/src/domain/entities/record.ts`
- `packages/memory/src/domain/entities/relationship.ts`
- `packages/memory/src/domain/entities/version.ts`
- `packages/memory/src/domain/entities/collection.ts`
- `packages/memory/src/domain/entities/namespace.ts`
- `packages/memory/src/domain/value-objects/relationship-type.ts`
- `packages/memory/src/domain/value-objects/record-status.ts`
- `packages/memory/src/domain/value-objects/record-type.ts`
- `packages/memory/src/repositories/RelationshipRepository.ts`
- `packages/memory/src/repositories/VersionRepository.ts`
- `packages/memory/src/repositories/CollectionRepository.ts`
- `packages/memory/src/repositories/NamespaceRepository.ts`
- `packages/memory/src/engine/MemoryEngine.ts` (cómo conecta estos repos)
- `packages/sdk/src/modules/memory-module.ts` (qué de todo esto llega
  realmente al SDK — ya confirmé que `searchContent`/`storeContent` solo
  exponen `{ id, type, content, metadata }` plano; ninguna mención de
  relationship o version)
- `packages/retrieval` (si hay algo relevante de estructura/relaciones ahí
  también, repórtalo)

**Entregable del Paso 1:** una tabla "Qué ya existe vs qué falta" que mapee
cada concepto (Entity, Fact, Relationship, Policy, Decision, Evidence,
Knowledge Version, Context, Event, Action) a uno de tres estados:

- **Ya existe** — cita archivo y línea exacta del primitivo reusable.
- **Existe parcialmente** — qué hay, qué le falta para servir.
- **No existe** — hay que diseñarlo desde cero.

Nada de "probablemente existe" — solo lo que se confirme leyendo el código.

## Paso 2 — Modelo mínimo, acotado a los dos casos reales

No diseñes la taxonomía completa de una vez. Diseña **solo** lo necesario
para resolver, paso a paso, con estructuras de datos concretas (no
abstractas), los dos casos de la sección Contexto:

- Caso 1 (Constructora Andes / descuento 12%): mostrar cómo se representarían
  el cliente, la política de descuento, el umbral, y la regla de aprobación,
  usando (siempre que sea posible) los primitivos ya existentes del Paso 1 en
  vez de inventar nuevos.
- Caso 2 (garantía 45→60 días): mostrar cómo `Version`/`RecordStatus` (si
  aplican) representarían la política vieja vs la vigente, y cómo una
  búsqueda sabría cuál es la verdad actual sin perder la anterior como
  historial auditable.

Para cada caso, trazar cómo se resolvería una pregunta del usuario usando el
modelo propuesto — no solo el modelo en abstracto.

**Explícitamente fuera de alcance de este RFC** (anotar como backlog para un
RFC futuro, no diseñar ahora): taxonomía completa de subtipos de Entity
(Person/Organization/Client/Product/Project/Department), formalización de
Decision/Evidence más allá de los dos casos, Context/Event/Action. Nómbralos
en una sección "Fuera de alcance — v2" y ya.

## Paso 3 — Plan de implementación de ATLAS 4.1 (estimado, no ejecutado)

- ¿Qué se extiende en `@atlas/memory` (si algo) vs qué se agrega nuevo,
  completo, en `@atlas/sdk`?
- ¿Esto requeriría ADR? Responder explícitamente sí/no y por qué.
- Estimado de tamaño del vertical slice mínimo (A. Entities reconocidas,
  B. Relationships, C. Policies aplicadas) — archivos nuevos/modificados
  aproximados, no fechas.
- Riesgos: qué podría romperse, qué suites de test existentes hay que correr
  para confirmar que no se rompió nada (aunque en esta tarea no se ejecute
  código, listar cuáles).

## Formato de entrega

Un solo archivo: `releases/RFC_ATLAS4_ORGANIZATIONAL_INTELLIGENCE.md`. No
crear código, no crear otros archivos. Al terminar, pega el contenido
completo del documento en tu respuesta para que lo revisemos antes de
autorizar cualquier siguiente paso.
