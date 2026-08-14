export interface KnowledgeUploadResponseProduct {
  readonly documentId: string;
  readonly fileName: string;
  readonly folder: string;
  readonly chunks: number;
  readonly recordIds: readonly string[];
  readonly sheetCount?: number;
}
