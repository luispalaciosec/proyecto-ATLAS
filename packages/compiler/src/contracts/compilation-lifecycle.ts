/**
 * @see ATLAS-ARCH-003 §14 Compiler Lifecycle
 * @see ATLAS-ARCH-006 §5 Pipeline Overview
 */
export const COMPILATION_LIFECYCLE_STATES = [
  'initialize',
  'discover',
  'create_units',
  'lower',
  'resolve',
  'validate',
  'generate',
  'publish',
  'complete',
  'cancelled',
] as const;

export type CompilationLifecycle = (typeof COMPILATION_LIFECYCLE_STATES)[number];

export function isCompilationLifecycle(value: unknown): value is CompilationLifecycle {
  return (
    typeof value === 'string' && (COMPILATION_LIFECYCLE_STATES as readonly string[]).includes(value)
  );
}
