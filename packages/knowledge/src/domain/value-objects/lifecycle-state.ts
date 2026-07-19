/**
 * Lifecycle states from KNOWLEDGE-005.
 */
export const LifecycleState = {
  Idea: 'idea',
  Draft: 'draft',
  Review: 'review',
  Approved: 'approved',
  Operational: 'operational',
  Observed: 'observed',
  Improved: 'improved',
  Versioned: 'versioned',
  Retired: 'retired',
  Archived: 'archived',
} as const;

export type LifecycleState = (typeof LifecycleState)[keyof typeof LifecycleState];

export const LIFECYCLE_STATES: readonly LifecycleState[] = Object.freeze(
  Object.values(LifecycleState),
);

export function isLifecycleState(value: string): value is LifecycleState {
  return (LIFECYCLE_STATES as readonly string[]).includes(value);
}
