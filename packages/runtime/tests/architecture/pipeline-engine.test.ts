import { describe, expect, it, vi } from 'vitest';

import { createExecutionRepository } from '../../src/engine/execution-repository.js';
import { createEventDispatcher } from '../../src/events/event-dispatcher.factory.js';
import { createPipelineCoordinator } from '../../src/pipeline/pipeline-coordinator.factory.js';
import {
  PIPELINE_CANCELLED_EVENT_TYPE,
  PIPELINE_COMPLETED_EVENT_TYPE,
  PIPELINE_FAILED_EVENT_TYPE,
  PIPELINE_PAUSED_EVENT_TYPE,
  PIPELINE_RESUMED_EVENT_TYPE,
  PIPELINE_STAGE_COMPLETED_EVENT_TYPE,
  PIPELINE_STAGE_FAILED_EVENT_TYPE,
  PIPELINE_STAGE_STARTED_EVENT_TYPE,
  PIPELINE_STARTED_EVENT_TYPE,
  PIPELINE_TRANSITION_EVENT_TYPE,
} from '../../src/pipeline/pipeline-events.js';
import { createPipelineExecutor } from '../../src/pipeline/pipeline-executor.js';
import { createPipelineFactory } from '../../src/pipeline/pipeline-factory.js';
import type {
  PipelineContext,
  PipelineDefinition,
  PipelineStageContext,
  PipelineStageResult,
} from '../../src/pipeline/pipeline-model.js';
import { createPipelineRegistry } from '../../src/pipeline/pipeline-registry.js';
import type { PipelineStage } from '../../src/pipeline/pipeline-stage.js';
import { createPipeline } from '../../src/pipeline/pipeline.js';
import { projectPipelineExecution } from '../../src/pipeline/pipeline-projection.js';
import { createDeterministicClock } from './helpers.js';

function createStage(
  stageId: string,
  handler: (context: PipelineStageContext) => Promise<PipelineStageResult>,
): PipelineStage {
  return Object.freeze({
    identity: Object.freeze({ stage_id: stageId, stage_version: '1.0.0' }),
    execute: handler,
  });
}

function createHarness(clock = createDeterministicClock()) {
  const executionRepository = createExecutionRepository({ clock });
  const eventDispatcher = createEventDispatcher({ executionRepository, clock });
  const published: string[] = [];
  const originalPublish = eventDispatcher.publish.bind(eventDispatcher);

  eventDispatcher.publish = (event) => {
    published.push(event.event_type);
    originalPublish(event);
  };

  const coordinator = createPipelineCoordinator({
    executionRepository,
    eventDispatcher,
    clock,
  });

  executionRepository.begin({ artifacts: [] }, 'exec.pipeline');

  const definition: PipelineDefinition = Object.freeze({
    pipeline_id: 'pipeline.test',
    stage_ids: Object.freeze(['stage.one', 'stage.two']),
  });

  const context: PipelineContext = Object.freeze({
    pipeline_id: 'pipeline.test',
    execution_id: 'exec.pipeline',
    input: Object.freeze({ seed: true }),
  });

  return {
    clock,
    executionRepository,
    eventDispatcher,
    coordinator,
    definition,
    context,
    published,
  };
}

describe('PipelineRegistry', () => {
  it('registers and resolves stages', () => {
    const registry = createPipelineRegistry();
    const stage = createStage('alpha', async () => ({
      stage: { stage_id: 'alpha', stage_version: '1.0.0' },
      status: 'completed',
      output: { value: {} },
      duration_ms: 1,
      error: null,
    }));

    registry.register(stage);

    expect(registry.get('alpha')).toBe(stage);
    expect(registry.list()).toHaveLength(1);
  });

  it('rejects duplicate stage registration', () => {
    const registry = createPipelineRegistry();
    const stage = createStage('alpha', async () => ({
      stage: { stage_id: 'alpha', stage_version: '1.0.0' },
      status: 'completed',
      output: { value: {} },
      duration_ms: 1,
      error: null,
    }));

    registry.register(stage);

    expect(() => registry.register(stage)).toThrow(/already registered/);
  });
});

describe('PipelineFactory', () => {
  it('builds an ordered registry from a definition', () => {
    const factory = createPipelineFactory();
    const stages = [
      createStage('a', async () => ({
        stage: { stage_id: 'a', stage_version: '1.0.0' },
        status: 'completed',
        output: { value: { a: 1 } },
        duration_ms: 1,
        error: null,
      })),
      createStage('b', async () => ({
        stage: { stage_id: 'b', stage_version: '1.0.0' },
        status: 'completed',
        output: { value: { b: 2 } },
        duration_ms: 1,
        error: null,
      })),
    ];

    const registry = factory.create(
      { pipeline_id: 'p1', stage_ids: ['a', 'b'] },
      stages,
    );

    expect(registry.list().map((stage) => stage.identity.stage_id)).toEqual(['a', 'b']);
  });

  it('throws when a stage is missing', () => {
    const factory = createPipelineFactory();

    expect(() =>
      factory.create({ pipeline_id: 'p1', stage_ids: ['missing'] }, []),
    ).toThrow(/Missing pipeline stage/);
  });
});

describe('PipelineExecutor', () => {
  it('returns stage results from handlers', async () => {
    const clock = createDeterministicClock();
    const executor = createPipelineExecutor(clock);
    const stage = createStage('handler', async (context) => ({
      stage: stage.identity,
      status: 'completed',
      output: { value: { echoed: context.input.value.seed } },
      duration_ms: 2,
      error: null,
    }));

    const result = await executor.executeStage(stage, {
      execution_id: 'exec',
      pipeline_id: 'pipe',
      stage: stage.identity,
      input: { value: { seed: true } },
      execution_context: {},
    });

    expect(result.status).toBe('completed');
    expect(result.output.value).toEqual({ echoed: true });
  });

  it('maps thrown errors to failed stage results', async () => {
    const executor = createPipelineExecutor(createDeterministicClock());
    const stage = createStage('boom', async () => {
      throw new Error('stage exploded');
    });

    const result = await executor.executeStage(stage, {
      execution_id: 'exec',
      pipeline_id: 'pipe',
      stage: stage.identity,
      input: { value: {} },
      execution_context: {},
    });

    expect(result.status).toBe('failed');
    expect(result.error?.code).toBe('pipeline_stage_exception');
    expect(result.error?.message).toBe('stage exploded');
  });
});

describe('Pipeline', () => {
  it('freezes definition and registry references', () => {
    const registry = createPipelineRegistry();
    const pipeline = createPipeline({ pipeline_id: 'p', stage_ids: ['a'] }, registry);

    expect(pipeline.definition.pipeline_id).toBe('p');
    expect(pipeline.registry).toBe(registry);
  });
});

describe('PipelineCoordinator', () => {
  it('executes multiple stages in order and merges output', async () => {
    const harness = createHarness();
    const registry = createPipelineRegistry([
      createStage('stage.one', async (context) => ({
        stage: { stage_id: 'stage.one', stage_version: '1.0.0' },
        status: 'completed',
        output: { value: { one: context.input.value.seed } },
        duration_ms: 1,
        error: null,
      })),
      createStage('stage.two', async (context) => ({
        stage: { stage_id: 'stage.two', stage_version: '1.0.0' },
        status: 'completed',
        output: { value: { two: Boolean(context.input.value.one) } },
        duration_ms: 1,
        error: null,
      })),
    ]);

    const result = await harness.coordinator.run({
      pipeline: harness.definition,
      context: harness.context,
      registry,
    });

    expect(result.status).toBe('completed');
    expect(result.stages).toHaveLength(2);
    expect(result.output).toEqual({ seed: true, one: true, two: true });
    expect(harness.published).toContain(PIPELINE_STARTED_EVENT_TYPE);
    expect(harness.published).toContain(PIPELINE_STAGE_STARTED_EVENT_TYPE);
    expect(harness.published).toContain(PIPELINE_STAGE_COMPLETED_EVENT_TYPE);
    expect(harness.published).toContain(PIPELINE_TRANSITION_EVENT_TYPE);
    expect(harness.published).toContain(PIPELINE_COMPLETED_EVENT_TYPE);
  });

  it('propagates stage failure and stops the pipeline', async () => {
    const harness = createHarness();
    const registry = createPipelineRegistry([
      createStage('stage.one', async () => ({
        stage: { stage_id: 'stage.one', stage_version: '1.0.0' },
        status: 'failed',
        output: { value: {} },
        duration_ms: 1,
        error: { code: 'stage_failed', message: 'broken' },
      })),
      createStage('stage.two', async () => ({
        stage: { stage_id: 'stage.two', stage_version: '1.0.0' },
        status: 'completed',
        output: { value: { two: true } },
        duration_ms: 1,
        error: null,
      })),
    ]);

    const result = await harness.coordinator.run({
      pipeline: harness.definition,
      context: harness.context,
      registry,
    });

    expect(result.status).toBe('failed');
    expect(result.stages).toHaveLength(1);
    expect(result.error?.message).toBe('broken');
    expect(harness.published).toContain(PIPELINE_STAGE_FAILED_EVENT_TYPE);
    expect(harness.published).toContain(PIPELINE_FAILED_EVENT_TYPE);
    expect(harness.published).not.toContain(PIPELINE_COMPLETED_EVENT_TYPE);
  });

  it('supports pause and resume without re-running completed stages', async () => {
    const harness = createHarness();
    let secondStageStarted = false;
    const registry = createPipelineRegistry([
      createStage('stage.one', async () => ({
        stage: { stage_id: 'stage.one', stage_version: '1.0.0' },
        status: 'completed',
        output: { value: { one: 1 } },
        duration_ms: 1,
        error: null,
      })),
      createStage('stage.two', async () => {
        secondStageStarted = true;
        return {
          stage: { stage_id: 'stage.two', stage_version: '1.0.0' },
          status: 'completed',
          output: { value: { two: 2 } },
          duration_ms: 1,
          error: null,
        };
      }),
    ]);

    harness.coordinator.pause('exec.pipeline', 'pipeline.test');

    const paused = await harness.coordinator.run({
      pipeline: harness.definition,
      context: harness.context,
      registry,
    });

    expect(paused.status).toBe('paused');
    expect(secondStageStarted).toBe(false);
    expect(harness.published).toContain(PIPELINE_PAUSED_EVENT_TYPE);

    const resumed = await harness.coordinator.resume({
      pipeline: harness.definition,
      context: harness.context,
      registry,
    });

    expect(resumed.status).toBe('completed');
    expect(secondStageStarted).toBe(true);
    expect(harness.published).toContain(PIPELINE_RESUMED_EVENT_TYPE);
    expect(resumed.stages).toHaveLength(2);
  });

  it('supports cancellation', async () => {
    const harness = createHarness();
    const registry = createPipelineRegistry([
      createStage('stage.one', async () => ({
        stage: { stage_id: 'stage.one', stage_version: '1.0.0' },
        status: 'completed',
        output: { value: { one: 1 } },
        duration_ms: 1,
        error: null,
      })),
      createStage('stage.two', async () => ({
        stage: { stage_id: 'stage.two', stage_version: '1.0.0' },
        status: 'completed',
        output: { value: { two: 2 } },
        duration_ms: 1,
        error: null,
      })),
    ]);

    harness.coordinator.cancel('exec.pipeline', 'pipeline.test');

    const result = await harness.coordinator.run({
      pipeline: harness.definition,
      context: harness.context,
      registry,
    });

    expect(result.status).toBe('cancelled');
    expect(harness.published).toContain(PIPELINE_CANCELLED_EVENT_TYPE);
  });

  it('persists pipeline state through ExecutionRepository events and diagnostics', async () => {
    const harness = createHarness();
    const registry = createPipelineRegistry([
      createStage('stage.one', async () => ({
        stage: { stage_id: 'stage.one', stage_version: '1.0.0' },
        status: 'completed',
        output: { value: { one: 1 } },
        duration_ms: 1,
        error: null,
      })),
      createStage('stage.two', async () => ({
        stage: { stage_id: 'stage.two', stage_version: '1.0.0' },
        status: 'completed',
        output: { value: { two: 2 } },
        duration_ms: 1,
        error: null,
      })),
    ]);

    await harness.coordinator.run({
      pipeline: harness.definition,
      context: harness.context,
      registry,
    });

    const execution = harness.executionRepository.get('exec.pipeline');
    const projection = projectPipelineExecution(execution!, 'pipeline.test');

    expect(execution?.events.some((event) => event.event_type.startsWith('pipeline.'))).toBe(true);
    expect(
      execution?.diagnostics.records.some((record) => record.message.includes('pipeline_status:completed')),
    ).toBe(true);
    expect(projection?.status).toBe('completed');
    expect(projection?.stages).toHaveLength(2);
    expect(harness.coordinator.getPipelineExecution('exec.pipeline', 'pipeline.test')?.status).toBe(
      'completed',
    );
  });

  it('returns the same result deterministically when run is invoked again', async () => {
    const harness = createHarness();
    const handler = vi.fn(async () => ({
      stage: { stage_id: 'stage.one', stage_version: '1.0.0' },
      status: 'completed' as const,
      output: { value: { one: 1 } },
      duration_ms: 1,
      error: null,
    }));
    const registry = createPipelineRegistry([
      createStage('stage.one', handler),
    ]);
    const singleStageDefinition: PipelineDefinition = Object.freeze({
      pipeline_id: 'pipeline.test',
      stage_ids: Object.freeze(['stage.one']),
    });

    const first = await harness.coordinator.run({
      pipeline: singleStageDefinition,
      context: harness.context,
      registry,
    });
    const second = await harness.coordinator.run({
      pipeline: singleStageDefinition,
      context: harness.context,
      registry,
    });

    expect(first).toEqual(second);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('throws when execution does not exist', async () => {
    const harness = createHarness();

    await expect(
      harness.coordinator.run({
        pipeline: harness.definition,
        context: Object.freeze({
          pipeline_id: 'pipeline.test',
          execution_id: 'missing.execution',
          input: {},
        }),
        registry: createPipelineRegistry(),
      }),
    ).rejects.toThrow(/Execution not found/);
  });
});

describe('PipelineExecution projection', () => {
  it('returns null when no pipeline activity exists', () => {
    const repository = createExecutionRepository();
    repository.begin({ artifacts: [] }, 'exec.empty');

    expect(projectPipelineExecution(repository.get('exec.empty')!, 'pipeline.absent')).toBeNull();
  });
});

describe('PipelineContext and PipelineResult', () => {
  it('carries immutable input through execution context', async () => {
    const harness = createHarness();
    const seen: Array<Readonly<Record<string, unknown>>> = [];
    const registry = createPipelineRegistry([
      createStage('stage.one', async (context) => {
        seen.push(context.execution_context);
        return {
          stage: { stage_id: 'stage.one', stage_version: '1.0.0' },
          status: 'completed',
          output: { value: { marker: 'ok' } },
          duration_ms: 1,
          error: null,
        };
      }),
      createStage('stage.two', async () => ({
        stage: { stage_id: 'stage.two', stage_version: '1.0.0' },
        status: 'completed',
        output: { value: {} },
        duration_ms: 1,
        error: null,
      })),
    ]);

    await harness.coordinator.run({
      pipeline: harness.definition,
      context: harness.context,
      registry,
    });

    expect(seen[0]).toEqual({ seed: true });
  });
});
