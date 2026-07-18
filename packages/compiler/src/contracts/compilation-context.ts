import type { Metadata } from '@atlas/core';

import type { Artifact } from './artifact.js';
import type { CompilationLifecycle } from './compilation-lifecycle.js';
import type { CompilationUnit } from './compilation-unit.js';
import type { CompilerStageId } from './compiler-stage-id.js';
import type { Diagnostic } from './diagnostic.js';
import type { KnowledgeGraph } from './knowledge-graph.js';
import type { KnowledgeNode } from './knowledge-node.js';

/**
 * @see ATLAS-ARCH-003 §11 Compilation Context
 */
export interface CompilationContext {
  readonly lifecycle: CompilationLifecycle;
  readonly configuration: Readonly<Record<string, unknown>>;
  readonly workspace: Readonly<Record<string, unknown>>;
  readonly units: readonly CompilationUnit[];
  readonly diagnostics: readonly Diagnostic[];
  readonly hir: readonly KnowledgeNode[];
  readonly mir: KnowledgeGraph | null;
  readonly artifacts: readonly Artifact[];
  readonly plugins: readonly string[];
  readonly packages: readonly string[];
  readonly metadata: Metadata;
  readonly current_stage: CompilerStageId | null;
}

export interface CompilationContextPatch {
  readonly lifecycle?: CompilationLifecycle;
  readonly configuration?: Readonly<Record<string, unknown>>;
  readonly workspace?: Readonly<Record<string, unknown>>;
  readonly units?: readonly CompilationUnit[];
  readonly diagnostics?: readonly Diagnostic[];
  readonly hir?: readonly KnowledgeNode[];
  readonly mir?: KnowledgeGraph | null;
  readonly artifacts?: readonly Artifact[];
  readonly plugins?: readonly string[];
  readonly packages?: readonly string[];
  readonly metadata?: Metadata;
  readonly current_stage?: CompilerStageId | null;
}
