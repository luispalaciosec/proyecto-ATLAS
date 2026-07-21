import { describe, expect, it } from 'vitest';

import { createArtifact } from '@atlas/compiler';
import { createInMemoryEventBus } from '@atlas/events';

import {
  createAtlasRuntime,
  resetExecutionSessionCounter,
  RuntimeCompletedEvent,
  RuntimeStartedEvent,
  summaryArtifactExecutor,
} from '../../src/index.js';
import {
  EXECUTION_COMPLETED_EVENT_TYPE,
  EXECUTION_FAILED_EVENT_TYPE,
  EXECUTION_STARTED_EVENT_TYPE,
  EXECUTION_STATE_CHANGED_EVENT_TYPE,
} from '../../src/definitions/execution-events.js';
import { createDeterministicClock } from './helpers.js';

describe('Execution flow', () => {
  it('runs the vertical slice from Runtime.execute() to ExecutionResult', async () => {
    resetExecutionSessionCounter();
    const clock = createDeterministicClock();
    const runtime = createAtlasRuntime({ clock, executors: [summaryArtifactExecutor] });

    const artifact = createArtifact({
      id: 'artifact.flow',
      kind: 'summary',
      content: { nodes: 7 },
    });

    const result = await runtime.execute({ artifacts: [artifact], workspace: { name: 'flow' } });
    const executionId = result.context.session_id.toJSON();

    expect(result.success).toBe(true);
    expect(result.context.lifecycle).toBe('dispose');
    expect(result.context.outputs).toHaveLength(1);
    expect(runtime.composition.lifecycleManager.getCurrentStage(executionId)).toBe('archived');
    expect(runtime.composition.stateManager.getState('execution', executionId)?.value.stage).toBe(
      'archived',
    );

    const aggregate = runtime.composition.executionEngine.getExecutionAggregate(executionId);
    expect(aggregate?.identity.execution_id).toBe(executionId);
    expect(aggregate?.result?.success).toBe(true);
    expect(aggregate?.events.length).toBeGreaterThan(0);

    const events = runtime.composition.eventDispatcher.query({ execution_id: executionId });
    const eventTypes = events.map((event) => event.event_type);

    expect(eventTypes).toContain(EXECUTION_STARTED_EVENT_TYPE);
    expect(eventTypes).toContain(EXECUTION_STATE_CHANGED_EVENT_TYPE);
    expect(eventTypes).toContain(EXECUTION_COMPLETED_EVENT_TYPE);
    expect(eventTypes).not.toContain(EXECUTION_FAILED_EVENT_TYPE);
  });

  it('emits execution.failed and preserves compat events on failure', async () => {
    resetExecutionSessionCounter();
    const clock = createDeterministicClock();
    const bus = createInMemoryEventBus();
    const compatStarted: unknown[] = [];
    const compatCompleted: unknown[] = [];

    bus.subscribe(RuntimeStartedEvent, (event) => {
      compatStarted.push(event.payload);
    });
    bus.subscribe(RuntimeCompletedEvent, (event) => {
      compatCompleted.push(event.payload);
    });

    const runtime = createAtlasRuntime({
      clock,
      eventBus: bus,
      executors: [summaryArtifactExecutor],
    });

    const artifact = createArtifact({
      id: 'artifact.fail',
      kind: 'unknown',
      content: { value: 1 },
    });

    const result = await runtime.execute({ artifacts: [artifact] });
    const executionId = result.context.session_id.toJSON();
    const events = runtime.composition.eventDispatcher.query({ execution_id: executionId });

    expect(result.success).toBe(false);
    expect(events.some((event) => event.event_type === EXECUTION_FAILED_EVENT_TYPE)).toBe(true);
    expect(compatStarted).toHaveLength(1);
    expect(compatCompleted).toHaveLength(1);
  });
});

describe('ExecutionResult', () => {
  it('returns deterministic timestamps when a clock is provided', async () => {
    resetExecutionSessionCounter();
    const clock = createDeterministicClock('2026-07-20T10:00:00.000Z');
    const runtime = createAtlasRuntime({ clock, executors: [summaryArtifactExecutor] });

    const result = await runtime.execute({
      artifacts: [
        createArtifact({
          id: 'artifact.deterministic',
          kind: 'summary',
          content: { nodes: 1 },
        }),
      ],
    });

    expect(result.context.started_at).toBe('2026-07-20T10:00:00.009Z');
    expect(result.context.completed_at).toBe('2026-07-20T10:00:00.028Z');
    expect(result.context.started_at! < result.context.completed_at!).toBe(true);
  });
});
