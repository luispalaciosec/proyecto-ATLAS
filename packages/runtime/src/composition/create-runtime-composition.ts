import type { RuntimePublicApi } from '../api/index.js';
import type { LegacyAtlasRuntimeOptions } from '../compat/legacy-atlas-runtime.js';
import { createAgentRuntime } from '../agents/agent-runtime.factory.js';
import { createDiagnostics } from '../diagnostics/diagnostics.factory.js';
import { createEventDispatcher } from '../events/event-dispatcher.factory.js';
import { createExecutionRepository } from '../engine/execution-repository.js';
import { createExecutionEngine } from '../engine/execution-engine.factory.js';
import { createErrorManager } from '../errors/error-manager.factory.js';
import { createLifecycleManager } from '../lifecycle/lifecycle-manager.factory.js';
import { createPipelineCoordinator } from '../pipeline/pipeline-coordinator.factory.js';
import { createStateManager } from '../state/state-manager.factory.js';
import { createTaskScheduler } from '../tasks/task-scheduler.factory.js';
import { createWorkflowEngine } from '../workflow/workflow-engine.factory.js';

import { createRuntimeComponentRegistry } from './component-registry.js';
import type { PartialRuntimeDependencies, RuntimeDependencies } from './runtime-dependencies.js';
import { createRuntimePublicApi } from './runtime-public-api.js';

export interface RuntimeComposition extends RuntimeDependencies {
  readonly registry: ReturnType<typeof createRuntimeComponentRegistry>;
  readonly api: RuntimePublicApi;
}

export interface CreateRuntimeCompositionOptions extends LegacyAtlasRuntimeOptions {
  readonly dependencies?: PartialRuntimeDependencies;
  readonly clock?: () => string;
}

export function createRuntimeDependencies(
  overrides: PartialRuntimeDependencies = {},
  options: Pick<CreateRuntimeCompositionOptions, 'clock' | 'eventBus' | 'executors'> = {},
): RuntimeDependencies {
  const clock = options.clock;
  const executionRepository = createExecutionRepository({ clock });
  const eventDispatcher =
    overrides.eventDispatcher ??
    createEventDispatcher({ eventBus: options.eventBus, clock, executionRepository });
  const lifecycleManager =
    overrides.lifecycleManager ??
    createLifecycleManager({ eventDispatcher, clock, executionRepository });
  const stateManager =
    overrides.stateManager ?? createStateManager({ clock, executionRepository });
  const executionEngine =
    overrides.executionEngine ??
    createExecutionEngine({
      executionRepository,
      lifecycleManager,
      stateManager,
      eventDispatcher,
      executors: options.executors,
      clock,
    });

  return {
    executionEngine,
    pipelineCoordinator: overrides.pipelineCoordinator ?? createPipelineCoordinator(),
    lifecycleManager,
    stateManager,
    workflowEngine: overrides.workflowEngine ?? createWorkflowEngine(),
    taskScheduler: overrides.taskScheduler ?? createTaskScheduler(),
    agentRuntime: overrides.agentRuntime ?? createAgentRuntime(),
    eventDispatcher,
    diagnostics: overrides.diagnostics ?? createDiagnostics({ executionRepository }),
    errorManager: overrides.errorManager ?? createErrorManager(),
  };
}

export function createRuntimeComposition(
  options: CreateRuntimeCompositionOptions = {},
): RuntimeComposition {
  const dependencies = createRuntimeDependencies(options.dependencies, options);
  const registry = createRuntimeComponentRegistry(dependencies);
  const api = createRuntimePublicApi(dependencies, options);

  return {
    ...dependencies,
    registry,
    api,
  };
}
