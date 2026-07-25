import type { Result } from '@atlas/core';

import type { MemoryEngine } from '../../engine/MemoryEngine.js';
import { memoryErr, memoryOk } from '../../internal/result.js';

import type { UpdateMemoryRequest } from '../contracts/UpdateMemoryRequest.js';
import { mapEngineError, type ApplicationError } from '../errors/ApplicationError.js';
import {
  mergeRecordMetadata,
  resolveVersion,
  validateUpdateMemoryRequest,
} from '../request-validation.js';
import type { UpdateMemoryResponse } from '../responses/UpdateMemoryResponse.js';

export class UpdateMemoryUseCase {
  constructor(private readonly engine: MemoryEngine) {}

  async execute(
    request: UpdateMemoryRequest,
  ): Promise<Result<UpdateMemoryResponse, ApplicationError>> {
    const validation = validateUpdateMemoryRequest(request);
    if (!validation.ok) {
      return validation;
    }

    const record = mergeRecordMetadata(request.record, request.metadata);
    const result = await this.engine.update(record);

    if (!result.ok) {
      return memoryErr(mapEngineError(result.error));
    }

    return memoryOk({
      record: result.value,
      updated: true,
      version: resolveVersion(result.value),
    });
  }
}
