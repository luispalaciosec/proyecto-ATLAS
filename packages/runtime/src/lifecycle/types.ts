/**
 * @see ATLAS-RUNTIME-006 §4 Lifecycle Stages
 */
export const EXECUTION_LIFECYCLE_STAGES = [
  'created',
  'initialized',
  'prepared',
  'running',
  'waiting',
  'resumed',
  'completing',
  'completed',
  'archived',
] as const;

export type ExecutionLifecycleStage = (typeof EXECUTION_LIFECYCLE_STAGES)[number];

export function isExecutionLifecycleStage(value: string): value is ExecutionLifecycleStage {
  return (EXECUTION_LIFECYCLE_STAGES as readonly string[]).includes(value);
}

export interface ExecutionLifecycleSnapshot {
  readonly execution_id: string;
  readonly stage: ExecutionLifecycleStage;
  readonly entered_at: string;
}

export class InvalidLifecycleTransitionError extends Error {
  readonly execution_id: string;
  readonly from: ExecutionLifecycleStage;
  readonly to: ExecutionLifecycleStage;

  constructor(executionId: string, from: ExecutionLifecycleStage, to: ExecutionLifecycleStage) {
    super(`Invalid lifecycle transition for "${executionId}": ${from} → ${to}`);
    this.name = 'InvalidLifecycleTransitionError';
    this.execution_id = executionId;
    this.from = from;
    this.to = to;
  }
}
