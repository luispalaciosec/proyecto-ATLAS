import type { CompilationContext } from './compilation-context.js';

/**
 * @see ATLAS-ARCH-006 §9 Compiler Execution
 */
export interface CompilationResult {
  readonly context: CompilationContext;
  readonly success: boolean;
}
