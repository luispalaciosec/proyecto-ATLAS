import type { CompilationResult } from '@atlas/compiler';
import type { PlanningResult } from '@atlas/intelligence';
import type { ExecutionResult } from '@atlas/runtime';

import type { Atlas } from '../atlas/atlas.js';
import type { StoreMemoryContentResult } from '../modules/memory-module.js';

export interface PlanExecuteAndRememberResult {
  readonly planning: PlanningResult;
  readonly compile: CompilationResult;
  readonly execute: ExecutionResult;
  readonly memory: StoreMemoryContentResult;
}

function assertPlanningSucceeded(planning: PlanningResult): asserts planning is PlanningResult & {
  workflow: NonNullable<PlanningResult['workflow']>;
} {
  if (!planning.success || !planning.workflow) {
    throw new Error('Planning failed');
  }
}

/**
 * Orchestrates goal planning, workflow compilation, kernel execution, and memory persistence.
 */
export async function planExecuteAndRemember(
  atlas: Atlas,
  goalText: string,
): Promise<PlanExecuteAndRememberResult> {
  const planning = atlas.planning.planFromGoal(goalText);
  assertPlanningSucceeded(planning);

  const workflowResult = atlas.workflow.compileDefinition(planning.workflow);

  if (!workflowResult.success || !workflowResult.pipeline) {
    throw new Error('Workflow compilation failed');
  }

  const units = atlas.workflow.projectForCompilation(workflowResult.pipeline, planning.workflow);
  const compile = await atlas.compiler.compile({ units: [...units] });

  if (!compile.success) {
    throw new Error('Compilation failed');
  }

  const execute = await atlas.runtime.execute({ artifacts: compile.context.artifacts });

  if (!execute.success) {
    throw new Error('Execution failed');
  }

  const memory = await atlas.memory.storePlanExecution({
    goal: goalText,
    goalId: planning.goal.goal_id,
    workflowId: planning.workflow.identity.workflow_id,
    strategyId: planning.strategy_id,
    sessionId: execute.context.session_id.toJSON(),
    outputCount: execute.context.outputs.length,
    artifactCount: compile.context.artifacts.length,
  });

  return Object.freeze({ planning, compile, execute, memory });
}
