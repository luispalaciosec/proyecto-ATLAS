import { describe, expect, it } from 'vitest';

import { PlanningModule } from '../src/modules/planning-module.js';

describe('PlanningModule', () => {
  it('plans a goal into a WorkflowDefinition', () => {
    const module = new PlanningModule({} as never);

    const result = module.planFromGoal('hacer X');

    expect(result.success).toBe(true);
    expect(result.goal.objective).toBe('hacer X');
    expect(result.workflow).not.toBeNull();
    expect(result.workflow?.identity.workflow_id).toMatch(/^workflow\./);
    expect(result.workflow?.nodes.some((node) => node.type === 'stage')).toBe(true);
  });

  it('rejects empty goals', () => {
    const module = new PlanningModule({} as never);

    const result = module.planFromGoal('   ');

    expect(result.success).toBe(false);
    expect(result.workflow).toBeNull();
  });

  it('exposes the underlying planning engine', () => {
    const module = new PlanningModule({} as never);

    expect(module.getEngine()).toBeDefined();
    expect(typeof module.getEngine().plan).toBe('function');
  });
});
