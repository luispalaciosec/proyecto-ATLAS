import { describe, expect, it } from 'vitest';

import {
  createApplicationError,
  mapEngineError,
} from '../../src/application/errors/ApplicationError.js';
import {
  INVALID_MEMORY_RECORD,
  INVALID_QUERY,
  MEMORY_NOT_FOUND,
  MEMORY_RETRIEVAL_ERROR,
  MEMORY_STORAGE_ERROR,
} from '../../src/domain/errors/memory-error-codes.js';
import {
  createEngineError,
  ENGINE_CONSISTENCY,
  ENGINE_DOMAIN_VALIDATION,
  ENGINE_STORE,
} from '../../src/engine/engine-errors.js';

describe('ApplicationError', () => {
  it('creates frozen application errors', () => {
    const error = createApplicationError(INVALID_MEMORY_RECORD, 'invalid record');

    expect(error.code).toBe(INVALID_MEMORY_RECORD);
    expect(error.message).toBe('invalid record');
    expect(Object.isFrozen(error)).toBe(true);
  });

  it('maps engine domain validation errors to InvalidMemoryRecordError', () => {
    const mapped = mapEngineError(
      createEngineError(ENGINE_DOMAIN_VALIDATION, 'domain validation failed'),
    );

    expect(mapped.code).toBe(INVALID_MEMORY_RECORD);
  });

  it('maps engine store errors to MemoryStorageError', () => {
    const mapped = mapEngineError(createEngineError(ENGINE_STORE, 'store failed'));

    expect(mapped.code).toBe(MEMORY_STORAGE_ERROR);
  });

  it('maps unknown canonical codes to InvalidMemoryRecordError', () => {
    const mapped = mapEngineError(
      createEngineError(ENGINE_CONSISTENCY, 'consistency failed', {
        canonicalCode: 'BrokenReference',
      }),
    );

    expect(mapped.code).toBe(INVALID_MEMORY_RECORD);
  });

  it('preserves allowed canonical codes', () => {
    const mapped = mapEngineError(
      createEngineError(ENGINE_STORE, 'not found', {
        canonicalCode: MEMORY_NOT_FOUND,
      }),
    );

    expect(mapped.code).toBe(MEMORY_NOT_FOUND);
  });

  it('supports retrieval and query codes without inventing new ones', () => {
    expect(
      mapEngineError(
        createEngineError(ENGINE_STORE, 'retrieval failed', {
          canonicalCode: MEMORY_RETRIEVAL_ERROR,
        }),
      ).code,
    ).toBe(MEMORY_RETRIEVAL_ERROR);

    expect(
      mapEngineError(
        createEngineError(ENGINE_STORE, 'invalid query', {
          canonicalCode: INVALID_QUERY,
        }),
      ).code,
    ).toBe(INVALID_QUERY);
  });
});
