/** Must match MemoryModule DEFAULT_NAMESPACE_ID so searchContent can find org records. */
export const ORG_NAMESPACE_ID = 'cli.default';

export const ORG_COLLECTION_ENTITIES = 'org.entities';
export const ORG_COLLECTION_POLICIES = 'org.policies';

export const ORG_RECORD_TYPE_CLIENT = 'Client';
export const ORG_RECORD_TYPE_DISCOUNT_POLICY = 'DiscountPolicy';
export const ORG_RECORD_TYPE_WARRANTY_POLICY = 'WarrantyPolicy';
export const ORG_RECORD_TYPE_APPROVAL_RULE = 'ApprovalRule';
export const ORG_RECORD_TYPE_VERSION = 'Version';
export const ORG_RECORD_TYPE_RELATIONSHIP = 'Relationship';

/** Matches @atlas/memory RelationshipType strings (semantic consistency only). */
export const ORG_RELATIONSHIP_REFERENCE = 'reference';
export const ORG_RELATIONSHIP_DEPENDENCY = 'dependency';

export const ORG_ENTITY_RECORD_TYPES = Object.freeze([
  ORG_RECORD_TYPE_CLIENT,
  ORG_RECORD_TYPE_DISCOUNT_POLICY,
  ORG_RECORD_TYPE_WARRANTY_POLICY,
  ORG_RECORD_TYPE_APPROVAL_RULE,
] as const);

export type OrgEntityRecordType = (typeof ORG_ENTITY_RECORD_TYPES)[number];

export const ORG_POLICY_RECORD_TYPES = Object.freeze([
  ORG_RECORD_TYPE_DISCOUNT_POLICY,
  ORG_RECORD_TYPE_WARRANTY_POLICY,
] as const);

export const ORG_RECORD_TYPE_DECISION = 'Decision';
export const ORG_RECORD_TYPE_EVIDENCE = 'Evidence';

export const ORG_JOURNAL_RECORD_TYPES = Object.freeze([
  ORG_RECORD_TYPE_DECISION,
  ORG_RECORD_TYPE_EVIDENCE,
] as const);

export type OrgJournalRecordType = (typeof ORG_JOURNAL_RECORD_TYPES)[number];

export type OrgResolvableRecordType = OrgEntityRecordType | OrgJournalRecordType;

export const ORG_RELATIONSHIP_RESOLVES = 'resolves';
export const ORG_RELATIONSHIP_CITES = 'cites';

export const ORG_COLLECTION_DECISIONS = 'org.decisions';
