/**
 * @atlas/knowledge — Knowledge Capability (Sprint 8: metamodel + domain core)
 * @see Release/KNOWLEDGE_IMPLEMENTATION_PLAN.md
 */

export * from './metamodel/index.js';
export * from './domain/value-objects/index.js';
export type {
  KnowledgeStatement,
  KnowledgeStatementSnapshot,
} from './domain/entities/knowledge-statement.js';
export type {
  KnowledgeRelationship,
  KnowledgeRelationshipSnapshot,
} from './domain/entities/knowledge-relationship.js';
export type {
  KnowledgeObject,
  KnowledgeObjectSnapshot,
  RelationshipRef,
} from './domain/aggregates/knowledge-object.js';
export {
  createKnowledgeStatement,
  createKnowledgeRelationship,
  createKnowledgeObject,
  type CreateKnowledgeStatementParams,
  type CreateKnowledgeRelationshipParams,
  type CreateKnowledgeObjectParams,
} from './factories/index.js';
export * from './validators/index.js';
export {
  INGEST_DOCUMENT_OBJECT_KIND,
  INGEST_SOURCE_UPLOAD,
  KNOWLEDGE_OBJECT_RECORD_TYPE,
  DOCUMENT_CHUNK_RECORD_TYPE,
  buildIngestChunkMetadata,
  buildKnowledgeObjectRecordMetadata,
  createIngestedDocumentKnowledgeObject,
  serializeIngestedDocumentSource,
  type CreateIngestedDocumentParams,
  type IngestChunkReferenceParams,
  type IngestedDocumentKnowledge,
  type IngestedDocumentProvenance,
} from './ingest/document-ingest.js';
