import type { Identifier, Metadata } from '@atlas/core';

/**
 * @see ATLAS-ARCH-003 §25 Generator Architecture (output artifact)
 */
export interface Artifact {
  readonly id: Identifier;
  readonly kind: string;
  readonly content: unknown;
  readonly metadata: Metadata;
  readonly source_graph_id?: Identifier;
}
