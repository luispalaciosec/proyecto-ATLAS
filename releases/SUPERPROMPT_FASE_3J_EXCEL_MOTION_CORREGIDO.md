# ATLAS — FASE 3J
# EXCEL KNOWLEDGE + PREMIUM MOTION SYSTEM
# AUDIT → STOP → (autorización) → IMPLEMENT → TEST → QA → DOCUMENT → STOP

> Nota de corrección: este prompt fue revisado antes de ejecutarse. El
> baseline original tenía datos desactualizados (12 commits de atraso) y
> el flujo original saltaba de auditoría a implementación sin pausa. Ambas
> cosas se corrigieron abajo. Todo lo demás del contenido técnico (Parte
> B en adelante) es el original, sin cambios.

============================================================
0. CONTEXTO Y BASELINE (CORREGIDO)
============================================================
ATLAS Web está actualmente operativo y validado para piloto.

Rama de partida obligatoria: `feature/3j-excel-motion`, creada desde
`main` limpio en el commit `e87c3d0223c3c49e25360dca4443e570be066df0`.

Verifica al arrancar:
```bash
git log --oneline -1
# debe mostrar: e87c3d0 (o un commit posterior en feature/3j-excel-motion
# que descienda de e87c3d0 - nunca de commits más viejos)
git status
# debe estar limpio salvo por design/ (assets sueltos, no afecta código)
```

Baseline funcional real (verificado de forma independiente en un
checkout aislado de `e87c3d0`, no en working tree):
- Design System ATLAS integrado.
- Fase 3I Accessibility / Responsive implementada (WCAG P0/P1).
- Mobile drawer accesible, keyboard navigation, focus management,
  dialog inert + focus restore.
- Chat con status announcements.
- Brand isolation backend-authoritative.
- Knowledge system: upload de PDF/DOCX/PPTX/TXT/MD funcionando
  (`apps/web/src/lib/knowledge-upload/`), con extracción, chunking
  (`chunk-text.ts`) y almacenamiento vía `atlas.memory.storeContent`.
- Knowledge search corregido: el matching de tokens ya no genera falsos
  positivos con palabras cortas comunes (`packages/sdk/src/modules/memory-module.ts`),
  y la búsqueda vacía ya no devuelve todo el conocimiento.
- Chat con conocimiento fresco por turno: cada turno hace un prefetch
  automático de Conocimiento (`packages/sdk/src/modules/llm-module.ts`,
  función `prefetchKnowledgeForGoal`) en vez de confiar en el historial
  de la conversación. Esto fue validado en producción con tres casos:
  1. información nueva que antes no existía;
  2. información que se actualiza y contradice una versión anterior
     (ATLAS corrige explícitamente su respuesta previa);
  3. preguntas nuevas que cruzan múltiples documentos con razonamiento
     adicional (ej. detectar que un cliente es VIP y ajustar la
     recomendación).
- `pnpm atlas doctor` → HEALTHY.
- `packages/*` permanece FROZEN / CERTIFIED.

Quality gate real en checkout aislado de `e87c3d0` (NO 143/143 — ese
número es de 12 commits atrás, de la Fase 3I original):
```
build:      23/23 tasks OK
typecheck:  35/35 tasks OK
lint:       35/35 tasks OK
test:       46/46 tasks OK
  @atlas/sdk:      43/43
  @atlas/web:      172/172   <- el número que importa para 3J
  @atlas/cli:      72/72
  @atlas/memory:   128/128
  @atlas/runtime:  48 passed + 5 todo
```

Existía además un WIP suelto y sin commitear sobre `main` (feature de
carpetas/biblioteca de documentos + UI de "Ver razonamiento"/métricas de
tokens en el chat, ~1736 líneas en 16 archivos). Se movió a su propia
rama (`wip/knowledge-library-and-chat-reasoning`) antes de crear
`feature/3j-excel-motion`, precisamente para que 3J no herede cambios a
medio terminar en los mismos archivos que 3J también va a tocar
(`chat.ts`, `knowledge.ts`, `server.ts`). No la toques ni la mezcles.

IMPORTANTE:
El objetivo de esta fase NO es crear un "Excel Chat".
Excel debe convertirse en una nueva fuente de conocimiento dentro del
mismo Knowledge System de ATLAS.
Además, se implementará un sistema transversal de Motion / Animation
para que ATLAS se sienta premium.

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

Todo cambio debe quedar inicialmente limitado a:
apps/web/
releases/
docs/
VERSION.md

Si para implementar XLS/XLSX es estrictamente necesario modificar un
paquete Frozen:

DETENTE.
NO hagas el cambio.
Explica:
1. qué contrato falta;
2. qué paquete tendría que modificarse;
3. por qué;
4. qué alternativas existen;
5. qué impacto tendría.
Espera autorización explícita.

Nota: `atlas.memory.storeContent({content, recordType?, metadata?})` ya
acepta `recordType` y `metadata` libres — la mayoría de lo que necesita
Excel (recordType: 'spreadsheet', metadata con sheet/columnas/fila)
probablemente cabe sin tocar `packages/sdk`, siguiendo el mismo patrón
que ya usa el pipeline de PDF/DOCX/PPTX. Confírmalo en la auditoría
(Parte A) en vez de asumirlo.

============================================================
2. OBJETIVO DE LA FASE
============================================================
Esta fase tiene DOS entregables independientes pero relacionados:

A. SOPORTE REAL DE XLS/XLSX EN KNOWLEDGE.
B. SISTEMA DE MOTION PREMIUM PARA ATLAS WEB.

Ambos deben quedar:
- accesibles;
- responsive;
- coherentes con Design System;
- testeados;
- documentados;
- sin regresiones.

============================================================
3. REGLA DE EJECUCIÓN (CORREGIDO — GATE DE APROBACIÓN)
============================================================
Ejecutar en este orden, CON UNA PAUSA OBLIGATORIA entre A y B:

PARTE A
Auditoría técnica.
↓
🛑 DETENTE. Entrega el informe de auditoría y espera autorización
   explícita antes de continuar. NO empieces Parte B por tu cuenta.
↓ (solo tras autorización)
PARTE B
Implementación XLS/XLSX.
↓
PARTE C
Tests y validación Excel.
↓
PARTE D
Smoke test Excel (checklist documentado, no manual todavía).
↓
PARTE E
Motion System.
↓
PARTE F
Tests de regresión + Accessibility.
↓
PARTE G
Smoke test visual (checklist documentado).
↓
PARTE H
Regresión general.
↓
PARTE I
Quality Gate.
↓
PARTE J
Documentación.
↓
PARTE K
DETENERSE. NO commit. NO push. Presentar propuesta de commit.

Motivo de la pausa entre A y B: esta fase introduce una dependencia npm
nueva (parser de Excel) y toca 16+ archivos que ya tuvieron WIP
conflictivo antes. Igual que en los fixes anteriores de este proyecto,
verificamos antes de avanzar — no se asume que la auditoría automáticamente
autoriza la implementación.

============================================================
PARTE A — AUDITORÍA TÉCNICA
============================================================
Antes de modificar código, inspeccionar completamente el flujo actual.
NO crear código todavía.

Investigar:
- Knowledge upload.
- File picker.
- Drag & drop.
- MIME validation.
- Extension validation.
- Upload API.
- Storage.
- Document metadata.
- Parser.
- Chunking.
- Indexing.
- Retrieval.
- Search.
- Knowledge UI.
- Document cards.
- Processing states.
- Error states.
- Brand isolation.
- Versioning.
- Replacement.
- Existing file types.

Encontrar el pipeline real:
Browser
→ apps/web
→ API
→ ingestion
→ parser
→ normalization
→ indexing
→ retrieval
→ chat

No asumir arquitectura.
Leer el código real.

Identificar:
1. punto exacto donde agregar XLS/XLSX;
2. dependencias existentes;
3. qué parser se utiliza;
4. cómo se almacenan documentos;
5. cómo se indexan;
6. cómo se relacionan con Brand;
7. cómo se recuperan;
8. qué metadata ya existe;
9. cómo se muestra el estado al usuario;
10. si `packages/sdk` ya alcanza (storeContent + metadata libre) o si
    hace falta algo que no existe.

### Entregable Parte A
Crear:
releases/WEB_UI_PHASE_3J_EXCEL_MOTION_AUDIT.md

Debe contener:
- estado actual;
- arquitectura encontrada;
- propuesta;
- dependencias;
- riesgos;
- alcance;
- archivos que serán modificados;
- tests necesarios;
- decisiones técnicas.

Después de crear el audit: 🛑 DETENTE y espera autorización antes de
Parte B, salvo que exista una violación de governance (en cuyo caso
también te detienes, pero para reportar el bloqueo en vez de pedir luz
verde para continuar).

============================================================
PARTE B — XLS/XLSX KNOWLEDGE INGESTION
============================================================
Implementar soporte para:
- .xls
- .xlsx

La UI debe mostrar:
Excel (.xls, .xlsx)

No crear un "Excel Chat" separado.
Excel debe aparecer junto a:
- PDF
- DOCX
- TXT
- MD
- otros formatos ya soportados.

============================================================
B1 — DEPENDENCIA
============================================================
Antes de instalar nada:
inspeccionar package.json y lockfile.
Buscar si ya existe:
- xlsx;
- sheetjs;
- exceljs;
- parser equivalente.

Si existe una solución adecuada:
REUTILIZARLA.

Si no existe:
seleccionar una librería madura y compatible.
Evaluar:
- licencia;
- mantenimiento;
- soporte XLS;
- soporte XLSX;
- browser vs server;
- bundle;
- seguridad;
- tamaño;
- performance.

No introducir una dependencia innecesaria.

============================================================
B2 — PARSER
============================================================
Implementar parsing de:
XLS
XLSX

Debe soportar como mínimo:
- múltiples hojas;
- nombre de hoja;
- headers;
- filas;
- texto;
- números;
- booleanos;
- fechas;
- celdas vacías;
- valores de fórmulas cuando estén disponibles.

Preservar la identidad de cada hoja.

Ejemplo conceptual:
Workbook
├── Ventas
├── Clientes
├── Productos
└── Resumen

No mezclar hojas sin metadata.

============================================================
B3 — NORMALIZACIÓN
============================================================
NO enviar el workbook binario al LLM.
Convertirlo a representación estructurada.

Ejemplo conceptual:
{
  type: "spreadsheet",
  filename: "ventas-2026.xlsx",
  sheets: [
    {
      name: "Ventas",
      headers: [
        "Cliente",
        "Mes",
        "Ventas",
        "Margen"
      ],
      rows: [...]
    }
  ]
}

Adaptar esto a la arquitectura real.

La representación debe:
- preservar headers;
- preservar filas;
- preservar hoja;
- preservar metadata;
- permitir retrieval;
- permitir trazabilidad.

============================================================
B4 — FECHAS
============================================================
Excel puede representar fechas como:
- fechas reales;
- serial numbers;
- strings;
- timestamps.

Implementar normalización consistente.
No convertir silenciosamente valores ambiguos.
Documentar la decisión.

============================================================
B5 — FÓRMULAS
============================================================
Distinguir:
1. fórmula;
2. valor calculado;
3. fórmula sin valor calculado disponible.

NO prometer ejecución de fórmulas si el parser no las ejecuta.
Si existe valor cacheado:
preservarlo.

============================================================
B6 — GRANDES WORKBOOKS
============================================================
NO cargar todo el Excel al contexto del LLM.

Pipeline esperado:
Excel
→ parse
→ normalize
→ metadata
→ chunk/index
→ retrieval
→ relevant rows
→ LLM

Preservar:
- headers;
- sheet name;
- row context.

Un chunk nunca debería perder el significado de sus columnas.

============================================================
B7 — DATOS NUMÉRICOS
============================================================
ATLAS debe poder contestar preguntas como:
- ¿Cuál fue el cliente con mayor venta?
- ¿Cuánto vendimos en julio?
- ¿Qué clientes superaron $100.000?
- ¿Cuál es el promedio?
- ¿Cuál producto tuvo mayor margen?
- ¿Cuál fue el total?

IMPORTANTE:
No confiar exclusivamente en cálculo mental del LLM.
Primero inspeccionar las herramientas existentes de ATLAS.
Si ya existe calculator/tool:
REUTILIZARLA.
No crear una segunda arquitectura de cálculo.

Preferir:
retrieval
→ datos relevantes
→ cálculo determinístico
→ explicación LLM

============================================================
B8 — TRAZABILIDAD
============================================================
Cuando una respuesta provenga de Excel, conservar source metadata.
Como mínimo:
- filename;
- sheet;
- source/document id;
- Brand.

Si el sistema actual ya tiene citations:
REUTILIZARLAS.
NO crear un segundo sistema.

============================================================
B9 — AISLAMIENTO POR MARCA
============================================================
CRÍTICO.
Excel de Marca A:
NO puede aparecer en:
Marca B.

Crear tests explícitos.

============================================================
B10 — VERSIONADO
============================================================
Inspeccionar primero cómo ATLAS maneja actualmente documentos
reemplazados. NO inventar un mecanismo paralelo.
Si existe versionado:
reutilizarlo.

Caso obligatorio:
1. subir Excel versión 1;
2. preguntar;
3. subir versión 2;
4. preguntar nuevamente;
5. comprobar comportamiento esperado.

Nota: el comportamiento esperado ya está validado a nivel de chat
(prefetch por turno + corrección explícita cuando hay contradicción,
ver sección 0). Confirma que Excel se comporta igual que los documentos
de texto en este sentido.

============================================================
B11 — UX DE UPLOAD
============================================================
El flujo debe ser:
Seleccionar
→ Subiendo
→ Procesando
→ Analizando
→ Indexando
→ Listo

Solo mostrar estados que realmente existan en backend.
NO fingir procesos.

Cuando termine:
"✓ ATLAS puede consultar este archivo"
o copy equivalente coherente con i18n.

Error:
"No pudimos leer este archivo."
Mostrar:
- causa humana;
- acción;
- retry.

No mostrar stack trace salvo "Ver detalles".

============================================================
B12 — KNOWLEDGE UI
============================================================
No crear sección separada para Excel.

Ejemplo:
CONOCIMIENTO
[ Buscar conocimiento ]
Fuentes
📄 Manual Comercial.pdf
PDF · 32 páginas
📊 Ventas 2026.xlsx
Excel · 4 hojas
📄 Política Garantías.docx
DOCX

El usuario debe entender inmediatamente:
"Esto ahora forma parte del conocimiento de mi Marca."

============================================================
PARTE C — TESTS EXCEL
============================================================
Crear tests para:

### C1 Upload
- XLS accepted.
- XLSX accepted.
- Unsupported rejected.

### C2 Parser
- one sheet;
- multiple sheets;
- headers;
- rows;
- numeric;
- text;
- dates;
- empty cells;
- formulas.

### C3 Retrieval
Preguntas sobre:
- una hoja;
- varias hojas;
- filas específicas;
- agregados;
- rankings.

### C4 Isolation
Marca A ≠ Marca B.

### C5 Version
Version 1 → Version 2.

### C6 Regression
PDF;
DOCX;
TXT;
MD;
deben seguir funcionando.

### C7 Error
Workbook corrupto → error humano + retry.

============================================================
PARTE D — SMOKE TEST EXCEL
============================================================
Crear checklist documentado:

S1 Crear Marca Test Excel.
S2 Subir XLSX.
S3 Ver documento en Conocimiento.
S4 Preguntar dato simple.
S5 Preguntar dato de otra hoja.
S6 Preguntar cálculo.
S7 Preguntar ranking.
S8 Subir versión nueva.
S9 Preguntar nuevamente.
S10 Confirmar aislamiento.
S11 Subir XLS legacy.
S12 Repetir prueba.

============================================================
PARTE E — MOTION SYSTEM
============================================================
Una vez que XLS/XLSX esté funcional y testeado:
implementar Motion System.

NO animar por animar.

ATLAS debe sentirse:
- premium;
- rápido;
- calmado;
- preciso;
- tecnológico;
- empresarial.

NO:
- flashy;
- juguetón;
- excesivo;
- SaaS genérico.

============================================================
E1 — MOTION TOKENS
============================================================
Crear tokens centralizados.

Ejemplo:
--motion-fast
--motion-normal
--motion-slow
--ease-standard
--ease-emphasized
--ease-decelerate
--ease-accelerate

Usar los tokens en toda la UI.
No hardcodear durations repetidas.

============================================================
E2 — REDUCED MOTION
============================================================
Debe funcionar:
@media (prefers-reduced-motion: reduce)

Reducir:
- transforms;
- transitions;
- movement.

Mantener:
- feedback;
- estados;
- claridad.

Nunca depender del movimiento para comunicar información.

============================================================
E3 — PRIORIDAD 1: KNOWLEDGE UPLOAD
============================================================
Este es el flujo más importante.

Debe sentirse como:
ARCHIVO
↓
ATLAS LO PROCESA
↓
ATLAS LO CONVIERTE EN CONOCIMIENTO
↓
LISTO PARA CONSULTAR

Ejemplo conceptual:
📊 ventas-2026.xlsx
Subiendo...
↓
Procesando workbook...
↓
4 hojas encontradas
↓
12.438 filas
↓
Indexando...
↓
✓ ATLAS puede consultar este archivo

IMPORTANTE:
Solo mostrar métricas reales.
No inventar.

============================================================
E4 — DRAWER
============================================================
Mobile drawer:
- entrada suave;
- backdrop;
- salida;
- focus;
- inert.

No romper accesibilidad.

============================================================
E5 — POPOVERS
============================================================
Fade + desplazamiento mínimo.
Nada exagerado.

============================================================
E6 — DIALOGS
============================================================
Entrada:
opacity + scale mínimo.
Salida:
rápida.

Mantener:
focus trap;
inert;
Escape;
restore focus.

============================================================
E7 — CHAT
============================================================
No animar todo el historial.
Animar únicamente nuevo contenido cuando tenga sentido.

NO crear fake typing si ATLAS no está haciendo streaming.
Si backend no streaméa:
NO simular escritura letra por letra.

============================================================
E8 — PROCESSING
============================================================
Estados de procesamiento deben sentirse vivos.

Ejemplo:
ATLAS está consultando conocimiento...
ATLAS está analizando...
ATLAS está preparando la respuesta...

IMPORTANTE:
El copy debe representar únicamente procesos reales.
No mentir visualmente.

============================================================
E9 — MICROINTERACTIONS
============================================================
Aplicar coherentemente:
buttons;
icon buttons;
cards;
nav;
copy;
success;
error;
loading;
toggles.

Estados:
default
hover
focus
active
disabled
loading
success
error

============================================================
E10 — PERFORMANCE
============================================================
Preferir:
opacity;
transform;

Evitar:
- JS animation loops;
- layout thrashing;
- animar width/height innecesariamente;
- grandes shadows animadas;
- blur pesado;
- efectos costosos.

============================================================
E11 — ACCESSIBILITY
============================================================
Toda animación debe respetar:
WCAG;
keyboard;
focus;
screen readers;
reduced motion;
contrast.

No modificar ni degradar los fixes 3I.

============================================================
E12 — DESIGN SYSTEM
============================================================
Utilizar tokens existentes.

NO crear:
- colores arbitrarios;
- tipografías nuevas;
- radios arbitrarios;
- sombras arbitrarias.

Si falta un token:
añadirlo correctamente al Design System.

Nota: hay assets sueltos en `design/` (logo, fuentes Sora/Inter) en la
raíz del repo, sin commitear. Revísalos como referencia si son
relevantes, pero no dependas de que sigan ahí — no forman parte de
ningún commit todavía.

============================================================
PARTE F — TESTS MOTION
============================================================
Crear tests para:
- motion tokens;
- reduced motion;
- drawer;
- dialog;
- popover;
- upload states;
- no fake streaming;
- focus preservation;
- no regression accessibility.

No intentar testear "que se vea bonito" con tests unitarios.
Eso se valida mediante smoke test manual.

============================================================
PARTE G — SMOKE TEST VISUAL
============================================================
Documentar:
M1 Home.
M2 Navigation.
M3 Mobile drawer.
M4 Brand switcher.
M5 Dialog.
M6 Knowledge upload.
M7 Excel processing.
M8 Chat response.
M9 Copy.
M10 Correction.
M11 Error/retry.
M12 Dark theme.
M13 Light theme.
M14 prefers-reduced-motion.
M15 375px mobile.
M16 768px tablet.
M17 desktop.

============================================================
PARTE H — REGRESSION
============================================================
Después de implementar todo:
verificar que NO se rompe:
- Home;
- Chat;
- Knowledge;
- Brands;
- Activity;
- Brand switching;
- dialogs;
- navigation;
- accessibility 3I;
- knowledge search (fix de tokens/query vacía);
- chat con conocimiento fresco por turno (fix de prefetch).

Especial atención al bug previamente corregido:
subscribe
→ renderCurrentRoute
→ patchState
→ subscribe
NO reintroducir render loops.

============================================================
PARTE I — QUALITY GATE
============================================================
Ejecutar, en un checkout aislado real (`git worktree add --detach`,
no en tu working tree con cambios sueltos):

pnpm --filter @atlas/web test
pnpm --filter @atlas/web typecheck
pnpm --filter @atlas/web lint
pnpm --filter @atlas/web build
pnpm test
pnpm atlas doctor

Resultado esperado:
TESTS PASS
TYPECHECK PASS
LINT PASS
BUILD PASS
MONOREPO PASS
ATLAS DOCTOR HEALTHY

Además:
git diff --name-only packages/
Debe estar vacío.

Y levanta el servidor real desde ese checkout aislado y confirma con
`curl` que responde — no lo des por hecho.

============================================================
PARTE J — DOCUMENTACIÓN
============================================================
Crear:
releases/WEB_UI_PHASE_3J_EXCEL_MOTION_AUDIT.md
releases/WEB_UI_PHASE_3J_EXCEL_MOTION_IMPLEMENTATION.md

Actualizar:
VERSION.md
docs/README.md

La documentación debe incluir:
- arquitectura;
- decisiones;
- dependencia Excel;
- formatos soportados;
- limitaciones;
- versionado;
- retrieval;
- cálculos;
- aislamiento;
- tests;
- smoke tests;
- motion tokens;
- reduced motion;
- accessibility;
- performance.

============================================================
PARTE K — GIT
============================================================
NO hacer commit.
NO hacer push.
NO hacer git add .

Al finalizar mostrar:
1. git status --short
2. archivos modificados;
3. archivos nuevos;
4. packages diff;
5. tests;
6. typecheck;
7. lint;
8. build;
9. monorepo;
10. atlas doctor;
11. limitaciones;
12. smoke test;
13. propuesta de commit.

DETENERSE.

============================================================
CRITERIO DE ÉXITO
============================================================
La fase solo se considera completa si:
1. Usuario puede subir XLS/XLSX.
2. ATLAS realmente puede consultar su contenido.
3. Múltiples hojas conservan contexto.
4. Datos numéricos pueden ser calculados correctamente.
5. Fuente puede rastrearse.
6. Aislamiento por Marca funciona.
7. Versiones actualizadas funcionan según la arquitectura existente.
8. Formatos anteriores no se rompen.
9. UX de upload es clara.
10. Motion es consistente con el Design System.
11. Motion no rompe accessibility.
12. Reduced motion funciona.
13. No existe fake streaming.
14. No existen render loops.
15. Todos los quality gates pasan.
16. packages/* sigue intacto.

============================================================
PRINCIPIO DE PRODUCTO
============================================================
NO estamos construyendo:
"ChatGPT con Excel".

Estamos construyendo:
"ATLAS entiende el conocimiento de una empresa, incluyendo sus
documentos y sus datos."

Excel es importante porque una empresa no guarda su conocimiento
solamente en PDFs. Tiene:
- políticas;
- manuales;
- contratos;
- clientes;
- ventas;
- precios;
- inventario;
- presupuestos;
- reportes;
- indicadores;
- listas;
- operaciones.

Por eso XLS/XLSX no debe sentirse como un parche.
Debe convertirse en una fuente de conocimiento de primera clase dentro
de ATLAS.

Y el Motion System debe reforzar la percepción de:
"Esto es una herramienta profesional de trabajo."
NO una demo.
NO una landing page.
NO otro chatbot.

============================================================
FINAL
============================================================
EJECUTA:
A → 🛑 STOP (esperar autorización) → B → C → D → E → F → G → H → I → J → K

NO te detengas después de crear el audit sin al menos haberlo entregado
para revisión — pero SÍ detente ahí y espera luz verde antes de tocar
código.

NO hagas commit.
NO hagas push.

Si encuentras una dependencia que obligaría a modificar packages/*:
DETENTE y reporta.

Si no, y ya tienes autorización tras la Parte A:
IMPLEMENTA.

Al terminar, entrega el informe final y queda detenido esperando
autorización para commit.
