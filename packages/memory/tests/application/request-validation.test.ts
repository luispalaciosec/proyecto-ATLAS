import { describe, expect, it } from 'vitest';

import {
  validateDeleteMemoryRequest,
  validateRetrieveMemoryRequest,
  validateSearchMemoryRequest,
  validateStoreMemoryRequest,
  validateUpdateMemoryRequest,
  mergeRecordMetadata,
  resolveVersion,
} from '../../src/application/request-validation.js';
import { INVALID_MEMORY_RECORD, INVALID_QUERY } from '../../src/domain/errors/memory-error-codes.js';
import { createMemoryRecord } from './test-helpers.js';

describe('request validation', () => {
  it('rejects invalid store requests', () => {
    expect(validateStoreMemoryRequest({ record: createMemoryRecord({ id: '' }) }).ok).toBe(false);
    expect(validateStoreMemoryRequest({ sessionId: '  ', record: createMemoryRecord() }).ok).toBe(
      false,
    );
  });

  it('accepts valid store requests', () => {
    const result = validateStoreMemoryRequest({ record: createMemoryRecord() });

    expect(result.ok).toBe(true);
  });

  it('rejects invalid retrieve requests', () => {
    const result = validateRetrieveMemoryRequest({ recordId: '  ' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(INVALID_QUERY);
    }
  });

  it('rejects invalid delete requests', () => {
    const result = validateDeleteMemoryRequest({
      record: createMemoryRecord({ type: '' }),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(INVALID_MEMORY_RECORD);
    }
  });

  it('rejects invalid search queries', () => {
    const emptyNamespace = validateSearchMemoryRequest({
      query: { namespaceId: '  ' },
    });
    expect(emptyNamespace.ok).toBe(false);

    const missingQuery = validateSearchMemoryRequest({ query: undefined as never });
    expect(missingQuery.ok).toBe(false);
    if (!missingQuery.ok) {
      expect(missingQuery.error.code).toBe(INVALID_QUERY);
    }
  });

  it('rejects invalid update requests', () => {
    const result = validateUpdateMemoryRequest({
      record: createMemoryRecord({ timestamp: 'invalid-date' }),
    });

    expect(result.ok).toBe(false);
  });

  it('merges metadata and resolves versions', () => {
    const merged = mergeRecordMetadata(createMemoryRecord(), { source: 'application' });
    expect(merged.metadata.source).toBe('application');
    expect(resolveVersion(createMemoryRecord({ metadata: { version: 3 } }))).toBe(3);
    expect(resolveVersion(createMemoryRecord())).toBe(1);
  });
});
