# ATLAS Web — Product UX (P2.5.x)

**Tipo:** Propuesta UX/UI — Fase 2  
**Fecha:** 9 de agosto de 2026  
**Estado:** Aprobado para implementación incremental (Fase 3)  
**Prerequisito:** [`releases/WEB_UI_AUDIT.md`](../releases/WEB_UI_AUDIT.md) — Fase 1 PASS  
**Alcance:** `@atlas/web` (`apps/web/`) — interfaz operacional principal de producto  
**Fuera de alcance:** P2.6 Cloud, auth multi-usuario, billing, analytics, proyectos backend (hasta diseño explícito)

---

## 1. Objetivo

Convertir la Web UI de ATLAS de **demostración técnica** en **interfaz de uso diario**, donde una persona pueda:

- Abrir el navegador y saber **dónde empieza**.
- Elegir **marca / espacio de trabajo** sin terminal.
- Conversar en lenguaje natural mientras ATLAS usa memoria y herramientas **por detrás**.
- Corregir respuestas, revisar lo que ATLAS recuerda (lectura) y cambiar de contexto **sin mezclar marcas**.

Principio rector:

> **CLI = herramienta técnica** · **Web = producto**

Filosofía de diseño:

> **"Make the complex feel simple."**

---

## 2. Principios UX

| Principio | Aplicación en ATLAS Web |
|-----------|-------------------------|
| Progressive disclosure | Detalles técnicos bajo "Ver detalles"; configuración avanzada separada |
| Recognition over recall | Marca activa siempre visible; acciones con etiquetas claras, no comandos |
| Sensible defaults | Último espacio usado; conversación continúa al volver |
| Jerarquía clara | Chat es el centro; memoria y ajustes son secundarios |
| Feedback inmediato | Loading, actividad discreta, confirmaciones solo cuando importa |
| Prevención de errores | Confirmación al cambiar marca con conversación activa |
| Accesibilidad | Contraste, focus, teclado, ARIA razonable |
| No sobrediseñar | Sin dashboards analíticos, permisos enterprise ni cloud |

**Evitar:** modales innecesarios, iconos sin texto, jerga de Kernel/Compiler/Memory Engine en la UI principal.

---

## 3. Sitemap

```text
ATLAS Web
├── Inicio (Home)
│   ├── Resumen: dónde estoy · qué puedo hacer
│   └── Acceso rápido: continuar conversación · cambiar marca
│
├── Espacio de trabajo (Marca)
│   ├── Selector / lista de marcas
│   ├── Crear marca (asistente simple)
│   └── Detalle marca (nombre, propósito, tono — lectura/edición limitada)
│
├── Conversación (Chat)          ← pantalla principal
│   ├── Historial del hilo
│   ├── Input multilínea
│   ├── Actividad de ATLAS (opcional, expandible)
│   └── Acciones: corregir · copiar · reintentar
│
├── Memoria
│   └── Lo que ATLAS recuerda (solo lectura en v1 UX)
│
├── Configuración
│   ├── General (idioma, apariencia)
│   ├── Espacios de trabajo
│   ├── Inteligencia artificial (lectura env)
│   ├── Memoria (preferencias futuras)
│   └── Avanzado (doctor-lite, versión, detalles técnicos)
│
└── (Futuro — NO v1) Proyectos / contextos
    └── Requiere diseño backend — ver §16
```

**Routing propuesto (frontend):**

| Ruta | Vista | Prioridad Fase 3 |
|------|-------|------------------|
| `/` | Home | 1 |
| `/chat` | Conversación (default landing tras elegir marca) | 1 |
| `/espacios` | Lista y gestión de marcas | 2 |
| `/espacios/:slug` | Detalle marca | 3 |
| `/memoria` | Browse memoria read-only | 3 |
| `/configuracion` | Settings | 4 |
| `/configuracion/avanzado` | Técnico | 4 |

Implementación inicial puede ser **vistas en una SPA** sin recarga completa (hash o History API).

---

## 4. Navegación

### App shell

```text
┌─────────────────────────────────────────────────────────────┐
│ [ATLAS]   Geeks ▾          Conversación · Memoria · ⚙      │
│           └── Breadcrumb: Geeks                             │
├──────────┬──────────────────────────────────────────────────┤
│ Sidebar  │  Área principal                                  │
│ (colaps) │                                                  │
│          │                                                  │
│ • Inicio │                                                  │
│ • Chat   │                                                  │
│ • Memoria│                                                  │
│ • Marcas │                                                  │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

### Reglas

1. **Marca activa** siempre en header (no solo en dropdown oculto).
2. Cambiar marca desde header → **confirmación** si hay mensajes sin enviar o conversación activa reciente.
3. Sidebar colapsable en tablet/mobile; chat ocupa ancho completo.
4. Item activo resaltado; máximo 5 entradas primarias (no saturar).

### Mobile

- Header: logo + marca activa + menú hamburguesa.
- Bottom bar opcional: Chat · Memoria · Más.

---

## 5. Arquitectura frontend

### Capas (solo `apps/web/`)

```text
┌─────────────────────────────────────────┐
│  Views (Home, Chat, Memory, Settings)   │
├─────────────────────────────────────────┤
│  Components (shell, messages, activity) │
├─────────────────────────────────────────┤
│  Presenters / formatters                │
│  (errors, activity, workspace labels)   │
├─────────────────────────────────────────┤
│  API client (fetch wrappers)            │
├─────────────────────────────────────────┤
│  Router + app state (marca, sesión UI)  │
└─────────────────────────────────────────┘
         │ fetch
         ▼
┌─────────────────────────────────────────┐
│  apps/web/src/server.ts (Express)       │
│  + mappers amigables (opcional)         │
├─────────────────────────────────────────┤
│  @atlas/cli — sin duplicar lógica       │
└─────────────────────────────────────────┘
```

### Stack recomendado (Fase 3)

| Decisión | Elección | Razón |
|----------|----------|-------|
| Bundler | **Vite** en `apps/web/` | CSS modules, TS, HMR local |
| UI | **Vanilla TS + Web Components** o **Preact** | Ligero; no imponer React al monorepo |
| Markdown | `marked` + sanitización | Respuestas LLM legibles |
| Estado | Módulo simple o Preact signals | Sin Redux prematuro |
| Tests frontend | Vitest + Testing Library (si Preact) | Paridad con backend |

**No mover** lógica de negocio a frontend; solo presentación y orquestación HTTP.

### Contrato API evolutivo

Respuesta enriquecida (mapper en `server.ts`, **sin cambiar** `@atlas/cli`):

```typescript
interface ChatResponseProduct {
  assistant_message: string;
  activity?: Array<{ label: string; status: 'pending' | 'done' | 'error' }>;
  can_correct: boolean;
  turn: number;
  technical?: ChatTurnPayload; // expandible en UI
}
```

El frontend producto **solo renderiza** `assistant_message` y `activity` por defecto.

---

## 6. Arquitectura de componentes

### Shell

| Componente | Responsabilidad |
|------------|-----------------|
| `AppShell` | Layout, sidebar, header, outlet |
| `BrandSwitcher` | Selector marca + confirmación cambio |
| `ContextBanner` | "Estás en Geeks · Esta información es solo de esta marca" |
| `NavPrimary` | Enlaces principales |
| `StatusBar` | Conexión, turno, mensajes sistema |

### Chat

| Componente | Responsabilidad |
|------------|-----------------|
| `ChatThread` | Lista mensajes scrollable |
| `ChatMessage` | user / assistant / system; markdown assistant |
| `ChatInput` | textarea, Enter/Shift+Enter, submit disabled loading |
| `ChatActivity` | Panel expandible actividad ATLAS |
| `ChatActions` | Copiar, corregir (inline), reintentar |
| `CorrectionDialog` | Modal o inline panel "Corregir respuesta" |

### Memoria

| Componente | Responsabilidad |
|------------|-----------------|
| `MemoryList` | Cards con snippet + fecha |
| `MemorySearch` | Búsqueda simple |
| `MemoryEmpty` | Empty state guiado |

### Espacios

| Componente | Responsabilidad |
|------------|-----------------|
| `WorkspaceGrid` | Tarjetas Geeks, Revital, etc. |
| `WorkspaceCreate` | Form nombre → slug sanitizado |
| `WorkspaceProfile` | purpose, tone, rules (read/edit limitado) |

### Sistema

| Componente | Responsabilidad |
|------------|-----------------|
| `EmptyState` | Ilustración + CTA |
| `LoadingSkeleton` | Chat, lista memoria |
| `ErrorPanel` | Mensaje humano + Reintentar + Detalles |
| `TechnicalDetails` | Acordeón colapsado |
| `Toast` | Confirmaciones breves |

---

## 7. User journeys

### J1 — Primera visita (usuario nuevo)

```text
Abrir URL → Home explica ATLAS en 2 frases
→ "Elegir espacio de trabajo" → lista marcas + crear
→ Entrar a Geeks → banner aislamiento
→ Chat vacío con sugerencias: "Pregunta algo sobre tu negocio"
→ Escribe: "¿Qué sabemos del Banco Amazonas?"
→ Ve actividad: "Buscando en la memoria…"
→ Recibe respuesta en prosa (sin memory_search visible)
```

**Criterio éxito:** no pregunta "¿qué comando escribo?".

### J2 — Conversación multi-turno (E2 web)

```text
Chat → mensaje 1 → respuesta
→ mensaje 2 referenciando contexto
→ F5 recarga → historial restaurado (GET /api/history)
→ continúa sin perder hilo
```

### J3 — Cambio de marca (E4/E5)

```text
Header Geeks → cambiar a Revital
→ confirmación: "Cambiarás de marca. La conversación de Geeks se guarda."
→ banner: "Estás en Revital"
→ pregunta sobre dato de Geeks → no lo encuentra (correcto)
```

### J4 — Corrección (E6 / P2.4)

```text
Tras respuesta assistant → botón "Corregir"
→ textarea "¿Qué debería decir en su lugar?"
→ confirmación: "Gracias, lo tendré en cuenta"
→ nueva sesión → respuesta futura refleja feedback (si backend lo inyecta)
```

### J5 — Revisar memoria

```text
Nav Memoria → lista registros del espacio activo
→ buscar "Amazonas"
→ ver tarjetas; sin editar (v1)
```

### J6 — Error de IA (L-01)

```text
Envío mensaje → error amigable
→ "No pude completar la solicitud. Puedes reintentar."
→ Ver detalles → tool_use_failed / 429 (colapsado)
→ Reintentar
```

---

## 8. Design system

Estética: **premium · calmado · inteligente · profesional** — no "tech futurista" ruidoso.

### Color (tokens CSS)

| Token | Uso | Valor sugerido (dark default) |
|-------|-----|--------------------------------|
| `--color-bg` | Fondo app | `#0f1419` |
| `--color-surface` | Cards, sidebar | `#1a2332` |
| `--color-surface-elevated` | Modales | `#243044` |
| `--color-text` | Primario | `#e8edf4` |
| `--color-text-muted` | Secundario | `#94a3b8` |
| `--color-accent` | Acciones primarias | `#3b82f6` |
| `--color-accent-hover` | Hover | `#2563eb` |
| `--color-success` | OK | `#22c55e` |
| `--color-warning` | Avisos | `#f59e0b` |
| `--color-error` | Errores | `#ef4444` |
| `--color-border` | Divisores | `#334155` |
| `--color-user-bubble` | Mensaje usuario | `#1e3a5f` |
| `--color-assistant-bubble` | Mensaje ATLAS | `#1e293b` |

Tema claro: variante `@media (prefers-color-scheme: light)` + toggle en Configuración.

### Tipografía

| Rol | Familia | Tamaño |
|-----|---------|--------|
| Display | system-ui, "Segoe UI", sans-serif | — |
| Body | mismo | 16px / 1.5 |
| Small | mismo | 14px |
| Code inline | ui-monospace, monospace | 14px |

### Spacing (escala 4px)

`--space-1: 4px` … `--space-8: 32px` — usar múltiplos consistentes.

### Radius

| Token | Valor |
|-------|-------|
| `--radius-sm` | 6px |
| `--radius-md` | 10px |
| `--radius-lg` | 14px |
| `--radius-full` | 9999px (pills) |

### Shadows

Sutiles en cards y dropdowns; evitar sombras fuertes.

### Componentes base

Botones: **primary**, **secondary**, **ghost**, **danger** — altura mínima 44px (touch).

Inputs: borde `--color-border`, focus ring `--color-accent`.

Badges: marca activa, modo offline.

Skeletons: pulse suave en loading.

---

## 9. Lenguaje de interfaz (glosario)

**Idioma por defecto del producto:** español (es). Código y logs internos pueden permanecer en inglés.

| ❌ No mostrar (usuario normal) | ✅ Mostrar |
|-------------------------------|-----------|
| workspace | Espacio de trabajo |
| brand / slug | Marca |
| default | General / Principal |
| goal | Mensaje / Pregunta |
| memory_search | Buscando en la memoria… |
| memory_store | Guardando en la memoria… |
| tool-calling | Consultando información… |
| plan_and_execute | Planificando y ejecutando… |
| LLM | Asistente de IA |
| provider | Modelo de IA |
| Kernel | Motor de ATLAS |
| workflow_id, session_id | (solo en detalles técnicos) |
| Mode: deterministic | (oculto; mensaje humano alternativo) |
| /correct | Corregir respuesta |
| tool_use_failed | No pude usar una herramienta interna |
| CORE_INVALID_IDENTIFIER | No pude procesar ese dato. Revisa el nombre. |

### Tono de copy

- Segunda persona informal ("Pregúntale a ATLAS", "Estás en Geeks").
- Frases cortas; sin exclamaciones excesivas.
- Errores: empáticos + acción ("Reintentar"), no culpar al usuario.

---

## 10. Estados

### Loading

| Contexto | UI |
|----------|-----|
| Enviar mensaje | Input disabled + skeleton burbuja assistant + "ATLAS está pensando…" |
| Cargar historial | Skeleton thread |
| Cargar marcas | Skeleton lista |
| Actividad | Checklist progresiva (✓ Buscando… ✓ Preparando respuesta) |

**No simular streaming** si el backend no lo soporta.

### Empty

| Contexto | Copy ejemplo |
|----------|--------------|
| Chat sin mensajes | "Empieza una conversación. Pregunta lo que necesites sobre **Geeks**." |
| Memoria vacía | "ATLAS aún no recuerda nada en este espacio. Conversa y guardará hechos importantes." |
| Sin marcas (solo General) | "Crea tu primera marca para separar contextos de negocio." |
| Sin resultados búsqueda memoria | "No encontré nada con esa búsqueda." |

### Error

Estructura fija:

```text
[Icono] No pude completar la solicitud.
        [Reintentar]  [Ver detalles ▾]
        ─── detalles colapsados ───
        Error técnico: …
        HTTP: 429 · Modelo: …
```

Mapeo mínimo en `error-formatter.ts`:

| Patrón backend | Mensaje usuario |
|----------------|-----------------|
| `tool_use_failed` | El asistente de IA tuvo un problema al consultar información. Reintenta. |
| `429` / rate limit | Demasiadas solicitudes. Espera un momento y reintenta. |
| `llm_required` / sin API key | El asistente de IA no está configurado. Ve a Configuración → Inteligencia artificial. |
| `no_prior_turn` | Envía un mensaje antes de corregir una respuesta. |
| `ECONNREFUSED` | No hay conexión con ATLAS. Comprueba que la aplicación esté abierta. |
| `goal must not be empty` | Escribe un mensaje antes de enviar. |

### Success

- Toast breve: "Corrección guardada", "Marca creada".
- Sin modales bloqueantes para éxito rutinario.

---

## 11. Workspace UX (Marcas)

### Lista de marcas

Tarjetas con:

- Nombre visible (Geeks, Revital, BlessLight, Stack, Iglesia…)
- Una línea de propósito (desde `profile.json` si existe)
- Indicador "Activa"

Acciones: **Entrar** · **Editar** (limitado) · **Crear marca**

### Crear marca

Formulario humano:

1. Nombre: "Geeks" → slug `geeks` generado y editable con validación `[a-z0-9-]`
2. Propósito opcional (textarea)
3. Crear → entra al chat de esa marca

**No** pedir "brand slug" al usuario.

### Aislamiento visible

Banner persistente en chat y memoria:

> 🔒 Estás en **Geeks**. Lo que veas y guardes aquí no se mezcla con otras marcas.

Al cambiar:

> Ahora estás en **Revital**.

---

## 12. Proyectos / contextos (GAP — fuera v1)

El brief pide jerarquía:

```text
Geeks
  └── Banco Amazonas
  └── Campaña Digital
```

**Estado backend:** no existe modelo de proyecto. **STOP** — no implementar UI falsa.

**v1 UX:** solo marca (espacio). Breadcrumb preparado en shell para v2:

```text
Geeks  ›  (sin proyecto — v2)
```

Documentar en Configuración → Avanzado como "Próximamente".

---

## 13. Chat UX

### Layout

- Thread ocupa altura disponible (flex column).
- Input fijo abajo; mensajes scroll arriba.
- Máximo ancho lectura ~720px centrado en desktop ancho.

### Mensajes

| Rol | Estilo |
|-----|--------|
| Usuario | Burbuja derecha, acento |
| ATLAS | Burbuja izquierda, markdown (listas, **negrita**, `código`) |
| Sistema | Centrado, muted, pequeño |

### Input

- Placeholder: "Pregunta algo a ATLAS…"
- **Enter** → enviar · **Shift+Enter** → nueva línea
- Botón enviar deshabilitado si vacío o loading
- Sin campo "Goal"

### Acciones por mensaje assistant

- Copiar
- Corregir (si `can_correct`)
- (Futuro) Útil / No útil

### Deterministic mode (sin LLM)

No mostrar metadata Kernel. Mensaje humano:

> ATLAS completó una tarea automática. (Ver detalles técnicos)

---

## 14. Actividad de ATLAS

Panel **opcional** bajo el último mensaje user, colapsado por defecto en mobile.

Ejemplo expandido:

```text
Actividad de ATLAS
  ✓ Buscando en la memoria
  ✓ Encontré 3 elementos
  ✓ Preparando respuesta
```

Implementación v1: inferir de `llm_turns > 1` + fases genéricas; v2: mapper server con eventos reales si CLI expone hooks (sin cambiar kernel).

**No mostrar JSON** de tool results.

---

## 15. Memoria UX

### Pantalla "Lo que ATLAS recuerda"

- Scope: **solo marca activa**
- Lista + búsqueda (wrapper `GET /api/memory/search` — apps/web)
- Card: snippet texto · fecha relativa · tipo humanizado ("Nota", "Plan", "Corrección")

### Operaciones v1

| Operación | v1 |
|-----------|-----|
| Ver lista | ✅ (con endpoint delgado) |
| Buscar | ✅ |
| Ver detalle | ✅ (expand card) |
| Editar | ❌ gap backend |
| Eliminar | ❌ gap backend |
| Corregir | ✅ vía chat (feedback) |

Empty state: ver §10.

---

## 16. Feedback UX

Reemplazar panel permanente "Correct last response" por:

1. Botón **"Corregir respuesta"** en última burbuja assistant (habilitado si hubo turno LLM).
2. Inline expand o modal pequeño con textarea.
3. Confirmación: "Gracias. Tendré esto en cuenta en respuestas futuras."

Estados backend mapeados:

| `CorrectionOutcome.status` | UI |
|----------------------------|-----|
| `recorded` | Toast éxito |
| `no_prior_turn` | "Envía un mensaje antes de corregir." |
| `llm_required` | Link a configuración IA |
| `usage` | Mensaje del backend traducido |

---

## 17. Configuración

### General

- Idioma: Español (default) · English
- Apariencia: Sistema · Claro · Oscuro

### Espacios de trabajo

- Enlace a gestión marcas

### Inteligencia artificial

- Estado: configurado / no configurado (lectura env)
- Texto humano: "Tu administrador debe configurar el modelo de IA" (sin nombres Groq/Anthropic en vista normal)

### Avanzado

- Versión ATLAS
- Health (`/api/health` + doctor-lite futuro)
- Provider, model, endpoints (solo lectura)
- Enlace documentación CLI para operadores

---

## 18. Accesibilidad

| Requisito | Implementación |
|-----------|----------------|
| Contraste | WCAG AA mínimo en texto y botones |
| Focus | `:focus-visible` ring visible en todos interactivos |
| Teclado | Tab order lógico; Escape cierra modales |
| ARIA | `aria-live="polite"` en nuevos mensajes; `aria-busy` en loading |
| Labels | Todos inputs con `<label>` o `aria-label` |
| Touch | Targets ≥ 44×44px |
| Motion | `prefers-reduced-motion` desactiva animaciones |

---

## 19. Responsive

| Breakpoint | Comportamiento |
|------------|----------------|
| ≥ 1024px | Sidebar fija + chat ancho |
| 768–1023px | Sidebar colapsable overlay |
| < 768px | Header + hamburger; chat full width; input sticky bottom |

Probar: iPhone SE, iPad, laptop 1280px.

---

## 20. Plan de implementación (Fase 3)

Orden estricto (incremental, cada paso shippable):

| # | Entrega | Archivos principales |
|---|---------|---------------------|
| 1 | Vite + TS scaffold + tokens CSS | `apps/web/vite.config.ts`, `src/ui/` |
| 2 | App shell + router + BrandSwitcher | shell components |
| 3 | Glosario + error formatter | `src/i18n/es.ts`, `error-formatter.ts` |
| 4 | Chat v2 (markdown, input, loading) | `ChatThread`, `ChatInput` |
| 5 | `GET /api/history` + reload | `server.ts`, ver [`WEB_UI_CHAT_HISTORY_RELOAD_FIX.md`](../releases/WEB_UI_CHAT_HISTORY_RELOAD_FIX.md) |
| 6 | Actividad ATLAS (discreta) | `ChatActivity` |
| 7 | Corrección inline | `CorrectionDialog` |
| 8 | Home + empty states | `HomeView` |
| 9 | Memoria read-only API + UI | `GET /api/memory/search` |
| 10 | Configuración + Avanzado | `SettingsView` |
| 11 | Responsive + a11y pass | CSS breakpoints, audit manual |
| 12 | Tests frontend + regresión API | vitest, existing 7 server tests |

**No iniciar** proyectos/contextos hasta ADR o diseño producto.

---

## 21. Criterios de aceptación (§29 brief)

Usuario sin conocimiento previo de ATLAS puede, **solo desde el navegador**:

| # | Criterio | Verificación |
|---|----------|--------------|
| 1 | Abrir ATLAS | URL carga Home claro |
| 2 | Entender qué es | Copy en Home ≤ 3 líneas |
| 3 | Elegir marca | BrandSwitcher sin terminal |
| 4 | Saber contexto activo | Banner + header |
| 5 | Iniciar conversación | Chat + placeholder claro |
| 6 | Preguntar lenguaje natural | Sin memory_search en UI |
| 7 | Ver cuando ATLAS busca | Actividad o loading |
| 8 | Recibir respuesta | Markdown legible |
| 9 | Corregir respuesta | Flujo Corregir |
| 10 | Continuar conversación | Multi-turn + historial reload |
| 11 | Cambiar marca | Con confirmación |
| 12 | Entender aislamiento | Banner + E5-equivalent web |
| 13 | Volver después | Historial sesión (mismo proceso web) |

**Prueba especial (§30):** el usuario pregunta "¿Dónde empiezo?" y la UI lo hace obvio — no "¿Qué comando?".

---

## 22. Límites de scope

### Incluido P2.5.x

- Product UX en `apps/web`
- Endpoints delgados en `apps/web/src/server.ts`
- Mappers presentación
- Design system local al paquete web

### Excluido

- P2.6 Cloud
- Auth / multi-usuario
- Billing / analytics dashboards
- Proyectos backend
- Streaming LLM
- Editar/eliminar memoria (hasta API exista)
- Cambios en `@atlas/core`, `@atlas/memory`, `@atlas/llm`, ADRs Frozen
- Romper CLI (`pnpm atlas --help`, `doctor` siguen OK)

---

## 23. Decisiones importantes

| ID | Decisión | Razón |
|----|----------|-------|
| UX-1 | Español default producto | Piloto Luis / marcas LATAM |
| UX-2 | `@atlas/cli` sigue siendo backend lógico | Respeta apps/README.md |
| UX-3 | Mapper amigable en apps/web, no cambiar ChatTurnPayload en CLI | Evita ripple en tests CLI |
| UX-4 | Vite dentro de apps/web solamente | Sin imponer toolchain al monorepo |
| UX-5 | Memoria v1 read-only | No inventar edit/delete |
| UX-6 | Proyectos STOP | Gap backend documentado |
| UX-7 | No streaming simulado | Honestidad UX |

---

## 24. Riesgos y mitigación

| Riesgo | Mitigación |
|--------|------------|
| Scope creep proyectos | Flag "v2" en doc; no UI mock |
| Errores LLM crudos | error-formatter obligatorio antes de ship |
| Historial confuso | Prioridad item #5 Fase 3 |
| Regresión CLI/web | CI raíz build+test; E3/E5 smoke manual |
| Framework overweight | Preact/vanilla; revisar en sprint 1 |

---

## 25. Referencias

| Documento | Enlace |
|-----------|--------|
| Auditoría Fase 1 | [`releases/WEB_UI_AUDIT.md`](../releases/WEB_UI_AUDIT.md) |
| Validación E1–E6 | [`releases/MANUAL_VALIDATION_REPORT_2026-08-09.md`](../releases/MANUAL_VALIDATION_REPORT_2026-08-09.md) |
| Fix historial | [`releases/WEB_UI_CHAT_HISTORY_RELOAD_FIX.md`](../releases/WEB_UI_CHAT_HISTORY_RELOAD_FIX.md) |
| P2.5 plan original | [`releases/P2_5_WEB_UI_IMPLEMENTATION_PLAN.md`](../releases/P2_5_WEB_UI_IMPLEMENTATION_PLAN.md) |
| Apps governance | [`apps/README.md`](../apps/README.md) |
| Playbook QA | [`guides/VERIFICATION_PLAYBOOK.md`](./guides/VERIFICATION_PLAYBOOK.md) |

---

## Entrega Fase 2

```text
ARCHIVOS MODIFICADOS
  (ninguno — propuesta documental)

ARCHIVOS NUEVOS
  docs/WEB_UI_PRODUCT_UX.md

TESTS / BUILD / TYPECHECK / LINT
  No ejecutados (sin cambios de código)

MANUAL QA
  N/A — documento de diseño

GAPS DOCUMENTADOS
  Proyectos/contextos, memoria edit/delete, streaming, settings persistidos

DECISIONES ARQUITECTÓNICAS
  Ver §23 — sin cambios a paquetes certificados en Fase 2

VEREDICTO FASE 2
  PASS — Propuesta UX/UI lista para Fase 3 (implementación incremental).
```

---

*Siguiente paso autorizado: Fase 3 ítems 5–12 (historial reload, actividad, memoria read-only, settings). Entregables 1–4 implementados — ver [`releases/WEB_UI_PHASE_3_IMPLEMENTATION.md`](../releases/WEB_UI_PHASE_3_IMPLEMENTATION.md).*
