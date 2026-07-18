import { Identifier, Metadata } from '@atlas/core';

import type { Artifact } from '../contracts/artifact.js';

export interface CreateArtifactParams {
  readonly id: string;
  readonly kind: string;
  readonly content: unknown;
  readonly metadata?: Record<string, unknown>;
  readonly source_graph_id?: Identifier;
}

export function createArtifact(params: CreateArtifactParams): Artifact {
  return Object.freeze({
    id: Identifier.create(params.id),
    kind: params.kind,
    content: params.content,
    metadata: Metadata.create(params.metadata ?? {}),
    source_graph_id: params.source_graph_id,
  });
}
