import {
  INVALID_MEMORY_RECORD,
  MEMORY_NOT_FOUND,
  MEMORY_STORAGE_ERROR,
} from '../domain/errors/create-memory-error.js';
import type { ValidationIssue } from '../domain/types/memory-types.js';

export const REPOSITORY_DOMAIN_VALIDATION = 'REPOSITORY_DOMAIN_VALIDATION';
export const REPOSITORY_STORE = 'REPOSITORY_STORE';
export const REPOSITORY_NOT_FOUND = 'REPOSITORY_NOT_FOUND';
export const REPOSITORY_ENGINE = 'REPOSITORY_ENGINE';

export type RepositoryErrorCode =
  | typeof REPOSITORY_DOMAIN_VALIDATION
  | typeof REPOSITORY_STORE
  | typeof REPOSITORY_NOT_FOUND
  | typeof REPOSITORY_ENGINE;

const REPOSITORY_TO_CANONICAL: Record<RepositoryErrorCode, string> = {
  [REPOSITORY_DOMAIN_VALIDATION]: INVALID_MEMORY_RECORD,
  [REPOSITORY_STORE]: MEMORY_STORAGE_ERROR,
  [REPOSITORY_NOT_FOUND]: MEMORY_NOT_FOUND,
  [REPOSITORY_ENGINE]: INVALID_MEMORY_RECORD,
};

export interface RepositoryError {
  readonly code: RepositoryErrorCode;
  readonly canonicalCode: string;
  readonly message: string;
  readonly issues?: readonly ValidationIssue[];
  readonly cause?: unknown;
}

function resolveCanonicalCode(
  code: RepositoryErrorCode,
  issues?: readonly ValidationIssue[],
  override?: string,
): string {
  if (override !== undefined) {
    return override;
  }

  if (code === REPOSITORY_DOMAIN_VALIDATION && issues !== undefined && issues.length > 0) {
    const issueCode = issues[0]!.code;
    if (issueCode === MEMORY_NOT_FOUND) {
      return MEMORY_NOT_FOUND;
    }
  }

  return REPOSITORY_TO_CANONICAL[code];
}

export function createRepositoryError(
  code: RepositoryErrorCode,
  message: string,
  options?: {
    readonly issues?: readonly ValidationIssue[];
    readonly cause?: unknown;
    readonly canonicalCode?: string;
  },
): RepositoryError {
  return Object.freeze({
    code,
    canonicalCode: resolveCanonicalCode(code, options?.issues, options?.canonicalCode),
    message,
    ...(options?.issues === undefined ? {} : { issues: Object.freeze([...options.issues]) }),
    ...(options?.cause === undefined ? {} : { cause: options.cause }),
  });
}
