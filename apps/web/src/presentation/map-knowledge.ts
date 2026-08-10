import { t, workspaceDisplayName } from '../i18n/index.js';

export interface KnowledgeRecordProduct {
  readonly id: string;
  readonly title: string;
  readonly snippet: string;
  readonly typeLabel: string;
  readonly contextLabel: string;
  readonly sourceLabel: string;
  readonly createdAt?: string;
}

export interface KnowledgeSearchResponseProduct {
  readonly workspace: string;
  readonly query: string;
  readonly total: number;
  readonly records: readonly KnowledgeRecordProduct[];
}

interface RawMemoryRecord {
  readonly id: string;
  readonly type?: string;
  readonly content?: unknown;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly timestamp?: string;
}

interface RawSearchResult {
  readonly query: string;
  readonly total: number;
  readonly records: readonly RawMemoryRecord[];
}

const SNIPPET_MAX_LENGTH = 280;
const TITLE_MAX_LENGTH = 72;

function extractText(content: unknown): string {
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

  if (content === undefined || content === null) {
    return '';
  }

  try {
    return JSON.stringify(content);
  } catch {
    return String(content);
  }
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trim()}…`;
}

function firstMeaningfulLine(text: string): string {
  const line = text
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .find((entry) => entry.length > 0);

  return line ?? text.trim();
}

function mapRecordTypeLabel(recordType: string | undefined): string {
  switch (recordType) {
    case 'PlanExecution':
      return t('knowledge.typePlan');
    case 'Feedback':
      return t('knowledge.typeFeedback');
    case 'CliMemory':
    case 'Note':
      return t('knowledge.typeNote');
    case 'document':
      return t('knowledge.typeDocument');
    default:
      return recordType !== undefined && recordType.trim().length > 0
        ? recordType
        : t('knowledge.typeNote');
  }
}

function deriveTitle(text: string, typeLabel: string): string {
  const line = firstMeaningfulLine(text);

  if (line.length === 0) {
    return typeLabel;
  }

  return truncate(line, TITLE_MAX_LENGTH);
}

function buildSourceLabel(workspace: string): string {
  if (workspace === 'default') {
    return t('knowledge.sourceGeneral');
  }

  return t('knowledge.sourceBrand', { name: workspaceDisplayName(workspace) });
}

function mapRecordToProduct(
  workspace: string,
  record: RawMemoryRecord,
): KnowledgeRecordProduct | undefined {
  const text = extractText(record.content);

  if (text.length === 0) {
    return undefined;
  }

  const typeLabel = mapRecordTypeLabel(record.type);
  const title = deriveTitle(text, typeLabel);
  const contextLabel = workspaceDisplayName(workspace);
  const createdAt =
    typeof record.timestamp === 'string' && record.timestamp.trim().length > 0
      ? record.timestamp
      : undefined;

  return {
    id: record.id,
    title,
    snippet: truncate(text, SNIPPET_MAX_LENGTH),
    typeLabel,
    contextLabel,
    sourceLabel: buildSourceLabel(workspace),
    ...(createdAt !== undefined ? { createdAt } : {}),
  };
}

export function mapKnowledgeSearchToProduct(
  workspaceKey: string | undefined,
  result: RawSearchResult,
): KnowledgeSearchResponseProduct {
  const workspace = workspaceKey?.trim() || 'default';
  const records = result.records
    .map((record) => mapRecordToProduct(workspace, record))
    .filter((record): record is KnowledgeRecordProduct => record !== undefined);

  return {
    workspace,
    query: result.query,
    total: records.length,
    records,
  };
}

export function buildKnowledgeConversationPrompt(
  record: KnowledgeRecordProduct,
  query?: string,
): string {
  const trimmedQuery = query?.trim() ?? '';

  if (trimmedQuery.length > 0) {
    return t('knowledge.chatPromptFromQuery', { query: trimmedQuery });
  }

  const subject = firstMeaningfulLine(record.title);

  if (subject.length > 0 && subject !== record.typeLabel) {
    return t('knowledge.chatPromptFromRecord', { subject });
  }

  return t('knowledge.chatPromptGeneric', { subject: record.snippet.slice(0, 80) });
}

export function buildKnowledgeSearchChatPrompt(query: string): string {
  return t('knowledge.chatPromptFromQuery', { query: query.trim() });
}
