import type { CompilationContext } from './compilation-context.js';
import type { CompilerStage } from './compiler-stage.js';

/**
 * @see ATLAS-ARCH-003 §12 Compiler Contracts — CompilerPipeline
 */
export interface CompilerPipeline {
  readonly stages: readonly CompilerStage[];
  run(context: CompilationContext): CompilationContext;
}
