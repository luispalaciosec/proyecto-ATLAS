import { describe, expect, it } from 'vitest';

import {
  ContextScope,
  KnowledgeObjectId,
  RelationshipType,
  StatementContent,
} from '../../src/domain/value-objects/index.js';
import { createKnowledgeRelationship } from '../../src/factories/index.js';

describe('Knowledge factories and validators', () => {
  const context = ContextScope.create({ organizational: 'operations' });

  it('creates relationships when endpoints exist', () => {
    const source = KnowledgeObjectId.create('capability.a');
    const target = KnowledgeObjectId.create('capability.b');
    const known = new Set([source.toString(), target.toString()]);

    const relationship = createKnowledgeRelationship({
      id: 'rel.a.b',
      type: RelationshipType.create('depends_on'),
      source,
      target,
      context,
      knownObjectIds: known,
    });

    expect(relationship.metaConcept).toBe('relationship');
    expect(relationship.type.name).toBe('depends_on');
  });

  it('rejects self-referential relationships', () => {
    const objectId = KnowledgeObjectId.create('capability.a');

    expect(() =>
      createKnowledgeRelationship({
        id: 'rel.self',
        type: RelationshipType.create('depends_on'),
        source: objectId,
        target: objectId,
      }),
    ).toThrow();
  });

  it('rejects statements with empty assertions via content VO', () => {
    expect(() => StatementContent.create({ assertion: '   ' })).toThrow();
  });
});
