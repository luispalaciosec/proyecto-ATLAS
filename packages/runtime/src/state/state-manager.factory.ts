import { isValidLifecycleTransition } from '../lifecycle/transitions.js';
import type { ExecutionLifecycleStage } from '../lifecycle/types.js';
import { InvalidStateTransitionError, type ExecutionStateValue } from './types.js';
import type { StateManager } from './state-manager.js';
import type { EventDispatcher } from '../events/event-dispatcher.js';
import type { StateScope, StateSnapshot, StateTransition } from './types.js';

export interface CreateStateManagerOptions {
  readonly clock?: () => string;
  readonly eventDispatcher?: EventDispatcher;
}

function asExecutionState(value: Readonly<Record<string, unknown>>): ExecutionStateValue {
  return value as unknown as ExecutionStateValue;
}

export function createStateManager(options: CreateStateManagerOptions = {}): StateManager {
  const states = new Map<string, StateSnapshot>();
  const histories = new Map<string, StateTransition[]>();
  const clock = options.clock ?? (() => new Date().toISOString());

  function key(scope: StateScope, entityId: string): string {
    return `${scope}:${entityId}`;
  }

  function validateExecutionTransition(
    entityId: string,
    from: ExecutionStateValue,
    toStage: ExecutionLifecycleStage,
  ): void {
    if (!isValidLifecycleTransition(from.stage, toStage)) {
      throw new InvalidStateTransitionError(
        'execution',
        entityId,
        from as unknown as Readonly<Record<string, unknown>>,
        {
          ...from,
          stage: toStage,
          status: toStage,
        } as Readonly<Record<string, unknown>>,
      );
    }
  }

  return {
    component: 'state-manager',

    initializeExecution(
      executionId: string,
      initial: Pick<ExecutionStateValue, 'artifact_count'>,
    ): StateSnapshot {
      const value = Object.freeze({
        stage: 'created',
        status: 'created',
        success: null,
        artifact_count: initial.artifact_count,
        output_count: 0,
      });

      const snapshot = Object.freeze({
        scope: 'execution' as const,
        entity_id: executionId,
        execution_id: executionId,
        value,
        updated_at: clock(),
      });

      states.set(key('execution', executionId), snapshot);
      histories.set(key('execution', executionId), []);
      return snapshot;
    },

    transitionExecution(
      executionId: string,
      nextStage: ExecutionLifecycleStage,
      patch: Partial<Pick<ExecutionStateValue, 'success' | 'output_count'>> = {},
    ): StateSnapshot {
      const stateKey = key('execution', executionId);
      const current = states.get(stateKey);

      if (!current) {
        throw new InvalidStateTransitionError('execution', executionId, {}, { stage: nextStage });
      }

      const from = asExecutionState(current.value);
      validateExecutionTransition(executionId, from, nextStage);

      const nextValue = Object.freeze({
        stage: nextStage,
        status: nextStage,
        success: patch.success ?? from.success,
        artifact_count: from.artifact_count,
        output_count: patch.output_count ?? from.output_count,
      });

      const snapshot = Object.freeze({
        scope: 'execution' as const,
        entity_id: executionId,
        execution_id: executionId,
        value: nextValue,
        updated_at: clock(),
      });

      const transition = Object.freeze({
        from: current.value,
        to: nextValue,
        occurred_at: clock(),
      });

      states.set(stateKey, snapshot);
      histories.get(stateKey)?.push(transition);
      return snapshot;
    },

    getState(scope: StateScope, entityId: string): StateSnapshot | null {
      return states.get(key(scope, entityId)) ?? null;
    },

    getTransitionHistory(scope: StateScope, entityId: string): readonly StateTransition[] {
      return Object.freeze([...(histories.get(key(scope, entityId)) ?? [])]);
    },
  };
}
