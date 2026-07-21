import { Identifier } from '@atlas/core';

import type { EventDispatcher } from './event-dispatcher.js';
import type { RuntimeEventHandler, RuntimeEventSubscription } from './types.js';

export function createEventDispatcher(): EventDispatcher {
  const handlers = new Set<RuntimeEventHandler>();

  return {
    component: 'event-dispatcher',
    publish() {
      // Sprint 10B
    },
    query() {
      return Object.freeze([]);
    },
    subscribe(handler: RuntimeEventHandler): RuntimeEventSubscription {
      handlers.add(handler);
      const subscriptionId = Identifier.create('subscription.runtime').toJSON();

      return Object.freeze({
        subscription_id: subscriptionId,
        unsubscribe() {
          handlers.delete(handler);
        },
      });
    },
  };
}
