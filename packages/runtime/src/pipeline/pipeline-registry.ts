import type { PipelineStage } from './pipeline-stage.js';

export interface PipelineRegistry {
  register(stage: PipelineStage): void;

  get(stageId: string): PipelineStage | null;

  list(): readonly PipelineStage[];
}

export function createPipelineRegistry(stages: readonly PipelineStage[] = []): PipelineRegistry {
  const registry = new Map<string, PipelineStage>();

  for (const stage of stages) {
    registry.set(stage.identity.stage_id, stage);
  }

  return {
    register(stage: PipelineStage) {
      if (registry.has(stage.identity.stage_id)) {
        throw new Error(`Pipeline stage already registered: ${stage.identity.stage_id}`);
      }

      registry.set(stage.identity.stage_id, stage);
    },

    get(stageId: string) {
      return registry.get(stageId) ?? null;
    },

    list() {
      return Object.freeze([...registry.values()]);
    },
  };
}
