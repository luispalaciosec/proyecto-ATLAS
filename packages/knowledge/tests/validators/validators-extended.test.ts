import { Identifier } from '@atlas/core';
import { describe, expect, it } from 'vitest';

import {
  ContextScope,
  KnowledgeObjectId,
  KnowledgeVersion,
  LifecycleState,
  ObjectBehavior,
  ObjectKind,
  RelationshipType,
  StatementContent,
  TrustScore,
  isLifecycleState,
} from '../../src/domain/value-objects/index.js';
import { createKnowledgeError } from '../../src/errors/create-knowledge-error.js';
import { getMetamodelInvariant } from '../../src/metamodel/metamodel-invariants.js';
import {
  assertExtensionKindAllowed,
  DEFAULT_EXTENSION_POLICY,
} from '../../src/metamodel/extension-model.js';
import { MetaConceptId } from '../../src/metamodel/meta-concept-id.js';
import {
  assertUniqueId,
  validateContextScope,
  validateIdentityValue,
  validateKnowledgeRelationship,
  validateKnowledgeStatement,
} from '../../src/validators/index.js';

describe('Knowledge validators — extended', () => {
  it('loads invariant definitions by rule id', () => {
    expect(getMetamodelInvariant('MM-INV-001')?.description).toContain('Identity');
    expect(getMetamodelInvariant('missing')).toBeUndefined();
  });

  it('validates identity values and uniqueness', () => {
    expect(validateIdentityValue('valid.id', 'TestId')).toBe('valid.id');
    expect(() => validateIdentityValue('9invalid', 'TestId')).toThrow();

    const known = new Set(['existing.id']);
    expect(() => assertUniqueId('existing.id', known, 'TestId')).toThrow();
  });

  it('validates statement and context rules', () => {
    const owner = Identifier.create('owner.test');
    const context = ContextScope.create({ organizational: 'test' });

    expect(() =>
      validateKnowledgeStatement(
        {
          metaConcept: MetaConceptId.Statement,
          id: { toString: () => 'stmt.1', metaConcept: MetaConceptId.Statement } as never,
          content: StatementContent.create({ assertion: 'Valid' }),
          context,
          version: KnowledgeVersion.initial(),
          authoredBy: owner,
          publishedAt: new Date().toISOString(),
        },
        '',
      ),
    ).toThrow();

    expect(() => validateContextScope(ContextScope.create({ organizational: 'a' }))).not.toThrow();
  });

  it('validates relationships and extension policy branches', () => {
    const source = KnowledgeObjectId.create('a');
    const target = KnowledgeObjectId.create('b');

    validateKnowledgeRelationship({
      metaConcept: MetaConceptId.Relationship,
      id: { toString: () => 'rel.1', metaConcept: MetaConceptId.Relationship } as never,
      type: RelationshipType.create('references'),
      source,
      target,
    });

    expect(
      assertExtensionKindAllowed(DEFAULT_EXTENSION_POLICY, 'Policy', MetaConceptId.Object),
    ).toBe(true);
    expect(
      assertExtensionKindAllowed(
        DEFAULT_EXTENSION_POLICY,
        MetaConceptId.Identity,
        MetaConceptId.Object,
      ),
    ).toBe(false);
  });

  it('covers value object and validator edge cases', () => {
    expect(isLifecycleState(LifecycleState.Draft)).toBe(true);
    expect(isLifecycleState('unknown')).toBe(false);

    expect(() => TrustScore.create(1.5)).toThrow();
    expect(() => ObjectKind.create('identity')).toThrow();
    expect(() => ContextScope.create({ organizational: '   ' })).toThrow();

    const behaviorA = ObjectBehavior.create([{ name: 'validate' }]);
    const behaviorB = ObjectBehavior.create([{ name: 'validate' }]);
    expect(behaviorA.equals(behaviorB)).toBe(true);

    const source = KnowledgeObjectId.create('known.a');
    const relationship = {
      metaConcept: MetaConceptId.Relationship,
      id: { toString: () => 'rel.missing', metaConcept: MetaConceptId.Relationship } as never,
      type: RelationshipType.create('references'),
      source,
      target: KnowledgeObjectId.create('missing.b'),
    };

    expect(() =>
      validateKnowledgeRelationship(relationship as never, new Set([source.toString()])),
    ).toThrow();

    expect(
      assertExtensionKindAllowed(
        DEFAULT_EXTENSION_POLICY,
        'depends_on',
        MetaConceptId.Relationship,
      ),
    ).toBe(true);

    const content = StatementContent.create({ assertion: 'Same' });
    expect(content.equals(StatementContent.create({ assertion: 'Same' }))).toBe(true);
    expect(KnowledgeVersion.initial().equals(KnowledgeVersion.create('1.0.0'))).toBe(true);

    const error = createKnowledgeError('KNOWLEDGE_TEST', 'test message');
    expect(error.module).toBe('@atlas/knowledge');
  });
});
