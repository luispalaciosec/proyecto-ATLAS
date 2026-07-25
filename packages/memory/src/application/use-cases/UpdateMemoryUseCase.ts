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

/**
 * Certified MemoryEngine baseline does not expose update() yet (ADR-0003 deferred).
 * Update semantics delegate to MemoryEngine.store() until engine.update() lands.
 */
export class UpdateMemoryUseCase {
  constructor(private readonly engine: MemoryEngine) {}

  async execute(
    request: UpdateMemoryRequest,
  ): Promise<Result<UpdateMemoryResponse, ApplicationError>> {
    const validation = validateUpdateMemoryRequest(request);
    if (!validation.ok) {
      return validation;
    }

    const currentVersion = resolveVersion(request.record);
    const nextVersion = currentVersion + 1;
    const record = mergeRecordMetadata(request.record, {
      ...request.metadata,
      version: nextVersion,
    });

    const result = await this.engine.store(record);

    if (!result.ok) {
      return memoryErr(mapEngineError(result.error));
    }

    return memoryOk({
      record: result.value,
      updated: true,
      version: resolveVersion(result.value, nextVersion),
    });
  }
}
