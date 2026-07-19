import type { MetaConceptId } from './meta-concept-id.js';

/**
 * AG-001 — Declarative reflective schema (no runtime reflection in Sprint 8).
 * Preserves future capability for every metamodel element to describe itself.
 */

export interface MetaIdentitySchema {
  readonly permanent: boolean;
  readonly description: string;
}

export interface MetaAttributeSchema {
  readonly name: string;
  readonly required: boolean;
  readonly description: string;
}

export interface MetaRelationshipSchema {
  readonly name: string;
  readonly targetConcept: MetaConceptId;
  readonly directional: boolean;
  readonly description: string;
}

export interface MetaLifecycleSchema {
  readonly states: readonly string[];
  readonly description: string;
}

export interface MetaOperationSchema {
  readonly name: string;
  readonly description: string;
}

export interface MetaValidationRuleSchema {
  readonly ruleId: string;
  readonly description: string;
}

export interface MetaContextApplicabilitySchema {
  readonly required: boolean;
  readonly dimensions: readonly string[];
  readonly description: string;
}

export interface MetaConceptDescriptor {
  readonly conceptId: MetaConceptId;
  readonly semanticType: string;
  readonly identity: MetaIdentitySchema;
  readonly attributes: readonly MetaAttributeSchema[];
  readonly relationships: readonly MetaRelationshipSchema[];
  readonly lifecycle: MetaLifecycleSchema | null;
  readonly operations: readonly MetaOperationSchema[];
  readonly validationRules: readonly MetaValidationRuleSchema[];
  readonly contextApplicability: MetaContextApplicabilitySchema;
}
