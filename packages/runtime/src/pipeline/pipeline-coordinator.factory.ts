import type { Execution } from '../engine/execution-aggregate.js';
import { createExecutionRepository, type ExecutionRepository } from '../engine/execution-repository.js';
import type { EventDispatcher } from '../events/event-dispatcher.js';
import { createEventDispatcher } from '../events/event-dispatcher.factory.js';
import type { RuntimeEventEnvelope } from '../events/types.js';

import type { PipelineCoordinator, RunPipelineOptions } from './pipeline-coordinator.js';
import { createPipelineExecutor, type PipelineExecutor } from './pipeline-executor.js';
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
} from './pipeline-events.js';
import type {
  PipelineContext,
  PipelineDefinition,
  PipelineResult,
  PipelineStageError,
  PipelineStageResult,
  PipelineStatus,
} from './pipeline-model.js';
import type { PipelineStageSnapshot } from './types.js';
import {
  derivePipelineStatus,
  pipelineEventsFor,
  projectPipelineExecution,
  projectPipelineStageResults,
  readPipelineStatus,
} from './pipeline-projection.js';
import { createPipelineRegistry, type PipelineRegistry } from './pipeline-registry.js';
import { createPipeline, type Pipeline } from './pipeline.js';
import { isPipelineStage, type PipelineStage as DomainPipelineStage } from './types.js';

const PIPELINE_STATUS_PREFIX = 'pipeline_status:';

export interface CreatePipelineCoordinatorOptions {
  readonly executionRepository: ExecutionRepository;
  readonly eventDispatcher: EventDispatcher;
  readonly clock?: () => string;
  readonly registry?: PipelineRegistry;
  readonly executor?: PipelineExecutor;
}

function writePipelineStatus(
  repository: ExecutionRepository,
  executionId: string,
  pipelineId: string,
  status: PipelineStatus,
  clock: () => string,
): void {
  repository.appendDiagnostic(executionId, {
    diagnostic_id: `${executionId}:${pipelineId}:status:${clock()}`,
    level: 'info',
    message: `${PIPELINE_STATUS_PREFIX}${status}`,
    recorded_at: clock(),
  });
}

function publishPipelineEvent(
  repository: ExecutionRepository,
  eventDispatcher: EventDispatcher,
  execution: Execution,
  pipelineId: string,
  eventType: string,
  suffix: string,
  payload: Readonly<Record<string, unknown>>,
  clock: () => string,
): RuntimeEventEnvelope {
  const event = Object.freeze({
    event_id: `${execution.identity.execution_id}:${pipelineId}:${suffix}:${clock()}`,
    event_type: eventType,
    event_version: '1.0.0',
    timestamp: clock(),
    correlation_id: execution.identity.correlation_id,
    execution_id: execution.identity.execution_id,
    payload: Object.freeze({
      pipeline_id: pipelineId,
      ...payload,
    }),
  });

  eventDispatcher.publish(event);
  return event;
}

function mergeStageOutput(
  accumulated: Readonly<Record<string, unknown>>,
  stageOutput: Readonly<Record<string, unknown>>,
): Readonly<Record<string, unknown>> {
  return Object.freeze({ ...accumulated, ...stageOutput });
}

function resolvePipeline(options: RunPipelineOptions, registry: PipelineRegistry): Pipeline {
  if (options.registry) {
    return createPipeline(options.pipeline, options.registry);
  }

  return createPipeline(options.pipeline, registry);
}

function buildPipelineResult(
  pipelineId: string,
  context: PipelineContext,
  events: readonly RuntimeEventEnvelope[],
): PipelineResult {
  const stages = projectPipelineStageResults(events);
  const output = stages.reduce<Readonly<Record<string, unknown>>>(
    (accumulated, stage) => mergeStageOutput(accumulated, stage.output.value),
    context.input,
  );
  const failedStage = stages.find((stage) => stage.status === 'failed');

  return Object.freeze({
    pipeline_id: pipelineId,
    execution_id: context.execution_id,
    status: derivePipelineStatus(events),
    stages: Object.freeze(stages),
    output,
    duration_ms: stages.reduce((total, stage) => total + stage.duration_ms, 0),
    error: failedStage?.error ?? null,
  });
}

function completedStageIds(events: readonly RuntimeEventEnvelope[]): Set<string> {
  const completed = new Set<string>();

  for (const event of events) {
    if (
      event.event_type === PIPELINE_STAGE_COMPLETED_EVENT_TYPE ||
      event.event_type === PIPELINE_STAGE_FAILED_EVENT_TYPE
    ) {
      completed.add(String(event.payload.stage_id));
    }
  }

  return completed;
}

function resolveCoordinatorOptions(
  options?: CreatePipelineCoordinatorOptions,
): CreatePipelineCoordinatorOptions {
  if (options) {
    return options;
  }

  const executionRepository = createExecutionRepository();

  return {
    executionRepository,
    eventDispatcher: createEventDispatcher({ executionRepository }),
  };
}

export function createPipelineCoordinator(
  options?: CreatePipelineCoordinatorOptions,
): PipelineCoordinator {
  const resolved = resolveCoordinatorOptions(options);
  const clock = resolved.clock ?? (() => new Date().toISOString());
  const repository = resolved.executionRepository;
  const eventDispatcher = resolved.eventDispatcher;
  const registry = resolved.registry ?? createPipelineRegistry();
  const executor = resolved.executor ?? createPipelineExecutor(clock);

  function requireExecution(executionId: string): Execution {
    const execution = repository.get(executionId);

    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    return execution;
  }

  async function executePipeline(
    pipeline: PipelineDefinition,
    context: PipelineContext,
    stageRegistry: PipelineRegistry,
    resume: boolean,
  ): Promise<PipelineResult> {
    const execution = requireExecution(context.execution_id);
    const pipelineId = pipeline.pipeline_id;
    const existingEvents = pipelineEventsFor(execution, pipelineId);
    const preStatus = readPipelineStatus(execution, pipelineId);
    const alreadyStarted = existingEvents.some(
      (event) => event.event_type === PIPELINE_STARTED_EVENT_TYPE,
    );

    if (alreadyStarted && !resume) {
      return buildPipelineResult(pipelineId, context, existingEvents);
    }

    if (!resume && (preStatus === 'paused' || preStatus === 'cancelled')) {
      const result = buildPipelineResult(pipelineId, context, existingEvents);
      return Object.freeze({
        ...result,
        status: existingEvents.length > 0 ? result.status : preStatus,
      });
    }

    if (resume) {
      publishPipelineEvent(
        repository,
        eventDispatcher,
        execution,
        pipelineId,
        PIPELINE_RESUMED_EVENT_TYPE,
        'resumed',
        {},
        clock,
      );
      writePipelineStatus(repository, context.execution_id, pipelineId, 'running', clock);
    } else if (!alreadyStarted) {
      publishPipelineEvent(
        repository,
        eventDispatcher,
        execution,
        pipelineId,
        PIPELINE_STARTED_EVENT_TYPE,
        'started',
        { input: context.input },
        clock,
      );
      writePipelineStatus(repository, context.execution_id, pipelineId, 'running', clock);
    }

    const stageResults: PipelineStageResult[] = [];
    let accumulatedOutput: Readonly<Record<string, unknown>> = Object.freeze({ ...context.input });
    let pipelineError: PipelineStageError | null = null;
    let finalStatus: PipelineStatus = 'running';
    const doneStageIds = completedStageIds(pipelineEventsFor(requireExecution(context.execution_id), pipelineId));

    if (!resume) {
      stageResults.push(...projectPipelineStageResults(existingEvents));
      for (const result of stageResults) {
        accumulatedOutput = mergeStageOutput(accumulatedOutput, result.output.value);
      }
    } else {
      const priorResults = projectPipelineStageResults(existingEvents);
      stageResults.push(...priorResults);
      for (const result of priorResults) {
        accumulatedOutput = mergeStageOutput(accumulatedOutput, result.output.value);
      }
    }

    for (const stageId of pipeline.stage_ids) {
      const currentExecution = requireExecution(context.execution_id);
      const currentStatus = readPipelineStatus(currentExecution, pipelineId);

      if (currentStatus === 'cancelled') {
        finalStatus = 'cancelled';
        break;
      }

      if (currentStatus === 'paused') {
        finalStatus = 'paused';
        break;
      }

      if (doneStageIds.has(stageId)) {
        continue;
      }

      const stage = stageRegistry.get(stageId);

      if (!stage) {
        pipelineError = Object.freeze({
          code: 'pipeline_stage_not_registered',
          message: `Stage not registered: ${stageId}`,
        });
        finalStatus = 'failed';
        publishPipelineEvent(
          repository,
          eventDispatcher,
          currentExecution,
          pipelineId,
          PIPELINE_FAILED_EVENT_TYPE,
          'failed',
          { error: pipelineError },
          clock,
        );
        writePipelineStatus(repository, context.execution_id, pipelineId, 'failed', clock);
        break;
      }

      publishPipelineEvent(
        repository,
        eventDispatcher,
        currentExecution,
        pipelineId,
        PIPELINE_STAGE_STARTED_EVENT_TYPE,
        `stage:${stageId}:started`,
        {
          stage_id: stage.identity.stage_id,
          stage_version: stage.identity.stage_version,
        },
        clock,
      );

      publishPipelineEvent(
        repository,
        eventDispatcher,
        currentExecution,
        pipelineId,
        PIPELINE_TRANSITION_EVENT_TYPE,
        `transition:${stageId}`,
        {
          from_stage_id: stageResults.at(-1)?.stage.stage_id ?? null,
          to_stage_id: stageId,
        },
        clock,
      );

      const stageResult = await executor.executeStage(
        stage,
        Object.freeze({
          execution_id: context.execution_id,
          pipeline_id: pipelineId,
          stage: stage.identity,
          input: Object.freeze({ value: accumulatedOutput }),
          execution_context: Object.freeze({ ...context.input }),
        }),
      );

      stageResults.push(stageResult);
      doneStageIds.add(stageId);

      if (stageResult.status === 'failed') {
        pipelineError = stageResult.error;
        finalStatus = 'failed';

        publishPipelineEvent(
          repository,
          eventDispatcher,
          requireExecution(context.execution_id),
          pipelineId,
          PIPELINE_STAGE_FAILED_EVENT_TYPE,
          `stage:${stageId}:failed`,
          {
            stage_id: stage.identity.stage_id,
            stage_version: stage.identity.stage_version,
            duration_ms: stageResult.duration_ms,
            error: stageResult.error,
          },
          clock,
        );

        publishPipelineEvent(
          repository,
          eventDispatcher,
          requireExecution(context.execution_id),
          pipelineId,
          PIPELINE_FAILED_EVENT_TYPE,
          'failed',
          { error: pipelineError },
          clock,
        );
        writePipelineStatus(repository, context.execution_id, pipelineId, 'failed', clock);
        break;
      }

      accumulatedOutput = mergeStageOutput(accumulatedOutput, stageResult.output.value);

      publishPipelineEvent(
        repository,
        eventDispatcher,
        requireExecution(context.execution_id),
        pipelineId,
        PIPELINE_STAGE_COMPLETED_EVENT_TYPE,
        `stage:${stageId}:completed`,
        {
          stage_id: stage.identity.stage_id,
          stage_version: stage.identity.stage_version,
          duration_ms: stageResult.duration_ms,
          output: stageResult.output.value,
        },
        clock,
      );
    }

    const durationMs = stageResults.reduce((total, result) => total + result.duration_ms, 0);

    if (finalStatus === 'running') {
      finalStatus = 'completed';
      publishPipelineEvent(
        repository,
        eventDispatcher,
        requireExecution(context.execution_id),
        pipelineId,
        PIPELINE_COMPLETED_EVENT_TYPE,
        'completed',
        { output: accumulatedOutput, duration_ms: durationMs },
        clock,
      );
      writePipelineStatus(repository, context.execution_id, pipelineId, 'completed', clock);
    }

    return Object.freeze({
      pipeline_id: pipelineId,
      execution_id: context.execution_id,
      status: finalStatus,
      stages: Object.freeze([...stageResults]),
      output: accumulatedOutput,
      duration_ms: durationMs,
      error: pipelineError,
    });
  }

  return {
    component: 'pipeline-coordinator',

    async run(options) {
      const pipeline = resolvePipeline(options, registry);
      return executePipeline(pipeline.definition, options.context, pipeline.registry, false);
    },

    pause(executionId, pipelineId) {
      const execution = requireExecution(executionId);
      writePipelineStatus(repository, executionId, pipelineId, 'paused', clock);
      publishPipelineEvent(
        repository,
        eventDispatcher,
        execution,
        pipelineId,
        PIPELINE_PAUSED_EVENT_TYPE,
        'paused',
        {},
        clock,
      );
    },

    async resume(options) {
      const pipeline = resolvePipeline(options, registry);
      return executePipeline(pipeline.definition, options.context, pipeline.registry, true);
    },

    cancel(executionId, pipelineId) {
      const execution = requireExecution(executionId);
      writePipelineStatus(repository, executionId, pipelineId, 'cancelled', clock);
      publishPipelineEvent(
        repository,
        eventDispatcher,
        execution,
        pipelineId,
        PIPELINE_CANCELLED_EVENT_TYPE,
        'cancelled',
        {},
        clock,
      );
    },

    getPipelineExecution(executionId, pipelineId) {
      const execution = repository.get(executionId);

      if (!execution) {
        return null;
      }

      return projectPipelineExecution(execution, pipelineId);
    },

    getCurrentStage(executionId) {
      const execution = repository.get(executionId);

      if (!execution) {
        return null;
      }

      const events = execution.events.filter((event) => event.event_type === PIPELINE_TRANSITION_EVENT_TYPE);
      const latest = events[events.length - 1];
      const stageId = latest ? String(latest.payload.to_stage_id) : null;

      if (!stageId || !isPipelineStage(stageId)) {
        return null;
      }

      return stageId as DomainPipelineStage;
    },

    getStageHistory(executionId) {
      const execution = repository.get(executionId);

      if (!execution) {
        return Object.freeze([]);
      }

      const history: PipelineStageSnapshot[] = [];

      for (const event of execution.events) {
        if (event.event_type !== PIPELINE_STAGE_COMPLETED_EVENT_TYPE) {
          continue;
        }

        const stageId = String(event.payload.stage_id);

        if (!isPipelineStage(stageId)) {
          continue;
        }

        history.push(
          Object.freeze({
            execution_id: executionId,
            stage: stageId as DomainPipelineStage,
            entered_at: event.timestamp,
          }),
        );
      }

      return Object.freeze(history);
    },
  };
}

export function createPipelineCoordinatorStub(): PipelineCoordinator {
  return createPipelineCoordinator({
    executionRepository: {
      begin() {
        throw new Error('stub');
      },
      get: () => null,
      list: () => Object.freeze([]),
      transition() {
        throw new Error('stub');
      },
      appendEvent() {
        throw new Error('stub');
      },
      setOutputs() {
        throw new Error('stub');
      },
      recordMetrics() {
        throw new Error('stub');
      },
      appendDiagnostic() {
        throw new Error('stub');
      },
      finalizeCompatContext() {
        throw new Error('stub');
      },
    },
    eventDispatcher: {
      component: 'event-dispatcher',
      publish() {},
      query: () => Object.freeze([]),
      subscribe: () => ({
        subscription_id: 'stub',
        unsubscribe() {},
      }),
    },
  });
}
