// Value Objects — ATLAS-DOM-000 §11
export { Identifier, Metadata, Namespace, Version } from './types/index.js';

// Errors — ATLAS-100 §12
export {
  createAtlasError,
  isAtlasError,
  type AtlasError,
  type CreateAtlasErrorParams,
  type ErrorSeverity,
} from './errors/index.js';

// Engine contracts — ATLAS-100 §8, §12, §13
export type {
  EngineConfiguration,
  EngineContext,
  EngineEvent,
  EngineInput,
  EngineMetadata,
  EngineMetrics,
  EngineModuleContract,
  EngineOutput,
  EngineRequest,
  ExecutionStatus,
} from './contracts/index.js';

// Shared primitives
export type { AtlasTimestamp } from './timestamp.js';
export type { Result } from './result.js';
export type { TraceId } from './trace-id.js';
export { foldDiacritics, normalizeForSearch } from './text/fold-diacritics.js';
