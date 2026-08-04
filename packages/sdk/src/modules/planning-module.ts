import type { EventBus } from '@atlas/events';
import {
  createPlanningEngine,
  type PlanRequest,
  type PlanningEngine,
  type PlanningResult,
} from '@atlas/intelligence';

import type { AtlasPlanningOptions, AtlasWorkspaceOptions } from '../atlas/options.js';

export interface PlanFromGoalOptions {
  readonly strategyId?: string;
  readonly context?: PlanRequest['context'];
}

/**
 * Public planning facade — wraps @atlas/intelligence PlanningEngine.
 */
export class PlanningModule {
  readonly #engine: PlanningEngine;
  readonly #defaultWorkspace: AtlasWorkspaceOptions;

  constructor(
    _bus: EventBus,
    _planningOptions: AtlasPlanningOptions = {},
    workspace: AtlasWorkspaceOptions = {},
  ) {
    this.#defaultWorkspace = workspace;
    this.#engine = createPlanningEngine();
  }

  getEngine(): PlanningEngine {
    return this.#engine;
  }

  planFromGoal(goal: string, options: PlanFromGoalOptions = {}): PlanningResult {
    return this.#engine.plan({
      goal,
      ...(options.strategyId ? { strategy_id: options.strategyId } : {}),
      ...(options.context ? { context: options.context } : {}),
    });
  }

  getDefaultWorkspace(): AtlasWorkspaceOptions {
    return this.#defaultWorkspace;
  }
}
