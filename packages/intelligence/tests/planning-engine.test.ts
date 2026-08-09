import { describe, expect, it } from 'vitest';

import { validateWorkflowDefinition } from '@atlas/workflow';

import {
  compilePlanningResult,
  createBranchStrategy,
  createCompositeStrategy,
  createConditionalStrategy,
  createGoalNormalizer,
  createPlanningCompiler,
  createPlanningEngine,
  createPlanningRegistry,
  createPlanningValidator,
  createSequentialStrategy,
  createWorkflowBuilder,
  createStageNode,
  connectNodes,
  createEntryNode,
  createExitNode,
  validatePlanningContext,
  validatePlanningGoal,
} from '../src/index.js';

describe('PlanningGoal and GoalNormalizer', () => {
  it('normalizes text, objects and canonical goals', () => {
    const normalizer = createGoalNormalizer();

    expect(normalizer.normalize('Process customer order')).toEqual({
      goal_id: 'goal.process.customer.order',
      objective: 'Process customer order',
    });

    expect(
      normalizer.normalize({
        text: 'Analyze dataset',
        variables: { strategy: 'sequential', steps: ['load', 'analyze'] },
        tags: ['analytics'],
      }),
    ).toMatchObject({
      goal_id: 'goal.analyze.dataset',
      objective: 'Analyze dataset',
      variables: { strategy: 'sequential', steps: ['load', 'analyze'] },
    });

    expect(
      normalizer.normalize({
        goal_id: 'goal.custom',
        objective: 'Custom goal',
        constraints: ['a'],
        metadata: { name: 'Custom' },
      }),
    ).toEqual({
      goal_id: 'goal.custom',
      objective: 'Custom goal',
      constraints: ['a'],
      metadata: { name: 'Custom' },
    });

    expect(
      normalizer.normalize({
        goal: 'Goal field objective',
        description: 'desc',
        custom: { channel: 'api' },
      }),
    ).toMatchObject({
      goal_id: 'goal.goal.field.objective',
      objective: 'Goal field objective',
      metadata: { description: 'desc', custom: { channel: 'api' } },
    });
  });

  it('rejects invalid goal input', () => {
    const normalizer = createGoalNormalizer();

    expect(() => normalizer.normalize('   ')).toThrow();
    expect(() => normalizer.normalize(42)).toThrow();
    expect(() => normalizer.normalize({})).toThrow();
  });

  it('folds accents when deriving goal_id from text', () => {
    const normalizer = createGoalNormalizer();

    expect(normalizer.normalize('Seguimiento pedido VIP Ana García')).toMatchObject({
      goal_id: 'goal.seguimiento.pedido.vip.ana.garcia',
      objective: 'Seguimiento pedido VIP Ana García',
    });
  });
});

describe('PlanningContext and PlanningStrategy', () => {
  it('builds a sequential workflow from steps in the goal', () => {
    const strategy = createSequentialStrategy();
    const goal = createGoalNormalizer().normalize({
      goal_id: 'goal.process',
      objective: 'Process order',
      variables: { steps: ['validate', 'charge', 'notify'] },
    });
    const context = {
      context_id: 'context.process',
    };

    const workflow = strategy.plan(goal, context, []);

    expect(workflow.nodes.filter((node) => node.type === 'stage')).toHaveLength(3);
    expect(workflow.entry_node_id).toBe('entry');
    expect(validateWorkflowDefinition(workflow).valid).toBe(true);
  });

  it('builds conditional and branch workflows deterministically', () => {
    const conditional = createConditionalStrategy();
    const branch = createBranchStrategy();
    const goal = createGoalNormalizer().normalize({
      goal_id: 'goal.route',
      objective: 'Route request',
      variables: {
        conditions: [
          { when: 'vip', step: 'priority' },
          { when: 'default', step: 'standard' },
        ],
        branches: [
          ['prepare', 'send'],
          ['queue', 'dispatch'],
        ],
      },
    });
    const context = { context_id: 'context.route' };

    const conditionalWorkflow = conditional.plan(goal, context, []);
    const branchWorkflow = branch.plan(goal, context, []);

    expect(conditionalWorkflow.edges.some((edge) => edge.condition?.expression === 'vip')).toBe(true);
    expect(branchWorkflow.nodes.some((node) => node.identity.node_id.includes('branch.0'))).toBe(true);
    expect(validateWorkflowDefinition(conditionalWorkflow).valid).toBe(true);
    expect(validateWorkflowDefinition(branchWorkflow).valid).toBe(true);
  });

  it('derives sequential steps from arrow-separated objectives', () => {
    const workflow = createSequentialStrategy().plan(
      createGoalNormalizer().normalize('load -> transform -> publish'),
      { context_id: 'context.pipeline' },
      [],
    );

    expect(workflow.nodes.filter((node) => node.type === 'stage')).toHaveLength(3);
  });

  it('applies branch rules to append additional branches', () => {
    const workflow = createBranchStrategy().plan(
      createGoalNormalizer().normalize({
        goal_id: 'goal.branch',
        objective: 'Branch work',
        variables: { branches: [['a']] },
      }),
      { context_id: 'context.branch' },
      [
        {
          rule_id: 'rule.branch',
          condition: 'extra',
          action: 'append_branch',
          parameters: { steps: ['extra'] },
        },
      ],
    );

    expect(workflow.nodes.some((node) => node.identity.node_id.includes('branch.rule'))).toBe(true);
  });

  it('uses conditional fallback when no conditions are provided', () => {
    const workflow = createConditionalStrategy().plan(
      createGoalNormalizer().normalize({
        goal_id: 'goal.fallback',
        objective: 'Fallback route',
      }),
      { context_id: 'context.fallback' },
      [],
    );

    expect(validateWorkflowDefinition(workflow).valid).toBe(true);
    expect(workflow.nodes.some((node) => node.identity.node_id === 'step.evaluate')).toBe(true);
  });
});

describe('WorkflowBuilder', () => {
  it('constructs a valid workflow graph manually', () => {
    const workflow = createWorkflowBuilder()
      .withIdentity({ workflow_id: 'workflow.manual', workflow_version: '1.0.0' })
      .withEntryNodeId('entry')
      .withExitNodeId('exit')
      .addNode(createEntryNode('entry'))
      .addNode(createStageNode('step.one', ['entry'], { stage_id: 'one' }))
      .addNode(createExitNode('exit', ['step.one']))
      .addEdge(connectNodes('entry', 'step.one'))
      .addEdge(connectNodes('step.one', 'exit'))
      .build();

    expect(validateWorkflowDefinition(workflow).valid).toBe(true);
  });

  it('rejects duplicate nodes, edges and missing entry or exit', () => {
    const builder = createWorkflowBuilder()
      .withEntryNodeId('entry')
      .withExitNodeId('exit')
      .addNode(createEntryNode('entry'))
      .addNode(createStageNode('step.one', ['entry']))
      .addNode(createExitNode('exit', ['step.one']))
      .addEdge(connectNodes('entry', 'step.one'));

    expect(() => builder.addNode(createEntryNode('entry'))).toThrow(/already exists/);
    expect(() => builder.addEdge(connectNodes('entry', 'missing'))).toThrow(/unknown nodes/);
    expect(() => builder.addEdge(connectNodes('entry', 'step.one'))).toThrow(/already exists/);

    const missingEntry = createWorkflowBuilder()
      .withExitNodeId('exit')
      .addNode(createExitNode('exit'));

    expect(() => missingEntry.build()).toThrow(/Entry node not registered/);

    const seeded = createWorkflowBuilder()
      .withIdentity({ workflow_id: 'workflow.seed', workflow_version: '1.0.0' })
      .withEntryNodeId('entry')
      .withExitNodeId('exit')
      .addNode(createEntryNode('entry'))
      .addNode(createExitNode('exit', ['entry']))
      .addEdge(connectNodes('entry', 'exit'))
      .build();

    const cloned = createWorkflowBuilder(seeded)
      .withMetadata({ name: 'Seeded' })
      .withVariables({ seeded: true })
      .build();

    expect(cloned.identity.workflow_id).toBe('workflow.seed');
    expect(cloned.metadata.name).toBe('Seeded');
    expect(cloned.variables).toEqual({ seeded: true });
  });
});

describe('PlanningRegistry', () => {
  it('registers strategies and rules', () => {
    const registry = createPlanningRegistry([createSequentialStrategy()]);

    registry.registerRule({
      rule_id: 'rule.append.notify',
      condition: 'notify',
      action: 'append_step',
      parameters: { step: 'notify' },
    });

    expect(registry.getStrategy('strategy.sequential')).not.toBeNull();
    expect(registry.listRules()).toHaveLength(1);
    expect(registry.listStrategies()).toHaveLength(1);
    expect(() => registry.registerStrategy(createSequentialStrategy())).toThrow(/already registered/);
    expect(() =>
      registry.registerRule({
        rule_id: 'rule.append.notify',
        condition: 'notify',
        action: 'append_step',
      }),
    ).toThrow(/already registered/);
  });
});

describe('PlanningEngine', () => {
  it('plans a goal into a valid workflow without executing anything', () => {
    const engine = createPlanningEngine();
    const result = engine.plan({
      goal: {
        objective: 'Fulfill purchase',
        variables: {
          strategy: 'sequential',
          steps: ['validate', 'fulfill'],
        },
      },
      context: {
        context_id: 'context.purchase',
        domain: 'commerce',
      },
    });

    expect(result.success).toBe(true);
    expect(result.workflow).not.toBeNull();
    expect(result.strategy_id).toBe('strategy.sequential');
    expect(result.workflow?.identity.workflow_id).toBe('workflow.fulfill.purchase');
  });

  it('returns errors for invalid goals and unknown strategies', () => {
    const engine = createPlanningEngine();

    expect(
      engine.plan({
        goal: '   ',
      }).success,
    ).toBe(false);

    expect(
      engine.plan({
        goal: { goal_id: 'goal.test', objective: 'Test', variables: { strategy: 'missing' } },
      }).success,
    ).toBe(false);
  });

  it('applies append_step rules to sequential planning', () => {
    const registry = createPlanningRegistry([createSequentialStrategy()]);
    registry.registerRule({
      rule_id: 'rule.audit',
      condition: 'audit',
      action: 'append_step',
      parameters: { step: 'audit' },
    });
    const engine = createPlanningEngine({ registry });
    const result = engine.plan({
      goal: {
        objective: 'Process with audit',
        variables: { steps: ['validate'] },
      },
    });

    expect(result.success).toBe(true);
    expect(
      result.workflow?.nodes.some((node) => String(node.configuration.stage_id) === 'audit'),
    ).toBe(true);
  });

  it('resolves strategies from context variables', () => {
    const engine = createPlanningEngine();
    const result = engine.plan({
      goal: { objective: 'Context driven', variables: { steps: ['a'] } },
      context: {
        context_id: 'context.strategy',
        variables: { strategy: 'branch', branches: [['x'], ['y']] },
      },
    });

    expect(result.success).toBe(true);
    expect(result.strategy_id).toBe('strategy.branch');
  });

  it('rejects invalid strategy definitions', () => {
    const registry = createPlanningRegistry([
      {
        strategy_id: '',
        strategy_type: 'sequential',
        plan: () =>
          createWorkflowBuilder()
            .withEntryNodeId('entry')
            .withExitNodeId('exit')
            .addNode(createEntryNode('entry'))
            .addNode(createExitNode('exit', ['entry']))
            .addEdge(connectNodes('entry', 'exit'))
            .build(),
      },
    ]);
    const engine = createPlanningEngine({ registry });

    expect(
      engine.plan({
        goal: { objective: 'Broken strategy' },
        strategy_id: '',
      }).success,
    ).toBe(false);
  });

  it('selects strategy from planning rules', () => {
    const registry = createPlanningRegistry([
      createSequentialStrategy(),
      createBranchStrategy(),
    ]);
    registry.registerRule({
      rule_id: 'rule.use.branch',
      condition: 'branch',
      action: 'select_strategy',
      parameters: { strategy_id: 'strategy.branch' },
    });

    const engine = createPlanningEngine({ registry });
    const result = engine.plan({
      goal: {
        objective: 'Parallelize tasks',
        variables: { branches: [['a'], ['b']] },
      },
    });

    expect(result.success).toBe(true);
    expect(result.strategy_id).toBe('strategy.branch');
  });
});

describe('PlanningValidator and PlanningCompiler', () => {
  it('validates goals, strategies and workflow compatibility', () => {
    const validator = createPlanningValidator();
    const goal = createGoalNormalizer().normalize('Simple task');

    expect(validator.validateGoal(goal).valid).toBe(true);
    expect(validatePlanningGoal({ goal_id: '', objective: '' }).valid).toBe(false);
    expect(validatePlanningContext({ context_id: '' }).valid).toBe(false);
    expect(validator.validateStrategy(createSequentialStrategy(), 'strategy.sequential').valid).toBe(true);
    expect(validator.validateStrategy(null, 'strategy.missing').valid).toBe(false);
  });

  it('compiles a planning result against WorkflowCompiler compatibility', () => {
    const engine = createPlanningEngine();
    const compiler = createPlanningCompiler();
    const result = engine.plan({
      goal: {
        objective: 'Generate report',
        variables: { steps: ['collect', 'render'] },
      },
    });
    const compilation = compiler.compile(result);

    expect(result.success).toBe(true);
    expect(compilation.success).toBe(true);
    expect(compilation.workflow_compatible).toBe(true);
    expect(compilation.workflow?.identity.workflow_id).toBe('workflow.generate.report');
  });

  it('returns errors when planning result has no workflow', () => {
    const compilation = compilePlanningResult({
      success: false,
      goal: { goal_id: 'goal.empty', objective: '' },
      strategy_id: 'strategy.sequential',
      workflow: null,
      metadata: {},
      errors: [],
    });

    expect(compilation.success).toBe(false);
    expect(compilation.workflow_compatible).toBe(false);
  });

  it('rejects invalid workflows during planning validation', () => {
    const validator = createPlanningValidator();
    const invalidWorkflow = createWorkflowBuilder()
      .withIdentity({ workflow_id: 'workflow.invalid', workflow_version: '1.0.0' })
      .withEntryNodeId('entry')
      .withExitNodeId('exit')
      .addNode(createEntryNode('entry'))
      .addNode(createExitNode('exit'))
      .build();

    const result = validator.validatePlanningResult({
      success: true,
      goal: { goal_id: 'goal.invalid', objective: 'Invalid' },
      strategy_id: 'strategy.sequential',
      workflow: invalidWorkflow,
      metadata: {},
      errors: [],
    });

    expect(result.valid).toBe(false);
  });
});

describe('PlanningResult', () => {
  it('supports composite strategy planning', () => {
    const registry = createPlanningRegistry([
      createSequentialStrategy(),
      createConditionalStrategy(),
      createCompositeStrategy([createSequentialStrategy(), createConditionalStrategy()]),
    ]);
    const engine = createPlanningEngine({ registry });
    const result = engine.plan({
      goal: {
        objective: 'Composite flow',
        variables: {
          strategy: 'composite',
          compose: [
            { strategy_id: 'strategy.sequential', variables: { steps: ['prepare'] } },
            { strategy_id: 'strategy.sequential', variables: { steps: ['finalize'] } },
          ],
        },
      },
      strategy_id: 'strategy.composite',
    });

    expect(result.success).toBe(true);
    expect(result.workflow?.nodes.some((node) => node.identity.node_id.startsWith('composite.'))).toBe(true);
  });
});
