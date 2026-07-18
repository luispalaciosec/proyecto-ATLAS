# Compiler In-Memory Demo

Demostración funcional end-to-end del `@atlas/compiler` usando únicamente memoria.

## Qué demuestra

- Creación de una `CompilationUnit` programática
- Ejecución secuencial de las **8 etapas oficiales** del pipeline
- Impresión del `CompilationContext` **después de cada etapa**
- Generación de un `Artifact` mediante un `Generator` registrado en memoria
- Cero filesystem, YAML, Markdown o infraestructura externa

## Cómo ejecutar

Desde la raíz del monorepo:

```bash
pnpm install
pnpm --filter @atlas/example-compiler-in-memory demo
```

## Salida esperada

```
Atlas Compiler — Demostración in-memory
...
── Etapa: Discovery Stage (discovery) ──
...
── Etapa: Generation Stage (generation) ──
   artifacts:        1
...
Resultado final: SUCCESS
```

## Notas

Esta demo **no añade funcionalidad** al compilador. Solo consume la API pública existente.

Mejoras futuras registradas (no bloqueantes):

- **C3:** Campo explícito `kind` en `CompilationUnit` (hoy vía `metadata.kind`)
- **C8:** Contrato explícito `SourceDocument` para el payload de unidad
