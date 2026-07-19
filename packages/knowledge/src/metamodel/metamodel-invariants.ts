import { MetaConceptId } from './meta-concept-id.js';

/**
 * Normative invariants from KNOWLEDGE-002 §Metamodel Invariants.
 */
export interface MetamodelInvariantDefinition {
  readonly ruleId: string;
  readonly description: string;
  readonly concepts: readonly MetaConceptId[];
}

export const METAMODEL_INVARIANTS: readonly MetamodelInvariantDefinition[] = Object.freeze([
  Object.freeze({
    ruleId: 'MM-INV-001',
    description: 'Every Knowledge Object MUST have exactly one Identity',
    concepts: Object.freeze([MetaConceptId.Object, MetaConceptId.Identity]),
  }),
  Object.freeze({
    ruleId: 'MM-INV-002',
    description: 'Every Knowledge Statement MUST belong to at least one Knowledge Object',
    concepts: Object.freeze([MetaConceptId.Statement, MetaConceptId.Object]),
  }),
  Object.freeze({
    ruleId: 'MM-INV-003',
    description: 'Every Knowledge Object MUST exist within at least one Context',
    concepts: Object.freeze([MetaConceptId.Object, MetaConceptId.Context]),
  }),
  Object.freeze({
    ruleId: 'MM-INV-004',
    description: 'Every Knowledge Object MUST have an Owner',
    concepts: Object.freeze([MetaConceptId.Object, MetaConceptId.Owner]),
  }),
  Object.freeze({
    ruleId: 'MM-INV-005',
    description: 'Every Knowledge Object MUST participate in zero or more Relationships',
    concepts: Object.freeze([MetaConceptId.Object, MetaConceptId.Relationship]),
  }),
  Object.freeze({
    ruleId: 'MM-INV-006',
    description: 'Every Relationship MUST connect existing Knowledge Objects',
    concepts: Object.freeze([MetaConceptId.Relationship, MetaConceptId.Object]),
  }),
  Object.freeze({
    ruleId: 'MM-INV-007',
    description: 'Every Knowledge Object MUST support Versioning',
    concepts: Object.freeze([MetaConceptId.Object, MetaConceptId.Version]),
  }),
  Object.freeze({
    ruleId: 'MM-INV-008',
    description: 'Every Knowledge Object MUST maintain History',
    concepts: Object.freeze([MetaConceptId.Object, MetaConceptId.History]),
  }),
  Object.freeze({
    ruleId: 'MM-INV-009',
    description: 'Historical versions remain immutable',
    concepts: Object.freeze([MetaConceptId.History, MetaConceptId.Version, MetaConceptId.Statement]),
  }),
  Object.freeze({
    ruleId: 'MM-INV-010',
    description: 'Every Knowledge Object SHOULD maintain Trust information',
    concepts: Object.freeze([MetaConceptId.Object, MetaConceptId.Trust]),
  }),
  Object.freeze({
    ruleId: 'MM-INV-011',
    description: 'Knowledge Graphs MUST remain internally consistent',
    concepts: Object.freeze([MetaConceptId.Graph, MetaConceptId.Relationship, MetaConceptId.Object]),
  }),
]);

export function getMetamodelInvariant(ruleId: string): MetamodelInvariantDefinition | undefined {
  return METAMODEL_INVARIANTS.find((invariant) => invariant.ruleId === ruleId);
}
