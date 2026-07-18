import { describe, expect, it } from 'vitest';

import { err, isErr, isOk, ok } from '../src/result.js';
import { createAtlasTimestamp, isAtlasTimestamp, now } from '../src/timestamp.js';
import { createTraceId, isTraceId } from '../src/trace-id.js';

describe('TraceId', () => {
  it('creates a valid trace id', () => {
    const traceId = createTraceId('550e8400-e29b-41d4-a716-446655440000');
    expect(isTraceId(traceId)).toBe(true);
  });

  it('generates a trace id when omitted', () => {
    const traceId = createTraceId();
    expect(isTraceId(traceId)).toBe(true);
  });

  it('rejects invalid trace ids', () => {
    expect(() => createTraceId('not-a-uuid')).toThrow('Invalid TraceId format');
  });
});

describe('AtlasTimestamp', () => {
  it('creates ISO timestamps', () => {
    const timestamp = createAtlasTimestamp('2026-07-18T10:00:00.000Z');
    expect(isAtlasTimestamp(timestamp)).toBe(true);
    expect(timestamp).toBe('2026-07-18T10:00:00.000Z');
  });

  it('creates timestamps from Date', () => {
    const timestamp = createAtlasTimestamp(new Date('2026-07-18T10:00:00.000Z'));
    expect(timestamp).toBe('2026-07-18T10:00:00.000Z');
  });

  it('returns current time with now()', () => {
    expect(isAtlasTimestamp(now())).toBe(true);
  });

  it('rejects invalid timestamps', () => {
    expect(() => createAtlasTimestamp('invalid')).toThrow('Invalid AtlasTimestamp format');
  });
});

describe('Result', () => {
  it('represents success', () => {
    const result = ok('value');
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toBe('value');
    }
  });

  it('represents failure', () => {
    const result = err({ code: 'FAILED' });
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error).toEqual({ code: 'FAILED' });
    }
  });
});
