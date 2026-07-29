import { SESSION_CORRUPTED } from '../domain/errors/memory-error-codes.js';
import {
  computeMemorySessionStatistics,
} from '../domain/factories/memory-session-factories.js';
import type { MemorySession } from '../domain/types/memory-session-types.js';
import type { ValidationIssue, ValidationResult } from '../domain/types/memory-types.js';
import { MemorySessionStatus } from '../domain/value-objects/memory-session-status.js';
import { validateMemorySession } from '../domain/validators/memory-session-validators.js';
import { createValidationIssue } from '../domain/validators/memory-validators.js';

function validateSessionIdentity(session: MemorySession): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (session.memorySessionId.toString().trim().length === 0) {
    issues.push(
      createValidationIssue(
        SESSION_CORRUPTED,
        'MemorySession memorySessionId must not be empty',
        'memorySessionId',
      ),
    );
  }

  if (session.executionId.toString().trim().length === 0) {
    issues.push(
      createValidationIssue(
        SESSION_CORRUPTED,
        'MemorySession executionId must not be empty',
        'executionId',
      ),
    );
  }

  if (session.namespaceId.toString().trim().length === 0) {
    issues.push(
      createValidationIssue(
        SESSION_CORRUPTED,
        'MemorySession namespaceId must not be empty',
        'namespaceId',
      ),
    );
  }

  return Object.freeze(issues);
}

function validateSessionRevisionMonotonic(session: MemorySession): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const minimumRevision = 1 + session.lifecycleHistory.length;

  if (session.revision.value < minimumRevision) {
    issues.push(
      createValidationIssue(
        SESSION_CORRUPTED,
        'MemorySession revision is not monotonic with lifecycle history',
        'revision',
      ),
    );
  }

  return Object.freeze(issues);
}

function validateSessionHistoriesAppendOnly(session: MemorySession): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const assertMonotonicTimestamps = (
    timestamps: readonly string[],
    path: string,
  ): void => {
    for (let index = 1; index < timestamps.length; index += 1) {
      const previous = timestamps[index - 1];
      const current = timestamps[index];

      if (previous === undefined || current === undefined) {
        continue;
      }

      if (Date.parse(current) < Date.parse(previous)) {
        issues.push(
          createValidationIssue(
            SESSION_CORRUPTED,
            'MemorySession history timestamps must be append-only and non-decreasing',
            `${path}[${index}]`,
          ),
        );
      }
    }
  };

  assertMonotonicTimestamps(
    session.operationHistory.map((record) => record.timestamp),
    'operationHistory',
  );
  assertMonotonicTimestamps(
    session.diagnosticHistory.map((entry) => entry.timestamp),
    'diagnosticHistory',
  );
  assertMonotonicTimestamps(
    session.lifecycleHistory.map((record) => record.timestamp),
    'lifecycleHistory',
  );

  return Object.freeze(issues);
}

function validateSessionFinalState(session: MemorySession): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (
    session.status === MemorySessionStatus.Completed ||
    session.status === MemorySessionStatus.Failed
  ) {
    issues.push(
      createValidationIssue(
        SESSION_CORRUPTED,
        'Completed or Failed MemorySession must be disposed before registration',
        'status',
      ),
    );
  }

  if (session.status === MemorySessionStatus.Disposed) {
    const lastLifecycle = session.lifecycleHistory.at(-1);
    if (lastLifecycle?.toStatus !== MemorySessionStatus.Disposed) {
      issues.push(
        createValidationIssue(
          SESSION_CORRUPTED,
          'Disposed MemorySession must end lifecycle history with Disposed',
          'lifecycleHistory',
        ),
      );
    }
  }

  const lastLifecycle = session.lifecycleHistory.at(-1);
  if (lastLifecycle !== undefined && lastLifecycle.toStatus !== session.status) {
    issues.push(
      createValidationIssue(
        SESSION_CORRUPTED,
        'MemorySession status must match the terminal lifecycle transition',
        'status',
      ),
    );
  }

  return Object.freeze(issues);
}

function validateSessionOperationsByState(session: MemorySession): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (session.operationHistory.length > 0) {
    const runningIndex = session.lifecycleHistory.findIndex(
      (record) => record.toStatus === MemorySessionStatus.Running,
    );

    if (runningIndex === -1) {
      issues.push(
        createValidationIssue(
          SESSION_CORRUPTED,
          'MemorySession operation history requires a Running lifecycle transition',
          'operationHistory',
        ),
      );
    }
  }

  return Object.freeze(issues);
}

function validateSessionStatisticsCoherence(session: MemorySession): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const statistics = computeMemorySessionStatistics(session);

  if (statistics.retrievalCount !== session.operationCounters.retrievalCount) {
    issues.push(
      createValidationIssue(
        SESSION_CORRUPTED,
        'MemorySession statistics retrievalCount is inconsistent',
        'operationCounters.retrievalCount',
      ),
    );
  }

  if (statistics.storageCount !== session.operationCounters.storageCount) {
    issues.push(
      createValidationIssue(
        SESSION_CORRUPTED,
        'MemorySession statistics storageCount is inconsistent',
        'operationCounters.storageCount',
      ),
    );
  }

  if (statistics.indexCount !== session.operationCounters.indexCount) {
    issues.push(
      createValidationIssue(
        SESSION_CORRUPTED,
        'MemorySession statistics indexCount is inconsistent',
        'operationCounters.indexCount',
      ),
    );
  }

  if (statistics.validationCount !== session.operationCounters.validationCount) {
    issues.push(
      createValidationIssue(
        SESSION_CORRUPTED,
        'MemorySession statistics validationCount is inconsistent',
        'operationCounters.validationCount',
      ),
    );
  }

  return Object.freeze(issues);
}

export function validateRegisteredMemorySessions(
  sessions: readonly MemorySession[],
): ValidationResult {
  const issues: ValidationIssue[] = [];

  for (const session of sessions) {
    issues.push(...validateMemorySession(session));
    issues.push(...validateSessionIdentity(session));
    issues.push(...validateSessionRevisionMonotonic(session));
    issues.push(...validateSessionHistoriesAppendOnly(session));
    issues.push(...validateSessionFinalState(session));
    issues.push(...validateSessionOperationsByState(session));
    issues.push(...validateSessionStatisticsCoherence(session));
  }

  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
