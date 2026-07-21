/**
 * @see ATLAS-RUNTIME-009 §3 Workflow Engine
 */
export const WORKFLOW_STATES = [
  'created',
  'active',
  'waiting',
  'completed',
  'failed',
  'cancelled',
] as const;

export type WorkflowState = (typeof WORKFLOW_STATES)[number];

export interface WorkflowSnapshot {
  readonly workflow_id: string;
  readonly execution_id: string;
  readonly state: WorkflowState;
  readonly stage_count: number;
  readonly completed_stages: number;
}

export interface WorkflowStageSnapshot {
  readonly workflow_id: string;
  readonly stage_id: string;
  readonly completed: boolean;
}
