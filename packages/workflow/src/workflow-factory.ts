import type {
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowIdentity,
  WorkflowMetadata,
  WorkflowNode,
} from './workflow-model.js';
import type { WorkflowGraph } from './workflow-graph.js';

export interface CreateWorkflowDefinitionParams {
  readonly identity: WorkflowIdentity;
  readonly metadata?: WorkflowMetadata;
  readonly entry_node_id: string;
  readonly exit_node_id: string;
  readonly nodes: readonly WorkflowNode[];
  readonly edges: readonly WorkflowEdge[];
  readonly variables?: Readonly<Record<string, unknown>>;
}

export interface WorkflowFactory {
  create(params: CreateWorkflowDefinitionParams): WorkflowDefinition;

  fromGraph(params: {
    readonly identity: WorkflowIdentity;
    readonly metadata?: WorkflowMetadata;
    readonly entry_node_id: string;
    readonly exit_node_id: string;
    readonly graph: WorkflowGraph;
    readonly variables?: Readonly<Record<string, unknown>>;
  }): WorkflowDefinition;
}

export function createWorkflowFactory(): WorkflowFactory {
  return {
    create(params) {
      return Object.freeze({
        identity: Object.freeze({ ...params.identity }),
        metadata: Object.freeze({ ...(params.metadata ?? {}) }),
        entry_node_id: params.entry_node_id,
        exit_node_id: params.exit_node_id,
        nodes: Object.freeze([...params.nodes]),
        edges: Object.freeze([...params.edges]),
        ...(params.variables === undefined ? {} : { variables: Object.freeze({ ...params.variables }) }),
      });
    },

    fromGraph(params) {
      return Object.freeze({
        identity: Object.freeze({ ...params.identity }),
        metadata: Object.freeze({ ...(params.metadata ?? {}) }),
        entry_node_id: params.entry_node_id,
        exit_node_id: params.exit_node_id,
        nodes: Object.freeze([...params.graph.listNodes()]),
        edges: Object.freeze([...params.graph.listEdges()]),
        ...(params.variables === undefined ? {} : { variables: Object.freeze({ ...params.variables }) }),
      });
    },
  };
}

export function createWorkflowNode(params: {
  readonly node_id: string;
  readonly node_version?: string;
  readonly type: string;
  readonly configuration?: Readonly<Record<string, unknown>>;
  readonly inputs?: readonly string[];
  readonly outputs?: readonly string[];
  readonly dependencies?: readonly string[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}): WorkflowNode {
  return Object.freeze({
    identity: Object.freeze({
      node_id: params.node_id,
      node_version: params.node_version ?? '1.0.0',
    }),
    type: params.type,
    configuration: Object.freeze({ ...(params.configuration ?? {}) }),
    inputs: Object.freeze([...(params.inputs ?? [])]),
    outputs: Object.freeze([...(params.outputs ?? [])]),
    dependencies: Object.freeze([...(params.dependencies ?? [])]),
    metadata: Object.freeze({ ...(params.metadata ?? {}) }),
  });
}

export function createWorkflowEdge(params: {
  readonly edge_id: string;
  readonly from_node_id: string;
  readonly to_node_id: string;
  readonly condition?: WorkflowEdge['condition'];
  readonly metadata?: Readonly<Record<string, unknown>>;
}): WorkflowEdge {
  return Object.freeze({
    edge_id: params.edge_id,
    from_node_id: params.from_node_id,
    to_node_id: params.to_node_id,
    ...(params.condition === undefined ? {} : { condition: Object.freeze({ ...params.condition }) }),
    ...(params.metadata === undefined ? {} : { metadata: Object.freeze({ ...params.metadata }) }),
  });
}
