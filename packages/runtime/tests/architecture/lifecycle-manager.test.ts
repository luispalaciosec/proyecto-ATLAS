import { describe, expect, it } from 'vitest';

import { createLifecycleManager, isExecutionLifecycleStage } from '../../src/index.js';
import { InvalidLifecycleTransitionError } from '../../src/lifecycle/types.js';
import { VALID_LIFECYCLE_TRANSITIONS } from '../../src/lifecycle/transitions.js';
import { createDeterministicClock } from './helpers.js';

describe('LifecycleManager', () => {
  it('creates executions in the created stage', () => {
    const manager = createLifecycleManager({ clock: createDeterministicClock() });
    const snapshot = manager.createExecution('execution.lifecycle');

    expect(snapshot.stage).toBe('created');
    expect(manager.getCurrentStage('execution.lifecycle')).toBe('created');
    expect(manager.getHistory('execution.lifecycle')).toHaveLength(1);
  });

  it('allows only valid lifecycle transitions defined by RUNTIME-006', () => {
    const manager = createLifecycleManager({ clock: createDeterministicClock() });
    manager.createExecution('execution.valid');

    expect(manager.transition('execution.valid', 'initialized').stage).toBe('initialized');
    expect(manager.transition('execution.valid', 'prepared').stage).toBe('prepared');
    expect(manager.transition('execution.valid', 'running').stage).toBe('running');
    expect(manager.transition('execution.valid', 'completing').stage).toBe('completing');
    expect(manager.transition('execution.valid', 'completed').stage).toBe('completed');
    expect(manager.transition('execution.valid', 'archived').stage).toBe('archived');
  });

  it('rejects invalid lifecycle transitions', () => {
    const manager = createLifecycleManager({ clock: createDeterministicClock() });
    manager.createExecution('execution.invalid');

    expect(() => manager.transition('execution.invalid', 'running')).toThrow(
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
