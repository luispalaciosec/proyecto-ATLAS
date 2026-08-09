export interface HistoryMessageProduct {
  readonly id: string;
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly createdAt: string;
}

export interface HistoryResponseProduct {
  readonly workspace: string;
  readonly messages: readonly HistoryMessageProduct[];
  readonly canCorrect: boolean;
}

interface RawHistoryMessage {
  readonly role: string;
  readonly content: string;
}

export function mapSessionHistoryToProduct(
  workspace: string,
  messages: readonly RawHistoryMessage[],
  canCorrect: boolean,
): HistoryResponseProduct {
  const baseTime = Date.parse('2026-01-01T00:00:00.000Z');
  let index = 0;

  const mapped = messages
    .filter(
      (message) =>
        (message.role === 'user' || message.role === 'assistant') &&
        message.content.trim().length > 0,
    )
    .map((message) => {
      const entry: HistoryMessageProduct = {
        id: `hist.${workspace}.${index}.${message.role}`,
        role: message.role as 'user' | 'assistant',
        content: message.content.trim(),
        createdAt: new Date(baseTime + index * 1000).toISOString(),
      };
      index += 1;
      return entry;
    });

  return {
    workspace,
    messages: mapped,
    canCorrect: canCorrect && mapped.some((message) => message.role === 'assistant'),
  };
}
