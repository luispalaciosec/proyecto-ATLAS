import type { CompilerPipeline, CompilerStage, Generator, Publisher } from '@atlas/compiler';
import type { ArtifactExecutor } from '@atlas/runtime';
import type { EventBus } from '@atlas/events';

export interface AtlasWorkspaceOptions {
  readonly name?: string;
  readonly [key: string]: unknown;
}

export interface AtlasCompilerOptions {
  readonly pipeline?: CompilerPipeline;
  readonly stages?: readonly CompilerStage[];
  readonly generators?: () => readonly Generator[];
  readonly publishers?: () => readonly Publisher[];
}

export interface AtlasRuntimeOptions {
  readonly executors?: readonly ArtifactExecutor[];
}

export interface AtlasOptions {
  readonly workspace?: AtlasWorkspaceOptions;
  readonly eventBus?: EventBus;
  readonly compiler?: AtlasCompilerOptions;
  readonly runtime?: AtlasRuntimeOptions;
}
