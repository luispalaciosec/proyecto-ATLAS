import { META_CONCEPT_IDS, type MetaConceptId } from './meta-concept-id.js';

/**
 * Extension model — domain-specific kinds without redefining core concepts.
 * @see KNOWLEDGE-002 §Extension Model
 */
export interface ExtensionKindDefinition {
  readonly kind: string;
  readonly description: string;
  readonly baseConcept: MetaConceptId;
}

export interface MetamodelExtensionPolicy {
  readonly allowCustomObjectKinds: boolean;
  readonly allowCustomRelationshipTypes: boolean;
  readonly forbiddenCoreOverrides: readonly MetaConceptId[];
}

export const DEFAULT_EXTENSION_POLICY: MetamodelExtensionPolicy = Object.freeze({
  allowCustomObjectKinds: true,
  allowCustomRelationshipTypes: true,
  forbiddenCoreOverrides: META_CONCEPT_IDS,
});

export function assertExtensionKindAllowed(
  policy: MetamodelExtensionPolicy,
  kind: string,
  baseConcept: MetaConceptId,
): boolean {
  const trimmed = kind.trim();

  if (trimmed.length === 0) {
    return false;
  }

  if (policy.forbiddenCoreOverrides.includes(trimmed as MetaConceptId)) {
    return false;
  }

  if (baseConcept === 'object') {
    return policy.allowCustomObjectKinds;
  }

  if (baseConcept === 'relationship') {
    return policy.allowCustomRelationshipTypes;
  }

  return false;
}
