# Atlas Documentation

Official specification documents live under `spec/` at the repository root:

| Directory | Content |
|-----------|---------|
| `../spec/foundation/` | Identity, principles, platform mapping |
| `../spec/architecture/` | System and package architecture |
| `../spec/domain/` | Domain model specifications |
| `../spec/engine/` | Engine module specifications |
| `../spec/sdk/` | SDK and interface specifications |
| `../spec/capabilities/` | Capability specifications (e.g. `knowledge/`) |
| `../spec/product/` | Product conceptual model |

Executable packages live in `../packages/`.

Architecture proposals (RFCs) live in [`proposals/rfc/`](./proposals/rfc/).

## Guides (human-oriented)

| Document | Audience | Purpose |
|----------|----------|---------|
| [WEB_UI_PRODUCT_UX.md](./WEB_UI_PRODUCT_UX.md) | Product / UX / Frontend | Propuesta P2.5.x — sitemap, design system, journeys, criterios |
| [../releases/WEB_UI_PHASE_3_IMPLEMENTATION.md](../releases/WEB_UI_PHASE_3_IMPLEMENTATION.md) | Product / Frontend | Fase 3 entregables 1–4 — scaffold, shell, i18n, chat v2 |
| [../releases/WEB_UI_WORLD_CLASS_PRODUCT_REVIEW.md](../releases/WEB_UI_WORLD_CLASS_PRODUCT_REVIEW.md) | Product / UX / Frontend | **Pre-Implementation Gate** — revisión world-class, decisiones, roadmap 3B–3J |
| [../releases/WEB_UI_PHASE_3D_B_IMPLEMENTATION.md](../releases/WEB_UI_PHASE_3D_B_IMPLEMENTATION.md) | Product / Frontend | Fase 3D+3B — historial, Home accionable, Conocimiento, retry |
| [../releases/WEB_UI_PHASE_3E_IMPLEMENTATION.md](../releases/WEB_UI_PHASE_3E_IMPLEMENTATION.md) | Product / Frontend | Fase 3E — browse/search Conocimiento + integración Chat |
| [../releases/WEB_UI_PHASE_3F_ACTIVITY_DESIGN.md](../releases/WEB_UI_PHASE_3F_ACTIVITY_DESIGN.md) | Product / Frontend | Fase 3F — diseño Actividad (pre-implementación) |
| [../releases/WEB_UI_PHASE_3F_IMPLEMENTATION.md](../releases/WEB_UI_PHASE_3F_IMPLEMENTATION.md) | Product / Frontend | Fase 3F — Actividad timeline + Home |
| [../releases/WEB_UI_PHASE_3G2_IMPLEMENTATION.md](../releases/WEB_UI_PHASE_3G2_IMPLEMENTATION.md) | Product / Frontend | Fase 3G.2 — UI Marcas (`/marcas`, BrandCard, crear marca) |
| [../releases/WEB_UI_PHASE_3G3_AUDIT.md](../releases/WEB_UI_PHASE_3G3_AUDIT.md) | Product / Frontend | Fase 3G.3 — auditoría selector shell (pre-implementación) |
| [../releases/WEB_UI_PHASE_3G3_IMPLEMENTATION.md](../releases/WEB_UI_PHASE_3G3_IMPLEMENTATION.md) | Product / Frontend | Fase 3G.3 — selector shell coherente + confirmación |
| [../releases/WEB_UI_PHASE_3G4_AUDIT.md](../releases/WEB_UI_PHASE_3G4_AUDIT.md) | Product / Frontend | Fase 3G.4 — auditoría Home polish (pre-implementación) |
| [../releases/WEB_UI_PHASE_3G4_IMPLEMENTATION.md](../releases/WEB_UI_PHASE_3G4_IMPLEMENTATION.md) | Product / Frontend | Fase 3G.4 — Home polish + coherencia producto |
| [../releases/WEB_UI_WORLD_CLASS_FINAL_AUDIT.md](../releases/WEB_UI_WORLD_CLASS_FINAL_AUDIT.md) | Product / UX | Fase 3H — auditoría final pre-piloto (world-class UX) |
| [../releases/WEB_UI_PHASE_3H_AUDIT.md](../releases/WEB_UI_PHASE_3H_AUDIT.md) | Product / UX | Fase 3H — auditoría pre-implementación pilot polish |
| [../releases/WEB_UI_PHASE_3H_IMPLEMENTATION.md](../releases/WEB_UI_PHASE_3H_IMPLEMENTATION.md) | Product / Frontend | Fase 3H — pilot polish + honestidad sesión |
| [../releases/WEB_UI_PHASE_3I_ACCESSIBILITY_RESPONSIVE_AUDIT.md](../releases/WEB_UI_PHASE_3I_ACCESSIBILITY_RESPONSIVE_AUDIT.md) | Product / UX / A11y | Fase 3I Parte A — auditoría accesibilidad + responsive (WCAG 2.2 AA) |
| [../releases/WEB_UI_PHASE_3I_ACCESSIBILITY_RESPONSIVE_IMPLEMENTATION.md](../releases/WEB_UI_PHASE_3I_ACCESSIBILITY_RESPONSIVE_IMPLEMENTATION.md) | Product / Frontend / A11y | Fase 3I Parte B — implementación P0 + P1 accesibilidad |
| [../releases/ATLAS_PILOT_READINESS_AUDIT.md](../releases/ATLAS_PILOT_READINESS_AUDIT.md) | Product / Pilot | Auditoría preparación piloto real |
| [../releases/ATLAS_PILOT_PROTOCOL.md](../releases/ATLAS_PILOT_PROTOCOL.md) | Product / Pilot | Protocolo sesiones piloto |
| [../releases/ATLAS_PILOT_FEEDBACK.md](../releases/ATLAS_PILOT_FEEDBACK.md) | Product / Pilot | Plantilla feedback por sesión |
| [../releases/ATLAS_PILOT_EVIDENCE_BACKLOG.md](../releases/ATLAS_PILOT_EVIDENCE_BACKLOG.md) | Product / Pilot | Backlog evidencia piloto |
| [../releases/ATLAS_PILOT_GO_NO_GO.md](../releases/ATLAS_PILOT_GO_NO_GO.md) | Product / Pilot | Criterios go/no-go piloto |
| [../releases/WEB_UI_WORLD_CLASS_REVIEW.md](../releases/WEB_UI_WORLD_CLASS_REVIEW.md) | Product / Frontend | Revisión técnica complementaria (gaps API, componentes) |
| [guides/VERIFICATION_PLAYBOOK.md](./guides/VERIFICATION_PLAYBOOK.md) | Owner / QA | Casos de uso manuales antes de publicar docs |

**Planned:** `guides/USER_MANUAL.md`, `dev/GETTING_STARTED.md`, `dev/CLI_REFERENCE.md`, static site under `docs/web/`.

See also: root `README.md`, `VERSION.md`.

See `../spec/foundation/ATLAS-000-README.md` for the official entry point.
