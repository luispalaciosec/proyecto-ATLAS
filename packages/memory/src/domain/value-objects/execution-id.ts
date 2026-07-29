import { createMemoryError, MEMORY_INVALID_ID } from '../errors/create-memory-error.js';

/** ExecutionId es local al dominio Memory y no corresponde formalmente al `executionId: string` usado en @atlas/runtime (que no tiene tipo formal propio); la relación entre ambos se resolverá en el sprint de integración Engine↔Session. */
export type ExecutionId = string & { readonly __executionIdBrand: unique symbol };

export function createExecutionId(value: string): ExecutionId {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw createMemoryError(MEMORY_INVALID_ID, 'ExecutionId must not be empty');
  }

  return trimmed as ExecutionId;
}
