import { createCorrelationId } from '@atlas/events';
import { describe, expect, it } from 'vitest';

import {
  MEMORY_INVALID_SESSION_TRANSITION,
  MemoryOperationType,
  MemorySessionStatus,
  MEMORY_RETRIEVAL_ERROR,
  MEMORY_SESSION_TRANSITIONS,
  MemorySessionContext,
  completeMemorySession,
  computeMemorySessionStatistics,
  createMemorySession,
  createOperationRecord,
  disposeMemorySession,
  failMemorySession,
  initializeMemorySession,
  isAllowedMemorySessionTransition,
  isValidMemorySession,
  recordMemoryOperation,
  recordMemorySessionDiagnostic,
  startMemorySession,
  validateMemorySessionTransition,
} from '../../src/domain/index.js';

const CREATED_AT = '2026-07-28T00:00:00.000Z';
const RUNNING_AT = '2026-07-28T00:01:00.000Z';
const COMPLETED_AT = '2026-07-28T00:02:00.000Z';
const FAILED_AT = '2026-07-28T00:02:30.000Z';
const DISPOSED_AT = '2026-07-28T00:03:00.000Z';

function createFixtureSession() {
  return createMemorySession({
    memorySessionId: 'session.memory.1',
    executionId: 'execution.runtime.1',
    correlationId: createCorrelationId('correlation.test.1'),
    namespaceId: 'workspace.memory',
    createdAt: CREATED_AT,
    context: MemorySessionContext.create({
      tenant: 'tenant.atlas',
      workspace: 'workspace.ops',
      environment: 'test',
    }),
    metadata: {
      custom: { source: 'contract-test' },
    },
  });
}

function runToRunning(session = createFixtureSession()) {
  return startMemorySession(initializeMemorySession(session, CREATED_AT), RUNNING_AT);
}

describe('CONTRACT-005 §17 — Memory Session domain', () => {
  it('session creation', () => {
    const session = createFixtureSession();

    expect(session.status).toBe(MemorySessionStatus.Created);
    expect(session.memorySessionId.toString()).toBe('session.memory.1');
    expect(session.revision.value).toBe(1);
    expect(session.operationHistory).toHaveLength(0);
    expect(session.diagnosticHistory).toHaveLength(0);
    expect(session.lifecycleHistory).toHaveLength(0);
    expect(isValidMemorySession(session)).toBe(true);
  });

  it('initialization', () => {
    const initialized = initializeMemorySession(createFixtureSession(), CREATED_AT);

    expect(initialized.status).toBe(MemorySessionStatus.Initialized);
    expect(initialized.lifecycleHistory).toHaveLength(1);
    expect(initialized.lifecycleHistory[0]?.toStatus).toBe(MemorySessionStatus.Initialized);
    expect(initialized.revision.value).toBe(2);
  });

  it('operation tracking', () => {
    const running = runToRunning();
    const withOperation = recordMemoryOperation(
      running,
      createOperationRecord({
        operationId: 'operation.retrieval.1',
        operationType: MemoryOperationType.RetrievalRequest,
        timestamp: RUNNING_AT,
      }),
    );

    expect(withOperation.operationHistory).toHaveLength(1);
    expect(withOperation.operationCounters.retrievalCount).toBe(1);
    expect(withOperation.operationHistory[0]?.operationType).toBe(
      MemoryOperationType.RetrievalRequest,
    );
  });

  it('diagnostic recording', () => {
    const running = runToRunning();
    const withDiagnostic = recordMemorySessionDiagnostic(running, {
      kind: 'warning',
      message: 'Provider latency elevated',
      timestamp: RUNNING_AT,
    });

    expect(withDiagnostic.diagnosticHistory).toHaveLength(1);
    expect(withDiagnostic.diagnosticHistory[0]?.kind).toBe('warning');
  });

  it('statistics generation', () => {
    let session = runToRunning();
    session = recordMemoryOperation(
      session,
      createOperationRecord({
        operationId: 'operation.storage.1',
        operationType: MemoryOperationType.StorageRequest,
        timestamp: RUNNING_AT,
      }),
    );
    session = completeMemorySession(session, COMPLETED_AT);

    const statistics = computeMemorySessionStatistics(session);

    expect(statistics.storageCount).toBe(1);
    expect(statistics.executionDurationMs).toBe(
      Date.parse(COMPLETED_AT) - Date.parse(RUNNING_AT),
    );
  });

  it('failure handling', () => {
    const running = runToRunning();
    const failed = failMemorySession(
      running,
      {
        code: MEMORY_RETRIEVAL_ERROR,
        message: 'Retrieval failed',
        timestamp: FAILED_AT,
      },
      FAILED_AT,
    );

    expect(failed.status).toBe(MemorySessionStatus.Failed);
    expect(failed.errors).toHaveLength(1);
    expect(failed.errors[0]?.code).toBe(MEMORY_RETRIEVAL_ERROR);
    expect(failed.executionMetadata.failedAt).toBe(FAILED_AT);
  });

  it('completion', () => {
    const completed = completeMemorySession(runToRunning(), COMPLETED_AT);

    expect(completed.status).toBe(MemorySessionStatus.Completed);
    expect(completed.executionMetadata.completedAt).toBe(COMPLETED_AT);
    expect(completed.lifecycleHistory.at(-1)?.toStatus).toBe(MemorySessionStatus.Completed);
  });

  it('disposal', () => {
    const completed = completeMemorySession(runToRunning(), COMPLETED_AT);
    const disposed = disposeMemorySession(completed, DISPOSED_AT);

    expect(disposed.status).toBe(MemorySessionStatus.Disposed);
    expect(disposed.executionMetadata.disposedAt).toBe(DISPOSED_AT);
  });

  it('contract compliance', () => {
    expect(Object.keys(MEMORY_SESSION_TRANSITIONS)).toHaveLength(6);
    expect(isAllowedMemorySessionTransition(MemorySessionStatus.Running, MemorySessionStatus.Completed)).toBe(true);
    expect(isAllowedMemorySessionTransition(MemorySessionStatus.Running, MemorySessionStatus.Failed)).toBe(true);
    expect(isAllowedMemorySessionTransition(MemorySessionStatus.Created, MemorySessionStatus.Running)).toBe(false);

    const transitionIssues = validateMemorySessionTransition(
      MemorySessionStatus.Created,
      MemorySessionStatus.Running,
    );
    expect(transitionIssues[0]?.code).toBe(MEMORY_INVALID_SESSION_TRANSITION);

    expect(() => recordMemoryOperation(createFixtureSession(), createOperationRecord({
      operationId: 'operation.invalid.1',
      operationType: MemoryOperationType.IndexOperation,
      timestamp: RUNNING_AT,
    }))).toThrow();
  });
});
