/**
 * Source label prepended to every uploaded knowledge fragment, so the model sees which
 * document (and which part) each snippet comes from: "[Documento: <archivo> · fragmento i/n]".
 */

/** File names longer than this are shortened in the label (metadata keeps the full name). */
export const KNOWLEDGE_CHUNK_LABEL_FILE_NAME_MAX = 80;

/** Worst case for "i/n": up to 99999 fragments (far above what a 15MB upload produces). */
const KNOWLEDGE_CHUNK_LABEL_MAX_FRAGMENTS = 99_999;

function shortenFileName(fileName: string): string {
  const trimmed = fileName.trim();

  return trimmed.length <= KNOWLEDGE_CHUNK_LABEL_FILE_NAME_MAX
    ? trimmed
    : `${trimmed.slice(0, KNOWLEDGE_CHUNK_LABEL_FILE_NAME_MAX - 1)}…`;
}

/** `index` is 0-based; the label shows it 1-based. */
export function formatKnowledgeChunkLabel(fileName: string, index: number, total: number): string {
  return `[Documento: ${shortenFileName(fileName)} · fragmento ${index + 1}/${total}]`;
}

/** Longest possible label: longest file name and the largest fragment numbers. */
export const KNOWLEDGE_CHUNK_LABEL_MAX_LENGTH = formatKnowledgeChunkLabel(
  'x'.repeat(KNOWLEDGE_CHUNK_LABEL_FILE_NAME_MAX),
  KNOWLEDGE_CHUNK_LABEL_MAX_FRAGMENTS - 1,
  KNOWLEDGE_CHUNK_LABEL_MAX_FRAGMENTS,
).length;

export function labelKnowledgeChunk(
  fileName: string,
  index: number,
  total: number,
  text: string,
): string {
  return `${formatKnowledgeChunkLabel(fileName, index, total)}\n${text}`;
}
