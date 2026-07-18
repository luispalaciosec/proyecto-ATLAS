import { createEventType, defineEvent } from '@atlas/events';

import type { RuntimeLifecycle } from '../contracts/runtime-lifecycle.js';

/**
 * @see ATLAS-DOM-009 §23 — ExecutionCompleted
 * @see SDK-204 §8 Runtime Events (completed maps to execution finish in Sprint 5)
 */
export interface RuntimeCompletedPayload {
  readonly success: boolean;
  readonly session_id: string;
  readonly lifecycle: RuntimeLifecycle;
  readonly artifact_count: number;
  readonly output_count: number;
}

export const RUNTIME_COMPLETED_EVENT_TYPE = createEventType('runtime.completed');

export const RuntimeCompletedEvent = defineEvent<RuntimeCompletedPayload>({
  type: RUNTIME_COMPLETED_EVENT_TYPE,
  version: '1.0.0',
});
