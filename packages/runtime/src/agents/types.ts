/**
 * @see ATLAS-RUNTIME-009 §3 Agent Runtime
 */
export const AGENT_EXECUTION_STATES = [
  'assigned',
  'running',
  'waiting',
  'completed',
  'failed',
] as const;

export type AgentExecutionState = (typeof AGENT_EXECUTION_STATES)[number];

export interface AgentExecutionSnapshot {
  readonly agent_execution_id: string;
  readonly agent_id: string;
  readonly task_id: string;
  readonly execution_id: string;
  readonly state: AgentExecutionState;
}
