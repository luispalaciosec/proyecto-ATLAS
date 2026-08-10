# ATLAS — Design System

ATLAS es un asistente inteligente de conocimiento empresarial para pymes y organizaciones ("Tu asistente inteligente de conocimiento empresarial"). El producto es una aplicación web de escritorio (sidebar + contenido fluido) donde los usuarios conversan con ATLAS, buscan conocimiento guardado, cambian entre "marcas" (contextos de negocio aislados) y revisan actividad reciente.

## Fuentes

- Hoja de referencia visual (fuente de verdad): `assets/reference/atlas-reference-sheet.png` — logo, isotipo, construcción geométrica, paleta, tipografía, iconografía y capturas de la app ATLAS Web.
- Paleta de referencia: `assets/reference/colores-atlas.png`
- Logo aprobado (SVG, geometría inmutable — nunca redibujar): `assets/logo.svg` (construcción limpia por path) y `assets/logo-alt.svg` (versión trazada alternativa)
- Tipografías: `assets/fonts/Sora-VariableFont_wght.ttf` (display), `assets/fonts/Inter-Italic-VariableFont_opsz_wght.ttf` (Inter itálica). No se recibió el TTF de Inter regular/upright — se sustituye vía Google Fonts CDN (ver CAVEATS).
- No se adjuntó codebase ni archivo Figma: este sistema se construyó a partir de la hoja de referencia y el brief de marca provistos en el chat.

## Regla de marca no negociable

El isotipo ATLAS (A + cohete + trayectoria) es inmutable: nunca se redibuja, simplifica ni reinterpreta. Todo color aplicado al logo es solo una recoloración (blanco vía `filter:invert(1)` sobre el SVG negro) — la geometría original nunca cambia.

## Index

- `readme.md` — este archivo
- `styles.css` — punto de entrada global (importa `tokens/`)
- `tokens/` — colors.css, typography.css, spacing.css, fonts.css, base.css
- `guidelines/` — specimen cards de fundamentos (colores, tipografía, espaciado, marca) — ver pestaña Design System
- `assets/` — logo, fuentes, imágenes de referencia
- `components/` — 34 componentes React (`core/, forms/, surfaces/, feedback/, overlays/, navigation/, chat/, app/`)
- `ui_kits/atlas-web/` — recreación clicable de ATLAS Web (Inicio, Conversar, Conocimiento, Marcas, Actividad)
- `thumbnail.html` — tile del proyecto
- `SKILL.md` — versión portable para Claude Code

### Componentes

Core: Button, IconButton, Badge, Status, Avatar, Divider
Forms: Input, Textarea, SearchInput, Select, Listbox
Surfaces: Card, ActionCard, BrandCard, KnowledgeCard, ActivityItem, HistoryItem
Feedback: Alert, Toast, Tooltip, Skeleton, EmptyState, ErrorState
Overlays: Dialog, Popover
Navigation: NavItem, Sidebar, TopBar, BrandSelector
Chat: ConversationMessage, ChatComposer
App: AppShell, Hero, Section

### Adiciones intencionales

Ninguna: el inventario de componentes viene de la sección 42 del brief de marca (no de un codebase/Figma), así que se construyó tal cual se especificó ahí.

## CONTENT FUNDAMENTALS

- **Idioma:** español, siempre.
- **Tono:** claro, inteligente, conciso, humano, profesional. Nunca jerga técnica de cara al usuario.
- **Persona:** el producto habla en segunda persona ("Tu asistente...", "Conversa, busca conocimiento y trabaja con total privacidad en el contexto de tu marca").
- **Verbos de acción directos** en CTAs: "Iniciar conversación →", "Buscar conocimiento", "Gestionar marcas", "Ver actividad".
- **Vocabulario de producto obligatorio:**
  - "Trabajando en {General}" / "Trabajando con {Marca}" — nunca "Workspace" ni "Espacio de trabajo" ni "Marca activa".
  - "Conversar con ATLAS" — nunca "LLM Chat".
  - "Buscar conocimiento" — nunca "Ejecutar retrieval".
  - "Marcas" son contextos de negocio reales; "General" es un contexto real y default, no un placeholder.
- **Nunca:** métricas falsas, IDs técnicos o slugs visibles al usuario, jerga de IA/infra.
- **Emoji:** no se usan en la UI de producto (los emoji en las specimen cards de este sistema son solo placeholders de icono — sustituir por SVGs reales, ver ICONOGRAFÍA).
- **Eyebrow/tagline:** mayúsculas, tracking amplio, color muted — ej. "TU ASISTENTE INTELIGENTE DE CONOCIMIENTO EMPRESARIAL".

## VISUAL FOUNDATIONS

- **Color:** interfaz oscura premium por defecto. Fondo dominante navy muy oscuro (#0F172A), nunca negro puro. Jerarquía de superficies: bg → surface (#111C31) → elevated (#162238) → borders (#1E293B). Acentos con significado, no decoración: púrpura #685CFF = acción primaria; cian #22D3EE = conocimiento/información; verde #10B981 = éxito; amarillo #F59E0B = actividad/atención; rojo #F43F5E = error. Tema claro existe como "la misma app con otra luz" (#F8FAFC / #FFFFFF / bordes #E2E8F0), no un rediseño.
- **Tipografía:** Sora (display, weight 600, tracking levemente negativo) para títulos y hero; Inter (UI, 400–600) para todo lo demás. Escala restringida: display 40–48px, título de página 28–32px, sección 20–24px, cuerpo 14–16px, metadata 12–13px.
- **Fondos:** superficies planas — sin patrones, sin texturas, sin fotografía de stock. La única imaginería permitida es el motivo espacio/cohete/trayectoria (estrellas tenues, horizonte curvo, cohete ascendiendo con estela luminosa), reservado a Hero, onboarding y empty states — nunca en pantallas funcionales de trabajo diario.
- **Gradientes:** solo como acento controlado (ej. resplandor púrpura→cian detrás del cohete en el Hero). Nunca como tratamiento de fondo por defecto; nunca arcoíris ni "AI glow" excesivo.
- **Bordes y sombras:** la jerarquía se construye con borde 1px sutil (`--color-border`) + espaciado + contraste tipográfico, no con sombra. Sombra solo en overlays flotantes (Toast, Dialog, Popover) y siempre sutil (`--shadow-sm/md/lg`).
- **Radios:** moderados, nunca todo-píldora. Controles pequeños 8px, cards 10–14px, diálogos 14–18px. Pill (999px) reservado a badges/status/tags.
- **Espaciado:** grid base de 8px (4/8/12/16/20/24/32/40/48/64/80). 24px = padding de card; 32px+ = separación entre secciones.
- **Motion:** sutil y rápido — 140ms micro-interacciones, 200–240ms paneles/diálogos, easing `cubic-bezier(.4,0,.2,1)`. Sin bounce, sin animación "flashy" de IA. Respeta `prefers-reduced-motion`.
- **Hover/press:** hover = fondo levemente más claro/elevado o texto pasa a color primario; press = fondo levemente más oscuro. Nunca escalado/shrink.
- **Focus:** anillo 2px cian (`--color-focus-ring`) con offset — nunca púrpura sobre púrpura (se vuelve invisible).
- **Transparencia/blur:** mínimos — solo el overlay semitransparente detrás de un Dialog (`rgba(15,23,42,0.6)`). Nada de glassmorphism generalizado.
- **Imaginería:** cuando exista fotografía/ilustración de producto, debe ser fría, oscura, de bajo contraste cromático (consistente con el motivo espacial) — nunca cálida ni saturada tipo consumer-AI.

## ICONOGRAFÍA

- Line icons geométricos y minimalistas, stroke 1.5–2px, extremos redondeados. Nunca iconos "cartoon" ni estilo emoji rellenos.
- No se encontró una librería de iconos propia en las fuentes provistas → se sustituye por **Lucide** (CDN, `unpkg.com/lucide@latest`) por compartir el mismo peso de trazo geométrico fino. Documentado como sustitución — ver CAVEATS.
- Colores semánticos por icono: Conversar = púrpura, Conocimiento = cian/verde, Marcas = púrpura, Actividad = amarillo/naranja, Éxito = verde, Error = rojo, Información = cian.
- No se usa emoji en la UI real (los `💬📖🏢📈` dentro de `ui_kits/` y las cards de componentes son placeholders de desarrollo — sustituir por `<i data-lucide="...">` antes de producción, como en `guidelines/brand-iconography.html`).

## Sistema de tokens

Ver `tokens/colors.css`, `tokens/typography.css`, `tokens/spacing.css`. Alias semánticos (`--color-bg`, `--color-primary`, etc.) tienen un scope de tema claro bajo `[data-theme="light"]` en `tokens/colors.css`.

## CAVEATS — pedimos ayuda para iterar

1. **Fuente Inter incompleta:** solo se recibió el TTF itálico de Inter. El peso regular/upright se sirve vía Google Fonts CDN como sustitución temporal — si tienen los TTF oficiales (regular/medium/semibold), súbanlos y los integramos localmente.
2. **Iconografía sustituida por Lucide:** no llegó un set de iconos propio de ATLAS. Si existe un icon kit oficial (Figma, SVGs), lo copiamos directo y reemplazamos Lucide.
3. **Sin codebase ni Figma conectado:** este sistema se construyó 100% desde la hoja de referencia visual y el brief de marca. Si existe un repo o archivo Figma de ATLAS Web, conéctenlo para verificar/afinar componentes contra la implementación real.
4. **Motivo espacial/cohete:** se implementó como resplandor + horizonte en CSS (sin imagen), inspirado en la referencia. Si tienen el asset de ilustración original (imagen del cohete sobre horizonte), lo incorporamos en vez de la recreación CSS.

**Pregunta abierta para ustedes:** ¿el UI kit de ATLAS Web (Inicio/Conversar/Conocimiento/Marcas/Actividad) refleja bien los flujos reales del producto, o falta alguna pantalla (Configuración, Onboarding, estado de error de conexión) que quieran que prioricemos a continuación?
