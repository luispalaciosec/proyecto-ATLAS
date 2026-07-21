import type { PipelineDefinition } from './pipeline-model.js';
import { createPipelineRegistry, type PipelineRegistry } from './pipeline-registry.js';
import type { PipelineStage } from './pipeline-stage.js';

export interface PipelineFactory {
  create(definition: PipelineDefinition, stages: readonly PipelineStage[]): PipelineRegistry;
}

export function createPipelineFactory(): PipelineFactory {
  return {
    create(definition, stages) {
      const registry = createPipelineRegistry();

      for (const stageId of definition.stage_ids) {
        const stage = stages.find((candidate) => candidate.identity.stage_id === stageId);

        if (!stage) {
          throw new Error(`Missing pipeline stage "${stageId}" for pipeline "${definition.pipeline_id}"`);
        }

        registry.register(stage);
      }

      return registry;
    },
  };
}
