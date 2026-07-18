import type { Identifier, Metadata } from '@atlas/core';

/**
 * HIR node — @see ATLAS-ARCH-003 §9 High-Level Intermediate Representation
 */
export interface KnowledgeNode {
  readonly id: Identifier;
  readonly kind: string;
  readonly unit_id: Identifier;
  readonly payload: unknown;
  readonly metadata: Metadata;
}
