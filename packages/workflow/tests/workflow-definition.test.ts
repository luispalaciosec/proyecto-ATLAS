import { describe, expect, it } from 'vitest';

import {
  WORKFLOW_CYCLE_DETECTED,
  WORKFLOW_DUPLICATE_EDGE,
  WORKFLOW_DUPLICATE_NODE,
  WORKFLOW_EXIT_NOT_FOUND,
  WORKFLOW_INVALID_EDGE,
  WORKFLOW_ORPHAN_NODE,
  compileWorkflowDefinition,
  createWorkflowCompiler,
  createWorkflowEdge,
  createWorkflowFactory,
  createWorkflowGraph,
  createWorkflowNode,
  createWorkflowRegistry,
  createWorkflowValidator,
  validateWorkflowDefinition,
} from '../src/index.js';

function createLinearWorkflow() {
  const factory = createWorkflowFactory();
  const entry = createWorkflowNode({ node_id: 'entry', type: 'entry' });
  const stepA = createWorkflowNode({
    node_id: 'step.a',
    type: 'stage',
    configuration: { stage_id: 'stage.a' },
    dependencies: ['entry'],
  });
  const stepB = createWorkflowNode({
    node_id: 'step.b',
    type: 'stage',
    dependencies: ['step.a'],
  });
  const exit = createWorkflowNode({ node_id: 'exit', type: 'exit', dependencies: ['step.b'] });

  return factory.create({
    identity: { workflow_id: 'workflow.linear', workflow_version: '1.0.0' },
    metadata: { name: 'Linear Workflow', tags: ['demo'] },
    entry_node_id: 'entry',
    exit_node_id: 'exit',
    nodes: [entry, stepA, stepB, exit],
    edges: [
      createWorkflowEdge({ edge_id: 'e1', from_node_id: 'entry', to_node_id: 'step.a' }),
      createWorkflowEdge({ edge_id: 'e2', from_node_id: 'step.a', to_node_id: 'step.b' }),
      createWorkflowEdge({
        edge_id: 'e3',
        from_node_id: 'step.b',
        to_node_id: 'exit',
        condition: { expression: 'always' },
      }),
    ],
    variables: { region: 'us-east' },
  });
}

describe('WorkflowDefinition', () => {
  it('represents a directed graph with nodes, edges, entry, exit and variables', () => {
    const definition = createLinearWorkflow();

    expect(definition.identity.workflow_id).toBe('workflow.linear');
    expect(definition.nodes).toHaveLength(4);
    expect(definition.edges).toHaveLength(3);
    expect(definition.entry_node_id).toBe('entry');
    expect(definition.exit_node_id).toBe('exit');
    expect(definition.variables).toEqual({ region: 'us-east' });
  });
});

describe('WorkflowGraph', () => {
  it('registers nodes and edges and supports structural queries', () => {
    const graph = createWorkflowGraph();
    const entry = createWorkflowNode({ node_id: 'entry', type: 'entry' });
    const step = createWorkflowNode({ node_id: 'step', type: 'stage' });
    const exit = createWorkflowNode({ node_id: 'exit', type: 'exit' });

    graph.registerNode(entry);
    graph.registerNode(step);
    graph.registerNode(exit);
    graph.registerEdge(createWorkflowEdge({ edge_id: 'e1', from_node_id: 'entry', to_node_id: 'step' }));
    graph.registerEdge(createWorkflowEdge({ edge_id: 'e2', from_node_id: 'step', to_node_id: 'exit' }));

    expect(graph.getEntryNodes().map((node) => node.identity.node_id)).toEqual(['entry']);
    expect(graph.getExitNodes().map((node) => node.identity.node_id)).toEqual(['exit']);
    expect(graph.topologicalOrder().map((node) => node.identity.node_id)).toEqual([
      'entry',
      'step',
      'exit',
    ]);
    expect(graph.hasCycle()).toBe(false);
    expect(graph.validateStructure().valid).toBe(true);
  });

  it('detects cycles and invalid edges', () => {
    const graph = createWorkflowGraph();
    const a = createWorkflowNode({ node_id: 'a', type: 'stage' });
    const b = createWorkflowNode({ node_id: 'b', type: 'stage' });
    const c = createWorkflowNode({ node_id: 'c', type: 'stage' });

    graph.registerNode(a);
    graph.registerNode(b);
    graph.registerNode(c);
    graph.registerEdge(createWorkflowEdge({ edge_id: 'ab', from_node_id: 'a', to_node_id: 'b' }));
    graph.registerEdge(createWorkflowEdge({ edge_id: 'bc', from_node_id: 'b', to_node_id: 'c' }));
    graph.registerEdge(createWorkflowEdge({ edge_id: 'ca', from_node_id: 'c', to_node_id: 'a' }));

    expect(graph.hasCycle()).toBe(true);
    expect(graph.validateStructure().issues.some((issue) => issue.code === WORKFLOW_CYCLE_DETECTED)).toBe(
      true,
    );
    expect(() =>
      graph.registerEdge(createWorkflowEdge({ edge_id: 'missing', from_node_id: 'a', to_node_id: 'z' })),
    ).toThrow(/unknown nodes/);
  });
});

describe('WorkflowRegistry', () => {
  it('registers and resolves workflow definitions by id and version', () => {
    const registry = createWorkflowRegistry();
    const definition = createLinearWorkflow();

    registry.register(definition);

    expect(registry.get('workflow.linear', '1.0.0')).toBe(definition);
    expect(registry.list()).toHaveLength(1);
    expect(() => registry.register(definition)).toThrow(/already registered/);
  });
});

describe('WorkflowFactory', () => {
  it('builds definitions from params and from an existing graph', () => {
    const factory = createWorkflowFactory();
    const graph = createWorkflowGraph();
    const entry = createWorkflowNode({ node_id: 'entry', type: 'entry' });
    const exit = createWorkflowNode({ node_id: 'exit', type: 'exit' });

    graph.registerNode(entry);
    graph.registerNode(exit);
    graph.registerEdge(createWorkflowEdge({ edge_id: 'e1', from_node_id: 'entry', to_node_id: 'exit' }));

    const fromGraph = factory.fromGraph({
      identity: { workflow_id: 'workflow.graph', workflow_version: '1.0.0' },
      entry_node_id: 'entry',
      exit_node_id: 'exit',
      graph,
    });

    expect(fromGraph.nodes).toHaveLength(2);
    expect(fromGraph.edges).toHaveLength(1);
  });
});

describe('WorkflowValidator', () => {
  it('accepts a valid workflow definition', () => {
    const result = validateWorkflowDefinition(createLinearWorkflow());

    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('reports duplicate nodes, invalid edges, orphan nodes and missing entry/exit', () => {
    const factory = createWorkflowFactory();
    const invalid = factory.create({
      identity: { workflow_id: 'workflow.invalid', workflow_version: '1.0.0' },
      entry_node_id: 'a',
      exit_node_id: 'missing-exit',
      nodes: [
        createWorkflowNode({ node_id: 'a', type: 'stage' }),
        createWorkflowNode({ node_id: 'a', type: 'stage' }),
        createWorkflowNode({ node_id: 'orphan', type: 'stage', dependencies: ['ghost'] }),
      ],
      edges: [
        createWorkflowEdge({ edge_id: 'dup', from_node_id: 'a', to_node_id: 'ghost-node' }),
        createWorkflowEdge({ edge_id: 'dup', from_node_id: 'orphan', to_node_id: 'ghost-node' }),
      ],
    });

    const result = createWorkflowValidator().validate(invalid);
    const codes = result.issues.map((issue) => issue.code);

    expect(result.valid).toBe(false);
    expect(codes).toContain(WORKFLOW_DUPLICATE_NODE);
    expect(codes).toContain(WORKFLOW_DUPLICATE_EDGE);
    expect(codes).toContain(WORKFLOW_INVALID_EDGE);
    expect(codes).toContain(WORKFLOW_EXIT_NOT_FOUND);
    expect(codes).toContain(WORKFLOW_ORPHAN_NODE);
  });
});

describe('WorkflowCompiler', () => {
  it('compiles a valid workflow into a PipelineDefinition without executing anything', () => {
    const compiler = createWorkflowCompiler();
    const result = compiler.compile(createLinearWorkflow());

    expect(result.success).toBe(true);
    expect(result.pipeline).toEqual({
      pipeline_id: 'workflow.linear',
      stage_ids: ['stage.a', 'step.b'],
    });
    expect(result.plan?.ordered_node_ids).toEqual(['entry', 'step.a', 'step.b', 'exit']);
    expect(result.plan?.transitions).toHaveLength(3);
    expect(result.errors).toHaveLength(0);
  });

  it('returns validation errors instead of a pipeline when compilation is blocked', () => {
    const factory = createWorkflowFactory();
    const cyclic = factory.create({
      identity: { workflow_id: 'workflow.cycle', workflow_version: '1.0.0' },
      entry_node_id: 'a',
      exit_node_id: 'c',
      nodes: [
        createWorkflowNode({ node_id: 'a', type: 'stage' }),
        createWorkflowNode({ node_id: 'b', type: 'stage' }),
        createWorkflowNode({ node_id: 'c', type: 'stage' }),
      ],
      edges: [
        createWorkflowEdge({ edge_id: 'ab', from_node_id: 'a', to_node_id: 'b' }),
        createWorkflowEdge({ edge_id: 'bc', from_node_id: 'b', to_node_id: 'c' }),
        createWorkflowEdge({ edge_id: 'ca', from_node_id: 'c', to_node_id: 'a' }),
      ],
    });

    const result = compileWorkflowDefinition(cyclic);

    expect(result.success).toBe(false);
    expect(result.pipeline).toBeNull();
    expect(result.plan).toBeNull();
    expect(result.errors.some((issue) => issue.code === WORKFLOW_CYCLE_DETECTED)).toBe(true);
  });
});

describe('WorkflowExecutionPlan and WorkflowResult', () => {
  it('preserves ordered nodes, transitions and pipeline metadata in the plan', () => {
    const result = compileWorkflowDefinition(createLinearWorkflow());

    expect(result.plan?.workflow_id).toBe('workflow.linear');
    expect(result.plan?.workflow_version).toBe('1.0.0');
    expect(result.plan?.pipeline.pipeline_id).toBe('workflow.linear');
    expect(result.success).toBe(true);
  });
});
