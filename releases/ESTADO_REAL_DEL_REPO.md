# Estado real del repo ATLAS — ancla de verdad

Generado tras verificación directa del repo (no autorreporte). Pega este
archivo completo en cualquier conversación con ChatGPT, Cursor, o
conmigo cuando haya duda sobre en qué estado está el código. Así los
tres partimos del mismo hecho, no de memoria o de lo que cada uno cree
que pasó.

## 1. GitHub / main

```
main local  = e87c3d0223c3c49e25360dca4443e570be066df0
origin/main = e87c3d0223c3c49e25360dca4443e570be066df0
```

Coinciden. `main` en GitHub está sincronizado con el local. Este commit
ya incluye el fix de conocimiento desactualizado y de búsqueda (verificado
de forma independiente en un checkout aislado, no en working tree):
`build 23/23, typecheck 35/35, lint 35/35, test 46/46 (sdk 43, web 172,
cli 72, memory 128, runtime 48+5 todo)`.

## 2. TODAVÍA PENDIENTE — el repo local NO está limpio ahora mismo

Ahora mismo, en tu Mac, el checkout está parado en la rama
`wip/knowledge-library-and-chat-reasoning`, con un commit **staged pero
sin confirmar** (el WIP de carpetas/biblioteca + chat-reasoning, 1736
líneas / 16 archivos). No corriste todavía los comandos que te pasé.

Antes de tocar Excel, corre esto en tu terminal (ya te lo había dado,
lo repito porque sigue pendiente):

```bash
cd /Users/luispalacios/ATLAS

rm -f .git/index.lock
rm -f test-delete-me.txt

git status
# debe mostrar la rama wip/knowledge-library-and-chat-reasoning
# con ~28 archivos en stage

git commit -m "wip: knowledge library/folders UI + chat reasoning/metrics display

Uncommitted work in progress found on main, split into its own branch
so future feature work can start from a clean main. Not reviewed or
verified - pick up later as its own feature."

git checkout main
git status
# debe decir "nothing to commit, working tree clean"
# (design/ puede seguir apareciendo suelto - son solo assets, no afecta nada)
```

## 2.1 Nota sobre el WIP

El WIP en `wip/knowledge-library-and-chat-reasoning` incluye cambios en
**`packages/cli`** (reasoning/metrics: `chat-turn.ts`,
`map-reasoning-steps.ts`). Ese paquete no está formalmente en la lista
Frozen (core/compiler/runtime/workflow/intelligence) pero se trata con
cuidado igual. Estos cambios de `packages/cli` NO forman parte de
`main` — solo existen en esa rama WIP, sin commitear todavía cuando se
escribió este documento. `main` sigue limpio en `packages/cli` también.
Retomar ese WIP implica revisión aparte, no forma parte de Excel.

## 3. Ramas que deben existir después de eso

```
main                                          -> e87c3d0 (limpio)
wip/knowledge-library-and-chat-reasoning      -> tiene el WIP guardado, en pausa
```

`fix/knowledge-stale-search-and-filter` ya no debería existir — se borró
después de mergear a main.

## 4. Qué falta después de eso

Nada más de limpieza. Con `main` limpio en `e87c3d0`, se abre la rama
para el feature de Excel directamente desde ahí (ver el otro archivo,
`SUPERPROMPT_EXCEL_KNOWLEDGE.md`).

## 5. Regla para todos (ChatGPT, Cursor, yo)

Cualquier plan, prompt o sugerencia debe partir de `main @ e87c3d0` y de
los números de este documento — no de checkpoints anteriores (3I,
143/143 tests, etc.) que ya quedaron atrás. Si alguno de los tres
propone algo basado en un estado distinto, hay que corregirlo antes de
ejecutar nada.
