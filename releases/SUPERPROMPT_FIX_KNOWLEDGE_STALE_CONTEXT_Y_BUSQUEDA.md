# Super-prompt para Cursor — Fix de 2 bugs reales encontrados durante piloto (Conocimiento)

Pega esto tal cual en Cursor.

---

## Contexto y gobernanza

Estamos en congelamiento de código para el piloto (ver `PILOT_LOG.md`), pero ese congelamiento permite explícitamente corregir bugs reales encontrados durante el uso. Los dos bugs de este prompt fueron encontrados y verificados en vivo, contra el servidor real corriendo en `127.0.0.1:4173`, no son hipótesis de código.

**Regla del proyecto: no autorreportes.** Cuando termines, no digas simplemente "ya lo arreglé y probé". Necesito evidencia verificable: diffs reales, resultados de build/test en una copia limpia, y — lo más importante — transcripts reales de los dos escenarios de reproducción de abajo, ejecutados contra un servidor real levantado por ti, no descripciones de lo que "debería" pasar.

No toques ningún paquete Kernel (`@atlas/core`, `@atlas/compiler`, `@atlas/runtime`, `@atlas/workflow`, `@atlas/intelligence`) — si durante la investigación concluyes que el fix requiere tocar alguno de esos paquetes, **detente y repórtalo** en vez de hacerlo; necesitaríamos un ADR primero. Cambios esperados en `apps/web` y/o `packages/sdk` (este último se trata con cuidado pero no es Kernel formal — ya hay precedente de tocarlo para el fix de L-02 y el de fuga de IDs internos, ambos en `packages/sdk/src/modules/llm-module.ts`).

---

## BUG #1 (crítico) — ATLAS no vuelve a consultar Conocimiento ante una pregunta repetida en el mismo hilo, aunque el conocimiento haya cambiado

### Evidencia de reproducción

1. Se subió un documento (`Politica_Comercial_Banco_Amazonas.md`) que faltaba en la Biblioteca de Conocimiento de una marca de prueba.
2. Antes de subirlo, se preguntó en el chat: *"¿Puedo ofrecerle un 15% de descuento a Farmacias del Oriente sin que nadie lo apruebe?"* → ATLAS respondió correctamente que no tenía esa política registrada (correcto, porque el documento no existía aún).
3. Se subió el documento faltante (confirmado en la Biblioteca: `Politica_Comercial_Banco_Amazonas.md · MD · 1 fragmento`).
4. Se reinició el servidor completo.
5. Se volvió a hacer **la misma pregunta, en el mismo hilo de conversación** (el historial de conversación persiste en base de datos, sobrevive al reinicio del servidor — esto es clave).
6. ATLAS repitió **exactamente la misma respuesta incorrecta** de antes: dijo que no existía política de descuentos, y citó "Comité de Crédito" en vez de la aprobación correcta.
7. Para descartar un problema de indexación/búsqueda, se probó reformular la pregunta en el mismo hilo, pidiendo explícitamente: *"Basa tu respuesta únicamente en los documentos de Conocimiento, incluyendo Politica_Comercial_Banco_Amazonas."* → Esta vez ATLAS respondió **correctamente**, citando la sección real del documento: *"Los ejecutivos comerciales pueden aplicar directamente, sin aprobación adicional, descuentos de hasta el 10%... Un descuento del 15% supera ese límite, por lo que requiere aprobación escrita del Gerente Comercial."*

### Causa raíz

El documento sí estaba bien indexado y la búsqueda/recuperación funciona correctamente cuando se ejecuta. El problema es que, ante una pregunta que el modelo "reconoce" como ya respondida en el historial del mismo hilo, no vuelve a ejecutar una búsqueda fresca en Conocimiento — reutiliza su razonamiento/respuesta anterior en vez de re-verificar contra el estado actual del conocimiento. Esto es distinto del bug L-02 (que era sobre ignorar resultados de herramientas dentro del mismo turno); este es sobre no re-invocar la herramienta entre turnos cuando la pregunta se repite.

### Fix requerido

Investiga primero cómo se decide, en `packages/sdk/src/modules/llm-module.ts` (y el orquestador de `plan_and_execute` si aplica), si el modelo ejecuta una búsqueda de conocimiento (`memory_search` o equivalente) en cada turno. Con eso confirmado, evalúa dos niveles de fix y aplica el que sea viable sin tocar Kernel:

- **Opción A (preferida si es viable):** cambio estructural — cuando una pregunta del usuario se relacione con políticas/reglas/conocimiento de la marca (heurística: coincide con temas ya cubiertos por Conocimiento, o el usuario menciona que subió/actualizó algo), forzar una llamada fresca a la búsqueda de conocimiento en ese turno, en vez de dejarlo a discreción del modelo.
- **Opción B (mitigación mínima, ya con precedente en este proyecto):** extender `SYSTEM_PROMPT` en `llm-module.ts` con una instrucción explícita, en la línea de lo ya hecho para L-02 y para el fix de fuga de IDs internos. Algo como: *"Si el usuario repite o reformula una pregunta que ya respondiste antes en esta conversación, o menciona que agregó/actualizó información, vuelve a consultar el Conocimiento con una búsqueda fresca antes de responder — no asumas que tu respuesta anterior sigue siendo válida."*

Si aplicas solo la Opción B, sé honesto en tu reporte: es una mitigación basada en instrucción de prompt, no una garantía estructural, y su efectividad debe demostrarse empíricamente (ver criterio de aceptación abajo), no asumirse.

### Criterio de aceptación (prueba obligatoria, en servidor real)

Reproduce el escenario completo desde cero contra un servidor real que tú levantes:
1. Pregunta algo sobre una política que **no** esté en Conocimiento → confirma que dice que no la tiene.
2. Sube (o simula subir vía API) el documento con esa política.
3. **En el mismo hilo de conversación**, sin pistas adicionales, repite exactamente la misma pregunta.
4. ATLAS debe responder correctamente citando el documento nuevo, **sin que se le indique explícitamente "revisa Conocimiento"**.

Repite este test con al menos 2 formulaciones distintas de "misma pregunta" (idéntica, y ligeramente reformulada) para tener confianza razonable. Pega el transcript real de las 3 respuestas en tu reporte final.

---

## BUG #2 (secundario) — La búsqueda en la página "Conocimiento" no filtra nada

### Evidencia de reproducción

En la página `/conocimiento`, en el cuadro "Buscar en el conocimiento", se probó la query `descuento` en una marca con exactamente 5 documentos. Resultado: "5 resultados encontrados" — es decir, devolvió **los 5 documentos**, incluyendo uno (`Contexto_Banco_Amazonas.md`) cuyo contenido completo fue verificado y **no contiene la palabra "descuento" en ninguna parte**. Esto indica que el filtro de esa búsqueda no está aplicando ningún criterio real de coincidencia — devuelve el conocimiento completo sin importar la query.

### Investigación requerida

Localiza el endpoint/handler que atiende esa búsqueda desde la página Conocimiento en `apps/web` (probablemente en `apps/web/src/server.ts` o un módulo de rutas relacionado) y determina si:
- Está llamando a `matchesContentQuery` (en `packages/sdk/src/modules/memory-module.ts`) y el bug está en cómo se le pasa la query, o
- No está aplicando ningún filtro y simplemente lista todos los registros de la marca activa.

Nota: `matchesContentQuery` en sí fue corregido y verificado como parte del fix de búsqueda tokenizada (commit `561316d`) y funciona bien para la recuperación que usa el chat (confirmado indirectamente por el Bug #1: cuando se fuerza la búsqueda, sí encuentra el fragmento correcto). El bug #2 parece estar específicamente en el endpoint de la página Conocimiento, no en la función de matching en sí — pero confírmalo con evidencia antes de asumir.

### Fix requerido

Corrige el endpoint para que use el mismo mecanismo de matching ya verificado (`matchesContentQuery` u otro coherente) y realmente filtre por la query ingresada.

### Criterio de aceptación (prueba obligatoria, en servidor real)

En la misma marca de 5 documentos, busca `descuento` en la página Conocimiento → debe devolver solo el/los documento(s) que realmente contienen ese término (esperado: 1, `Politica_Comercial_Banco_Amazonas.md`). Prueba también con un término que no exista en ningún documento → debe devolver 0 resultados, no 5. Pega captura o transcript real.

---

## Verificación obligatoria antes de reportar terminado

1. Build + typecheck + lint + test completos en una copia limpia (`pnpm install --frozen-lockfile` desde cero en un directorio nuevo, no el `node_modules` existente).
2. Levantar el servidor real (`pnpm atlas web` o equivalente) y ejecutar en vivo los dos criterios de aceptación de arriba.
3. Commit en una rama nueva (no directo a `main`), con mensaje descriptivo. No hagas push ni merges tú — repórtame el hash y el diff para que yo verifique de forma independiente antes de integrarlo, siguiendo el mismo proceso que hemos usado en todo este proyecto.

## Formato de reporte esperado

- Diff resumido de los cambios (archivos y qué cambió en cada uno).
- Resultado de build/typecheck/lint/test (números reales, no "todo pasó").
- Transcript literal de las pruebas en vivo de ambos bugs (las preguntas exactas y las respuestas exactas de ATLAS).
- Si solo pudiste aplicar la Opción B del Bug #1 (mitigación de prompt) en vez de la Opción A (fix estructural), dilo explícitamente y por qué.
