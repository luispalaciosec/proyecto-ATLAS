/**
 * Generic Pipeline model — ATLAS-RUNTIME-005 (domain-agnostic)
 */

export type PipelineStatus =
  | 'pending'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type PipelineStageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface PipelineStageIdentity {
  readonly stage_id: string;
  readonly stage_version: string;
}

export interface PipelineStageInput {
  readonly value: Readonly<Record<string, unknown>>;
}

export interface PipelineStageOutput {
  readonly value: Readonly<Record<string, unknown>>;
}

export interface PipelineStageError {
  readonly code: string;
  readonly message: string;
}

export interface PipelineStageContext {
  readonly execution_id: string;
  readonly pipeline_id: string;
  readonly stage: PipelineStageIdentity;
  readonly input: PipelineStageInput;
  readonly execution_context: Readonly<Record<string, unknown>>;
}

export interface PipelineStageResult {
  readonly stage: PipelineStageIdentity;
  readonly status: PipelineStageStatus;
  readonly output: PipelineStageOutput;
  readonly duration_ms: number;
  readonly error: PipelineStageError | null;
}

export interface PipelineTransition {
  readonly from_stage_id: string | null;
  readonly to_stage_id: string;
  readonly occurred_at: string;
}

export interface PipelineContext {
  readonly pipeline_id: string;
  readonly execution_id: string;
  readonly input: Readonly<Record<string, unknown>>;
}

export interface PipelineResult {
  readonly pipeline_id: string;
  readonly execution_id: string;
  readonly status: PipelineStatus;
  readonly stages: readonly PipelineStageResult[];
  readonly output: Readonly<Record<string, unknown>>;
  readonly duration_ms: number;
  readonly error: PipelineStageError | null;
}

export interface PipelineExecution {
  readonly pipeline_id: string;
  readonly execution_id: string;
  readonly status: PipelineStatus;
  readonly current_stage_id: string | null;
  readonly stages: readonly PipelineStageResult[];
  readonly transitions: readonly PipelineTransition[];
}

export interface PipelineDefinition {
  readonly pipeline_id: string;
  readonly stage_ids: readonly string[];
}
