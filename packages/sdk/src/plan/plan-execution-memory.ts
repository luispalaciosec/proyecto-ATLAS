import type { CompilationResult } from '@atlas/compiler';
import type { PlanRequest, PlanningResult } from '@atlas/intelligence';
import type { ExecutionResult } from '@atlas/runtime';
import type { RetrievalResult } from '@atlas/retrieval';

import type { Atlas } from '../atlas/atlas.js';
import type { StoreMemoryContentResult } from '../modules/memory-module.js';

export interface PlanExecuteAndRememberResult {
  readonly retrieval: RetrievalResult;
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

function buildPlanningContextFromRetrieval(
  goalText: string,
  retrieval: RetrievalResult,
): NonNullable<PlanRequest['context']> {
  const normalized = goalText.trim().toLowerCase().replace(/\s+/g, '.').slice(0, 48);

  return Object.freeze({
    context_id: normalized.length > 0 ? `context.retrieval.${normalized}` : 'context.retrieval',
    variables: Object.freeze({
      retrieval: Object.freeze({
        query: retrieval.context.query,
        items: retrieval.context.items,
        prior_goals: Object.freeze(retrieval.context.items.map((item) => item.text)),
      }),
    }),
    metadata: Object.freeze({
      custom: Object.freeze({
        retrieval_total_candidates: retrieval.context.totalCandidates,
        retrieval_selected: retrieval.context.items.length,
      }),
    }),
  });
}

/**
 * Orchestrates retrieval, planning, execution, and memory persistence.
 */
export async function planExecuteAndRemember(
  atlas: Atlas,
  goalText: string,
): Promise<PlanExecuteAndRememberResult> {
  const retrieval = await atlas.retrieval.retrieveForGoal(goalText);

  const planning = atlas.planning.planFromGoal(goalText, {
    context: buildPlanningContextFromRetrieval(goalText, retrieval),
  });
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

  return Object.freeze({ retrieval, planning, compile, execute, memory });
}
