import type { Artifact } from '@atlas/compiler';

import type { ExecutionContext } from '../contracts/execution-context.js';
import type { ExecutionOutput } from '../contracts/execution-output.js';
import type { ExecutionResult } from '../contracts/execution-result.js';
import type { ExecuteParams } from '../contracts/runtime.js';
import { createExecutionContext } from '../context/execution-context.js';
import type { RuntimeEventEnvelope } from '../events/types.js';
import type { ExecutionLifecycleSnapshot, ExecutionLifecycleStage } from '../lifecycle/types.js';
import type { ExecutionStateValue, StateTransition } from '../state/types.js';

import type { ExecutionStatus } from './types.js';

/**
 * @see ATLAS-RUNTIME-001 Execution Unit
 */
export interface ExecutionIdentity {
  readonly execution_id: string;
  readonly correlation_id: string;
}

export interface ExecutionMetadata {
  readonly created_at: string;
  readonly workspace: Readonly<Record<string, unknown>>;
  readonly custom: Readonly<Record<string, unknown>>;
  readonly artifacts: readonly Artifact[];
}

export interface ExecutionLifecycleProjection {
  readonly current: ExecutionLifecycleStage;
  readonly history: readonly ExecutionLifecycleSnapshot[];
}

export interface ExecutionStateProjection {
  readonly value: ExecutionStateValue;
  readonly transitions: readonly StateTransition[];
}

export interface ExecutionMetrics {
  readonly artifact_count: number;
  readonly output_count: number;
  readonly started_at: string | null;
  readonly completed_at: string | null;
  readonly duration_ms: number | null;
}

export interface ExecutionDiagnosticRecord {
  readonly diagnostic_id: string;
  readonly level: 'info' | 'warning' | 'error';
  readonly message: string;
  readonly recorded_at: string;
}

export interface ExecutionDiagnosticsProjection {
  readonly records: readonly ExecutionDiagnosticRecord[];
}

/**
 * Execution Aggregate Root — ATLAS-RUNTIME-001, ATLAS-RUNTIME-009
 */
export interface Execution {
  readonly identity: ExecutionIdentity;
  readonly metadata: ExecutionMetadata;
  readonly context: ExecutionContext;
  readonly lifecycle: ExecutionLifecycleProjection;
  readonly state: ExecutionStateProjection;
  readonly events: readonly RuntimeEventEnvelope[];
  readonly outputs: readonly ExecutionOutput[];
  readonly metrics: ExecutionMetrics;
  readonly diagnostics: ExecutionDiagnosticsProjection;
  readonly result: ExecutionResult | null;
  readonly status: ExecutionStatus;
}

export function createExecutionIdentity(executionId: string): ExecutionIdentity {
  return Object.freeze({
    execution_id: executionId,
    correlation_id: executionId,
  });
}

export function createInitialExecutionAggregate(
  params: ExecuteParams,
  executionId: string,
  clock: () => string,
): Execution {
  const createdAt = clock();
  const context = createExecutionContext({
    session_id: executionId,
    workspace: params.workspace,
    artifacts: params.artifacts,
    metadata: params.metadata,
  });

  const lifecycleSnapshot = Object.freeze({
    execution_id: executionId,
    stage: 'created' as const,
    entered_at: createdAt,
  });

  const stateValue = Object.freeze({
    stage: 'created' as const,
    status: 'created' as const,
    success: null,
    artifact_count: params.artifacts.length,
    output_count: 0,
  });

  return Object.freeze({
    identity: createExecutionIdentity(executionId),
    metadata: Object.freeze({
      created_at: createdAt,
      workspace: Object.freeze({ ...(params.workspace ?? {}) }),
      custom: Object.freeze({ ...(params.metadata ?? {}) }),
      artifacts: Object.freeze([...params.artifacts]),
    }),
    context,
    lifecycle: Object.freeze({
      current: 'created',
      history: Object.freeze([lifecycleSnapshot]),
    }),
    state: Object.freeze({
      value: stateValue,
      transitions: Object.freeze([]),
    }),
    events: Object.freeze([]),
    outputs: Object.freeze([]),
    metrics: Object.freeze({
      artifact_count: params.artifacts.length,
      output_count: 0,
      started_at: null,
      completed_at: null,
      duration_ms: null,
    }),
    diagnostics: Object.freeze({
      records: Object.freeze([
        Object.freeze({
          diagnostic_id: `${executionId}:created`,
          level: 'info' as const,
          message: 'execution_created',
          recorded_at: createdAt,
        }),
      ]),
    }),
    result: null,
    status: 'pending',
  });
}

export function withExecutionLifecycle(
  execution: Execution,
  snapshot: ExecutionLifecycleSnapshot,
): Execution {
  return Object.freeze({
    ...execution,
    lifecycle: Object.freeze({
      current: snapshot.stage,
      history: Object.freeze([...execution.lifecycle.history, snapshot]),
    }),
    status: deriveExecutionStatus(snapshot.stage, execution.state.value.success),
  });
}

export function withExecutionState(
  execution: Execution,
  value: ExecutionStateValue,
  transition: StateTransition,
): Execution {
  return Object.freeze({
    ...execution,
    state: Object.freeze({
      value,
      transitions: Object.freeze([...execution.state.transitions, transition]),
    }),
    status: deriveExecutionStatus(value.stage, value.success),
  });
}

export function withExecutionEvent(
  execution: Execution,
  event: RuntimeEventEnvelope,
): Execution {
  return Object.freeze({
    ...execution,
    events: Object.freeze([...execution.events, event]),
  });
}

export function withExecutionOutputs(
  execution: Execution,
  outputs: readonly ExecutionOutput[],
): Execution {
  return Object.freeze({
    ...execution,
    outputs: Object.freeze([...outputs]),
  });
}

export function withExecutionMetrics(
  execution: Execution,
  patch: Partial<ExecutionMetrics>,
): Execution {
  const metrics = Object.freeze({
    ...execution.metrics,
    ...patch,
    duration_ms:
      patch.duration_ms ??
      (patch.started_at && patch.completed_at
        ? new Date(patch.completed_at).getTime() - new Date(patch.started_at).getTime()
        : execution.metrics.duration_ms),
  });

  return Object.freeze({
    ...execution,
    metrics,
  });
}

export function withExecutionDiagnostics(
  execution: Execution,
  record: ExecutionDiagnosticRecord,
): Execution {
  return Object.freeze({
    ...execution,
    diagnostics: Object.freeze({
      records: Object.freeze([...execution.diagnostics.records, record]),
    }),
  });
}

export function withExecutionContext(
  execution: Execution,
  context: ExecutionContext,
): Execution {
  return Object.freeze({
    ...execution,
    context,
  });
}

export function withExecutionResult(
  execution: Execution,
  result: ExecutionResult,
): Execution {
  return Object.freeze({
    ...execution,
    result,
    status: result.success ? 'completed' : 'failed',
  });
}

export function deriveExecutionStatus(
  stage: ExecutionLifecycleStage,
  success: boolean | null,
): ExecutionStatus {
  if (stage === 'archived') {
    return success === false ? 'failed' : 'completed';
  }

  if (stage === 'created') {
    return 'pending';
  }

  return 'active';
}
