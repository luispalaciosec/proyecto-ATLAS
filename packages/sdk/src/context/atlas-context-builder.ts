import { normalizeForSearch } from '@atlas/core';
import type { LlmMessage } from '@atlas/llm';

import type { Atlas } from '../atlas/atlas.js';
import type { SearchMemoryContentResult } from '../modules/memory-module.js';
import { ORG_RECORD_TYPE_CLIENT } from '../org/constants.js';
import { readEntityPayload, listRecordsByType } from '../org/entity-resolver.js';
import { evaluateDiscountRequest } from '../org/policy-evaluator.js';
import { formatDiscountEvaluation } from '../org/policy-answer.js';
import { parseClient } from '../org/schemas/client.js';
import { listAtlasOrgToolNames } from '../org/org-llm-tools.js';
import {
  CONTEXT_SYSTEM_PROMPT_MAX_LENGTH,
  KNOWLEDGE_CONTEXT_RECORD_LIMIT,
  KNOWLEDGE_CONTEXT_SNIPPET_MAX_LENGTH,
  KNOWLEDGE_PREFETCH_MIN_TOKEN_LENGTH,
  KNOWLEDGE_PREFETCH_STOPWORDS,
  ORG_CONTEXT_SNIPPET_MAX_LENGTH,
} from './context-limits.js';
import {
  enforceContextBlockLimit,
  extractKnowledgeRecordText,
  truncateContextSnippet,
} from './context-text.js';

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
  'For organizational questions (discounts, clients, policies, decisions, evidence, warranties),',
  'use the certified org_* tools — they delegate to OrgMemoryModule and return authoritative,',
  'policy-aware results. Do not guess discount limits, approver roles, or policy versions when',
  'org_evaluate_discount, org_resolve_policy, or org_resolve_decision can answer authoritatively.',
].join(' ');

export type ContextSourceKind =
  'system' | 'brand' | 'knowledge' | 'organizational' | 'conversation';

export interface ContextSource {
  readonly kind: ContextSourceKind;
  readonly label: string;
  readonly recordIds?: readonly string[];
}

export interface AtlasContextRetrievalSummary {
  readonly selected: number;
  readonly totalCandidates: number;
  readonly recordIds: readonly string[];
  readonly priorGoals: readonly string[];
}

export interface AtlasContextPackage {
  readonly goal: string;
  readonly workspace: string;
  readonly systemPrompt: string;
  readonly sources: readonly ContextSource[];
  readonly retrieval: AtlasContextRetrievalSummary;
  readonly orgToolsAvailable: readonly string[];
  readonly history?: readonly LlmMessage[];
}

export interface AtlasContextBuildOptions {
  readonly goal: string;
  readonly atlas: Atlas;
  readonly workspace?: string;
  readonly contextPrompt?: string;
  readonly history?: readonly LlmMessage[];
}

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
    const result = await atlas.retrieval.searchContent({
      query,
      limit: KNOWLEDGE_CONTEXT_RECORD_LIMIT,
    });

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

function buildKnowledgeContextBlock(
  goal: string,
  searchResult: SearchMemoryContentResult,
): { readonly block: string; readonly recordIds: readonly string[] } {
  const lines = [
    'Fresh knowledge retrieval for this turn (automatic — current ground truth):',
    `Search query: ${goal}`,
    `Matching records: ${searchResult.total}`,
  ];
  const recordIds: string[] = [];

  if (searchResult.total === 0) {
    lines.push('No matching knowledge records were found for this question.');
    return Object.freeze({
      block: lines.join('\n'),
      recordIds: Object.freeze([]),
    });
  }

  for (const [index, record] of searchResult.records
    .slice(0, KNOWLEDGE_CONTEXT_RECORD_LIMIT)
    .entries()) {
    const recordType =
      typeof record.type === 'string' && record.type.trim().length > 0 ? record.type : 'unknown';
    recordIds.push(record.id);
    lines.push(`--- Record ${index + 1} (${recordType}, id: ${record.id}) ---`);
    lines.push(
      truncateContextSnippet(
        extractKnowledgeRecordText(record.content),
        KNOWLEDGE_CONTEXT_SNIPPET_MAX_LENGTH,
      ),
    );
  }

  if (searchResult.total > KNOWLEDGE_CONTEXT_RECORD_LIMIT) {
    lines.push(
      `(… ${searchResult.total - KNOWLEDGE_CONTEXT_RECORD_LIMIT} additional matching records omitted)`,
    );
  }

  return Object.freeze({
    block: lines.join('\n'),
    recordIds: Object.freeze(recordIds),
  });
}

const ORG_CONTEXT_KEYWORDS = Object.freeze([
  'descuento',
  'discount',
  'garantia',
  'garantía',
  'warranty',
  'politica',
  'política',
  'policy',
  'cliente',
  'client',
  'decision',
  'decisión',
  'aprobacion',
  'aprobación',
  'approval',
  'vip',
  'segmento',
  'segment',
]);

function requiresOrganizationalContext(goal: string): boolean {
  const normalized = normalizeForSearch(goal);

  return ORG_CONTEXT_KEYWORDS.some((keyword) => normalized.includes(normalizeForSearch(keyword)));
}

function goalMentionsClient(goal: string, legalName: string): boolean {
  const normalizedGoal = normalizeForSearch(goal);
  const normalizedName = normalizeForSearch(legalName);

  return normalizedName.length > 0 && normalizedGoal.includes(normalizedName);
}

async function prefetchOrganizationalContext(
  atlas: Atlas,
  goal: string,
): Promise<{ readonly block: string; readonly sources: readonly ContextSource[] } | undefined> {
  if (!requiresOrganizationalContext(goal)) {
    return undefined;
  }

  const lines = ['Organizational intelligence context (automatic prefetch):'];
  const sources: ContextSource[] = [];
  const clients = await listRecordsByType(atlas, ORG_RECORD_TYPE_CLIENT);
  const percentMatch = goal.match(/(\d+(?:[.,]\d+)?)\s*%/);
  const requestedPercent =
    percentMatch !== null ? Number.parseFloat(percentMatch[1]?.replace(',', '.') ?? '') : undefined;

  if (requestedPercent !== undefined && Number.isFinite(requestedPercent)) {
    for (const record of clients) {
      const client = parseClient(readEntityPayload(record));

      if (!goalMentionsClient(goal, client.legalName)) {
        continue;
      }

      try {
        const evaluation = await evaluateDiscountRequest(atlas, client.legalName, requestedPercent);
        lines.push(formatDiscountEvaluation(evaluation));
        sources.push(
          Object.freeze({
            kind: 'organizational',
            label: `discount-evaluation:${client.legalName}`,
            recordIds: Object.freeze([record.id]),
          }),
        );
      } catch {
        // Optional enrichment when org graph is incomplete.
      }
    }
  }

  if (sources.length === 0) {
    for (const record of clients) {
      const client = parseClient(readEntityPayload(record));

      if (!goalMentionsClient(goal, client.legalName)) {
        continue;
      }

      lines.push(
        `Cliente conocido: ${client.legalName} (${client.segment}, renovación ${client.renewalActive ? 'activa' : 'inactiva'}).`,
      );
      sources.push(
        Object.freeze({
          kind: 'organizational',
          label: `client:${client.legalName}`,
          recordIds: Object.freeze([record.id]),
        }),
      );
    }
  }

  if (sources.length === 0) {
    return undefined;
  }

  return Object.freeze({
    block: truncateContextSnippet(lines.join('\n'), ORG_CONTEXT_SNIPPET_MAX_LENGTH),
    sources: Object.freeze(sources),
  });
}

function renderSystemPrompt(sections: readonly string[]): string {
  const joined = sections
    .map((section) => section.trim())
    .filter((section) => section.length > 0)
    .join('\n\n---\n\n');

  return enforceContextBlockLimit(joined, CONTEXT_SYSTEM_PROMPT_MAX_LENGTH);
}

export class AtlasContextBuilder {
  static async build(options: AtlasContextBuildOptions): Promise<AtlasContextPackage> {
    const normalizedGoal = options.goal.trim();
    const workspace = options.workspace?.trim() || 'default';

    if (normalizedGoal.length === 0) {
      throw new Error('Goal must not be empty');
    }

    const sources: ContextSource[] = [
      Object.freeze({
        kind: 'system',
        label: 'atlas-system-prompt',
      }),
    ];

    const sections = [SYSTEM_PROMPT];
    const knowledgeSearch = await prefetchKnowledgeForGoal(options.atlas, normalizedGoal);
    const knowledgeBlock = buildKnowledgeContextBlock(normalizedGoal, knowledgeSearch);

    sections.push(knowledgeBlock.block);
    sources.push(
      Object.freeze({
        kind: 'knowledge',
        label: 'retrieval-prefetch',
        recordIds: knowledgeBlock.recordIds,
      }),
    );

    const orgContext = await prefetchOrganizationalContext(options.atlas, normalizedGoal);

    if (orgContext !== undefined) {
      sections.push(orgContext.block);
      sources.push(...orgContext.sources);
    }

    if (typeof options.contextPrompt === 'string' && options.contextPrompt.trim().length > 0) {
      sections.push(options.contextPrompt.trim());
      sources.push(
        Object.freeze({
          kind: 'brand',
          label: 'brand-workspace-context',
        }),
      );
    }

    if (options.history !== undefined && options.history.length > 0) {
      sources.push(
        Object.freeze({
          kind: 'conversation',
          label: `recent-turns:${options.history.length}`,
        }),
      );
    }

    const priorGoals = Object.freeze(
      knowledgeSearch.records
        .slice(0, KNOWLEDGE_CONTEXT_RECORD_LIMIT)
        .map((record) =>
          truncateContextSnippet(
            extractKnowledgeRecordText(record.content),
            KNOWLEDGE_CONTEXT_SNIPPET_MAX_LENGTH,
          ),
        ),
    );

    return Object.freeze({
      goal: normalizedGoal,
      workspace,
      systemPrompt: renderSystemPrompt(sections),
      sources: Object.freeze(sources),
      retrieval: Object.freeze({
        selected: knowledgeSearch.total,
        totalCandidates: knowledgeSearch.total,
        recordIds: knowledgeBlock.recordIds,
        priorGoals,
      }),
      orgToolsAvailable: listAtlasOrgToolNames(),
      ...(options.history !== undefined ? { history: options.history } : {}),
    });
  }
}

export { SYSTEM_PROMPT as ATLAS_LLM_SYSTEM_PROMPT };
