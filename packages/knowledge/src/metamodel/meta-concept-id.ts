/**
 * Stable identifiers for core metamodel concepts.
 * @see KNOWLEDGE-002 §Core Meta Concepts
 */
export const MetaConceptId = {
  Identity: 'identity',
  Statement: 'statement',
  Object: 'object',
  Relationship: 'relationship',
  Context: 'context',
  Owner: 'owner',
  Lifecycle: 'lifecycle',
  Trust: 'trust',
  Version: 'version',
  Evidence: 'evidence',
  History: 'history',
  Graph: 'graph',
} as const;

export type MetaConceptId = (typeof MetaConceptId)[keyof typeof MetaConceptId];

export const META_CONCEPT_IDS: readonly MetaConceptId[] = Object.freeze(
  Object.values(MetaConceptId),
);
