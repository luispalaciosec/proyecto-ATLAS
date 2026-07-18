import type { Diagnostic } from '../contracts/diagnostic.js';

export function hasBlockingDiagnostics(diagnostics: readonly Diagnostic[]): boolean {
  return diagnostics.some((diagnostic) => diagnostic.severity === 'error');
}

export function mergeDiagnostics(
  ...groups: readonly (readonly Diagnostic[])[]
): readonly Diagnostic[] {
  return Object.freeze(groups.flat());
}
