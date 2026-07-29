import { describe, expect, it, vi } from 'vitest';

import {
  computeMemorySessionStatistics,
  MemoryOperationType,
  MemorySessionStatus,
} from '../../src/domain/index.js';
import type { MemoryRecord } from '../../src/domain/types/memory-types.js';
import {
  ENGINE_CONSISTENCY,
  ENGINE_DOMAIN_VALIDATION,
  ENGINE_NOT_FOUND,
} from '../../src/engine/engine-errors.js';
import { createMemoryEngine } from '../../src/engine/index.js';
import {
  MemoryEngineSessionOrchestrator,
  systemMemoryEngineSessionClock,
} from '../../src/engine/memory-engine-session-orchestrator.js';
import { MemoryEngineSessionRegistry } from '../../src/engine/memory-engine-session-registry.js';
import { validateRegisteredMemorySessions } from '../../src/engine/memory-engine-session-validation.js';
import {
  createDefaultConsistencyProvider,
  createInMemoryProviderStack,
} from '../../src/providers/create-memory-providers.js';

const FIXED_TIME = '2026-07-28T12:00:00.000Z';

function createFixedClock() {
  let tick = 0;
  return {
    now: () => {
      tick += 1;
      return `2026-07-28T12:00:0${Math.min(tick, 9)}.000Z`;
    },
  };
}

function createMemoryRecord(overrides: Partial<MemoryRecord> = {}): MemoryRecord {
  return Object.freeze({
    id: 'record.fact.1',
    type: 'Fact',
    content: { fact: 'Memory preserves experience' },
    metadata: { namespaceId: 'namespace.1' },
    timestamp: '2026-07-24T00:00:00.000Z',
    ...overrides,
  });
}

describe('MemoryEngine ↔ MemorySession integration (Sprint 11E.2)', () => {
  it('creates, runs and disposes a session for successful store', async () => {
    const { memoryStore } = createInMemoryProviderStack();
    const engine = createMemoryEngine(memoryStore, createDefaultConsistencyProvider());
    const record = createMemoryRecord();

    const result = await engine.store(record);

    expect(result.ok).toBe(true);

    const session = engine.getLastCompletedSession();
    expect(session).toBeDefined();
    expect(session?.status).toBe(MemorySessionStatus.Disposed);
    expect(session?.lifecycleHistory.map((entry) => entry.toStatus)).toEqual([
      MemorySessionStatus.Initialized,
      MemorySessionStatus.Running,
      MemorySessionStatus.Completed,
      MemorySessionStatus.Disposed,
    ]);

    const operationTypes = session?.operationHistory.map((entry) => entry.operationType);
    expect(operationTypes).toContain(MemoryOperationType.ValidationOperation);
    expect(operationTypes).toContain(MemoryOperationType.StorageRequest);
    expect(operationTypes).toContain(MemoryOperationType.StorageResult);
    expect(operationTypes).toContain(MemoryOperationType.IndexOperation);

    const statistics = computeMemorySessionStatistics(session!);
    expect(statistics.validationCount).toBeGreaterThan(0);
    expect(statistics.storageCount).toBeGreaterThan(0);
    expect(statistics.indexCount).toBeGreaterThan(0);

    const validation = await engine.getConsistencyProvider().validateSessions();
    expect(validation.valid).toBe(true);
  });

  it('records diagnostics and fails the session on domain validation errors', async () => {
    const { memoryStore } = createInMemoryProviderStack();
    const engine = createMemoryEngine(memoryStore, createDefaultConsistencyProvider());
    const invalidRecord = createMemoryRecord({ id: '' });

    const result = await engine.store(invalidRecord);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(ENGINE_DOMAIN_VALIDATION);
    }

    const session = engine.getLastCompletedSession();
    expect(session?.status).toBe(MemorySessionStatus.Disposed);
    expect(session?.lifecycleHistory.at(-2)?.toStatus).toBe(MemorySessionStatus.Failed);
    expect(session?.diagnosticHistory.some((entry) => entry.kind === 'warning')).toBe(true);
    expect(session?.errors.length).toBeGreaterThan(0);
  });

  it('records retrieval operations and completes retrieve lifecycle', async () => {
    const { memoryStore } = createInMemoryProviderStack();
    const engine = createMemoryEngine(memoryStore, createDefaultConsistencyProvider());
    const record = createMemoryRecord({ id: 'record.retrieve.1' });

    await engine.store(record);

    const result = await engine.retrieve({ recordId: 'record.retrieve.1' });

    expect(result.ok).toBe(true);

    const session = engine.getLastCompletedSession();
    expect(session?.operationHistory.map((entry) => entry.operationType)).toEqual(
      expect.arrayContaining([
        MemoryOperationType.ValidationOperation,
        MemoryOperationType.RetrievalRequest,
        MemoryOperationType.RetrievalResult,
      ]),
    );
  });

  it('marks retrieve-not-found as Failed then Disposed with diagnostics', async () => {
    const { memoryStore } = createInMemoryProviderStack();
    const engine = createMemoryEngine(memoryStore, createDefaultConsistencyProvider());

    const result = await engine.retrieve({ recordId: 'record.missing' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(ENGINE_NOT_FOUND);
    }

    const session = engine.getLastCompletedSession();
    expect(session?.lifecycleHistory.at(-2)?.toStatus).toBe(MemorySessionStatus.Failed);
    expect(session?.status).toBe(MemorySessionStatus.Disposed);
    expect(session?.diagnosticHistory.some((entry) => entry.kind === 'warning')).toBe(true);
  });

  it('maintains one active session per execution and registers completed sessions', async () => {
    const registry = new MemoryEngineSessionRegistry();
    const orchestrator = new MemoryEngineSessionOrchestrator(registry, createFixedClock());

    const firstScope = orchestrator.beginExecution({
      operationName: 'store',
      namespaceId: 'namespace.1',
      executionKey: 'record.1',
    });
    expect(registry.getActiveSession()?.status).toBe(MemorySessionStatus.Running);

    firstScope.finalizeSuccess();
    expect(registry.getActiveSession()).toBeUndefined();
    expect(registry.getCompletedSessions()).toHaveLength(1);

    const secondScope = orchestrator.beginExecution({
      operationName: 'retrieve',
      namespaceId: 'namespace.1',
      executionKey: 'record.2',
    });
    secondScope.finalizeSuccess();
    expect(registry.getCompletedSessions()).toHaveLength(2);
  });

  it('implements validateSessions() with lifecycle, identity and statistics checks', async () => {
    const registry = new MemoryEngineSessionRegistry();
    const orchestrator = new MemoryEngineSessionOrchestrator(registry, {
      now: () => FIXED_TIME,
    });

    const scope = orchestrator.beginExecution({
      operationName: 'search',
      namespaceId: 'namespace.1',
      executionKey: 'query-1',
    });
    scope.recordValidationOperation({ phase: 'query', valid: true });
    scope.recordRetrievalRequest({ query: { recordType: 'Fact' } });
    scope.recordRetrievalResult({ total: 0 });
    scope.finalizeSuccess();

    const validation = validateRegisteredMemorySessions(registry.getSessionsForValidation());
    expect(validation.valid).toBe(true);

    const completedSession = registry.getCompletedSessions()[0];
    expect(completedSession).toBeDefined();

    const invalidValidation = validateRegisteredMemorySessions([
      {
        ...completedSession!,
        status: MemorySessionStatus.Running,
      },
    ]);
    expect(invalidValidation.valid).toBe(false);
    expect(invalidValidation.issues.length).toBeGreaterThan(0);
  });

  it('fails consistency validation with Failed → Disposed lifecycle', async () => {
    const { memoryStore } = createInMemoryProviderStack();
    const consistencyProvider = createDefaultConsistencyProvider();
    consistencyProvider.validateRecord = vi.fn().mockResolvedValue({
      valid: false,
      issues: [{ code: 'CorruptedRecord', message: 'broken', path: 'id' }],
    });
    const engine = createMemoryEngine(memoryStore, consistencyProvider);
    const record = createMemoryRecord();

    const result = await engine.store(record);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(ENGINE_CONSISTENCY);
    }

    const session = engine.getLastCompletedSession();
    expect(session?.lifecycleHistory.at(-2)?.toStatus).toBe(MemorySessionStatus.Failed);
    expect(session?.status).toBe(MemorySessionStatus.Disposed);
  });

  it('does not expose MemorySession creation through providers', async () => {
    const { memoryStore, storageProvider } = createInMemoryProviderStack();
    const engine = createMemoryEngine(memoryStore, createDefaultConsistencyProvider());
    const record = createMemoryRecord();

    await engine.store(record);

    expect(typeof storageProvider.store).toBe('function');
    expect((storageProvider as { createMemorySession?: unknown }).createMemorySession).toBeUndefined();
  });

  it('preserves existing engine orchestration while integrating sessions', async () => {
    const { memoryStore, storageProvider } = createInMemoryProviderStack();
    const engine = createMemoryEngine(memoryStore, createDefaultConsistencyProvider());
    const record = createMemoryRecord();

    const result = await engine.store(record);

    expect(result.ok).toBe(true);
    expect(await storageProvider.load('record.fact.1')).toEqual(record);
  });
});

describe('MemoryEngine session orchestrator determinism', () => {
  it('uses engine-owned session identifiers', () => {
    const registry = new MemoryEngineSessionRegistry();
    const orchestrator = new MemoryEngineSessionOrchestrator(registry, {
      now: () => FIXED_TIME,
    });

    const scope = orchestrator.beginExecution({
      operationName: 'delete',
      namespaceId: 'namespace.1',
      executionKey: 'record.fact.1',
    });

    expect(scope.session.memorySessionId.toString()).toMatch(/^session\.memory\.engine\./);
    expect(scope.session.executionId.toString()).toMatch(/^execution\.memory\.engine\./);
    expect(scope.session.status).toBe(MemorySessionStatus.Running);
  });
});
