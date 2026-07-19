export { MetaLayer, META_LAYER_ORDER } from './meta-layer.js';
export { MetaConceptId, META_CONCEPT_IDS } from './meta-concept-id.js';
export type {
  MetaAttributeSchema,
  MetaConceptDescriptor,
  MetaContextApplicabilitySchema,
  MetaIdentitySchema,
  MetaLifecycleSchema,
  MetaOperationSchema,
  MetaRelationshipSchema,
  MetaValidationRuleSchema,
} from './meta-concept-descriptor.js';
export {
  META_CONCEPT_REGISTRY,
  getMetaConceptDescriptor,
  listMetaConceptDescriptors,
} from './meta-concept-registry.js';
export {
  METAMODEL_INVARIANTS,
  getMetamodelInvariant,
  type MetamodelInvariantDefinition,
} from './metamodel-invariants.js';
export {
  DEFAULT_EXTENSION_POLICY,
  assertExtensionKindAllowed,
  type ExtensionKindDefinition,
  type MetamodelExtensionPolicy,
} from './extension-model.js';
