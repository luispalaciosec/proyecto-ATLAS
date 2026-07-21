/**
 * Structural mirror of Runtime PipelineDefinition — ATLAS-RUNTIME-005
 * Kept local so @atlas/workflow stays independent from @atlas/runtime.
 */
export interface PipelineDefinition {
  readonly pipeline_id: string;
  readonly stage_ids: readonly string[];
}
