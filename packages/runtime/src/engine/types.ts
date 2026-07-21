import type { Identifier } from '@atlas/core';

/**
 * @see ATLAS-RUNTIME-001 Execution Model
 */
export interface ExecutionIntent {
  readonly intent_id: Identifier;
  readonly correlation_id: string;
}

export interface ExecutionUnit {
  readonly execution_id: Identifier;
  readonly intent: ExecutionIntent;
}

export type ExecutionStatus = 'pending' | 'active' | 'completed' | 'failed' | 'cancelled';

export interface ExecutionSnapshot {
  readonly execution_id: string;
  readonly status: ExecutionStatus;
}
