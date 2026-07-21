import type { ExecutionRepository } from '../engine/execution-repository.js';

import type { Diagnostics } from './diagnostics.js';

export interface CreateDiagnosticsOptions {
  readonly executionRepository?: ExecutionRepository;
}

export function createDiagnostics(options: CreateDiagnosticsOptions = {}): Diagnostics {
  const repository = options.executionRepository;

  return {
    component: 'diagnostics',
    getSnapshot(executionId: string) {
      const execution = repository?.get(executionId);

      if (!execution) {
        return Object.freeze({
          execution_id: executionId,
          metrics: Object.freeze([]),
          traces: Object.freeze([]),
          diagnostics: Object.freeze([]),
        });
      }

      return Object.freeze({
        execution_id: executionId,
        metrics: Object.freeze([
          Object.freeze({
            name: 'artifact_count',
            value: execution.metrics.artifact_count,
            unit: 'count',
            execution_id: executionId,
            recorded_at: execution.metadata.created_at,
          }),
          Object.freeze({
            name: 'output_count',
            value: execution.metrics.output_count,
            unit: 'count',
            execution_id: executionId,
            recorded_at: execution.metrics.completed_at ?? execution.metadata.created_at,
          }),
          ...(execution.metrics.duration_ms !== null
            ? [
                Object.freeze({
                  name: 'duration_ms',
                  value: execution.metrics.duration_ms,
                  unit: 'ms',
                  execution_id: executionId,
                  recorded_at: execution.metrics.completed_at ?? execution.metadata.created_at,
                }),
              ]
            : []),
        ]),
        traces: Object.freeze([]),
        diagnostics: Object.freeze(
          execution.diagnostics.records.map((record) =>
            Object.freeze({
              diagnostic_id: record.diagnostic_id,
              level: record.level,
              message: record.message,
              execution_id: executionId,
              recorded_at: record.recorded_at,
            }),
          ),
        ),
      });
    },
  };
}
