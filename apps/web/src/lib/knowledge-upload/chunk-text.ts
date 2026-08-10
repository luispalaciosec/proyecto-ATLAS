import { KNOWLEDGE_CHUNK_MAX_CHARS } from './constants.js';

export function chunkText(
  text: string,
  maxChars: number = KNOWLEDGE_CHUNK_MAX_CHARS,
): readonly string[] {
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return [];
  }

  if (trimmed.length <= maxChars) {
    return [trimmed];
  }

  const chunks: string[] = [];
  let remaining = trimmed;

  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      chunks.push(remaining.trim());
      break;
    }

    let splitAt = remaining.lastIndexOf('\n\n', maxChars);

    if (splitAt < maxChars * 0.5) {
      splitAt = remaining.lastIndexOf('\n', maxChars);
    }

    if (splitAt < maxChars * 0.5) {
      splitAt = remaining.lastIndexOf(' ', maxChars);
    }

    if (splitAt <= 0) {
      splitAt = maxChars;
    }

    const chunk = remaining.slice(0, splitAt).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    remaining = remaining.slice(splitAt).trimStart();
  }

  return chunks.filter((chunk) => chunk.length > 0);
}
