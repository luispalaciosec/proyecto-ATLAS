import { describe, expect, it, vi } from 'vitest';

import type { ConsistencyProvider } from '../../src/domain/interfaces/consistency-provider.js';
import type { MemoryStore } from '../../src/domain/interfaces/memory-store.js';
import {
  createCollection,
  createNamespace,
  createRecord,
  createRecordAggregate,
  createRelationship,
  createVersion,
  INVALID_MEMORY_RECORD,
  MEMORY_NOT_FOUND,
  MEMORY_STORAGE_ERROR,
  NamespaceId,
  RecordId,
  RelationshipType,
  RevisionNumber,
} from '../../src/domain/index.js';
import { createMemoryEngine } from '../../src/engine/index.js';
import {
  REPOSITORY_DOMAIN_VALIDATION,
  REPOSITORY_NOT_FOUND,
  REPOSITORY_STORE,
} from '../../src/repositories/repository-errors.js';

const CREATED_AT = '2026-07-24T00:00:00.000Z';

function createConsistencyProvider(): ConsistencyProvider {
  return {
    validateRecord: vi.fn().mockResolvedValue({ valid: true, issues: [] }),
    validateStore: vi.fn().mockResolvedValue({ valid: true, issues: [] }),
    validateIndexes: vi.fn().mockResolvedValue({ valid: true, issues: [] }),
    validateSessions: vi.fn().mockResolvedValue({ valid: true, issues: [] }),
    repair: vi.fn().mockResolvedValue({ repaired: 0, skipped: 0, failed: 0 }),
  };
}

function createMemoryStore(overrides: Partial<MemoryStore> = {}): MemoryStore {
  return {
    put: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    search: vi.fn().mockResolvedValue({ records: [], total: 0 }),
    ...overrides,
  };
}

function createFixture() {
  const namespace = createNamespace({
    namespaceId: 'workspace.finance',
    namespaceType: 'workspace',
    owner: 'org.atlas',
    createdAt: CREATED_AT,
  });

  const collection = createCollection({
    collectionId: 'collection.history',
    namespaceId: namespace.namespaceId,
    collectionType: 'history',
    createdAt: CREATED_AT,
  });

  const record = createRecord({
    recordId: 'record.fact.1',
    namespaceId: namespace.namespaceId,
    collectionId: collection.collectionId,
    recordType: 'Fact',
    owner: 'system.atlas',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  });

  const version = createVersion({
    versionId: 'version.fact.1',
    recordId: record.recordId,
    revision: RevisionNumber.create(1),
    content: { fact: 'Memory preserves experience' },
    checksum: 'sha256:abc123',
    createdAt: CREATED_AT,
    author: 'system.atlas',
  });

  return { namespace, collection, record, version };
}

function createEngineWithStore(store: MemoryStore) {
  return createMemoryEngine(store, createConsistencyProvider());
}

describe('Engine-owned entity repositories', () => {
  it('creates a namespace through an engine collaborator', async () => {
    const store = createMemoryStore();
    const engine = createEngineWithStore(store);
    const namespace = createNamespace({
      namespaceId: 'workspace.ops',
      namespaceType: 'workspace',
      owner: 'org.atlas',
      createdAt: CREATED_AT,
    });

    const result = await engine.getCollaborators().namespace.createNamespace(namespace);

    expect(result.ok).toBe(true);
    expect(store.put).toHaveBeenCalledTimes(1);
  });

  it('creates a collection through an engine collaborator', async () => {
    const store = createMemoryStore();
    const engine = createEngineWithStore(store);
    const { namespace, collection } = createFixture();

    const result = await engine.getCollaborators().collection.createCollection(collection, namespace);

    expect(result.ok).toBe(true);
    expect(store.put).toHaveBeenCalledTimes(1);
  });

  it('creates a record with its initial version', async () => {
    const store = createMemoryStore();
    const engine = createEngineWithStore(store);
    const { namespace, collection, record, version } = createFixture();

    const result = await engine
      .getCollaborators()
      .record.createRecord(record, namespace, collection, version);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.recordId.toString()).toBe('record.fact.1');
    }
    expect(store.put).toHaveBeenCalledTimes(1);
  });

  it('deletes a record through an engine collaborator', async () => {
    const store = createMemoryStore();
    const engine = createEngineWithStore(store);
    const { namespace, collection, record } = createFixture();

    const result = await engine
      .getCollaborators()
      .record.deleteRecord(record, namespace, collection);

    expect(result.ok).toBe(true);
    expect(store.remove).toHaveBeenCalledTimes(1);
  });

  it('appends a version and evolves the record', async () => {
    const store = createMemoryStore();
    const engine = createEngineWithStore(store);
    const { namespace, collection, record, version } = createFixture();
    const nextVersion = createVersion({
      versionId: 'version.fact.2',
      recordId: record.recordId,
      revision: RevisionNumber.create(2),
      content: { fact: 'Memory evolves through versions' },
      checksum: 'sha256:def456',
      createdAt: '2026-07-24T01:00:00.000Z',
      author: 'system.atlas',
    });

    const result = await engine.getCollaborators().version.appendVersion(
      record,
      nextVersion,
      [version],
      namespace,
      collection,
      '2026-07-24T01:00:00.000Z',
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.record.currentVersion.value).toBe(2);
      expect(result.value.version.revision.value).toBe(2);
    }
    expect(store.put).toHaveBeenCalledTimes(1);
  });

  it('returns the current version from a record aggregate', async () => {
    const { record, version } = createFixture();
    const aggregate = createRecordAggregate(record, [version]);
    const engine = createEngineWithStore(createMemoryStore());

    const result = await engine.getCollaborators().version.getCurrentVersion(aggregate);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.versionId.toString()).toBe('version.fact.1');
    }
  });

  it('returns version history sorted by revision', async () => {
    const { record, version } = createFixture();
    const versionTwo = createVersion({
      versionId: 'version.fact.2',
      recordId: record.recordId,
      revision: RevisionNumber.create(2),
      content: { fact: 'Second version' },
      checksum: 'sha256:def456',
      createdAt: '2026-07-24T01:00:00.000Z',
      author: 'system.atlas',
    });
    const aggregate = createRecordAggregate(record, [versionTwo, version]);
    const engine = createEngineWithStore(createMemoryStore());

    const result = await engine.getCollaborators().version.getHistory(aggregate);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.map((entry) => entry.revision.value)).toEqual([1, 2]);
    }
  });

  it('links a relationship after domain validation', async () => {
    const store = createMemoryStore();
    const engine = createEngineWithStore(store);
    const { record } = createFixture();
    const targetRecordId = RecordId.create('record.fact.2');
    const relationship = createRelationship({
      relationshipId: 'relationship.1',
      sourceRecord: record.recordId,
      targetRecord: targetRecordId,
      relationshipType: RelationshipType.Reference,
    });

    const result = await engine.getCollaborators().relationship.link(
      relationship,
      new Set([record.recordId.toString(), targetRecordId.toString()]),
    );

    expect(result.ok).toBe(true);
    expect(store.put).toHaveBeenCalledTimes(1);
  });
});

describe('Engine collaborator failures', () => {
  it('returns repository domain validation failures', async () => {
    const engine = createEngineWithStore(createMemoryStore());
    const invalidNamespace = createNamespace({
      namespaceId: 'workspace.invalid',
      namespaceType: 'workspace',
      owner: '',
      createdAt: CREATED_AT,
    });

    const result = await engine.getCollaborators().namespace.createNamespace(invalidNamespace);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(REPOSITORY_DOMAIN_VALIDATION);
      expect(result.error.canonicalCode).toBe(INVALID_MEMORY_RECORD);
    }
  });

  it('returns store failures from MemoryStore.put', async () => {
    const store = createMemoryStore({
      put: vi.fn().mockRejectedValue(new Error('store unavailable')),
    });
    const engine = createEngineWithStore(store);
    const { namespace, collection, record, version } = createFixture();

    const result = await engine
      .getCollaborators()
      .record.createRecord(record, namespace, collection, version);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(REPOSITORY_STORE);
      expect(result.error.canonicalCode).toBe(MEMORY_STORAGE_ERROR);
    }
  });

  it('returns not found when retrieving a missing namespace', async () => {
    const store = createMemoryStore({
      search: vi.fn().mockResolvedValue({ records: [], total: 0 }),
    });
    const engine = createEngineWithStore(store);

    const result = await engine
      .getCollaborators()
      .namespace.getNamespace(NamespaceId.create('workspace.missing'));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(REPOSITORY_NOT_FOUND);
      expect(result.error.canonicalCode).toBe(MEMORY_NOT_FOUND);
    }
  });
});
