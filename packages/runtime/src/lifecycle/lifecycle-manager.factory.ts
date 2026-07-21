import type { ExecutionRepository } from '../engine/execution-repository.js';
import type { EventDispatcher } from '../events/event-dispatcher.js';
import type { LifecycleManager } from './lifecycle-manager.js';
import type { ExecutionLifecycleSnapshot, ExecutionLifecycleStage } from './types.js';

export interface CreateLifecycleManagerOptions {
  readonly clock?: () => string;
  readonly eventDispatcher?: EventDispatcher;
  readonly executionRepository?: ExecutionRepository;
}

export function createLifecycleManager(
  options: CreateLifecycleManagerOptions = {},
): LifecycleManager {
  const repository = options.executionRepository;

  return {
    component: 'lifecycle-manager',

    createExecution(executionId: string): ExecutionLifecycleSnapshot {
      const execution = repository?.get(executionId);
      const snapshot = execution?.lifecycle.history[0];

      if (snapshot) {
        return snapshot;
      }

      throw new Error(`Execution aggregate not found for lifecycle create: ${executionId}`);
    },

    transition(executionId: string, toStage: ExecutionLifecycleStage): ExecutionLifecycleSnapshot {
      if (!repository) {
        throw new Error('ExecutionRepository is required for lifecycle transitions');
      }

      const execution = repository.transition(executionId, toStage, {}, options.eventDispatcher);
      const history = execution.lifecycle.history;
      return history[history.length - 1]!;
    },

    getCurrentStage(executionId: string): ExecutionLifecycleStage | null {
      return repository?.get(executionId)?.lifecycle.current ?? null;
    },

    getHistory(executionId: string): readonly ExecutionLifecycleSnapshot[] {
      return repository?.get(executionId)?.lifecycle.history ?? Object.freeze([]);
    },
  };
}
