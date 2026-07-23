import type { PlanningValidationIssue } from './planning-model.js';

export function createPlanningIssue(
  code: string,
  message: string,
  path?: string,
): PlanningValidationIssue {
  return Object.freeze({
    code,
    message,
    ...(path === undefined ? {} : { path }),
  });
}

export const PLANNING_GOAL_INVALID = 'PLANNING_GOAL_INVALID';
export const PLANNING_GOAL_EMPTY_OBJECTIVE = 'PLANNING_GOAL_EMPTY_OBJECTIVE';
export const PLANNING_STRATEGY_NOT_FOUND = 'PLANNING_STRATEGY_NOT_FOUND';
export const PLANNING_STRATEGY_INVALID = 'PLANNING_STRATEGY_INVALID';
export const PLANNING_WORKFLOW_INVALID = 'PLANNING_WORKFLOW_INVALID';
export const PLANNING_WORKFLOW_COMPILER_INCOMPATIBLE = 'PLANNING_WORKFLOW_COMPILER_INCOMPATIBLE';
export const PLANNING_RULE_INVALID = 'PLANNING_RULE_INVALID';
