export function extractKnowledgeRecordText(content: unknown): string {
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

export function truncateContextSnippet(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trim()}…`;
}

export function enforceContextBlockLimit(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trim()}…`;
}
