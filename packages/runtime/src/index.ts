// Contracts — ATLAS-DOM-009 (compat) + ATLAS-RUNTIME-* (architecture)
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

// Runtime facade + composition root
export {
  AtlasRuntime,
  createAtlasRuntime,
  type AtlasRuntimeOptions,
} from './runtime/atlas-runtime.js';
export {
  createRuntimeComposition,
  createRuntimeDependencies,
  createRuntimeComponentRegistry,
  RUNTIME_COMPONENT_IDS,
  type CreateRuntimeCompositionOptions,
  type PartialRuntimeDependencies,
  type RuntimeComponentId,
  type RuntimeComponentRegistry,
  type RuntimeComposition,
  type RuntimeDependencies,
} from './composition/index.js';

// Public API surface — ATLAS-RUNTIME-100
export type {
  DiagnosticsApi,
  EventApi,
  ExecutionApi,
  LifecycleApi,
  RuntimePublicApi,
  TaskApi,
  WorkflowApi,
} from './api/index.js';

// Execution Engine — ATLAS-RUNTIME-001
export {
  createExecutionEngine,
  type ExecutionEngine,
  type ExecutionIntent,
  type ExecutionSnapshot,
  type ExecutionStatus,
  type ExecutionUnit,
} from './engine/index.js';

// Pipeline Coordinator — ATLAS-RUNTIME-005
export {
  createPipelineCoordinator,
  isPipelineStage,
  PIPELINE_STAGES,
  type PipelineCoordinator,
  type PipelineStage,
  type PipelineStageSnapshot,
} from './pipeline/index.js';

// Lifecycle Manager — ATLAS-RUNTIME-006
export {
  createLifecycleManager,
  EXECUTION_LIFECYCLE_STAGES,
  isExecutionLifecycleStage,
  type ExecutionLifecycleSnapshot,
  type ExecutionLifecycleStage,
  type LifecycleManager,
} from './lifecycle/index.js';

// State Manager — ATLAS-RUNTIME-003
export {
  createStateManager,
  STATE_SCOPES,
  type StateManager,
  type StateScope,
  type StateSnapshot,
  type StateTransition,
} from './state/index.js';

// Workflow Engine — ATLAS-RUNTIME-009
export {
  createWorkflowEngine,
  WORKFLOW_STATES,
  type WorkflowEngine,
  type WorkflowSnapshot,
  type WorkflowStageSnapshot,
  type WorkflowState,
} from './workflow/index.js';

// Task Scheduler — ATLAS-RUNTIME-004
export {
  createTaskScheduler,
  TASK_STATES,
  type TaskDependency,
  type TaskScheduler,
  type TaskSnapshot,
  type TaskState,
} from './tasks/index.js';

// Agent Runtime — ATLAS-RUNTIME-009
export {
  createAgentRuntime,
  AGENT_EXECUTION_STATES,
  type AgentExecutionSnapshot,
  type AgentExecutionState,
  type AgentRuntime,
} from './agents/index.js';

// Event Dispatcher — ATLAS-RUNTIME-002
export {
  createEventDispatcher,
  type EventDispatcher,
  type RuntimeEventEnvelope,
  type RuntimeEventFilter,
  type RuntimeEventHandler,
  type RuntimeEventSubscription,
} from './events/index.js';

// Error Manager — ATLAS-RUNTIME-008
export {
  createErrorManager,
  RUNTIME_ERROR_CATEGORIES,
  type ErrorManager,
  type RuntimeErrorCategory,
  type RuntimeErrorRecord,
} from './errors/index.js';

// Diagnostics — ATLAS-RUNTIME-007
export {
  createDiagnostics,
  type Diagnostics,
  type RuntimeDiagnosticRecord,
  type RuntimeDiagnosticsSnapshot,
  type RuntimeMetric,
  type RuntimeTraceSpan,
} from './diagnostics/index.js';

// Compat layer
export {
  createLegacyAtlasRuntime,
  LegacyAtlasRuntime,
  type LegacyAtlasRuntimeOptions,
} from './compat/index.js';

// Legacy executors (compat)
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
