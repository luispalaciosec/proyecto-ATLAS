import type { EventBus } from '@atlas/events';
import { normalizeForSearch } from '@atlas/core';
import {
  createAnthropicProvider,
  createOpenAICompatibleProvider,
  runToolLoop,
  type LlmBudget,
  type LlmMessage,
  type LlmProvider,
  type ToolExecutor,
  type ToolLoopResult,
} from '@atlas/llm';

import type { Atlas } from '../atlas/atlas.js';
import type { AtlasLlmOptions, AtlasWorkspaceOptions } from '../atlas/options.js';
import { planExecuteAndRemember } from '../plan/plan-execution-memory.js';
import type { SearchMemoryContentResult } from './memory-module.js';

const DEFAULT_BUDGET: LlmBudget = Object.freeze({ maxTurns: 6 });

const SYSTEM_PROMPT = [
  'You are Atlas, an assistant with access to certified ATLAS capabilities via tools.',
  'Use memory_search to recall prior information, memory_store to persist new facts,',
  'and plan_and_execute when the user wants to plan and run a goal through the Atlas kernel.',
  'Prefer tools over guessing when memory or execution is relevant.',
  'Tool results are authoritative and must never be contradicted or ignored.',
  'If a tool result shows total greater than zero or a non-empty records array, you must',
  'reference that data in your response — never claim no information exists when a tool',
  'result shows otherwise. If a tool result is genuinely empty, say so plainly instead of guessing.',
  'Tool results may include internal tracking identifiers (workflowId, sessionId, memoryRecordId, recordId).',
  'These are internal metadata — never read them aloud or show them to the user unless they explicitly',
  'ask for technical or debugging details. Summarize outcomes in business language',
  '(e.g. "pedido confirmado y registrado" instead of citing a workflow ID).',
  'Each user turn includes a fresh automatic knowledge retrieval block — treat it as the current',
  'ground truth for this answer, even if you answered a similar question earlier in the thread.',
  'If the user repeats or reformulates a prior question, or mentions adding or updating knowledge,',
  'still rely on the fresh retrieval block and use memory_search again when needed — never assume',
  'a previous answer remains valid after knowledge may have changed.',
].join(' ');

function readOptionalStringOption(
  options: AtlasLlmOptions,
  key: string,
): string | undefined {
  const raw = options[key];

  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim();
  }

  return undefined;
}

function resolveConfiguredProviderId(options: AtlasLlmOptions): string {
  return (readOptionalStringOption(options, 'providerId') ?? 'anthropic').toLowerCase();
}

const KNOWLEDGE_CONTEXT_RECORD_LIMIT = 8;
const KNOWLEDGE_CONTEXT_SNIPPET_MAX_LENGTH = 1200;
const KNOWLEDGE_PREFETCH_MIN_TOKEN_LENGTH = 4;
const KNOWLEDGE_PREFETCH_STOPWORDS = new Set([
  'about',
  'algo',
  'como',
  'cual',
  'debe',
  'debo',
  'decir',
  'dime',
  'donde',
  'este',
  'esta',
  'esto',
  'hace',
  'hacer',
  'just',
  'menciona',
  'mismo',
  'para',
  'puede',
  'puedo',
  'que',
  'quisiera',
  'repite',
  'respuesta',
  'saber',
  'solo',
  'tell',
  'that',
  'this',
  'what',
  'when',
  'where',
  'which',
  'with',
  'without',
]);

function buildKnowledgePrefetchQueries(goal: string): readonly string[] {
  const trimmedGoal = goal.trim();
  const queries = new Set<string>();

  if (trimmedGoal.length > 0) {
    queries.add(trimmedGoal);
  }

  for (const token of normalizeForSearch(trimmedGoal).split(/\s+/)) {
    if (
      token.length >= KNOWLEDGE_PREFETCH_MIN_TOKEN_LENGTH &&
      !KNOWLEDGE_PREFETCH_STOPWORDS.has(token)
    ) {
      queries.add(token);
    }
  }

  return Object.freeze([...queries]);
}

async function prefetchKnowledgeForGoal(
  atlas: Atlas,
  goal: string,
): Promise<SearchMemoryContentResult> {
  const recordsById = new Map<string, SearchMemoryContentResult['records'][number]>();

  for (const query of buildKnowledgePrefetchQueries(goal)) {
    const result = await atlas.memory.searchContent({ query });

    for (const record of result.records) {
      recordsById.set(record.id, record);
    }
  }

  const records = Object.freeze([...recordsById.values()]);

  return Object.freeze({
    records,
    total: records.length,
    query: goal.trim(),
  });
}

function extractKnowledgeRecordText(content: unknown): string {
  if (typeof content === 'string') {
    return content.trim();
  }

  if (
    content !== null &&
    typeof content === 'object' &&
    'text' in content &&
    typeof (content as { text?: unknown }).text === 'string'
  ) {
    return (content as { text: string }).text.trim();
  }

  try {
    return JSON.stringify(content);
  } catch {
    return String(content);
  }
}

function truncateKnowledgeSnippet(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trim()}…`;
}

function buildFreshKnowledgeContextBlock(
  goal: string,
  searchResult: SearchMemoryContentResult,
): string {
  const lines = [
    'Fresh knowledge retrieval for this turn (automatic — current ground truth):',
    `Search query: ${goal}`,
    `Matching records: ${searchResult.total}`,
  ];

  if (searchResult.total === 0) {
    lines.push('No matching knowledge records were found for this question.');
    return lines.join('\n');
  }

  for (const [index, record] of searchResult.records.slice(0, KNOWLEDGE_CONTEXT_RECORD_LIMIT).entries()) {
    const recordType =
      typeof record.type === 'string' && record.type.trim().length > 0 ? record.type : 'unknown';
    lines.push(`--- Record ${index + 1} (${recordType}) ---`);
    lines.push(truncateKnowledgeSnippet(extractKnowledgeRecordText(record.content), KNOWLEDGE_CONTEXT_SNIPPET_MAX_LENGTH));
  }

  if (searchResult.total > KNOWLEDGE_CONTEXT_RECORD_LIMIT) {
    lines.push(
      `(… ${searchResult.total - KNOWLEDGE_CONTEXT_RECORD_LIMIT} additional matching records omitted)`,
    );
  }

  return lines.join('\n');
}

function buildSystemPrompt(contextPrompt?: string, knowledgeContext?: string): string {
  const sections = [SYSTEM_PROMPT];

  if (typeof knowledgeContext === 'string' && knowledgeContext.trim().length > 0) {
    sections.push(knowledgeContext.trim());
  }

  if (typeof contextPrompt === 'string' && contextPrompt.trim().length > 0) {
    sections.push(contextPrompt.trim());
  }

  return sections.join('\n\n---\n\n');
}

function asString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }

  return value.trim();
}

function asNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${fieldName} must be a finite number`);
  }

  return value;
}

function asOptionalBoolean(value: unknown, fieldName: string): boolean {
  if (value === undefined) {
    return false;
  }

  if (typeof value !== 'boolean') {
    throw new Error(`${fieldName} must be a boolean when provided`);
  }

  return value;
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
        const limitedRecords = result.records.slice(0, KNOWLEDGE_CONTEXT_RECORD_LIMIT);

        return JSON.stringify(
          Object.freeze({
            total: result.total,
            query: result.query,
            records: limitedRecords.map((record) =>
              Object.freeze({
                id: record.id,
                type: record.type,
                content: truncateKnowledgeSnippet(
                  extractKnowledgeRecordText(record.content),
                  KNOWLEDGE_CONTEXT_SNIPPET_MAX_LENGTH,
                ),
              }),
            ),
            ...(result.records.length > KNOWLEDGE_CONTEXT_RECORD_LIMIT
              ? { omitted: result.records.length - KNOWLEDGE_CONTEXT_RECORD_LIMIT }
              : {}),
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
    Object.freeze({
      definition: Object.freeze({
        name: 'org_evaluate_discount',
        description:
          'Evaluate whether a discount percentage for a client can be applied autonomously or requires approval.',
        parameters: Object.freeze({
          type: 'object' as const,
          properties: Object.freeze({
            clientLegalName: Object.freeze({
              type: 'string',
              description: 'Legal name of the client to evaluate.',
            }),
            requestedPercent: Object.freeze({
              type: 'number',
              description: 'Requested discount percentage.',
            }),
          }),
          required: Object.freeze(['clientLegalName', 'requestedPercent']),
        }),
      }),
      execute: async (args: Readonly<Record<string, unknown>>) => {
        const clientLegalName = asString(args.clientLegalName, 'clientLegalName');
        const requestedPercent = asNumber(args.requestedPercent, 'requestedPercent');
        const evaluation = await atlas.org.evaluateDiscountRequest(
          clientLegalName,
          requestedPercent,
        );

        return atlas.org.formatDiscountEvaluation(evaluation);
      },
    }),
    Object.freeze({
      definition: Object.freeze({
        name: 'org_resolve_policy',
        description:
          'Resolve the current warranty policy by policy code and optionally include audited version history.',
        parameters: Object.freeze({
          type: 'object' as const,
          properties: Object.freeze({
            policyCode: Object.freeze({
              type: 'string',
              description: 'Policy code to resolve (for example WARRANTY-STD).',
            }),
            includeHistory: Object.freeze({
              type: 'boolean',
              description: 'When true, include immutable historical policy revisions.',
            }),
          }),
          required: Object.freeze(['policyCode']),
        }),
      }),
      execute: async (args: Readonly<Record<string, unknown>>) => {
        const policyCode = asString(args.policyCode, 'policyCode');
        const includeHistory = asOptionalBoolean(args.includeHistory, 'includeHistory');

        if (!includeHistory) {
          const current = await atlas.org.resolveCurrentWarrantyByCode(policyCode);
          return atlas.org.formatCurrentWarrantyPolicy(current);
        }

        return atlas.org.formatWarrantyWithHistory(policyCode);
      },
    }),
  ]);
}

export interface AskOptions {
  readonly budget?: LlmBudget;
  readonly history?: readonly LlmMessage[];
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

    const providerId = resolveConfiguredProviderId(this.#llmOptions);
    const normalizedApiKey = apiKey.trim();
    const normalizedModel = model.trim();

    if (providerId === 'anthropic') {
      this.#resolvedProvider = createAnthropicProvider({
        apiKey: normalizedApiKey,
        model: normalizedModel,
      });
    } else if (providerId === 'openai-compatible') {
      const baseUrl = readOptionalStringOption(this.#llmOptions, 'baseUrl');

      this.#resolvedProvider = createOpenAICompatibleProvider({
        apiKey: normalizedApiKey,
        model: normalizedModel,
        ...(baseUrl !== undefined ? { baseUrl } : {}),
      });
    } else {
      throw new Error(
        `Unsupported ATLAS_LLM_PROVIDER "${providerId}" (supported: anthropic, openai-compatible)`,
      );
    }

    return this.#resolvedProvider;
  }

  isConfigured(): boolean {
    if (this.#injectedProvider !== undefined) {
      return true;
    }

    const apiKey = this.#llmOptions.apiKey;
    const model = this.#llmOptions.model;

    return (
      typeof apiKey === 'string' &&
      apiKey.trim().length > 0 &&
      typeof model === 'string' &&
      model.trim().length > 0
    );
  }

  async ask(goalText: string, options: AskOptions = {}): Promise<ToolLoopResult> {
    const normalizedGoal = goalText.trim();

    if (normalizedGoal.length === 0) {
      throw new Error('Goal must not be empty');
    }

    const knowledgeSearch = await prefetchKnowledgeForGoal(this.#atlas, normalizedGoal);

    return runToolLoop({
      provider: this.#resolveProvider(),
      systemPrompt: buildSystemPrompt(
        this.#llmOptions.contextPrompt,
        buildFreshKnowledgeContextBlock(normalizedGoal, knowledgeSearch),
      ),
      userMessage: normalizedGoal,
      tools: createAtlasToolExecutors(this.#atlas),
      budget: options.budget ?? this.#defaultBudget,
      ...(options.history !== undefined ? { history: options.history } : {}),
    });
  }
}

export type { LlmBudget, LlmMessage, LlmProvider, ToolLoopResult } from '@atlas/llm';
