/**
 * @atlas/workflow — Workflow Definition System (Sprint 10E)
 * @see ATLAS-INTELLIGENCE-007
 * @see ATLAS-INTELLIGENCE-CONTRACT-006
 */

export type { PipelineDefinition } from './pipeline-definition.js';

export type {
  WorkflowCondition,
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowExecutionPlan,
  WorkflowIdentity,
  WorkflowMetadata,
  WorkflowNode,
  WorkflowNodeIdentity,
  WorkflowResult,
  WorkflowTransition,
  WorkflowValidationIssue,
  WorkflowValidationResult,
} from './workflow-model.js';

export {
  WORKFLOW_BROKEN_REFERENCE,
  WORKFLOW_CYCLE_DETECTED,
  WORKFLOW_DUPLICATE_EDGE,
  WORKFLOW_DUPLICATE_NODE,
  WORKFLOW_ENTRY_MISSING,
  WORKFLOW_ENTRY_NOT_FOUND,
  WORKFLOW_EXIT_MISSING,
  WORKFLOW_EXIT_NOT_FOUND,
  WORKFLOW_GRAPH_DUPLICATE_EDGE,
  WORKFLOW_GRAPH_DUPLICATE_NODE,
  WORKFLOW_GRAPH_INVALID_EDGE,
  WORKFLOW_INVALID_EDGE,
  WORKFLOW_ORPHAN_NODE,
  createWorkflowIssue,
} from './workflow-errors.js';

export {
  createWorkflowGraph,
  createWorkflowGraphFromDefinition,
  type WorkflowGraph,
  type WorkflowGraphValidationResult,
} from './workflow-graph.js';

export { createWorkflowRegistry, type WorkflowRegistry } from './workflow-registry.js';

export {
  createWorkflowEdge,
  createWorkflowFactory,
  createWorkflowNode,
  type CreateWorkflowDefinitionParams,
  type WorkflowFactory,
} from './workflow-factory.js';

export {
  createWorkflowValidator,
  validateWorkflowDefinition,
  type WorkflowValidator,
} from './workflow-validator.js';

export {
  compileWorkflowDefinition,
  createWorkflowCompiler,
  type WorkflowCompiler,
} from './workflow-compiler.js';
