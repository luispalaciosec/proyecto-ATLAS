import type { AtlasTimestamp } from '@atlas/core';

import type { ArtifactExecutor } from '../contracts/artifact-executor.js';
import type { ExecutionOutput } from '../contracts/execution-output.js';
import type { ExecutionResult } from '../contracts/execution-result.js';
import type { ExecuteParams } from '../contracts/runtime.js';
import { createExecutionContext } from '../context/execution-context.js';
import {
  EXECUTION_COMPLETED_EVENT_TYPE,
  EXECUTION_FAILED_EVENT_TYPE,
  EXECUTION_STARTED_EVENT_TYPE,
} from '../definitions/execution-events.js';
import type { EventDispatcher } from '../events/event-dispatcher.js';
import { createRuntimeEventEnvelope } from '../events/event-dispatcher.factory.js';
import type { ExecutionLifecycleStage } from '../lifecycle/types.js';
import { createExecutorRegistry } from '../registries/executor-registry.js';
import { createDefaultArtifactExecutors } from '../executors/default-executors.js';

import type { ExecutionRepository } from './execution-repository.js';
import { buildCompatExecutionContext } from './execution-repository.js';

export interface ExecutionFlowDependencies {
  readonly executionRepository: ExecutionRepository;
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

  deps.executionRepository.begin(params, executionId);

  for (const stage of EXECUTION_PATH) {
    if (stage === 'running') {
      const startedAt = timestamp(deps.clock);
      deps.executionRepository.recordMetrics(executionId, { started_at: startedAt });
      deps.executionRepository.transition(executionId, stage, {}, deps.eventDispatcher);

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

      const execution = deps.executionRepository.get(executionId)!;
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

        const output = executor.execute(artifact, execution.context);
        outputs.push(output);

        if (!output.success) {
          success = false;
        }
      }

      deps.executionRepository.setOutputs(executionId, outputs);
      deps.executionRepository.transition(
        executionId,
        'completing',
        { output_count: outputs.length, success },
        deps.eventDispatcher,
      );

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

      deps.executionRepository.transition(
        executionId,
        'completed',
        { success, output_count: outputs.length },
        deps.eventDispatcher,
      );
      deps.executionRepository.transition(
        executionId,
        'archived',
        { success, output_count: outputs.length },
        deps.eventDispatcher,
      );

      const completedAt = timestamp(deps.clock);
      deps.executionRepository.recordMetrics(executionId, { completed_at: completedAt });

      const compatContext = buildCompatExecutionContext(
        deps.executionRepository.get(executionId)!,
        outputs,
        success,
        startedAt,
        completedAt,
      );

      const result = Object.freeze({
        context: compatContext,
        success: success && compatContext.lifecycle === 'dispose',
      });

      deps.executionRepository.finalizeCompatContext(executionId, compatContext, result);

      return result;
    }

    deps.executionRepository.transition(executionId, stage, {}, deps.eventDispatcher);
  }

  throw new Error(`Execution flow did not finalize for "${executionId}"`);
}
