import type { PlanningCompilationResult, PlanningResult } from './planning-model.js';
import { createPlanningValidator } from './planning-validator.js';

export interface PlanningCompiler {
  compile(result: PlanningResult): PlanningCompilationResult;
}

export function createPlanningCompiler(
  validator = createPlanningValidator(),
): PlanningCompiler {
  return {
    compile(result) {
      const validation = validator.validatePlanningResult(result);
      const compatible = validation.valid && result.workflow !== null;

      return Object.freeze({
        success: compatible,
        workflow: result.workflow,
        workflow_compatible: compatible,
        errors: validation.issues,
      });
    },
  };
}

export function compilePlanningResult(result: PlanningResult): PlanningCompilationResult {
  return createPlanningCompiler().compile(result);
}
