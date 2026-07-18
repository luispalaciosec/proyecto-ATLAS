import { Identifier, Metadata } from '@atlas/core';

import type { KnowledgeGraph, KnowledgeGraphEdge } from '../contracts/knowledge-graph.js';
import type { KnowledgeNode } from '../contracts/knowledge-node.js';

export interface CreateKnowledgeNodeParams {
  readonly id: string;
  readonly kind: string;
  readonly unit_id: Identifier;
  readonly payload?: unknown;
  readonly metadata?: Record<string, unknown>;
}

export function createKnowledgeNode(params: CreateKnowledgeNodeParams): KnowledgeNode {
  return Object.freeze({
    id: Identifier.create(params.id),
    kind: params.kind,
    unit_id: params.unit_id,
    payload: params.payload ?? {},
    metadata: Metadata.create(params.metadata ?? {}),
  });
}

export interface CreateKnowledgeGraphParams {
  readonly id: string;
  readonly nodes: readonly KnowledgeNode[];
  readonly edges?: readonly KnowledgeGraphEdge[];
  readonly metadata?: Record<string, unknown>;
}

export function createKnowledgeGraph(params: CreateKnowledgeGraphParams): KnowledgeGraph {
  return Object.freeze({
    id: Identifier.create(params.id),
    nodes: Object.freeze([...params.nodes]),
    edges: Object.freeze([...(params.edges ?? [])]),
    metadata: Metadata.create(params.metadata ?? {}),
  });
}

export interface CreateKnowledgeGraphEdgeParams {
  readonly id: string;
  readonly source: Identifier;
  readonly target: Identifier;
  readonly kind: string;
  readonly metadata?: Record<string, unknown>;
}

export function createKnowledgeGraphEdge(
  params: CreateKnowledgeGraphEdgeParams,
): KnowledgeGraphEdge {
  return Object.freeze({
    id: Identifier.create(params.id),
    source: params.source,
    target: params.target,
    kind: params.kind,
    metadata: Metadata.create(params.metadata ?? {}),
  });
}
