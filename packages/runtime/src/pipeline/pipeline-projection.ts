import type { Execution } from '../engine/execution-aggregate.js';
import type { RuntimeEventEnvelope } from '../events/types.js';

import {
  PIPELINE_CANCELLED_EVENT_TYPE,
  PIPELINE_COMPLETED_EVENT_TYPE,
  PIPELINE_FAILED_EVENT_TYPE,
  PIPELINE_PAUSED_EVENT_TYPE,
  PIPELINE_RESUMED_EVENT_TYPE,
  PIPELINE_STAGE_COMPLETED_EVENT_TYPE,
  PIPELINE_STAGE_FAILED_EVENT_TYPE,
  PIPELINE_STARTED_EVENT_TYPE,
  PIPELINE_TRANSITION_EVENT_TYPE,
} from './pipeline-events.js';
import type {
  PipelineExecution,
  PipelineStageResult,
  PipelineStatus,
  PipelineTransition,
} from './pipeline-model.js';

const PIPELINE_STATUS_PREFIX = 'pipeline_status:';

export function readPipelineStatus(execution: Execution, pipelineId: string): PipelineStatus {
  const scoped = execution.diagnostics.records.filter((record) =>
    record.diagnostic_id.startsWith(`${execution.identity.execution_id}:${pipelineId}:status:`),
  );
  const latest = scoped[scoped.length - 1];

  if (!latest) {
    return 'pending';
  }

  const [, status] = latest.message.split(PIPELINE_STATUS_PREFIX);
  return (status ?? 'pending') as PipelineStatus;
}

export function pipelineEventsFor(
  execution: Execution,
  pipelineId: string,
): readonly RuntimeEventEnvelope[] {
  return execution.events.filter(
    (event) =>
      event.execution_id === execution.identity.execution_id &&
      String(event.payload.pipeline_id ?? '') === pipelineId,
  );
}

export function projectPipelineStageResults(events: readonly RuntimeEventEnvelope[]): PipelineStageResult[] {
  const results: PipelineStageResult[] = [];

  for (const event of events) {
    if (
      event.event_type !== PIPELINE_STAGE_COMPLETED_EVENT_TYPE &&
      event.event_type !== PIPELINE_STAGE_FAILED_EVENT_TYPE
    ) {
      continue;
    }

    const payload = event.payload;
    results.push(
      Object.freeze({
        stage: Object.freeze({
          stage_id: String(payload.stage_id),
          stage_version: String(payload.stage_version ?? '1.0.0'),
        }),
        status: event.event_type === PIPELINE_STAGE_FAILED_EVENT_TYPE ? 'failed' : 'completed',
        output: Object.freeze({
          value: Object.freeze({ ...(payload.output as Record<string, unknown> | undefined) ?? {} }),
        }),
        duration_ms: Number(payload.duration_ms ?? 0),
        error:
          payload.error === undefined || payload.error === null
            ? null
            : Object.freeze({
                code: String((payload.error as Record<string, unknown>).code ?? 'pipeline_stage_failed'),
                message: String((payload.error as Record<string, unknown>).message ?? 'stage_failed'),
              }),
      }),
    );
  }

  return results;
}

export function projectPipelineTransitions(events: readonly RuntimeEventEnvelope[]): PipelineTransition[] {
  return events
    .filter((event) => event.event_type === PIPELINE_TRANSITION_EVENT_TYPE)
    .map((event) =>
      Object.freeze({
        from_stage_id:
          event.payload.from_stage_id === null || event.payload.from_stage_id === undefined
            ? null
            : String(event.payload.from_stage_id),
        to_stage_id: String(event.payload.to_stage_id),
        occurred_at: event.timestamp,
      }),
    );
}

export function derivePipelineStatus(events: readonly RuntimeEventEnvelope[]): PipelineStatus {
  const ordered = [...events].sort((left, right) => left.timestamp.localeCompare(right.timestamp));
  let status: PipelineStatus = 'pending';

  for (const event of ordered) {
    switch (event.event_type) {
      case PIPELINE_STARTED_EVENT_TYPE:
      case PIPELINE_RESUMED_EVENT_TYPE:
        status = 'running';
        break;
      case PIPELINE_PAUSED_EVENT_TYPE:
        status = 'paused';
        break;
      case PIPELINE_COMPLETED_EVENT_TYPE:
        return 'completed';
      case PIPELINE_FAILED_EVENT_TYPE:
        return 'failed';
      case PIPELINE_CANCELLED_EVENT_TYPE:
        return 'cancelled';
      default:
        break;
    }
  }

  return status;
}

export function projectPipelineExecution(
  execution: Execution,
  pipelineId: string,
): PipelineExecution | null {
  const events = pipelineEventsFor(execution, pipelineId);

  if (events.length === 0 && readPipelineStatus(execution, pipelineId) === 'pending') {
    return null;
  }

  const stages = projectPipelineStageResults(events);
  const transitions = projectPipelineTransitions(events);
  const status = derivePipelineStatus(events);
  const currentStageId = transitions[transitions.length - 1]?.to_stage_id ?? null;

  return Object.freeze({
    pipeline_id: pipelineId,
    execution_id: execution.identity.execution_id,
    status,
    current_stage_id: currentStageId,
    stages: Object.freeze(stages),
    transitions: Object.freeze(transitions),
  });
}
