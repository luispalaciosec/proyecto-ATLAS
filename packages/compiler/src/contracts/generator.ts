import type { Artifact } from './artifact.js';
import type { CompilationContext } from './compilation-context.js';
import type { KnowledgeGraph } from './knowledge-graph.js';

/**
 * @see ATLAS-ARCH-003 §25–26 Generator Architecture / Registry
 */
export interface Generator {
  readonly id: string;
  readonly supported_formats: readonly string[];
  generate(graph: KnowledgeGraph, context: CompilationContext): readonly Artifact[];
}
