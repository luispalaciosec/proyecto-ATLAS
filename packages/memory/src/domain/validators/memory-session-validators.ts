import type { MemorySession } from '../types/memory-session-types.js';
import type { DiagnosticEntry, OperationRecord } from '../types/memory-session-types.js';
import type { ValidationIssue } from '../types/memory-types.js';
import { isAllowedMemorySessionTransition } from '../constants/memory-session-lifecycle.js';
import {
  MEMORY_INVALID_SESSION,
  MEMORY_INVALID_SESSION_OPERATION,
  MEMORY_INVALID_SESSION_TRANSITION,
} from '../errors/memory-error-codes.js';
import { isMemoryOperationType } from '../value-objects/memory-operation-type.js';
import { isMemorySessionStatus } from '../value-objects/memory-session-status.js';

import { createValidationIssue } from './memory-validators.js';

export function validateMemorySession(session: MemorySession): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (session.createdAt.trim().length === 0) {
    issues.push(
      createValidationIssue(
        MEMORY_INVALID_SESSION,
        'MemorySession createdAt must not be empty',
        'createdAt',
      ),
    );
  }

  if (!isMemorySessionStatus(session.status)) {
    issues.push(
      createValidationIssue(
        MEMORY_INVALID_SESSION,
        'MemorySession status is invalid',
        'status',
      ),
    );
  }

  for (let index = 1; index < session.lifecycleHistory.length; index += 1) {
    const previous = session.lifecycleHistory[index - 1];
    const current = session.lifecycleHistory[index];

    if (previous === undefined || current === undefined) {
      continue;
    }

    if (previous.toStatus !== current.fromStatus) {
      issues.push(
        createValidationIssue(
          MEMORY_INVALID_SESSION,
          'MemorySession lifecycle history is inconsistent',
          `lifecycleHistory[${index}]`,
        ),
      );
    }
  }

  return Object.freeze(issues);
}

export function validateMemorySessionTransition(
  from: MemorySession['status'],
  to: MemorySession['status'],
): readonly ValidationIssue[] {
  if (!isAllowedMemorySessionTransition(from, to)) {
    return Object.freeze([
      createValidationIssue(
        MEMORY_INVALID_SESSION_TRANSITION,
        `MemorySession cannot transition from "${from}" to "${to}"`,
        'status',
      ),
    ]);
  }

  return Object.freeze([]);
}

export function validateOperationRecord(record: OperationRecord): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (record.timestamp.trim().length === 0) {
    issues.push(
      createValidationIssue(
        MEMORY_INVALID_SESSION_OPERATION,
        'OperationRecord timestamp must not be empty',
        'timestamp',
      ),
    );
  }

  if (!isMemoryOperationType(record.operationType)) {
    issues.push(
      createValidationIssue(
        MEMORY_INVALID_SESSION_OPERATION,
        'OperationRecord operationType is invalid',
        'operationType',
      ),
    );
  }

  return Object.freeze(issues);
}

export function validateDiagnosticEntry(entry: DiagnosticEntry): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (entry.timestamp.trim().length === 0) {
    issues.push(
      createValidationIssue(
        MEMORY_INVALID_SESSION,
        'DiagnosticEntry timestamp must not be empty',
        'timestamp',
      ),
    );
  }

  if (entry.kind === 'provider_failure' && entry.code.trim().length === 0) {
    issues.push(
      createValidationIssue(
        MEMORY_INVALID_SESSION,
        'DiagnosticEntry provider_failure code must not be empty',
        'code',
      ),
    );
  }

  return Object.freeze(issues);
}

export function isValidMemorySession(session: MemorySession): boolean {
  return validateMemorySession(session).length === 0;
}
