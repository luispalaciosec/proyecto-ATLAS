import type { PipelineDefinition } from './pipeline-model.js';
import type { PipelineRegistry } from './pipeline-registry.js';

/**
 * Configured pipeline instance — definition plus registered stage handlers.
 */
export interface Pipeline {
  readonly definition: PipelineDefinition;
  readonly registry: PipelineRegistry;
}

export function createPipeline(definition: PipelineDefinition, registry: PipelineRegistry): Pipeline {
  return Object.freeze({
    definition: Object.freeze({ ...definition, stage_ids: Object.freeze([...definition.stage_ids]) }),
    registry,
  });
}
