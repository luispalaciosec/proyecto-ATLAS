export interface KnowledgeUploadResponseProduct {
  readonly fileName: string;
  readonly chunks: number;
  readonly recordIds: readonly string[];
}
