import {
  INVALID_MEMORY_RECORD,
  INVALID_QUERY,
  MEMORY_NOT_FOUND,
  MEMORY_RETRIEVAL_ERROR,
  MEMORY_STORAGE_ERROR,
} from '../domain/errors/memory-error-codes.js';
import type { ValidationIssue } from '../domain/types/memory-types.js';

export const ENGINE_DOMAIN_VALIDATION = 'ENGINE_DOMAIN_VALIDATION';
export const ENGINE_CONSISTENCY = 'ENGINE_CONSISTENCY';
export const ENGINE_STORE = 'ENGINE_STORE';
export const ENGINE_QUERY_VALIDATION = 'ENGINE_QUERY_VALIDATION';
export const ENGINE_NOT_FOUND = 'ENGINE_NOT_FOUND';
export const ENGINE_RETRIEVAL = 'ENGINE_RETRIEVAL';

export type EngineErrorCode =
  | typeof ENGINE_DOMAIN_VALIDATION
  | typeof ENGINE_CONSISTENCY
  | typeof ENGINE_STORE
  | typeof ENGINE_QUERY_VALIDATION
  | typeof ENGINE_NOT_FOUND
  | typeof ENGINE_RETRIEVAL;

const ENGINE_TO_CANONICAL: Record<EngineErrorCode, string> = {
  [ENGINE_DOMAIN_VALIDATION]: INVALID_MEMORY_RECORD,
  [ENGINE_CONSISTENCY]: INVALID_MEMORY_RECORD,
  [ENGINE_STORE]: MEMORY_STORAGE_ERROR,
  [ENGINE_QUERY_VALIDATION]: INVALID_QUERY,
  [ENGINE_NOT_FOUND]: MEMORY_NOT_FOUND,
  [ENGINE_RETRIEVAL]: MEMORY_RETRIEVAL_ERROR,
};

export interface EngineError {
  readonly code: EngineErrorCode;
  readonly canonicalCode: string;
  readonly message: string;
  readonly issues?: readonly ValidationIssue[];
  readonly cause?: unknown;
}

function resolveCanonicalCode(
  code: EngineErrorCode,
  issues?: readonly ValidationIssue[],
  override?: string,
): string {
  if (override !== undefined) {
    return override;
  }

  if (code === ENGINE_CONSISTENCY && issues !== undefined && issues.length > 0) {
    return issues[0]!.code;
  }

  return ENGINE_TO_CANONICAL[code];
}

export function createEngineError(
  code: EngineErrorCode,
  message: string,
  options?: {
    readonly issues?: readonly ValidationIssue[];
    readonly cause?: unknown;
    readonly canonicalCode?: string;
  },
): EngineError {
  return Object.freeze({
    code,
    canonicalCode: resolveCanonicalCode(code, options?.issues, options?.canonicalCode),
    message,
    ...(options?.issues === undefined ? {} : { issues: Object.freeze([...options.issues]) }),
    ...(options?.cause === undefined ? {} : { cause: options.cause }),
  });
}
