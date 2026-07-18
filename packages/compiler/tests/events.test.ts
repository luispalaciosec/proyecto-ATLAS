import { describe, expect, it } from 'vitest';

import {
  createAtlasCompiler,
  createCompilationContext,
  createCompilationUnit,
  createDefaultCompilerPipeline,
  createDefaultCompilerStages,
} from '../src/index.js';
import {
  CompilerCompletedEvent,
  createInMemoryEventBus,
  type CompilerCompletedPayload,
} from '@atlas/events';

describe('AtlasCompiler event integration', () => {
  it('publishes CompilerCompletedEvent when an event bus is configured', async () => {
    const bus = createInMemoryEventBus();
    const received: CompilerCompletedPayload[] = [];

    bus.subscribe(CompilerCompletedEvent, (event) => {
      received.push(event.payload);
    });

    const unit = createCompilationUnit({
      id: 'doc.event',
      origin: 'memory://doc.event',
      checksum: 'sha256:event',
      version: '1.0.0',
      source: { body: 'event-test' },
    });

    const compiler = createAtlasCompiler(
      createDefaultCompilerPipeline({ stages: createDefaultCompilerStages() }),
      { eventBus: bus },
    );

    const result = await compiler.compile(createCompilationContext({ units: [unit] }));

    expect(result.success).toBe(true);
    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({
      success: true,
      lifecycle: 'complete',
      artifact_count: 0,
      unit_count: 1,
      graph_id: 'mir.workspace',
    });
  });

  it('does not publish when no event bus is configured', async () => {
    const bus = createInMemoryEventBus();
    let count = 0;

    bus.subscribe(CompilerCompletedEvent, () => {
      count += 1;
    });

    const compiler = createAtlasCompiler(
      createDefaultCompilerPipeline({ stages: createDefaultCompilerStages() }),
    );

    await compiler.compile(createCompilationContext());
    expect(count).toBe(0);
  });
});
