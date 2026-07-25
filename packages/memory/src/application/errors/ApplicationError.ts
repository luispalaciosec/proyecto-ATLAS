import type { Result } from '@atlas/core';

import {
  INVALID_MEMORY_RECORD,
  INVALID_QUERY,
  MEMORY_NOT_FOUND,
  MEMORY_RETRIEVAL_ERROR,
  MEMORY_STORAGE_ERROR,
} from '../../domain/errors/memory-error-codes.js';
import type { EngineError } from '../../engine/engine-errors.js';
import { memoryErr } from '../../internal/result.js';

export type ApplicationErrorCode =
  | typeof INVALID_MEMORY_RECORD
  | typeof MEMORY_NOT_FOUND
  | typeof MEMORY_STORAGE_ERROR
  | typeof MEMORY_RETRIEVAL_ERROR
  | typeof INVALID_QUERY;

export interface ApplicationError {
  readonly code: ApplicationErrorCode;
  readonly message: string;
  readonly cause?: unknown;
}

const APPLICATION_ERROR_CODES = new Set<string>([
  INVALID_MEMORY_RECORD,
  MEMORY_NOT_FOUND,
  MEMORY_STORAGE_ERROR,
  MEMORY_RETRIEVAL_ERROR,
  INVALID_QUERY,
]);

export function createApplicationError(
  code: ApplicationErrorCode,
  message: string,
  cause?: unknown,
): ApplicationError {
  return Object.freeze({
    code,
    message,
    ...(cause === undefined ? {} : { cause }),
  });
}

export function mapEngineError(error: EngineError): ApplicationError {
  const code = APPLICATION_ERROR_CODES.has(error.canonicalCode)
    ? (error.canonicalCode as ApplicationErrorCode)
    : INVALID_MEMORY_RECORD;

  return createApplicationError(code, error.message, error.cause);
}

export function applicationValidationError(
  code: ApplicationErrorCode,
  message: string,
): Result<never, ApplicationError> {
  return memoryErr(createApplicationError(code, message));
}
