import type { CompilerPipeline, CompilerStage, Generator, Publisher } from '@atlas/compiler';
import type { ArtifactExecutor } from '@atlas/runtime';
import type { EventBus } from '@atlas/events';
import type { LlmBudget, LlmProvider } from '@atlas/llm';

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

export interface AtlasMemoryOptions {
  readonly storageFilePath?: string;
  readonly [key: string]: unknown;
}

export interface AtlasRetrievalOptions {
  readonly namespaceId?: string;
  readonly [key: string]: unknown;
}

export interface AtlasPlanningOptions {
  readonly [key: string]: unknown;
}

export interface AtlasWorkflowOptions {
  readonly [key: string]: unknown;
}

export interface AtlasLlmOptions {
  readonly provider?: LlmProvider;
  readonly apiKey?: string;
  readonly model?: string;
  readonly budget?: LlmBudget;
  readonly [key: string]: unknown;
}

export interface AtlasOptions {
  readonly workspace?: AtlasWorkspaceOptions;
  readonly eventBus?: EventBus;
  readonly compiler?: AtlasCompilerOptions;
  readonly runtime?: AtlasRuntimeOptions;
  readonly memory?: AtlasMemoryOptions;
  readonly retrieval?: AtlasRetrievalOptions;
  readonly planning?: AtlasPlanningOptions;
  readonly workflow?: AtlasWorkflowOptions;
  readonly llm?: AtlasLlmOptions;
}
