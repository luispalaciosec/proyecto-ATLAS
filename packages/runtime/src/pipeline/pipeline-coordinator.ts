import type { PipelineStage, PipelineStageSnapshot } from './types.js';

/**
 * @see ATLAS-RUNTIME-005
 * @see ATLAS-RUNTIME-009 §3 Pipeline Coordinator
 */
export interface PipelineCoordinator {
  readonly component: 'pipeline-coordinator';

  getCurrentStage(executionId: string): PipelineStage | null;

  getStageHistory(executionId: string): readonly PipelineStageSnapshot[];
}
