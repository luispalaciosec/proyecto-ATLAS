import type { WorkflowEdge, WorkflowNode, WorkflowValidationIssue } from './workflow-model.js';
import {
  WORKFLOW_CYCLE_DETECTED,
  WORKFLOW_GRAPH_INVALID_EDGE,
  createWorkflowIssue,
} from './workflow-errors.js';

export interface WorkflowGraphValidationResult {
  readonly valid: boolean;
  readonly issues: readonly WorkflowValidationIssue[];
}

export interface WorkflowGraph {
  registerNode(node: WorkflowNode): void;

  registerEdge(edge: WorkflowEdge): void;

  getNode(nodeId: string): WorkflowNode | null;

  getEdge(edgeId: string): WorkflowEdge | null;

  listNodes(): readonly WorkflowNode[];

  listEdges(): readonly WorkflowEdge[];

  getEntryNodes(): readonly WorkflowNode[];

  getExitNodes(): readonly WorkflowNode[];

  hasCycle(): boolean;

  topologicalOrder(): readonly WorkflowNode[];

  validateStructure(): WorkflowGraphValidationResult;
}

function buildAdjacency(
  nodes: readonly WorkflowNode[],
  edges: readonly WorkflowEdge[],
): {
  incoming: Map<string, string[]>;
  outgoing: Map<string, string[]>;
} {
  const incoming = new Map<string, string[]>();
  const outgoing = new Map<string, string[]>();

  for (const node of nodes) {
    incoming.set(node.identity.node_id, []);
    outgoing.set(node.identity.node_id, []);
  }

  for (const edge of edges) {
    incoming.get(edge.to_node_id)?.push(edge.from_node_id);
    outgoing.get(edge.from_node_id)?.push(edge.to_node_id);
  }

  return { incoming, outgoing };
}

function topologicalSort(
  nodes: readonly WorkflowNode[],
  edges: readonly WorkflowEdge[],
): WorkflowNode[] {
  const nodeById = new Map(nodes.map((node) => [node.identity.node_id, node]));
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.identity.node_id, 0);
    adjacency.set(node.identity.node_id, []);
  }

  for (const edge of edges) {
    if (!inDegree.has(edge.to_node_id) || !adjacency.has(edge.from_node_id)) {
      continue;
    }

    inDegree.set(edge.to_node_id, (inDegree.get(edge.to_node_id) ?? 0) + 1);
    adjacency.get(edge.from_node_id)?.push(edge.to_node_id);
  }

  const queue = [...inDegree.entries()]
    .filter(([, degree]) => degree === 0)
    .map(([nodeId]) => nodeId)
    .sort();

  const sorted: WorkflowNode[] = [];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodeById.get(nodeId);

    if (!node) {
      continue;
    }

    sorted.push(node);

    const targets = [...(adjacency.get(nodeId) ?? [])].sort();

    for (const targetId of targets) {
      const nextDegree = (inDegree.get(targetId) ?? 0) - 1;
      inDegree.set(targetId, nextDegree);

      if (nextDegree === 0) {
        queue.push(targetId);
        queue.sort();
      }
    }
  }

  return sorted;
}

export function createWorkflowGraph(seed?: {
  readonly nodes?: readonly WorkflowNode[];
  readonly edges?: readonly WorkflowEdge[];
}): WorkflowGraph {
  const nodes = new Map<string, WorkflowNode>();
  const edges = new Map<string, WorkflowEdge>();

  if (seed?.nodes) {
    for (const node of seed.nodes) {
      nodes.set(node.identity.node_id, node);
    }
  }

  if (seed?.edges) {
    for (const edge of seed.edges) {
      edges.set(edge.edge_id, edge);
    }
  }

  function listNodes(): WorkflowNode[] {
    return [...nodes.values()];
  }

  function listEdges(): WorkflowEdge[] {
    return [...edges.values()];
  }

  return {
    registerNode(node) {
      if (nodes.has(node.identity.node_id)) {
        throw new Error(`Workflow node already registered: ${node.identity.node_id}`);
      }

      nodes.set(node.identity.node_id, Object.freeze(node));
    },

    registerEdge(edge) {
      if (edges.has(edge.edge_id)) {
        throw new Error(`Workflow edge already registered: ${edge.edge_id}`);
      }

      if (!nodes.has(edge.from_node_id) || !nodes.has(edge.to_node_id)) {
        throw new Error(`Workflow edge references unknown nodes: ${edge.edge_id}`);
      }

      edges.set(edge.edge_id, Object.freeze(edge));
    },

    getNode(nodeId) {
      return nodes.get(nodeId) ?? null;
    },

    getEdge(edgeId) {
      return edges.get(edgeId) ?? null;
    },

    listNodes() {
      return Object.freeze(listNodes());
    },

    listEdges() {
      return Object.freeze(listEdges());
    },

    getEntryNodes() {
      const nodeList = listNodes();
      const edgeList = listEdges();
      const { incoming } = buildAdjacency(nodeList, edgeList);

      return Object.freeze(
        nodeList.filter((node) => (incoming.get(node.identity.node_id) ?? []).length === 0),
      );
    },

    getExitNodes() {
      const nodeList = listNodes();
      const edgeList = listEdges();
      const { outgoing } = buildAdjacency(nodeList, edgeList);

      return Object.freeze(
        nodeList.filter((node) => (outgoing.get(node.identity.node_id) ?? []).length === 0),
      );
    },

    hasCycle() {
      const nodeList = listNodes();
      const edgeList = listEdges();
      return topologicalSort(nodeList, edgeList).length !== nodeList.length;
    },

    topologicalOrder() {
      return Object.freeze(topologicalSort(listNodes(), listEdges()));
    },

    validateStructure() {
      const issues: WorkflowValidationIssue[] = [];
      const nodeList = listNodes();
      const edgeList = listEdges();
      const nodeIds = new Set(nodeList.map((node) => node.identity.node_id));

      for (const edge of edgeList) {
        if (!nodeIds.has(edge.from_node_id) || !nodeIds.has(edge.to_node_id)) {
          issues.push(
            createWorkflowIssue(
              WORKFLOW_GRAPH_INVALID_EDGE,
              `Edge "${edge.edge_id}" references unknown nodes`,
              edge.edge_id,
            ),
          );
        }
      }

      if (topologicalSort(nodeList, edgeList).length !== nodeList.length) {
        issues.push(
          createWorkflowIssue(WORKFLOW_CYCLE_DETECTED, 'Workflow graph contains a cycle'),
        );
      }

      return Object.freeze({
        valid: issues.length === 0,
        issues: Object.freeze(issues),
      });
    },
  };
}

export function createWorkflowGraphFromDefinition(definition: {
  readonly nodes: readonly WorkflowNode[];
  readonly edges: readonly WorkflowEdge[];
}): WorkflowGraph {
  return createWorkflowGraph({
    nodes: definition.nodes,
    edges: definition.edges,
  });
}
