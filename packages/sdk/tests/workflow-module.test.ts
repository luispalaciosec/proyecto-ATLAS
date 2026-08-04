import { describe, expect, it } from 'vitest';

import { createPlanningEngine } from '@atlas/intelligence';
import { compileWorkflowDefinition } from '@atlas/workflow';

import { WorkflowModule } from '../src/modules/workflow-module.js';

describe('WorkflowModule', () => {
  it('compiles a planned workflow into a pipeline', () => {
    const planning = createPlanningEngine().plan({ goal: 'load -> analyze -> report' });
    const module = new WorkflowModule({} as never);

    expect(planning.workflow).not.toBeNull();

    const result = module.compileDefinition(planning.workflow!);

    expect(result.success).toBe(true);
    expect(result.pipeline?.stage_ids).toEqual(['load', 'analyze', 'report']);
  });

  it('projects a pipeline into compilation units', () => {
    const planning = createPlanningEngine().plan({ goal: 'hacer X' });
    const module = new WorkflowModule({} as never);
    const workflowResult = module.compileDefinition(planning.workflow!);
    const units = module.projectForCompilation(workflowResult.pipeline!, planning.workflow!);

    expect(units).toHaveLength(1);
    expect(units[0]).toMatchObject({
      id: planning.workflow!.identity.workflow_id,
      origin: `workflow://${planning.workflow!.identity.workflow_id}@${planning.workflow!.identity.workflow_version}`,
      metadata: {
        kind: 'WorkflowPipeline',
        projection: 'workflow-projection-adapter',
      },
    });
    expect(units[0]?.checksum).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it('matches compileWorkflowDefinition behavior', () => {
    const planning = createPlanningEngine().plan({ goal: 'execute task' });
    const module = new WorkflowModule({} as never);

    const fromModule = module.compileDefinition(planning.workflow!);
    const fromPackage = compileWorkflowDefinition(planning.workflow!);

    expect(fromModule).toEqual(fromPackage);
  });
});
