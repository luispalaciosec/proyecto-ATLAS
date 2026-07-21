import type { RuntimeDependencies } from './runtime-dependencies.js';

export const RUNTIME_COMPONENT_IDS = [
  'execution-engine',
  'pipeline-coordinator',
  'lifecycle-manager',
  'state-manager',
  'workflow-engine',
  'task-scheduler',
  'agent-runtime',
  'event-dispatcher',
  'diagnostics',
  'error-manager',
] as const;

export type RuntimeComponentId = (typeof RUNTIME_COMPONENT_IDS)[number];

const COMPONENT_KEY_MAP: Record<RuntimeComponentId, keyof RuntimeDependencies> = {
  'execution-engine': 'executionEngine',
  'pipeline-coordinator': 'pipelineCoordinator',
  'lifecycle-manager': 'lifecycleManager',
  'state-manager': 'stateManager',
  'workflow-engine': 'workflowEngine',
  'task-scheduler': 'taskScheduler',
  'agent-runtime': 'agentRuntime',
  'event-dispatcher': 'eventDispatcher',
  diagnostics: 'diagnostics',
  'error-manager': 'errorManager',
};

/**
 * Registry of runtime components prepared for Sprint 10B wiring.
 */
export interface RuntimeComponentRegistry {
  readonly components: RuntimeDependencies;

  getComponent<T extends RuntimeComponentId>(componentId: T): RuntimeDependencies[typeof COMPONENT_KEY_MAP[T]];
}

export function createRuntimeComponentRegistry(
  components: RuntimeDependencies,
): RuntimeComponentRegistry {
  return {
    components,
    getComponent(componentId) {
      return components[COMPONENT_KEY_MAP[componentId]];
    },
  };
}
