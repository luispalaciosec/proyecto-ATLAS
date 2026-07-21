import type { PipelineCoordinator } from './pipeline-coordinator.js';

export function createPipelineCoordinator(): PipelineCoordinator {
  return {
    component: 'pipeline-coordinator',
    getCurrentStage() {
      return null;
    },
    getStageHistory() {
      return Object.freeze([]);
    },
  };
}
