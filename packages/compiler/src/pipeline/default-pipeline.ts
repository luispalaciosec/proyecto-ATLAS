import type { CompilationContext } from '../contracts/compilation-context.js';
import type { CompilerPipeline } from '../contracts/compiler-pipeline.js';
import type { CompilerStage } from '../contracts/compiler-stage.js';
import { hasBlockingDiagnostics } from '../internal/diagnostics.js';
import { updateCompilationContext } from '../context/compilation-context.js';

export interface DefaultCompilerPipelineOptions {
  readonly stages: readonly CompilerStage[];
  readonly stopOnError?: boolean;
}

export class DefaultCompilerPipeline implements CompilerPipeline {
  readonly stages: readonly CompilerStage[];
  readonly #stopOnError: boolean;

  constructor(options: DefaultCompilerPipelineOptions) {
    this.stages = Object.freeze([...options.stages]);
    this.#stopOnError = options.stopOnError ?? true;
  }

  run(initialContext: CompilationContext): CompilationContext {
    let context = updateCompilationContext(initialContext, { lifecycle: 'initialize' });

    for (const stage of this.stages) {
      context = stage.execute(context);

      if (this.#stopOnError && hasBlockingDiagnostics(context.diagnostics)) {
        return updateCompilationContext(context, { lifecycle: 'cancelled' });
      }
    }

    return updateCompilationContext(context, { lifecycle: 'complete', current_stage: null });
  }
}

export function createDefaultCompilerPipeline(
  options: DefaultCompilerPipelineOptions,
): DefaultCompilerPipeline {
  return new DefaultCompilerPipeline(options);
}
