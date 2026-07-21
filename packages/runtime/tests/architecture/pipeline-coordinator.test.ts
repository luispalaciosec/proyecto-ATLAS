import { describe, expect, it } from 'vitest';

import { createPipelineCoordinator } from '../../src/pipeline/pipeline-coordinator.factory.js';

describe('PipelineCoordinator (Sprint 10D)', () => {
  it('exposes the pipeline coordinator component id', () => {
    const coordinator = createPipelineCoordinator();

    expect(coordinator.component).toBe('pipeline-coordinator');
    expect(coordinator.getCurrentStage('missing')).toBeNull();
    expect(coordinator.getStageHistory('missing')).toEqual([]);
  });
});
