# Knowledge

Documentos de conocimiento del workspace. Cada archivo representa una unidad de conocimiento que Atlas compila y ejecuta.

| Ruta | Tipo | ID en `atlas.workspace.json` |
|------|------|--------------------------------|
| `policies/access-control.policy.json` | Política de seguridad | `policy.security.access-control` |
| `policies/data-retention.policy.json` | Política de cumplimiento | `policy.compliance.data-retention` |
| `concepts/platform-overview.concept.json` | Concepto de plataforma | `concept.platform.overview` |

## Nota importante (Milestone 1)

El CLI actual carga unidades de compilación desde `atlas.workspace.json`. Los archivos en `knowledge/` son la **representación canónica legible** del proyecto; su contenido debe mantenerse alineado con el campo `source` de cada unidad en `atlas.workspace.json`.

La carga automática desde `knowledge/` está registrada como mejora futura (ver `MILESTONE_1_UX_REVIEW.md`).
