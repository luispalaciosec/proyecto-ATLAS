import type { ProjectionDiagnostic } from './projection-types.js';

export class KnowledgeProjectionError extends Error {
  readonly diagnostics: readonly ProjectionDiagnostic[];

  constructor(message: string, diagnostics: readonly ProjectionDiagnostic[]) {
    super(message);
    this.name = 'KnowledgeProjectionError';
    this.diagnostics = Object.freeze([...diagnostics]);
  }
}
