import type { CreateCompilationUnitParams } from '@atlas/compiler';
import { computeSourceChecksum } from '@atlas/knowledge/compiler-adapter';
import type { PipelineDefinition, WorkflowDefinition } from '@atlas/workflow';

export interface WorkflowProjectionInput {
  readonly pipeline: PipelineDefinition;
  readonly workflow: WorkflowDefinition;
}

export interface WorkflowProjectionDiagnostic {
  readonly code: string;
  readonly message: string;
  readonly pipelineId?: string;
}

export interface WorkflowProjectionResult {
  readonly success: boolean;
  readonly unit?: CreateCompilationUnitParams;
  readonly diagnostics: readonly WorkflowProjectionDiagnostic[];
}

export interface WorkflowCanonicalSource {
  readonly pipeline_id: string;
  readonly stage_ids: readonly string[];
  readonly workflow_id: string;
  readonly workflow_version: string;
  readonly objective?: string;
  readonly metadata?: WorkflowDefinition['metadata'];
}

function serializeWorkflowCanonicalSource(input: WorkflowProjectionInput): WorkflowCanonicalSource {
  const objective = input.workflow.variables?.objective;

  return Object.freeze({
    pipeline_id: input.pipeline.pipeline_id,
    stage_ids: Object.freeze([...input.pipeline.stage_ids]),
    workflow_id: input.workflow.identity.workflow_id,
    workflow_version: input.workflow.identity.workflow_version,
    ...(typeof objective === 'string' ? { objective } : {}),
    ...(input.workflow.metadata ? { metadata: input.workflow.metadata } : {}),
  });
}

export class WorkflowProjectionAdapter {
  project(input: WorkflowProjectionInput): WorkflowProjectionResult {
    const pipelineId = input.pipeline.pipeline_id;

    if (typeof pipelineId !== 'string' || pipelineId.trim().length === 0) {
      return this.#failure(
        pipelineId,
        'PROJECTION_INVALID_PIPELINE',
        'Pipeline id must be non-empty',
      );
    }

    const source = serializeWorkflowCanonicalSource(input);
    const version = input.workflow.identity.workflow_version;

    const unit: CreateCompilationUnitParams = Object.freeze({
      id: pipelineId,
      origin: `workflow://${pipelineId}@${version}`,
      checksum: computeSourceChecksum(source),
      version,
      source,
      metadata: Object.freeze({
        kind: 'WorkflowPipeline',
        workflowId: pipelineId,
        stageIds: Object.freeze([...input.pipeline.stage_ids]),
        projection: 'workflow-projection-adapter',
      }),
    });

    return Object.freeze({
      success: true,
      unit,
      diagnostics: Object.freeze([]),
    });
  }

  projectToUnits(input: WorkflowProjectionInput): readonly CreateCompilationUnitParams[] {
    const result = this.project(input);

    if (!result.success || !result.unit) {
      throw new Error(result.diagnostics[0]?.message ?? 'Workflow projection failed');
    }

    return Object.freeze([result.unit]);
  }

  #failure(
    pipelineId: string | undefined,
    code: string,
    message: string,
  ): WorkflowProjectionResult {
    const diagnostic: WorkflowProjectionDiagnostic = Object.freeze({
      code,
      message,
      ...(pipelineId !== undefined ? { pipelineId } : {}),
    });

    return Object.freeze({
      success: false,
      diagnostics: Object.freeze([diagnostic]),
    });
  }
}
