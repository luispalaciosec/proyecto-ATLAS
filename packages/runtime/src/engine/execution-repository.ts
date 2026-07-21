import type { AtlasTimestamp } from '@atlas/core';

import type { ExecutionOutput } from '../contracts/execution-output.js';
import type { ExecutionResult } from '../contracts/execution-result.js';
import type { ExecuteParams } from '../contracts/runtime.js';
import { updateExecutionContext } from '../context/execution-context.js';
import type { EventDispatcher } from '../events/event-dispatcher.js';
import type { RuntimeEventEnvelope } from '../events/types.js';
import { isValidLifecycleTransition } from '../lifecycle/transitions.js';
import type { ExecutionLifecycleStage } from '../lifecycle/types.js';
import { InvalidLifecycleTransitionError } from '../lifecycle/types.js';
import type { ExecutionStateValue, StateTransition } from '../state/types.js';
import { InvalidStateTransitionError } from '../state/types.js';

import {
  createInitialExecutionAggregate,
  withExecutionContext,
  withExecutionDiagnostics,
  withExecutionEvent,
  withExecutionLifecycle,
  withExecutionMetrics,
  withExecutionOutputs,
  withExecutionResult,
  withExecutionState,
  type Execution,
  type ExecutionDiagnosticRecord,
} from './execution-aggregate.js';

export interface ExecutionRepository {
  begin(params: ExecuteParams, contextSeedExecutionId: string): Execution;

  get(executionId: string): Execution | null;

  list(): readonly Execution[];

  transition(
    executionId: string,
    toStage: ExecutionLifecycleStage,
    patch?: Partial<Pick<ExecutionStateValue, 'success' | 'output_count'>>,
    eventDispatcher?: EventDispatcher,
  ): Execution;

  appendEvent(executionId: string, event: RuntimeEventEnvelope): Execution;

  setOutputs(executionId: string, outputs: readonly ExecutionOutput[]): Execution;

  recordMetrics(
    executionId: string,
    patch: Partial<{
      started_at: string;
      completed_at: string;
      output_count: number;
    }>,
  ): Execution;

  appendDiagnostic(executionId: string, record: ExecutionDiagnosticRecord): Execution;

  finalizeCompatContext(
    executionId: string,
    compatContext: ExecutionResult['context'],
    result: ExecutionResult,
  ): Execution;
}

export interface CreateExecutionRepositoryOptions {
  readonly clock?: () => string;
}

export function createExecutionRepository(
  options: CreateExecutionRepositoryOptions = {},
): ExecutionRepository {
  const store = new Map<string, Execution>();
  const clock = options.clock ?? (() => new Date().toISOString());

  function requireExecution(executionId: string): Execution {
    const execution = store.get(executionId);

    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    return execution;
  }

  function save(execution: Execution): Execution {
    store.set(execution.identity.execution_id, execution);
    return execution;
  }

  function publishStateChanged(
    execution: Execution,
    fromStage: ExecutionLifecycleStage,
    toStage: ExecutionLifecycleStage,
    eventDispatcher?: EventDispatcher,
  ): void {
    if (!eventDispatcher) {
      return;
    }

    eventDispatcher.publish(
      Object.freeze({
        event_id: `${execution.identity.execution_id}:execution.state_changed:${execution.lifecycle.history.length}`,
        event_type: 'execution.state_changed',
        event_version: '1.0.0',
        timestamp: clock(),
        correlation_id: execution.identity.correlation_id,
        execution_id: execution.identity.execution_id,
        payload: Object.freeze({
          execution_id: execution.identity.execution_id,
          correlation_id: execution.identity.correlation_id,
          from_stage: fromStage,
          to_stage: toStage,
        }),
      }),
    );
  }

  return {
    begin(params, contextSeedExecutionId) {
      const execution = createInitialExecutionAggregate(params, contextSeedExecutionId, clock);
      return save(execution);
    },

    get(executionId) {
      return store.get(executionId) ?? null;
    },

    list() {
      return Object.freeze([...store.values()]);
    },

    transition(executionId, toStage, patch = {}, eventDispatcher) {
      const current = requireExecution(executionId);
      const fromStage = current.lifecycle.current;

      const nextStateValue = Object.freeze({
        stage: toStage,
        status: toStage,
        success: patch.success ?? current.state.value.success,
        artifact_count: current.state.value.artifact_count,
        output_count: patch.output_count ?? current.state.value.output_count,
      });

      if (!isValidLifecycleTransition(fromStage, toStage)) {
        throw new InvalidLifecycleTransitionError(executionId, fromStage, toStage);
      }

      if (!isValidLifecycleTransition(current.state.value.stage, toStage)) {
        throw new InvalidStateTransitionError(
          'execution',
          executionId,
          current.state.value as unknown as Readonly<Record<string, unknown>>,
          nextStateValue as unknown as Readonly<Record<string, unknown>>,
        );
      }

      const lifecycleSnapshot = Object.freeze({
        execution_id: executionId,
        stage: toStage,
        entered_at: clock(),
      });

      let next = withExecutionLifecycle(current, lifecycleSnapshot);

      const transition = Object.freeze({
        from: current.state.value as unknown as Readonly<Record<string, unknown>>,
        to: nextStateValue as unknown as Readonly<Record<string, unknown>>,
        occurred_at: clock(),
      }) as StateTransition;

      next = withExecutionState(next, nextStateValue, transition);
      next = withExecutionDiagnostics(
        next,
        Object.freeze({
          diagnostic_id: `${executionId}:lifecycle:${toStage}`,
          level: 'info',
          message: `lifecycle_${toStage}`,
          recorded_at: clock(),
        }),
      );

      save(next);

      publishStateChanged(current, fromStage, toStage, eventDispatcher);

      return requireExecution(executionId);
    },

    appendEvent(executionId, event) {
      const current = requireExecution(executionId);
      return save(withExecutionEvent(current, event));
    },

    setOutputs(executionId, outputs) {
      const current = requireExecution(executionId);
      return save(
        withExecutionOutputs(
          withExecutionMetrics(current, { output_count: outputs.length }),
          outputs,
        ),
      );
    },

    recordMetrics(executionId, patch) {
      const current = requireExecution(executionId);
      const startedAt = patch.started_at ?? current.metrics.started_at;
      const completedAt = patch.completed_at ?? current.metrics.completed_at;
      const durationMs =
        startedAt && completedAt
          ? new Date(completedAt).getTime() - new Date(startedAt).getTime()
          : current.metrics.duration_ms;

      return save(
        withExecutionMetrics(current, {
          ...patch,
          duration_ms: durationMs,
        }),
      );
    },

    appendDiagnostic(executionId, record) {
      return save(withExecutionDiagnostics(requireExecution(executionId), record));
    },

    finalizeCompatContext(executionId, compatContext, result) {
      let execution = requireExecution(executionId);
      execution = withExecutionContext(execution, compatContext);
      execution = withExecutionResult(execution, result);
      return save(execution);
    },
  };
}

export function buildCompatExecutionContext(
  execution: Execution,
  outputs: readonly ExecutionOutput[],
  success: boolean,
  startedAt: AtlasTimestamp,
  completedAt: AtlasTimestamp,
): ExecutionResult['context'] {
  let context = execution.context;

  context = updateExecutionContext(context, { lifecycle: 'initialize' });
  context = updateExecutionContext(context, { lifecycle: 'load' });
  context = updateExecutionContext(context, { lifecycle: 'start', started_at: startedAt });
  context = updateExecutionContext(context, { lifecycle: 'execute' });
  context = updateExecutionContext(context, {
    lifecycle: success ? 'monitor' : 'failed',
    outputs,
  });

  if (success) {
    context = updateExecutionContext(context, { lifecycle: 'stop' });
  }

  return updateExecutionContext(context, {
    lifecycle: 'dispose',
    completed_at: completedAt,
  });
}
