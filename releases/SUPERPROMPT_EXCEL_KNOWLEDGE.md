# ATLAS — Excel Knowledge Ingestion
# AUDIT → STOP (autorización) → IMPLEMENT → TEST → QA → DOCUMENT → STOP

Alcance de este prompt: SOLO el soporte de Excel (.xls/.xlsx) como
fuente de Conocimiento. El Motion System se queda pausado para una fase
aparte — no lo toques aquí.

============================================================
0. CONTEXTO Y BASELINE
============================================================
Antes de arrancar, verifica que estás en el estado real. Pega o revisa
`releases/ESTADO_REAL_DEL_REPO.md` si tienes dudas. Resumen:

- Punto de partida: `main` en el commit `e87c3d0223c3c49e25360dca4443e570be066df0`.
- La rama de trabajo `feature/excel-knowledge` YA existe, creada desde
  ese `main` limpio y verificada de forma independiente (no la crees de
  nuevo). Solo confirma que estás parado ahí:
  ```bash
  git branch --show-current
  # debe decir: feature/excel-knowledge
  git log --oneline -1
  # debe decir: e87c3d0 Restore upload server test to pre-library expectations.
  git status
  # debe estar limpio salvo untracked (design/, releases/*.md) - normal
  ```
  Si no estás en esa rama: `git checkout feature/excel-knowledge`. Si
  no existe en tu checkout local, avisa antes de crearla tú mismo — no
  debería hacer falta.
- Si el commit base NO es `e87c3d0`, o `git status` muestra archivos de
  código modificados/sin seguimiento (más allá de `design/` y
  `releases/*.md`), DETENTE y reporta — no empieces sobre un estado
  distinto al verificado.
- Al terminar el trabajo de Excel, sigue habiendo una rama en pausa,
  `wip/knowledge-library-and-chat-reasoning`, con el feature de
  carpetas/biblioteca + chat-reasoning (commit `820e1ea`). No la toques,
  no te bases en ella, no la mezcles con este trabajo.

Baseline funcional verificado (checkout aislado real, no working tree):
```
build:      23/23 tasks OK
typecheck:  35/35 tasks OK
lint:       35/35 tasks OK
test:       46/46 tasks OK
  @atlas/sdk:      43/43
  @atlas/web:      172/172   <- el número que importa para este feature
  @atlas/cli:      72/72
  @atlas/memory:   128/128
  @atlas/runtime:  48 passed + 5 todo
```

Knowledge system ya existente y funcionando en `main`:
- Upload de PDF/DOCX/PPTX/TXT/MD (`apps/web/src/lib/knowledge-upload/`).
- Extracción de texto (`extract-text.ts`), chunking (`chunk-text.ts`),
  almacenamiento vía `atlas.memory.storeContent({content, recordType?, metadata?})`.
- Búsqueda de Conocimiento corregida (sin falsos positivos, sin devolver
  todo con query vacía) — `packages/sdk/src/modules/memory-module.ts`.
- Chat con prefetch automático de Conocimiento en cada turno (no confía
  en el historial de la conversación) — `packages/sdk/src/modules/llm-module.ts`,
  `prefetchKnowledgeForGoal`. Ya validado con casos de información nueva,
  información que se actualiza/contradice, y preguntas que cruzan
  documentos.

Hay un WIP separado (carpetas/biblioteca de documentos + UI de "Ver
razonamiento") guardado en la rama `wip/knowledge-library-and-chat-reasoning`.
No lo toques, no lo mezcles, no dependas de él.

IMPORTANTE — PRINCIPIO DE PRODUCTO:
No estamos construyendo "ChatGPT con Excel". Excel debe integrarse como
una fuente de Conocimiento más, al mismo nivel que PDF/DOCX/TXT/MD, no
como un sistema paralelo de "Excel Chat". Las empresas guardan buena
parte de su conocimiento real en hojas de cálculo — ventas, clientes,
precios, inventario, presupuestos — por eso importa que se sienta como
una fuente de primera clase, no un parche.

============================================================
1. GOBERNANZA — REGLA ABSOLUTA
============================================================
NO modificar bajo ninguna circunstancia:

packages/*
packages/core
packages/compiler
packages/runtime
packages/workflow
packages/memory
packages/retrieval
packages/events
packages/intelligence
packages/sdk
packages/cli

Estos paquetes son FROZEN / CERTIFIED.

Todo cambio debe quedar limitado a:
apps/web/
releases/
docs/
VERSION.md

Si para implementar XLS/XLSX es estrictamente necesario modificar un
paquete Frozen:

DETENTE. NO hagas el cambio. Explica:
1. qué contrato falta;
2. qué paquete tendría que modificarse;
3. por qué;
4. qué alternativas existen;
5. qué impacto tendría.
Espera autorización explícita.

Nota: `atlas.memory.storeContent` ya acepta `recordType` y `metadata`
libres — probablemente alcanza sin tocar `packages/sdk`, siguiendo el
mismo patrón que PDF/DOCX/PPTX. Confírmalo en la auditoría, no lo
asumas.

============================================================
2. REGLA DE EJECUCIÓN — PAUSA OBLIGATORIA TRAS LA AUDITORÍA
============================================================
PARTE A — Auditoría técnica.
↓
🛑 DETENTE. Entrega el informe y espera autorización explícita antes de
   escribir código. NO continúes a Parte B por tu cuenta.
↓ (solo tras autorización)
PARTE B — Implementación XLS/XLSX.
↓
PARTE C — Tests.
↓
PARTE D — Smoke test documentado.
↓
PARTE E — Regresión general (formatos existentes + búsqueda + chat).
↓
PARTE F — Quality Gate.
↓
PARTE G — Documentación.
↓
PARTE H — DETENERSE. NO commit. NO push. Presentar propuesta de commit.

============================================================
PARTE A — AUDITORÍA TÉCNICA
============================================================
NO escribas código todavía. Lee el código real, no asumas arquitectura.

Investigar el pipeline actual de Knowledge:
Browser → apps/web → API → ingestion → parser → normalization →
indexing → retrieval → chat

Identificar:
1. punto exacto donde agregar XLS/XLSX en el flujo de upload existente;
2. dependencias ya instaladas (revisar package.json/lockfile: xlsx,
   sheetjs, exceljs, o equivalente — si algo sirve, reutilizarlo);
3. cómo se extraen/normalizan otros formatos hoy (`extract-text.ts`);
4. cómo se hace chunking (`chunk-text.ts`) y si aplica igual a filas de
   una hoja de cálculo o necesita su propia estrategia;
5. cómo se almacenan y relacionan con Brand (`session-store.ts`,
   `atlas.memory.storeContent`);
6. cómo se recuperan/buscan (`memory-module.ts`, `matchesContentQuery`);
7. qué metadata ya existe en documentos subidos;
8. cómo se muestra el estado de upload al usuario en la UI hoy;
9. si existe alguna herramienta de cálculo/agregación reutilizable para
   preguntas tipo "¿cuál fue el total?" o si habría que apoyarse
   solamente en que el LLM razone sobre las filas recuperadas.

### Entregable Parte A
Crear `releases/WEB_UI_EXCEL_KNOWLEDGE_AUDIT.md` con:
- estado actual del pipeline;
- propuesta técnica para Excel;
- librería elegida y por qué;
- riesgos;
- archivos que se van a modificar/crear;
- tests planeados;
- decisiones sobre fechas, fórmulas y agregados (ver Parte B).

Después de esto: 🛑 DETENTE y espera luz verde.

============================================================
PARTE B — XLS/XLSX KNOWLEDGE INGESTION
============================================================
Implementar soporte para `.xls` y `.xlsx` como otra fuente dentro del
mismo Knowledge System — no un "Excel Chat" separado. Debe aparecer
junto a PDF/DOCX/TXT/MD en la misma UI de Conocimiento.

### B1 — Dependencia
Buscar primero si ya existe `xlsx`/`sheetjs`/`exceljs` en el lockfile.
Si no, elegir una librería madura evaluando licencia, mantenimiento,
soporte real de XLS y XLSX, uso en servidor (no browser), tamaño y
seguridad. No instalar algo redundante con lo que ya exista.

### B2 — Parser
Soportar como mínimo: múltiples hojas (preservando nombre de cada
una), headers, filas, texto, números, booleanos, fechas, celdas
vacías, y valores calculados de fórmulas cuando el parser los exponga.
No mezclar el contenido de distintas hojas sin distinguir a cuál
pertenece cada dato.

### B3 — Normalización
No mandar el binario del workbook al LLM. Convertir a una
representación estructurada (hoja → headers → filas) antes de
chunkear/indexar, adaptada a como ya funciona `chunk-text.ts` y
`storeContent`. Cada chunk debe conservar suficiente contexto (nombre
de hoja + headers) para que no pierda significado al recuperarse solo.

### B4 — Fechas
Excel representa fechas de formas distintas (fecha real, serial
number, string). Normalizar de forma consistente y documentar la
decisión — no convertir silenciosamente valores ambiguos.

### B5 — Fórmulas
Distinguir fórmula vs. valor calculado vs. fórmula sin valor cacheado
disponible. No prometer que ATLAS "ejecuta" fórmulas si el parser solo
lee el valor cacheado.

### B6 — Workbooks grandes
No cargar el Excel completo al contexto del LLM de una vez. Chunking +
retrieval debe traer solo las filas relevantes a cada pregunta,
conservando headers y nombre de hoja en cada chunk.

### B7 — Datos numéricos / agregados
Preguntas esperadas: "¿cuál fue el cliente con mayor venta?", "¿cuánto
vendimos en julio?", "¿qué clientes superaron $100.000?", "¿cuál es el
promedio?", "¿cuál fue el total?". No depender solo del cálculo mental
del LLM sobre texto recuperado si se puede evitar — si existe alguna
herramienta determinística reutilizable, úsala; si no, documenta en el
audit que el cálculo dependerá del razonamiento del LLM sobre los datos
recuperados, como limitación conocida.

### B8 — Trazabilidad
Cuando una respuesta venga de un Excel, conservar filename, hoja, y
document/record id en la metadata — igual que ya se hace con los demás
formatos. No crear un segundo sistema de citations.

### B9 — Aislamiento por Marca
Crítico: Excel de una Marca no puede aparecer en otra. Test explícito
obligatorio (ya existe el patrón para esto en los tests de knowledge
actuales — reutilizarlo).

### B10 — Versionado
Revisar cómo se maneja hoy un documento reemplazado (no hay borrado ni
reemplazo real todavía — se han subido versiones nuevas como documentos
adicionales y el chat prioriza la más reciente vía prefetch). Excel debe
comportarse igual: subir v1, preguntar, subir v2, preguntar de nuevo,
confirmar que la respuesta refleja v2.

### B11 — UX de upload
Reusar el flujo de estados que ya existe para otros formatos
(Subiendo → Procesando → Listo). Agregar solo los pasos que
correspondan realmente al parseo de Excel (ej. "N hojas encontradas").
No inventar pasos que no pasan de verdad. Error claro y humano si el
archivo está corrupto o no se puede leer, con opción de reintentar.

### B12 — Knowledge UI
Debe verse junto a los demás formatos, ej.:
```
📄 Manual Comercial.pdf     PDF · 32 páginas
📊 Ventas 2026.xlsx         Excel · 4 hojas
📄 Política Garantías.docx  DOCX
```

============================================================
PARTE C — TESTS
============================================================
- Upload: XLS aceptado, XLSX aceptado, formato no soportado rechazado.
- Parser: una hoja, varias hojas, headers, filas, numéricos, texto,
  fechas, celdas vacías, fórmulas.
- Retrieval: preguntas sobre una hoja, varias hojas, filas específicas,
  agregados, rankings.
- Aislamiento: Marca A no ve el Excel de Marca B.
- Versión: v1 → v2, la respuesta refleja la más reciente.
- Regresión: PDF, DOCX, TXT, MD siguen funcionando igual.
- Error: workbook corrupto → error humano + retry, no stack trace crudo.

============================================================
PARTE D — SMOKE TEST (checklist documentado, no ejecutarlo tú mismo)
============================================================
1. Crear marca de prueba.
2. Subir un XLSX con 2+ hojas.
3. Verlo en Conocimiento.
4. Preguntar un dato simple de una hoja.
5. Preguntar un dato de otra hoja.
6. Preguntar un cálculo/agregado.
7. Preguntar un ranking (ej. "quién vendió más").
8. Subir una versión nueva del mismo archivo con datos distintos.
9. Preguntar de nuevo y confirmar que refleja los datos nuevos.
10. Confirmar aislamiento entre marcas.
11. Subir un .xls (formato legacy) y repetir lo esencial.

Documentar el checklist en el archivo de implementación (Parte G) para
que yo lo ejecute en vivo después, igual que hicimos con el fix
anterior — no lo des por bueno solo con tests automatizados.

============================================================
PARTE E — REGRESIÓN
============================================================
Verificar que no se rompe: Home, Chat, Knowledge (formatos existentes),
Brands, Activity, brand switching, la búsqueda de Conocimiento
(fix de tokens/query vacía), y el chat con conocimiento fresco por
turno (fix de prefetch). Ninguno de estos dos fixes recientes debe
regresionar.

============================================================
PARTE F — QUALITY GATE
============================================================
Ejecutar en un checkout aislado real (`git worktree add --detach`, NO
en tu working tree con cambios sueltos — este punto es crítico, ya
tuvimos un commit roto por saltarlo):

```
pnpm --filter @atlas/web test
pnpm --filter @atlas/web typecheck
pnpm --filter @atlas/web lint
pnpm --filter @atlas/web build
pnpm test
pnpm atlas doctor
```

Todo debe pasar. Además:
```
git diff --name-only packages/
```
debe estar vacío. Levanta el servidor real desde ese checkout aislado y
confirma con `curl http://127.0.0.1:4173/api/health` que responde — no
lo des por hecho sin probarlo.

============================================================
PARTE G — DOCUMENTACIÓN
============================================================
Crear `releases/WEB_UI_EXCEL_KNOWLEDGE_IMPLEMENTATION.md` con:
arquitectura, decisiones (fechas, fórmulas, agregados), dependencia
elegida, formatos soportados, limitaciones conocidas, versionado,
aislamiento, tests, y el checklist de smoke test de la Parte D.
Actualizar `VERSION.md`.

============================================================
PARTE H — GIT
============================================================
NO hacer commit. NO hacer push. NO hacer `git add .`

Al terminar, mostrar:
1. `git status --short`;
2. archivos modificados y nuevos;
3. confirmación de que `packages/` no tiene diffs;
4. resultados reales de test/typecheck/lint/build/atlas doctor;
5. limitaciones conocidas;
6. el checklist de smoke test sin ejecutar (queda para verificación
   manual);
7. propuesta de mensaje de commit.

DETENERSE.

============================================================
CRITERIO DE ÉXITO
============================================================
1. Usuario puede subir XLS/XLSX desde Conocimiento.
2. ATLAS puede consultar su contenido desde Conversación.
3. Múltiples hojas conservan su contexto por separado.
4. Preguntas de agregados/rankings dan respuestas razonables.
5. La fuente de una respuesta es rastreable (archivo + hoja).
6. Aislamiento por Marca funciona.
7. Subir una versión nueva se refleja en las respuestas.
8. PDF/DOCX/TXT/MD siguen funcionando sin regresión.
9. UX de upload es clara y no inventa estados falsos.
10. Todos los quality gates pasan.
11. `packages/*` sigue intacto.

============================================================
FINAL
============================================================
EJECUTA: A → 🛑 STOP (esperar autorización) → B → C → D → E → F → G → H

NO hagas commit. NO hagas push. Si encuentras que hace falta tocar
`packages/*`, DETENTE y reporta en vez de implementarlo.
