import type {
  Diagnostic,
  DiagnosticLocation,
  DiagnosticSeverity,
} from '../contracts/diagnostic.js';

let diagnosticCounter = 0;

export interface CreateDiagnosticParams {
  readonly severity: DiagnosticSeverity;
  readonly message: string;
  readonly location?: DiagnosticLocation;
  readonly cause?: string;
  readonly suggestion?: string;
  readonly id?: string;
}

export function createDiagnostic(params: CreateDiagnosticParams): Diagnostic {
  diagnosticCounter += 1;

  return Object.freeze({
    id: params.id ?? `diag-${diagnosticCounter}`,
    severity: params.severity,
    location: Object.freeze({ ...(params.location ?? {}) }),
    message: params.message,
    cause: params.cause,
    suggestion: params.suggestion,
  });
}

export function resetDiagnosticCounter(): void {
  diagnosticCounter = 0;
}
