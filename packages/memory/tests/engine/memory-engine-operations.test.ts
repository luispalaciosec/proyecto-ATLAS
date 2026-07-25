import { describe, expect, it } from 'vitest';

import { applyMemoryQuery, findRecordById } from '../../src/internal/query-executor.js';
import { buildUpdatedMemoryRecord } from '../../src/internal/memory-record-update.js';
import type { MemoryRecord } from '../../src/domain/types/memory-types.js';

function createMemoryRecord(overrides: Partial<MemoryRecord> = {}): MemoryRecord {
  return Object.freeze({
    id: 'record.fact.1',
    type: 'Fact',
    content: { fact: 'Memory preserves experience' },
    metadata: {},
    timestamp: '2026-07-24T00:00:00.000Z',
    ...overrides,
  });
}

describe('Memory Engine operations internals', () => {
  it('filters search results by MemoryQuery', () => {
    const records = [
      createMemoryRecord({ id: 'record.1', type: 'Fact', metadata: { namespaceId: 'ns.1' } }),
      createMemoryRecord({ id: 'record.2', type: 'Observation', metadata: { namespaceId: 'ns.1' } }),
      createMemoryRecord({ id: 'record.3', type: 'Fact', metadata: { namespaceId: 'ns.2' } }),
    ];

    const filtered = applyMemoryQuery({ records, total: records.length }, {
      recordType: 'Fact',
      namespaceId: 'ns.1',
    });

    expect(filtered.total).toBe(1);
    expect(filtered.records[0]?.id).toBe('record.1');
  });

  it('finds records by canonical identity', () => {
    const records = [createMemoryRecord({ id: 'record.target' })];

    expect(findRecordById(records, 'record.target')?.id).toBe('record.target');
    expect(findRecordById(records, 'record.missing')).toBeUndefined();
  });

  it('builds monotonic updated snapshots', () => {
    const updated = buildUpdatedMemoryRecord(createMemoryRecord({ metadata: { revision: 4 } }));

    expect(updated.metadata.revision).toBe(5);
    expect(updated.metadata.version).toBe(5);
    expect(updated.id).toBe('record.fact.1');
  });
});
