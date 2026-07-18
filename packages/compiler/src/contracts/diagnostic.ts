/**
 * @see ATLAS-ARCH-003 §24 Diagnostic System
 */
export const DIAGNOSTIC_SEVERITIES = ['error', 'warning', 'information', 'suggestion'] as const;

export type DiagnosticSeverity = (typeof DIAGNOSTIC_SEVERITIES)[number];

export function isDiagnosticSeverity(value: unknown): value is DiagnosticSeverity {
  return typeof value === 'string' && (DIAGNOSTIC_SEVERITIES as readonly string[]).includes(value);
}

export interface DiagnosticLocation {
  readonly unit_id?: string;
  readonly path?: string;
  readonly line?: number;
  readonly column?: number;
}

export interface Diagnostic {
  readonly id: string;
  readonly severity: DiagnosticSeverity;
  readonly location: DiagnosticLocation;
  readonly message: string;
  readonly cause?: string;
  readonly suggestion?: string;
}
