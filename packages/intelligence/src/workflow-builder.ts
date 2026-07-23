import {
  createWorkflowEdge,
  createWorkflowNode,
  type WorkflowDefinition,
  type WorkflowEdge,
  type WorkflowIdentity,
  type WorkflowMetadata,
  type WorkflowNode,
} from '@atlas/workflow';

export interface WorkflowBuilder {
  withIdentity(identity: WorkflowIdentity): WorkflowBuilder;

  withMetadata(metadata: WorkflowMetadata): WorkflowBuilder;

  withVariables(variables: Readonly<Record<string, unknown>>): WorkflowBuilder;

  withEntryNodeId(entryNodeId: string): WorkflowBuilder;

  withExitNodeId(exitNodeId: string): WorkflowBuilder;

  addNode(node: WorkflowNode): WorkflowBuilder;

  addEdge(edge: WorkflowEdge): WorkflowBuilder;

  build(): WorkflowDefinition;
}

export function createWorkflowBuilder(seed?: WorkflowDefinition): WorkflowBuilder {
  let identity: WorkflowIdentity = seed?.identity ?? { workflow_id: 'workflow.unnamed', workflow_version: '1.0.0' };
  let metadata: WorkflowMetadata = seed?.metadata ?? {};
  let variables: Readonly<Record<string, unknown>> | undefined = seed?.variables;
  let entryNodeId = seed?.entry_node_id ?? 'entry';
  let exitNodeId = seed?.exit_node_id ?? 'exit';
  const nodes = new Map<string, WorkflowNode>();
  const edges = new Map<string, WorkflowEdge>();

  if (seed) {
    for (const node of seed.nodes) {
      nodes.set(node.identity.node_id, node);
    }

    for (const edge of seed.edges) {
      edges.set(edge.edge_id, edge);
    }
  }

  const builder: WorkflowBuilder = {
    withIdentity(value) {
      identity = Object.freeze({ ...value });
      return builder;
    },

    withMetadata(value) {
      metadata = Object.freeze({ ...value });
      return builder;
    },

    withVariables(value) {
      variables = Object.freeze({ ...value });
      return builder;
    },

    withEntryNodeId(value) {
      entryNodeId = value;
      return builder;
    },

    withExitNodeId(value) {
      exitNodeId = value;
      return builder;
    },

    addNode(node) {
      if (nodes.has(node.identity.node_id)) {
        throw new Error(`Workflow node already exists: ${node.identity.node_id}`);
      }

      nodes.set(node.identity.node_id, node);
      return builder;
    },

    addEdge(edge) {
      if (edges.has(edge.edge_id)) {
        throw new Error(`Workflow edge already exists: ${edge.edge_id}`);
      }

      if (!nodes.has(edge.from_node_id) || !nodes.has(edge.to_node_id)) {
        throw new Error(`Workflow edge references unknown nodes: ${edge.edge_id}`);
      }

      edges.set(edge.edge_id, edge);
      return builder;
    },

    build() {
      if (!nodes.has(entryNodeId)) {
        throw new Error(`Entry node not registered: ${entryNodeId}`);
      }

      if (!nodes.has(exitNodeId)) {
        throw new Error(`Exit node not registered: ${exitNodeId}`);
      }

      return Object.freeze({
        identity: Object.freeze({ ...identity }),
        metadata: Object.freeze({ ...metadata }),
        entry_node_id: entryNodeId,
        exit_node_id: exitNodeId,
        nodes: Object.freeze([...nodes.values()]),
        edges: Object.freeze([...edges.values()]),
        ...(variables === undefined ? {} : { variables: Object.freeze({ ...variables }) }),
      });
    },
  };

  return builder;
}

export function createStageNode(
  nodeId: string,
  dependencies: readonly string[] = [],
  configuration: Readonly<Record<string, unknown>> = {},
): WorkflowNode {
  return createWorkflowNode({
    node_id: nodeId,
    type: 'stage',
    configuration,
    dependencies,
  });
}

export function createEntryNode(nodeId = 'entry'): WorkflowNode {
  return createWorkflowNode({ node_id: nodeId, type: 'entry' });
}

export function createExitNode(nodeId = 'exit', dependencies: readonly string[] = []): WorkflowNode {
  return createWorkflowNode({ node_id: nodeId, type: 'exit', dependencies });
}

export function connectNodes(fromNodeId: string, toNodeId: string, edgeId?: string): WorkflowEdge {
  return createWorkflowEdge({
    edge_id: edgeId ?? `${fromNodeId}->${toNodeId}`,
    from_node_id: fromNodeId,
    to_node_id: toNodeId,
  });
}

export { createWorkflowEdge, createWorkflowNode };
