import type {
  PlanRequest,
  PlanningContext,
  PlanningGoal,
  PlanningMetadata,
  PlanningResult,
} from './planning-model.js';
import { createGoalNormalizer } from './goal-normalizer.js';
import {
  PLANNING_GOAL_EMPTY_OBJECTIVE,
  PLANNING_STRATEGY_NOT_FOUND,
  createPlanningIssue,
} from './planning-errors.js';
import { createDefaultPlanningStrategies } from './planning-strategies.js';
import { createPlanningRegistry, type PlanningRegistry } from './planning-registry.js';
import { createPlanningValidator } from './planning-validator.js';

export interface PlanningEngine {
  plan(request: PlanRequest): PlanningResult;
}

export interface CreatePlanningEngineOptions {
  readonly registry?: PlanningRegistry;
}

function resolveStrategyId(goal: PlanningGoal, context: PlanningContext, explicit?: string): string {
  if (explicit) {
    return explicit;
  }

  const fromGoal = goal.variables?.strategy;
  if (typeof fromGoal === 'string' && fromGoal.trim().length > 0) {
    return fromGoal.startsWith('strategy.') ? fromGoal : `strategy.${fromGoal}`;
  }

  const fromContext = context.variables?.strategy;
  if (typeof fromContext === 'string' && fromContext.trim().length > 0) {
    return fromContext.startsWith('strategy.') ? fromContext : `strategy.${fromContext}`;
  }

  for (const rule of context.rules ?? []) {
    if (rule.action === 'select_strategy' && typeof rule.parameters?.strategy_id === 'string') {
      return String(rule.parameters.strategy_id);
    }
  }

  return 'strategy.sequential';
}

function buildMetadata(goal: PlanningGoal, strategyId: string): PlanningMetadata {
  return Object.freeze({
    ...(goal.metadata ?? {}),
    custom: Object.freeze({
      ...(goal.metadata?.custom ?? {}),
      strategy_id: strategyId,
      planned_at: new Date(0).toISOString(),
    }),
  });
}

export function createPlanningEngine(options: CreatePlanningEngineOptions = {}): PlanningEngine {
  const registry = options.registry ?? createPlanningRegistry(createDefaultPlanningStrategies());
  const normalizer = createGoalNormalizer();
  const validator = createPlanningValidator();

  return {
    plan(request) {
      let goal: PlanningGoal;

      try {
        goal = normalizer.normalize(request.goal);
      } catch (error) {
        return Object.freeze({
          success: false,
          goal: Object.freeze({
            goal_id: 'goal.invalid',
            objective: '',
          }),
          strategy_id: request.strategy_id ?? 'strategy.sequential',
          workflow: null,
          metadata: Object.freeze({}),
          errors: Object.freeze([
            createPlanningIssue(
              PLANNING_GOAL_EMPTY_OBJECTIVE,
              error instanceof Error ? error.message : String(error),
            ),
          ]),
        });
      }

      const context: PlanningContext = Object.freeze({
        context_id: request.context?.context_id ?? `context.${goal.goal_id}`,
        ...(request.context?.domain ? { domain: request.context.domain } : {}),
        ...(request.context?.variables ? { variables: request.context.variables } : {}),
        ...(request.context?.metadata ? { metadata: request.context.metadata } : {}),
        rules: Object.freeze([...(registry.listRules()), ...(request.context?.rules ?? [])]),
      });

      const goalValidation = validator.validateGoal(goal);
      if (!goalValidation.valid) {
        return Object.freeze({
          success: false,
          goal,
          strategy_id: request.strategy_id ?? 'strategy.sequential',
          workflow: null,
          metadata: buildMetadata(goal, request.strategy_id ?? 'strategy.sequential'),
          errors: goalValidation.issues,
        });
      }

      const strategyId = resolveStrategyId(goal, context, request.strategy_id);
      const strategy = registry.getStrategy(strategyId);
      const strategyValidation = validator.validateStrategy(strategy, strategyId);

      if (!strategyValidation.valid || !strategy) {
        return Object.freeze({
          success: false,
          goal,
          strategy_id: strategyId,
          workflow: null,
          metadata: buildMetadata(goal, strategyId),
          errors: strategyValidation.issues.length
            ? strategyValidation.issues
            : Object.freeze([
                createPlanningIssue(PLANNING_STRATEGY_NOT_FOUND, `Planning strategy not found: ${strategyId}`),
              ]),
        });
      }

      const workflow = strategy.plan(goal, context, context.rules ?? []);
      const preliminary: PlanningResult = Object.freeze({
        success: true,
        goal,
        strategy_id: strategyId,
        workflow,
        metadata: buildMetadata(goal, strategyId),
        errors: Object.freeze([]),
      });

      const resultValidation = validator.validatePlanningResult(preliminary);
      if (!resultValidation.valid) {
        return Object.freeze({
          success: false,
          goal,
          strategy_id: strategyId,
          workflow,
          metadata: buildMetadata(goal, strategyId),
          errors: resultValidation.issues,
        });
      }

      return Object.freeze({
        success: true,
        goal,
        strategy_id: strategyId,
        workflow,
        metadata: buildMetadata(goal, strategyId),
        errors: Object.freeze([]),
      });
    },
  };
}
