import { createEventType } from '../contracts/event.js';
import { defineEvent } from '../event/define-event.js';

/**
 * Payload for compiler completion events.
 * @see SDK-204 §8 Compiler Events — compiler.completed
 */
export interface CompilerCompletedPayload {
  readonly success: boolean;
  readonly lifecycle: string;
  readonly artifact_count: number;
  readonly unit_count: number;
  readonly graph_id: string | null;
}

export const COMPILER_COMPLETED_EVENT_TYPE = createEventType('compiler.completed');

export const CompilerCompletedEvent = defineEvent<CompilerCompletedPayload>({
  type: COMPILER_COMPLETED_EVENT_TYPE,
  version: '1.0.0',
});
