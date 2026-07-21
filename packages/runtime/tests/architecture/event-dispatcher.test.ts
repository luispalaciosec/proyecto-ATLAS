import { describe, expect, it } from 'vitest';

import { createInMemoryEventBus } from '@atlas/events';

import {
  createEventDispatcher,
  RuntimeCompletedEvent,
  RuntimeStartedEvent,
} from '../../src/index.js';
import { createExecutionRepository } from '../../src/engine/execution-repository.js';
import {
  EXECUTION_COMPLETED_EVENT_TYPE,
  EXECUTION_FAILED_EVENT_TYPE,
  EXECUTION_STARTED_EVENT_TYPE,
  EXECUTION_STATE_CHANGED_EVENT_TYPE,
} from '../../src/definitions/execution-events.js';
import { createDeterministicClock } from './helpers.js';

describe('EventDispatcher', () => {
  it('stores and queries runtime events', () => {
    const repository = createExecutionRepository({ clock: createDeterministicClock() });
    repository.begin({ artifacts: [] }, 'execution.events');
    const dispatcher = createEventDispatcher({ clock: createDeterministicClock(), executionRepository: repository });

    dispatcher.publish({
      event_id: 'event.1',
      event_type: EXECUTION_STARTED_EVENT_TYPE,
      event_version: '1.0.0',
      timestamp: '2026-07-20T00:00:00.000Z',
      correlation_id: 'execution.events',
      execution_id: 'execution.events',
      payload: {
        execution_id: 'execution.events',
        correlation_id: 'execution.events',
        stage: 'running',
        artifact_count: 1,
      },
    });

    expect(dispatcher.query({ execution_id: 'execution.events' })).toHaveLength(1);
    expect(dispatcher.query({ event_type: EXECUTION_STARTED_EVENT_TYPE })).toHaveLength(1);
  });

  it('notifies subscribers', () => {
    const dispatcher = createEventDispatcher({ clock: createDeterministicClock() });
    const received: string[] = [];

    dispatcher.subscribe((event) => {
      received.push(event.event_type);
    });

    dispatcher.publish({
      event_id: 'event.2',
      event_type: EXECUTION_STATE_CHANGED_EVENT_TYPE,
      event_version: '1.0.0',
      timestamp: '2026-07-20T00:00:00.000Z',
      correlation_id: 'execution.subscriber',
      execution_id: 'execution.subscriber',
      payload: {
        execution_id: 'execution.subscriber',
        correlation_id: 'execution.subscriber',
        from_stage: 'prepared',
        to_stage: 'running',
      },
    });

    expect(received).toEqual([EXECUTION_STATE_CHANGED_EVENT_TYPE]);
  });

  it('bridges execution events to @atlas/events without breaking compat', () => {
    const bus = createInMemoryEventBus();
    const started: unknown[] = [];
    const completed: unknown[] = [];

    bus.subscribe(RuntimeStartedEvent, (event) => {
      started.push(event.payload);
    });
    bus.subscribe(RuntimeCompletedEvent, (event) => {
      completed.push(event.payload);
    });

    const dispatcher = createEventDispatcher({ eventBus: bus, clock: createDeterministicClock() });

    dispatcher.publish({
      event_id: 'event.started',
      event_type: EXECUTION_STARTED_EVENT_TYPE,
      event_version: '1.0.0',
      timestamp: '2026-07-20T00:00:00.000Z',
      correlation_id: 'execution.bridge',
      execution_id: 'session.bridge',
      payload: {
        execution_id: 'session.bridge',
        correlation_id: 'execution.bridge',
        stage: 'running',
        artifact_count: 2,
      },
    });

    dispatcher.publish({
      event_id: 'event.completed',
      event_type: EXECUTION_COMPLETED_EVENT_TYPE,
      event_version: '1.0.0',
      timestamp: '2026-07-20T00:00:00.001Z',
      correlation_id: 'execution.bridge',
      execution_id: 'session.bridge',
      payload: {
        execution_id: 'session.bridge',
        correlation_id: 'execution.bridge',
        stage: 'completing',
        success: true,
        output_count: 2,
      },
    });

    dispatcher.publish({
      event_id: 'event.failed',
      event_type: EXECUTION_FAILED_EVENT_TYPE,
      event_version: '1.0.0',
      timestamp: '2026-07-20T00:00:00.002Z',
      correlation_id: 'execution.bridge',
      execution_id: 'session.failed',
      payload: {
        execution_id: 'session.failed',
        correlation_id: 'execution.bridge',
        stage: 'completing',
        reason: 'artifact_execution_failed',
        output_count: 1,
      },
    });

    expect(started).toHaveLength(1);
    expect(completed).toHaveLength(2);
  });
});
