/**
 * Engine execution status derived from ATLAS-100 §10 lifecycle.
 * Includes `cancelled` per Sprint 1 owner decision.
 */
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export const EXECUTION_STATUSES: readonly ExecutionStatus[] = [
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled',
] as const;

export function isExecutionStatus(value: unknown): value is ExecutionStatus {
  return typeof value === 'string' && (EXECUTION_STATUSES as readonly string[]).includes(value);
}
