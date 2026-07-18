import type { EventBus } from '@atlas/events';
import { CompilerCompletedEvent, createEventPublisher } from '@atlas/events';

import type { CompilationContext } from '../contracts/compilation-context.js';
import type { CompilationResult } from '../contracts/compilation-result.js';
import type { Compiler } from '../contracts/compiler.js';
import type { CompilerPipeline } from '../contracts/compiler-pipeline.js';
import { hasBlockingDiagnostics } from '../internal/diagnostics.js';

export interface AtlasCompilerOptions {
  readonly eventBus?: EventBus;
}

export class AtlasCompiler implements Compiler {
  readonly module = '@atlas/compiler' as const;
  readonly pipeline: CompilerPipeline;
  readonly #eventBus?: EventBus;

  constructor(pipeline: CompilerPipeline, options: AtlasCompilerOptions = {}) {
    this.pipeline = pipeline;
    this.#eventBus = options.eventBus;
  }

  async compile(context: CompilationContext): Promise<CompilationResult> {
    const finalContext = this.pipeline.run(context);

    const result = Object.freeze({
      context: finalContext,
      success:
        finalContext.lifecycle === 'complete' && !hasBlockingDiagnostics(finalContext.diagnostics),
    });

    if (this.#eventBus) {
      const publisher = createEventPublisher(this.#eventBus, '@atlas/compiler');
      publisher.publish(CompilerCompletedEvent, {
        success: result.success,
        lifecycle: finalContext.lifecycle,
        artifact_count: finalContext.artifacts.length,
        unit_count: finalContext.units.length,
        graph_id: finalContext.mir?.id.toJSON() ?? null,
      });
    }

    return result;
  }
}

export function createAtlasCompiler(
  pipeline: CompilerPipeline,
  options: AtlasCompilerOptions = {},
): AtlasCompiler {
  return new AtlasCompiler(pipeline, options);
}
