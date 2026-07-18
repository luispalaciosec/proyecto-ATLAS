import type { AtlasTimestamp, Identifier, Metadata } from '@atlas/core';
import type { Artifact } from '@atlas/compiler';

import type { ExecutionOutput } from './execution-output.js';
import type { RuntimeLifecycle } from './runtime-lifecycle.js';

/**
 * @see ATLAS-DOM-009 §11 Runtime Context
 * @see ATLAS-DOM-009 §10 Runtime Session
 */
export interface ExecutionContext {
  readonly lifecycle: RuntimeLifecycle;
  readonly session_id: Identifier;
  readonly workspace: Readonly<Record<string, unknown>>;
  readonly artifacts: readonly Artifact[];
  readonly outputs: readonly ExecutionOutput[];
  readonly metadata: Metadata;
  readonly started_at: AtlasTimestamp | null;
  readonly completed_at: AtlasTimestamp | null;
}

export interface ExecutionContextPatch {
  readonly lifecycle?: RuntimeLifecycle;
  readonly artifacts?: readonly Artifact[];
  readonly outputs?: readonly ExecutionOutput[];
  readonly metadata?: Metadata;
  readonly started_at?: AtlasTimestamp | null;
  readonly completed_at?: AtlasTimestamp | null;
}
