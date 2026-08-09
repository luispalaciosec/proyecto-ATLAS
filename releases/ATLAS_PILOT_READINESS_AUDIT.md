# ATLAS — Auditoría de preparación para piloto real controlado

**Fecha:** 2026-08-09  
**Fase:** Pilot Readiness & User Feedback — **Fase A (solo documentación)**  
**Estado producto previo:** READY FOR PILOT (Fase 3H)  
**Alcance:** `apps/web` + documentación; **sin modificaciones de código**

---

## Resumen ejecutivo

ATLAS Web es usable como **producto de sesión local** para conversar, consultar Conocimiento, revisar Actividad y trabajar por Marca. La arquitectura documentada coincide con la implementación: Browser → Express → SessionStore → `@atlas/cli` → SDK/Memory.

**Limitación estructural del piloto:** un usuario final **no puede iniciar ATLAS solo desde el navegador**. Requiere que alguien con acceso al entorno ejecute `pnpm atlas web` y configure variables de entorno del LLM (`.env`). La UI es producto; el arranque sigue siendo operación local.

**Veredicto auditoría:** el piloto puede iniciarse **con facilitador técnico** y expectativas alineadas. No es un SaaS autoinstalable.

---

## 1. ¿Qué puede hacer hoy un usuario desde el navegador?

*(Lenguaje de usuario — asumiendo ATLAS Web ya está abierto en el navegador.)*

### Inicio y orientación

- Entrar a **Inicio** y ver qué es ATLAS, **con qué Marca trabaja** («Trabajando en General» o «Trabajando con {nombre}») y cuál es el siguiente paso recomendado (**Conversar con ATLAS**).

### Conversación

- Ir a **Conversación**, escribir preguntas o instrucciones en lenguaje natural y recibir respuestas.
- Ver el historial de la conversación **de la sesión actual** para la Marca activa.
- **Reintentar** si un mensaje falla.
- **Copiar** una respuesta.
- **Corregir** la última respuesta del asistente (cuando está disponible) para indicar qué debería haber dicho ATLAS.

### Conocimiento

- Ir a **Conocimiento**, buscar información que ATLAS ya tiene guardada para la Marca activa.
- Ver resultados con fragmentos legibles.
- Pasar un resultado o una búsqueda a **Conversación** con el texto preparado (sin enviar automáticamente).

### Marcas

- Ver todas las **Marcas** (empresa, cliente, proyecto).
- **Crear una Marca** con nombre y propósito.
- **Cambiar de Marca** desde el selector del encabezado o desde la página Marcas.
- Entender que cada Marca mantiene su contexto separado (copy + confirmación si hay borrador sin enviar).

### Actividad

- Ver **Actividad reciente** de lo ocurrido en la sesión Web actual: conversaciones, búsquedas de Conocimiento, correcciones, errores.
- Filtrar por tipo de acción.
- Volver a Conversación o Conocimiento desde acciones relevantes.

### Home como centro de trabajo

- Accesos rápidos a Conversación, Conocimiento, Marcas y Actividad.
- Ejemplos clicables que preparan una pregunta en Conversación.
- Ver **últimas preguntas de esta sesión** y **actividad reciente de esta sesión** (máx. 3 elementos).

### Rutas frontend verificadas

| Ruta | Funcional |
|------|-----------|
| `/` | Home |
| `/chat` | Conversación |
| `/conocimiento` | Conocimiento |
| `/actividad` | Actividad |
| `/marcas` | Marcas |
| `/configuracion` | Placeholder «Próximamente» |

### APIs backend verificadas (`apps/web/src/server.ts`)

| Endpoint | Uso producto |
|----------|--------------|
| `GET /api/health` | Salud |
| `GET /api/brands` | Catálogo Marcas |
| `POST /api/brands` | Crear Marca |
| `GET /api/history` | Historial sesión |
| `GET /api/activity` | Actividad sesión |
| `GET/POST /api/knowledge/search` | Búsqueda Conocimiento |
| `POST /api/chat` | Enviar mensaje |
| `POST /api/correct` | Corrección |

---

## 2. ¿Qué NO puede hacer?

### Limitación intencional (decisión de producto / gobernanza)

| No disponible | Motivo |
|---------------|--------|
| Cloud / acceso remoto multi-dispositivo | No autorizado (P2.6) |
| Auth / usuarios / permisos | No autorizado |
| Configuración de IA desde la UI | Fuera de scope; «Próximamente» |
| Editar o eliminar Marcas desde UI | No implementado |
| Threads / conversaciones múltiples por Marca | No diseñado |
| 👍/👎 feedback rápido | No implementado (solo corrección) |
| Dashboard / KPIs / analytics | Explícitamente excluido |
| Editar Conocimiento desde Web | Solo búsqueda + uso en chat |

### Funcionalidad futura (documentada, no prometida)

- Persistencia durable de historial y actividad (requiere ADR).
- Configuración avanzada en `/configuracion`.
- Ruta `/memoria` (existe tipo en router; no expuesta en nav principal actual).

### Limitación arquitectónica (real, no UI)

| Limitación | Evidencia |
|------------|-----------|
| Búsqueda Conocimiento por **coincidencia de texto**, no semántica | `USER_MANUAL.md`, `searchContent` vía CLI |
| Memoria en archivos `.atlas` locales | Arquitectura ATLAS |
| Un proceso `atlas web` = una sesión servidor | SessionStore in-memory |
| Correcciones en Web registradas; recuperación en contexto según modo CLI/brand | `USER_MANUAL.md` §7 |
| Modelo puede **negar datos existentes** pese a búsqueda correcta | `USER_MANUAL.md` §10 |

### Comportamiento temporal de sesión (honesto en UI post-3H)

| Comportamiento | Qué significa para el usuario |
|----------------|--------------------------------|
| Historial conversación | Visible mientras `atlas web` sigue corriendo; **se pierde al reiniciar el proceso** |
| Actividad | Solo acciones de **esta sesión Web**; se reinicia al cerrar la aplicación |
| Marca activa | Persiste en `localStorage` del navegador (`atlas.activeWorkspace`) |
| Una conversación por Marca por sesión | No hay lista de hilos independientes |

---

## 3. ¿Qué necesita un usuario para comenzar?

### ¿Puede comenzar sin terminal?

| Rol | ¿Sin terminal? |
|-----|----------------|
| **Usuario final (pyme)** | **No** — necesita URL + ATLAS ya levantado |
| **Facilitador / IT local** | **No** — debe ejecutar instalación, `.env`, `pnpm atlas web` |
| **Uso diario tras arranque** | **Sí** — solo navegador |

### Checklist operativo pre-piloto (facilitador)

1. `pnpm install && pnpm build` (una vez en el entorno piloto).
2. Configurar `.env`: `ATLAS_LLM_PROVIDER`, `ATLAS_LLM_API_KEY`, `ATLAS_LLM_MODEL`.
3. `pnpm atlas doctor` → HEALTHY + LLM configurado.
4. `pnpm atlas web` → abrir URL (default `http://127.0.0.1:4173`).
5. Explicar al usuario: sesión local, una Marca a la vez, actividad de sesión.

### Coherencia documentación vs código

| Documento | Coherente con código actual |
|-----------|----------------------------|
| `VERSION.md` (3G–3H) | **Sí** |
| `WEB_UI_PHASE_3H_IMPLEMENTATION.md` | **Sí** |
| `WEB_UI_WORLD_CLASS_FINAL_AUDIT.md` | Parcial — P1 corregidos en 3H; audit refleja pre-3H en algunos ítems |
| `docs/WEB_UI_PRODUCT_UX.md` | **Parcial** — sitemap histórico (`/espacios`, `/memoria`); implementación usa `/marcas`, `/conocimiento` |
| `USER_MANUAL.md` | **Parcial** — orientado CLI; §8 web es breve; no describe Home 3G.4/3H |

---

## 4. ¿Qué partes todavía parecen técnicas?

### Visible en UI principal (señalar en piloto)

| Término / patrón | Dónde | Severidad observación |
|------------------|-------|----------------------|
| «automáticamente» / «proceso estructurado» | Respuesta chat modo deterministic; actividad | P2 — puede sonar a sistema |
| «asistente de IA» | Errores, actividad | Aceptable (traducción humana de LLM) |
| «Ver detalles» | Errores | OK si usuarios no expanden; puede mostrar JSON |

### Solo bajo «Ver detalles» o código (aceptable)

`tool_use_failed`, `429`, JSON payload, slugs, workspace, session, LLM, deterministic, retrieval — mapeados en `format-error.ts` / mappers; **no en mensaje principal**.

### No detectado en UI principal post-3H

`workspace`, `slug`, `kernel`, `memory.json`, `CLI`, `RAG`, `provider` como etiquetas visibles.

---

## 5. ¿Qué expectativas puede crear la UI que no puede cumplir?

*(Solo expectativas respaldadas — no inventadas.)*

| Expectativa posible | ¿La cumple ATLAS hoy? |
|-------------------|----------------------|
| «ATLAS recuerda todo para siempre» | **No** — sesión Web + archivos locales; reinicio pierde historial UI |
| «Busca como Google / entiende sinónimos» | **No** — búsqueda por texto |
| «Varias conversaciones separadas por Marca» | **No** — un hilo por Marca por sesión |
| «Puedo configurar la IA aquí» | **No** — Configuración Próximamente |
| «Actividad = auditoría completa histórica» | **No** — solo sesión Web actual |
| «Cambiar Marca nunca pierde nada» | **Parcial** — borrador sin enviar se pierde (aviso existe) |
| «Corregir = ATLAS nunca volverá a equivocarse» | **Parcial** — corrección se registra; efecto depende de memoria/modelo |
| «Funciona sin internet» | **Parcial** — UI local; LLM requiere API externa salvo modo deterministic |

---

## 6. ¿Qué información necesita un usuario para confiar en ATLAS?

### Confianza (no funcionalidades)

| Necesidad | ¿La cubre la UI? |
|-----------|------------------|
| Saber **con qué Marca** trabaja | **Sí** — «Trabajando con/en» |
| Entender **aislamiento** entre Marcas | **Sí** — banners en Chat/Conocimiento/Actividad; diálogo cambio Marca |
| Saber **qué pasó** si algo falla | **Sí** — errores humanos + Reintentar |
| Saber **alcance de sesión** | **Sí** (post-3H) — notas en Home y Actividad |
| Saber **qué NO promete** (seguridad cloud, multiusuario) | **Sí** — no promete; falta briefing oral del facilitador |

### Funcionalidades (distinto de confianza)

- Corrección, Conocimiento, Actividad — existen pero requieren descubrimiento.

---

## 7. ¿Qué riesgos existen durante un piloto?

| Riesgo | Evidencia | Mitigación piloto |
|--------|-----------|-------------------|
| **Pérdida historial/actividad** al reiniciar `atlas web` | SessionStore in-memory; copy 3H | Briefing; no reiniciar durante sesiones |
| **LLM no configurado** | Error pide contactar quien instaló ATLAS | Verificar doctor antes de cada sesión |
| **Fallos proveedor LLM** (429, tool_use_failed) | `USER_MANUAL.md` §10, `format-error.ts` | Preferir Anthropic; Reintentar |
| **Modelo niega datos existentes** | `USER_MANUAL.md` §10 | Validar con Conocimiento directo |
| **Confusión Marca vs General** | Complejidad producto | Tareas guiadas iniciales |
| **Expectativa búsqueda inteligente** | Placeholder Conocimiento | Demostrar con palabras exactas |
| **Usuario expande «Ver detalles»** | JSON técnico | Pedir que no expandan salvo soporte |
| **Facilitador ausente** | Arranque requiere terminal | Designar responsable local |
| **Mezcla datos entre Marcas** | Backend aislado; riesgo es **error humano** al elegir Marca | Confirmar Marca visible antes de tareas sensibles |

**No incluidos como riesgos de producto:** brechas de seguridad enterprise, pérdida por multiusuario (no existe auth).

---

## 8. ¿Qué debería medirse durante el piloto?

*(Manual — sin analytics implementados.)*

### Métricas de adopción

- Tiempo desde abrir URL hasta **primer mensaje enviado**.
- Tiempo hasta **primera búsqueda en Conocimiento**.
- Tiempo hasta **primer cambio de Marca** (si aplica).

### Métricas de uso

- N.º mensajes por sesión.
- N.º búsquedas Conocimiento.
- N.º correcciones.
- N.º cambios de Marca.
- N.º visitas a Actividad / Home vs Conversación directa.

### Métricas de fricción

- Errores observados (tipo: conexión, LLM, vacío, otro).
- Uso de **Reintentar**.
- Abandonos (usuario deja de interactuar &lt; X min tras error).
- Preguntas «¿qué hago ahora?» al facilitador.

### Métricas cualitativas

- Tareas completadas vs fallidas (protocolo).
- Confusiones recurrentes (copy Marca, sesión, Conocimiento).
- Solicitudes «me gustaría que…» (registrar sin implementar).
- Momentos de confianza / desconfianza.

### Métricas de producto

- ¿Repiten uso en semana 2+?
- ¿Crean Marca propia sin ayuda?
- ¿Vuelven a Conversación desde Home «últimas preguntas»?

---

## 9. ¿Qué NO debemos construir durante el piloto?

Lista explícita **congelada** hasta evidencia post-piloto:

1. Cloud / hosting / sync remoto  
2. Auth / multiusuario / permisos / roles  
3. Persistencia durable historial/actividad (sin ADR)  
4. Threads / conversaciones múltiples  
5. Configuración IA en UI (salvo hotfix crítico dead-end)  
6. Edición/eliminación Marcas  
7. Dashboard / KPIs / analytics embebidos  
8. RAG / búsqueda vectorial prometida  
9. Streaming de respuestas  
10. Mobile app nativa  
11. Marketplace / plugins / agentes  
12. Modificar paquetes Frozen/Certified  
13. Cambiar semántica Kernel por feedback UI  
14. Analytics invasivos / telemetría oculta  
15. Convertir cada solicitud de usuario en feature sin clasificación  

---

## 10. Tests y quality gate (estado de referencia)

- `@atlas/web`: **134/134** PASS (Fase 3H).
- Monorepo test/build/typecheck/lint: PASS.
- `pnpm atlas doctor`: HEALTHY.
- **Gobernanza:** 0 cambios en paquetes Frozen en trabajo 3H.

*Esta auditoría de piloto no re-ejecuta la suite; asume estado verificado en 3H.*

---

## 11. Veredicto auditoría Fase A

**PASS — listo para diseñar y ejecutar piloto controlado** con facilitador técnico, usuarios no técnicos, y protocolo de observación.

**Condición:** no interpretar READY FOR PILOT como «usuario autónomo sin soporte local».

---

**Siguiente entregables (Fases B–F):** protocolo, feedback, backlog evidencia, go/no-go, reglas — ver archivos `ATLAS_PILOT_*.md`.
