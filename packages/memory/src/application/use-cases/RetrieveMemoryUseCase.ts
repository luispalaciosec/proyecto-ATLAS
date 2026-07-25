import type { Result } from '@atlas/core';

import { MEMORY_NOT_FOUND } from '../../domain/errors/memory-error-codes.js';
import type { MemoryEngine } from '../../engine/MemoryEngine.js';
import { memoryErr, memoryOk } from '../../internal/result.js';

import type { RetrieveMemoryRequest } from '../contracts/RetrieveMemoryRequest.js';
import {
  createApplicationError,
  mapEngineError,
  type ApplicationError,
} from '../errors/ApplicationError.js';
import { validateRetrieveMemoryRequest } from '../request-validation.js';
import type { RetrieveMemoryResponse } from '../responses/RetrieveMemoryResponse.js';

export class RetrieveMemoryUseCase {
  constructor(private readonly engine: MemoryEngine) {}

  async execute(
    request: RetrieveMemoryRequest,
  ): Promise<Result<RetrieveMemoryResponse, ApplicationError>> {
    const validation = validateRetrieveMemoryRequest(request);
    if (!validation.ok) {
      return validation;
    }

    const result = await this.engine.retrieve();

    if (!result.ok) {
      return memoryErr(mapEngineError(result.error));
    }

    if (request.recordId !== undefined) {
      if (result.value === undefined || result.value.id !== request.recordId) {
        return memoryErr(
          createApplicationError(MEMORY_NOT_FOUND, `Record "${request.recordId}" was not found`),
        );
      }

      return memoryOk({
        record: result.value,
        found: true,
      });
    }

    return memoryOk({
      ...(result.value === undefined ? {} : { record: result.value }),
      found: result.value !== undefined,
    });
  }
}
