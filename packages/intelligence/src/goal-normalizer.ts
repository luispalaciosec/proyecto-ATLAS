import { foldDiacritics } from '@atlas/core';

import type { PlanningGoal, PlanningMetadata } from './planning-model.js';
import { PLANNING_GOAL_EMPTY_OBJECTIVE, PLANNING_GOAL_INVALID, createPlanningIssue } from './planning-errors.js';

export interface GoalNormalizer {
  normalize(input: unknown): PlanningGoal;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readMetadata(value: unknown): PlanningMetadata | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return Object.freeze({
    ...(typeof value.name === 'string' ? { name: value.name } : {}),
    ...(typeof value.description === 'string' ? { description: value.description } : {}),
    ...(Array.isArray(value.tags)
      ? { tags: Object.freeze(value.tags.filter((tag): tag is string => typeof tag === 'string')) }
      : {}),
    ...(isRecord(value.custom) ? { custom: Object.freeze({ ...value.custom }) } : {}),
  });
}

function createGoalId(seed: string): string {
  const normalized = foldDiacritics(seed.trim().toLowerCase())
    .replace(/\s+/g, '.')
    .slice(0, 64);
  return normalized.length > 0 ? `goal.${normalized}` : 'goal.unnamed';
}

export function createGoalNormalizer(): GoalNormalizer {
  return {
    normalize(input) {
      if (typeof input === 'string') {
        const objective = input.trim();

        if (objective.length === 0) {
          throw new Error(
            createPlanningIssue(PLANNING_GOAL_EMPTY_OBJECTIVE, 'Planning goal objective must be non-empty').message,
          );
        }

        return Object.freeze({
          goal_id: createGoalId(objective),
          objective,
        });
      }

      if (isRecord(input) && typeof input.goal_id === 'string' && typeof input.objective === 'string') {
        return Object.freeze({
          goal_id: input.goal_id,
          objective: input.objective.trim(),
          ...(Array.isArray(input.constraints)
            ? {
                constraints: Object.freeze(
                  input.constraints.filter((value): value is string => typeof value === 'string'),
                ),
              }
            : {}),
          ...(isRecord(input.variables) ? { variables: Object.freeze({ ...input.variables }) } : {}),
          ...(input.metadata !== undefined ? { metadata: readMetadata(input.metadata) } : {}),
        });
      }

      if (isRecord(input)) {
        const objective =
          typeof input.objective === 'string'
            ? input.objective
            : typeof input.text === 'string'
              ? input.text
              : typeof input.goal === 'string'
                ? input.goal
                : '';

        if (objective.trim().length === 0) {
          throw new Error(
            createPlanningIssue(PLANNING_GOAL_EMPTY_OBJECTIVE, 'Planning goal objective must be non-empty').message,
          );
        }

        const goalId =
          typeof input.goal_id === 'string' && input.goal_id.trim().length > 0
            ? input.goal_id
            : createGoalId(objective);

        return Object.freeze({
          goal_id: goalId,
          objective: objective.trim(),
          ...(Array.isArray(input.constraints)
            ? {
                constraints: Object.freeze(
                  input.constraints.filter((value): value is string => typeof value === 'string'),
                ),
              }
            : {}),
          ...(isRecord(input.variables) ? { variables: Object.freeze({ ...input.variables }) } : {}),
          ...(input.metadata !== undefined
            ? { metadata: readMetadata(input.metadata) }
            : readMetadata(input) !== undefined
              ? { metadata: readMetadata(input) }
              : {}),
        });
      }

      throw new Error(
        createPlanningIssue(PLANNING_GOAL_INVALID, 'Planning goal input must be text or an object').message,
      );
    },
  };
}
