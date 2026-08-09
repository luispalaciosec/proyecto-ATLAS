# ATLAS — Protocolo de piloto real controlado

**Fecha:** 2026-08-09  
**Duración recomendada:** 3–4 semanas  
**Mercado:** pymes Latinoamérica y España  
**Modo:** observación + feedback manual — **sin desarrollo de features durante el piloto**

---

## 1. Objetivo del piloto

Descubrir si personas no técnicas **quieren y pueden usar** ATLAS Web para trabajo real, qué confunde, qué valoran y qué requeriría arquitectura nueva — **antes** de construir más producto.

---

## 2. Perfil de usuarios

### Incluir

- Dueño o gerente de pyme (5–50 personas).
- Responsable administrativo, marketing, operaciones o consultoría.
- Personas que usan email, WhatsApp, hojas de cálculo y SaaS básico (no desarrolladores).

### Excluir (para esta ronda)

- Ingenieros de software como únicos participantes.
- Evaluadores que esperen producto cloud multiusuario listo.

### Roles en la sesión

| Rol | Responsabilidad |
|-----|-----------------|
| **Usuario** | Trabajo real; piensa en voz alta cuando sea posible |
| **Facilitador** | Arranque técnico, observación, plantilla feedback |
| **Observador** (opcional) | Toma notas sin intervenir |

### Datos mínimos del participante

- Rol aproximado (ej. «dueño agencia», «admin clínica»).
- Sector (ej. retail, servicios, salud).
- **No** registrar nombre completo, email ni teléfono salvo consentimiento explícito aparte.

---

## 3. Preparación antes de cada sesión

### Facilitador (obligatorio)

```bash
pnpm atlas doctor    # HEALTHY + LLM OK
pnpm atlas web       # mantener proceso vivo toda la sesión
```

- Confirmar Marca inicial (General o Marca piloto).
- Tener datos de prueba en Conocimiento si la tarea lo requiere (vía CLI previo o sesiones anteriores).
- Imprimir o tener abierto `ATLAS_PILOT_FEEDBACK.md`.

### Briefing al usuario (2 minutos, lenguaje humano)

> «ATLAS es un asistente de trabajo de tu empresa. Trabajas dentro de una **Marca** (tu empresa, un cliente o un proyecto). Lo que ves aquí es de **esta sesión**: si cerramos la aplicación por completo, el historial de pantalla se reinicia. Puedes preguntar, buscar información guardada y corregir respuestas. No hace falta saber de tecnología.»

---

## 4. Tareas del piloto (10 tareas)

### T01 — Orientación en Inicio

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Entender qué es ATLAS y qué hacer primero sin ayuda |
| **Instrucción** | «Acabas de entrar. Mira la pantalla principal y dime qué harías.» |
| **Observar** | ¿Identifica Marca? ¿Encuentra Conversar? ¿Lee ejemplos? |
| **Éxito** | Llega a Conversación o describe acción principal en &lt; 2 min |
| **Confusión** | Pregunta «¿qué es Marca?» sin leer; busca Configuración |
| **Fracaso** | No identifica ninguna acción; abandona |

### T02 — Primera conversación

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Enviar un mensaje y leer respuesta |
| **Instrucción** | «Pregúntale algo relacionado con tu trabajo real.» |
| **Observar** | Composer, loading, legibilidad respuesta, frustración por espera |
| **Éxito** | Envía mensaje y entiende respuesta (aunque no sea perfecta) |
| **Confusión** | No sabe qué escribir; miedo a «romper algo» |
| **Fracaso** | Error sin recuperación; abandono |

### T03 — Seguimiento multi-turno

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Mantener hilo de conversación |
| **Instrucción** | «Haz una pregunta de seguimiento sobre lo anterior.» |
| **Observar** | ¿Entiende contexto? ¿Scroll? ¿Historial visible? |
| **Éxito** | Segunda pregunta coherente con la primera |
| **Confusión** | Cree que ATLAS «olvidó» sin motivo |
| **Fracaso** | Respuesta incoherente + usuario pierde confianza |

### T04 — Entender la Marca activa

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Articular con qué contexto trabaja |
| **Instrucción** | «¿Con qué empresa o proyecto estás trabajando ahora?» |
| **Observar** | Uso de «Trabajando con/en»; selector encabezado |
| **Éxito** | Nombra Marca correcta |
| **Confusión** | No distingue General vs Marca nombrada |
| **Fracaso** | Cree que mezcla clientes sin aviso |

### T05 — Cambiar de Marca (sin borrador)

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Cambiar contexto sin fricción innecesaria |
| **Instrucción** | «Cambia a {otra Marca}.» (composer vacío) |
| **Observar** | ¿Hay diálogo? ¿Entiende por qué cambió lo visible? |
| **Éxito** | Cambio completado; usuario explica que contexto es otro |
| **Confusión** | Sorpresa por historial distinto |
| **Fracaso** | Cree que perdió datos permanentes |

### T06 — Cambiar de Marca (con borrador)

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Protección de borrador |
| **Instrucción** | Escribir en Conversación sin enviar → intentar cambiar Marca |
| **Observar** | Diálogo borrador; decisión cancelar/continuar |
| **Éxito** | Usuario entiende aviso de mensaje sin enviar |
| **Confusión** | No lee aviso; pierde texto |
| **Fracaso** | Cambio sin aviso (bug) |

### T07 — Buscar en Conocimiento

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Encontrar información guardada |
| **Instrucción** | «Busca información sobre {tema acordado con datos reales}.» |
| **Observar** | Expectativa «inteligente» vs resultados; empty state |
| **Éxito** | Encuentra resultado relevante o entiende «no hay resultados» |
| **Confusión** | Usa sinónimos que no coinciden |
| **Fracaso** | Cree que ATLAS «no sabe nada» del negocio |

### T08 — Conocimiento → Conversación

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Puente Conocimiento–Chat |
| **Instrucción** | «Usa un resultado para preparar una pregunta en Conversación.» |
| **Observar** | Descubre CTA; edita antes de enviar |
| **Éxito** | Llega a Conversación con texto editable |
| **Confusión** | Cree que se envió solo |
| **Fracaso** | No encuentra cómo continuar |

### T09 — Corregir una respuesta

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Usar corrección cuando respuesta es mala |
| **Instrucción** | Tras respuesta incorrecta: «Indica qué debería haber dicho ATLAS.» |
| **Observar** | Descubre «Corregir respuesta»; feedback post-envío |
| **Éxito** | Envía corrección; entiende que fue registrada |
| **Confusión** | Espera reemplazo instantáneo en pantalla |
| **Fracaso** | No encuentra la acción |

### T10 — Actividad e historial de sesión

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Revisar qué hizo y retomar trabajo |
| **Instrucción** | «Vuelve a Inicio y revisa qué hiciste hoy. Retoma si puedes.» |
| **Observar** | Comprensión «esta sesión»; uso últimas preguntas |
| **Éxito** | Identifica acciones recientes; abre Conversación |
| **Confusión** | Espera historial de semanas |
| **Fracaso** | No entiende para qué sirve Actividad |

### T11 — Recuperarse de un error (opcional si ocurre)

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Resiliencia UX |
| **Instrucción** | Tras error visible: «¿Qué harías ahora?» |
| **Observar** | Reintentar; lectura mensaje; pánico |
| **Éxito** | Recupera flujo con Reintentar o reformulando |
| **Confusión** | Mensaje incomprensible |
| **Fracaso** | Abandono |

### T12 — Uso móvil o pantalla pequeña (opcional)

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Responsive real |
| **Instrucción** | Repetir T02 en móvil o ventana ~390px |
| **Observar** | Composer, nav, selector Marca |
| **Éxito** | Completa conversación |
| **Confusión** | No encuentra acciones |
| **Fracaso** | Overflow / botones inutilizables |

---

## 5. Preguntas al usuario (post-sesión)

Usar tono conversacional; **no** leer como cuestionario rígido.

1. ¿Qué esperabas que ATLAS hiciera hoy?
2. ¿Qué fue lo más útil?
3. ¿Qué te resultó confuso?
4. ¿En qué momento casi dejas de usarlo?
5. ¿Qué buscabas hacer cuando te quedaste atascado?
6. ¿Qué te faltó?
7. ¿Qué te hizo confiar en lo que viste?
8. ¿Qué te hizo desconfiar?
9. ¿Volverías a usarlo la próxima semana para trabajo real? ¿Por qué?
10. Si pudieras cambiar **una sola cosa**, ¿cuál sería?

**Evitar:** «¿Te gustó la IA?», «¿Fue intuitivo del 1 al 10?» sin contexto.

---

## 6. Cadencia semanal sugerida

| Semana | Foco |
|--------|------|
| **1** | T01–T04; 2–3 usuarios; observación guiada |
| **2** | T05–T08; usuarios repiten con tareas propias |
| **3** | T09–T12; mínima guía; trabajo real |
| **4** | Sesiones libres + entrevistas cortas; consolidar evidencia |

---

## 7. Reglas durante el piloto

Ver `ATLAS_PILOT_EVIDENCE_BACKLOG.md` y sección Reglas en implementación. Resumen:

- **Observar → Registrar → Agrupar → Priorizar → Decidir → Construir** (construir solo después).
- No implementar features reactivas mid-piloto.
- Hotfix solo si bloquea uso (bug P0) — documentar y pasar quality gate.

---

## 8. Entregables del piloto

Al cierre:

1. Backlog evidencia completado (`ATLAS_PILOT_EVIDENCE_BACKLOG.md`).
2. Resumen: top 5 fricciones UX, top 5 solicitudes, top 3 riesgos arquitectónicos.
3. Recomendación: **CONTINUE PRODUCT** / **PIVOT SCOPE** / **PAUSE** — con evidencia, no opinión.

---

## 9. Referencias

- [`ATLAS_PILOT_READINESS_AUDIT.md`](./ATLAS_PILOT_READINESS_AUDIT.md)
- [`ATLAS_PILOT_FEEDBACK.md`](./ATLAS_PILOT_FEEDBACK.md)
- [`ATLAS_PILOT_GO_NO_GO.md`](./ATLAS_PILOT_GO_NO_GO.md)
