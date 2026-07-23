import { compileWorkflowDefinition, validateWorkflowDefinition } from '@atlas/workflow';

import type {
  PlanningContext,
  PlanningGoal,
  PlanningResult,
  PlanningStrategy,
  PlanningValidationIssue,
  PlanningValidationResult,
} from './planning-model.js';
import {
  PLANNING_GOAL_EMPTY_OBJECTIVE,
  PLANNING_STRATEGY_INVALID,
  PLANNING_STRATEGY_NOT_FOUND,
  PLANNING_WORKFLOW_COMPILER_INCOMPATIBLE,
  PLANNING_WORKFLOW_INVALID,
  createPlanningIssue,
} from './planning-errors.js';

export interface PlanningValidator {
  validateGoal(goal: PlanningGoal): PlanningValidationResult;

  validateStrategy(strategy: PlanningStrategy | null, strategyId: string): PlanningValidationResult;

  validatePlanningResult(result: PlanningResult): PlanningValidationResult;
}

function mergeIssues(...groups: readonly PlanningValidationIssue[][]): PlanningValidationIssue[] {
  return groups.flat();
}

export function createPlanningValidator(): PlanningValidator {
  return {
    validateGoal(goal) {
      const issues: PlanningValidationIssue[] = [];

      if (!goal.goal_id.trim()) {
        issues.push(createPlanningIssue(PLANNING_GOAL_EMPTY_OBJECTIVE, 'Planning goal id is required', 'goal_id'));
      }

      if (!goal.objective.trim()) {
        issues.push(
          createPlanningIssue(PLANNING_GOAL_EMPTY_OBJECTIVE, 'Planning goal objective is required', 'objective'),
        );
      }

      return Object.freeze({
        valid: issues.length === 0,
        issues: Object.freeze(issues),
      });
    },

    validateStrategy(strategy, strategyId) {
      if (!strategy) {
        return Object.freeze({
          valid: false,
          issues: Object.freeze([
            createPlanningIssue(
              PLANNING_STRATEGY_NOT_FOUND,
              `Planning strategy not found: ${strategyId}`,
              'strategy_id',
            ),
          ]),
        });
      }

      if (!strategy.strategy_id.trim() || !strategy.strategy_type) {
        return Object.freeze({
          valid: false,
          issues: Object.freeze([
            createPlanningIssue(PLANNING_STRATEGY_INVALID, 'Planning strategy definition is invalid', 'strategy'),
          ]),
        });
      }

      return Object.freeze({ valid: true, issues: Object.freeze([]) });
    },

    validatePlanningResult(result) {
      const issues: PlanningValidationIssue[] = [];

      if (!result.workflow) {
        issues.push(createPlanningIssue(PLANNING_WORKFLOW_INVALID, 'Planning result does not contain a workflow'));
        return Object.freeze({ valid: false, issues: Object.freeze(issues) });
      }

      const workflowValidation = validateWorkflowDefinition(result.workflow);
      if (!workflowValidation.valid) {
        for (const issue of workflowValidation.issues) {
          issues.push(
            createPlanningIssue(
              PLANNING_WORKFLOW_INVALID,
              issue.message,
              issue.path ?? issue.code,
            ),
          );
        }
      }

      const workflowCompilation = compileWorkflowDefinition(result.workflow);
      if (!workflowCompilation.success) {
        for (const issue of workflowCompilation.errors) {
          issues.push(
            createPlanningIssue(
              PLANNING_WORKFLOW_COMPILER_INCOMPATIBLE,
              issue.message,
              issue.path ?? issue.code,
            ),
          );
        }
      }

      return Object.freeze({
        valid: issues.length === 0,
        issues: Object.freeze(issues),
      });
    },
  };
}

export function validatePlanningGoal(goal: PlanningGoal): PlanningValidationResult {
  return createPlanningValidator().validateGoal(goal);
}

export function validatePlanningContext(context: PlanningContext): PlanningValidationResult {
  const issues: PlanningValidationIssue[] = [];

  if (!context.context_id.trim()) {
    issues.push(createPlanningIssue('PLANNING_CONTEXT_INVALID', 'Planning context id is required', 'context_id'));
  }

  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

export { mergeIssues };
