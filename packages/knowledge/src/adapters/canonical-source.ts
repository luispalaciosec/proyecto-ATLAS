import { createHash } from 'node:crypto';

import type { KnowledgeObject } from '../domain/aggregates/knowledge-object.js';
import type { ContextScope } from '../domain/value-objects/context-scope.js';

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }

  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;

    return Object.keys(record)
      .sort()
      .reduce<Record<string, unknown>>((accumulator, key) => {
        accumulator[key] = sortKeys(record[key]);
        return accumulator;
      }, {});
  }

  return value;
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

export function computeSourceChecksum(source: unknown): string {
  const digest = createHash('sha256').update(stableStringify(source)).digest('hex');
  return `sha256:${digest}`;
}

function serializeContext(context: ContextScope): Record<string, string> {
  return Object.freeze({ ...context.dimensions });
}

export interface KnowledgeCanonicalSource {
  readonly id: string;
  readonly kind: string;
  readonly metadata: {
    readonly name: string;
    readonly description?: string;
    readonly labels: readonly string[];
    readonly tags: readonly string[];
    readonly aliases: readonly string[];
    readonly language: string;
    readonly visibility: string;
  };
  readonly statements: readonly {
    readonly id: string;
    readonly content: ReturnType<KnowledgeObject['statements'][number]['content']['toJSON']>;
    readonly context: Record<string, string>;
    readonly version: string;
    readonly authoredBy: string;
    readonly publishedAt: string;
    readonly supersedes?: string;
  }[];
  readonly behavior: {
    readonly intentions: readonly { readonly name: string; readonly description?: string }[];
  };
  readonly relationshipRefs: readonly {
    readonly relationshipId: string;
    readonly targetId: string;
  }[];
  readonly contexts: readonly Record<string, string>[];
  readonly governance: {
    readonly owner: string;
    readonly lifecycleState: string;
  };
  readonly trust: {
    readonly level: number;
  };
  readonly version: string;
}

export function serializeKnowledgeCanonicalSource(object: KnowledgeObject): KnowledgeCanonicalSource {
  return Object.freeze({
    id: object.id.toString(),
    kind: object.kind.name,
    metadata: Object.freeze({
      name: object.metadata.name,
      description: object.metadata.description,
      labels: object.metadata.labels,
      tags: object.metadata.tags,
      aliases: object.metadata.aliases,
      language: object.metadata.language,
      visibility: object.metadata.visibility,
    }),
    statements: Object.freeze(
      object.statements.map((statement) =>
        Object.freeze({
          id: statement.id.toString(),
          content: statement.content.toJSON(),
          context: serializeContext(statement.context),
          version: statement.version.version.toString(),
          authoredBy: statement.authoredBy.toString(),
          publishedAt: statement.publishedAt,
          ...(statement.supersedes ? { supersedes: statement.supersedes.toString() } : {}),
        }),
      ),
    ),
    behavior: Object.freeze({
      intentions: object.behavior.intentions,
    }),
    relationshipRefs: Object.freeze(
      object.relationshipRefs.map((reference) =>
        Object.freeze({
          relationshipId: reference.relationshipId.toString(),
          targetId: reference.targetId.toString(),
        }),
      ),
    ),
    contexts: Object.freeze(object.contexts.map(serializeContext)),
    governance: Object.freeze({
      owner: object.governance.owner.toString(),
      lifecycleState: object.governance.lifecycleState,
    }),
    trust: Object.freeze({
      level: object.trust.level,
    }),
    version: object.currentVersion.version.toString(),
  });
}
