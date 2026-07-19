/**
 * Knowledge → Compiler projection layer (Sprint 9, AR-009-01).
 * Translates KnowledgeObjects into disposable CompilationUnit params.
 * Does not compile and does not contain business logic.
 */
export { KnowledgeProjectionAdapter, isKnowledgeObject } from './knowledge-projection-adapter.js';
export { KnowledgeProjectionError } from './knowledge-projection-error.js';
export type {
  ProjectionBatchResult,
  ProjectionDiagnostic,
  ProjectionOptions,
  ProjectionResult,
} from './projection-types.js';
export {
  computeSourceChecksum,
  serializeKnowledgeCanonicalSource,
  stableStringify,
  type KnowledgeCanonicalSource,
} from './canonical-source.js';
