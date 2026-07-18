import type { Identifier, Metadata } from '@atlas/core';

import type { KnowledgeNode } from './knowledge-node.js';

/**
 * @see ATLAS-ARCH-003 §10 Mid-Level Intermediate Representation (MIR)
 */
export interface KnowledgeGraphEdge {
  readonly id: Identifier;
  readonly source: Identifier;
  readonly target: Identifier;
  readonly kind: string;
  readonly metadata: Metadata;
}

export interface KnowledgeGraph {
  readonly id: Identifier;
  readonly nodes: readonly KnowledgeNode[];
  readonly edges: readonly KnowledgeGraphEdge[];
  readonly metadata: Metadata;
}
