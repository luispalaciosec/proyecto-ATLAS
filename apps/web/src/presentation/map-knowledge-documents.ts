import { t } from '../i18n/index.js';
import {
  DEFAULT_KNOWLEDGE_FOLDER,
  documentFolderMatchesFilter,
  normalizeKnowledgeFolder,
} from '../lib/knowledge-upload/folder.js';

export interface KnowledgeDocumentProduct {
  readonly documentId: string;
  readonly fileName: string;
  readonly fileType: string;
  readonly folder: string;
  readonly chunks: number;
  readonly uploadedAt: string;
  readonly recordIds: readonly string[];
}

export interface KnowledgeDocumentsResponseProduct {
  readonly workspace: string;
  readonly folder?: string;
  readonly folders: readonly string[];
  readonly total: number;
  readonly documents: readonly KnowledgeDocumentProduct[];
}

interface RawMemoryRecord {
  readonly id: string;
  readonly type?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly timestamp?: string;
}

function readMetadataString(
  metadata: Readonly<Record<string, unknown>> | undefined,
  key: string,
): string | undefined {
  const value = metadata?.[key];

  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function readMetadataNumber(
  metadata: Readonly<Record<string, unknown>> | undefined,
  key: string,
): number | undefined {
  const value = metadata?.[key];

  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function resolveDocumentGroupKey(record: RawMemoryRecord): string | undefined {
  const metadata = record.metadata;
  const source = readMetadataString(metadata, 'source');

  if (source !== 'upload') {
    return undefined;
  }

  const fileName = readMetadataString(metadata, 'fileName');

  if (fileName === undefined) {
    return undefined;
  }

  const documentId = readMetadataString(metadata, 'documentId');

  if (documentId !== undefined) {
    return documentId;
  }

  const uploadedAt = readMetadataString(metadata, 'uploadedAt');

  if (uploadedAt !== undefined) {
    return `${fileName}::${uploadedAt}`;
  }

  return fileName;
}

function resolveUploadedAt(record: RawMemoryRecord, metadataUploadedAt?: string): string {
  if (metadataUploadedAt !== undefined) {
    return metadataUploadedAt;
  }

  if (typeof record.timestamp === 'string' && record.timestamp.trim().length > 0) {
    return record.timestamp;
  }

  return new Date(0).toISOString();
}

export function aggregateKnowledgeDocuments(
  records: readonly RawMemoryRecord[],
): readonly KnowledgeDocumentProduct[] {
  const grouped = new Map<string, KnowledgeDocumentProduct>();

  for (const record of records) {
    const groupKey = resolveDocumentGroupKey(record);

    if (groupKey === undefined) {
      continue;
    }

    const metadata = record.metadata;
    const fileName = readMetadataString(metadata, 'fileName') ?? 'Documento';
    const fileType = readMetadataString(metadata, 'fileType') ?? 'txt';
    const folder = normalizeKnowledgeFolder(readMetadataString(metadata, 'folder'));
    const uploadedAt = resolveUploadedAt(record, readMetadataString(metadata, 'uploadedAt'));
    const documentId = readMetadataString(metadata, 'documentId') ?? groupKey;
    const totalChunks = readMetadataNumber(metadata, 'totalChunks');
    const existing = grouped.get(groupKey);

    if (existing === undefined) {
      grouped.set(
        groupKey,
        Object.freeze({
          documentId,
          fileName,
          fileType,
          folder,
          chunks: 1,
          uploadedAt,
          recordIds: Object.freeze([record.id]),
        }),
      );
      continue;
    }

    grouped.set(
      groupKey,
      Object.freeze({
        ...existing,
        chunks:
          totalChunks !== undefined
            ? Math.max(existing.chunks + 1, totalChunks)
            : existing.chunks + 1,
        recordIds: Object.freeze([...existing.recordIds, record.id]),
        uploadedAt:
          uploadedAt.localeCompare(existing.uploadedAt) > 0 ? uploadedAt : existing.uploadedAt,
      }),
    );
  }

  return Object.freeze(
    [...grouped.values()]
      .map((document) =>
        Object.freeze({
          ...document,
          chunks: document.chunks,
        }),
      )
      .sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt)),
  );
}

function collectFolders(documents: readonly KnowledgeDocumentProduct[]): readonly string[] {
  const folderSet = new Set<string>([DEFAULT_KNOWLEDGE_FOLDER]);

  for (const document of documents) {
    folderSet.add(document.folder);
  }

  return Object.freeze(
    [...folderSet].sort((left, right) => {
      if (left === DEFAULT_KNOWLEDGE_FOLDER) {
        return -1;
      }

      if (right === DEFAULT_KNOWLEDGE_FOLDER) {
        return 1;
      }

      return left.localeCompare(right, 'es');
    }),
  );
}

export function mapKnowledgeDocumentsToProduct(
  workspaceKey: string | undefined,
  records: readonly RawMemoryRecord[],
  folderFilter?: string,
): KnowledgeDocumentsResponseProduct {
  const workspace = workspaceKey?.trim() || 'default';
  const allDocuments = aggregateKnowledgeDocuments(records);
  const folders = collectFolders(allDocuments);
  const documents = Object.freeze(
    allDocuments.filter((document) => documentFolderMatchesFilter(document.folder, folderFilter)),
  );

  return Object.freeze({
    workspace,
    ...(folderFilter !== undefined && folderFilter !== 'all' ? { folder: folderFilter } : {}),
    folders,
    total: documents.length,
    documents,
  });
}

export function formatKnowledgeDocumentDate(isoDate: string): string {
  const parsed = Date.parse(isoDate);

  if (Number.isNaN(parsed)) {
    return isoDate;
  }

  return new Intl.DateTimeFormat('es', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
}

export function buildKnowledgeDocumentSearchPrompt(fileName: string): string {
  return t('knowledge.librarySearchDocument', { fileName });
}
