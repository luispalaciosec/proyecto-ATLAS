import type { Result } from '@atlas/core';

import type { MemoryEngine } from '../../engine/MemoryEngine.js';
import { memoryErr, memoryOk } from '../../internal/result.js';

import type { SearchMemoryRequest } from '../contracts/SearchMemoryRequest.js';
import { mapEngineError, type ApplicationError } from '../errors/ApplicationError.js';
import { validateSearchMemoryRequest } from '../request-validation.js';
import type { SearchMemoryResponse } from '../responses/SearchMemoryResponse.js';

export class SearchMemoryUseCase {
  constructor(private readonly engine: MemoryEngine) {}

  async execute(
    request: SearchMemoryRequest,
  ): Promise<Result<SearchMemoryResponse, ApplicationError>> {
    const validation = validateSearchMemoryRequest(request);
    if (!validation.ok) {
      return validation;
    }

    const result = await this.engine.search();

    if (!result.ok) {
      return memoryErr(mapEngineError(result.error));
    }

    return memoryOk({
      records: result.value.records,
      total: result.value.total,
      query: validation.value.query,
    });
  }
}
