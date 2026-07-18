/**
 * @see ATLAS-DOM-009 §17 Runtime Lifecycle
 */
export const RUNTIME_LIFECYCLE_STATES = [
  'create',
  'initialize',
  'load',
  'start',
  'execute',
  'monitor',
  'stop',
  'dispose',
  'failed',
  'cancelled',
] as const;

export type RuntimeLifecycle = (typeof RUNTIME_LIFECYCLE_STATES)[number];

export function isRuntimeLifecycle(value: string): value is RuntimeLifecycle {
  return (RUNTIME_LIFECYCLE_STATES as readonly string[]).includes(value);
}
