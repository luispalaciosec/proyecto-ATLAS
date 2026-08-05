import type { LlmUsage } from './provider.js';

export interface LlmBudget {
  readonly maxTurns: number;
  readonly maxTotalTokens?: number;
}

export interface BudgetConsumeResult {
  readonly exceeded: boolean;
  readonly reason?: 'maxTurns' | 'maxTotalTokens';
}

export interface BudgetTracker {
  consume(usage: LlmUsage): BudgetConsumeResult;
  readonly turns: number;
  readonly totalTokens: number;
}

export function createBudgetTracker(budget: LlmBudget): BudgetTracker {
  let turns = 0;
  let totalTokens = 0;

  return {
    get turns() {
      return turns;
    },
    get totalTokens() {
      return totalTokens;
    },
    consume(usage: LlmUsage): BudgetConsumeResult {
      turns += 1;
      totalTokens += usage.inputTokens + usage.outputTokens;

      if (turns > budget.maxTurns) {
        return Object.freeze({ exceeded: true, reason: 'maxTurns' });
      }

      if (
        budget.maxTotalTokens !== undefined &&
        totalTokens > budget.maxTotalTokens
      ) {
        return Object.freeze({ exceeded: true, reason: 'maxTotalTokens' });
      }

      return Object.freeze({ exceeded: false });
    },
  };
}
