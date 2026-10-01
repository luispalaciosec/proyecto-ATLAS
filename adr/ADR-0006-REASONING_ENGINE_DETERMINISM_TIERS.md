---
id: ADR-0006
title: Reasoning Engine Determinism Tiers
version: 1.0.0
status: accepted
date: 2026-09-30
deciders: Luis
depends_on:
  - ADR-0002-PLANNING_CONSOLIDATION
  - ATLAS-INTELLIGENCE-CONTRACT-004-REASONING_ENGINE
  - ATLAS-REASONING-003-ENGINE
  - ATLAS-REASONING-005-TRACE
---

# ADR-0006 — Reasoning Engine Determinism Tiers

## Status

**Accepted** — 2026-09-30

---

## Context

Dos familias de especificaciones describen el motor de razonamiento con reglas distintas sobre aleatoriedad y motores probabilísticos.

**Familia `spec/reasoning/` (determinismo estricto):**

- `spec/reasoning/ATLAS-REASONING-001-DOMAIN.md` (principio *Deterministic*): «Given identical inputs, the reasoning process must always produce identical outputs.» / «**No randomness is permitted.**»
- `spec/reasoning/ATLAS-REASONING-003-ENGINE.md` (requisito de repetibilidad): «Same Retrieval ↓ Same Reasoning Result» / «**No randomness is permitted.**»
- Contratos Reasoning (ej. `ATLAS-REASONING-CONTRACT-002-REASONING_STRATEGY.md`): «Random behavior is prohibited.»; `ATLAS-REASONING-CONTRACT-004-TRACE_PROVIDER.md`: «Trace generation must never contain randomness.»

**Familia `spec/intelligence/` (orquestación y proveedores):**

- `spec/intelligence/ATLAS-INTELLIGENCE-005-REASONING.md` § *Deterministic Orchestration*: «**Aunque los motores utilizados puedan ser probabilísticos, el proceso de orquestación deberá permanecer determinístico.**» § *Long-Term Vision* incluye «**razonamiento probabilístico**» y motores fundacionales intercambiables.
- `spec/intelligence/contracts/ATLAS-INTELLIGENCE-CONTRACT-004-REASONING_ENGINE.md` § *Reasoning Independence*: admite «**modelos fundacionales (LLMs)**», «**motores probabilísticos**», etc. § *Determinism*: «Cuando la implementación sea probabilística, deberá permitir mecanismos de control que favorezcan la reproducibilidad cuando el contexto operativo lo requiera.»

Sin esta ADR, un implementador no puede cumplir literalmente ambos juegos de specs a la vez.

---

## Decision

1. **ReasoningEngine es un puerto** (`ATLAS-INTELLIGENCE-CONTRACT-004`). Cualquier implementación concreta es un **proveedor intercambiable** registrado detrás de ese contrato.

2. **Nivel T0 — determinista:** función pura; misma entrada produce la misma salida. Es el **proveedor por defecto** y el **único** admitido cuando la salida alimenta directamente una **autorización** (decisión vinculante, gate de governance).

3. **Nivel T1 — reproducible:** se admiten proveedores probabilísticos (p. ej. inferencia con salida tipada, modelos de decisión bajo contrato) **solo si** declaran nivel T1 y **registran** solicitud, respuesta, identificador y versión del proveedor, y parámetros relevantes. La **reproducción** reutiliza la respuesta registrada y **no** vuelve a invocar al proveedor.

4. Quedan **prohibidos** en Reasoning los proveedores que **no puedan registrarse ni reproducirse** según lo anterior.

5. **Ninguna salida T1 autoriza por sí sola.** La autorización permanece en el **governance gate**. T1 aporta confianza y ordenamiento de alternativas, no sustituye la autoridad humana ni políticas.

6. La **traza de Reasoning** (`ATLAS-REASONING-005-TRACE` y contratos de trace) la produce **ATLAS de forma determinista** a partir de entradas, registro y metadatos del proveedor, aunque el proveedor no explique internamente su resultado.

7. Las specs enmendadas por esta ADR (notas al inicio) **no reescriben** el texto histórico; **ADR-0006 prevalece** ante contradicción sobre determinismo y niveles T0/T1.

---

## Consequences

**Permitido:**

- Múltiples proveedores Reasoning detrás del mismo puerto CONTRACT-004.
- T0 como camino por defecto y obligatorio en caminos que alimentan autorización.
- T1 con registro auditable y replay sin re-invocación del proveedor.
- Orquestación determinística de ATLAS independiente del nivel del proveedor.

**Prohibido:**

- Proveedores Reasoning sin registro/reproducibilidad T1.
- Usar salida T1 como autorización automática.
- Ignorar trazas deterministas de ATLAS por opacidad del proveedor.

**Sin cambio:**

- **Planning permanece congelado** según `ADR-0002` (consolidación pospuesta; no se modifica código ni deuda aceptada de Planning en este ADR).

---

## Out of scope

- Implementación de `@atlas/reasoning` o selección de proveedor concreto.
- Modificación de paquetes bajo `packages/` o `apps/`.
- Resolución de otros open issues de Reasoning distintos al conflicto de determinismo entre familias de specs.
