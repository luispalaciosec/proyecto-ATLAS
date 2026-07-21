import type { ExecutionRepository } from '../engine/execution-repository.js';
import type { ExecutionLifecycleStage } from '../lifecycle/types.js';
import { InvalidStateTransitionError, type ExecutionStateValue } from './types.js';
import type { StateManager } from './state-manager.js';
import type { StateScope, StateSnapshot, StateTransition } from './types.js';

export interface CreateStateManagerOptions {
  readonly clock?: () => string;
  readonly executionRepository?: ExecutionRepository;
}

function toStateSnapshot(executionId: string, updatedAt: string, execution: NonNullable<ReturnType<ExecutionRepository['get']>>): StateSnapshot {
  return Object.freeze({
    scope: 'execution' as const,
    entity_id: executionId,
    execution_id: executionId,
    value: execution.state.value as unknown as Readonly<Record<string, unknown>>,
    updated_at: updatedAt,
  });
}

export function createStateManager(options: CreateStateManagerOptions = {}): StateManager {
  const repository = options.executionRepository;
  const clock = options.clock ?? (() => new Date().toISOString());

  return {
    component: 'state-manager',

    initializeExecution(
      executionId: string,
      initial: Pick<ExecutionStateValue, 'artifact_count'>,
    ): StateSnapshot {
      const execution = repository?.get(executionId);

      if (!execution) {
        throw new InvalidStateTransitionError('execution', executionId, {}, { stage: 'created' });
      }

      if (execution.state.value.artifact_count !== initial.artifact_count) {
        throw new Error(`Execution aggregate state mismatch for ${executionId}`);
      }

      return toStateSnapshot(executionId, clock(), execution);
    },

    transitionExecution(
      executionId: string,
      nextStage: ExecutionLifecycleStage,
      patch: Partial<Pick<ExecutionStateValue, 'success' | 'output_count'>> = {},
    ): StateSnapshot {
      if (!repository) {
        throw new Error('ExecutionRepository is required for state transitions');
      }

      const execution = repository.get(executionId);

      if (!execution) {
        throw new InvalidStateTransitionError('execution', executionId, {}, { stage: nextStage });
      }

      const updated = repository.transition(executionId, nextStage, patch);
      return toStateSnapshot(executionId, clock(), updated);
    },

    getState(scope: StateScope, entityId: string): StateSnapshot | null {
      if (scope !== 'execution' || !repository) {
        return null;
      }

      const execution = repository.get(entityId);

      if (!execution) {
        return null;
      }

      return toStateSnapshot(entityId, clock(), execution);
    },

    getTransitionHistory(scope: StateScope, entityId: string): readonly StateTransition[] {
      if (scope !== 'execution' || !repository) {
        return Object.freeze([]);
      }

      return repository.get(entityId)?.state.transitions ?? Object.freeze([]);
    },
  };
}
