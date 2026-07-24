export const STORAGE_CONSTRAINTS = Object.freeze({
  identity: 'Identifiers are globally unique',
  namespace: 'Records belong to exactly one namespace',
  collection: 'Records belong to exactly one collection',
  version: 'Versions belong to exactly one Record',
  ownership: 'Every Record has one owner',
  immutability: 'Versions never change after creation',
  relationship: 'Relationships only connect existing Records',
});

export const STORAGE_HIERARCHY = Object.freeze([
  'Namespace',
  'Collection',
  'Record',
  'Version',
]);

export const RECORD_LIFECYCLE = Object.freeze([
  'created',
  'active',
  'updated',
  'archived',
  'deleted',
]);

export const VERSION_LIFECYCLE = Object.freeze([
  'created',
  'stored',
  'referenced',
  'archived',
]);
