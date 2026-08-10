// Facade — SDK-202 §7
export { Atlas, createAtlas } from './atlas/atlas.js';
export type {
  AtlasCompilerOptions,
  AtlasLlmOptions,
  AtlasMemoryOptions,
  AtlasOptions,
  AtlasPlanningOptions,
  AtlasRetrievalOptions,
  AtlasRuntimeOptions,
  AtlasWorkflowOptions,
  AtlasWorkspaceOptions,
} from './atlas/options.js';

// Modules
export type { CompileOptions } from './modules/compiler-module.js';
export type { ExecuteOptions } from './modules/runtime-module.js';
export type {
  SearchMemoryContentOptions,
  SearchMemoryContentResult,
  StoreMemoryContentOptions,
  StoreMemoryContentResult,
  StorePlanExecutionOptions,
} from './modules/memory-module.js';
export { matchesContentQuery } from './modules/memory-module.js';
export type { PlanFromGoalOptions } from './modules/planning-module.js';
export type { RetrieveForGoalOptions } from './modules/retrieval-module.js';
export type { AskOptions } from './modules/llm-module.js';
export type { LlmBudget, LlmMessage, LlmProvider, ToolLoopResult } from './modules/llm-module.js';
export type {
  RetrievalContext,
  RetrievalResult,
  RetrievedMemoryItem,
} from './modules/retrieval-module.js';
export { planExecuteAndRemember } from './plan/plan-execution-memory.js';
export type { PlanExecuteAndRememberResult } from './plan/plan-execution-memory.js';

// Kernel re-exports for stable public API (passthrough, no duplication)
export type {
  Artifact,
  CompilationResult,
  CreateCompilationUnitParams,
  Generator,
} from '@atlas/compiler';
export { createArtifact } from '@atlas/compiler';

export type {
  CompilerCompletedPayload,
  DomainEvent,
  EventHandler,
  Unsubscribe,
} from '@atlas/events';
export { CompilerCompletedEvent } from '@atlas/events';

export type {
  ExecutionContext,
  ExecutionResult,
  RuntimeCompletedPayload,
  RuntimeLifecycle,
  RuntimeStartedPayload,
} from '@atlas/runtime';
export { RuntimeCompletedEvent, RuntimeStartedEvent } from '@atlas/runtime';

export { Metadata } from '@atlas/core';
