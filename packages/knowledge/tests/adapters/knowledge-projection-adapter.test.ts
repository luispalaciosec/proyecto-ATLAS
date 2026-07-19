import { Identifier } from '@atlas/core';
import { describe, expect, it } from 'vitest';

import {
  KnowledgeProjectionAdapter,
  KnowledgeProjectionError,
  computeSourceChecksum,
  isKnowledgeObject,
} from '../../src/adapters/index.js';
import type { KnowledgeObject } from '../../src/domain/aggregates/knowledge-object.js';
import {
  ContextScope,
  GovernanceRecord,
  LifecycleState,
  ObjectKind,
  ObjectMetadata,
  StatementContent,
} from '../../src/domain/value-objects/index.js';
import {
  createKnowledgeObject,
  createKnowledgeStatement,
} from '../../src/factories/index.js';

function asOperational(object: KnowledgeObject): KnowledgeObject {
  return Object.freeze({
    ...object,
    governance: GovernanceRecord.create({
      owner: object.governance.owner,
      stewards: object.governance.stewards,
      reviewers: object.governance.reviewers,
      lifecycleState: LifecycleState.Operational,
    }),
  });
}

function createOperationalPolicy(id: string): KnowledgeObject {
  const owner = Identifier.create('owner.security');
  const context = ContextScope.create({ organizational: 'security' });

  return asOperational(
    createKnowledgeObject({
      id,
      kind: ObjectKind.create('Policy'),
      metadata: ObjectMetadata.create({
        name: 'Access Control Policy',
        description: 'Organizational access rules',
        tags: ['policy', 'access'],
      }),
      owner,
      contexts: [context],
      statements: [
        createKnowledgeStatement({
          id: `${id}.stmt.1`,
          objectId: id,
          content: StatementContent.create({
            assertion: 'All production access requires multi-factor authentication.',
          }),
          context,
          authoredBy: owner,
        }),
      ],
    }),
  );
}

describe('KnowledgeProjectionAdapter', () => {
  it('projects operational KnowledgeObjects into CompilationUnit params', () => {
    const object = createOperationalPolicy('policy.security.access-control');
    const adapter = new KnowledgeProjectionAdapter();
    const result = adapter.project(object);

    expect(result.success).toBe(true);
    expect(result.unit).toMatchObject({
      id: 'policy.security.access-control',
      origin: 'knowledge://policy.security.access-control@1.0.0',
      version: '1.0.0',
      metadata: {
        kind: 'Policy',
        knowledgeObjectId: 'policy.security.access-control',
        lifecycleState: LifecycleState.Operational,
        projection: 'knowledge-projection-adapter',
      },
    });
    expect(result.unit?.checksum).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(result.unit?.source).toMatchObject({
      id: 'policy.security.access-control',
      kind: 'Policy',
      statements: [
        expect.objectContaining({
          content: {
            assertion: 'All production access requires multi-factor authentication.',
          },
        }),
      ],
    });
  });

  it('rejects draft lifecycle objects by default', () => {
    const owner = Identifier.create('owner.security');
    const context = ContextScope.create({ organizational: 'security' });
    const draft = createKnowledgeObject({
      id: 'policy.draft',
      kind: ObjectKind.create('Policy'),
      metadata: ObjectMetadata.create({ name: 'Draft Policy' }),
      owner,
      contexts: [context],
    });

    const result = new KnowledgeProjectionAdapter().project(draft);

    expect(result.success).toBe(false);
    expect(result.diagnostics[0]?.code).toBe('PROJECTION_LIFECYCLE_NOT_COMPILABLE');
  });

  it('allows non-operational objects when lifecycle enforcement is disabled', () => {
    const owner = Identifier.create('owner.security');
    const context = ContextScope.create({ organizational: 'security' });
    const draft = createKnowledgeObject({
      id: 'policy.draft',
      kind: ObjectKind.create('Policy'),
      metadata: ObjectMetadata.create({ name: 'Draft Policy' }),
      owner,
      contexts: [context],
    });

    const adapter = new KnowledgeProjectionAdapter({ requireCompilableLifecycle: false });
    const result = adapter.project(draft);

    expect(result.success).toBe(true);
    expect(result.unit?.id).toBe('policy.draft');
  });

  it('projectAll throws when any object fails projection', () => {
    const operational = createOperationalPolicy('policy.ok');
    const owner = Identifier.create('owner.security');
    const context = ContextScope.create({ organizational: 'security' });
    const draft = createKnowledgeObject({
      id: 'policy.bad',
      kind: ObjectKind.create('Policy'),
      metadata: ObjectMetadata.create({ name: 'Draft Policy' }),
      owner,
      contexts: [context],
    });

    expect(() => new KnowledgeProjectionAdapter().projectAll([operational, draft])).toThrow(
      KnowledgeProjectionError,
    );
  });

  it('produces deterministic checksums for canonical source', () => {
    const object = createOperationalPolicy('policy.deterministic');
    const adapter = new KnowledgeProjectionAdapter();
    const first = adapter.project(object).unit?.checksum;
    const second = adapter.project(object).unit?.checksum;

    expect(first).toBe(second);
    expect(computeSourceChecksum({ b: 2, a: 1 })).toBe(computeSourceChecksum({ a: 1, b: 2 }));
  });

  it('identifies KnowledgeObjects via isKnowledgeObject', () => {
    const object = createOperationalPolicy('policy.guard');
    expect(isKnowledgeObject(object)).toBe(true);
    expect(isKnowledgeObject({ metaConcept: 'object' })).toBe(false);
    expect(isKnowledgeObject(null)).toBe(false);
  });
});
