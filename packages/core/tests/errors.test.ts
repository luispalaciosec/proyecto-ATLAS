import { describe, expect, it } from 'vitest';

import { createAtlasError, isAtlasError } from '../src/errors/index.js';
import { ERROR_SEVERITIES, isErrorSeverity } from '../src/errors/severity.js';
import { createTraceId } from '../src/trace-id.js';

describe('AtlasError', () => {
  it('creates a structured error contract', () => {
    const traceId = createTraceId('550e8400-e29b-41d4-a716-446655440000');
    const error = createAtlasError({
      code: 'CORE_TEST_ERROR',
      message: 'Test error message',
      severity: 'warning',
      module: '@atlas/core',
      trace_id: traceId,
      timestamp: '2026-07-18T10:00:00.000Z',
    });

    expect(error).toEqual({
      code: 'CORE_TEST_ERROR',
      message: 'Test error message',
      severity: 'warning',
      module: '@atlas/core',
      trace_id: traceId,
      timestamp: '2026-07-18T10:00:00.000Z',
    });
    expect(Object.isFrozen(error)).toBe(true);
  });

  it('generates trace_id and timestamp when omitted', () => {
    const error = createAtlasError({
      code: 'CORE_TEST_ERROR',
      message: 'Generated fields',
      severity: 'error',
      module: '@atlas/core',
    });

    expect(typeof error.trace_id).toBe('string');
    expect(typeof error.timestamp).toBe('string');
  });

  it('validates required fields', () => {
    expect(() =>
      createAtlasError({
        code: '',
        message: 'x',
        severity: 'error',
        module: '@atlas/core',
      }),
    ).toThrow('code must be a non-empty string');
  });

  it('identifies AtlasError objects', () => {
    const error = createAtlasError({
      code: 'CORE_TEST_ERROR',
      message: 'Known error',
      severity: 'critical',
      module: '@atlas/core',
    });

    expect(isAtlasError(error)).toBe(true);
    expect(isAtlasError({ code: 'x' })).toBe(false);
    expect(isAtlasError('text')).toBe(false);
  });
});

describe('ErrorSeverity', () => {
  it('defines a closed severity contract', () => {
    expect(ERROR_SEVERITIES).toEqual(['info', 'warning', 'error', 'critical']);
    expect(isErrorSeverity('warning')).toBe(true);
    expect(isErrorSeverity('custom')).toBe(false);
  });
});
