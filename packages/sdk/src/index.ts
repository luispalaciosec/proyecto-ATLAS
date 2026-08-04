// Facade — SDK-202 §7
export { Atlas, createAtlas } from './atlas/atlas.js';
export type {
  AtlasCompilerOptions,
  AtlasMemoryOptions,
  AtlasOptions,
  AtlasPlanningOptions,
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
} from './modules/memory-module.js';
export type { PlanFromGoalOptions } from './modules/planning-module.js';

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
