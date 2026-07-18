// Contracts — ATLAS-DOM-009
export type { ArtifactExecutor } from './contracts/artifact-executor.js';
export type { ExecutionContext, ExecutionContextPatch } from './contracts/execution-context.js';
export type { ExecutionOutput } from './contracts/execution-output.js';
export type { ExecutionResult } from './contracts/execution-result.js';
export type { ExecuteParams, Runtime } from './contracts/runtime.js';
export {
  isRuntimeLifecycle,
  RUNTIME_LIFECYCLE_STATES,
  type RuntimeLifecycle,
} from './contracts/runtime-lifecycle.js';

// Context factories
export {
  createExecutionContext,
  resetExecutionSessionCounter,
  updateExecutionContext,
  type CreateExecutionContextParams,
} from './context/execution-context.js';

// Runtime engine
export {
  AtlasRuntime,
  createAtlasRuntime,
  type AtlasRuntimeOptions,
} from './runtime/atlas-runtime.js';

// Executors
export {
  createDefaultArtifactExecutors,
  summaryArtifactExecutor,
} from './executors/default-executors.js';
export { createExecutorRegistry, ExecutorRegistry } from './registries/executor-registry.js';

// Domain events — SDK-204 §8
export {
  RUNTIME_COMPLETED_EVENT_TYPE,
  RuntimeCompletedEvent,
  type RuntimeCompletedPayload,
} from './definitions/runtime-completed.js';
export {
  RUNTIME_STARTED_EVENT_TYPE,
  RuntimeStartedEvent,
  type RuntimeStartedPayload,
} from './definitions/runtime-started.js';
