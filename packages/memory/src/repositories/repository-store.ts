import type { Result } from '@atlas/core';

import type { InternalStoreGateway } from '../internal/store-gateway.js';
import { memoryErr, memoryOk } from '../internal/result.js';
import type { MemoryRecord, SearchResult } from '../domain/types/memory-types.js';

import { createRepositoryError, REPOSITORY_STORE, type RepositoryError } from './repository-errors.js';

export async function invokeStorePut(gateway: InternalStoreGateway): Promise<Result<void, RepositoryError>> {
  try {
    await gateway.put();
    return memoryOk(undefined);
  } catch (cause) {
    return memoryErr(
      createRepositoryError(REPOSITORY_STORE, 'MemoryStore.put failed', { cause }),
    );
  }
}

export async function invokeStoreGet(
  gateway: InternalStoreGateway,
): Promise<Result<MemoryRecord | undefined, RepositoryError>> {
  try {
    const record = await gateway.get();
    return memoryOk(record);
  } catch (cause) {
    return memoryErr(
      createRepositoryError(REPOSITORY_STORE, 'MemoryStore.get failed', { cause }),
    );
  }
}

export async function invokeStoreRemove(
  gateway: InternalStoreGateway,
): Promise<Result<void, RepositoryError>> {
  try {
    await gateway.remove();
    return memoryOk(undefined);
  } catch (cause) {
    return memoryErr(
      createRepositoryError(REPOSITORY_STORE, 'MemoryStore.remove failed', { cause }),
    );
  }
}

export async function invokeStoreSearch(
  gateway: InternalStoreGateway,
): Promise<Result<SearchResult, RepositoryError>> {
  try {
    const result = await gateway.search();
    return memoryOk(result);
  } catch (cause) {
    return memoryErr(
      createRepositoryError(REPOSITORY_STORE, 'MemoryStore.search failed', { cause }),
    );
  }
}
