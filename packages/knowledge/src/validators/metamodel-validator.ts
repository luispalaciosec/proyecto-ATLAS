import type { AtlasError } from '@atlas/core';

import { METAMODEL_INVARIANTS } from '../metamodel/metamodel-invariants.js';
import {
  getMetaConceptDescriptor,
  META_CONCEPT_REGISTRY,
} from '../metamodel/meta-concept-registry.js';
import { META_CONCEPT_IDS } from '../metamodel/meta-concept-id.js';

export interface MetamodelValidationIssue {
  readonly ruleId: string;
  readonly message: string;
}

export interface MetamodelValidationResult {
  readonly valid: boolean;
  readonly issues: readonly MetamodelValidationIssue[];
}

export function validateMetamodelRegistry(): MetamodelValidationResult {
  const issues: MetamodelValidationIssue[] = [];

  for (const conceptId of META_CONCEPT_IDS) {
    const descriptor = META_CONCEPT_REGISTRY[conceptId];

    if (descriptor.conceptId !== conceptId) {
      issues.push({
        ruleId: 'MM-REGISTRY-001',
        message: `Descriptor conceptId mismatch for ${conceptId}`,
      });
    }

    if (descriptor.semanticType.trim().length === 0) {
      issues.push({
        ruleId: 'MM-REGISTRY-002',
        message: `Descriptor semanticType missing for ${conceptId}`,
      });
    }

    for (const rule of descriptor.validationRules) {
      const invariant = METAMODEL_INVARIANTS.find((item) => item.ruleId === rule.ruleId);
      if (rule.ruleId.startsWith('MM-INV-') && !invariant) {
        issues.push({
          ruleId: 'MM-REGISTRY-003',
          message: `Descriptor references unknown invariant ${rule.ruleId}`,
        });
      }
    }
  }

  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

export function assertMetamodelRegistryValid(): void {
  const result = validateMetamodelRegistry();
  if (!result.valid) {
    const message = result.issues.map((issue) => issue.message).join('; ');
    throw new Error(`Metamodel registry invalid: ${message}`);
  }
}

export function getConceptSemanticType(conceptId: keyof typeof META_CONCEPT_REGISTRY): string {
  return getMetaConceptDescriptor(conceptId).semanticType;
}

export type MetamodelValidatorError = AtlasError;
