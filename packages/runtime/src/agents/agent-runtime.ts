import type { AgentExecutionSnapshot } from './types.js';

/**
 * @see ATLAS-RUNTIME-009 §3 Agent Runtime
 */
export interface AgentRuntime {
  readonly component: 'agent-runtime';

  getExecution(agentExecutionId: string): AgentExecutionSnapshot | null;

  listExecutions(taskId: string): readonly AgentExecutionSnapshot[];
}
