import { normalizeKnowledgeFolder } from '../../lib/knowledge-upload/folder.js';

export type KnowledgeDuplicateMatchKind = 'exact' | 'similar';

export interface KnowledgeDuplicateDocumentRef {
  readonly fileName: string;
  readonly folder: string;
  readonly chunks: number;
}

export interface KnowledgeDuplicateMatch {
  readonly kind: KnowledgeDuplicateMatchKind;
  readonly existingFileName: string;
  readonly chunks: number;
}

export function normalizeKnowledgeFileBase(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^.]+$/i, '').trim().toLowerCase();

  let normalized = withoutExtension
    .replace(/[_\-.]+/g, ' ')
    .replace(/\bv(\d+)\b/gi, '')
    .replace(/\b(19|20)\d{2}\b/g, '')
    .replace(/\b\d{1,2}[_\-.]\d{1,2}[_\-.]\d{2,4}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  normalized = normalized.replace(/(?:\s|_|-)\d+$/g, '').trim();

  return normalized;
}

function documentMatchesFolder(documentFolder: string | undefined, targetFolder: string): boolean {
  return normalizeKnowledgeFolder(documentFolder) === normalizeKnowledgeFolder(targetFolder);
}

export function findKnowledgeDuplicateMatch(
  fileName: string,
  documents: readonly KnowledgeDuplicateDocumentRef[],
  folder: string,
): KnowledgeDuplicateMatch | undefined {
  const normalizedTarget = normalizeKnowledgeFolder(folder);
  const scoped = documents.filter((document) => documentMatchesFolder(document.folder, normalizedTarget));

  const exact = scoped.find(
    (document) => document.fileName.localeCompare(fileName, undefined, { sensitivity: 'accent' }) === 0,
  );

  if (exact !== undefined) {
    return {
      kind: 'exact',
      existingFileName: exact.fileName,
      chunks: exact.chunks,
    };
  }

  const incomingBase = normalizeKnowledgeFileBase(fileName);

  if (incomingBase.length < 3) {
    return undefined;
  }

  const similar = scoped.find((document) => {
    if (document.fileName.localeCompare(fileName, undefined, { sensitivity: 'accent' }) === 0) {
      return false;
    }

    return normalizeKnowledgeFileBase(document.fileName) === incomingBase;
  });

  if (similar === undefined) {
    return undefined;
  }

  return {
    kind: 'similar',
    existingFileName: similar.fileName,
    chunks: similar.chunks,
  };
}
