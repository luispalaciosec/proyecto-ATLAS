# Super-prompt para Cursor — Confirmar el commit del WIP y dejar main limpio

Pega esto tal cual en Cursor.

---

Estoy parado en la rama `wip/knowledge-library-and-chat-reasoning`, con
el WIP de carpetas/biblioteca de documentos + chat-reasoning/metrics ya
en stage (`git status` debe mostrarlo). Necesito que hagas esto, en
este orden exacto:

1. Verifica que sigues en `wip/knowledge-library-and-chat-reasoning` y
   que `git status` muestra los archivos en stage (no los agregues de
   nuevo, ya deberían estar ahí).

2. Si existe un `.git/index.lock` huérfano, bórralo antes de intentar
   el commit.

3. Borra también el archivo suelto `test-delete-me.txt` en la raíz del
   repo si existe (es basura de una verificación anterior, no forma
   parte de nada).

4. Haz el commit exactamente con este mensaje:
   ```
   wip: knowledge library/folders UI + chat reasoning/metrics display

   Uncommitted work in progress found on main, split into its own branch
   so future feature work can start from a clean main. Not reviewed or
   verified - pick up later as its own feature.
   ```

5. Cambia a `main`.

6. Confirma que `main` quedó limpio (`git status` debe decir "nothing
   to commit, working tree clean" — `design/` y los `releases/*.md`
   sueltos pueden seguir apareciendo como untracked, no los toques, no
   bloquean nada).

7. NO hagas push de nada todavía. NO borres la rama `wip/...`. NO crees
   la rama de Excel — eso lo hago yo en el siguiente paso.

## Reporte esperado

Pega el output real y completo de:
```bash
git log --oneline -3
git status
git branch -v
```

No resumas ni digas "listo, quedó limpio" sin pegar el output real de
esos tres comandos — necesito verificarlo yo mismo antes de continuar.
