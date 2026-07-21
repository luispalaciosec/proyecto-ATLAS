import { describe, expect, it } from 'vitest';

import { createArtifact } from '@atlas/compiler';

import { createExecutionRepository } from '../../src/engine/execution-repository.js';
import type { Execution } from '../../src/engine/execution-aggregate.js';
import { createDeterministicClock } from './helpers.js';

describe('Execution Aggregate', () => {
  it('stores identity, metadata, lifecycle, state, events, outputs, metrics, diagnostics and result in one root', async () => {
    const clock = createDeterministicClock('2026-07-20T12:00:00.000Z');
    const repository = createExecutionRepository({ clock });
    const artifact = createArtifact({
      id: 'artifact.aggregate',
      kind: 'summary',
      content: { nodes: 2 },
    });

    repository.begin({ artifacts: [artifact], workspace: { name: 'aggregate' } }, 'session.aggregate');
    repository.transition('session.aggregate', 'initialized');
    repository.transition('session.aggregate', 'prepared');
    repository.transition('session.aggregate', 'running');
    repository.setOutputs('session.aggregate', [
      Object.freeze({
        artifact_id: artifact.id,
        kind: artifact.kind,
        result: artifact.content,
        success: true,
      }),
    ]);
    repository.transition('session.aggregate', 'completing', { success: true, output_count: 1 });
    repository.transition('session.aggregate', 'completed', { success: true, output_count: 1 });
    repository.transition('session.aggregate', 'archived', { success: true, output_count: 1 });

    const execution: Execution | null = repository.get('session.aggregate');

    expect(execution).not.toBeNull();
    expect(execution?.identity.execution_id).toBe('session.aggregate');
    expect(execution?.metadata.workspace).toEqual({ name: 'aggregate' });
    expect(execution?.lifecycle.current).toBe('archived');
    expect(execution?.state.value.output_count).toBe(1);
    expect(execution?.outputs).toHaveLength(1);
    expect(execution?.metrics.artifact_count).toBe(1);
    expect(execution?.diagnostics.records.length).toBeGreaterThan(0);
  });

  it('does not duplicate lifecycle history outside the aggregate', () => {
    const repository = createExecutionRepository({ clock: createDeterministicClock() });
    repository.begin({ artifacts: [] }, 'session.single');

    const first = repository.get('session.single');
    repository.transition('session.single', 'initialized');
    const second = repository.get('session.single');

    expect(first?.lifecycle.history).toHaveLength(1);
    expect(second?.lifecycle.history).toHaveLength(2);
    expect(second?.lifecycle.history).not.toBe(first?.lifecycle.history);
  });
});

describe('Execution Identity', () => {
  it('binds execution_id and correlation_id', () => {
    const repository = createExecutionRepository();
    repository.begin({ artifacts: [] }, 'session.identity');

    expect(repository.get('session.identity')?.identity).toEqual({
      execution_id: 'session.identity',
      correlation_id: 'session.identity',
    });
  });
});

describe('Execution Context', () => {
  it('remains attached to the aggregate from creation', () => {
    const repository = createExecutionRepository();
    repository.begin(
      { artifacts: [], workspace: { project: 'atlas' }, metadata: { owner: 'runtime' } },
      'session.context',
    );

    const execution = repository.get('session.context');

    expect(execution?.context.workspace).toEqual({ project: 'atlas' });
    expect(execution?.metadata.custom).toEqual({ owner: 'runtime' });
  });
});

describe('Execution Result', () => {
  it('is stored on the aggregate when finalized', () => {
    const repository = createExecutionRepository({ clock: createDeterministicClock() });
    repository.begin({ artifacts: [] }, 'session.result');
    const aggregate = repository.get('session.result')!;

    const result = Object.freeze({
      context: aggregate.context,
      success: true,
    });

    repository.finalizeCompatContext('session.result', aggregate.context, result);

    expect(repository.get('session.result')?.result?.success).toBe(true);
  });
});
