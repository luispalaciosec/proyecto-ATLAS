import type { ExecutionLifecycleStage } from '../lifecycle/types.js';

/**
 * Runtime execution events — ATLAS-RUNTIME-002
 */
export const EXECUTION_STARTED_EVENT_TYPE = 'execution.started';
export const EXECUTION_STATE_CHANGED_EVENT_TYPE = 'execution.state_changed';
export const EXECUTION_COMPLETED_EVENT_TYPE = 'execution.completed';
export const EXECUTION_FAILED_EVENT_TYPE = 'execution.failed';

export interface ExecutionStartedPayload {
  readonly execution_id: string;
  readonly correlation_id: string;
  readonly stage: ExecutionLifecycleStage;
  readonly artifact_count: number;
}

export interface ExecutionStateChangedPayload {
  readonly execution_id: string;
  readonly correlation_id: string;
  readonly from_stage: ExecutionLifecycleStage;
  readonly to_stage: ExecutionLifecycleStage;
}

export interface ExecutionCompletedPayload {
  readonly execution_id: string;
  readonly correlation_id: string;
  readonly stage: ExecutionLifecycleStage;
  readonly success: boolean;
  readonly artifact_count: number;
  readonly output_count: number;
}

export interface ExecutionFailedPayload {
  readonly execution_id: string;
  readonly correlation_id: string;
  readonly stage: ExecutionLifecycleStage;
  readonly reason: string;
  readonly artifact_count: number;
  readonly output_count: number;
}
