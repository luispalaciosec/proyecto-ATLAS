---
id: ADR-0001
title: Document ID Namespace — ATLAS-002 Collision
version: 1.0.0
status: accepted
date: 2026-07-19
deciders: Atlas Architecture Board
depends_on:
  - ATLAS-012-REPOSITORY_GOVERNANCE
  - ATLAS-013-NAMING_CONVENTIONS
---

# ADR-0001 — Document ID Namespace (Colisión ATLAS-002)

## Status

**Accepted** — 2026-07-19

## Context

Durante el Milestone 2 (Repository Stabilization), se detectó que dos documentos distintos comparten el identificador `ATLAS-002`:

| Documento | Ubicación actual | Serie | Título |
|-----------|------------------|-------|--------|
| Constitution | `spec/foundation/ATLAS-002-CONSTITUTION.md` | Foundation | Atlas Constitution |
| Conceptual Model | `spec/product/ATLAS-002-CONCEPTUAL_MODEL.md` | Product | Atlas Conceptual Model |

Ambos documentos declaran `id: ATLAS-002` en su frontmatter YAML.

Esta colisión viola el principio de identificadores únicos definido en `ATLAS-013-NAMING_CONVENTIONS` y dificulta:

- referencias cruzadas por ID;
- automatización (lint, registry, generación de docs);
- trazabilidad en ADRs, RFCs y reportes de sprint.

La migración física a `spec/product/` **no resolvió** la colisión de identificador — solo la ubicación del archivo.

## Decision

### 1. Namespace oficial por serie

Cada serie documental SHALL usar un prefijo de identificador exclusivo:

| Serie | Prefijo de ID | Ejemplo |
|-------|---------------|---------|
| Foundation | `ATLAS-NNN` | `ATLAS-002` (Constitution) |
| Architecture | `ATLAS-ARCH-NNN` | `ATLAS-ARCH-002` |
| Domain | `ATLAS-DOM-NNN` | `ATLAS-DOM-001` |
| Engine | `ATLAS-NNN` (100+) | `ATLAS-102` |
| SDK / Interfaces | `ATLAS-2NN` | `ATLAS-202` |
| Product | **`ATLAS-PROD-NNN`** | `ATLAS-PROD-001` (futuro) |
| Capability | `{CAP}-NNN` | `KNOWLEDGE-001` |
| ADR | `ADR-NNNN` | `ADR-0001` |
| RFC | `RFC-NNNN` | `RFC-0001` |

### 2. Resolución de la colisión ATLAS-002

- **`ATLAS-002` queda reservado exclusivamente** para `spec/foundation/ATLAS-002-CONSTITUTION.md` (Atlas Constitution).
- **`spec/product/ATLAS-002-CONCEPTUAL_MODEL.md` conserva su identificador `ATLAS-002` temporalmente** — no se renombra en este ADR.
- El identificador canónico futuro del Conceptual Model será **`ATLAS-PROD-001`** cuando se ejecute la migración de IDs (Milestone futuro, fuera de Sprint 9.1).

### 3. Regla de precedencia

Cuando un identificador `ATLAS-NNN` (sin sufijo de serie) aparece en contexto ambiguo:

1. Resolver primero contra `spec/foundation/`.
2. Si no existe, resolver contra la serie indicada en el frontmatter (`phase`, `category`, o ruta bajo `spec/`).
3. Nunca asumir unicidad global de `ATLAS-NNN` sin verificar la serie.

### 4. Prohibición

No SHALL crearse nuevos documentos en `spec/product/` con identificadores `ATLAS-NNN` sin prefijo de serie. Los futuros documentos de Product usarán **`ATLAS-PROD-*`** desde su creación.

## Consequences

### Positivas

- Namespace claro para la serie Product sin afectar Foundation.
- Constitution mantiene `ATLAS-002` — referencias históricas intactas.
- Sprint 9.1 puede alinear documentación sin renombrar archivos.

### Negativas / deuda pendiente

- La colisión física persiste hasta una migración de IDs dedicada.
- Herramientas automatizadas deben tratar `ATLAS-002` como ambiguo hasta la migración.
- `ATLAS-013-NAMING_CONVENTIONS` deberá actualizarse formalmente para incluir `ATLAS-PROD-*` (pendiente).

### Acciones explícitamente fuera de alcance (Sprint 9.1)

- Renombrar `ATLAS-002-CONCEPTUAL_MODEL.md` → `ATLAS-PROD-001-CONCEPTUAL_MODEL.md`
- Modificar frontmatter de Constitution o Conceptual Model
- Actualizar referencias cruzadas al nuevo ID de Product

Estas acciones requerirán un sprint de migración de IDs con plan dedicado.

## Alternatives Considered

| Alternativa | Resultado |
|-------------|-----------|
| Renombrar Constitution a otro ID | ❌ Rechazada — Constitution es referencia constitucional estable |
| Renombrar Conceptual Model inmediatamente | ❌ Diferida — Sprint 9.1 es solo documentación |
| Mantener colisión indefinidamente | ❌ Rechazada — se documenta resolución futura |
| Usar `ATLAS-002-PRODUCT` como ID | ❌ Rechazada — inconsistente con convención de prefijos de serie |

## References

- `spec/foundation/ATLAS-002-CONSTITUTION.md`
- `spec/product/ATLAS-002-CONCEPTUAL_MODEL.md`
- `spec/foundation/ATLAS-013-NAMING_CONVENTIONS.md`
- `releases/REPOSITORY_MIGRATION_REPORT.md` §9.1 (colisión documentada)
- `adr/README.md` (contexto previo a este ADR)
