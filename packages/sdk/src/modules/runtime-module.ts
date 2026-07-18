import type { Artifact } from '@atlas/compiler';
import type { ArtifactExecutor, ExecutionResult, Runtime } from '@atlas/runtime';
import { createAtlasRuntime } from '@atlas/runtime';
import type { EventBus } from '@atlas/events';

import type { AtlasRuntimeOptions, AtlasWorkspaceOptions } from '../atlas/options.js';

export interface ExecuteOptions {
  readonly artifacts: readonly Artifact[];
  readonly workspace?: AtlasWorkspaceOptions;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Public runtime facade — SDK-202 §16.
 * Composes the in-memory runtime and delegates to @atlas/runtime.
 */
export class RuntimeModule {
  readonly #runtime: Runtime;
  readonly #defaultWorkspace: AtlasWorkspaceOptions;

  constructor(
    bus: EventBus,
    runtimeOptions: AtlasRuntimeOptions = {},
    workspace: AtlasWorkspaceOptions = {},
  ) {
    this.#defaultWorkspace = workspace;
    this.#runtime = createAtlasRuntime({ eventBus: bus, ...runtimeOptions });
  }

  execute(options: ExecuteOptions): Promise<ExecutionResult> {
    return this.#runtime.execute({
      artifacts: options.artifacts,
      workspace: options.workspace ?? this.#defaultWorkspace,
      metadata: options.metadata,
    });
  }
}

export type { ArtifactExecutor, AtlasRuntimeOptions };
