# ATLAS — Plantilla de feedback de sesión de piloto

**Uso:** completar después de **cada sesión** con un usuario.  
**Almacenamiento:** copia local acordada (no PII innecesaria).  
**Destino:** trasladar hallazgos relevantes a [`ATLAS_PILOT_EVIDENCE_BACKLOG.md`](./ATLAS_PILOT_EVIDENCE_BACKLOG.md)

---

## Identificación de sesión

| Campo | Valor |
|-------|-------|
| **ID sesión** | PILOT-YYYY-MM-DD-NN |
| **Fecha** | |
| **Duración** | |
| **Facilitador** | iniciales o rol |
| **Entorno** | local / oficina piloto / remoto asistido |

---

## Usuario (sin PII innecesaria)

| Campo | Valor |
|-------|-------|
| **ID anónimo** | U01, U02… |
| **Rol** | ej. dueño, admin, consultor |
| **Tipo empresa** | ej. agencia 8 personas, clínica, comercio |
| **Sector** | |
| **Experiencia previa ATLAS** | ninguna / demo previa / semana N |

---

## Contexto técnico (facilitador)

| Campo | Valor |
|-------|-------|
| **Marca(s) usada(s)** | General / {nombre} |
| **LLM configurado** | sí / no |
| **Proveedor** | anthropic / otro / n/a |
| **Reinicio servidor durante sesión** | sí / no |
| **Tareas del protocolo** | T01, T02… |

---

## Sesión por tarea

Repetir bloque por cada tarea intentada.

### Tarea: T__ — _______________

| Campo | Valor |
|-------|-------|
| **Resultado** | Éxito / Parcial / Fracaso / No intentada |
| **Tiempo aprox.** | |
| **Qué hizo el usuario** | |
| **Éxito observado** | |
| **Confusión observada** | |
| **Error técnico** | sí / no — tipo |
| **Usó Reintentar** | sí / no |

**Cita textual (opcional):** «…»

---

## Observaciones generales

### Éxitos

- 

### Confusiones

- 

### Errores

- 

### Expectativas no cumplidas

- 

### Solicitudes («me gustaría…»)

- 

### Confianza

| Momento | + confianza / − confianza | Notas |
|---------|---------------------------|-------|
| | | |

---

## Respuestas post-sesión (usuario)

| Pregunta | Respuesta resumida |
|----------|-------------------|
| ¿Qué esperabas que ocurriera? | |
| ¿Qué fue confuso? | |
| ¿Qué buscabas hacer? | |
| ¿Qué te faltó? | |
| ¿Qué te hizo confiar? | |
| ¿Qué te hizo desconfiar? | |
| ¿Volverías a usarlo? | |

---

## Clasificación de hallazgos

Listar cada hallazgo accionable de la sesión.

| # | Hallazgo | Categoría | Prioridad | → Backlog ID |
|---|----------|-----------|-----------|--------------|
| 1 | | | | |

### Categorías (elegir una)

- **UX** — flujo, jerarquía, descubrimiento  
- **PRODUCT** — capacidad de producto, alcance  
- **COPY** — texto, tono, honestidad  
- **BUG** — comportamiento incorrecto  
- **ARCHITECTURE** — requiere cambio estructural / ADR  
- **MISSING_CAPABILITY** — funcionalidad ausente real  
- **TRAINING/DOCUMENTATION** — briefing, manual, facilitador  

### Prioridad (impacto observado — no deseo)

| Nivel | Criterio |
|-------|----------|
| **P0** | Bloquea uso o destruye confianza en la sesión |
| **P1** | Fricción fuerte; muchos usuarios lo sufrirían |
| **P2** | Molesto pero superable |
| **P3** | Nice-to-have; observación aislada |

---

## Acciones inmediatas

| Acción | Responsable | Fecha |
|--------|-------------|-------|
| Trasladar a backlog evidencia | | |
| Compartir resumen con equipo | | |
| **¿Implementar algo ahora?** | **NO** (salvo hotfix P0 documentado) | |

---

## Firma facilitador

| Campo | Valor |
|-------|-------|
| **Completado por** | |
| **Fecha cierre plantilla** | |
