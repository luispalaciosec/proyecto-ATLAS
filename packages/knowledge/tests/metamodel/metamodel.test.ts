import { describe, expect, it } from 'vitest';

import {
  META_CONCEPT_IDS,
  META_CONCEPT_REGISTRY,
  METAMODEL_INVARIANTS,
  MetaConceptId,
  MetaLayer,
  DEFAULT_EXTENSION_POLICY,
  assertExtensionKindAllowed,
  getMetaConceptDescriptor,
  listMetaConceptDescriptors,
} from '../../src/metamodel/index.js';
import {
  assertMetamodelRegistryValid,
  validateMetamodelRegistry,
} from '../../src/validators/metamodel-validator.js';

describe('Knowledge Metamodel', () => {
  it('defines four meta layers in order', () => {
    expect(MetaLayer.Reality).toBe('reality');
    expect(MetaLayer.Graph).toBe('graph');
  });

  it('registers all twelve core concepts', () => {
    expect(META_CONCEPT_IDS).toHaveLength(12);
    expect(META_CONCEPT_IDS).toContain(MetaConceptId.Statement);
  });

  it('provides AG-001 reflective descriptors for every concept', () => {
    for (const conceptId of META_CONCEPT_IDS) {
      const descriptor = getMetaConceptDescriptor(conceptId);

      expect(descriptor.conceptId).toBe(conceptId);
      expect(descriptor.semanticType.startsWith('atlas.knowledge.metamodel.')).toBe(true);
      expect(descriptor.identity.description.length).toBeGreaterThan(0);
      expect(Array.isArray(descriptor.attributes)).toBe(true);
      expect(Array.isArray(descriptor.relationships)).toBe(true);
      expect(Array.isArray(descriptor.operations)).toBe(true);
      expect(Array.isArray(descriptor.validationRules)).toBe(true);
      expect(descriptor.contextApplicability).toBeDefined();
    }

    expect(listMetaConceptDescriptors()).toHaveLength(12);
  });

  it('validates registry integrity', () => {
    assertMetamodelRegistryValid();
    expect(validateMetamodelRegistry().valid).toBe(true);
  });

  it('declares eleven normative invariants', () => {
    expect(METAMODEL_INVARIANTS).toHaveLength(11);
    expect(METAMODEL_INVARIANTS[0]?.ruleId).toBe('MM-INV-001');
  });

  it('allows custom object kinds but not core concept names', () => {
    expect(
      assertExtensionKindAllowed(DEFAULT_EXTENSION_POLICY, 'Policy', MetaConceptId.Object),
    ).toBe(true);
    expect(
      assertExtensionKindAllowed(
        DEFAULT_EXTENSION_POLICY,
        MetaConceptId.Identity,
        MetaConceptId.Object,
      ),
    ).toBe(false);
  });

  it('exposes lifecycle states on object descriptor', () => {
    const objectDescriptor = META_CONCEPT_REGISTRY[MetaConceptId.Object];
    expect(objectDescriptor.lifecycle?.states).toContain('operational');
  });
});
