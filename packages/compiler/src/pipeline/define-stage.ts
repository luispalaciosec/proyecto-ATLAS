import type { CompilationContext } from '../contracts/compilation-context.js';
import type { CompilerStage } from '../contracts/compiler-stage.js';
import type { CompilerStageId } from '../contracts/compiler-stage-id.js';
import type { Diagnostic } from '../contracts/diagnostic.js';
import { appendDiagnostics, updateCompilationContext } from '../context/compilation-context.js';

export interface DefineStageParams {
  readonly id: CompilerStageId;
  readonly name: string;
  readonly lifecycle: CompilationContext['lifecycle'];
  readonly validatePreconditions?: (context: CompilationContext) => readonly Diagnostic[];
  readonly transform: (context: CompilationContext) => CompilationContext;
}

export function defineCompilerStage(params: DefineStageParams): CompilerStage {
  return Object.freeze({
    id: params.id,
    name: params.name,
    validatePreconditions(context: CompilationContext): readonly Diagnostic[] {
      return Object.freeze([...(params.validatePreconditions?.(context) ?? [])]);
    },
    execute(context: CompilationContext): CompilationContext {
      const preconditionDiagnostics = params.validatePreconditions?.(context) ?? [];

      const withDiagnostics =
        preconditionDiagnostics.length > 0
          ? appendDiagnostics(context, preconditionDiagnostics)
          : context;

      const transformed = params.transform(withDiagnostics);

      return updateCompilationContext(transformed, {
        lifecycle: params.lifecycle,
        current_stage: params.id,
      });
    },
  });
}
