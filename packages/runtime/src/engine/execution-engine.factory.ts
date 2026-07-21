import type { ArtifactExecutor } from '../contracts/artifact-executor.js';
import type { EventDispatcher } from '../events/event-dispatcher.js';
import type { LifecycleManager } from '../lifecycle/lifecycle-manager.js';
import type { StateManager } from '../state/state-manager.js';

import type { ExecutionEngine } from './execution-engine.js';
import { runExecutionFlow } from './execution-flow.js';
import type { ExecutionUnit } from './types.js';

export interface CreateExecutionEngineOptions {
  readonly lifecycleManager: LifecycleManager;
  readonly stateManager: StateManager;
  readonly eventDispatcher: EventDispatcher;
  readonly executors?: readonly ArtifactExecutor[];
  readonly clock?: () => string;
}

export function createExecutionEngine(options: CreateExecutionEngineOptions): ExecutionEngine {
  const executions = new Map<string, ReturnType<LifecycleManager['getCurrentStage']>>();

  return {
    component: 'execution-engine',

    async execute(params) {
      const result = await runExecutionFlow(params, {
        lifecycleManager: options.lifecycleManager,
        stateManager: options.stateManager,
        eventDispatcher: options.eventDispatcher,
        executors: options.executors,
        clock: options.clock,
      });

      const executionId = result.context.session_id.toJSON();
      const stage = options.lifecycleManager.getCurrentStage(executionId);

      executions.set(executionId, stage);

      return result;
    },

    async createExecution(unit: ExecutionUnit) {
      options.lifecycleManager.createExecution(unit.execution_id.toJSON());
      options.stateManager.initializeExecution(unit.execution_id.toJSON(), { artifact_count: 0 });

      const snapshot = Object.freeze({
        execution_id: unit.execution_id.toJSON(),
        status: 'pending' as const,
      });

      executions.set(unit.execution_id.toJSON(), 'created');
      return snapshot;
    },

    getExecution(executionId: string) {
      const stage = options.lifecycleManager.getCurrentStage(executionId);

      if (!stage) {
        return executions.has(executionId)
          ? Object.freeze({ execution_id: executionId, status: 'pending' as const })
          : null;
      }

      const state = options.stateManager.getState('execution', executionId);
      const success = state?.value.success;

      let status: 'pending' | 'active' | 'completed' | 'failed' | 'cancelled' = 'active';

      if (stage === 'archived') {
        status = success === false ? 'failed' : 'completed';
      } else if (stage === 'created') {
        status = 'pending';
      }

      return Object.freeze({ execution_id: executionId, status });
    },
  };
}
