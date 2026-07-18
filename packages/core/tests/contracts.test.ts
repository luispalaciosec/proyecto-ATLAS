import { describe, expect, it } from 'vitest';

import { EXECUTION_STATUSES, isExecutionStatus } from '../src/contracts/status.js';
import { createAtlasError } from '../src/errors/index.js';
import { createAtlasTimestamp } from '../src/timestamp.js';
import { createTraceId } from '../src/trace-id.js';
import type { EngineInput, EngineModuleContract, EngineOutput } from '../src/index.js';

describe('Engine contracts', () => {
  const traceId = createTraceId('550e8400-e29b-41d4-a716-446655440000');
  const timestamp = createAtlasTimestamp('2026-07-18T10:00:00.000Z');

  it('defines the input contract shape', () => {
    const input: EngineInput = {
      context: { organization: 'atlas' },
      request: { action: 'resolve' },
      configuration: { mode: 'strict' },
      metadata: { trace_id: traceId, timestamp, actor: 'system' },
    };

    expect(input.metadata.trace_id).toBe(traceId);
    expect(input.context.organization).toBe('atlas');
  });

  it('defines the output contract shape', () => {
    const output: EngineOutput<{ value: string }> = {
      status: 'completed',
      result: { value: 'ok' },
      events: [
        {
          name: 'ExecutionFinished',
          timestamp,
          trace_id: traceId,
          payload: { value: 'ok' },
          source: '@atlas/core',
        },
      ],
      metrics: { duration_ms: 12 },
      errors: [],
    };

    expect(output.status).toBe('completed');
    expect(output.events[0]?.name).toBe('ExecutionFinished');
  });

  it('supports AtlasError entries in output.errors', () => {
    const output: EngineOutput = {
      status: 'failed',
      result: null,
      events: [],
      metrics: {},
      errors: [
        createAtlasError({
          code: 'CORE_TEST_ERROR',
          message: 'Failure',
          severity: 'error',
          module: '@atlas/core',
          trace_id: traceId,
          timestamp,
        }),
      ],
    };

    expect(output.errors[0]?.code).toBe('CORE_TEST_ERROR');
  });

  it('defines execution statuses from lifecycle', () => {
    expect(EXECUTION_STATUSES).toEqual(['pending', 'running', 'completed', 'failed', 'cancelled']);
    expect(isExecutionStatus('running')).toBe(true);
    expect(isExecutionStatus('cancelled')).toBe(true);
    expect(isExecutionStatus('unknown')).toBe(false);
  });

  it('defines module contract typing', async () => {
    const module: EngineModuleContract<{ extra: string }, { done: boolean }> = {
      module: '@atlas/example',
      async execute(input) {
        return {
          status: 'completed',
          result: { done: input.extra === 'yes' },
          events: [],
          metrics: {},
          errors: [],
        };
      },
    };

    const result = await module.execute({
      context: {},
      request: {},
      configuration: {},
      metadata: { trace_id: traceId, timestamp },
      extra: 'yes',
    });

    expect(result.result.done).toBe(true);
  });
});

describe('Public API surface', () => {
  it('exports only approved runtime symbols from index.ts', async () => {
    const publicApi = await import('../src/index.js');
    const exportedKeys = Object.keys(publicApi).sort();

    expect(exportedKeys).toEqual([
      'Identifier',
      'Metadata',
      'Namespace',
      'Version',
      'createAtlasError',
      'isAtlasError',
    ]);
  });
});
