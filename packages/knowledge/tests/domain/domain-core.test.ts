import { Identifier } from '@atlas/core';
import { describe, expect, it } from 'vitest';

import {
  ContextScope,
  KnowledgeObjectId,
  ObjectKind,
  ObjectMetadata,
  StatementContent,
  StatementId,
} from '../../src/domain/value-objects/index.js';
import { createKnowledgeObject, createKnowledgeStatement } from '../../src/index.js';

describe('Knowledge domain core', () => {
  const owner = Identifier.create('owner.finance');
  const context = ContextScope.create({ organizational: 'finance' });

  it('creates value objects with metamodel markers', () => {
    const objectId = KnowledgeObjectId.create('policy.access-control');
    expect(objectId.metaConcept).toBe('object');

    const content = StatementContent.create({
      assertion: 'Access must be approved by security',
    });
    expect(content.metaConcept).toBe('statement');
  });

  it('creates statements bound to an object id', () => {
    const statement = createKnowledgeStatement({
      id: 'stmt.access.1',
      objectId: 'policy.access-control',
      content: StatementContent.create({
        assertion: 'All access changes require approval',
      }),
      context,
      authoredBy: owner,
    });

    expect(statement.id).toBeInstanceOf(StatementId);
    expect(statement.content.assertion).toContain('approval');
  });

  it('creates knowledge objects with governance and context', () => {
    const object = createKnowledgeObject({
      id: 'policy.access-control',
      kind: ObjectKind.create('Policy'),
      metadata: ObjectMetadata.create({
        name: 'Access Control Policy',
        description: 'Organizational access rules',
      }),
      owner,
      contexts: [context],
      statements: [
        createKnowledgeStatement({
          id: 'stmt.access.1',
          objectId: 'policy.access-control',
          content: StatementContent.create({
            assertion: 'Finance systems require MFA',
          }),
          context,
          authoredBy: owner,
        }),
      ],
    });

    expect(object.metaConcept).toBe('object');
    expect(object.governance.lifecycleState).toBe('draft');
    expect(object.statements).toHaveLength(1);
    expect(object.trust.level).toBe(0);
  });

  it('rejects objects without context', () => {
    expect(() =>
      createKnowledgeObject({
        id: 'invalid.object',
        kind: ObjectKind.create('Policy'),
        metadata: ObjectMetadata.create({ name: 'Invalid' }),
        owner,
        contexts: [],
      }),
    ).toThrow();
  });
});
