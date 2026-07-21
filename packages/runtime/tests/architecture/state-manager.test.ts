import { describe, expect, it } from 'vitest';

import { createStateManager } from '../../src/index.js';
import { InvalidStateTransitionError } from '../../src/state/types.js';
import { createDeterministicClock } from './helpers.js';

describe('StateManager', () => {
  it('initializes execution state in created', () => {
    const manager = createStateManager({ clock: createDeterministicClock() });
    const snapshot = manager.initializeExecution('execution.state', { artifact_count: 2 });

    expect(snapshot.scope).toBe('execution');
    expect(snapshot.value.stage).toBe('created');
    expect(snapshot.value.artifact_count).toBe(2);
  });

  it('tracks valid execution state transitions', () => {
    const manager = createStateManager({ clock: createDeterministicClock() });
    manager.initializeExecution('execution.state', { artifact_count: 1 });

    manager.transitionExecution('execution.state', 'initialized');
    manager.transitionExecution('execution.state', 'prepared');
    const running = manager.transitionExecution('execution.state', 'running');

    expect(running.value.stage).toBe('running');
    expect(manager.getTransitionHistory('execution', 'execution.state')).toHaveLength(3);
  });

  it('rejects invalid execution state transitions', () => {
    const manager = createStateManager({ clock: createDeterministicClock() });
    manager.initializeExecution('execution.state', { artifact_count: 1 });

    expect(() => manager.transitionExecution('execution.state', 'completed')).toThrow(
      InvalidStateTransitionError,
    );
  });
});
