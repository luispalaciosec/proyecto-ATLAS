import { createAtlasError, type AtlasError, type ErrorSeverity } from '@atlas/core';

const KNOWLEDGE_MODULE = '@atlas/knowledge';

export function createKnowledgeError(
  code: string,
  message: string,
  severity: ErrorSeverity = 'error',
): AtlasError {
  return createAtlasError({
    code,
    message,
    severity,
    module: KNOWLEDGE_MODULE,
  });
}
