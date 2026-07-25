import type { Result } from '@atlas/core';

import { INVALID_MEMORY_RECORD, INVALID_QUERY } from '../domain/errors/memory-error-codes.js';
import type { MemoryRecord, MemoryQuery } from '../domain/types/memory-types.js';
import { memoryOk } from '../internal/result.js';

import type { DeleteMemoryRequest } from './contracts/DeleteMemoryRequest.js';
import type { RetrieveMemoryRequest } from './contracts/RetrieveMemoryRequest.js';
import type { SearchMemoryRequest } from './contracts/SearchMemoryRequest.js';
import type { StoreMemoryRequest } from './contracts/StoreMemoryRequest.js';
import type { UpdateMemoryRequest } from './contracts/UpdateMemoryRequest.js';
import {
  applicationValidationError,
  type ApplicationError,
} from './errors/ApplicationError.js';

function validateSessionId(sessionId: string | undefined): Result<void, ApplicationError> {
  if (sessionId === undefined) {
    return memoryOk(undefined);
  }

  if (sessionId.trim().length === 0) {
    return applicationValidationError(INVALID_QUERY, 'sessionId must not be empty when provided');
  }

  return memoryOk(undefined);
}

function validateMemoryRecordShape(record: MemoryRecord | undefined): Result<MemoryRecord, ApplicationError> {
  if (record === undefined) {
    return applicationValidationError(INVALID_MEMORY_RECORD, 'record is required');
  }

  if (record.id.trim().length === 0) {
    return applicationValidationError(INVALID_MEMORY_RECORD, 'record.id must not be empty');
  }

  if (record.type.trim().length === 0) {
    return applicationValidationError(INVALID_MEMORY_RECORD, 'record.type must not be empty');
  }

  if (Number.isNaN(Date.parse(record.timestamp))) {
    return applicationValidationError(INVALID_MEMORY_RECORD, 'record.timestamp must be a valid ISO date');
  }

  return memoryOk(record);
}

function validateMemoryQuery(query: MemoryQuery | undefined): Result<MemoryQuery, ApplicationError> {
  if (query === undefined || typeof query !== 'object') {
    return applicationValidationError(INVALID_QUERY, 'query is required');
  }

  if (query.namespaceId !== undefined && query.namespaceId.trim().length === 0) {
    return applicationValidationError(INVALID_QUERY, 'query.namespaceId must not be empty when provided');
  }

  if (query.collectionId !== undefined && query.collectionId.trim().length === 0) {
    return applicationValidationError(INVALID_QUERY, 'query.collectionId must not be empty when provided');
  }

  if (query.recordType !== undefined && query.recordType.trim().length === 0) {
    return applicationValidationError(INVALID_QUERY, 'query.recordType must not be empty when provided');
  }

  return memoryOk(query);
}

export function validateStoreMemoryRequest(
  request: StoreMemoryRequest,
): Result<StoreMemoryRequest, ApplicationError> {
  const sessionValidation = validateSessionId(request.sessionId);
  if (!sessionValidation.ok) {
    return sessionValidation;
  }

  const recordValidation = validateMemoryRecordShape(request.record);
  if (!recordValidation.ok) {
    return recordValidation;
  }

  return memoryOk(request);
}

export function validateRetrieveMemoryRequest(
  request: RetrieveMemoryRequest,
): Result<RetrieveMemoryRequest, ApplicationError> {
  const sessionValidation = validateSessionId(request.sessionId);
  if (!sessionValidation.ok) {
    return sessionValidation;
  }

  if (request.recordId !== undefined && request.recordId.trim().length === 0) {
    return applicationValidationError(INVALID_QUERY, 'recordId must not be empty when provided');
  }

  return memoryOk(request);
}

export function validateDeleteMemoryRequest(
  request: DeleteMemoryRequest,
): Result<DeleteMemoryRequest, ApplicationError> {
  const sessionValidation = validateSessionId(request.sessionId);
  if (!sessionValidation.ok) {
    return sessionValidation;
  }

  const recordValidation = validateMemoryRecordShape(request.record);
  if (!recordValidation.ok) {
    return recordValidation;
  }

  return memoryOk(request);
}

export function validateSearchMemoryRequest(
  request: SearchMemoryRequest,
): Result<SearchMemoryRequest, ApplicationError> {
  const sessionValidation = validateSessionId(request.sessionId);
  if (!sessionValidation.ok) {
    return sessionValidation;
  }

  const queryValidation = validateMemoryQuery(request.query);
  if (!queryValidation.ok) {
    return queryValidation;
  }

  return memoryOk({
    ...request,
    query: queryValidation.value,
  });
}

export function validateUpdateMemoryRequest(
  request: UpdateMemoryRequest,
): Result<UpdateMemoryRequest, ApplicationError> {
  const sessionValidation = validateSessionId(request.sessionId);
  if (!sessionValidation.ok) {
    return sessionValidation;
  }

  const recordValidation = validateMemoryRecordShape(request.record);
  if (!recordValidation.ok) {
    return recordValidation;
  }

  return memoryOk(request);
}

export function mergeRecordMetadata(
  record: MemoryRecord,
  metadata: Readonly<Record<string, unknown>> | undefined,
): MemoryRecord {
  if (metadata === undefined || Object.keys(metadata).length === 0) {
    return record;
  }

  return Object.freeze({
    ...record,
    metadata: Object.freeze({
      ...record.metadata,
      ...metadata,
    }),
  });
}

export function resolveVersion(record: MemoryRecord, fallback = 1): number {
  const version = record.metadata.version;
  return typeof version === 'number' && Number.isFinite(version) && version > 0 ? version : fallback;
}
