import { META_CONCEPT_IDS, MetaConceptId } from './meta-concept-id.js';
import type { MetaConceptDescriptor } from './meta-concept-descriptor.js';

const identityDescriptor: MetaConceptDescriptor = Object.freeze({
  conceptId: MetaConceptId.Identity,
  semanticType: 'atlas.knowledge.metamodel.identity',
  identity: Object.freeze({
    permanent: true,
    description: 'Identity permanently distinguishes a Knowledge Object',
  }),
  attributes: Object.freeze([
    Object.freeze({
      name: 'value',
      required: true,
      description: 'Stable unique identifier value',
    }),
  ]),
  relationships: Object.freeze([]),
  lifecycle: null,
  operations: Object.freeze([
    Object.freeze({ name: 'validate', description: 'Validate identity format and uniqueness' }),
  ]),
  validationRules: Object.freeze([
    Object.freeze({
      ruleId: 'MM-INV-001',
      description: 'Every Knowledge Object MUST have exactly one Identity',
    }),
  ]),
  contextApplicability: Object.freeze({
    required: false,
    dimensions: Object.freeze([]),
    description: 'Identity is context-independent',
  }),
});

const statementDescriptor: MetaConceptDescriptor = Object.freeze({
  conceptId: MetaConceptId.Statement,
  semanticType: 'atlas.knowledge.metamodel.statement',
  identity: Object.freeze({
    permanent: true,
    description: 'Statement identity is permanent once published',
  }),
  attributes: Object.freeze([
    Object.freeze({
      name: 'content',
      required: true,
      description: 'Single atomic assertion',
    }),
    Object.freeze({
      name: 'context',
      required: true,
      description: 'Context under which the assertion is valid',
    }),
  ]),
  relationships: Object.freeze([
    Object.freeze({
      name: 'belongs_to',
      targetConcept: MetaConceptId.Object,
      directional: true,
      description: 'Statement belongs to a Knowledge Object',
    }),
  ]),
  lifecycle: null,
  operations: Object.freeze([
    Object.freeze({ name: 'create', description: 'Create a new immutable statement' }),
    Object.freeze({ name: 'supersede', description: 'Replace via new statement, not mutation' }),
  ]),
  validationRules: Object.freeze([
    Object.freeze({
      ruleId: 'MM-INV-002',
      description: 'Every Knowledge Statement MUST belong to at least one Knowledge Object',
    }),
  ]),
  contextApplicability: Object.freeze({
    required: true,
    dimensions: Object.freeze([
      'organizational',
      'temporal',
      'operational',
      'geographical',
      'technical',
      'regulatory',
    ]),
    description: 'Statements require explicit context',
  }),
});

const objectDescriptor: MetaConceptDescriptor = Object.freeze({
  conceptId: MetaConceptId.Object,
  semanticType: 'atlas.knowledge.metamodel.object',
  identity: Object.freeze({
    permanent: true,
    description: 'Object identity survives renaming, ownership, and version changes',
  }),
  attributes: Object.freeze([
    Object.freeze({ name: 'kind', required: true, description: 'Extensible ObjectKind' }),
    Object.freeze({ name: 'metadata', required: true, description: 'Descriptive metadata' }),
    Object.freeze({
      name: 'statements',
      required: false,
      description: 'Organizational assertions',
    }),
    Object.freeze({ name: 'behavior', required: false, description: 'Conceptual intentions' }),
    Object.freeze({ name: 'governance', required: true, description: 'Ownership and lifecycle' }),
    Object.freeze({ name: 'trust', required: false, description: 'Confidence signal' }),
  ]),
  relationships: Object.freeze([
    Object.freeze({
      name: 'relates_to',
      targetConcept: MetaConceptId.Object,
      directional: true,
      description: 'Semantic graph connections',
    }),
  ]),
  lifecycle: Object.freeze({
    states: Object.freeze([
      'idea',
      'draft',
      'review',
      'approved',
      'operational',
      'observed',
      'improved',
      'versioned',
      'retired',
      'archived',
    ]),
    description: 'Knowledge Object lifecycle states',
  }),
  operations: Object.freeze([
    Object.freeze({ name: 'create', description: 'Introduce a Knowledge Object' }),
    Object.freeze({ name: 'update_metadata', description: 'Enrich descriptive metadata' }),
    Object.freeze({ name: 'add_statement', description: 'Attach a new statement' }),
  ]),
  validationRules: Object.freeze([
    Object.freeze({
      ruleId: 'MM-INV-003',
      description: 'Every Knowledge Object MUST exist within at least one Context',
    }),
    Object.freeze({
      ruleId: 'MM-INV-004',
      description: 'Every Knowledge Object MUST have an Owner',
    }),
  ]),
  contextApplicability: Object.freeze({
    required: true,
    dimensions: Object.freeze([
      'organizational',
      'temporal',
      'operational',
      'geographical',
      'technical',
      'regulatory',
    ]),
    description: 'Objects exist within one or more contexts',
  }),
});

const relationshipDescriptor: MetaConceptDescriptor = Object.freeze({
  conceptId: MetaConceptId.Relationship,
  semanticType: 'atlas.knowledge.metamodel.relationship',
  identity: Object.freeze({
    permanent: true,
    description: 'Relationship identity is stable across metadata evolution',
  }),
  attributes: Object.freeze([
    Object.freeze({ name: 'type', required: true, description: 'Registered RelationshipType' }),
    Object.freeze({ name: 'source', required: true, description: 'Source Knowledge Object' }),
    Object.freeze({ name: 'target', required: true, description: 'Target Knowledge Object' }),
  ]),
  relationships: Object.freeze([
    Object.freeze({
      name: 'connects',
      targetConcept: MetaConceptId.Object,
      directional: true,
      description: 'Endpoints of the relationship',
    }),
  ]),
  lifecycle: null,
  operations: Object.freeze([
    Object.freeze({ name: 'connect', description: 'Create semantic relationship' }),
    Object.freeze({ name: 'disconnect', description: 'Retire relationship preserving history' }),
  ]),
  validationRules: Object.freeze([
    Object.freeze({
      ruleId: 'MM-INV-006',
      description: 'Every Relationship MUST connect existing Knowledge Objects',
    }),
  ]),
  contextApplicability: Object.freeze({
    required: false,
    dimensions: Object.freeze(['organizational', 'operational']),
    description: 'Relationships may carry contextual scope',
  }),
});

const contextDescriptor: MetaConceptDescriptor = Object.freeze({
  conceptId: MetaConceptId.Context,
  semanticType: 'atlas.knowledge.metamodel.context',
  identity: Object.freeze({
    permanent: false,
    description: 'Context scopes may evolve as dimensions are refined',
  }),
  attributes: Object.freeze([
    Object.freeze({ name: 'dimensions', required: true, description: 'Context dimension map' }),
  ]),
  relationships: Object.freeze([]),
  lifecycle: null,
  operations: Object.freeze([
    Object.freeze({ name: 'define', description: 'Declare contextual validity' }),
  ]),
  validationRules: Object.freeze([
    Object.freeze({
      ruleId: 'MM-INV-003',
      description: 'Context required for objects and statements',
    }),
  ]),
  contextApplicability: Object.freeze({
    required: true,
    dimensions: Object.freeze([
      'organizational',
      'temporal',
      'operational',
      'geographical',
      'technical',
      'regulatory',
    ]),
    description: 'Defines where knowledge applies',
  }),
});

const ownerDescriptor: MetaConceptDescriptor = Object.freeze({
  conceptId: MetaConceptId.Owner,
  semanticType: 'atlas.knowledge.metamodel.owner',
  identity: Object.freeze({
    permanent: false,
    description: 'Ownership may transfer under governance',
  }),
  attributes: Object.freeze([
    Object.freeze({ name: 'owner', required: true, description: 'Accountable owner identifier' }),
  ]),
  relationships: Object.freeze([
    Object.freeze({
      name: 'owns',
      targetConcept: MetaConceptId.Object,
      directional: true,
      description: 'Owner accountable for object',
    }),
  ]),
  lifecycle: null,
  operations: Object.freeze([
    Object.freeze({ name: 'assign', description: 'Assign ownership' }),
    Object.freeze({ name: 'transfer', description: 'Transfer ownership' }),
  ]),
  validationRules: Object.freeze([
    Object.freeze({
      ruleId: 'MM-INV-004',
      description: 'Every Knowledge Object MUST have an Owner',
    }),
  ]),
  contextApplicability: Object.freeze({
    required: false,
    dimensions: Object.freeze(['organizational']),
    description: 'Ownership is organization-scoped',
  }),
});

const lifecycleDescriptor: MetaConceptDescriptor = Object.freeze({
  conceptId: MetaConceptId.Lifecycle,
  semanticType: 'atlas.knowledge.metamodel.lifecycle',
  identity: Object.freeze({
    permanent: false,
    description: 'Lifecycle state evolves; identity of the object does not',
  }),
  attributes: Object.freeze([
    Object.freeze({ name: 'state', required: true, description: 'Current lifecycle state' }),
  ]),
  relationships: Object.freeze([
    Object.freeze({
      name: 'governs',
      targetConcept: MetaConceptId.Object,
      directional: true,
      description: 'Lifecycle governs object evolution',
    }),
  ]),
  lifecycle: Object.freeze({
    states: Object.freeze([
      'idea',
      'draft',
      'review',
      'approved',
      'operational',
      'observed',
      'improved',
      'versioned',
      'retired',
      'archived',
    ]),
    description: 'Canonical lifecycle progression',
  }),
  operations: Object.freeze([
    Object.freeze({ name: 'transition', description: 'Governed state transition' }),
  ]),
  validationRules: Object.freeze([]),
  contextApplicability: Object.freeze({
    required: false,
    dimensions: Object.freeze([]),
    description: 'Lifecycle is object-scoped',
  }),
});

const trustDescriptor: MetaConceptDescriptor = Object.freeze({
  conceptId: MetaConceptId.Trust,
  semanticType: 'atlas.knowledge.metamodel.trust',
  identity: Object.freeze({
    permanent: false,
    description: 'Trust evolves with evidence and execution',
  }),
  attributes: Object.freeze([
    Object.freeze({ name: 'level', required: true, description: 'Trust level signal' }),
    Object.freeze({ name: 'signals', required: false, description: 'Contributing trust signals' }),
  ]),
  relationships: Object.freeze([
    Object.freeze({
      name: 'evaluates',
      targetConcept: MetaConceptId.Object,
      directional: true,
      description: 'Trust evaluates object reliability',
    }),
  ]),
  lifecycle: null,
  operations: Object.freeze([
    Object.freeze({ name: 'recalculate', description: 'Update trust from evidence' }),
  ]),
  validationRules: Object.freeze([
    Object.freeze({
      ruleId: 'MM-INV-010',
      description: 'Every Knowledge Object SHOULD maintain Trust information',
    }),
  ]),
  contextApplicability: Object.freeze({
    required: false,
    dimensions: Object.freeze([]),
    description: 'Trust applies to object as a whole',
  }),
});

const versionDescriptor: MetaConceptDescriptor = Object.freeze({
  conceptId: MetaConceptId.Version,
  semanticType: 'atlas.knowledge.metamodel.version',
  identity: Object.freeze({
    permanent: false,
    description: 'Version labels evolve; object identity does not',
  }),
  attributes: Object.freeze([
    Object.freeze({ name: 'semver', required: true, description: 'Semantic version coordinates' }),
  ]),
  relationships: Object.freeze([
    Object.freeze({
      name: 'versions',
      targetConcept: MetaConceptId.Object,
      directional: true,
      description: 'Version belongs to object identity',
    }),
  ]),
  lifecycle: null,
  operations: Object.freeze([
    Object.freeze({ name: 'bump', description: 'Create new version snapshot' }),
  ]),
  validationRules: Object.freeze([
    Object.freeze({
      ruleId: 'MM-INV-007',
      description: 'Every Knowledge Object MUST support Versioning',
    }),
  ]),
  contextApplicability: Object.freeze({
    required: false,
    dimensions: Object.freeze(['temporal']),
    description: 'Versions mark points in time',
  }),
});

const evidenceDescriptor: MetaConceptDescriptor = Object.freeze({
  conceptId: MetaConceptId.Evidence,
  semanticType: 'atlas.knowledge.metamodel.evidence',
  identity: Object.freeze({
    permanent: true,
    description: 'Evidence records are immutable once captured',
  }),
  attributes: Object.freeze([
    Object.freeze({ name: 'source', required: true, description: 'Evidence origin' }),
    Object.freeze({ name: 'type', required: true, description: 'Evidence classification' }),
  ]),
  relationships: Object.freeze([
    Object.freeze({
      name: 'supports',
      targetConcept: MetaConceptId.Statement,
      directional: true,
      description: 'Evidence supports statements',
    }),
  ]),
  lifecycle: null,
  operations: Object.freeze([
    Object.freeze({ name: 'attach', description: 'Attach evidence to knowledge' }),
  ]),
  validationRules: Object.freeze([]),
  contextApplicability: Object.freeze({
    required: false,
    dimensions: Object.freeze([]),
    description: 'Evidence is trace metadata',
  }),
});

const historyDescriptor: MetaConceptDescriptor = Object.freeze({
  conceptId: MetaConceptId.History,
  semanticType: 'atlas.knowledge.metamodel.history',
  identity: Object.freeze({
    permanent: true,
    description: 'History entries are immutable audit records',
  }),
  attributes: Object.freeze([
    Object.freeze({ name: 'change', required: true, description: 'Recorded change description' }),
    Object.freeze({ name: 'timestamp', required: true, description: 'When the change occurred' }),
  ]),
  relationships: Object.freeze([
    Object.freeze({
      name: 'records',
      targetConcept: MetaConceptId.Object,
      directional: true,
      description: 'History records object evolution',
    }),
  ]),
  lifecycle: null,
  operations: Object.freeze([
    Object.freeze({ name: 'append', description: 'Append immutable history entry' }),
  ]),
  validationRules: Object.freeze([
    Object.freeze({
      ruleId: 'MM-INV-008',
      description: 'Every Knowledge Object MUST maintain History',
    }),
  ]),
  contextApplicability: Object.freeze({
    required: false,
    dimensions: Object.freeze(['temporal']),
    description: 'History is temporal audit trail',
  }),
});

const graphDescriptor: MetaConceptDescriptor = Object.freeze({
  conceptId: MetaConceptId.Graph,
  semanticType: 'atlas.knowledge.metamodel.graph',
  identity: Object.freeze({
    permanent: true,
    description: 'Graph identity enables federation and versioning',
  }),
  attributes: Object.freeze([
    Object.freeze({ name: 'graphId', required: true, description: 'Unique graph identifier' }),
  ]),
  relationships: Object.freeze([
    Object.freeze({
      name: 'contains',
      targetConcept: MetaConceptId.Object,
      directional: true,
      description: 'Graph contains object nodes',
    }),
    Object.freeze({
      name: 'contains',
      targetConcept: MetaConceptId.Relationship,
      directional: true,
      description: 'Graph contains relationship edges',
    }),
  ]),
  lifecycle: null,
  operations: Object.freeze([
    Object.freeze({ name: 'validate', description: 'Validate graph consistency' }),
  ]),
  validationRules: Object.freeze([
    Object.freeze({
      ruleId: 'MM-INV-011',
      description: 'Knowledge Graphs MUST remain internally consistent',
    }),
  ]),
  contextApplicability: Object.freeze({
    required: false,
    dimensions: Object.freeze(['organizational']),
    description: 'Graphs may span organizational boundaries',
  }),
});

export const META_CONCEPT_REGISTRY: Readonly<Record<MetaConceptId, MetaConceptDescriptor>> =
  Object.freeze({
    [MetaConceptId.Identity]: identityDescriptor,
    [MetaConceptId.Statement]: statementDescriptor,
    [MetaConceptId.Object]: objectDescriptor,
    [MetaConceptId.Relationship]: relationshipDescriptor,
    [MetaConceptId.Context]: contextDescriptor,
    [MetaConceptId.Owner]: ownerDescriptor,
    [MetaConceptId.Lifecycle]: lifecycleDescriptor,
    [MetaConceptId.Trust]: trustDescriptor,
    [MetaConceptId.Version]: versionDescriptor,
    [MetaConceptId.Evidence]: evidenceDescriptor,
    [MetaConceptId.History]: historyDescriptor,
    [MetaConceptId.Graph]: graphDescriptor,
  });

export function getMetaConceptDescriptor(conceptId: MetaConceptId): MetaConceptDescriptor {
  return META_CONCEPT_REGISTRY[conceptId];
}

export function listMetaConceptDescriptors(): readonly MetaConceptDescriptor[] {
  return META_CONCEPT_IDS.map((id) => META_CONCEPT_REGISTRY[id]);
}
