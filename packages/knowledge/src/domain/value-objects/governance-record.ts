import type { Identifier } from '@atlas/core';

import { MetaConceptId } from '../../metamodel/meta-concept-id.js';
import { createKnowledgeError } from '../../errors/create-knowledge-error.js';
import type { LifecycleState } from './lifecycle-state.js';

export interface GovernanceRecordData {
  readonly owner: Identifier;
  readonly stewards?: readonly Identifier[];
  readonly reviewers?: readonly Identifier[];
  readonly lifecycleState: LifecycleState;
}

export class GovernanceRecord {
  readonly metaConcept = MetaConceptId.Owner;

  readonly owner: Identifier;
  readonly stewards: readonly Identifier[];
  readonly reviewers: readonly Identifier[];
  readonly lifecycleState: LifecycleState;

  private constructor(data: GovernanceRecordData) {
    this.owner = data.owner;
    this.stewards = Object.freeze([...(data.stewards ?? [])]);
    this.reviewers = Object.freeze([...(data.reviewers ?? [])]);
    this.lifecycleState = data.lifecycleState;
  }

  static create(data: GovernanceRecordData): GovernanceRecord {
    if (!data.owner) {
      throw createKnowledgeError('KNOWLEDGE_INVALID_GOVERNANCE', 'GovernanceRecord requires an owner');
    }

    return new GovernanceRecord(data);
  }
}
