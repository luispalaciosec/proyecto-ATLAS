import type {
  CompilationResult,
  Compiler,
  CreateCompilationContextParams,
  CreateCompilationUnitParams,
} from '@atlas/compiler';
import {
  createAtlasCompiler,
  createCompilationContext,
  createCompilationUnit,
  createDefaultCompilerPipeline,
  createDefaultCompilerStages,
} from '@atlas/compiler';
import { Metadata } from '@atlas/core';
import type { EventBus } from '@atlas/events';

import type { AtlasCompilerOptions, AtlasWorkspaceOptions } from '../atlas/options.js';

export interface CompileOptions {
  readonly units?: readonly CreateCompilationUnitParams[];
  readonly workspace?: AtlasWorkspaceOptions;
  readonly metadata?: Record<string, unknown>;
  readonly packages?: readonly string[];
}

/**
 * Public compiler facade — SDK-202 §15.
 * Composes the default pipeline and delegates to @atlas/compiler.
 */
export class CompilerModule {
  readonly #compiler: Compiler;
  readonly #defaultWorkspace: AtlasWorkspaceOptions;

  constructor(
    bus: EventBus,
    compilerOptions: AtlasCompilerOptions = {},
    workspace: AtlasWorkspaceOptions = {},
  ) {
    this.#defaultWorkspace = workspace;

    const stages =
      compilerOptions.stages ??
      createDefaultCompilerStages({
        generators: compilerOptions.generators,
        publishers: compilerOptions.publishers,
      });

    const pipeline =
      compilerOptions.pipeline ??
      createDefaultCompilerPipeline({
        stages,
      });

    this.#compiler = createAtlasCompiler(pipeline, { eventBus: bus });
  }

  compile(options: CompileOptions = {}): Promise<CompilationResult> {
    const contextParams: CreateCompilationContextParams = {
      workspace: options.workspace ?? this.#defaultWorkspace,
      units: (options.units ?? []).map((unit) => createCompilationUnit(unit)),
      metadata: options.metadata ? Metadata.create(options.metadata) : undefined,
      packages: options.packages,
    };

    return this.#compiler.compile(createCompilationContext(contextParams));
  }
}
