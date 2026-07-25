import type { Result } from '@atlas/core';

import type { MemoryEngine } from '../../engine/MemoryEngine.js';
import { memoryErr, memoryOk } from '../../internal/result.js';

import type { StoreMemoryRequest } from '../contracts/StoreMemoryRequest.js';
import { mapEngineError } from '../errors/ApplicationError.js';
import type { ApplicationError } from '../errors/ApplicationError.js';
import {
  mergeRecordMetadata,
  resolveVersion,
  validateStoreMemoryRequest,
} from '../request-validation.js';
import type { StoreMemoryResponse } from '../responses/StoreMemoryResponse.js';

export class StoreMemoryUseCase {
  constructor(private readonly engine: MemoryEngine) {}

  async execute(
    request: StoreMemoryRequest,
  ): Promise<Result<StoreMemoryResponse, ApplicationError>> {
    const validation = validateStoreMemoryRequest(request);
    if (!validation.ok) {
      return validation;
    }

    const record = mergeRecordMetadata(request.record, request.metadata);
    const result = await this.engine.store(record);

    if (!result.ok) {
      return memoryErr(mapEngineError(result.error));
    }

    return memoryOk({
      record: result.value,
      created: true,
      version: resolveVersion(result.value),
    });
  }
}
