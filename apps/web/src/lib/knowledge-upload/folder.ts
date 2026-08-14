import { KnowledgeUploadError } from './upload-errors.js';

export const DEFAULT_KNOWLEDGE_FOLDER = 'General';

const MAX_FOLDER_LENGTH = 80;

export function normalizeKnowledgeFolder(value: unknown): string {
  if (typeof value !== 'string') {
    return DEFAULT_KNOWLEDGE_FOLDER;
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return DEFAULT_KNOWLEDGE_FOLDER;
  }

  return trimmed.slice(0, MAX_FOLDER_LENGTH);
}

export function assertValidKnowledgeFolder(folder: string): void {
  if (folder.includes('/') || folder.includes('\\')) {
    throw new KnowledgeUploadError(
      400,
      'El nombre de la carpeta no puede incluir barras (/ o \\).',
    );
  }
}

export function resolveKnowledgeFolder(value: unknown): string {
  const folder = normalizeKnowledgeFolder(value);
  assertValidKnowledgeFolder(folder);
  return folder;
}

export function documentFolderMatchesFilter(
  documentFolder: string | undefined,
  folderFilter: string | undefined,
): boolean {
  if (folderFilter === undefined || folderFilter === 'all') {
    return true;
  }

  const normalizedDocumentFolder = normalizeKnowledgeFolder(documentFolder);

  if (folderFilter === DEFAULT_KNOWLEDGE_FOLDER) {
    return normalizedDocumentFolder === DEFAULT_KNOWLEDGE_FOLDER;
  }

  return normalizedDocumentFolder === folderFilter;
}
