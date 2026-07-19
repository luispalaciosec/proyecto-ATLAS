/**
 * @atlas/knowledge — Knowledge Capability (Sprint 8: metamodel + domain core)
 * @see Release/KNOWLEDGE_IMPLEMENTATION_PLAN.md
 */

export * from './metamodel/index.js';
export * from './domain/value-objects/index.js';
export type { KnowledgeStatement, KnowledgeStatementSnapshot } from './domain/entities/knowledge-statement.js';
export type { KnowledgeRelationship, KnowledgeRelationshipSnapshot } from './domain/entities/knowledge-relationship.js';
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
