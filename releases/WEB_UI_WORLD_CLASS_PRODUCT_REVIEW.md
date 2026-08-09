# ATLAS Web UI — World-Class Product Review (Pre-Implementation Gate)

**Tipo:** Revisión oficial de producto / UX / UI — Phase 3 Pre-Implementation Gate  
**Fecha:** 9 de agosto de 2026  
**Alcance:** `@atlas/web` — evolución hacia producto SaaS B2B para PYMEs (LatAm + España)  
**Estado:** **APROBADO PARA IMPLEMENTACIÓN INCREMENTAL** (con decisiones explícitas abajo)  
**Regla:** Este documento **no modifica código**. Es la fuente de verdad para que un agente de implementación ejecute Phase 3 sin reinterpretar producto.

**Referencias auditadas:**

| Documento | Rol |
|-----------|-----|
| [`ATLAS_PRODUCT_VISION_v1.0.md`](../ATLAS_PRODUCT_VISION_v1.0.md) | Visión producto, usuario objetivo |
| [`ATLAS_ARCHITECTURE_MASTER.md`](../ATLAS_ARCHITECTURE_MASTER.md) | Límites arquitectónicos |
| [`VERSION.md`](../VERSION.md) | Estado Phase 2 + Fase 3 slice 1–4 |
| [`docs/WEB_UI_PRODUCT_UX.md`](../docs/WEB_UI_PRODUCT_UX.md) | UX aprobado Fase 2 |
| [`releases/WEB_UI_AUDIT.md`](./WEB_UI_AUDIT.md) | Auditoría Fase 1 |
| [`releases/WEB_UI_PHASE_3_IMPLEMENTATION.md`](./WEB_UI_PHASE_3_IMPLEMENTATION.md) | Estado real post slice 1–4 |
| [`releases/WEB_UI_WORLD_CLASS_REVIEW.md`](./WEB_UI_WORLD_CLASS_REVIEW.md) | Revisión técnica complementaria |
| [`USER_MANUAL.md`](../USER_MANUAL.md) | Capacidades reales hoy |
| Código `apps/web/` | Contraste doc vs implementación |

**Contraste documentación ↔ código (hallazgo transversal):** Fase 3 ítems 1–4 están implementados en código; varios documentos (audit Fase 1, USER_MANUAL §1) describen el estado **anterior** a la SPA. Este review usa **código actual** como verdad operativa.

---

## 1. Executive summary

ATLAS tiene una arquitectura rigurosa y Phase 2 funcionalmente completa. La Web UI **ya dejó de ser demo técnica** tras Fase 3 (scaffold, shell, i18n, chat v2): existe SPA Vite, español centralizado, mapeo de errores, markdown y navegación responsive básica, respetando **Web → Express → `@atlas/cli` → SDK** sin tocar Frozen/Certified.

**Aún no es producto world-class.** Para una PYME latinoamericana que abre el navegador por primera vez, faltan: Home accionable, historial al recargar, Conocimiento browseable, Marcas como entidades de negocio (no `<select>` + slug), Actividad legible, feedback natural, transparencia de confianza, Configuración read-only y pass WCAG 2.2 AA.

**Decisión de producto clave:** renombrar **Memoria → Conocimiento** en toda la UI principal; reservar “memoria” para diagnóstico avanzado. **Marca activa** (no “workspace”) como señal persistente de contexto.

**Veredicto gate:** **READY TO IMPLEMENT** — siguiente fase exacta: **3D (historial) + 3B (Home accionable)**, en ese orden de prioridad P0. No requiere ADR ni cambios Kernel. Endpoints delgados en `apps/web` requieren registro en VERSION.md al implementarse, no ADR.

**Frase de producto (empresario):**

> **ATLAS es el asistente de trabajo de tu empresa: recuerda el contexto de cada marca, consulta lo que ya sabes y te ayuda a hacer el trabajo — hablando con él, sin complicaciones técnicas.**

---

## 2. Product positioning

### 2.1 ¿Qué entiende un usuario que es ATLAS?

**Hoy (código + copy actual):** “Tu asistente de trabajo con memoria y contexto por marca.” — Mejorable: la palabra “memoria” es técnica.

**Debe entender:** Un asistente empresarial que **conoce su negocio por marca**, **consulta información guardada** y **responde/ejecuta** en lenguaje natural.

**No debe entender:** Kernel, SDK, retrieval, tool-calling, workspace, LLM provider.

### 2.2 Acciones desde Home

| Prioridad | Acción | Justificación |
|-----------|--------|---------------|
| **Principal** | Preguntar a ATLAS (ir a Conversación) | Alineado con Product Vision §6 — un punto de entrada conversacional |
| **Secunda** | Trabajar en una marca / cambiar marca | Aislamiento es diferenciador vs ChatGPT |
| **Tercera** | Consultar conocimiento | Confianza — “¿qué sabe ATLAS?” |
| **Cuarta** | Ver actividad reciente | Continuidad operativa |

### 2.3 Información siempre visible

1. **Marca activa** (chip persistente en header + banner contextual en vistas sensibles)  
2. **Sección actual** (título de página)  
3. **Estado de conexión** solo si falla (`/api/health`) — no mostrar “OK” permanentemente  

### 2.4 Conceptos demasiado ligados al lenguaje técnico (código actual)

| Ubicación | Término / patrón | Severidad |
|-----------|------------------|-----------|
| i18n `workspace.label` | “Espacio de trabajo” | ⚠️ Aceptable internamente; preferir **Marca activa** en superficie |
| i18n `chat.thinkingSearch` | “…en tu **memoria**” | ⚠️ Cambiar a “conocimiento” |
| i18n `nav.memory` | “Memoria” | ❌ Renombrar → Conocimiento |
| Ruta `/memoria` | slug técnico | ⚠️ Migrar → `/conocimiento` |
| Selector + input slug | Creación técnica | ❌ Reemplazar por nombre de marca |
| `switchConfirm` | Menciona “historial del servidor” | ⚠️ Lenguaje operador; simplificar |
| `mapChatResponse` deterministic | “reglas internas” | ⚠️ OK; evitar “deterministic” en UI |
| Payload JSON en `technicalDetails` | Expuesto en acordeón error | ✅ OK si colapsado |

---

## 3. User personas

### 3.1 Primaria — Dueña/Dueño PYME

- **Perfil:** Gerente general, 35–55 años, Ecuador/Colombia/México/España  
- **Meta:** Resultados rápidos — seguimiento clientes, propuestas, consultas internas  
- **Dolor:** Repetir contexto en ChatGPT; mezclar marcas; no confiar en respuestas  
- **Necesita:** Claridad de marca, corrección fácil, encontrar info después  

### 3.2 Secundaria — Responsable comercial / marketing

- **Meta:** Redactar, investigar clientes, preparar seguimientos  
- **Necesita:** Conversación fluida, copiar respuestas, ejemplos en empty states  

### 3.3 Terciaria — Operador técnico (NO usuario principal Web)

- **Meta:** Configurar LLM, diagnosticar  
- **Canal:** CLI + Configuración → Avanzado — **no** shell principal  

### 3.4 Implicaciones diseño

- Español neutro latinoamericano (tú, no vos por defecto)  
- Sin jerga IA; sin dashboards de métricas  
- Formalidad profesional cálida — no “tech bro”, no académico  

---

## 4. Information architecture

### 4.1 Mapa objetivo (decisión oficial)

```text
ATLAS Web
├── Inicio                    ← accionable, no decorativo
├── Conversación              ← superficie principal (P0 UX)
├── Marcas                    ← entidades de negocio
├── Conocimiento              ← NO "Memoria" (decisión §11)
├── Actividad                 ← timeline derivada de datos reales
└── Configuración
    ├── General (idioma, apariencia — localStorage v1)
    ├── Marcas (enlace)
    ├── Asistente de IA (read-only env)
    └── Avanzado (diagnóstico, versión)
```

### 4.2 Cambios respecto a implementación actual

| Elemento | Hoy (código) | Decisión |
|----------|--------------|----------|
| Nav “Memoria” | `/memoria` placeholder | **Renombrar → Conocimiento**, ruta `/conocimiento` |
| Actividad | No existe | **Añadir** nav + ruta `/actividad` |
| Marcas | `/marcas` placeholder | Implementar grid (3E) |
| Configuración | `/configuracion` placeholder | Implementar read-only (3H) |
| Selector header | `<select>` + slug input | Evolucionar a chip + modal (3E) |
| Status bar | Texto libre técnico residual | Solo mensajes humanos + toasts |

### 4.3 Principal vs secundario

| Principal (nav) | Secundario (contextual / Home) |
|-----------------|--------------------------------|
| Inicio, Conversación | Última conversación |
| Marcas, Conocimiento | Ejemplos de preguntas |
| Actividad, Configuración | Estado IA (solo si no configurado) |

### 4.4 Memoria vs Conocimiento — decisión justificada

| Criterio | “Memoria” | “Conocimiento” |
|----------|-----------|----------------|
| Comprensión PYME | Asociado a RAM, olvido, técnico | Asociado a saber, documentos, empresa |
| Pregunta usuario | “¿Qué recuerdas?” (vago) | **“¿Qué sabe ATLAS sobre mi empresa?”** (claro) |
| Alineación arquitectura | Nombre interno Memory Engine | Traducción correcta sin mentir |
| Riesgo | Suena a chatbot genérico | Suena a activo empresarial |

**Decisión oficial:** UI principal = **Conocimiento**. “Memoria” solo en Configuración → Avanzado / Ver detalles técnicos.

---

## 5. Home

### 5.1 Estado actual (código `home.ts`)

- Título + tagline + banner aislamiento + card “dónde estás” + **un** CTA “Iniciar conversación”  
- Keys `home.intro`, `home.changeWorkspace` en i18n **no renderizadas**  
- Sin acciones múltiples, sin ejemplos, sin actividad/conversaciones recientes  

**Respuesta a “¿Qué puedo hacer?” hoy:** Parcial — ~15–20 s, no <10 s del brief.

### 5.2 Home objetivo (wireframe conceptual)

```text
┌─────────────────────────────────────────────────────────┐
│ Buenos días, {nombre opcional v2}                       │
│ Estás trabajando en: [● Geeks]                        │
├─────────────────────────────────────────────────────────┤
│ ¿Qué quieres hacer?                                     │
│                                                         │
│ [ 💬 Preguntar a ATLAS ]     ← CTA primario             │
│ [ 🏷️  Cambiar marca ]        ← secundario               │
│ [ 📚 Consultar conocimiento ]                           │
│ [ 📋 Ver actividad ]                                    │
├─────────────────────────────────────────────────────────┤
│ Puedes pedirle cosas como:                              │
│ • "Resume lo que sabemos de este cliente."              │
│ • "Prepara un seguimiento para el pedido."              │
│ • "¿Qué campañas hemos realizado?"                      │
├─────────────────────────────────────────────────────────┤
│ Continuar: "Conversación sobre cliente VIP" (v2)        │
│ Reciente en Geeks: 3 elementos de conocimiento (v2)     │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Reglas

- **Accionable, no decorativa** — cero métricas vanity  
- Bloques “Continuar / Reciente” dependen de `/api/history` y `/api/memory/search` — fase 3D/3F  
- Si IA no configurada: banner único con enlace a Configuración — no bloquear Home  

---

## 6. Chat

### 6.1 Estado actual (fortalezas)

| Aspecto | Estado |
|---------|--------|
| Input multilínea, Enter/Shift+Enter | ✅ |
| Markdown + sanitización | ✅ |
| Errores mapeados (`formatUserError`) | ✅ |
| Corrección en última respuesta | ✅ |
| Confirmación cambio marca | ✅ |
| Banner aislamiento | ✅ |

### 6.2 Gaps vs premium

| Aspecto | Gap | Prioridad |
|---------|-----|-----------|
| Historial F5 | ❌ No `/api/history` | **P0** |
| Reintentar | `lastFailedGoal` en state, sin botón | **P0** |
| Feedback 👍/👎 | Panel textarea técnico | **P1** |
| Pasos loading | Solo texto genérico | **P1** |
| Transparencia | No usa `retrieval.selected` en UI | **P1** |
| Tablas markdown | marked GFM — verificar render | **P2** |
| Conversaciones largas | Sin virtualización | **P3** |

### 6.3 Flujos definidos (especificación implementación)

#### Antes de enviar

Usuario ve: placeholder “¿En qué puedo ayudarte?”, marca activa visible, empty state con ejemplos.

#### Durante procesamiento

```text
✓ Recibí tu solicitud
● Consultando tu conocimiento…    ← si llm_turns > 1 (inferido)
● Preparando respuesta…
```

`aria-busy="true"` en thread. **No** mostrar tool names.

#### Después de responder

Acciones: Copiar, 👍/👎, (opcional) “Ver fuente” si `retrieval.selected > 0`:

> “Basado en {N} elementos del conocimiento de Geeks.”

#### Si ATLAS se equivoca

👎 → categorías → textarea → `POST /api/correct` (backend existente).

#### Si falla LLM

Mensaje humano + **[Reintentar]** + **[Ver detalles]** colapsado. Nunca 429/tool_use_failed en superficie.

---

## 7. Brands (Marcas)

### 7.1 Estado actual

- Lista vía `GET /api/workspaces` → slugs  
- Creación: input texto + “Usar” (sin sanitización visible, sin profile UX)  
- `loadOrCreateBrandProfile` existe en CLI pero **no expuesto HTTP**  
- Confirmación al cambiar con mensajes ✅  

### 7.2 Objetivo

- **Grid de cards:** nombre, propósito (profile.json), badge conocimiento  
- **Crear marca:** modal “Nombre de la empresa” → slug automático (`sanitizeBrandSlug`)  
- **Context chip:** color/accent por marca en header — persistente  
- **Cambio de marca:** modal confirmación + animación chip — imposible confundir A/B  

### 7.3 Aislamiento (copy oficial)

> “Estás trabajando dentro de **Geeks**. Lo que hagas aquí no se mezcla con otras marcas.”

Banner en: Home, Conversación, Conocimiento. No en Configuración global.

---

## 8. Knowledge (Conocimiento)

### 8.1 Pregunta que responde

> “¿Qué sabe ATLAS sobre mi empresa (en esta marca)?”

### 8.2 Implementable ahora (sin Kernel)

`GET /api/memory/search?query=&workspace=` — wrapper de `client.memory.searchContent` vía `@atlas/cli` / `SessionStore` pattern.

**UI v1 read-only:**

- Buscador  
- Cards: snippet, fecha relativa, tipo humanizado (Nota / Plan / Corrección)  
- Empty state enseñable  
- Mensaje: “Puedes consultar el conocimiento. La edición estará disponible en una futura versión.”  

### 8.3 Requiere evolución backend (NO implementar)

- Editar / eliminar registros  
- Upload documentos  
- Sync cloud  

### 8.4 Global vs marca

- **default** → “General” (conocimiento compartido) — copy explícito  
- Marca X → solo scope X — filtro server-side obligatorio  

---

## 9. Activity (Actividad)

### 9.1 Definición producto

Timeline legible de **lo que ATLAS hizo en esta instalación/sesión**, no consola de eventos Kernel.

### 9.2 Fuentes honestas (arquitectura actual)

| Evento UI | Fuente |
|-----------|--------|
| “Iniciaste una conversación” | Turno chat completado |
| “Consultaste conocimiento” | `retrieval.selected > 0` o tool turn inferido |
| “Corregiste una respuesta” | `/api/correct` → `recorded` |
| “Cambiaste a marca X” | Cambio workspace UI |

**No usar:** CompilerCompletedEvent, MemorySearchEvent, ToolCallEvent.

### 9.3 Persistencia (decisión)

- **v1:** sesión del proceso web (in-memory log en `apps/web`)  
- **v2:** archivo local `.atlas/web-activity.json` — requiere decisión owner, no ADR Kernel  
- **Cloud:** fuera de alcance  

---

## 10. Settings (Configuración)

### 10.1 Secciones v1 (read-only)

| Sección | Contenido |
|---------|-----------|
| General | Idioma (ES), apariencia (localStorage) |
| Marcas | Enlace a /marcas |
| Asistente de IA | Configurado / no configurado — sin nombres provider en vista normal |
| Avanzado | Versión ATLAS, `/api/health`, variables env enmascaradas, enlace USER_MANUAL operador |

### 10.2 Implementable sin Kernel

`GET /api/settings` — lectura env + `llm.isConfigured()` + version package.

---

## 11. Language system

### 11.1 Glosario oficial producto

| Técnico (interno) | Usuario (UI) | Justificación |
|-------------------|--------------|---------------|
| workspace | Marca / General | Entidad de negocio reconocible |
| brand | Marca | Consistente P2.3 |
| goal | Solicitud / pregunta | Lenguaje natural |
| memory | **Conocimiento** | Activo empresarial |
| memory search | Buscar en el conocimiento | Acción comprensible |
| memory store | Guardar información | Cuando exista UI |
| tool / tool call | *(oculto)* / “ATLAS consultó información” | Confianza sin jerga |
| deterministic mode | “ATLAS completó la tarea automáticamente” | Sin “modo determinista” |
| LLM | Asistente de IA | |
| provider | Servicio de IA | Solo avanzado |
| API key | Conexión con el servicio de IA | Solo avanzado |
| retrieval | Consulta de conocimiento | Nunca en UI |
| runtime / kernel | Motor de ATLAS | Solo avanzado |
| compile / execution | *(oculto)* | Fuera alcance web v1 |
| context | Contexto de la marca | |
| session_id / turn | *(oculto)* | Ver detalles |
| slug | *(nunca visible)* | Sanitizado server-side |
| feedback / correct | Corregir respuesta | |
| workflow_id | *(oculto)* | |

### 11.2 Reglas copy

- Verbos: Preguntar, Buscar, Continuar, Guardar — no Submit/Execute/Invoke  
- Tono: claro, corto, profesional, humano  
- i18n: cero strings críticos hardcodeados; preparar `es` → `es-EC`, `es-CO`, `en`  

### 11.3 Correcciones i18n pendientes (código)

- `nav.memory` → `nav.knowledge` = “Conocimiento”  
- `chat.thinkingSearch` → “…en tu **conocimiento**”  
- `workspace.generalHint` → eliminar “Memoria compartida” → “Información general compartida”  
- `switchConfirm` → sin “historial del servidor”  

---

## 12. Design system

### 12.1 Estado actual (`tokens.css` + `app.css`)

- Tokens color/spacing/radius alineados con UX doc ✅  
- Tema dark + light via `prefers-color-scheme` ✅  
- Componentes ad hoc (no biblioteca) ⚠️  
- Sin escala tipográfica formal ⚠️  

### 12.2 Sistema objetivo

| Categoría | Especificación |
|-----------|----------------|
| **Color** | Tokens existentes + `--color-brand-{slug}` opcional + semantic success/warning/error |
| **Typography** | `--text-xs`…`--text-2xl`, `--font-display`, `--font-body`, `--leading-*` |
| **Spacing** | Escala 4px base (existente) |
| **Radius** | sm/md/lg/full (existente) |
| **Shadow** | sm/md — sobrios |
| **Motion** | 150ms/250ms; `prefers-reduced-motion: reduce` |
| **Focus** | `--focus-ring: 2px solid var(--color-accent)` universal |

### 12.3 Componentes a formalizar

`ContextChip`, `ActionCard`, `EmptyState`, `ErrorPanel`, `LoadingSteps`, `KnowledgeCard`, `BrandCard`, `ActivityItem`, `FeedbackBar`, `Toast`, `Modal`, `Badge`.

### 12.4 Anti-patrones

Gradientes excesivos, glassmorphism, dashboards densos, iconos sin texto, consola debug visible.

**Estética:** premium · calmada · sobria · moderna · humana.

---

## 13. Accessibility

### 13.1 Presente (código)

- `lang="es"`, `aria-live` en thread, `role="status"`, touch 44px toggle, contraste tokens razonable  

### 13.2 Gap WCAG 2.2 AA (P1)

| Requisito | Acción |
|-----------|--------|
| Skip link | Añadir “Saltar al contenido” |
| `:focus-visible` | Todos los interactivos |
| `aria-busy` | Durante chat fetch |
| Heading hierarchy | Un `h1` por vista |
| Error announcements | Live region dedicada |
| Reduced motion | CSS media query |
| Form labels | Auditar 100% inputs |
| Color alone | Icono + texto en estados |

**Gate:** axe DevTools 0 critical en `/`, `/chat`, `/conocimiento` antes de PASS world-class.

---

## 14. Responsive

### 14.1 Breakpoints propuestos

| Breakpoint | Comportamiento |
|------------|----------------|
| `<480px` | Drawer nav; composer sticky bottom; chip marca compacto |
| `480–899px` | Sidebar colapsada; cards 1 col |
| `≥900px` | Sidebar fija; nav inline header; cards 2–3 col |

### 14.2 Mobile-specific (no “comprimir desktop”)

- Conversación: thread scroll, composer fijo, botón enviar prominente  
- Marcas: lista vertical full-width  
- Conocimiento: búsqueda sticky top  
- Sin bottom bar en v1 — evaluar en 3I si drawer insuficiente  

---

## 15. Trust & transparency

### 15.1 Principios

- Mostrar **qué marca** siempre  
- Mostrar **si se usó conocimiento** cuando datos lo permiten  
- Admitir **“no encontré información”** — no alucinar confianza  
- **Ver detalles** para operadores — colapsado  

### 15.2 Copy aprobados

| Situación | Mensaje |
|-----------|---------|
| Usó conocimiento | “Basado en información de tu marca {Marca}.” |
| N elementos | “Encontré {N} elementos relacionados en el conocimiento.” |
| Sin resultados | “No encontré información sobre esto en el conocimiento disponible.” |
| Incertidumbre LLM | Mostrar respuesta + sugerir verificar en Conocimiento |
| Modo sin IA | “ATLAS completó esta tarea automáticamente. Para conversación con IA, configura el asistente en Configuración.” |

### 15.3 Prohibido en superficie

“Retrieval executed”, “memory_search”, provider names, file paths, `.atlas/`.

---

## 16. Error UX

### 16.1 Taxonomía

| Clase | Ejemplo backend | Mensaje usuario | Acción |
|-------|-----------------|-----------------|--------|
| Usuario | goal vacío | “Escribe tu pregunta antes de enviar.” | — |
| Conexión | ECONNREFUSED | “No hay conexión con ATLAS.” | Reintentar |
| Temporal | 429 | “El servicio de IA está ocupado.” | Reintentar en unos segundos |
| Proveedor IA | tool_use_failed | “No pudimos consultar la información.” | Reintentar |
| Conocimiento vacío | 0 results | “No hay información sobre esto.” | Ir a Conocimiento |
| No permitido | llm_required | “El asistente de IA no está configurado.” | Configuración |
| Inesperado | 500 | “Ocurrió un error inesperado.” | Reintentar + detalles |

Cada error: mensaje + explicación breve + CTA + **Ver detalles** (provider, código, timestamp).

`formatUserError` actual cubre ~70% — extender taxonomy en `presentation/errors.ts`.

---

## 17. Empty states

| Vista | Copy dirección | CTA |
|-------|----------------|-----|
| Primera visita Home | “Bienvenido. Empieza preguntando a ATLAS.” | Preguntar |
| Chat sin mensajes | Existente ✅ — mantener + ejemplos | — |
| Sin marcas (solo General) | “Crea tu primera marca para separar contextos.” | Nueva marca |
| Conocimiento vacío | “Aún no hay información aquí. Cuando agregues conocimiento, ATLAS podrá usarlo.” | Cómo funciona |
| Actividad vacía | “Tu actividad aparecerá aquí cuando empieces a trabajar.” | Ir a Conversación |
| Búsqueda sin resultados | “No encontramos resultados para «{query}».” | Limpiar búsqueda |

**Regla:** nunca pantalla en blanco; nunca “Empty array” / “No data”.

---

## 18. Onboarding

### 18.1 Pregunta crítica

> “¿Sabe qué hacer en <30 s sin haber oído hablar de ATLAS?”

**Hoy:** **No** de forma consistente — Home incompleta, placeholders en 3 secciones.

### 18.2 Solución (sin tour modal invasivo)

1. Home accionable (3B)  
2. Empty states enseñables  
3. Ejemplos de preguntas clicables (rellenan composer — opcional P2)  
4. Primera marca: prompt suave si solo existe `default`  

**No:** wizard de 5 pasos; **Sí:** progresive disclosure.

---

## 19. Multi-tenant future

### 19.1 Modelo conceptual (no implementar)

```text
Empresa → Usuarios → Marcas → Conocimiento → Conversaciones → Actividad
```

### 19.2 Decisiones UX que NO bloquean futuro

- “Marca” como primitivo UI (no “workspace slug”)  
- Rutas RESTful `/marcas/:id`, `/conocimiento` con scope  
- i18n keys neutrales  
- Sin hardcode “usuario local Luis”  
- Sección “Cuenta” placeholder → “Modo local — esta instalación” honesto  

### 19.3 Evitar ahora

Login falso, multi-tenant UI sin backend, permisos enterprise.

---

## 20. Prioritized roadmap

### 20.1 Clasificación hallazgos

| ID | Hallazgo | Prioridad |
|----|----------|-----------|
| H1 | Historial perdido F5 | **P0** |
| H2 | Home no accionable <10 s | **P0** |
| H3 | Reintentar no wired | **P0** |
| H4 | Marcas técnicas (select/slug) | **P1** |
| H5 | Conocimiento placeholder | **P1** |
| H6 | Memoria → Conocimiento rename | **P1** |
| H7 | Feedback 👍/👎 | **P1** |
| H8 | Transparencia retrieval | **P1** |
| H9 | Loading steps | **P1** |
| H10 | Actividad timeline | **P1** |
| H11 | Configuración read-only | **P1** |
| H12 | WCAG 2.2 AA pass | **P1** |
| H13 | Design system componentes | **P2** |
| H14 | Tipografía escala | **P2** |
| H15 | Virtualización chat largo | **P3** |

### 20.2 Roadmap fases (orden recomendado — evidencia justifica reorden)

| Fase | Entrega | P | API nueva |
|------|---------|---|-----------|
| **3A** ✅ | Scaffold + shell + i18n + chat base | — | — |
| **3D** | `GET /api/history` + reload UI | **P0** | Sí — apps/web only |
| **3B** | Home accionable + ejemplos | **P0** | No |
| **3C** | Chat premium: retry, steps, transparency, feedback bar | **P1** | Mapper producto opcional |
| **3E** | Marcas grid + create + context chip | **P1** | `/api/brands` |
| **3F** | Conocimiento browse read-only | **P1** | `/api/memory/search` |
| **3G** | Actividad timeline sesión | **P1** | Log in-memory |
| **3H** | Configuración read-only | **P1** | `/api/settings` |
| **3I** | Responsive polish + WCAG | **P1** | No |
| **3J** | QA manual E3/E5 + polish visual | **P2** | No |

**Siguiente fase exacta para implementador:** **3D + 3B** (paralelizable; history primero en merge).

---

## 21. Architectural constraints

### 21.1 Obligatorio

```text
Usuario → Web UI (apps/web) → Express adapter → @atlas/cli → @atlas/sdk → Kernel
```

### 21.2 Prohibido

- Modificar Frozen/Certified para UX  
- Duplicar Memory/Compiler/Runtime/Planning en frontend  
- Acceso directo `.atlas` desde browser  
- Inventar persistencia no existente  
- Botones sin backend  

### 21.3 Endpoints delgados permitidos (apps/web only)

| Endpoint | Wrapper | ADR |
|----------|---------|-----|
| `GET /api/history` | SessionStore | No |
| `GET /api/brands` | listWorkspaces + loadOrCreateBrandProfile | No |
| `POST /api/brands` | sanitizeBrandSlug + loadOrCreateBrandProfile | No |
| `GET /api/memory/search` | memory.searchContent | No |
| `GET /api/settings` | env read + isConfigured | No |

Documentar en VERSION.md al implementar. Contrato `@atlas/cli` **no cambia**.

### 21.4 Requiere decisión arquitectónica (NO ahora)

| Necesidad | Por qué | Alternativa |
|-----------|---------|-------------|
| Editar memoria web | Toca Memory contracts | CLI hasta ADR |
| Streaming chat | SDK no expone | Fase posterior |
| Auth / multi-user | P2.6 condicional | Modo local honesto |
| Activity persistida disco | Nueva convención `.atlas` | In-memory v1 |
| Product mapper en server vs client | Decisión presentación | Recomendado: server enriquece respuesta |

**No ADR requerido** para gate actual.

---

## 22. Acceptance criteria (world-class PASS)

Usuario **no técnico**, **solo navegador**, LatAm/España:

1. Entiende qué es ATLAS en **<10 s** (Home).  
2. Identifica **marca activa** sin ambigüedad.  
3. Conversa en lenguaje natural — cero jerga visible.  
4. Ve actividad/loading que genera confianza.  
5. Recibe markdown legible + transparencia opcional de conocimiento.  
6. Corrige con 👍/👎 o flujo equivalente natural.  
7. Consulta **Conocimiento** read-only de su marca.  
8. Gestiona **Marcas** sin slug ni JSON.  
9. **F5** restaura conversación (mismo proceso server).  
10. Errores humanos + Reintentar.  
11. Navega mobile + teclado.  
12. No ve secrets, paths, stack traces.  

**Pregunta final:**

> “¿Una PYME latinoamericana usaría esto todos los días sin abrir la terminal?”

Solo **Sí** → world-class PASS.

**Estado hoy:** **No** — MVP slice 3A usable, no PASS final.

---

## 23. Final recommendation

### 23.1 Veredicto gate

| Dimensión | Veredicto |
|-----------|-----------|
| ¿Puede evolucionar a world-class? | **Sí** — arquitectura y Phase 2 lo permiten |
| ¿Está listo hoy? | **No** |
| ¿Listo para implementar siguiente fase? | **Sí** |
| ¿Requiere ADR? | **No** (fases 3D–3H) |
| ¿Requiere tocar Kernel? | **No** |

### 23.2 Qué puede implementarse sin arquitectura nueva

- Todo 3B, 3C (UI), 3D, 3E, 3F, 3G (in-memory), 3H, 3I, 3J  
- Endpoints delgados listados §21.3  
- Rename Conocimiento, glosario, design system components  
- Feedback 👍/👎 sobre `/api/correct` existente  

### 23.3 Qué requiere decisión (no implementar sin aprobación)

- Persistencia actividad en disco  
- Edición perfil marca (PUT profile)  
- Edición/eliminación conocimiento  
- Streaming  
- Auth / Cloud (P2.6 — **no autorizado**)  

### 23.4 Propuesta exacta — siguiente fase para agente implementador

**Fase: 3D + 3B**

**Entregables:**

1. `GET /api/history?workspace=` en `server.ts` + test integración + preload en chat  
2. Home rediseñada: 4 action cards + ejemplos + marca activa chip  
3. i18n: rename Conocimiento (nav + rutas redirect `/memoria` → `/conocimiento`)  
4. Wire botón Reintentar en chat (usa `lastFailedGoal`)  
5. Tests + quality gate + delta `VERSION.md` + `WEB_UI_PHASE_3D_B_IMPLEMENTATION.md`  

**Fuera de scope esta fase:** Marcas grid, Conocimiento API, Actividad, Configuración completa.

**Quality gate obligatorio:** `pnpm build`, `typecheck`, `lint`, `@atlas/web test` — todos PASS.

---

*Documento oficial Pre-Implementation Gate. Complementa [`WEB_UI_WORLD_CLASS_REVIEW.md`](./WEB_UI_WORLD_CLASS_REVIEW.md). Implementación autorizada solo según §20.2 y §23.4. Sin commit en esta tarea.*
