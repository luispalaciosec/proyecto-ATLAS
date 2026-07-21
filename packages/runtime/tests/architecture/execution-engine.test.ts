import { describe, expect, it } from 'vitest';

import { Identifier } from '@atlas/core';
import { createArtifact } from '@atlas/compiler';

import {
  createExecutionEngine,
  createLifecycleManager,
  createStateManager,
  createEventDispatcher,
  summaryArtifactExecutor,
} from '../../src/index.js';
import { createExecutionRepository } from '../../src/engine/execution-repository.js';
import { createDeterministicClock } from './helpers.js';

function createWiredEngine(clock = createDeterministicClock()) {
  const executionRepository = createExecutionRepository({ clock });
  const eventDispatcher = createEventDispatcher({ clock, executionRepository });
  const lifecycleManager = createLifecycleManager({ eventDispatcher, clock, executionRepository });
  const stateManager = createStateManager({ clock, executionRepository });

  const executionEngine = createExecutionEngine({
    executionRepository,
    lifecycleManager,
    stateManager,
    eventDispatcher,
    executors: [summaryArtifactExecutor],
    clock,
  });

  return { executionEngine, lifecycleManager, stateManager, eventDispatcher, executionRepository, clock };
}

describe('ExecutionEngine', () => {
  it('creates an execution unit in pending status', async () => {
    const { executionEngine } = createWiredEngine();

    const snapshot = await executionEngine.createExecution({
      execution_id: Identifier.create('execution.test'),
      intent: {
        intent_id: Identifier.create('intent.test'),
        correlation_id: 'correlation.test',
      },
    });

    expect(snapshot.execution_id).toBe('execution.test');
    expect(snapshot.status).toBe('pending');
    expect(executionEngine.getExecution('execution.test')?.status).toBe('pending');
  });

  it('executes artifacts and returns a completed execution snapshot', async () => {
    const { executionEngine, lifecycleManager } = createWiredEngine();
    const artifact = createArtifact({
      id: 'artifact.engine',
      kind: 'summary',
      content: { nodes: 4 },
    });

    const result = await executionEngine.execute({ artifacts: [artifact] });
    const executionId = result.context.session_id.toJSON();

    expect(result.success).toBe(true);
    expect(executionEngine.getExecution(executionId)?.status).toBe('completed');
    expect(lifecycleManager.getCurrentStage(executionId)).toBe('archived');
  });

  it('marks execution as failed when no executor exists', async () => {
    const { executionEngine } = createWiredEngine();
    const artifact = createArtifact({
      id: 'artifact.missing',
      kind: 'unknown',
      content: { value: 1 },
    });

    const result = await executionEngine.execute({ artifacts: [artifact] });
    const executionId = result.context.session_id.toJSON();

    expect(result.success).toBe(false);
    expect(executionEngine.getExecution(executionId)?.status).toBe('failed');
  });
});
