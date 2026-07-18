import { Metadata } from '@atlas/core';

import type {
  CompilationContext,
  CompilationContextPatch,
} from '../contracts/compilation-context.js';

export interface CreateCompilationContextParams {
  readonly configuration?: Readonly<Record<string, unknown>>;
  readonly workspace?: Readonly<Record<string, unknown>>;
  readonly units?: CompilationContext['units'];
  readonly metadata?: Metadata;
  readonly plugins?: readonly string[];
  readonly packages?: readonly string[];
}

export function createCompilationContext(
  params: CreateCompilationContextParams = {},
): CompilationContext {
  return Object.freeze({
    lifecycle: 'initialize',
    configuration: Object.freeze({ ...(params.configuration ?? {}) }),
    workspace: Object.freeze({ ...(params.workspace ?? {}) }),
    units: Object.freeze([...(params.units ?? [])]),
    diagnostics: Object.freeze([]),
    hir: Object.freeze([]),
    mir: null,
    artifacts: Object.freeze([]),
    plugins: Object.freeze([...(params.plugins ?? [])]),
    packages: Object.freeze([...(params.packages ?? [])]),
    metadata: params.metadata ?? Metadata.empty(),
    current_stage: null,
  });
}

export function updateCompilationContext(
  context: CompilationContext,
  patch: CompilationContextPatch,
): CompilationContext {
  return Object.freeze({
    lifecycle: patch.lifecycle ?? context.lifecycle,
    configuration: Object.freeze({
      ...context.configuration,
      ...(patch.configuration ?? {}),
    }),
    workspace: Object.freeze({
      ...context.workspace,
      ...(patch.workspace ?? {}),
    }),
    units: Object.freeze([...(patch.units ?? context.units)]),
    diagnostics: Object.freeze([...(patch.diagnostics ?? context.diagnostics)]),
    hir: Object.freeze([...(patch.hir ?? context.hir)]),
    mir: patch.mir !== undefined ? patch.mir : context.mir,
    artifacts: Object.freeze([...(patch.artifacts ?? context.artifacts)]),
    plugins: Object.freeze([...(patch.plugins ?? context.plugins)]),
    packages: Object.freeze([...(patch.packages ?? context.packages)]),
    metadata: patch.metadata ?? context.metadata,
    current_stage: patch.current_stage !== undefined ? patch.current_stage : context.current_stage,
  });
}

export function appendDiagnostics(
  context: CompilationContext,
  diagnostics: readonly CompilationContext['diagnostics'][number][],
): CompilationContext {
  return updateCompilationContext(context, {
    diagnostics: [...context.diagnostics, ...diagnostics],
  });
}
