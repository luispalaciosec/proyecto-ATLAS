import { describe, expect, it } from 'vitest';

import {
  Atlas,
  CompilerCompletedEvent,
  createArtifact,
  createAtlas,
  RuntimeCompletedEvent,
  RuntimeStartedEvent,
  type CompilerCompletedPayload,
  type RuntimeCompletedPayload,
  type RuntimeStartedPayload,
} from '../src/index.js';

describe('Atlas SDK facade', () => {
  it('creates an Atlas instance with compiler, runtime, memory, planning, workflow, and events modules', () => {
    const atlas = createAtlas({ workspace: { name: 'test-workspace' } });

    expect(atlas.compiler).toBeDefined();
    expect(atlas.runtime).toBeDefined();
    expect(atlas.memory).toBeDefined();
    expect(atlas.planning).toBeDefined();
    expect(atlas.workflow).toBeDefined();
    expect(atlas.events).toBeDefined();
  });

  it('compiles units and publishes CompilerCompletedEvent to subscribers', async () => {
    const atlas = createAtlas({
      workspace: { name: 'sdk-test' },
      compiler: {
        generators: () => [
          {
            id: 'summary-generator',
            supported_formats: ['summary'],
            generate: (graph) => [
              createArtifact({
                id: 'artifact.sdk-test',
                kind: 'summary',
                content: { nodes: graph.nodes.length },
                source_graph_id: graph.id,
              }),
            ],
          },
        ],
      },
    });

    const payloads: CompilerCompletedPayload[] = [];

    atlas.events.subscribe(CompilerCompletedEvent, (event) => {
      payloads.push(event.payload);
    });

    const result = await atlas.compiler.compile({
      units: [
        {
          id: 'doc.sdk',
          origin: 'memory://doc.sdk',
          checksum: 'sha256:sdk',
          version: '1.0.0',
          source: { body: 'sdk-test' },
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.context.artifacts).toHaveLength(1);
    expect(payloads).toHaveLength(1);
    expect(payloads[0]).toEqual({
      success: true,
      lifecycle: 'complete',
      artifact_count: 1,
      unit_count: 1,
      graph_id: 'mir.workspace',
    });
  });

  it('does not notify subscribers when compilation runs on a separate Atlas instance', async () => {
    const busAtlas = createAtlas();
    const isolatedAtlas = createAtlas();

    let count = 0;
    busAtlas.events.subscribe(CompilerCompletedEvent, () => {
      count += 1;
    });

    await isolatedAtlas.compiler.compile({
      units: [
        {
          id: 'doc.isolated',
          origin: 'memory://doc.isolated',
          checksum: 'sha256:isolated',
          version: '1.0.0',
          source: { body: 'isolated' },
        },
      ],
    });

    expect(count).toBe(0);
  });

  it('uses a shared event bus between compiler and events on the same Atlas instance', async () => {
    const atlas = new Atlas({
      workspace: { name: 'shared-bus' },
    });

    let received = false;

    atlas.events.subscribe(CompilerCompletedEvent, () => {
      received = true;
    });

    await atlas.compiler.compile();
    expect(received).toBe(true);
  });

  it('unsubscribes event handlers through the events module', async () => {
    const atlas = createAtlas();
    let count = 0;

    const unsubscribe = atlas.events.subscribe(CompilerCompletedEvent, () => {
      count += 1;
    });

    await atlas.compiler.compile();
    unsubscribe();
    await atlas.compiler.compile();

    expect(count).toBe(1);
  });

  it('compiles and executes artifacts through the shared SDK facade', async () => {
    const atlas = createAtlas({
      workspace: { name: 'compile-run' },
      compiler: {
        generators: () => [
          {
            id: 'summary-generator',
            supported_formats: ['summary'],
            generate: (graph) => [
              createArtifact({
                id: 'artifact.compile-run',
                kind: 'summary',
                content: { nodes: graph.nodes.length },
                source_graph_id: graph.id,
              }),
            ],
          },
        ],
      },
    });

    const started: RuntimeStartedPayload[] = [];
    const completed: RuntimeCompletedPayload[] = [];

    atlas.events.subscribe(RuntimeStartedEvent, (event) => {
      started.push(event.payload);
    });
    atlas.events.subscribe(RuntimeCompletedEvent, (event) => {
      completed.push(event.payload);
    });

    const compileResult = await atlas.compiler.compile({
      units: [
        {
          id: 'doc.run',
          origin: 'memory://doc.run',
          checksum: 'sha256:run',
          version: '1.0.0',
          source: { body: 'compile-run' },
        },
      ],
    });

    const executionResult = await atlas.runtime.execute({
      artifacts: compileResult.context.artifacts,
    });

    expect(compileResult.success).toBe(true);
    expect(executionResult.success).toBe(true);
    expect(executionResult.context.outputs).toHaveLength(1);
    expect(started).toHaveLength(1);
    expect(completed).toHaveLength(1);
    expect(completed[0]?.success).toBe(true);
  });
});
