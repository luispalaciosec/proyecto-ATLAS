import type { AtlasTimestamp } from '@atlas/core';
import type { EventBus } from '@atlas/events';
import { createEventPublisher } from '@atlas/events';

import { createExecutionContext, updateExecutionContext } from '../context/execution-context.js';
import type { ArtifactExecutor } from '../contracts/artifact-executor.js';
import type { ExecutionOutput } from '../contracts/execution-output.js';
import type { ExecutionResult } from '../contracts/execution-result.js';
import type { ExecuteParams, Runtime } from '../contracts/runtime.js';
import { RuntimeCompletedEvent } from '../definitions/runtime-completed.js';
import { RuntimeStartedEvent } from '../definitions/runtime-started.js';
import { createDefaultArtifactExecutors } from '../executors/default-executors.js';
import { createExecutorRegistry, type ExecutorRegistry } from '../registries/executor-registry.js';

export interface AtlasRuntimeOptions {
  readonly eventBus?: EventBus;
  readonly executors?: readonly ArtifactExecutor[];
}

function createTimestamp(): AtlasTimestamp {
  return new Date().toISOString() as AtlasTimestamp;
}

export class AtlasRuntime implements Runtime {
  readonly module = '@atlas/runtime' as const;
  readonly #eventBus?: EventBus;
  readonly #registry: ExecutorRegistry;

  constructor(options: AtlasRuntimeOptions = {}) {
    this.#eventBus = options.eventBus;
    this.#registry = createExecutorRegistry(options.executors ?? createDefaultArtifactExecutors());
  }

  async execute(params: ExecuteParams): Promise<ExecutionResult> {
    let context = createExecutionContext({
      workspace: params.workspace,
      artifacts: params.artifacts,
      metadata: params.metadata,
    });

    context = updateExecutionContext(context, { lifecycle: 'initialize' });
    context = updateExecutionContext(context, { lifecycle: 'load' });
    context = updateExecutionContext(context, {
      lifecycle: 'start',
      started_at: createTimestamp(),
    });

    if (this.#eventBus) {
      const publisher = createEventPublisher(this.#eventBus, '@atlas/runtime');
      publisher.publish(RuntimeStartedEvent, {
        session_id: context.session_id.toJSON(),
        lifecycle: context.lifecycle,
        artifact_count: context.artifacts.length,
      });
    }

    context = updateExecutionContext(context, { lifecycle: 'execute' });

    const outputs: ExecutionOutput[] = [];
    let success = true;

    for (const artifact of context.artifacts) {
      const executor = this.#registry.resolve(artifact.kind);

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

      const output = executor.execute(artifact, context);
      outputs.push(output);

      if (!output.success) {
        success = false;
      }
    }

    context = updateExecutionContext(context, {
      lifecycle: success ? 'monitor' : 'failed',
      outputs,
    });

    if (success) {
      context = updateExecutionContext(context, { lifecycle: 'stop' });
    }

    context = updateExecutionContext(context, {
      lifecycle: 'dispose',
      completed_at: createTimestamp(),
    });

    const result = Object.freeze({
      context,
      success: success && context.lifecycle === 'dispose',
    });

    if (this.#eventBus) {
      const publisher = createEventPublisher(this.#eventBus, '@atlas/runtime');
      publisher.publish(RuntimeCompletedEvent, {
        success: result.success,
        session_id: context.session_id.toJSON(),
        lifecycle: context.lifecycle,
        artifact_count: context.artifacts.length,
        output_count: context.outputs.length,
      });
    }

    return result;
  }
}

export function createAtlasRuntime(options: AtlasRuntimeOptions = {}): AtlasRuntime {
  return new AtlasRuntime(options);
}
