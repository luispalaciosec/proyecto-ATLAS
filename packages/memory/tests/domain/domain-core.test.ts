import { describe, expect, it } from 'vitest';

import {
  CollectionId,
  NamespaceId,
  RecordId,
  RecordStatus,
  RelationshipType,
  RevisionNumber,
  assertVersionImmutable,
  createCollection,
  createNamespace,
  createRecord,
  createRecordAggregate,
  createRelationship,
  createVersion,
  evolveRecord,
  getCurrentVersion,
  isValid,
  projectMemoryRecord,
  validateCollection,
  validateMemoryRecord,
  validateNamespace,
  validateRecord,
  validateRecordPersistence,
  validateRelationship,
  validateRevisionMonotonicity,
  validateUniqueIdentifier,
  validateVersion,
  validateVersionImmutability,
  MEMORY_IMMUTABLE_VERSION,
  MEMORY_INVALID_VERSION,
} from '../../src/domain/index.js';

describe('Memory domain value objects', () => {
  it('creates typed identifiers', () => {
    const namespaceId = NamespaceId.create('workspace.finance');
    expect(namespaceId.toString()).toBe('workspace.finance');
    expect(RecordId.create('record.conversation.1')).toBeInstanceOf(RecordId);
  });

  it('rejects invalid identifiers', () => {
    expect(() => NamespaceId.create('')).toThrow();
    expect(() => NamespaceId.create('1invalid')).toThrow();
    expect(() => RevisionNumber.create(0)).toThrow();
  });
});

describe('Memory storage hierarchy', () => {
  const createdAt = '2026-07-23T00:00:00.000Z';

  it('creates namespace, collection, record, version and relationship', () => {
    const namespace = createNamespace({
      namespaceId: 'workspace.finance',
      namespaceType: 'workspace',
      owner: 'org.atlas',
      createdAt,
    });

    const collection = createCollection({
      collectionId: 'collection.sessions',
      namespaceId: namespace.namespaceId,
      collectionType: 'sessions',
      createdAt,
    });

    const record = createRecord({
      recordId: 'record.conversation.1',
      namespaceId: namespace.namespaceId,
      collectionId: collection.collectionId,
      recordType: 'Conversation',
      owner: 'user.alice',
      createdAt,
      updatedAt: createdAt,
    });

    const version = createVersion({
      versionId: 'version.conversation.1',
      recordId: record.recordId,
      revision: RevisionNumber.create(1),
      content: { text: 'Hello Atlas' },
      checksum: 'sha256:abc123',
      createdAt,
      author: 'user.alice',
    });

    const relationship = createRelationship({
      relationshipId: 'relationship.1',
      sourceRecord: record.recordId,
      targetRecord: RecordId.create('record.conversation.2'),
      relationshipType: RelationshipType.Reference,
    });

    expect(record.status).toBe(RecordStatus.Active);
    expect(version.revision.value).toBe(1);
    expect(relationship.relationshipType).toBe(RelationshipType.Reference);
  });

  it('projects a canonical Record and Version into MemoryRecord', () => {
    const namespace = createNamespace({
      namespaceId: 'workspace.finance',
      namespaceType: 'workspace',
      owner: 'org.atlas',
      createdAt: '2026-07-23T00:00:00.000Z',
    });

    const collection = createCollection({
      collectionId: 'collection.history',
      namespaceId: namespace.namespaceId,
      collectionType: 'history',
      createdAt: '2026-07-23T00:00:00.000Z',
    });

    const record = createRecord({
      recordId: 'record.fact.1',
      namespaceId: namespace.namespaceId,
      collectionId: collection.collectionId,
      recordType: 'Fact',
      owner: 'system.atlas',
      createdAt: '2026-07-23T00:00:00.000Z',
      updatedAt: '2026-07-23T00:00:00.000Z',
    });

    const version = createVersion({
      versionId: 'version.fact.1',
      recordId: record.recordId,
      revision: RevisionNumber.create(1),
      content: { fact: 'Memory preserves experience' },
      checksum: 'sha256:def456',
      createdAt: '2026-07-23T00:00:00.000Z',
      author: 'system.atlas',
    });

    const memoryRecord = projectMemoryRecord(record, version);

    expect(memoryRecord.id).toBe('record.fact.1');
    expect(memoryRecord.type).toBe('Fact');
    expect(memoryRecord.content).toEqual({ fact: 'Memory preserves experience' });
    expect(memoryRecord.timestamp).toBe('2026-07-23T00:00:00.000Z');
  });

  it('evolves a record by advancing current version', () => {
    const namespaceId = NamespaceId.create('workspace.finance');
    const collectionId = CollectionId.create('collection.history');

    const record = createRecord({
      recordId: 'record.fact.1',
      namespaceId,
      collectionId,
      recordType: 'Fact',
      owner: 'system.atlas',
      createdAt: '2026-07-23T00:00:00.000Z',
      updatedAt: '2026-07-23T00:00:00.000Z',
    });

    const initialVersion = createVersion({
      versionId: 'version.fact.1',
      recordId: record.recordId,
      revision: RevisionNumber.create(1),
      content: { fact: 'Original fact' },
      checksum: 'sha256:abc123',
      createdAt: '2026-07-23T00:00:00.000Z',
      author: 'system.atlas',
    });

    const nextVersion = createVersion({
      versionId: 'version.fact.2',
      recordId: record.recordId,
      revision: RevisionNumber.create(2),
      content: { fact: 'Updated fact' },
      checksum: 'sha256:ghi789',
      createdAt: '2026-07-23T01:00:00.000Z',
      author: 'system.atlas',
    });

    const evolved = evolveRecord(record, nextVersion, '2026-07-23T01:00:00.000Z', [initialVersion]);
    const aggregate = createRecordAggregate(evolved, [initialVersion, nextVersion]);

    expect(evolved.currentVersion.value).toBe(2);
    expect(getCurrentVersion(aggregate)?.versionId.toString()).toBe('version.fact.2');
  });

  it('rejects non-monotonic record evolution', () => {
    const record = createRecord({
      recordId: 'record.fact.1',
      namespaceId: NamespaceId.create('workspace.finance'),
      collectionId: CollectionId.create('collection.history'),
      recordType: 'Fact',
      owner: 'system.atlas',
      createdAt: '2026-07-23T00:00:00.000Z',
      updatedAt: '2026-07-23T00:00:00.000Z',
    });

    const invalidVersion = createVersion({
      versionId: 'version.fact.3',
      recordId: record.recordId,
      revision: RevisionNumber.create(3),
      content: { fact: 'Skipped revision' },
      checksum: 'sha256:skip',
      createdAt: '2026-07-23T01:00:00.000Z',
      author: 'system.atlas',
    });

    expect(() =>
      evolveRecord(record, invalidVersion, '2026-07-23T01:00:00.000Z'),
    ).toThrow();
  });

  it('rejects record evolution when version recordId differs', () => {
    const record = createRecord({
      recordId: 'record.fact.1',
      namespaceId: NamespaceId.create('workspace.finance'),
      collectionId: CollectionId.create('collection.history'),
      recordType: 'Fact',
      owner: 'system.atlas',
      createdAt: '2026-07-23T00:00:00.000Z',
      updatedAt: '2026-07-23T00:00:00.000Z',
    });

    const foreignVersion = createVersion({
      versionId: 'version.fact.2',
      recordId: RecordId.create('record.other'),
      revision: RevisionNumber.create(2),
      content: { fact: 'Foreign' },
      checksum: 'sha256:foreign',
      createdAt: '2026-07-23T01:00:00.000Z',
      author: 'system.atlas',
    });

    expect(() =>
      evolveRecord(record, foreignVersion, '2026-07-23T01:00:00.000Z'),
    ).toThrow();
  });
});

describe('Memory domain validators', () => {
  const createdAt = '2026-07-23T00:00:00.000Z';

  it('validates namespace, collection and record hierarchy', () => {
    const namespace = createNamespace({
      namespaceId: 'workspace.finance',
      namespaceType: 'workspace',
      owner: 'org.atlas',
      createdAt,
    });

    const collection = createCollection({
      collectionId: 'collection.history',
      namespaceId: namespace.namespaceId,
      collectionType: 'history',
      createdAt,
    });

    const record = createRecord({
      recordId: 'record.fact.1',
      namespaceId: namespace.namespaceId,
      collectionId: collection.collectionId,
      recordType: 'Fact',
      owner: 'system.atlas',
      createdAt,
      updatedAt: createdAt,
    });

    expect(isValid(validateNamespace(namespace))).toBe(true);
    expect(isValid(validateCollection(collection, namespace))).toBe(true);
    expect(isValid(validateRecord(record, namespace, collection))).toBe(true);
  });

  it('detects broken references and duplicate identifiers', () => {
    const source = RecordId.create('record.source');
    const target = RecordId.create('record.target');

    const relationship = createRelationship({
      relationshipId: 'relationship.1',
      sourceRecord: source,
      targetRecord: target,
      relationshipType: RelationshipType.Dependency,
    });

    const brokenIssues = validateRelationship(relationship, new Set([source.toString()]));
    expect(isValid(brokenIssues)).toBe(false);

    const duplicateIssues = validateUniqueIdentifier('record.source', new Set(['record.source']), 'RecordId');
    expect(isValid(duplicateIssues)).toBe(false);
  });

  it('validates version ownership and public MemoryRecord shape', () => {
    const namespaceId = NamespaceId.create('workspace.finance');
    const collectionId = CollectionId.create('collection.history');
    const record = createRecord({
      recordId: 'record.fact.1',
      namespaceId,
      collectionId,
      recordType: 'Fact',
      owner: 'system.atlas',
      createdAt: '2026-07-23T00:00:00.000Z',
      updatedAt: '2026-07-23T00:00:00.000Z',
    });

    const version = createVersion({
      versionId: 'version.fact.1',
      recordId: record.recordId,
      revision: RevisionNumber.create(1),
      content: { fact: 'Valid' },
      checksum: 'sha256:abc123',
      createdAt: '2026-07-23T00:00:00.000Z',
      author: 'system.atlas',
    });

    expect(isValid(validateVersion(version, record))).toBe(true);
    expect(
      isValid(
        validateMemoryRecord({
          id: 'record.fact.1',
          type: 'Fact',
          content: { fact: 'Valid' },
          metadata: {},
          timestamp: '2026-07-23T00:00:00.000Z',
        }),
      ),
    ).toBe(true);
  });

  it('allows in-memory record construction without an initial version', () => {
    const namespace = createNamespace({
      namespaceId: 'workspace.finance',
      namespaceType: 'workspace',
      owner: 'org.atlas',
      createdAt,
    });

    const collection = createCollection({
      collectionId: 'collection.history',
      namespaceId: namespace.namespaceId,
      collectionType: 'history',
      createdAt,
    });

    const record = createRecord({
      recordId: 'record.fact.1',
      namespaceId: namespace.namespaceId,
      collectionId: collection.collectionId,
      recordType: 'Fact',
      owner: 'system.atlas',
      createdAt,
      updatedAt: createdAt,
    });

    expect(isValid(validateRecord(record, namespace, collection))).toBe(true);
    expect(isValid(validateRecordPersistence(record, [], namespace, collection))).toBe(false);
  });

  it('requires an existing current version before persistence', () => {
    const namespace = createNamespace({
      namespaceId: 'workspace.finance',
      namespaceType: 'workspace',
      owner: 'org.atlas',
      createdAt,
    });

    const collection = createCollection({
      collectionId: 'collection.history',
      namespaceId: namespace.namespaceId,
      collectionType: 'history',
      createdAt,
    });

    const record = createRecord({
      recordId: 'record.fact.1',
      namespaceId: namespace.namespaceId,
      collectionId: collection.collectionId,
      recordType: 'Fact',
      owner: 'system.atlas',
      createdAt,
      updatedAt: createdAt,
    });

    const version = createVersion({
      versionId: 'version.fact.1',
      recordId: record.recordId,
      revision: RevisionNumber.create(1),
      content: { fact: 'Valid' },
      checksum: 'sha256:abc123',
      createdAt,
      author: 'system.atlas',
    });

    expect(isValid(validateRecordPersistence(record, [version], namespace, collection))).toBe(true);
  });

  it('enforces version immutability and monotonic revision rules', () => {
    const recordId = RecordId.create('record.fact.1');
    const baseVersion = createVersion({
      versionId: 'version.fact.1',
      recordId,
      revision: RevisionNumber.create(1),
      content: { fact: 'Original' },
      checksum: 'sha256:abc123',
      createdAt,
      author: 'system.atlas',
    });

    const mutatedVersion = createVersion({
      versionId: 'version.fact.1',
      recordId,
      revision: RevisionNumber.create(1),
      content: { fact: 'Changed' },
      checksum: 'sha256:changed',
      createdAt,
      author: 'system.atlas',
    });

    expect(isValid(validateVersionImmutability(baseVersion, mutatedVersion))).toBe(false);
    expect(isValid(validateRevisionMonotonicity(RevisionNumber.create(1), RevisionNumber.create(3)))).toBe(
      false,
    );

    expect(() => assertVersionImmutable(baseVersion, mutatedVersion)).toThrow(
      expect.objectContaining({ code: MEMORY_IMMUTABLE_VERSION }),
    );
  });
});
