import { describe, expect, it } from 'vitest';

import { createStateManager } from '../../src/index.js';
import { createExecutionRepository } from '../../src/engine/execution-repository.js';
import { createDeterministicClock } from './helpers.js';

function createWiredState(clock = createDeterministicClock()) {
  const executionRepository = createExecutionRepository({ clock });
  const stateManager = createStateManager({ clock, executionRepository });

  return { executionRepository, stateManager, clock };
}

describe('StateManager', () => {
  it('initializes execution state in created', () => {
    const { executionRepository, stateManager } = createWiredState();
    executionRepository.begin({ artifacts: [] }, 'execution.state');
    const snapshot = stateManager.initializeExecution('execution.state', { artifact_count: 0 });

    expect(snapshot.scope).toBe('execution');
    expect(snapshot.value.stage).toBe('created');
  });

  it('tracks valid execution state transitions', () => {
    const { executionRepository, stateManager } = createWiredState();
    executionRepository.begin({ artifacts: [] }, 'execution.state');

    stateManager.transitionExecution('execution.state', 'initialized');
    stateManager.transitionExecution('execution.state', 'prepared');
    const running = stateManager.transitionExecution('execution.state', 'running');

    expect(running.value.stage).toBe('running');
    expect(stateManager.getTransitionHistory('execution', 'execution.state')).toHaveLength(3);
  });

  it('rejects skipped execution state transitions', () => {
    const { executionRepository, stateManager } = createWiredState();
    executionRepository.begin({ artifacts: [] }, 'execution.state');

    expect(() => stateManager.transitionExecution('execution.state', 'completed')).toThrow();
  });
});
