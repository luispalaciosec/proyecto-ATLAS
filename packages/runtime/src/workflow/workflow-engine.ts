import type { WorkflowSnapshot, WorkflowStageSnapshot } from './types.js';

/**
 * @see ATLAS-RUNTIME-009 §3 Workflow Engine
 */
export interface WorkflowEngine {
  readonly component: 'workflow-engine';

  getWorkflow(workflowId: string): WorkflowSnapshot | null;

  listWorkflows(executionId: string): readonly WorkflowSnapshot[];

  getStages(workflowId: string): readonly WorkflowStageSnapshot[];
}
