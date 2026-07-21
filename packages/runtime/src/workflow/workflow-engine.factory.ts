import type { WorkflowEngine } from './workflow-engine.js';

export function createWorkflowEngine(): WorkflowEngine {
  return {
    component: 'workflow-engine',
    getWorkflow() {
      return null;
    },
    listWorkflows() {
      return Object.freeze([]);
    },
    getStages() {
      return Object.freeze([]);
    },
  };
}
