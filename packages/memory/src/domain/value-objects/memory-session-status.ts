export const MemorySessionStatus = {
  Created: 'created',
  Initialized: 'initialized',
  Running: 'running',
  Completed: 'completed',
  Failed: 'failed',
  Disposed: 'disposed',
} as const;

export type MemorySessionStatus =
  (typeof MemorySessionStatus)[keyof typeof MemorySessionStatus];

export const MEMORY_SESSION_STATUSES: readonly MemorySessionStatus[] = Object.freeze(
  Object.values(MemorySessionStatus),
);

export function isMemorySessionStatus(value: string): value is MemorySessionStatus {
  return (MEMORY_SESSION_STATUSES as readonly string[]).includes(value);
}
