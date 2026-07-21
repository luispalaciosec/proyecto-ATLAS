/**
 * @see ATLAS-RUNTIME-005 §3 Pipeline Stages
 */
export const PIPELINE_STAGES = [
  'intent',
  'compilation',
  'knowledge_projection',
  'context_construction',
  'reasoning',
  'planning',
  'workflow_generation',
  'task_scheduling',
  'agent_execution',
  'result_collection',
  'execution_finalization',
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export function isPipelineStage(value: string): value is PipelineStage {
  return (PIPELINE_STAGES as readonly string[]).includes(value);
}

export interface PipelineStageSnapshot {
  readonly execution_id: string;
  readonly stage: PipelineStage;
  readonly entered_at: string;
}
