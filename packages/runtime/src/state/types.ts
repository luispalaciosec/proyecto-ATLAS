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
