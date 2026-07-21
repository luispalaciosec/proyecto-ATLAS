import type { ArtifactExecutor } from '../contracts/artifact-executor.js';
import type { EventDispatcher } from '../events/event-dispatcher.js';
import type { LifecycleManager } from '../lifecycle/lifecycle-manager.js';
import type { StateManager } from '../state/state-manager.js';

import type { Execution } from './execution-aggregate.js';
import type { ExecutionEngine } from './execution-engine.js';
import { runExecutionFlow } from './execution-flow.js';
import type { ExecutionRepository } from './execution-repository.js';
import type { ExecutionUnit } from './types.js';

export interface CreateExecutionEngineOptions {
  readonly executionRepository: ExecutionRepository;
  readonly lifecycleManager: LifecycleManager;
  readonly stateManager: StateManager;
  readonly eventDispatcher: EventDispatcher;
  readonly executors?: readonly ArtifactExecutor[];
  readonly clock?: () => string;
}

export function createExecutionEngine(options: CreateExecutionEngineOptions): ExecutionEngine {
  return {
    component: 'execution-engine',

    async execute(params) {
      return runExecutionFlow(params, {
        executionRepository: options.executionRepository,
        eventDispatcher: options.eventDispatcher,
        executors: options.executors,
        clock: options.clock,
      });
    },

    async createExecution(unit: ExecutionUnit) {
      options.executionRepository.begin({ artifacts: [] }, unit.execution_id.toJSON());

      return Object.freeze({
        execution_id: unit.execution_id.toJSON(),
        status: 'pending' as const,
      });
    },

    getExecution(executionId: string) {
      const aggregate = options.executionRepository.get(executionId);

      if (!aggregate) {
        return null;
      }

      return Object.freeze({
        execution_id: aggregate.identity.execution_id,
        status: aggregate.status,
      });
    },

    getExecutionAggregate(executionId: string): Execution | null {
      return options.executionRepository.get(executionId);
    },
  };
}
