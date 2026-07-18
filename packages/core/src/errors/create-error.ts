import { createAtlasTimestamp } from '../timestamp.js';
import { createTraceId, type TraceId } from '../trace-id.js';
import type { AtlasError } from './atlas-error.js';
import type { ErrorSeverity } from './severity.js';

const CORE_MODULE = '@atlas/core';

export interface CreateAtlasErrorParams {
  readonly code: string;
  readonly message: string;
  readonly severity: ErrorSeverity;
  readonly module: string;
  readonly trace_id?: TraceId | string;
  readonly timestamp?: string;
}

function assertNonEmpty(value: string, field: string): void {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${field} must be a non-empty string`);
  }
}

export function createAtlasError(params: CreateAtlasErrorParams): AtlasError {
  assertNonEmpty(params.code, 'code');
  assertNonEmpty(params.message, 'message');
  assertNonEmpty(params.module, 'module');
  assertNonEmpty(String(params.severity), 'severity');

  const traceId = params.trace_id ? createTraceId(String(params.trace_id)) : createTraceId();
  const timestamp = createAtlasTimestamp(params.timestamp);

  return Object.freeze({
    code: params.code.trim(),
    message: params.message.trim(),
    severity: params.severity,
    module: params.module.trim(),
    timestamp,
    trace_id: traceId,
  });
}

export function isAtlasError(value: unknown): value is AtlasError {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.code === 'string' &&
    typeof candidate.message === 'string' &&
    typeof candidate.severity === 'string' &&
    typeof candidate.module === 'string' &&
    typeof candidate.timestamp === 'string' &&
    typeof candidate.trace_id === 'string'
  );
}

export function createCoreError(
  code: string,
  message: string,
  severity: ErrorSeverity = 'error',
  traceId?: TraceId,
): AtlasError {
  return createAtlasError({
    code,
    message,
    severity,
    module: CORE_MODULE,
    trace_id: traceId,
  });
}
