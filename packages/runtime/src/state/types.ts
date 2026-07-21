import type { ExecutionLifecycleStage } from '../lifecycle/types.js';

/**
 * @see ATLAS-RUNTIME-003 State Model
 */
export const STATE_SCOPES = [
  'execution',
  'workflow',
  'task',
  'agent',
  'planning',
  'reasoning',
  'context',
  'knowledge_projection',
] as const;

export type StateScope = (typeof STATE_SCOPES)[number];

export interface ExecutionStateValue {
  readonly stage: ExecutionLifecycleStage;
  readonly status: ExecutionLifecycleStage;
  readonly success: boolean | null;
  readonly artifact_count: number;
  readonly output_count: number;
}

export interface StateSnapshot {
  readonly scope: StateScope;
  readonly entity_id: string;
  readonly execution_id: string;
  readonly value: Readonly<Record<string, unknown>>;
  readonly updated_at: string;
}

export interface StateTransition {
  readonly from: Readonly<Record<string, unknown>>;
  readonly to: Readonly<Record<string, unknown>>;
  readonly occurred_at: string;
}

export class InvalidStateTransitionError extends Error {
  readonly scope: StateScope;
  readonly entity_id: string;
  readonly from: Readonly<Record<string, unknown>>;
  readonly to: Readonly<Record<string, unknown>>;

  constructor(
    scope: StateScope,
    entityId: string,
    from: Readonly<Record<string, unknown>>,
    to: Readonly<Record<string, unknown>>,
  ) {
    super(`Invalid state transition for ${scope}:${entityId}`);
    this.name = 'InvalidStateTransitionError';
    this.scope = scope;
    this.entity_id = entityId;
    this.from = from;
    this.to = to;
  }
}
