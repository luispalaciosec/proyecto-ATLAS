import type { PlanningRule, PlanningStrategy } from './planning-model.js';

export interface PlanningRegistry {
  registerStrategy(strategy: PlanningStrategy): void;

  registerRule(rule: PlanningRule): void;

  getStrategy(strategyId: string): PlanningStrategy | null;

  listStrategies(): readonly PlanningStrategy[];

  listRules(): readonly PlanningRule[];
}

export function createPlanningRegistry(
  strategies: readonly PlanningStrategy[] = [],
  rules: readonly PlanningRule[] = [],
): PlanningRegistry {
  const strategyStore = new Map<string, PlanningStrategy>();
  const ruleStore = new Map<string, PlanningRule>();

  for (const strategy of strategies) {
    strategyStore.set(strategy.strategy_id, strategy);
  }

  for (const rule of rules) {
    ruleStore.set(rule.rule_id, rule);
  }

  return {
    registerStrategy(strategy) {
      if (strategyStore.has(strategy.strategy_id)) {
        throw new Error(`Planning strategy already registered: ${strategy.strategy_id}`);
      }

      strategyStore.set(strategy.strategy_id, strategy);
    },

    registerRule(rule) {
      if (ruleStore.has(rule.rule_id)) {
        throw new Error(`Planning rule already registered: ${rule.rule_id}`);
      }

      ruleStore.set(rule.rule_id, rule);
    },

    getStrategy(strategyId) {
      return strategyStore.get(strategyId) ?? null;
    },

    listStrategies() {
      return Object.freeze([...strategyStore.values()]);
    },

    listRules() {
      return Object.freeze([...ruleStore.values()]);
    },
  };
}
