import type { WorkflowValidationIssue } from './workflow-model.js';

export function createWorkflowIssue(
  code: string,
  message: string,
  path?: string,
): WorkflowValidationIssue {
  return Object.freeze({
    code,
    message,
    ...(path === undefined ? {} : { path }),
  });
}

export const WORKFLOW_DUPLICATE_NODE = 'WORKFLOW_DUPLICATE_NODE';
export const WORKFLOW_DUPLICATE_EDGE = 'WORKFLOW_DUPLICATE_EDGE';
export const WORKFLOW_CYCLE_DETECTED = 'WORKFLOW_CYCLE_DETECTED';
export const WORKFLOW_ORPHAN_NODE = 'WORKFLOW_ORPHAN_NODE';
export const WORKFLOW_INVALID_EDGE = 'WORKFLOW_INVALID_EDGE';
export const WORKFLOW_ENTRY_MISSING = 'WORKFLOW_ENTRY_MISSING';
export const WORKFLOW_EXIT_MISSING = 'WORKFLOW_EXIT_MISSING';
export const WORKFLOW_ENTRY_NOT_FOUND = 'WORKFLOW_ENTRY_NOT_FOUND';
export const WORKFLOW_EXIT_NOT_FOUND = 'WORKFLOW_EXIT_NOT_FOUND';
export const WORKFLOW_BROKEN_REFERENCE = 'WORKFLOW_BROKEN_REFERENCE';
export const WORKFLOW_GRAPH_DUPLICATE_NODE = 'WORKFLOW_GRAPH_DUPLICATE_NODE';
export const WORKFLOW_GRAPH_DUPLICATE_EDGE = 'WORKFLOW_GRAPH_DUPLICATE_EDGE';
export const WORKFLOW_GRAPH_INVALID_EDGE = 'WORKFLOW_GRAPH_INVALID_EDGE';
