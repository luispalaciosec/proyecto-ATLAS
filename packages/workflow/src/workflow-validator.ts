import type {
  WorkflowDefinition,
  WorkflowValidationIssue,
  WorkflowValidationResult,
} from './workflow-model.js';
import {
  WORKFLOW_BROKEN_REFERENCE,
  WORKFLOW_DUPLICATE_EDGE,
  WORKFLOW_DUPLICATE_NODE,
  WORKFLOW_ENTRY_MISSING,
  WORKFLOW_ENTRY_NOT_FOUND,
  WORKFLOW_EXIT_MISSING,
  WORKFLOW_EXIT_NOT_FOUND,
  WORKFLOW_INVALID_EDGE,
  WORKFLOW_ORPHAN_NODE,
  createWorkflowIssue,
} from './workflow-errors.js';
import { createWorkflowGraphFromDefinition } from './workflow-graph.js';

export interface WorkflowValidator {
  validate(definition: WorkflowDefinition): WorkflowValidationResult;
}

function reachabilityFromEntry(
  definition: WorkflowDefinition,
): { reachable: Set<string>; issues: WorkflowValidationIssue[] } {
  const nodeIds = new Set(definition.nodes.map((node) => node.identity.node_id));
  const adjacency = new Map<string, string[]>();

  for (const node of definition.nodes) {
    adjacency.set(node.identity.node_id, []);
  }

  for (const edge of definition.edges) {
    adjacency.get(edge.from_node_id)?.push(edge.to_node_id);
  }

  const reachable = new Set<string>();
  const queue = [definition.entry_node_id];
  const issues: WorkflowValidationIssue[] = [];

  if (!nodeIds.has(definition.entry_node_id)) {
    return { reachable, issues };
  }

  while (queue.length > 0) {
    const nodeId = queue.shift()!;

    if (reachable.has(nodeId)) {
      continue;
    }

    reachable.add(nodeId);

    for (const targetId of adjacency.get(nodeId) ?? []) {
      if (!nodeIds.has(targetId)) {
        continue;
      }

      queue.push(targetId);
    }
  }

  for (const node of definition.nodes) {
    if (!reachable.has(node.identity.node_id)) {
      issues.push(
        createWorkflowIssue(
          WORKFLOW_ORPHAN_NODE,
          `Node "${node.identity.node_id}" is not reachable from entry`,
          node.identity.node_id,
        ),
      );
    }
  }

  if (!reachable.has(definition.exit_node_id)) {
    issues.push(
      createWorkflowIssue(
        WORKFLOW_EXIT_NOT_FOUND,
        `Exit node "${definition.exit_node_id}" is not reachable from entry`,
        definition.exit_node_id,
      ),
    );
  }

  return { reachable, issues };
}

export function createWorkflowValidator(): WorkflowValidator {
  return {
    validate(definition) {
      const issues: WorkflowValidationIssue[] = [];
      const nodeIds = new Set<string>();
      const edgeIds = new Set<string>();

      if (!definition.entry_node_id.trim()) {
        issues.push(createWorkflowIssue(WORKFLOW_ENTRY_MISSING, 'Workflow entry node id is required'));
      }

      if (!definition.exit_node_id.trim()) {
        issues.push(createWorkflowIssue(WORKFLOW_EXIT_MISSING, 'Workflow exit node id is required'));
      }

      for (const node of definition.nodes) {
        if (nodeIds.has(node.identity.node_id)) {
          issues.push(
            createWorkflowIssue(
              WORKFLOW_DUPLICATE_NODE,
              `Duplicate node id "${node.identity.node_id}"`,
              node.identity.node_id,
            ),
          );
        }

        nodeIds.add(node.identity.node_id);
      }

      for (const node of definition.nodes) {
        for (const dependencyId of node.dependencies) {
          if (!nodeIds.has(dependencyId)) {
            issues.push(
              createWorkflowIssue(
                WORKFLOW_BROKEN_REFERENCE,
                `Node "${node.identity.node_id}" depends on unknown node "${dependencyId}"`,
                node.identity.node_id,
              ),
            );
          }
        }
      }

      if (definition.entry_node_id && !nodeIds.has(definition.entry_node_id)) {
        issues.push(
          createWorkflowIssue(
            WORKFLOW_ENTRY_NOT_FOUND,
            `Entry node "${definition.entry_node_id}" does not exist`,
            definition.entry_node_id,
          ),
        );
      }

      if (definition.exit_node_id && !nodeIds.has(definition.exit_node_id)) {
        issues.push(
          createWorkflowIssue(
            WORKFLOW_EXIT_NOT_FOUND,
            `Exit node "${definition.exit_node_id}" does not exist`,
            definition.exit_node_id,
          ),
        );
      }

      for (const edge of definition.edges) {
        if (edgeIds.has(edge.edge_id)) {
          issues.push(
            createWorkflowIssue(
              WORKFLOW_DUPLICATE_EDGE,
              `Duplicate edge id "${edge.edge_id}"`,
              edge.edge_id,
            ),
          );
        }

        edgeIds.add(edge.edge_id);

        if (!nodeIds.has(edge.from_node_id) || !nodeIds.has(edge.to_node_id)) {
          issues.push(
            createWorkflowIssue(
              WORKFLOW_INVALID_EDGE,
              `Edge "${edge.edge_id}" references unknown nodes`,
              edge.edge_id,
            ),
          );
        }
      }

      const graph = createWorkflowGraphFromDefinition(definition);
      const graphValidation = graph.validateStructure();
      issues.push(...graphValidation.issues);

      const { issues: reachabilityIssues } = reachabilityFromEntry(definition);
      issues.push(...reachabilityIssues);

      return Object.freeze({
        valid: issues.length === 0,
        issues: Object.freeze(issues),
      });
    },
  };
}

export function validateWorkflowDefinition(definition: WorkflowDefinition): WorkflowValidationResult {
  return createWorkflowValidator().validate(definition);
}
