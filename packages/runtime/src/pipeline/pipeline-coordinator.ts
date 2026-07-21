import type {
  PipelineContext,
  PipelineDefinition,
  PipelineExecution,
  PipelineResult,
} from './pipeline-model.js';
import type { PipelineRegistry } from './pipeline-registry.js';
import type { PipelineStage as DomainPipelineStage, PipelineStageSnapshot } from './types.js';

/**
 * @see ATLAS-RUNTIME-005
 * @see ATLAS-RUNTIME-009 §3 Pipeline Coordinator
 */
export interface RunPipelineOptions {
  readonly pipeline: PipelineDefinition;
  readonly context: PipelineContext;
  readonly registry?: PipelineRegistry;
}

export interface PipelineCoordinator {
  readonly component: 'pipeline-coordinator';

  run(options: RunPipelineOptions): Promise<PipelineResult>;

  pause(executionId: string, pipelineId: string): void;

  resume(options: RunPipelineOptions): Promise<PipelineResult>;

  cancel(executionId: string, pipelineId: string): void;

  getPipelineExecution(executionId: string, pipelineId: string): PipelineExecution | null;

  /** Legacy projection — RUNTIME-005 domain stage names */
  getCurrentStage(executionId: string): DomainPipelineStage | null;

  getStageHistory(executionId: string): readonly PipelineStageSnapshot[];
}

