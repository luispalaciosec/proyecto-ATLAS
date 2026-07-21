import type { ExecutionLifecycleStage } from './types.js';

/**
 * Valid lifecycle transitions — ATLAS-RUNTIME-006 §4, §11
 */
export const VALID_LIFECYCLE_TRANSITIONS: Readonly<
  Record<ExecutionLifecycleStage, readonly ExecutionLifecycleStage[]>
> = {
  created: ['initialized'],
  initialized: ['prepared'],
  prepared: ['running'],
  running: ['waiting', 'completing'],
  waiting: ['resumed'],
  resumed: ['running', 'completing'],
  completing: ['completed'],
  completed: ['archived'],
  archived: [],
};

export function isValidLifecycleTransition(
  from: ExecutionLifecycleStage,
  to: ExecutionLifecycleStage,
): boolean {
  return VALID_LIFECYCLE_TRANSITIONS[from].includes(to);
}
