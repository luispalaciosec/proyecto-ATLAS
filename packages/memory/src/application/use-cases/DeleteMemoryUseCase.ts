import type { Result } from '@atlas/core';

import type { MemoryEngine } from '../../engine/MemoryEngine.js';
import { memoryErr, memoryOk } from '../../internal/result.js';

import type { DeleteMemoryRequest } from '../contracts/DeleteMemoryRequest.js';
import { mapEngineError, type ApplicationError } from '../errors/ApplicationError.js';
import { validateDeleteMemoryRequest } from '../request-validation.js';
import type { DeleteMemoryResponse } from '../responses/DeleteMemoryResponse.js';

export class DeleteMemoryUseCase {
  constructor(private readonly engine: MemoryEngine) {}

  async execute(
    request: DeleteMemoryRequest,
  ): Promise<Result<DeleteMemoryResponse, ApplicationError>> {
    const validation = validateDeleteMemoryRequest(request);
    if (!validation.ok) {
      return validation;
    }

    const result = await this.engine.delete(request.record);

    if (!result.ok) {
      return memoryErr(mapEngineError(result.error));
    }

    return memoryOk({
      deleted: true,
      recordId: request.record.id,
    });
  }
}
