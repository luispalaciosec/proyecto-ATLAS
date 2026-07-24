import {
  INVALID_MEMORY_RECORD,
  MEMORY_STORAGE_ERROR,
} from '../domain/errors/create-memory-error.js';
import type { ValidationIssue } from '../domain/types/memory-types.js';

export const ENGINE_DOMAIN_VALIDATION = 'ENGINE_DOMAIN_VALIDATION';
export const ENGINE_CONSISTENCY = 'ENGINE_CONSISTENCY';
export const ENGINE_STORE = 'ENGINE_STORE';

export type EngineErrorCode =
  | typeof ENGINE_DOMAIN_VALIDATION
  | typeof ENGINE_CONSISTENCY
  | typeof ENGINE_STORE;

const ENGINE_TO_CANONICAL: Record<EngineErrorCode, string> = {
  [ENGINE_DOMAIN_VALIDATION]: INVALID_MEMORY_RECORD,
  [ENGINE_CONSISTENCY]: INVALID_MEMORY_RECORD,
  [ENGINE_STORE]: MEMORY_STORAGE_ERROR,
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
): string {
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
    canonicalCode: options?.canonicalCode ?? resolveCanonicalCode(code, options?.issues),
    message,
    ...(options?.issues === undefined ? {} : { issues: Object.freeze([...options.issues]) }),
    ...(options?.cause === undefined ? {} : { cause: options.cause }),
  });
}
