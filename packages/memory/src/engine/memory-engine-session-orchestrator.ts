import { createCorrelationId } from '@atlas/events';

import {
  completeMemorySession,
  createMemorySession,
  createOperationRecord,
  disposeMemorySession,
  failMemorySession,
  initializeMemorySession,
  recordMemoryOperation,
  recordMemorySessionDiagnostic,
  startMemorySession,
} from '../domain/factories/memory-session-factories.js';
import type {
  DiagnosticEntry,
  MemorySession,
  MemorySessionProviderStatistics,
} from '../domain/types/memory-session-types.js';
import { MemoryOperationType } from '../domain/value-objects/memory-operation-type.js';
import { MemorySessionRevision } from '../domain/value-objects/memory-session-revision.js';
import { MemorySessionStatus } from '../domain/value-objects/memory-session-status.js';

import type { EngineError } from './engine-errors.js';
import type { MemoryEngineSessionRegistry } from './memory-engine-session-registry.js';

export type MemoryEngineOperationName = 'store' | 'retrieve' | 'search' | 'update' | 'delete';

export interface MemoryEngineExecutionContext {
  readonly operationName: MemoryEngineOperationName;
  readonly namespaceId: string;
  readonly executionKey: string;
}

export interface MemoryEngineSessionClock {
  now(): string;
}

export const systemMemoryEngineSessionClock: MemoryEngineSessionClock = {
  now: () => new Date().toISOString(),
};

export interface MemoryEngineSessionScope {
  readonly session: MemorySession;
  recordValidationOperation(payload?: Readonly<Record<string, unknown>>): void;
  recordStorageRequest(payload?: Readonly<Record<string, unknown>>): void;
  recordStorageResult(payload?: Readonly<Record<string, unknown>>): void;
  recordIndexOperation(payload?: Readonly<Record<string, unknown>>): void;
  recordRetrievalRequest(payload?: Readonly<Record<string, unknown>>): void;
  recordRetrievalResult(payload?: Readonly<Record<string, unknown>>): void;
  recordWarning(message: string): void;
  recordProviderFailure(code: string, message: string): void;
  recordProviderLatency(
    provider: keyof MemorySessionProviderStatistics,
    durationMs: number,
  ): void;
  finalizeSuccess(): MemorySession;
  finalizeFailure(error: EngineError): MemorySession;
}

function evolveProviderStatistics(
  session: MemorySession,
  statistics: Partial<MemorySessionProviderStatistics>,
): MemorySession {
  return Object.freeze({
    ...session,
    revision: session.revision.next(),
    providerStatistics: Object.freeze({
      ...session.providerStatistics,
      ...statistics,
    }),
  });
}

export class MemoryEngineSessionOrchestrator {
  private sessionCounter = 0;
  private operationCounter = 0;
  private currentSession: MemorySession | undefined;

  constructor(
    private readonly registry: MemoryEngineSessionRegistry,
    private readonly clock: MemoryEngineSessionClock = systemMemoryEngineSessionClock,
  ) {}

  beginExecution(context: MemoryEngineExecutionContext): MemoryEngineSessionScope {
    if (this.currentSession !== undefined) {
      throw new Error('MemoryEngineSessionOrchestrator already has an active execution');
    }

    this.operationCounter = 0;
    this.sessionCounter += 1;

    const createdAt = this.clock.now();
    const memorySessionId = `session.memory.engine.${context.operationName}.${this.sessionCounter}`;
    const executionId = `execution.memory.engine.${context.operationName}.${context.executionKey}`;

    let session = createMemorySession({
      memorySessionId,
      executionId,
      correlationId: createCorrelationId(`correlation.memory.engine.${context.executionKey}`),
      namespaceId: context.namespaceId,
      createdAt,
    });

    session = initializeMemorySession(session, createdAt);
    session = startMemorySession(session, createdAt);

    this.currentSession = session;
    this.registry.beginActiveSession(session);

    return this.createScope(session);
  }

  getLastCompletedSession(): MemorySession | undefined {
    const completed = this.registry.getCompletedSessions();
    return completed.at(-1);
  }

  private createScope(initialSession: MemorySession): MemoryEngineSessionScope {
    let session = initialSession;

    const nextOperationId = (label: string): string => {
      this.operationCounter += 1;
      return `operation.memory.engine.${label}.${this.operationCounter}`;
    };

    const recordOperation = (
      operationType: (typeof MemoryOperationType)[keyof typeof MemoryOperationType],
      label: string,
      payload?: Readonly<Record<string, unknown>>,
    ): void => {
      session = recordMemoryOperation(
        session,
        createOperationRecord({
          operationId: nextOperationId(label),
          operationType,
          timestamp: this.clock.now(),
          ...(payload === undefined ? {} : { payload }),
        }),
      );
      this.currentSession = session;
      this.registry.updateActiveSession(session);
    };

    const recordDiagnostic = (entry: DiagnosticEntry): void => {
      session = recordMemorySessionDiagnostic(session, entry);
      this.currentSession = session;
      this.registry.updateActiveSession(session);
    };

    const finalizeTerminal = (
      transition: (current: MemorySession, timestamp: string) => MemorySession,
    ): MemorySession => {
      const timestamp = this.clock.now();
      let terminal = transition(session, timestamp);
      terminal = disposeMemorySession(terminal, timestamp);
      this.currentSession = undefined;
      this.registry.registerCompletedSession(terminal);
      return terminal;
    };

    return {
      get session() {
        return session;
      },
      recordValidationOperation: (payload) => {
        recordOperation(MemoryOperationType.ValidationOperation, 'validation', payload);
      },
      recordStorageRequest: (payload) => {
        recordOperation(MemoryOperationType.StorageRequest, 'storage-request', payload);
      },
      recordStorageResult: (payload) => {
        recordOperation(MemoryOperationType.StorageResult, 'storage-result', payload);
      },
      recordIndexOperation: (payload) => {
        recordOperation(MemoryOperationType.IndexOperation, 'index', payload);
      },
      recordRetrievalRequest: (payload) => {
        recordOperation(MemoryOperationType.RetrievalRequest, 'retrieval-request', payload);
      },
      recordRetrievalResult: (payload) => {
        recordOperation(MemoryOperationType.RetrievalResult, 'retrieval-result', payload);
      },
      recordWarning: (message) => {
        recordDiagnostic({
          kind: 'warning',
          message,
          timestamp: this.clock.now(),
        });
      },
      recordProviderFailure: (code, message) => {
        recordDiagnostic({
          kind: 'provider_failure',
          code,
          message,
          timestamp: this.clock.now(),
        });
      },
      recordProviderLatency: (provider, durationMs) => {
        session = evolveProviderStatistics(session, { [provider]: durationMs });
        this.currentSession = session;
        this.registry.updateActiveSession(session);
        recordDiagnostic({
          kind: 'timing',
          operation: provider,
          durationMs,
          timestamp: this.clock.now(),
        });
      },
      finalizeSuccess: () =>
        finalizeTerminal((current, timestamp) => completeMemorySession(current, timestamp)),
      finalizeFailure: (error) =>
        finalizeTerminal((current, timestamp) =>
          failMemorySession(
            current,
            {
              code: error.canonicalCode,
              message: error.message,
              timestamp,
            },
            timestamp,
          ),
        ),
    };
  }
}

export function resolveMemoryEngineNamespaceId(
  metadata?: Readonly<Record<string, unknown>>,
  fallbackNamespaceId?: string,
): string {
  const namespaceFromMetadata = metadata?.namespaceId;
  if (typeof namespaceFromMetadata === 'string' && namespaceFromMetadata.trim().length > 0) {
    return namespaceFromMetadata;
  }

  if (fallbackNamespaceId !== undefined && fallbackNamespaceId.trim().length > 0) {
    return fallbackNamespaceId;
  }

  return 'memory.default';
}

/** @internal Ensures revision evolution remains coherent after provider-stat updates. */
export function __testOnlyAssertRevisionEvolution(session: MemorySession): boolean {
  return session.revision instanceof MemorySessionRevision &&
    session.status !== MemorySessionStatus.Created;
}
