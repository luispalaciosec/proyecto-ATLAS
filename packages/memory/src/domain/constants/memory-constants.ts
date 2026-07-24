export const StoreType = {
  Persistent: 'persistent',
  Volatile: 'volatile',
  Cache: 'cache',
  Session: 'session',
  Hybrid: 'hybrid',
} as const;

export type StoreType = (typeof StoreType)[keyof typeof StoreType];

export const STORE_TYPES: readonly StoreType[] = Object.freeze(Object.values(StoreType));

export function isStoreType(value: string): value is StoreType {
  return (STORE_TYPES as readonly string[]).includes(value);
}

export const StoreLifecycle = {
  Created: 'created',
  Active: 'active',
  Archived: 'archived',
  Deleted: 'deleted',
} as const;

export type StoreLifecycle = (typeof StoreLifecycle)[keyof typeof StoreLifecycle];

export const STORE_LIFECYCLE_VALUES: readonly StoreLifecycle[] = Object.freeze(
  Object.values(StoreLifecycle),
);

export function isStoreLifecycle(value: string): value is StoreLifecycle {
  return (STORE_LIFECYCLE_VALUES as readonly string[]).includes(value);
}

export const ConsistencyLevel = {
  Strong: 'strong',
  Eventual: 'eventual',
} as const;

export type ConsistencyLevel = (typeof ConsistencyLevel)[keyof typeof ConsistencyLevel];

export const CONSISTENCY_LEVELS: readonly ConsistencyLevel[] = Object.freeze(
  Object.values(ConsistencyLevel),
);

export function isConsistencyLevel(value: string): value is ConsistencyLevel {
  return (CONSISTENCY_LEVELS as readonly string[]).includes(value);
}
