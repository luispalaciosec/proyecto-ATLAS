import type { AgentRuntime } from './agent-runtime.js';

export function createAgentRuntime(): AgentRuntime {
  return {
    component: 'agent-runtime',
    getExecution() {
      return null;
    },
    listExecutions() {
      return Object.freeze([]);
    },
  };
}
