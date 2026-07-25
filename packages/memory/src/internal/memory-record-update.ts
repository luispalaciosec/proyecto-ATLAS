import type { MemoryRecord } from '../domain/types/memory-types.js';

function resolveRevision(record: MemoryRecord): number {
  const revision = record.metadata.revision;
  if (typeof revision === 'number' && Number.isFinite(revision) && revision > 0) {
    return revision;
  }

  const version = record.metadata.version;
  if (typeof version === 'number' && Number.isFinite(version) && version > 0) {
    return version;
  }

  return 1;
}

/**
 * Builds the next immutable MemoryRecord snapshot for update (MEMORY-004).
 */
export function buildUpdatedMemoryRecord(record: MemoryRecord): MemoryRecord {
  const nextRevision = resolveRevision(record) + 1;

  return Object.freeze({
    ...record,
    metadata: Object.freeze({
      ...record.metadata,
      revision: nextRevision,
      version: nextRevision,
      updatedAt: record.timestamp,
    }),
  });
}
