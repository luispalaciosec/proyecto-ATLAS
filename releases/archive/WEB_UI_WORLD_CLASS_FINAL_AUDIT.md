# ATLAS Web UI — World-Class Final Audit

**Fecha:** 2026-08-09  
**Fase:** 3H — Pre-Pilot Product Gate  
**Alcance:** Auditoría UX/UI integrada — **sin modificaciones de código**  
**Prerequisitos auditados:** P2.5, 3A–3G.4 completados; `@atlas/web` 126/126 tests; quality gate verde

---

## 1. Executive Summary

ATLAS Web ha alcanzado un nivel de **producto funcional coherente**: Home accionable (3G.4), Chat operativo, Conocimiento browse/search, Actividad con timeline, Marcas con aislamiento backend-authoritative y selector unificado (3G.3). La arquitectura respeta la capa `apps/web` sobre SessionStore sin reimplementar Kernel.

Sin embargo, la experiencia **todavía no es totalmente world-class ni completamente honesta para un piloto de varias semanas** sin apoyo técnico. Los tests y el doctor HEALTHY validan contratos técnicos, pero esta auditoría detecta **fricción de producto, inconsistencias de lenguaje y promesas implícitas** que los tests no cubren.

**Hallazgos agregados:** 0 P0 · 8 P1 · 11 P2 · 6 P3

**Recomendación:** corregir P1 acotados (copy, honestidad de historial/actividad, dead-end Configuración/LLM, microcopy) antes de declarar piloto cerrado.

---

## 2. Pilot Readiness Verdict

### **NEEDS POLISH BEFORE PILOT**

| Criterio | Evaluación |
|----------|------------|
| P0 bloqueantes | **Ninguno** detectado |
| P1 pre-piloto | **8** — corregibles en `apps/web` sin tocar Frozen |
| Coherencia UX global | **Buena base**, inconsistencias residuales |
| Confianza / honestidad | **Mejorable** — historial y actividad requieren copy más explícito |
| Tests como proxy UX | **Insuficientes** — 126 tests no sustituyen esta auditoría |

El producto **puede usarse en piloto controlado** (equipo técnico cercano, LLM preconfigurado, expectativas alineadas). **No** está listo para piloto autónomo de pyme sin fricción ni sorpresas de confianza.

---

## 3. 10-Second Test

Simulación: primera visita a `/` con Marca **General**.

| Pregunta | ¿Responde la UI? | Severidad si falla |
|----------|------------------|-------------------|
| **¿Qué es esto?** | **Sí** — «ATLAS es el asistente de trabajo de tu empresa.» (`app.productPhrase`) | — |
| **¿Dónde estoy?** | **Sí** — «Trabajando en General» / «Trabajando con {Marca}» (`home.workingIn` / `workingWith`) | — |
| **¿Qué puedo hacer?** | **Sí** — primaria Conversar + secundarias + ejemplos + continuar + conocimiento + actividad | — |
| **¿Qué debería hacer ahora?** | **Sí** — `.home-primary` + CTA «Empezar una conversación» visualmente dominante | — |

**Veredicto 10s en Home:** **PASS**

**Fricción residual (P1):** al salir de Home, el shell muestra «Marca activa» mientras Home usa «Trabajando con» — el usuario puede dudar si es lo mismo.

---

## 4. Non-Technical User Test

| Task | Resultado | Fricción | Severidad | Evidencia |
|------|-----------|----------|-----------|-----------|
| **T1** Entrar y empezar conversación | **PASS** | Baja | — | Home CTA → `/chat`; composer claro |
| **T2** Entender Marca activa | **PASS** con reserva | Media | P1 | Home OK; shell dice «Marca activa» |
| **T3** Cambiar Marca | **PASS** | Alta | P1 | Confirmación en **cada** cambio (`workspace-switch.ts` L158–168) |
| **T4** Entender qué cambia | **PASS** | Baja | — | Diálogo `brands.switchDialogBody` explica contexto/conocimiento |
| **T5** Consultar Conocimiento | **PASS** | Baja | — | Nav + Home + búsqueda con ejemplos |
| **T6** Resultado → conversación | **PASS** | Baja | — | `setPendingChatDraft` + «Usar en una conversación» |
| **T7** Corregir respuesta | **PASS** | Media | P2 | Panel corrección; requiere descubrir botón «Corregir respuesta» |
| **T8** Retomar conversación anterior | **PASS** con reserva | Media | P1 | Home lista últimos mensajes usuario; todos abren mismo hilo Chat |
| **T9** Consultar Actividad | **PASS** | Baja | — | Timeline + filtros + scope note |
| **T10** Recuperarse de error | **PASS** | Baja | — | Retry en Chat, Home, Conocimiento, Actividad, Marcas |
| **T11** Sección vacía | **PASS** | Baja | — | Empty states humanos en todas las áreas principales |
| **T12** Uso móvil | **PASS** con reserva | Media | P2 | Targets ≥44px; sidebar colapsable; composer usable |

**Resumen:** tareas completables sin terminal. Fricción principal: **confirmación de Marca**, **vocabulario inconsistente**, **expectativa de «conversaciones» en Home vs hilo único**.

---

## 5. Product Language Audit

Búsqueda en `apps/web/src/client/**`, `apps/web/src/i18n/es.ts`, mappers de presentación consumidos por UI.

### Términos visibles al usuario (requieren acción)

| Término | Ubicación | Clasificación | Recomendación |
|---------|-----------|---------------|---------------|
| **espacio de trabajo** | `activity.subtitle` | **A — visible** | P1 — reemplazar por «Marca» o «en ATLAS» |
| **espacio principal** | `workspace.generalHint` | **A — visible** (popover shell si se usa hint) | P1 — «información general» |
| **Marca activa** | shell, Chat subtitle, chips | **A — visible** | P1 — alinear con «Trabajando con» o mantener estrategia dual documentada |
| **automáticamente** | `chat.deterministicSuccess` | **A — visible** en modo deterministic | P2 — «de forma directa» |
| **proceso estructurado** | `activity.conversationDeterministicBody` | **A — visible** en timeline | P2 — evitar lenguaje de sistema |
| **asistente de IA** | errores, actividad | **A — aceptable** | OK (traducción de LLM) |
| **Inteligencia artificial** | `chat.correctLlmRequired` → Configuración | **A — visible** | **P1** — Configuración es «Próximamente» (`app.ts` L100–118) |
| **Usar** | `knowledge.useInConversation`, `workspace.use` (legacy i18n) | **B/C** | P2 — preferir «Usar en una conversación» (ya existe) |
| **Confirmar** | `common.confirm` | **B** | P2 — revisar usos restantes |

### Solo código / tests / detalles técnicos ocultos (OK)

| Término | Ubicación | Clasificación |
|---------|-----------|---------------|
| workspace, slug, session | TS (`app-state`, `client.ts`, pages) | **C** — no UI |
| deterministic, llm, retrieval | mappers (`map-chat-response.ts`, `format-error.ts`) | **B** — `technicalDetails` bajo «Ver detalles» en errores |
| JSON | `mapChatResponse` → `technicalDetails` | **B** — oculto salvo expandir detalles |
| Kernel, SDK, CLI | no aparece en UI | **C** |
| tool_use_failed, 429, ECONNREFUSED | `format-error.ts` | **B** — mapeados a mensajes humanos |

### No encontrado en mensajes principales

`500`, `TypeError`, stack traces, slugs en textContent — **PASS** (validado por grep + tests Home «no geeks slug»).

---

## 6. Brand Context & Isolation UX

| Superficie | Contexto Marca | Banner aislamiento | Evaluación |
|------------|----------------|-------------------|------------|
| **Home** | «Trabajando en/con {name}» | **No** (3G.4) | **PASS** — elegante |
| **Chat** | Subtítulo «Marca activa: {name}» + chip implícito | **Sí** | **P2** — redundante con subtítulo |
| **Conocimiento** | context-chip + banner | **Sí** | **P2** — triple señal (header, chip, banner) |
| **Actividad** | context-chip + banner | **Sí** | **P2** — idem |
| **Marcas** | `brands.activeContext` + `isolationNote` | No banner | **PASS** |
| **Shell** | Selector con nombre humano | N/A | **PASS** |

**Confirmación cambio Marca:** modal accesible con origen/destino, aviso de borrador (`brands.switchDialogDraft`) — **PASS confianza**.

**Problema:** confirmación en **todo** cambio (salvo `skipConfirm` post-creación) — correcto para confianza, **fricción P1** para usuarios que alternan marcas a menudo.

**Estrategia recomendada (no implementada):** Home = «Trabajando con»; shell = selector compacto «Marca activa»; páginas internas = chip **o** banner, no ambos.

---

## 7. Chat Audit

| Aspecto | Estado | Notas |
|---------|--------|-------|
| Inicio / empty | **PASS** | `chat.emptyTitle/Body/Hint` |
| Composer | **PASS** | label + placeholder + Enviar |
| Loading | **PASS** | «ATLAS está trabajando…» / «consultando tu conocimiento…» |
| Error + retry | **PASS** | `formatUserError` + retry último mensaje |
| Corrección | **PASS** | Panel dedicado; feedback «Gracias…» |
| Markdown | **PASS** | `renderMarkdown` en respuestas assistant |
| Contexto Marca | **PASS** | Subtítulo + banner |
| Historial preload | **PASS** | `fetchHistory` al entrar |
| 👍 / 👎 | **N/A — no implementado** | Solo «Corregir respuesta» y copiar — **P3** |
| Respuesta deterministic | **P2** | `chat.deterministicSuccess` — tono técnico residual |
| Detalles técnicos | **PASS** | JSON payload solo bajo «Ver detalles» en **errores**, no en assistant OK |

**Riesgo confianza (P1):** si LLM no configurado, mensajes dirigen a «Configuración → Inteligencia artificial» — sección inexistente.

---

## 8. Knowledge Audit

| Aspecto | Estado | Notas |
|---------|--------|-------|
| ¿Entiende «Conocimiento»? | **PASS** | Subtítulo + empty + Home block 3G.4 |
| Búsqueda | **PASS** | Form con label; implementación `searchContent` (substring) |
| Promesa semántica/RAG | **PASS** | No promete vectorial ni RAG en copy |
| Empty / no-results / error | **PASS** | Estados completos + retry |
| Marca | **PASS** | Chip + banner + `sourceBrand`/`sourceGeneral` |
| → Chat | **PASS** | `setPendingChatDraft` |

**P2:** `knowledge.searchPlaceholder` («Buscar algo que ATLAS conozca…») puede sonar más amplio que búsqueda literal — aceptable si resultados son razonables.

**P2:** registros con contenido no-texto pueden mostrar JSON en snippet vía `extractText` fallback (`map-knowledge.ts` L55–56) — caso borde.

---

## 9. Activity Audit

| Aspecto | Estado | Notas |
|---------|--------|-------|
| Timeline | **PASS** | Agrupación Hoy/Ayer |
| Filtros | **PASS** | 5 filtros con `aria-pressed` |
| Empty / error / retry | **PASS** | Patrón consistente |
| Scope sesión | **PASS** en `/actividad` | `activity.scopeNote` visible en timeline |
| Scope en Home | **P1** | Preview Home **no** muestra nota de alcance sesión |
| Promesa auditoría histórica | **PASS** | No promete log durable completo |

**Limitación honesta:** actividad in-memory, reinicia al cerrar app — **comunicado en página Actividad**, **no en Home preview**.

---

## 10. Brands Audit

| Aspecto | Estado | Notas |
|---------|--------|-------|
| Listado + General | **PASS** | `BrandProduct.name` humano |
| Crear marca | **PASS** | Modal accesible, validación, éxito |
| Slugs visibles | **PASS** | `resolveBrandDisplayName`; tests verifican |
| Cards métricas | **PASS** | `knowledgeCount` real del backend; no inventado |
| Cambio Marca | **PASS** | `switchWorkspace` unificado |
| Responsive | **PASS** | Grid cards + modal |

**P2:** `brands.createButton` «+ Crear marca» — funcional, no premium-minimal.

---

## 11. Home Audit (3G.4)

| Requisito 3G.4 | Estado |
|----------------|--------|
| Contexto «Trabajando con/en» | **PASS** |
| Primaria Conversar | **PASS** |
| Secundarias | **PASS** |
| Ejemplos + draft | **PASS** |
| Continúa donde lo dejaste | **PASS** con reserva |
| Conocimiento estático | **PASS** |
| Actividad real | **PASS** |
| Empty / error parcial | **PASS** |
| Sin banner aislamiento | **PASS** |

**P1 — Continuación:** `deriveRecentConversationEntries` muestra hasta 3 **mensajes de usuario** del mismo hilo, no conversaciones separadas. Título «Continúa donde lo dejaste» puede sobreinterpretarse.

**P1 — Durabilidad:** copy «aquí podrás continuarla después» es cierto en sesión Web actual; **no** tras reinicio del servidor — no se comunica.

---

## 12. States Audit

| Pantalla | Default | Loading | Empty | Error | Retry | Partial failure |
|----------|---------|---------|-------|-------|-------|-----------------|
| Home | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (history/activity independientes) |
| Chat | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Conocimiento | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Actividad | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Marcas | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Configuración | — | — | **Próximamente** | — | — | **P1** dead-end |

**No detectado:** spinner infinito, pantalla blanca, CTAs rotos en flujos principales.

---

## 13. Error & Recovery Audit

**Patrón estándar:** mensaje humano + «Intentar de nuevo» + «Ver detalles» opcional.

`format-error.ts` traduce: 429, tool failures, ECONNREFUSED, llm_required, empty inputs — **PASS**.

**Riesgos:**

| Riesgo | Severidad | Evidencia |
|--------|-----------|-----------|
| Dead-end LLM → Configuración | **P1** | `errors.llmRequired`, `chat.correctLlmRequired` |
| Detalles técnicos en `<pre>` monospace | **P2** | Aceptable bajo toggle |
| `errors.server` genérico | **P3** | OK |

---

## 14. Loading Audit

| Ubicación | Copy | Evaluación |
|-----------|------|------------|
| Chat | «ATLAS está trabajando…» | **PASS** |
| Chat history | «Estamos recuperando tu conversación…» | **PASS** |
| Conocimiento | «Estamos buscando en el conocimiento de {name}…» | **PASS** |
| Actividad | «Estamos preparando tu actividad…» | **PASS** |
| Home history/activity | Mensajes específicos | **PASS** |
| Marcas | Skeleton cards | **PASS** |

**No detectado:** «Loading…», pasos falsos, contadores inventados en loading.

---

## 15. Feedback & Correction Audit

| Mecanismo | Estado |
|-----------|--------|
| 👍 / 👎 | **No existe** en UI |
| Corrección | **PASS** — panel + mensaje sistema confirmación |
| Retry chat | **PASS** |
| Copiar respuesta | **PASS** — `statusText` «Copiado» |
| Cambio Marca | **PASS** — `statusText` + `aria-live` status bar |
| Crear Marca | **PASS** — banner éxito en `/marcas` |

**P3:** ausencia de thumbs — corrección cubre feedback cualitativo para piloto.

---

## 16. History Audit

### Implementación real

```text
SessionStore (in-memory por proceso Node)
  → session.history (LLM turns)
  → #deterministicHistory (fallback)
  → mapSessionHistoryToProduct (timestamps sintéticos en mapper)
```

| Afirmación UI | ¿Honesta? | Severidad |
|---------------|-----------|-----------|
| Chat recupera historial al entrar | **Sí** — misma sesión servidor | — |
| Home «Continúa donde lo dejaste» | **Parcial** — mensajes recientes, no threads | P1 |
| Persistencia tras reinicio servidor | **No garantizada** | **P1** — no comunicado en Home/Chat |
| Persistencia tras F5 navegador | **Sí** — si servidor sigue vivo | — |
| localStorage Marca | **Sí** — `atlas.activeWorkspace` | — |

**No prometer:** «Siempre podrás volver…» — Home no lo dice literalmente, pero «continuarla después» sin calificador es **P1**.

---

## 17. Responsive Audit

Evaluación estática de `app.css` + estructura DOM.

| Breakpoint | Estado | Notas |
|------------|--------|-------|
| 390px | **PASS** | Columnas; home-primary stack; sidebar off-canvas |
| 768px | **PASS** | Grids 2–3 cols |
| 1024px | **PASS** | Shell inline nav visible ≥900px |
| 1280px+ | **PASS** | `--content-max: 760px` centra contenido |

| Check | Estado |
|-------|--------|
| Targets ≥44px | **PASS** — action-card, example-chip, buttons |
| Dialogs | **PASS** — focus trap `dialog.ts` |
| Composer mobile | **P2** — textarea 3 rows; usable |
| Overflow horizontal | **No detectado** en auditoría estática |

---

## 18. Accessibility Audit

| Criterio WCAG 2.2 AA | Estado |
|----------------------|--------|
| Contraste | **Probable PASS** — tokens dark/light |
| Headings | **PASS** — jerarquía por página |
| Landmarks | **PASS** — main, nav, sections |
| Labels | **PASS** — forms Chat, Conocimiento |
| Focus visible | **PASS** — `:focus-visible` en tokens |
| Focus trap dialogs | **PASS** — marcas + switch |
| Escape cierra | **PASS** — popover marca + dialogs |
| aria-live / aria-busy | **PASS** — Chat, Home async, Actividad, Conocimiento |
| Botones reales | **PASS** |
| prefers-reduced-motion | **PASS** — `tokens.css` L98–105 |

**P2:** status bar global pequeña — puede pasar desapercibida para usuarios de lector de pantalla vs regiones aria-live locales.

---

## 19. Visual Consistency Audit

**Impresión global:** **una sola aplicación**, no cinco equipos — tokens unificados (`tokens.css`), botones `.btn--*`, cards `.card`, dialogs `.dialog`.

| Elemento | Consistencia |
|----------|--------------|
| Typography | **Alta** — page titles, section titles |
| Spacing | **Alta** — `--space-*` |
| Buttons | **Alta** |
| Empty states | **Media-Alta** — Home usa `.home-empty`; Actividad `.activity-empty` — patrones similares |
| Loading | **Media** — texto vs skeleton (Marcas) |

**P2:** Home 3G.4 más «premium» que Configuración placeholder — contraste de madurez visible.

---

## 20. Component Consistency Audit

| Patrón | Implementaciones | Oportunidad |
|--------|------------------|-------------|
| Empty state | Home, Activity, Knowledge, Brands | Unificar clase `.empty-state` — **P3** |
| Error + retry | 5 páginas, lógica similar inline | Helper compartido — **P3** |
| context-chip + banner | Chat, Knowledge, Activity | Reducir duplicación — **P2** |
| Dialog | brands modal, switch modal | **PASS** — mismo `.dialog` |
| Example chips | Home, Knowledge | **PASS** — misma clase |
| Activity preview | Home inline vs `renderActivityPreview` en activity.ts | Home reimplementó — **P3** deuda |

**No refactorizar en 3H** — documentado para post-piloto.

---

## 21. Microcopy Audit

### CTAs descriptivos (PASS)

- «Empezar una conversación»
- «Explorar conocimiento»
- «Trabajar con otra marca»
- «Intentar de nuevo»
- «Continuar conversación»

### CTAs genéricos (mejorar)

| Copy | Ubicación | Severidad |
|------|-----------|-----------|
| «Confirmar» | `common.confirm` | P2 |
| «Enviar» | chat | P2 — aceptable en composer |
| «Buscar» | conocimiento | P2 — OK en contexto search |

### Inconsistencias nav vs Home

| Nav | Home / producto |
|-----|-----------------|
| «Conversación» | «Conversar con ATLAS» |
| — | «Trabajando con» vs shell «Marca activa» |

**P1** — unificar estrategia de vocabulario pre-piloto.

---

## 22. Onboarding Audit

**Sin wizard** — correcto para el estadio actual.

| Concepto | ¿UI lo explica? |
|----------|-----------------|
| Qué es ATLAS | **Sí** — Home hero |
| Qué es una Marca | **Parcial** — Marcas page + switch dialog; Home asume |
| Qué es Conocimiento | **Sí** — Home block + página |
| Cómo comenzar | **Sí** — CTA primaria |

**Veredicto onboarding implícito:** **PASS** — no requiere wizard; **P2** reforzar Marca en primera visita si solo ven Home (opcional tooltip).

---

## 23. Product Trust Audit

| Pregunta usuario | ¿UI responde con honestidad? |
|------------------|----------------------------|
| ¿Qué pasa si cambio de Marca? | **Sí** — dialog + status |
| ¿Qué pasa si ATLAS se equivoca? | **Sí** — corregir respuesta |
| ¿Qué pasa si no encuentra info? | **Sí** — no-results Conocimiento |
| ¿Qué pasa si cierro el navegador? | **Parcial** — actividad sí; historial chat **no explícito** |
| ¿Están mis datos seguros en la nube? | **PASS** — no promete seguridad cloud inexistente |

**No detectado:** «Tus datos están seguros», cifrado, compliance — **PASS** (no over-promise).

---

## 24. LATAM & Spain Usability

| Criterio | Evaluación |
|----------|------------|
| Español natural | **PASS** — tono pyme, sin anglicismos forzados en UI principal |
| Sin jerga Silicon Valley | **PASS** con excepciones P1/P2 listadas |
| Sin requisito IT | **PASS** — salvo setup LLM fuera de UI |
| Regionalismos | **Neutro** — válido LATAM + España |
| Contexto pyme | **PASS** — ejemplos cliente/proyecto/pedido |

**P1:** usuarios no técnicos que necesiten configurar IA no tienen ruta en UI.

---

## 25. Pilot Blocking Findings

### P0 — BLOQUEA PILOTO

**Ninguno identificado** en auditoría UX bajo uso normal con:

- LLM preconfigurado (`ATLAS_LLM_API_KEY` o equivalente);
- servidor Web estable durante la sesión;
- expectativa de herramienta local/single-user.

### P1 — CORREGIR ANTES DEL PILOTO

| ID | Hallazgo |
|----|----------|
| P1-01 | **Dead-end Configuración/LLM** — errores apuntan a sección inexistente |
| P1-02 | **Copy «espacio de trabajo»** en Actividad subtitle |
| P1-03 | **Copy «espacio principal»** en `workspace.generalHint` |
| P1-04 | **Vocabulario Marca inconsistente** — «Marca activa» vs «Trabajando con» |
| P1-05 | **Home continuidad** — mensajes usuario ≠ conversaciones separadas; copy puede confundir |
| P1-06 | **Honestidad historial** — no comunicar límite sesión/reinicio servidor |
| P1-07 | **Actividad Home** — falta scope note de sesión en preview |
| P1-08 | **Confirmación en cada cambio de Marca** — fricción alta para multi-marca |

### P2 — POLISH

| ID | Hallazgo |
|----|----------|
| P2-01 | Redundancia chip + banner en Chat/Conocimiento/Actividad |
| P2-02 | `chat.deterministicSuccess` / activity deterministic copy |
| P2-03 | Nav «Conversación» vs producto «Conversar» |
| P2-04 | Configuración «Próximamente» visible en nav sin indicador |
| P2-05 | Corrección descubrible solo tras respuesta assistant |
| P2-06 | Snippet JSON edge-case en Conocimiento |
| P2-07 | Status bar global discreta |
| P2-08 | Home más pulida que otras pantallas — ligera disparidad |
| P2-09 | `workspace.use` / keys i18n legacy sin uso shell |
| P2-10 | Composer mobile — textarea pequeña en sesiones largas |
| P2-11 | Confirm dialog focus en confirm (no cancel) — decisión UX agresiva |

### P3 — FUTURO

- Thumbs 👍/👎
- Unificar empty/error helpers
- Wizard onboarding Marca
- `renderActivityPreview` vs Home duplicate
- Edición/eliminación Marca

---

## 26. Recommended Fixes

**Solo recomendaciones — no implementadas.**

### Prioridad pre-piloto (P1, acotado a `apps/web`)

1. **LLM sin configurar:** mensaje honesto («Pide a quien instaló ATLAS que configure el asistente de IA») o ocultar nav Configuración hasta existir.
2. **Unificar copy Marca:** decidir mapa Home «Trabajando con» / shell «Marca activa» / páginas chip-only.
3. **Reemplazar «espacio de trabajo» y «espacio principal»** en i18n.
4. **Home historial:** calificar «en esta sesión» o renombrar a «Últimas preguntas» si no hay threads reales.
5. **Home actividad:** añadir una línea scope igual a `activity.scopeNote`.
6. **Cambio Marca:** confirmar solo cuando hay historial/draft (como 3G.3 original) o recuerdo «no volver a preguntar» en sesión.

### Post-piloto (P2)

- Reducir banners redundantes.
- Pulir copy deterministic.
- Indicador visual «Próximamente» en Configuración nav.

---

## 27. Explicitly Deferred Work

Conforme spec §26 — **no requisito pre-piloto:**

- Cloud, Auth, multiusuario, permisos
- Streaming
- RAG / búsqueda vectorial prometida
- Agentes, marketplace, plugins
- Mobile app nativa
- Persistencia durable actividad/historial (ADR futuro)
- Edición/eliminación Marca
- Onboarding wizard
- 👍/👎 feedback

---

## 28. Governance Check

```bash
git diff --name-only packages/{core,compiler,runtime,memory,retrieval,events,intelligence,sdk,cli,llm}
# (sin salida — ningún cambio en Frozen/Certified por esta auditoría)
```

**Estado repositorio:** cambios Web UI acumulados en `apps/web/` (untracked/modified según fases 3A–3G.4). **No se detectaron modificaciones accidentales a paquetes Frozen** en el diff de governance.

**Auditoría 3H:** **cero modificaciones de código** — solo este documento.

---

## 29. Existing Test Coverage

**Total `@atlas/web`:** 126 tests / 19 archivos.

| Área crítica piloto | Cobertura | ¿Protege garantía UX? |
|---------------------|-----------|------------------------|
| Home 3G.4 | 20 tests | **Sí** — contexto, draft, history, activity, errors |
| Chat | 5 tests | **Parcial** — no E2E composer |
| Conocimiento | 7 tests | **Sí** — search, draft, pending query |
| Actividad | 4 tests | **Parcial** — filtros básicos |
| Marcas | 12 tests | **Sí** — crear, switch mockeado |
| switchWorkspace | 4 tests | **Sí** — confirm, draft |
| Shell / brands catalog | 6 tests | **Sí** |
| Server API aislamiento | 31 tests | **Sí** — backend, no UX visual |
| format-error | 6 tests | **Sí** — no jerga en mensajes principales |

**Conclusión:** tests protegen **contratos y regresiones funcionales**, no percepción visual world-class ni honestidad de copy — coherente con objetivo 3H.

---

## 30. Final Verdict

### **NEEDS POLISH BEFORE PILOT**

ATLAS Web **supera el umbral de prototipo interno** y **puede iniciar un piloto controlado** con usuarios acompañados y LLM preconfigurado.

**No** está listo para declarar madurez world-class ni piloto autónomo de varias semanas sin:

1. resolver dead-end Configuración/LLM (P1-01);
2. alinear lenguaje de Marca y eliminar «espacio de trabajo» (P1-02–04);
3. honestidad explícita sobre historial y actividad de sesión (P1-05–07);
4. revisar fricción de confirmación de Marca (P1-08).

Tras corregir P1 (estimación: **1 sprint acotado solo `apps/web` + i18n**), el veredicto puede ascender a **READY FOR PILOT**.

---

**Siguiente paso sugerido:** Fase 3H.1 — Pilot Polish (solo P1, sin scope creep) → re-auditoría smoke manual S1–S15 + checklist T1–T12.

**Detener aquí. Sin implementación. Sin commit. Sin push.**
