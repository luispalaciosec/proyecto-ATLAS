/**
 * @see ATLAS-RUNTIME-004 Task Model
 */
export const TASK_STATES = [
  'created',
  'ready',
  'running',
  'waiting',
  'completed',
  'failed',
  'cancelled',
] as const;

export type TaskState = (typeof TASK_STATES)[number];

export interface TaskSnapshot {
  readonly task_id: string;
  readonly task_type: string;
  readonly execution_id: string;
  readonly workflow_id: string;
  readonly correlation_id: string;
  readonly state: TaskState;
}

export interface TaskDependency {
  readonly task_id: string;
  readonly depends_on: readonly string[];
}
