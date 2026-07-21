/**
 * @see ATLAS-RUNTIME-007 Runtime Observability
 */
export interface RuntimeMetric {
  readonly name: string;
  readonly value: number;
  readonly unit: string;
  readonly execution_id: string;
  readonly recorded_at: string;
}

export interface RuntimeTraceSpan {
  readonly span_id: string;
  readonly trace_id: string;
  readonly name: string;
  readonly started_at: string;
  readonly ended_at: string | null;
}

export interface RuntimeDiagnosticRecord {
  readonly diagnostic_id: string;
  readonly level: 'info' | 'warning' | 'error';
  readonly message: string;
  readonly execution_id: string;
  readonly recorded_at: string;
}

export interface RuntimeDiagnosticsSnapshot {
  readonly execution_id: string;
  readonly metrics: readonly RuntimeMetric[];
  readonly traces: readonly RuntimeTraceSpan[];
  readonly diagnostics: readonly RuntimeDiagnosticRecord[];
}
