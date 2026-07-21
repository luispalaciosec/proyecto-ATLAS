import type { AtlasTimestamp } from '@atlas/core';

import type { ArtifactExecutor } from '../contracts/artifact-executor.js';
import type { ExecutionOutput } from '../contracts/execution-output.js';
import type { ExecutionResult } from '../contracts/execution-result.js';
import type { ExecuteParams } from '../contracts/runtime.js';
import {
  createExecutionContext,
  updateExecutionContext,
} from '../context/execution-context.js';
import {
  EXECUTION_COMPLETED_EVENT_TYPE,
  EXECUTION_FAILED_EVENT_TYPE,
  EXECUTION_STARTED_EVENT_TYPE,
} from '../definitions/execution-events.js';
import type { EventDispatcher } from '../events/event-dispatcher.js';
import { createRuntimeEventEnvelope } from '../events/event-dispatcher.factory.js';
import type { LifecycleManager } from '../lifecycle/lifecycle-manager.js';
import type { ExecutionLifecycleStage } from '../lifecycle/types.js';
import { createExecutorRegistry } from '../registries/executor-registry.js';
import type { StateManager } from '../state/state-manager.js';
import { createDefaultArtifactExecutors } from '../executors/default-executors.js';

export interface ExecutionFlowDependencies {
  readonly lifecycleManager: LifecycleManager;
  readonly stateManager: StateManager;
  readonly eventDispatcher: EventDispatcher;
  readonly executors?: readonly ArtifactExecutor[];
  readonly clock?: () => string;
}

const EXECUTION_PATH: readonly ExecutionLifecycleStage[] = [
  'initialized',
  'prepared',
  'running',
  'completing',
  'completed',
  'archived',
];

function timestamp(clock?: () => string): AtlasTimestamp {
  return (clock?.() ?? new Date().toISOString()) as AtlasTimestamp;
}

function transitionExecutionState(
  deps: ExecutionFlowDependencies,
  executionId: string,
  stage: ExecutionLifecycleStage,
  patch?: Parameters<StateManager['transitionExecution']>[2],
): void {
  deps.lifecycleManager.transition(executionId, stage);
  deps.stateManager.transitionExecution(executionId, stage, patch);
}

function buildCompatExecutionContext(
  executionId: string,
  params: ExecuteParams,
  outputs: readonly ExecutionOutput[],
  success: boolean,
  startedAt: AtlasTimestamp,
  completedAt: AtlasTimestamp,
): ExecutionResult['context'] {
  let context = createExecutionContext({
    session_id: executionId,
    workspace: params.workspace,
    artifacts: params.artifacts,
    metadata: params.metadata,
  });

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

export async function runExecutionFlow(
  params: ExecuteParams,
  deps: ExecutionFlowDependencies,
): Promise<ExecutionResult> {
  const clock = deps.clock ?? (() => new Date().toISOString());
  const contextSeed = createExecutionContext({
    workspace: params.workspace,
    artifacts: params.artifacts,
    metadata: params.metadata,
  });
  const executionId = contextSeed.session_id.toJSON();
  const correlationId = executionId;
  const registry = createExecutorRegistry(deps.executors ?? createDefaultArtifactExecutors());

  deps.lifecycleManager.createExecution(executionId);
  deps.stateManager.initializeExecution(executionId, {
    artifact_count: params.artifacts.length,
  });

  for (const stage of EXECUTION_PATH) {
    if (stage === 'running') {
      const startedAt = timestamp(deps.clock);
      transitionExecutionState(deps, executionId, stage);

      deps.eventDispatcher.publish(
        createRuntimeEventEnvelope({
          event_id: `${executionId}:execution.started`,
          event_type: EXECUTION_STARTED_EVENT_TYPE,
          event_version: '1.0.0',
          correlation_id: correlationId,
          execution_id: executionId,
          clock,
          payload: {
            execution_id: executionId,
            correlation_id: correlationId,
            stage: 'running',
            artifact_count: params.artifacts.length,
          },
        }),
      );

      const outputs: ExecutionOutput[] = [];
      let success = true;

      for (const artifact of params.artifacts) {
        const executor = registry.resolve(artifact.kind);

        if (!executor) {
          success = false;
          outputs.push(
            Object.freeze({
              artifact_id: artifact.id,
              kind: artifact.kind,
              result: {
                error: `No executor registered for artifact kind "${artifact.kind}"`,
              },
              success: false,
            }),
          );
          continue;
        }

        const output = executor.execute(artifact, contextSeed);
        outputs.push(output);

        if (!output.success) {
          success = false;
        }
      }

      transitionExecutionState(deps, executionId, 'completing', {
        output_count: outputs.length,
        success,
      });

      if (success) {
        deps.eventDispatcher.publish(
          createRuntimeEventEnvelope({
            event_id: `${executionId}:execution.completed`,
            event_type: EXECUTION_COMPLETED_EVENT_TYPE,
            event_version: '1.0.0',
            correlation_id: correlationId,
            execution_id: executionId,
            clock,
            payload: {
              execution_id: executionId,
              correlation_id: correlationId,
              stage: 'completing',
              success: true,
              artifact_count: params.artifacts.length,
              output_count: outputs.length,
            },
          }),
        );
      } else {
        deps.eventDispatcher.publish(
          createRuntimeEventEnvelope({
            event_id: `${executionId}:execution.failed`,
            event_type: EXECUTION_FAILED_EVENT_TYPE,
            event_version: '1.0.0',
            correlation_id: correlationId,
            execution_id: executionId,
            clock,
            payload: {
              execution_id: executionId,
              correlation_id: correlationId,
              stage: 'completing',
              reason: 'artifact_execution_failed',
              artifact_count: params.artifacts.length,
              output_count: outputs.length,
            },
          }),
        );
      }

      transitionExecutionState(deps, executionId, 'completed', { success, output_count: outputs.length });
      transitionExecutionState(deps, executionId, 'archived', { success, output_count: outputs.length });

      const completedAt = timestamp(deps.clock);
      const compatContext = buildCompatExecutionContext(
        executionId,
        params,
        outputs,
        success,
        startedAt,
        completedAt,
      );

      return Object.freeze({
        context: compatContext,
        success: success && compatContext.lifecycle === 'dispose',
      });
    }

    transitionExecutionState(deps, executionId, stage);
  }

  throw new Error(`Execution flow did not finalize for "${executionId}"`);
}
