export const RelationshipType = {
  Parent: 'parent',
  Child: 'child',
  Reference: 'reference',
  Dependency: 'dependency',
  Related: 'related',
  Derived: 'derived',
} as const;

export type RelationshipType = (typeof RelationshipType)[keyof typeof RelationshipType];

export const RELATIONSHIP_TYPES: readonly RelationshipType[] = Object.freeze(
  Object.values(RelationshipType),
);

export function isRelationshipType(value: string): value is RelationshipType {
  return (RELATIONSHIP_TYPES as readonly string[]).includes(value);
}
