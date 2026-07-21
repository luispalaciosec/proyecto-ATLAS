import type { PipelineStageContext, PipelineStageResult } from './pipeline-model.js';
import type { PipelineStage } from './pipeline-stage.js';

export interface PipelineExecutor {
  executeStage(stage: PipelineStage, context: PipelineStageContext): Promise<PipelineStageResult>;
}

export function createPipelineExecutor(clock: () => string = () => new Date().toISOString()): PipelineExecutor {
  return {
    async executeStage(stage, context) {
      const startedAt = clock();

      try {
        const result = await stage.execute(context);
        return Object.freeze({
          ...result,
          stage: stage.identity,
          duration_ms:
            result.duration_ms ??
            Math.max(0, new Date(clock()).getTime() - new Date(startedAt).getTime()),
        });
      } catch (error) {
        return Object.freeze({
          stage: stage.identity,
          status: 'failed' as const,
          output: Object.freeze({ value: Object.freeze({}) }),
          duration_ms: Math.max(0, new Date(clock()).getTime() - new Date(startedAt).getTime()),
          error: Object.freeze({
            code: 'pipeline_stage_exception',
            message: error instanceof Error ? error.message : String(error),
          }),
        });
      }
    },
  };
}
