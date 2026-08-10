export class KnowledgeUploadError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'KnowledgeUploadError';
    this.statusCode = statusCode;
  }
}
