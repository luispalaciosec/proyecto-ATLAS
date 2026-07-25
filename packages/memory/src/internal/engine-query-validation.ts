import type { Result } from '@atlas/core';

import { INVALID_QUERY } from '../domain/errors/memory-error-codes.js';
import type { MemoryQuery } from '../domain/types/memory-types.js';
import {
  createEngineError,
  ENGINE_QUERY_VALIDATION,
  type EngineError,
} from '../engine/engine-errors.js';
import { memoryErr, memoryOk } from './result.js';

export function validateEngineMemoryQuery(query: MemoryQuery): Result<MemoryQuery, EngineError> {
  if (typeof query !== 'object' || query === null) {
    return memoryErr(
      createEngineError(ENGINE_QUERY_VALIDATION, 'MemoryQuery is required', {
        canonicalCode: INVALID_QUERY,
      }),
    );
  }

  if (query.namespaceId !== undefined && query.namespaceId.trim().length === 0) {
    return memoryErr(
      createEngineError(ENGINE_QUERY_VALIDATION, 'query.namespaceId must not be empty when provided', {
        canonicalCode: INVALID_QUERY,
      }),
    );
  }

  if (query.collectionId !== undefined && query.collectionId.trim().length === 0) {
    return memoryErr(
      createEngineError(ENGINE_QUERY_VALIDATION, 'query.collectionId must not be empty when provided', {
        canonicalCode: INVALID_QUERY,
      }),
    );
  }

  if (query.recordType !== undefined && query.recordType.trim().length === 0) {
    return memoryErr(
      createEngineError(ENGINE_QUERY_VALIDATION, 'query.recordType must not be empty when provided', {
        canonicalCode: INVALID_QUERY,
      }),
    );
  }

  return memoryOk(query);
}

export function validateRetrieveEngineRequest(
  recordId: string | undefined,
): Result<string, EngineError> {
  if (recordId === undefined || recordId.trim().length === 0) {
    return memoryErr(
      createEngineError(ENGINE_QUERY_VALIDATION, 'recordId is required for retrieve', {
        canonicalCode: INVALID_QUERY,
      }),
    );
  }

  return memoryOk(recordId.trim());
}
