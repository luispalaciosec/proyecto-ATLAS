import type { PlanningContext, PlanningGoal, PlanningRule, PlanningStrategy } from './planning-model.js';
import {
  createWorkflowEdge,
  connectNodes,
  createEntryNode,
  createExitNode,
  createStageNode,
  createWorkflowBuilder,
} from './workflow-builder.js';

function readSteps(goal: PlanningGoal, context: PlanningContext): string[] {
  const fromVariables = goal.variables?.steps;
  const fromContext = context.variables?.steps;

  if (Array.isArray(fromVariables)) {
    return fromVariables.filter((step): step is string => typeof step === 'string');
  }

  if (Array.isArray(fromContext)) {
    return fromContext.filter((step): step is string => typeof step === 'string');
  }

  if (goal.constraints && goal.constraints.length > 0) {
    return [...goal.constraints];
  }

  if (goal.objective.includes('->')) {
    return goal.objective.split('->').map((part) => part.trim()).filter(Boolean);
  }

  return ['execute'];
}

function workflowIdentity(goal: PlanningGoal): { workflow_id: string; workflow_version: string } {
  return Object.freeze({
    workflow_id: `workflow.${goal.goal_id.replace(/^goal\./, '')}`,
    workflow_version: '1.0.0',
  });
}

function applyAppendStepRules(steps: string[], rules: readonly PlanningRule[]): string[] {
  const next = [...steps];

  for (const rule of rules) {
    if (rule.action !== 'append_step') {
      continue;
    }

    const step = String(rule.parameters?.step ?? rule.condition);

    if (step.trim().length > 0 && !next.includes(step)) {
      next.push(step);
    }
  }

  return next;
}

export function createSequentialStrategy(strategyId = 'strategy.sequential'): PlanningStrategy {
  const strategy: PlanningStrategy = {
    strategy_id: strategyId,
    strategy_type: 'sequential',

    plan(goal, context, rules) {
      const steps = applyAppendStepRules(readSteps(goal, context), rules);
      const builder = createWorkflowBuilder()
        .withIdentity(workflowIdentity(goal))
        .withMetadata({
          name: goal.metadata?.name ?? goal.objective,
          description: goal.metadata?.description,
          tags: Object.freeze(['planning', 'sequential', ...(goal.metadata?.tags ?? [])]),
        })
        .withVariables(
          Object.freeze({
            goal_id: goal.goal_id,
            objective: goal.objective,
            ...(goal.variables ?? {}),
          }),
        )
        .withEntryNodeId('entry')
        .withExitNodeId('exit');

      builder.addNode(createEntryNode('entry'));

      let previousId = 'entry';

      for (const stepId of steps) {
        const nodeId = `step.${stepId}`;
        builder.addNode(createStageNode(nodeId, [previousId], { stage_id: stepId }));
        builder.addEdge(connectNodes(previousId, nodeId));
        previousId = nodeId;
      }

      builder.addNode(createExitNode('exit', [previousId]));
      builder.addEdge(connectNodes(previousId, 'exit'));

      return builder.build();
    },
  };

  return Object.freeze(strategy);
}

export function createConditionalStrategy(strategyId = 'strategy.conditional'): PlanningStrategy {
  const strategy: PlanningStrategy = {
    strategy_id: strategyId,
    strategy_type: 'conditional',

    plan(goal, context, rules) {
      const branches = Array.isArray(goal.variables?.conditions)
        ? goal.variables.conditions.filter((value): value is Record<string, unknown> => typeof value === 'object' && value !== null)
        : [];

      const builder = createWorkflowBuilder()
        .withIdentity(workflowIdentity(goal))
        .withMetadata({ name: goal.objective, tags: Object.freeze(['planning', 'conditional']) })
        .withEntryNodeId('entry')
        .withExitNodeId('exit');

      builder.addNode(createEntryNode('entry'));
      builder.addNode(createExitNode('exit', ['entry']));

      if (branches.length === 0) {
        const fallbackStep = String(goal.variables?.fallback_step ?? 'evaluate');
        const stepNodeId = `step.${fallbackStep}`;
        builder.addNode(createStageNode(stepNodeId, ['entry'], { stage_id: fallbackStep }));
        builder.addEdge(
          createWorkflowEdge({
            edge_id: 'entry->evaluate',
            from_node_id: 'entry',
            to_node_id: stepNodeId,
            condition: { expression: 'default' },
          }),
        );
        builder.addEdge(connectNodes(stepNodeId, 'exit'));
        return builder.build();
      }

      const addedNodeIds = new Set<string>();

      for (const [index, branch] of branches.entries()) {
        const step = String(branch.step ?? branch.name ?? `branch.${index}`);
        const expression = String(branch.when ?? branch.condition ?? `case.${index}`);
        const nodeId = `step.${step}`;

        if (!addedNodeIds.has(nodeId)) {
          builder.addNode(createStageNode(nodeId, ['entry'], { stage_id: step }));
          addedNodeIds.add(nodeId);
        }

        builder.addEdge(
          createWorkflowEdge({
            edge_id: `entry->${nodeId}:${index}`,
            from_node_id: 'entry',
            to_node_id: nodeId,
            condition: { expression },
          }),
        );
        builder.addEdge(connectNodes(nodeId, 'exit', `${nodeId}->exit`));
      }

      for (const rule of rules) {
        if (rule.action !== 'append_step') {
          continue;
        }

        const step = String(rule.parameters?.step ?? rule.condition);
        const nodeId = `step.rule.${step}`;

        if (addedNodeIds.has(nodeId)) {
          continue;
        }

        builder.addNode(createStageNode(nodeId, ['entry'], { stage_id: step }));
        addedNodeIds.add(nodeId);
        builder.addEdge(connectNodes('entry', nodeId, `entry->${nodeId}`));
        builder.addEdge(connectNodes(nodeId, 'exit', `${nodeId}->exit`));
      }

      return builder.build();
    },
  };

  return Object.freeze(strategy);
}

export function createBranchStrategy(strategyId = 'strategy.branch'): PlanningStrategy {
  const strategy: PlanningStrategy = {
    strategy_id: strategyId,
    strategy_type: 'branch',

    plan(goal, context, rules) {
      const branches = Array.isArray(goal.variables?.branches)
        ? goal.variables.branches.filter((value): value is readonly string[] => Array.isArray(value))
        : readSteps(goal, context).map((step) => Object.freeze([step]));

      const builder = createWorkflowBuilder()
        .withIdentity(workflowIdentity(goal))
        .withMetadata({ name: goal.objective, tags: Object.freeze(['planning', 'branch']) })
        .withEntryNodeId('entry')
        .withExitNodeId('exit');

      builder.addNode(createEntryNode('entry'));
      builder.addNode(createExitNode('exit'));

      for (const [branchIndex, branchSteps] of branches.entries()) {
        let previousId = 'entry';

        for (const [stepIndex, step] of branchSteps.entries()) {
          const nodeId = `branch.${branchIndex}.step.${stepIndex}.${step}`;
          builder.addNode(createStageNode(nodeId, [previousId], { stage_id: step }));
          builder.addEdge(connectNodes(previousId, nodeId));
          previousId = nodeId;
        }

        builder.addEdge(connectNodes(previousId, 'exit', `branch.${branchIndex}->exit`));
      }

      for (const rule of rules) {
        if (rule.action !== 'append_branch') {
          continue;
        }

        const branchSteps = Array.isArray(rule.parameters?.steps)
          ? rule.parameters.steps.filter((step): step is string => typeof step === 'string')
          : [];

        const branchIndex = branches.length;
        let previousId = 'entry';

        for (const [stepIndex, step] of branchSteps.entries()) {
          const nodeId = `branch.rule.${branchIndex}.step.${stepIndex}.${step}`;
          builder.addNode(createStageNode(nodeId, [previousId], { stage_id: step }));
          builder.addEdge(connectNodes(previousId, nodeId));
          previousId = nodeId;
        }

        if (branchSteps.length > 0) {
          builder.addEdge(connectNodes(previousId, 'exit'));
        }
      }

      return builder.build();
    },
  };

  return Object.freeze(strategy);
}

export function createCompositeStrategy(
  strategies: readonly PlanningStrategy[],
  strategyId = 'strategy.composite',
): PlanningStrategy {
  const strategy: PlanningStrategy = {
    strategy_id: strategyId,
    strategy_type: 'composite',

    plan(goal, context, rules) {
      const segments: Record<string, unknown>[] = Array.isArray(goal.variables?.compose)
        ? goal.variables.compose.filter((value): value is Record<string, unknown> => isRecord(value))
        : strategies.map((strategy) => ({ strategy_id: strategy.strategy_id }));

      const builder = createWorkflowBuilder()
        .withIdentity(workflowIdentity(goal))
        .withMetadata({ name: goal.objective, tags: Object.freeze(['planning', 'composite']) })
        .withEntryNodeId('entry')
        .withExitNodeId('exit');

      builder.addNode(createEntryNode('entry'));

      let previousId = 'entry';
      let edgeCounter = 0;

      for (const segment of segments) {
        const segmentVariables = isRecord(segment.variables) ? segment.variables : {};

        const segmentGoal: PlanningGoal = Object.freeze({
          ...goal,
          variables: Object.freeze({
            ...(goal.variables ?? {}),
            ...segmentVariables,
          }),
        });

        const strategyId = String(segment.strategy_id ?? '');
        const strategy =
          strategies.find((candidate) => candidate.strategy_id === strategyId) ?? strategies[0];

        if (!strategy) {
          throw new Error('Composite strategy requires at least one registered sub-strategy');
        }

        const partial = strategy.plan(segmentGoal, context, rules);
        const segmentNodes = partial.nodes.filter((node) => node.type === 'stage');

        for (const node of segmentNodes) {
          const nodeId = `composite.${node.identity.node_id}`;
          builder.addNode(
            createStageNode(nodeId, [previousId], {
              ...node.configuration,
              stage_id: String(node.configuration.stage_id ?? node.identity.node_id),
            }),
          );
          builder.addEdge(connectNodes(previousId, nodeId, `composite.edge.${edgeCounter++}`));
          previousId = nodeId;
        }
      }

      builder.addNode(createExitNode('exit', [previousId]));
      builder.addEdge(connectNodes(previousId, 'exit'));

      return builder.build();
    },
  };

  return Object.freeze(strategy);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function createDefaultPlanningStrategies(): readonly PlanningStrategy[] {
  const sequential = createSequentialStrategy();
  const conditional = createConditionalStrategy();
  const branch = createBranchStrategy();

  return Object.freeze([
    sequential,
    conditional,
    branch,
    createCompositeStrategy([sequential, conditional, branch]),
  ]);
}
