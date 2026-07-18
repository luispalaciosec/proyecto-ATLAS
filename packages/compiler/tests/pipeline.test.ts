import { describe, expect, it } from 'vitest';

import {
  createArtifact,
  createAtlasCompiler,
  createCompilationContext,
  createCompilationUnit,
  createDefaultCompilerPipeline,
  createDefaultCompilerStages,
  createGeneratorRegistry,
  createPublisherRegistry,
  defineCompilerStage,
} from '../src/index.js';

describe('Default compiler pipeline', () => {
  it('runs the official stage order deterministically', () => {
    const unit = createCompilationUnit({
      id: 'doc.alpha',
      origin: 'memory://doc.alpha',
      checksum: 'sha256:alpha',
      version: '1.0.0',
      source: { body: 'alpha' },
      metadata: { kind: 'DocumentNode' },
    });

    const pipeline = createDefaultCompilerPipeline({
      stages: createDefaultCompilerStages(),
    });
    const context = createCompilationContext({ units: [unit] });
    const result = pipeline.run(context);

    expect(result.lifecycle).toBe('complete');
    expect(result.current_stage).toBeNull();
    expect(result.hir).toHaveLength(1);
    expect(result.mir?.nodes).toHaveLength(1);
    expect(result.mir?.id.toJSON()).toBe('mir.workspace');
  });

  it('stops on blocking diagnostics and marks lifecycle cancelled', () => {
    const failingStage = defineCompilerStage({
      id: 'validation',
      name: 'Forced Validation Failure',
      lifecycle: 'validate',
      validatePreconditions: () => [
        {
          id: 'diag-error',
          severity: 'error',
          location: {},
          message: 'Blocking diagnostic',
        },
      ],
      transform: (context) => context,
    });

    const pipeline = createDefaultCompilerPipeline({
      stages: [failingStage],
      stopOnError: true,
    });

    const result = pipeline.run(createCompilationContext());
    expect(result.lifecycle).toBe('cancelled');
  });

  it('invokes generators and publishers through registries', () => {
    const unit = createCompilationUnit({
      id: 'doc.beta',
      origin: 'memory://doc.beta',
      checksum: 'sha256:beta',
      version: '1.0.0',
      source: { body: 'beta' },
    });

    const generatorRegistry = createGeneratorRegistry([
      {
        id: 'markdown-generator',
        supported_formats: ['markdown'],
        generate: (graph) => [
          createArtifact({
            id: 'artifact.markdown',
            kind: 'markdown',
            content: { nodeCount: graph.nodes.length },
            source_graph_id: graph.id,
          }),
        ],
      },
    ]);

    const publisherRegistry = createPublisherRegistry([
      {
        id: 'local-publisher',
        supported_targets: ['local'],
        publish: () => [
          {
            id: 'diag-publish',
            severity: 'information',
            location: {},
            message: 'Published locally',
          },
        ],
      },
    ]);

    const pipeline = createDefaultCompilerPipeline({
      stages: createDefaultCompilerStages({
        generators: () => generatorRegistry.list(),
        publishers: () => publisherRegistry.list(),
      }),
    });

    const result = pipeline.run(createCompilationContext({ units: [unit] }));

    expect(result.artifacts).toHaveLength(1);
    expect(result.diagnostics.some((item) => item.message === 'Published locally')).toBe(true);
  });
});

describe('AtlasCompiler', () => {
  it('returns a successful compilation result for valid input', async () => {
    const compiler = createAtlasCompiler(
      createDefaultCompilerPipeline({ stages: createDefaultCompilerStages() }),
    );

    const unit = createCompilationUnit({
      id: 'doc.gamma',
      origin: 'memory://doc.gamma',
      checksum: 'sha256:gamma',
      version: '1.0.0',
      source: {},
    });

    const result = await compiler.compile(createCompilationContext({ units: [unit] }));

    expect(compiler.module).toBe('@atlas/compiler');
    expect(result.success).toBe(true);
    expect(result.context.lifecycle).toBe('complete');
  });

  it('returns success=false when compilation is cancelled', async () => {
    const compiler = createAtlasCompiler(
      createDefaultCompilerPipeline({
        stages: createDefaultCompilerStages(),
        stopOnError: true,
      }),
    );

    const result = await compiler.compile(createCompilationContext());

    expect(result.success).toBe(false);
    expect(result.context.lifecycle).toBe('cancelled');
  });
});
