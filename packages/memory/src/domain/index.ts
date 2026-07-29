export type { Namespace, NamespaceSnapshot } from './entities/namespace.js';
export type { Collection, CollectionSnapshot } from './entities/collection.js';
export type { Record, RecordSnapshot } from './entities/record.js';
export type { Version, VersionSnapshot } from './entities/version.js';
export type { Relationship, RelationshipSnapshot } from './entities/relationship.js';

export type {
  MemoryRecord,
  MemorySnapshot,
  MemoryStatistics,
  MemoryQuery,
  RetrievalResult,
  SearchResult,
  SimilarityResult,
  ValidationIssue,
  ValidationResult,
  RepairOptions,
  RepairResult,
} from './types/memory-types.js';

export type { MemoryStore } from './interfaces/memory-store.js';
export type { ConsistencyProvider } from './interfaces/consistency-provider.js';

export {
  MemoryTypedId,
  assertMemoryIdValue,
  NamespaceId,
  isNamespaceId,
  CollectionId,
  isCollectionId,
  RecordId,
  isRecordId,
  VersionId,
  isVersionId,
  RelationshipId,
  isRelationshipId,
  RevisionNumber,
  Checksum,
  NamespaceType,
  CollectionType,
  RecordType,
  RecordStatus,
  RECORD_STATUSES,
  isRecordStatus,
  Visibility,
  VISIBILITY_VALUES,
  isVisibility,
  RelationshipType,
  RELATIONSHIP_TYPES,
  isRelationshipType,
  MemoryMetadata,
  type MemoryMetadataData,
  MemorySessionId,
  isMemorySessionId,
  createExecutionId,
  type ExecutionId,
  MemorySessionStatus,
  MEMORY_SESSION_STATUSES,
  isMemorySessionStatus,
  MemorySessionRevision,
  MemorySessionMetadata,
  type MemorySessionMetadataData,
  MemorySessionContext,
  type MemorySessionContextData,
  MemoryOperationType,
  MEMORY_OPERATION_TYPES,
  isMemoryOperationType,
  MemoryOperationId,
  isMemoryOperationId,
} from './value-objects/index.js';

export {
  StoreType,
  STORE_TYPES,
  isStoreType,
  StoreLifecycle,
  STORE_LIFECYCLE_VALUES,
  isStoreLifecycle,
  ConsistencyLevel,
  CONSISTENCY_LEVELS,
  isConsistencyLevel,
} from './constants/memory-constants.js';

export {
  STORAGE_CONSTRAINTS,
  STORAGE_HIERARCHY,
  RECORD_LIFECYCLE,
  VERSION_LIFECYCLE,
} from './constants/storage-constraints.js';

export {
  MemoryDomainError,
  createMemoryError,
  isMemoryDomainError,
  BROKEN_REFERENCE,
  CORRUPTED_RECORD,
  DUPLICATE_IDENTIFIER,
  INVALID_ENTRY,
  INVALID_MEMORY_RECORD,
  INVALID_QUERY,
  MEMORY_IMMUTABLE_VERSION,
  MEMORY_INDEX_ERROR,
  MEMORY_INVALID_COLLECTION,
  MEMORY_INVALID_ID,
  MEMORY_INVALID_NAMESPACE,
  MEMORY_INVALID_RECORD,
  MEMORY_INVALID_RELATIONSHIP,
  MEMORY_INVALID_VERSION,
  MEMORY_INVALID_SESSION,
  MEMORY_INVALID_SESSION_OPERATION,
  MEMORY_INVALID_SESSION_TRANSITION,
  MEMORY_NOT_FOUND,
  MEMORY_RETRIEVAL_ERROR,
  MEMORY_STORAGE_ERROR,
  MISSING_INDEX,
  SESSION_CORRUPTED,
} from './errors/create-memory-error.js';

export {
  createNamespace,
  createCollection,
  createRecord,
  createVersion,
  createRelationship,
  projectMemoryRecord,
  evolveRecord,
  type CreateNamespaceInput,
  type CreateCollectionInput,
  type CreateRecordInput,
  type CreateVersionInput,
  type CreateRelationshipInput,
} from './factories/memory-factories.js';

export {
  createRecordAggregate,
  getCurrentVersion,
  assertVersionImmutable,
  type RecordAggregate,
} from './aggregates/record-aggregate.js';

export type { MemorySession } from './aggregates/memory-session-aggregate.js';

export type {
  DiagnosticEntry,
  LifecycleRecord,
  MemorySessionErrorRecord,
  MemorySessionExecutionMetadata,
  MemorySessionOperationCounters,
  MemorySessionProviderStatistics,
  MemorySessionStatistics,
  OperationRecord,
} from './types/memory-session-types.js';

export {
  MEMORY_SESSION_TRANSITIONS,
  isAllowedMemorySessionTransition,
  isTerminalMemorySessionStatus,
  MEMORY_SESSION_TERMINAL_STATUSES,
} from './constants/memory-session-lifecycle.js';

export {
  createMemorySession,
  initializeMemorySession,
  startMemorySession,
  completeMemorySession,
  failMemorySession,
  disposeMemorySession,
  recordMemoryOperation,
  recordMemorySessionDiagnostic,
  recordLifecycleRecord,
  computeMemorySessionStatistics,
  createOperationRecord,
  type CreateMemorySessionInput,
} from './factories/memory-session-factories.js';

export {
  validateMemorySession,
  validateMemorySessionTransition,
  validateOperationRecord,
  validateDiagnosticEntry,
  isValidMemorySession,
} from './validators/memory-session-validators.js';

export {
  createValidationIssue,
  validateNamespace,
  validateCollection,
  validateRecord,
  validateVersion,
  validateRelationship,
  validateUniqueIdentifier,
  validateMemoryRecord,
  validateRecordPersistence,
  validateRevisionMonotonicity,
  validateVersionImmutability,
  isValid,
} from './validators/memory-validators.js';
