import { describe, expect, it } from 'vitest';

import type { Artifact } from '@atlas/compiler';
import { createArtifact } from '@atlas/compiler';
import { Identifier } from '@atlas/core';
import { createInMemoryEventBus } from '@atlas/events';

import {
  createAtlasRuntime,
  createExecutionContext,
  resetExecutionSessionCounter,
  RuntimeCompletedEvent,
  RuntimeStartedEvent,
  summaryArtifactExecutor,
  isRuntimeLifecycle,
  type RuntimeCompletedPayload,
  type RuntimeStartedPayload,
} from '../src/index.js';

function createSummaryArtifact(id: string, nodes: number): Artifact {
  return createArtifact({
    id,
    kind: 'summary',
    content: { nodes },
    source_graph_id: Identifier.create('mir.workspace'),
  });
}

describe('ExecutionContext', () => {
  it('creates a context in create lifecycle state', () => {
    resetExecutionSessionCounter();

    const context = createExecutionContext({
      workspace: { name: 'test' },
      artifacts: [createSummaryArtifact('artifact.test', 3)],
    });

    expect(context.lifecycle).toBe('create');
    expect(context.session_id.toJSON()).toBe('session.1');
    expect(context.artifacts).toHaveLength(1);
    expect(context.outputs).toHaveLength(0);
  });
});

describe('AtlasRuntime', () => {
  it('executes summary artifacts through the full lifecycle', async () => {
    resetExecutionSessionCounter();

    const runtime = createAtlasRuntime();
    const artifact = createSummaryArtifact('artifact.runtime', 5);

    const result = await runtime.execute({
      artifacts: [artifact],
      workspace: { name: 'runtime-test' },
    });

    expect(result.success).toBe(true);
    expect(result.context.lifecycle).toBe('dispose');
    expect(result.context.outputs).toHaveLength(1);
    expect(result.context.outputs[0]).toEqual({
      artifact_id: artifact.id,
      kind: 'summary',
      result: { nodes: 5 },
      success: true,
    });
    expect(result.context.started_at).not.toBeNull();
    expect(result.context.completed_at).not.toBeNull();
  });

  it('fails when no executor is registered for an artifact kind', async () => {
    const runtime = createAtlasRuntime({ executors: [summaryArtifactExecutor] });
    const artifact = createArtifact({
      id: 'artifact.unknown',
      kind: 'unknown',
      content: { value: 1 },
    });

    const result = await runtime.execute({ artifacts: [artifact] });

    expect(result.success).toBe(false);
    expect(result.context.lifecycle).toBe('dispose');
    expect(result.context.outputs[0]?.success).toBe(false);
  });

  it('publishes RuntimeStartedEvent and RuntimeCompletedEvent', async () => {
    resetExecutionSessionCounter();

    const bus = createInMemoryEventBus();
    const started: RuntimeStartedPayload[] = [];
    const completed: RuntimeCompletedPayload[] = [];

    bus.subscribe(RuntimeStartedEvent, (event) => {
      started.push(event.payload);
    });
    bus.subscribe(RuntimeCompletedEvent, (event) => {
      completed.push(event.payload);
    });

    const runtime = createAtlasRuntime({ eventBus: bus });

    await runtime.execute({
      artifacts: [createSummaryArtifact('artifact.events', 2)],
    });

    expect(started).toHaveLength(1);
    expect(started[0]).toEqual({
      session_id: 'session.1',
      lifecycle: 'start',
      artifact_count: 1,
    });

    expect(completed).toHaveLength(1);
    expect(completed[0]).toMatchObject({
      success: true,
      session_id: 'session.1',
      lifecycle: 'dispose',
      artifact_count: 1,
      output_count: 1,
    });
  });

  it('does not publish events when no event bus is configured', async () => {
    const bus = createInMemoryEventBus();
    let count = 0;

    bus.subscribe(RuntimeStartedEvent, () => {
      count += 1;
    });

    const runtime = createAtlasRuntime();
    await runtime.execute({ artifacts: [createSummaryArtifact('artifact.silent', 1)] });

    expect(count).toBe(0);
  });
});

describe('Runtime events', () => {
  it('uses official runtime event types', () => {
    expect(String(RuntimeStartedEvent.type)).toBe('runtime.started');
    expect(String(RuntimeCompletedEvent.type)).toBe('runtime.completed');
    expect(RuntimeStartedEvent.version).toBe('1.0.0');
    expect(RuntimeCompletedEvent.version).toBe('1.0.0');
    expect(isRuntimeLifecycle('create')).toBe(true);
    expect(isRuntimeLifecycle('invalid')).toBe(false);
  });
});
