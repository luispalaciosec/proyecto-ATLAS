import type { Result } from '@atlas/core';

import type { MemoryEngine } from '../../engine/MemoryEngine.js';
import { memoryErr, memoryOk } from '../../internal/result.js';

import type { RetrieveMemoryRequest } from '../contracts/RetrieveMemoryRequest.js';
import { mapEngineError, type ApplicationError } from '../errors/ApplicationError.js';
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

    const result = await this.engine.retrieve({
      recordId: validation.value.recordId!,
    });

    if (!result.ok) {
      return memoryErr(mapEngineError(result.error));
    }

    return memoryOk({
      record: result.value,
      found: true,
    });
  }
}
