import type { ToolExecutor } from '@atlas/llm';

import type { Atlas } from '../atlas/atlas.js';
import {
  extractKnowledgeRecordText,
  KNOWLEDGE_CONTEXT_RECORD_LIMIT,
  KNOWLEDGE_CONTEXT_SNIPPET_MAX_LENGTH,
  truncateContextSnippet,
} from '../context/index.js';
import { createOrgLlmToolExecutors, listAtlasOrgToolNames } from '../org/org-llm-tools.js';
import { planExecuteAndRemember } from '../plan/plan-execution-memory.js';

function asString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }

  return value.trim();
}

function createMemoryAndPlanToolExecutors(atlas: Atlas): readonly ToolExecutor[] {
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
        const result = await atlas.retrieval.searchContent({ query });
        const limitedRecords = result.records.slice(0, KNOWLEDGE_CONTEXT_RECORD_LIMIT);

        return JSON.stringify(
          Object.freeze({
            total: result.total,
            query: result.query,
            records: limitedRecords.map((record) =>
              Object.freeze({
                id: record.id,
                type: record.type,
                content: truncateContextSnippet(
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
  ]);
}

export function createAtlasToolExecutors(atlas: Atlas): readonly ToolExecutor[] {
  return Object.freeze([
    ...createMemoryAndPlanToolExecutors(atlas),
    ...createOrgLlmToolExecutors(atlas),
  ]);
}

export function listAtlasToolNames(atlas: Atlas): readonly string[] {
  return Object.freeze(createAtlasToolExecutors(atlas).map((tool) => tool.definition.name));
}

export { listAtlasOrgToolNames };
