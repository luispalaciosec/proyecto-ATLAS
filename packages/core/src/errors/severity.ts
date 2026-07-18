/**
 * Error severity levels (closed contract).
 * @see ATLAS-100 §12 Error Contract
 * @see SDK-205 §11 (filtering by severity=warning)
 */
export const ERROR_SEVERITIES = ['info', 'warning', 'error', 'critical'] as const;

export type ErrorSeverity = (typeof ERROR_SEVERITIES)[number];

export function isErrorSeverity(value: unknown): value is ErrorSeverity {
  return typeof value === 'string' && (ERROR_SEVERITIES as readonly string[]).includes(value);
}
