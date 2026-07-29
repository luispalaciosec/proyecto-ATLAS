import type { CorrelationId } from '@atlas/events';

import { isAllowedMemorySessionTransition } from '../constants/memory-session-lifecycle.js';
import {
  createMemoryError,
  MEMORY_INVALID_SESSION,
  MEMORY_INVALID_SESSION_OPERATION,
  MEMORY_INVALID_SESSION_TRANSITION,
} from '../errors/create-memory-error.js';
import type {
  DiagnosticEntry,
  LifecycleRecord,
  MemorySession,
  MemorySessionErrorRecord,
  MemorySessionOperationCounters,
  MemorySessionStatistics,
  OperationRecord,
} from '../types/memory-session-types.js';
import {
  EMPTY_EXECUTION_METADATA,
  EMPTY_OPERATION_COUNTERS,
  EMPTY_PROVIDER_STATISTICS,
} from '../types/memory-session-types.js';
import { createExecutionId, type ExecutionId } from '../value-objects/execution-id.js';
import { MemoryOperationId } from '../value-objects/memory-operation-id.js';
import { MemoryOperationType } from '../value-objects/memory-operation-type.js';
import { MemorySessionContext } from '../value-objects/memory-session-context.js';
import { MemorySessionId } from '../value-objects/memory-session-id.js';
import { MemorySessionMetadata } from '../value-objects/memory-session-metadata.js';
import { MemorySessionRevision } from '../value-objects/memory-session-revision.js';
import { MemorySessionStatus } from '../value-objects/memory-session-status.js';
import { NamespaceId } from '../value-objects/namespace-id.js';
import {
  validateDiagnosticEntry,
  validateMemorySessionTransition,
  validateOperationRecord,
} from '../validators/memory-session-validators.js';
import { isValid } from '../validators/memory-validators.js';

export interface CreateMemorySessionInput {
  readonly memorySessionId: string;
  readonly executionId: string;
  readonly correlationId: CorrelationId;
  readonly namespaceId: string;
  readonly createdAt: string;
  readonly context?: MemorySessionContext;
  readonly metadata?: MemorySessionMetadata;
}

function assertTransition(session: MemorySession, to: MemorySessionStatus): void {
  const issues = validateMemorySessionTransition(session.status, to);
  if (!isValid(issues)) {
    throw createMemoryError(
      MEMORY_INVALID_SESSION_TRANSITION,
      issues[0]?.message ?? 'Invalid MemorySession transition',
    );
  }
}

function appendLifecycleRecord(
  session: MemorySession,
  toStatus: MemorySessionStatus,
  timestamp: string,
): readonly LifecycleRecord[] {
  return Object.freeze([
    ...session.lifecycleHistory,
    Object.freeze({
      fromStatus: session.status,
      toStatus,
      timestamp,
    }),
  ]);
}

function evolveSession(
  session: MemorySession,
  changes: Partial<Omit<MemorySession, 'memorySessionId' | 'executionId' | 'correlationId' | 'namespaceId' | 'createdAt'>>,
): MemorySession {
  return Object.freeze({
    ...session,
    revision: session.revision.next(),
    ...changes,
  });
}

export function createMemorySession(input: CreateMemorySessionInput): MemorySession {
  return Object.freeze({
    memorySessionId: MemorySessionId.create(input.memorySessionId),
    executionId: createExecutionId(input.executionId),
    correlationId: input.correlationId,
    namespaceId: NamespaceId.create(input.namespaceId),
    createdAt: input.createdAt,
    revision: MemorySessionRevision.create(1),
    status: MemorySessionStatus.Created,
    context: input.context ?? MemorySessionContext.create(),
    metadata: input.metadata ?? MemorySessionMetadata.create(),
    operationCounters: EMPTY_OPERATION_COUNTERS,
    providerStatistics: EMPTY_PROVIDER_STATISTICS,
    executionMetadata: EMPTY_EXECUTION_METADATA,
    errors: Object.freeze([]),
    operationHistory: Object.freeze([]),
    diagnosticHistory: Object.freeze([]),
    lifecycleHistory: Object.freeze([]),
  });
}

export function initializeMemorySession(
  session: MemorySession,
  timestamp: string,
): MemorySession {
  assertTransition(session, MemorySessionStatus.Initialized);

  return evolveSession(session, {
    status: MemorySessionStatus.Initialized,
    lifecycleHistory: appendLifecycleRecord(session, MemorySessionStatus.Initialized, timestamp),
  });
}

export function startMemorySession(session: MemorySession, timestamp: string): MemorySession {
  assertTransition(session, MemorySessionStatus.Running);

  return evolveSession(session, {
    status: MemorySessionStatus.Running,
    executionMetadata: Object.freeze({
      ...session.executionMetadata,
      startedAt: timestamp,
    }),
    lifecycleHistory: appendLifecycleRecord(session, MemorySessionStatus.Running, timestamp),
  });
}

export function completeMemorySession(session: MemorySession, timestamp: string): MemorySession {
  assertTransition(session, MemorySessionStatus.Completed);

  return evolveSession(session, {
    status: MemorySessionStatus.Completed,
    executionMetadata: Object.freeze({
      ...session.executionMetadata,
      completedAt: timestamp,
    }),
    lifecycleHistory: appendLifecycleRecord(session, MemorySessionStatus.Completed, timestamp),
  });
}

export function failMemorySession(
  session: MemorySession,
  error: MemorySessionErrorRecord,
  timestamp: string,
): MemorySession {
  assertTransition(session, MemorySessionStatus.Failed);

  return evolveSession(session, {
    status: MemorySessionStatus.Failed,
    errors: Object.freeze([...session.errors, Object.freeze({ ...error })]),
    executionMetadata: Object.freeze({
      ...session.executionMetadata,
      failedAt: timestamp,
    }),
    lifecycleHistory: appendLifecycleRecord(session, MemorySessionStatus.Failed, timestamp),
  });
}

export function disposeMemorySession(session: MemorySession, timestamp: string): MemorySession {
  assertTransition(session, MemorySessionStatus.Disposed);

  return evolveSession(session, {
    status: MemorySessionStatus.Disposed,
    executionMetadata: Object.freeze({
      ...session.executionMetadata,
      disposedAt: timestamp,
    }),
    lifecycleHistory: appendLifecycleRecord(session, MemorySessionStatus.Disposed, timestamp),
  });
}

function incrementOperationCounter(
  counters: MemorySessionOperationCounters,
  operationType: MemorySession['operationHistory'][number]['operationType'],
): MemorySessionOperationCounters {
  switch (operationType) {
    case MemoryOperationType.RetrievalRequest:
    case MemoryOperationType.RetrievalResult:
      return Object.freeze({ ...counters, retrievalCount: counters.retrievalCount + 1 });
    case MemoryOperationType.StorageRequest:
    case MemoryOperationType.StorageResult:
      return Object.freeze({ ...counters, storageCount: counters.storageCount + 1 });
    case MemoryOperationType.IndexOperation:
      return Object.freeze({ ...counters, indexCount: counters.indexCount + 1 });
    case MemoryOperationType.ValidationOperation:
      return Object.freeze({ ...counters, validationCount: counters.validationCount + 1 });
    default:
      return counters;
  }
}

export function recordMemoryOperation(
  session: MemorySession,
  record: OperationRecord,
): MemorySession {
  if (session.status !== MemorySessionStatus.Running) {
    throw createMemoryError(
      MEMORY_INVALID_SESSION,
      'MemorySession operations can only be recorded while Running',
    );
  }

  const issues = validateOperationRecord(record);
  if (!isValid(issues)) {
    throw createMemoryError(
      MEMORY_INVALID_SESSION_OPERATION,
      issues[0]?.message ?? 'Invalid OperationRecord',
    );
  }

  return evolveSession(session, {
    operationHistory: Object.freeze([...session.operationHistory, Object.freeze({ ...record })]),
    operationCounters: incrementOperationCounter(session.operationCounters, record.operationType),
  });
}

export function recordMemorySessionDiagnostic(
  session: MemorySession,
  entry: DiagnosticEntry,
): MemorySession {
  if (session.status === MemorySessionStatus.Disposed) {
    throw createMemoryError(
      MEMORY_INVALID_SESSION,
      'MemorySession diagnostics cannot be recorded after Disposed',
    );
  }

  const issues = validateDiagnosticEntry(entry);
  if (!isValid(issues)) {
    throw createMemoryError(
      MEMORY_INVALID_SESSION,
      issues[0]?.message ?? 'Invalid DiagnosticEntry',
    );
  }

  return evolveSession(session, {
    diagnosticHistory: Object.freeze([...session.diagnosticHistory, Object.freeze({ ...entry })]),
  });
}

export function recordLifecycleRecord(
  session: MemorySession,
  record: LifecycleRecord,
): MemorySession {
  if (!isAllowedMemorySessionTransition(record.fromStatus, record.toStatus)) {
    throw createMemoryError(
      MEMORY_INVALID_SESSION_TRANSITION,
      `MemorySession cannot transition from "${record.fromStatus}" to "${record.toStatus}"`,
    );
  }

  return evolveSession(session, {
    lifecycleHistory: Object.freeze([...session.lifecycleHistory, Object.freeze({ ...record })]),
  });
}

export function computeMemorySessionStatistics(session: MemorySession): MemorySessionStatistics {
  const { operationCounters, executionMetadata, providerStatistics } = session;

  let executionDurationMs: number | undefined;
  if (executionMetadata.startedAt !== undefined) {
    const endTimestamp =
      executionMetadata.completedAt ??
      executionMetadata.failedAt ??
      executionMetadata.disposedAt;

    if (endTimestamp !== undefined) {
      executionDurationMs =
        Date.parse(endTimestamp) - Date.parse(executionMetadata.startedAt);
    }
  }

  const latencies = [
    providerStatistics.storageLatencyMs,
    providerStatistics.indexLatencyMs,
    providerStatistics.retrievalLatencyMs,
  ].filter((value): value is number => value !== undefined);

  const providerLatencyMs =
    latencies.length > 0
      ? latencies.reduce((total, value) => total + value, 0) / latencies.length
      : undefined;

  return Object.freeze({
    retrievalCount: operationCounters.retrievalCount,
    storageCount: operationCounters.storageCount,
    indexCount: operationCounters.indexCount,
    validationCount: operationCounters.validationCount,
    ...(executionDurationMs === undefined || Number.isNaN(executionDurationMs)
      ? {}
      : { executionDurationMs }),
    ...(providerLatencyMs === undefined ? {} : { providerLatencyMs }),
  });
}

export function createOperationRecord(input: {
  readonly operationId: string;
  readonly operationType: MemorySession['operationHistory'][number]['operationType'];
  readonly timestamp: string;
  readonly payload?: Readonly<Record<string, unknown>>;
}): OperationRecord {
  return Object.freeze({
    operationId: MemoryOperationId.create(input.operationId),
    operationType: input.operationType,
    timestamp: input.timestamp,
    ...(input.payload === undefined ? {} : { payload: Object.freeze({ ...input.payload }) }),
  });
}

export type { ExecutionId };
