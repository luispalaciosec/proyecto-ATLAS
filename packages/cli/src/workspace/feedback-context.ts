import { createAtlas } from '@atlas/sdk';

const DEFAULT_LIMIT = 5;

interface FeedbackRecordShape {
  readonly content: unknown;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly timestamp: string;
}

function extractRecordText(record: FeedbackRecordShape): string {
  if (typeof record.content === 'string') {
    return record.content;
  }

  if (
    record.content !== null &&
    typeof record.content === 'object' &&
    'text' in record.content &&
    typeof (record.content as { text?: unknown }).text === 'string'
  ) {
    return (record.content as { text: string }).text;
  }

  return JSON.stringify(record.content);
}

function renderFeedbackRecord(record: FeedbackRecordShape): string {
  const metadata = record.metadata ?? {};
  const goal =
    typeof metadata.originalGoal === 'string' ? metadata.originalGoal : '(unknown goal)';
  const correction = extractRecordText(record);

  return `- When asked "${goal}", the correction was: ${correction}`;
}

export function combineBrandContextPrompt(profileContext: string, feedbackContext: string): string {
  if (feedbackContext.trim().length === 0) {
    return profileContext;
  }

  return `${profileContext}\n\n---\n\n${feedbackContext}`;
}

export async function loadRecentFeedbackContext(
  memoryFilePath: string,
  limit: number = DEFAULT_LIMIT,
): Promise<string> {
  const client = createAtlas({
    workspace: { name: 'feedback-probe' },
    memory: { storageFilePath: memoryFilePath },
  });

  const result = await client.memory.searchContent({
    query: '',
    recordType: 'Feedback',
  });

  if (result.total === 0) {
    return '';
  }

  const recent = result.records
    .map((record, index) => ({ record, index }))
    .sort((left, right) => {
      const byTimestamp = right.record.timestamp.localeCompare(left.record.timestamp);

      if (byTimestamp !== 0) {
        return byTimestamp;
      }

      // Timestamps iguales (colisión de resolución de milisegundo): el insertado
      // después se considera más reciente.
      return right.index - left.index;
    })
    .slice(0, limit)
    .map(({ record }) => record);

  const lines = recent.map((record) => renderFeedbackRecord(record));

  return `Known corrections from previous sessions:\n\n${lines.join('\n\n')}`;
}
