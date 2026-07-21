/**
 * Workflow Definition model — ATLAS-INTELLIGENCE-007
 * Definition only; no execution behavior.
 */

export interface WorkflowIdentity {
  readonly workflow_id: string;
  readonly workflow_version: string;
}

export interface WorkflowMetadata {
  readonly name?: string;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly custom?: Readonly<Record<string, unknown>>;
}

export interface WorkflowNodeIdentity {
  readonly node_id: string;
  readonly node_version: string;
}

export interface WorkflowNode {
  readonly identity: WorkflowNodeIdentity;
  readonly type: string;
  readonly configuration: Readonly<Record<string, unknown>>;
  readonly inputs: readonly string[];
  readonly outputs: readonly string[];
  readonly dependencies: readonly string[];
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface WorkflowCondition {
  readonly expression: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface WorkflowEdge {
  readonly edge_id: string;
  readonly from_node_id: string;
  readonly to_node_id: string;
  readonly condition?: WorkflowCondition;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface WorkflowTransition {
  readonly from_node_id: string;
  readonly to_node_id: string;
  readonly condition?: WorkflowCondition;
}

export interface WorkflowDefinition {
  readonly identity: WorkflowIdentity;
  readonly metadata: WorkflowMetadata;
  readonly entry_node_id: string;
  readonly exit_node_id: string;
  readonly nodes: readonly WorkflowNode[];
  readonly edges: readonly WorkflowEdge[];
  readonly variables?: Readonly<Record<string, unknown>>;
}

export interface WorkflowExecutionPlan {
  readonly workflow_id: string;
  readonly workflow_version: string;
  readonly ordered_node_ids: readonly string[];
  readonly ordered_nodes: readonly WorkflowNode[];
  readonly transitions: readonly WorkflowTransition[];
  readonly pipeline: import('./pipeline-definition.js').PipelineDefinition;
}

export interface WorkflowValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly path?: string;
}

export interface WorkflowValidationResult {
  readonly valid: boolean;
  readonly issues: readonly WorkflowValidationIssue[];
}

export interface WorkflowResult {
  readonly success: boolean;
  readonly workflow_id: string;
  readonly pipeline: import('./pipeline-definition.js').PipelineDefinition | null;
  readonly plan: WorkflowExecutionPlan | null;
  readonly errors: readonly WorkflowValidationIssue[];
}
