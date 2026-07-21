import type { AgentRuntime } from '../agents/agent-runtime.js';
import type { Diagnostics } from '../diagnostics/diagnostics.js';
import type { EventDispatcher } from '../events/event-dispatcher.js';
import type { ExecutionEngine } from '../engine/execution-engine.js';
import type { ErrorManager } from '../errors/error-manager.js';
import type { LifecycleManager } from '../lifecycle/lifecycle-manager.js';
import type { PipelineCoordinator } from '../pipeline/pipeline-coordinator.js';
import type { StateManager } from '../state/state-manager.js';
import type { TaskScheduler } from '../tasks/task-scheduler.js';
import type { WorkflowEngine } from '../workflow/workflow-engine.js';

/**
 * @see ATLAS-RUNTIME-009 §7 Internal Coordination
 */
export interface RuntimeDependencies {
  readonly executionEngine: ExecutionEngine;
  readonly pipelineCoordinator: PipelineCoordinator;
  readonly lifecycleManager: LifecycleManager;
  readonly stateManager: StateManager;
  readonly workflowEngine: WorkflowEngine;
  readonly taskScheduler: TaskScheduler;
  readonly agentRuntime: AgentRuntime;
  readonly eventDispatcher: EventDispatcher;
  readonly diagnostics: Diagnostics;
  readonly errorManager: ErrorManager;
}

export type PartialRuntimeDependencies = Partial<RuntimeDependencies>;
