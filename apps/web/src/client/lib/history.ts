import type { HistoryMessageProduct } from '../../presentation/map-history.js';
import type { UiChatMessage } from '../state/app-state.js';

export function mapHistoryMessagesToUi(
  messages: readonly HistoryMessageProduct[],
): UiChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    kind: message.role === 'user' ? 'user' : 'assistant',
    text: message.content,
    markdown: message.role === 'assistant',
  }));
}

export interface RecentConversationEntry {
  readonly id: string;
  readonly title: string;
  readonly brandName: string;
}

function truncateConversationTitle(text: string): string {
  if (text.length <= 72) {
    return text;
  }

  return `${text.slice(0, 69)}…`;
}

export function deriveRecentConversationTitle(
  messages: readonly HistoryMessageProduct[],
): string | undefined {
  const lastUser = [...messages].reverse().find((message) => message.role === 'user');

  if (lastUser === undefined) {
    return undefined;
  }

  return truncateConversationTitle(lastUser.content.trim());
}

export function deriveRecentConversationEntries(
  messages: readonly HistoryMessageProduct[],
  brandName: string,
  limit = 3,
): RecentConversationEntry[] {
  const userMessages = messages.filter(
    (message) => message.role === 'user' && message.content.trim().length > 0,
  );

  return userMessages
    .slice(-limit)
    .reverse()
    .map((message) => ({
      id: message.id,
      title: truncateConversationTitle(message.content.trim()),
      brandName,
    }));
}
