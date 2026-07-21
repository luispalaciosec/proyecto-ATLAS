import type { PipelineStageContext, PipelineStageIdentity, PipelineStageResult } from './pipeline-model.js';

/**
 * Generic reusable Pipeline Stage — ATLAS-RUNTIME-005
 */
export interface PipelineStage {
  readonly identity: PipelineStageIdentity;

  execute(context: PipelineStageContext): Promise<PipelineStageResult>;
}
