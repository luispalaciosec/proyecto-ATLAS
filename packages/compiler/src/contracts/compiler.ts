import type { CompilationContext } from './compilation-context.js';
import type { CompilationResult } from './compilation-result.js';
import type { CompilerPipeline } from './compiler-pipeline.js';

/**
 * @see ATLAS-ARCH-003 §12 Compiler Contracts — Compiler
 */
export interface Compiler {
  readonly module: '@atlas/compiler';
  readonly pipeline: CompilerPipeline;
  compile(context: CompilationContext): Promise<CompilationResult>;
}
