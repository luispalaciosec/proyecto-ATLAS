import type { EventBus } from '@atlas/events';
import {
  createAnthropicProvider,
  createOpenAICompatibleProvider,
  runToolLoop,
  type LlmBudget,
  type LlmMessage,
  type LlmProvider,
  type ToolLoopResult,
} from '@atlas/llm';

import type { Atlas } from '../atlas/atlas.js';
import type { AtlasLlmOptions, AtlasWorkspaceOptions } from '../atlas/options.js';
import { AtlasContextBuilder, type AtlasContextPackage } from '../context/index.js';
import { listAtlasOrgToolNames } from '../org/org-llm-tools.js';
import { createAtlasToolExecutors } from '../tools/atlas-tool-registry.js';

const DEFAULT_BUDGET: LlmBudget = Object.freeze({ maxTurns: 6 });

function readOptionalStringOption(options: AtlasLlmOptions, key: string): string | undefined {
  const raw = options[key];

  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim();
  }

  return undefined;
}

function resolveConfiguredProviderId(options: AtlasLlmOptions): string {
  return (readOptionalStringOption(options, 'providerId') ?? 'anthropic').toLowerCase();
}

export interface AskOptions {
  readonly budget?: LlmBudget;
  readonly history?: readonly LlmMessage[];
  readonly contextPackage?: AtlasContextPackage;
}

/**
 * Public LLM facade — P2.1 tool-calling over certified Atlas capabilities.
 */
export class LlmModule {
  readonly #atlas: Atlas;
  readonly #llmOptions: AtlasLlmOptions;
  readonly #workspace: AtlasWorkspaceOptions;
  readonly #defaultBudget: LlmBudget;
  #injectedProvider: LlmProvider | undefined;
  #resolvedProvider: LlmProvider | undefined;

  constructor(
    _bus: EventBus,
    llmOptions: AtlasLlmOptions = {},
    atlas: Atlas,
    workspace: AtlasWorkspaceOptions = {},
  ) {
    this.#atlas = atlas;
    this.#llmOptions = llmOptions;
    this.#workspace = workspace;
    this.#defaultBudget = llmOptions.budget ?? DEFAULT_BUDGET;
    this.#injectedProvider = llmOptions.provider;
  }

  getContextPrompt(): string | undefined {
    const contextPrompt = this.#llmOptions.contextPrompt;

    return typeof contextPrompt === 'string' && contextPrompt.trim().length > 0
      ? contextPrompt.trim()
      : undefined;
  }

  getWorkspaceName(): string {
    return this.#workspace.name?.trim() || 'default';
  }

  listOrgToolNames(): readonly string[] {
    return listAtlasOrgToolNames();
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

    const contextPackage =
      options.contextPackage ??
      (await AtlasContextBuilder.build({
        goal: normalizedGoal,
        atlas: this.#atlas,
        contextPrompt: this.getContextPrompt(),
        workspace: this.getWorkspaceName(),
        history: options.history,
      }));

    return runToolLoop({
      provider: this.#resolveProvider(),
      systemPrompt: contextPackage.systemPrompt,
      userMessage: normalizedGoal,
      tools: createAtlasToolExecutors(this.#atlas),
      budget: options.budget ?? this.#defaultBudget,
      ...(options.history !== undefined ? { history: options.history } : {}),
    });
  }
}

export type { LlmBudget, LlmMessage, LlmProvider, ToolLoopResult } from '@atlas/llm';
