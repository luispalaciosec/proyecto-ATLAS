export const MemoryOperationType = {
  RetrievalRequest: 'retrieval_request',
  RetrievalResult: 'retrieval_result',
  StorageRequest: 'storage_request',
  StorageResult: 'storage_result',
  IndexOperation: 'index_operation',
  ValidationOperation: 'validation_operation',
} as const;

export type MemoryOperationType =
  (typeof MemoryOperationType)[keyof typeof MemoryOperationType];

export const MEMORY_OPERATION_TYPES: readonly MemoryOperationType[] = Object.freeze(
  Object.values(MemoryOperationType),
);

export function isMemoryOperationType(value: string): value is MemoryOperationType {
  return (MEMORY_OPERATION_TYPES as readonly string[]).includes(value);
}
