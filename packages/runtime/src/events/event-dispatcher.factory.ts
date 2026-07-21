import type { EventBus } from '@atlas/events';
import { createEventPublisher } from '@atlas/events';
import { Identifier } from '@atlas/core';

import type { ExecutionRepository } from '../engine/execution-repository.js';
import { RuntimeCompletedEvent } from '../definitions/runtime-completed.js';
import { RuntimeStartedEvent } from '../definitions/runtime-started.js';

import type { EventDispatcher } from './event-dispatcher.js';
import type { RuntimeEventEnvelope, RuntimeEventFilter, RuntimeEventHandler, RuntimeEventSubscription } from './types.js';

export interface CreateEventDispatcherOptions {
  readonly eventBus?: EventBus;
  readonly moduleId?: string;
  readonly clock?: () => string;
  readonly executionRepository?: ExecutionRepository;
}

function matchesFilter(event: RuntimeEventEnvelope, filter: RuntimeEventFilter): boolean {
  if (filter.execution_id !== undefined && event.execution_id !== filter.execution_id) {
    return false;
  }

  if (filter.event_type !== undefined && event.event_type !== filter.event_type) {
    return false;
  }

  if (filter.correlation_id !== undefined && event.correlation_id !== filter.correlation_id) {
    return false;
  }

  return true;
}

export function createEventDispatcher(options: CreateEventDispatcherOptions = {}): EventDispatcher {
  const handlers = new Set<RuntimeEventHandler>();
  const repository = options.executionRepository;
  const moduleId = options.moduleId ?? '@atlas/runtime';
  const publisher = options.eventBus ? createEventPublisher(options.eventBus, moduleId) : undefined;

  function bridgeToEventBus(event: RuntimeEventEnvelope): void {
    if (!publisher) {
      return;
    }

    const payload = event.payload;

    switch (event.event_type) {
      case 'execution.started':
        publisher.publish(RuntimeStartedEvent, {
          session_id: String(payload.execution_id),
          lifecycle: 'start',
          artifact_count: Number(payload.artifact_count),
        });
        break;
      case 'execution.completed':
        publisher.publish(RuntimeCompletedEvent, {
          success: Boolean(payload.success),
          session_id: String(payload.execution_id),
          lifecycle: 'dispose',
          artifact_count: Number(payload.artifact_count ?? 0),
          output_count: Number(payload.output_count),
        });
        break;
      case 'execution.failed':
        publisher.publish(RuntimeCompletedEvent, {
          success: false,
          session_id: String(payload.execution_id),
          lifecycle: 'dispose',
          artifact_count: Number(payload.artifact_count ?? 0),
          output_count: Number(payload.output_count),
        });
        break;
      default:
        break;
    }
  }

  function recordOnAggregate(event: RuntimeEventEnvelope): void {
    if (!repository) {
      return;
    }

    const execution = repository.get(event.execution_id);

    if (!execution || execution.events.some((existing) => existing.event_id === event.event_id)) {
      return;
    }

    repository.appendEvent(event.execution_id, event);
  }

  return {
    component: 'event-dispatcher',

    publish(event: RuntimeEventEnvelope): void {
      const frozen = Object.freeze({ ...event, payload: Object.freeze({ ...event.payload }) });

      recordOnAggregate(frozen);

      for (const handler of handlers) {
        handler(frozen);
      }

      bridgeToEventBus(frozen);
    },

    query(filter: RuntimeEventFilter = {}): readonly RuntimeEventEnvelope[] {
      if (!repository) {
        return Object.freeze([]);
      }

      const events = filter.execution_id
        ? [...(repository.get(filter.execution_id)?.events ?? [])]
        : repository.list().flatMap((execution) => [...execution.events]);

      return Object.freeze(events.filter((event) => matchesFilter(event, filter)));
    },

    subscribe(handler: RuntimeEventHandler): RuntimeEventSubscription {
      handlers.add(handler);
      const subscriptionId = Identifier.create(`subscription.${handlers.size}`).toJSON();

      return Object.freeze({
        subscription_id: subscriptionId,
        unsubscribe() {
          handlers.delete(handler);
        },
      });
    },
  };
}

export function createRuntimeEventEnvelope(
  params: Omit<RuntimeEventEnvelope, 'timestamp'> & { clock?: () => string },
): RuntimeEventEnvelope {
  const clock = params.clock ?? (() => new Date().toISOString());

  return Object.freeze({
    event_id: params.event_id,
    event_type: params.event_type,
    event_version: params.event_version,
    timestamp: clock(),
    correlation_id: params.correlation_id,
    execution_id: params.execution_id,
    payload: Object.freeze({ ...params.payload }),
  });
}
