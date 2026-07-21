import type { PipelineDefinition } from './pipeline-definition.js';
import type {
  WorkflowDefinition,
  WorkflowExecutionPlan,
  WorkflowNode,
  WorkflowResult,
  WorkflowTransition,
} from './workflow-model.js';
import { createWorkflowGraphFromDefinition } from './workflow-graph.js';
import { createWorkflowValidator } from './workflow-validator.js';

export interface WorkflowCompiler {
  compile(definition: WorkflowDefinition): WorkflowResult;
}

function resolveStageId(node: WorkflowNode): string {
  const configured = node.configuration.stage_id;

  if (typeof configured === 'string' && configured.trim().length > 0) {
    return configured;
  }

  return node.identity.node_id;
}

function isPipelineStageNode(node: WorkflowNode): boolean {
  return node.type !== 'entry' && node.type !== 'exit';
}

function buildExecutionPlan(definition: WorkflowDefinition): WorkflowExecutionPlan {
  const graph = createWorkflowGraphFromDefinition(definition);
  const orderedNodes = graph
    .topologicalOrder()
    .filter((node) => isOnExecutionPath(definition, node.identity.node_id));
  const orderedNodeIds = orderedNodes.map((node) => node.identity.node_id);
  const executableNodes = orderedNodes.filter(isPipelineStageNode);
  const transitions: WorkflowTransition[] = definition.edges
    .filter(
      (edge) =>
        orderedNodeIds.includes(edge.from_node_id) && orderedNodeIds.includes(edge.to_node_id),
    )
    .map((edge) =>
      Object.freeze({
        from_node_id: edge.from_node_id,
        to_node_id: edge.to_node_id,
        ...(edge.condition === undefined ? {} : { condition: edge.condition }),
      }),
    );

  const pipeline: PipelineDefinition = Object.freeze({
    pipeline_id: definition.identity.workflow_id,
    stage_ids: Object.freeze(executableNodes.map((node) => resolveStageId(node))),
  });

  return Object.freeze({
    workflow_id: definition.identity.workflow_id,
    workflow_version: definition.identity.workflow_version,
    ordered_node_ids: Object.freeze(orderedNodeIds),
    ordered_nodes: Object.freeze(orderedNodes),
    transitions: Object.freeze(transitions),
    pipeline,
  });
}

function isOnExecutionPath(definition: WorkflowDefinition, nodeId: string): boolean {
  const adjacency = new Map<string, string[]>();

  for (const node of definition.nodes) {
    adjacency.set(node.identity.node_id, []);
  }

  for (const edge of definition.edges) {
    adjacency.get(edge.from_node_id)?.push(edge.to_node_id);
  }

  const forward = new Set<string>();
  const forwardQueue = [definition.entry_node_id];

  while (forwardQueue.length > 0) {
    const current = forwardQueue.shift()!;

    if (forward.has(current)) {
      continue;
    }

    forward.add(current);

    for (const target of adjacency.get(current) ?? []) {
      forwardQueue.push(target);
    }
  }

  const reverseAdjacency = new Map<string, string[]>();

  for (const node of definition.nodes) {
    reverseAdjacency.set(node.identity.node_id, []);
  }

  for (const edge of definition.edges) {
    reverseAdjacency.get(edge.to_node_id)?.push(edge.from_node_id);
  }

  const backward = new Set<string>();
  const backwardQueue = [definition.exit_node_id];

  while (backwardQueue.length > 0) {
    const current = backwardQueue.shift()!;

    if (backward.has(current)) {
      continue;
    }

    backward.add(current);

    for (const source of reverseAdjacency.get(current) ?? []) {
      backwardQueue.push(source);
    }
  }

  return forward.has(nodeId) && backward.has(nodeId);
}

export function createWorkflowCompiler(
  validator = createWorkflowValidator(),
): WorkflowCompiler {
  return {
    compile(definition) {
      const validation = validator.validate(definition);

      if (!validation.valid) {
        return Object.freeze({
          success: false,
          workflow_id: definition.identity.workflow_id,
          pipeline: null,
          plan: null,
          errors: validation.issues,
        });
      }

      const plan = buildExecutionPlan(definition);

      return Object.freeze({
        success: true,
        workflow_id: definition.identity.workflow_id,
        pipeline: plan.pipeline,
        plan,
        errors: Object.freeze([]),
      });
    },
  };
}

export function compileWorkflowDefinition(definition: WorkflowDefinition): WorkflowResult {
  return createWorkflowCompiler().compile(definition);
}
