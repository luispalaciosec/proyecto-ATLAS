import { createEventType, defineEvent } from '@atlas/events';

import type { RuntimeLifecycle } from '../contracts/runtime-lifecycle.js';

/**
 * @see SDK-204 §8 Runtime Events — runtime.started
 */
export interface RuntimeStartedPayload {
  readonly session_id: string;
  readonly lifecycle: RuntimeLifecycle;
  readonly artifact_count: number;
}

export const RUNTIME_STARTED_EVENT_TYPE = createEventType('runtime.started');

export const RuntimeStartedEvent = defineEvent<RuntimeStartedPayload>({
  type: RUNTIME_STARTED_EVENT_TYPE,
  version: '1.0.0',
});
