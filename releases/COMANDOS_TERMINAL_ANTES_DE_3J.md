# Comandos para correr en tu terminal antes de arrancar Fase 3J

Ya dejé el branch `wip/knowledge-library-and-chat-reasoning` creado y todo el WIP suelto (carpetas/biblioteca + chat-reasoning/metrics, 16 archivos modificados + varios nuevos) en stage. No pude terminar el commit porque mi entorno no puede borrar archivos dentro de tu carpeta ATLAS (ni siquiera un lock interno de git) — eso solo lo puedes hacer tú, con acceso directo a tu Mac.

Copia y pega esto en tu terminal, en la carpeta del repo:

```bash
cd /Users/luispalacios/ATLAS

# 1. Limpiar el lock huérfano y el archivo de prueba que dejé
rm -f .git/index.lock
rm -f test-delete-me.txt

# 2. Confirmar que sigues en la rama WIP con todo en stage
git status

# 3. Completar el commit del WIP
git commit -m "wip: knowledge library/folders UI + chat reasoning/metrics display

Uncommitted work in progress found on main, split into its own branch
so Fase 3J (Excel + Motion) can start from a clean main. Not reviewed
or verified - pick up later as its own feature."

# 4. Volver a main y confirmar que quedó limpio
git checkout main
git status
# debe decir "nothing to commit, working tree clean"
# (design/ puede seguir apareciendo como untracked - son solo assets,
#  no afecta build ni tests, lo dejamos ahí sin tocar por ahora)

# 5. Crear la rama de la Fase 3J desde main limpio
git checkout -b feature/3j-excel-motion

# 6. Confirmar que el servidor real sigue arriba
curl -s http://127.0.0.1:4173/api/health
```

Si el paso 3 (`git commit`) te da el mismo error de lock, es que algo más (Cursor, un editor, otro proceso) sigue tocando el repo al mismo tiempo — cierra esos procesos primero y reintenta.

Cuando termines el paso 6, pega el prompt corregido de la Fase 3J (te lo dejo en el otro archivo) en Cursor, ya parado en la rama `feature/3j-excel-motion`.
