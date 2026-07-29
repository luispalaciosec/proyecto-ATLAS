import type { CorrelationId } from '@atlas/events';

import type { MemoryOperationId } from '../value-objects/memory-operation-id.js';
import type { MemoryOperationType } from '../value-objects/memory-operation-type.js';
import type { MemorySessionContext } from '../value-objects/memory-session-context.js';
import type { MemorySessionId } from '../value-objects/memory-session-id.js';
import type { MemorySessionMetadata } from '../value-objects/memory-session-metadata.js';
import type { MemorySessionRevision } from '../value-objects/memory-session-revision.js';
import type { MemorySessionStatus } from '../value-objects/memory-session-status.js';
import type { ExecutionId } from '../value-objects/execution-id.js';
import type { NamespaceId } from '../value-objects/namespace-id.js';

export interface MemorySessionOperationCounters {
  readonly retrievalCount: number;
  readonly storageCount: number;
  readonly indexCount: number;
  readonly validationCount: number;
}

export interface MemorySessionProviderStatistics {
  readonly storageLatencyMs?: number;
  readonly indexLatencyMs?: number;
  readonly retrievalLatencyMs?: number;
}

export interface MemorySessionExecutionMetadata {
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly failedAt?: string;
  readonly disposedAt?: string;
}

export interface MemorySessionErrorRecord {
  readonly code: string;
  readonly message: string;
  readonly timestamp: string;
}

export interface OperationRecord {
  readonly operationId: MemoryOperationId;
  readonly operationType: MemoryOperationType;
  readonly timestamp: string;
  readonly payload?: Readonly<Record<string, unknown>>;
}

export type DiagnosticEntry =
  | {
      readonly kind: 'warning';
      readonly message: string;
      readonly timestamp: string;
    }
  | {
      readonly kind: 'provider_failure';
      readonly code: string;
      readonly message: string;
      readonly timestamp: string;
    }
  | {
      readonly kind: 'timing';
      readonly operation: string;
      readonly durationMs: number;
      readonly timestamp: string;
    }
  | {
      readonly kind: 'operation_count';
      readonly counts: MemorySessionOperationCounters;
      readonly timestamp: string;
    }
  | {
      readonly kind: 'health_snapshot';
      readonly provider: string;
      readonly available: boolean;
      readonly timestamp: string;
    };

export interface LifecycleRecord {
  readonly fromStatus: MemorySessionStatus;
  readonly toStatus: MemorySessionStatus;
  readonly timestamp: string;
}

export interface MemorySessionStatistics {
  readonly retrievalCount: number;
  readonly storageCount: number;
  readonly indexCount: number;
  readonly validationCount: number;
  readonly executionDurationMs?: number;
  readonly providerLatencyMs?: number;
}

export interface MemorySession {
  readonly memorySessionId: MemorySessionId;
  readonly executionId: ExecutionId;
  readonly correlationId: CorrelationId;
  readonly namespaceId: NamespaceId;
  readonly createdAt: string;
  readonly revision: MemorySessionRevision;
  readonly status: MemorySessionStatus;
  readonly context: MemorySessionContext;
  readonly metadata: MemorySessionMetadata;
  readonly operationCounters: MemorySessionOperationCounters;
  readonly providerStatistics: MemorySessionProviderStatistics;
  readonly executionMetadata: MemorySessionExecutionMetadata;
  readonly errors: readonly MemorySessionErrorRecord[];
  readonly operationHistory: readonly OperationRecord[];
  readonly diagnosticHistory: readonly DiagnosticEntry[];
  readonly lifecycleHistory: readonly LifecycleRecord[];
}

export const EMPTY_OPERATION_COUNTERS: MemorySessionOperationCounters = Object.freeze({
  retrievalCount: 0,
  storageCount: 0,
  indexCount: 0,
  validationCount: 0,
});

export const EMPTY_PROVIDER_STATISTICS: MemorySessionProviderStatistics = Object.freeze({});

export const EMPTY_EXECUTION_METADATA: MemorySessionExecutionMetadata = Object.freeze({});
