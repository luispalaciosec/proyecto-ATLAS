import { describe, expect, it } from 'vitest';

import { createPlanningEngine } from '@atlas/intelligence';

import { WorkflowProjectionAdapter } from '../src/adapters/workflow-projection-adapter.js';

describe('WorkflowProjectionAdapter', () => {
  it('projects a pipeline into CreateCompilationUnitParams', () => {
    const planning = createPlanningEngine().plan({ goal: 'hacer X' });
    const workflow = planning.workflow!;
    const pipeline = {
      pipeline_id: workflow.identity.workflow_id,
      stage_ids: ['execute'],
    };

    const result = new WorkflowProjectionAdapter().project({ pipeline, workflow });

    expect(result.success).toBe(true);
    expect(result.unit).toMatchObject({
      id: workflow.identity.workflow_id,
      origin: `workflow://${workflow.identity.workflow_id}@${workflow.identity.workflow_version}`,
      version: workflow.identity.workflow_version,
      metadata: {
        kind: 'WorkflowPipeline',
        workflowId: workflow.identity.workflow_id,
        stageIds: ['execute'],
        projection: 'workflow-projection-adapter',
      },
    });
    expect(result.unit?.checksum).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(result.unit?.source).toMatchObject({
      pipeline_id: workflow.identity.workflow_id,
      stage_ids: ['execute'],
      objective: 'hacer X',
    });
  });

  it('produces deterministic checksums', () => {
    const planning = createPlanningEngine().plan({ goal: 'deterministic goal' });
    const workflow = planning.workflow!;
    const pipeline = {
      pipeline_id: workflow.identity.workflow_id,
      stage_ids: ['execute'],
    };
    const adapter = new WorkflowProjectionAdapter();
    const first = adapter.project({ pipeline, workflow }).unit?.checksum;
    const second = adapter.project({ pipeline, workflow }).unit?.checksum;

    expect(first).toBe(second);
  });

  it('rejects empty pipeline ids', () => {
    const planning = createPlanningEngine().plan({ goal: 'invalid pipeline' });
    const workflow = planning.workflow!;

    const result = new WorkflowProjectionAdapter().project({
      pipeline: { pipeline_id: '   ', stage_ids: [] },
      workflow,
    });

    expect(result.success).toBe(false);
    expect(result.diagnostics[0]?.code).toBe('PROJECTION_INVALID_PIPELINE');
  });
});
