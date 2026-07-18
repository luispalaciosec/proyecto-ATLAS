import type { CompilationContext } from './compilation-context.js';
import type { CompilerStageId } from './compiler-stage-id.js';
import type { Diagnostic } from './diagnostic.js';

/**
 * @see ATLAS-ARCH-003 §13 Stage Model
 */
export interface CompilerStage {
  readonly id: CompilerStageId;
  readonly name: string;
  validatePreconditions(context: CompilationContext): readonly Diagnostic[];
  execute(context: CompilationContext): CompilationContext;
}
