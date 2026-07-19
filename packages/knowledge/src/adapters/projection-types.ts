import type { CreateCompilationUnitParams } from '@atlas/compiler';

export interface ProjectionDiagnostic {
  readonly code: string;
  readonly message: string;
  readonly objectId?: string;
}

export interface ProjectionResult {
  readonly success: boolean;
  readonly unit?: CreateCompilationUnitParams;
  readonly diagnostics: readonly ProjectionDiagnostic[];
}

export interface ProjectionBatchResult {
  readonly units: readonly CreateCompilationUnitParams[];
  readonly diagnostics: readonly ProjectionDiagnostic[];
}

export interface ProjectionOptions {
  /**
   * When false (default), only operational and observed objects are projectable.
   */
  readonly requireCompilableLifecycle?: boolean;
}
