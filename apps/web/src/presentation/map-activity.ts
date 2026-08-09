import { t, workspaceDisplayName } from '../i18n/index.js';

export type ActivityItemType = 'conversation' | 'knowledge' | 'correction' | 'error';

export type ActivityItemStatus = 'success' | 'info' | 'warning' | 'error';

export type ActivityActionKind = 'open-chat' | 'open-knowledge' | 'retry-chat';

export interface ActivityActionProduct {
  readonly kind: ActivityActionKind;
  readonly label: string;
  readonly draft?: string;
}

export interface ActivityItemProduct {
  readonly id: string;
  readonly type: ActivityItemType;
  readonly title: string;
  readonly description?: string;
  readonly occurredAt: string;
  readonly workspace: string;
  readonly workspaceName: string;
  readonly status: ActivityItemStatus;
  readonly quote?: string;
  readonly action?: ActivityActionProduct;
  readonly technicalDetails?: string;
}

export interface ActivityResponseProduct {
  readonly workspace: string;
  readonly scopeNote: string;
  readonly items: readonly ActivityItemProduct[];
}

export interface RawActivityEvent {
  readonly id: string;
  readonly kind: ActivityItemType;
  readonly workspace: string;
  readonly occurredAt: string;
  readonly status: ActivityItemStatus;
  readonly goal?: string;
  readonly query?: string;
  readonly correction?: string;
  readonly mode?: 'llm' | 'deterministic';
  readonly success?: boolean;
  readonly llmTurns?: number;
  readonly retrievalSelected?: number;
  readonly retrievalTotal?: number;
  readonly resultsTotal?: number;
  readonly correctionStatus?: string;
  readonly errorMessage?: string;
  readonly recordId?: string;
}

function truncate(text: string, maxLength: number): string {
  const trimmed = text.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1).trim()}…`;
}

function conversationDescription(event: RawActivityEvent): string | undefined {
  if (event.kind !== 'conversation') {
    return undefined;
  }

  if (event.success === false) {
    return t('activity.conversationFailedBody');
  }

  if (event.mode === 'llm') {
    if (event.llmTurns !== undefined && event.llmTurns > 1) {
      return t('activity.conversationUsedKnowledge');
    }

    return t('activity.conversationLlmBody');
  }

  if (event.mode === 'deterministic') {
    if (event.retrievalSelected !== undefined && event.retrievalSelected > 0) {
      return t('activity.conversationUsedBrandKnowledge');
    }

    return t('activity.conversationDeterministicBody');
  }

  return undefined;
}

function knowledgeDescription(event: RawActivityEvent): string | undefined {
  if (event.kind !== 'knowledge' || event.resultsTotal === undefined) {
    return undefined;
  }

  if (event.resultsTotal === 0) {
    return t('activity.knowledgeNoResults');
  }

  if (event.resultsTotal === 1) {
    return t('activity.knowledgeOneResult');
  }

  return t('activity.knowledgeManyResults', { count: event.resultsTotal });
}

function mapEventToItem(event: RawActivityEvent): ActivityItemProduct {
  const workspaceName = workspaceDisplayName(event.workspace);
  const quote =
    event.goal !== undefined
      ? truncate(event.goal, 160)
      : event.query !== undefined
        ? truncate(event.query, 160)
        : event.correction !== undefined
          ? truncate(event.correction, 160)
          : undefined;

  let title = t('activity.genericTitle');
  let description: string | undefined;
  let action: ActivityActionProduct | undefined;
  let technicalDetails: string | undefined;

  switch (event.kind) {
    case 'conversation':
      title =
        event.success === false
          ? t('activity.conversationFailedTitle')
          : t('activity.conversationTitle');
      description = conversationDescription(event);
      action = {
        kind: 'open-chat',
        label: t('activity.viewConversation'),
      };
      break;
    case 'knowledge':
      title = t('activity.knowledgeTitle');
      description = knowledgeDescription(event);
      action = {
        kind: 'open-knowledge',
        label: t('activity.viewKnowledge'),
        ...(event.query !== undefined ? { draft: event.query } : {}),
      };
      break;
    case 'correction':
      title = t('activity.correctionTitle');
      description = t('activity.correctionBody');
      action = {
        kind: 'open-chat',
        label: t('activity.viewConversation'),
      };
      if (event.recordId !== undefined) {
        technicalDetails = event.recordId;
      }
      break;
    case 'error':
      title = t('activity.eventErrorTitle');
      description = t('activity.errorBody');
      if (event.goal !== undefined) {
        action = {
          kind: 'retry-chat',
          label: t('common.retry'),
          draft: event.goal,
        };
      }
      if (event.errorMessage !== undefined) {
        technicalDetails = event.errorMessage;
      }
      break;
  }

  return {
    id: event.id,
    type: event.kind,
    title,
    ...(description !== undefined ? { description } : {}),
    occurredAt: event.occurredAt,
    workspace: event.workspace,
    workspaceName,
    status: event.status,
    ...(quote !== undefined ? { quote } : {}),
    ...(action !== undefined ? { action } : {}),
    ...(technicalDetails !== undefined ? { technicalDetails } : {}),
  };
}

export function mapActivityEventsToProduct(
  workspaceKey: string | undefined,
  events: readonly RawActivityEvent[],
  options?: { limit?: number; type?: ActivityItemType },
): ActivityResponseProduct {
  const workspace = workspaceKey?.trim() || 'default';
  let filtered = events.filter((event) => event.workspace === workspace);

  if (options?.type !== undefined) {
    filtered = filtered.filter((event) => event.kind === options.type);
  }

  const sorted = [...filtered].sort(
    (left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt),
  );

  const limit = options?.limit ?? 50;
  const limited = sorted.slice(0, Math.max(1, Math.min(limit, 100)));

  return {
    workspace,
    scopeNote: t('activity.scopeNote'),
    items: limited.map(mapEventToItem),
  };
}

export function groupActivityItemsByDate(
  items: readonly ActivityItemProduct[],
): Array<{ readonly label: string; readonly items: readonly ActivityItemProduct[] }> {
  const groups = new Map<string, ActivityItemProduct[]>();

  for (const item of items) {
    const label = formatActivityDateLabel(item.occurredAt);
    const existing = groups.get(label) ?? [];
    existing.push(item);
    groups.set(label, existing);
  }

  return [...groups.entries()].map(([label, groupItems]) => ({
    label,
    items: groupItems,
  }));
}

export function formatActivityTime(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString('es', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatActivityDateLabel(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return t('activity.dateUnknown');
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86_400_000);

  if (diffDays === 0) {
    return t('activity.today');
  }

  if (diffDays === 1) {
    return t('activity.yesterday');
  }

  return date.toLocaleDateString('es', {
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  });
}
