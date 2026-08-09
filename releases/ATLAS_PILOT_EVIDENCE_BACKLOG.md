# ATLAS — Backlog de evidencia del piloto

**Propósito:** acumular hallazgos **observados** durante el piloto.  
**Regla:** ningún ítem pasa a desarrollo sin **Decisión** explícita y evidencia de frecuencia/impacto.

---

## Cómo usar este documento

1. Tras cada sesión, extraer hallazgos de [`ATLAS_PILOT_FEEDBACK.md`](./ATLAS_PILOT_FEEDBACK.md).
2. Crear o actualizar filas aquí.
3. En revisión semanal, agrupar duplicados y ajustar **Frecuencia** e **Impacto**.
4. Al cierre del piloto, filtrar por **Decisión** ≠ IGNORE.

---

## Leyenda

### Categoría

`UX` | `PRODUCT` | `COPY` | `BUG` | `ARCHITECTURE` | `MISSING_CAPABILITY` | `TRAINING/DOCUMENTATION`

### Prioridad

`P0` | `P1` | `P2` | `P3` — según impacto **observado**, no preferencia del equipo.

### Decisión

| Valor | Significado |
|-------|-------------|
| **FIX** | Corregir en apps/web sin cambiar arquitectura |
| **IMPROVE** | Mejora UX/copy acotada post-piloto |
| **BUILD** | Nueva capacidad — requiere diseño y posible ADR |
| **DOCUMENT** | Manual, briefing, guía facilitador |
| **IGNORE** | No accionar; evidencia insuficiente o out of scope |
| **NEEDS ARCHITECTURAL DECISION** | Escalar a ADR antes de cualquier build |
| **PENDING** | Aún en recolección |

### Estado

`OPEN` | `REVIEWING` | `DECIDED` | `DEFERRED` | `CLOSED`

---

## Plantilla de fila

Copiar para cada hallazgo:

```text
### EV-NNN

| Campo | Valor |
|-------|-------|
| ID | EV-NNN |
| Fecha | YYYY-MM-DD |
| Observación | |
| Usuario | U01 (rol/sector) |
| Contexto | Tarea / pantalla / Marca |
| Impacto | Alto / Medio / Bajo — descripción |
| Categoría | |
| Prioridad | |
| Evidencia | Sesión PILOT-…, cita, captura (ref local) |
| Frecuencia | 1 / 2 / 3+ sesiones |
| Decisión | PENDING |
| Estado | OPEN |
| Notas | |
```

---

## Registro de evidencia

*(Comenzar vacío; ejemplo ilustrativo comentado — borrar si confunde.)*

### EV-001 (ejemplo — no es evidencia real)

| Campo | Valor |
|-------|-------|
| ID | EV-001 |
| Fecha | — |
| Observación | Usuario esperaba historial de semanas anteriores al abrir Home |
| Usuario | — |
| Contexto | T10 / Home / General |
| Impacto | Medio — desconfianza temporal |
| Categoría | TRAINING/DOCUMENTATION |
| Prioridad | P2 |
| Evidencia | Hipotético |
| Frecuencia | — |
| Decisión | DOCUMENT |
| Estado | OPEN |
| Notas | Reforzar briefing sesión; copy 3H ya menciona sesión |

---

## Agrupación semanal (completar durante piloto)

### Semana 1

| Tema recurrente | Frecuencia | IDs |
|-----------------|------------|-----|
| | | |

### Semana 2

| Tema recurrente | Frecuencia | IDs |
|-----------------|------------|-----|

### Semana 3

| Tema recurrente | Frecuencia | IDs |
|-----------------|------------|-----|

### Semana 4

| Tema recurrente | Frecuencia | IDs |
|-----------------|------------|-----|

---

## Resumen de cierre (completar al final)

| Métrica | Valor |
|---------|-------|
| Sesiones realizadas | |
| Usuarios únicos | |
| Hallazgos totales | |
| P0 abiertos | |
| FIX decididos | |
| BUILD decididos (con ADR) | |
| IGNORE | |

---

## Reglas del backlog (Fase E)

1. **NO** convertir automáticamente feedback en feature.  
2. **NO** tocar paquetes Frozen durante piloto.  
3. **NO** introducir Cloud, Auth, persistencia durable, threads sin ADR.  
4. **NO** analytics invasivos.  
5. **NO** inventar métricas.  
6. **NO** solucionar con botones extra sin evidencia.  
7. **NO** cambiar semántica Kernel por UI.  
8. **NO** romper aislamiento entre Marcas.  
9. Mantener Web como capa de producto.  
10. Cualquier hotfix: quality gate + documentación.  
11. Toda decisión **BUILD** o **ARCHITECTURE**: registrar en ADR o doc de decisión.  
12. Prioridad = impacto observado, no entusiasmo del equipo.  
13. Frecuencia mínima sugerida para BUILD: **≥2 usuarios** o **P0**.  
14. Documentar **IGNORE** explícitamente para evitar re-debate.  
15. Al cierre: revisión con producto antes de roadmap post-piloto.

---

## Referencias

- [`ATLAS_PILOT_PROTOCOL.md`](./ATLAS_PILOT_PROTOCOL.md)
- [`ATLAS_PILOT_READINESS_AUDIT.md`](./ATLAS_PILOT_READINESS_AUDIT.md)
- [`ATLAS_PILOT_GO_NO_GO.md`](./ATLAS_PILOT_GO_NO_GO.md)
