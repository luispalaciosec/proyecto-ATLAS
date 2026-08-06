# P2.5 — Corrección: orden inestable en `loadRecentFeedbackContext` (test flaky)

**Tipo:** Fix puntual, no un nuevo sprint. No es un bug del fix de dependencia circular — es preexistente de P2.4, expuesto ahora porque `pnpm run test` en la raíz sí se corrió completo por primera vez.

## Problema (verificado, reproducible)

`packages/cli/tests/feedback-context.test.ts` → `loadRecentFeedbackContext > returns recent feedback records newest first` falla de forma intermitente:

```
AssertionError: expected 156 to be less than 90
 ❯ tests/feedback-context.test.ts:37:50
```

Corrido 15 veces seguidas en aislamiento (`vitest run tests/feedback-context.test.ts`), falla en aproximadamente la mitad. No es un problema del entorno de verificación — es una condición de carrera real en el código.

## Causa raíz

`packages/sdk/src/modules/memory-module.ts` línea 133, en `storeContent()`:

```ts
timestamp: new Date().toISOString(),
```

Resolución de milisegundo. El test hace dos llamadas seguidas a `recordFeedback()` sin ningún delay. Contra el motor JSON-file, cada round-trip puede completarse en menos de 1ms, así que ambos registros a veces caen exactamente en el mismo milisegundo.

`packages/cli/src/workspace/feedback-context.ts`, en `loadRecentFeedbackContext()`:

```ts
const recent = [...result.records]
  .sort((left, right) => right.timestamp.localeCompare(left.timestamp))
  .slice(0, limit);
```

Cuando dos timestamps son idénticos, el comparador devuelve 0. El sort de JS es estable, así que conserva el orden original de inserción — dejando "first correction" antes que "second correction" en el arreglo ordenado, cuando el test (correctamente) espera "más reciente primero".

## Fix requerido

No depender solo del timestamp de reloj para desempatar. `result.records` del motor JSON-file viene en orden de inserción (confirmar esto antes de aplicar el fix — si no es así, ajustar el enfoque). Usar ese orden como desempate:

En `packages/cli/src/workspace/feedback-context.ts`, reemplazar el sort por uno que use el índice original como criterio secundario cuando el timestamp empata:

```ts
const recent = result.records
  .map((record, index) => ({ record, index }))
  .sort((left, right) => {
    const byTimestamp = right.record.timestamp.localeCompare(left.record.timestamp);
    if (byTimestamp !== 0) {
      return byTimestamp;
    }
    // Timestamps iguales (colisión de resolución de milisegundo): el insertado
    // después se considera más reciente.
    return right.index - left.index;
  })
  .slice(0, limit)
  .map(({ record }) => record);
```

Si `result.records` no viene garantizado en orden de inserción (confirmarlo leyendo el motor de búsqueda), la alternativa correcta es agregar un campo de secuencia monotónico al guardar el registro en `storeContent()` (`memory-module.ts`) y ordenar por ese campo como desempate — no inventar orden a partir de suposiciones no verificadas sobre el store.

No tocar `storeContent()`/`new Date().toISOString()` a menos que sea estrictamente necesario — el timestamp en sí sigue siendo válido y útil, el problema es solo el desempate en este caso de uso específico.

## Verificación de cierre (obligatoria antes de reportar)

- Correr el test específico **al menos 30 veces seguidas** en aislamiento y confirmar 0 fallos: `for i in $(seq 1 30); do npx vitest run tests/feedback-context.test.ts || echo FAIL; done` (o equivalente) — no basta una sola corrida verde, dado que el bug es probabilístico.
- `pnpm run test` en la raíz del repo → exit 0.
- `pnpm --filter @atlas/cli test` → 69/69 (o el número vigente) sin fallos.
- Confirmar que ningún otro test que dependa de orden por timestamp puro tiene el mismo problema latente (grep rápido por `.timestamp.localeCompare(` en el repo).

## No negociables

- No modificar el contrato público de `loadRecentFeedbackContext()` (firma, límite, formato del string de salida).
- No modificar tests existentes salvo que el propio test tenga un bug (no es el caso aquí — el test está bien, el código de producción es el que falla).
- Reportar el resultado de las 30 corridas repetidas como evidencia de cierre, no solo una corrida.
