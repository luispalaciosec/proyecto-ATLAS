import type { Identifier } from '@atlas/core';

import { MetaConceptId } from '../../metamodel/meta-concept-id.js';
import type { ContextScope } from '../value-objects/context-scope.js';
import type { KnowledgeVersion } from '../value-objects/knowledge-version.js';
import type { StatementContent } from '../value-objects/statement-content.js';
import type { StatementId } from '../value-objects/statement-id.js';

export interface KnowledgeStatement {
  readonly metaConcept: typeof MetaConceptId.Statement;
  readonly id: StatementId;
  readonly content: StatementContent;
  readonly context: ContextScope;
  readonly version: KnowledgeVersion;
  readonly authoredBy: Identifier;
  readonly publishedAt: string;
  readonly supersedes?: StatementId;
}

export type KnowledgeStatementSnapshot = KnowledgeStatement;
