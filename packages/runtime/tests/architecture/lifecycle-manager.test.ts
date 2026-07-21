import { describe, expect, it } from 'vitest';

import { createLifecycleManager, isExecutionLifecycleStage } from '../../src/index.js';
import { createExecutionRepository } from '../../src/engine/execution-repository.js';
import { InvalidLifecycleTransitionError } from '../../src/lifecycle/types.js';
import { VALID_LIFECYCLE_TRANSITIONS } from '../../src/lifecycle/transitions.js';
import { createDeterministicClock } from './helpers.js';

function createWiredLifecycle(clock = createDeterministicClock()) {
  const executionRepository = createExecutionRepository({ clock });
  const lifecycleManager = createLifecycleManager({ clock, executionRepository });

  return { executionRepository, lifecycleManager, clock };
}

describe('LifecycleManager', () => {
  it('creates executions in the created stage', () => {
    const { executionRepository, lifecycleManager } = createWiredLifecycle();
    executionRepository.begin({ artifacts: [] }, 'execution.lifecycle');
    const snapshot = lifecycleManager.createExecution('execution.lifecycle');

    expect(snapshot.stage).toBe('created');
    expect(lifecycleManager.getCurrentStage('execution.lifecycle')).toBe('created');
    expect(lifecycleManager.getHistory('execution.lifecycle')).toHaveLength(1);
  });

  it('allows only valid lifecycle transitions defined by RUNTIME-006', () => {
    const { executionRepository, lifecycleManager } = createWiredLifecycle();
    executionRepository.begin({ artifacts: [] }, 'execution.valid');

    expect(lifecycleManager.transition('execution.valid', 'initialized').stage).toBe('initialized');
    expect(lifecycleManager.transition('execution.valid', 'prepared').stage).toBe('prepared');
    expect(lifecycleManager.transition('execution.valid', 'running').stage).toBe('running');
    expect(lifecycleManager.transition('execution.valid', 'completing').stage).toBe('completing');
    expect(lifecycleManager.transition('execution.valid', 'completed').stage).toBe('completed');
    expect(lifecycleManager.transition('execution.valid', 'archived').stage).toBe('archived');
  });

  it('rejects invalid lifecycle transitions', () => {
    const { executionRepository, lifecycleManager } = createWiredLifecycle();
    executionRepository.begin({ artifacts: [] }, 'execution.invalid');

    expect(() => lifecycleManager.transition('execution.invalid', 'running')).toThrow(
      InvalidLifecycleTransitionError,
    );
  });

  it('documents the official lifecycle graph', () => {
    expect(VALID_LIFECYCLE_TRANSITIONS.created).toEqual(['initialized']);
    expect(VALID_LIFECYCLE_TRANSITIONS.archived).toEqual([]);
  });

  it('validates lifecycle stage identifiers', () => {
    expect(isExecutionLifecycleStage('running')).toBe(true);
    expect(isExecutionLifecycleStage('invalid')).toBe(false);
  });
});
