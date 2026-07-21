import type { WorkflowSnapshot, WorkflowStageSnapshot } from '../workflow/types.js';

/**
 * @see ATLAS-RUNTIME-100 §7 Workflow API
 */
export interface WorkflowApi {
  getWorkflow(workflowId: string): WorkflowSnapshot | null;

  listWorkflows(executionId: string): readonly WorkflowSnapshot[];

  getStages(workflowId: string): readonly WorkflowStageSnapshot[];
}
