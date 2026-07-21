import type { EventDispatcher } from '../events/event-dispatcher.js';
import type { LifecycleManager } from './lifecycle-manager.js';
import type { ExecutionLifecycleSnapshot, ExecutionLifecycleStage } from './types.js';
import { InvalidLifecycleTransitionError } from './types.js';
import { isValidLifecycleTransition } from './transitions.js';

export interface CreateLifecycleManagerOptions {
  readonly clock?: () => string;
  readonly eventDispatcher?: EventDispatcher;
  readonly correlationIdFor?: (executionId: string) => string;
}

export function createLifecycleManager(
  options: CreateLifecycleManagerOptions = {},
): LifecycleManager {
  const histories = new Map<string, ExecutionLifecycleSnapshot[]>();
  const clock = options.clock ?? (() => new Date().toISOString());

  function publishStateChanged(
    executionId: string,
    fromStage: ExecutionLifecycleStage,
    toStage: ExecutionLifecycleStage,
  ): void {
    options.eventDispatcher?.publish({
      event_id: `${executionId}:execution.state_changed:${histories.get(executionId)?.length ?? 0}`,
      event_type: 'execution.state_changed',
      event_version: '1.0.0',
      timestamp: clock(),
      correlation_id: options.correlationIdFor?.(executionId) ?? executionId,
      execution_id: executionId,
      payload: Object.freeze({
        execution_id: executionId,
        correlation_id: options.correlationIdFor?.(executionId) ?? executionId,
        from_stage: fromStage,
        to_stage: toStage,
      }),
    });
  }

  return {
    component: 'lifecycle-manager',

    createExecution(executionId: string): ExecutionLifecycleSnapshot {
      const snapshot = Object.freeze({
        execution_id: executionId,
        stage: 'created' as const,
        entered_at: clock(),
      });

      histories.set(executionId, [snapshot]);
      return snapshot;
    },

    transition(executionId: string, toStage: ExecutionLifecycleStage): ExecutionLifecycleSnapshot {
      const history = histories.get(executionId);

      if (!history || history.length === 0) {
        throw new InvalidLifecycleTransitionError(executionId, 'created', toStage);
      }

      const current = history[history.length - 1]!;

      if (!isValidLifecycleTransition(current.stage, toStage)) {
        throw new InvalidLifecycleTransitionError(executionId, current.stage, toStage);
      }

      const snapshot = Object.freeze({
        execution_id: executionId,
        stage: toStage,
        entered_at: clock(),
      });

      history.push(snapshot);
      publishStateChanged(executionId, current.stage, toStage);
      return snapshot;
    },

    getCurrentStage(executionId: string): ExecutionLifecycleStage | null {
      const history = histories.get(executionId);
      return history?.[history.length - 1]?.stage ?? null;
    },

    getHistory(executionId: string): readonly ExecutionLifecycleSnapshot[] {
      return Object.freeze([...(histories.get(executionId) ?? [])]);
    },
  };
}
