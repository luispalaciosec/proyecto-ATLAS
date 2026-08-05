import type { EventBus } from '@atlas/events';
import {
  createAnthropicProvider,
  runToolLoop,
  type LlmBudget,
  type LlmProvider,
  type ToolExecutor,
  type ToolLoopResult,
} from '@atlas/llm';

import type { Atlas } from '../atlas/atlas.js';
import type { AtlasLlmOptions, AtlasWorkspaceOptions } from '../atlas/options.js';
import { planExecuteAndRemember } from '../plan/plan-execution-memory.js';

const DEFAULT_BUDGET: LlmBudget = Object.freeze({ maxTurns: 6 });

const SYSTEM_PROMPT = [
  'You are Atlas, an assistant with access to certified ATLAS capabilities via tools.',
  'Use memory_search to recall prior information, memory_store to persist new facts,',
  'and plan_and_execute when the user wants to plan and run a goal through the Atlas kernel.',
  'Prefer tools over guessing when memory or execution is relevant.',
].join(' ');

function asString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }

  return value.trim();
}

function createAtlasToolExecutors(atlas: Atlas): readonly ToolExecutor[] {
  return Object.freeze([
    Object.freeze({
      definition: Object.freeze({
        name: 'memory_search',
        description: 'Search stored Atlas memory for content matching a query.',
        parameters: Object.freeze({
          type: 'object' as const,
          properties: Object.freeze({
            query: Object.freeze({
              type: 'string',
              description: 'Search query to match against stored memory content.',
            }),
          }),
          required: Object.freeze(['query']),
        }),
      }),
      execute: async (args: Readonly<Record<string, unknown>>) => {
        const query = asString(args.query, 'query');
        const result = await atlas.memory.searchContent({ query });

        return JSON.stringify(
          Object.freeze({
            total: result.total,
            query: result.query,
            records: result.records.map((record) =>
              Object.freeze({
                id: record.id,
                type: record.type,
                content: record.content,
              }),
            ),
          }),
        );
      },
    }),
    Object.freeze({
      definition: Object.freeze({
        name: 'memory_store',
        description: 'Store new content in Atlas memory.',
        parameters: Object.freeze({
          type: 'object' as const,
          properties: Object.freeze({
            content: Object.freeze({
              type: 'string',
              description: 'Text content to store in memory.',
            }),
          }),
          required: Object.freeze(['content']),
        }),
      }),
      execute: async (args: Readonly<Record<string, unknown>>) => {
        const content = asString(args.content, 'content');
        const result = await atlas.memory.storeContent({ content });

        return JSON.stringify(
          Object.freeze({
            recordId: result.recordId,
            type: result.record.type,
          }),
        );
      },
    }),
    Object.freeze({
      definition: Object.freeze({
        name: 'plan_and_execute',
        description:
          'Plan a goal into a workflow, compile it, execute it, and remember the execution in memory.',
        parameters: Object.freeze({
          type: 'object' as const,
          properties: Object.freeze({
            goal: Object.freeze({
              type: 'string',
              description: 'Goal text to plan and execute.',
            }),
          }),
          required: Object.freeze(['goal']),
        }),
      }),
      execute: async (args: Readonly<Record<string, unknown>>) => {
        const goal = asString(args.goal, 'goal');
        const result = await planExecuteAndRemember(atlas, goal);

        return JSON.stringify(
          Object.freeze({
            success: result.execute.success,
            goal,
            workflowId: result.planning.workflow?.identity.workflow_id,
            sessionId: result.execute.context.session_id.toJSON(),
            retrievalSelected: result.retrieval.context.items.length,
            memoryRecordId: result.memory.recordId,
          }),
        );
      },
    }),
  ]);
}

export interface AskOptions {
  readonly budget?: LlmBudget;
}

/**
 * Public LLM facade — P2.1 tool-calling over certified Atlas capabilities.
 */
export class LlmModule {
  readonly #atlas: Atlas;
  readonly #llmOptions: AtlasLlmOptions;
  readonly #defaultBudget: LlmBudget;
  #injectedProvider: LlmProvider | undefined;
  #resolvedProvider: LlmProvider | undefined;

  constructor(
    _bus: EventBus,
    llmOptions: AtlasLlmOptions = {},
    atlas: Atlas,
    _workspace: AtlasWorkspaceOptions = {},
  ) {
    this.#atlas = atlas;
    this.#llmOptions = llmOptions;
    this.#defaultBudget = llmOptions.budget ?? DEFAULT_BUDGET;
    this.#injectedProvider = llmOptions.provider;
  }

  #resolveProvider(): LlmProvider {
    if (this.#injectedProvider !== undefined) {
      return this.#injectedProvider;
    }

    if (this.#resolvedProvider !== undefined) {
      return this.#resolvedProvider;
    }

    const apiKey = this.#llmOptions.apiKey;
    const model = this.#llmOptions.model;

    if (typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      throw new Error('ATLAS_LLM_API_KEY is required for atlas ask');
    }

    if (typeof model !== 'string' || model.trim().length === 0) {
      throw new Error('ATLAS_LLM_MODEL is required for atlas ask');
    }

    this.#resolvedProvider = createAnthropicProvider({
      apiKey: apiKey.trim(),
      model: model.trim(),
    });

    return this.#resolvedProvider;
  }

  ask(goalText: string, options: AskOptions = {}): Promise<ToolLoopResult> {
    const normalizedGoal = goalText.trim();

    if (normalizedGoal.length === 0) {
      throw new Error('Goal must not be empty');
    }

    return runToolLoop({
      provider: this.#resolveProvider(),
      systemPrompt: SYSTEM_PROMPT,
      userMessage: normalizedGoal,
      tools: createAtlasToolExecutors(this.#atlas),
      budget: options.budget ?? this.#defaultBudget,
    });
  }
}

export type { LlmBudget, LlmProvider, ToolLoopResult } from '@atlas/llm';
