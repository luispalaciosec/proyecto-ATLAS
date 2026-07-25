import { describe, expect, it, vi } from 'vitest';

import { RetrieveMemoryUseCase } from '../../src/application/use-cases/RetrieveMemoryUseCase.js';
import {
  INVALID_QUERY,
  MEMORY_NOT_FOUND,
  MEMORY_RETRIEVAL_ERROR,
} from '../../src/domain/errors/memory-error-codes.js';
import { memoryErr } from '../../src/internal/result.js';
import { createEngineError, ENGINE_RETRIEVAL } from '../../src/engine/engine-errors.js';
import { createEngineSpy, createMemoryRecord, createTestEngine } from './test-helpers.js';

describe('RetrieveMemoryUseCase', () => {
  it('delegates canonical identity to MemoryEngine.retrieve', async () => {
    const record = createMemoryRecord();
    const engine = createTestEngine({
      get: vi.fn().mockResolvedValue(record),
    });
    const useCase = new RetrieveMemoryUseCase(engine);

    const result = await useCase.execute({ recordId: record.id });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.found).toBe(true);
      expect(result.value.record).toEqual(record);
    }
  });

  it('maps engine not-found errors without application-side filtering', async () => {
    const engine = createTestEngine({
      get: vi.fn().mockResolvedValue(undefined),
      search: vi.fn().mockResolvedValue({ records: [], total: 0 }),
    });
    const useCase = new RetrieveMemoryUseCase(engine);

    const result = await useCase.execute({ recordId: 'record.fact.1' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(MEMORY_NOT_FOUND);
    }
  });

  it('rejects invalid requests before calling the engine', async () => {
    const engine = createEngineSpy();
    const useCase = new RetrieveMemoryUseCase(engine);

    const emptyId = await useCase.execute({ recordId: '   ' });
    expect(emptyId.ok).toBe(false);
    if (!emptyId.ok) {
      expect(emptyId.error.code).toBe(INVALID_QUERY);
    }

    const missingId = await useCase.execute({});
    expect(missingId.ok).toBe(false);
    if (!missingId.ok) {
      expect(missingId.error.code).toBe(INVALID_QUERY);
    }

    expect(engine.retrieve).not.toHaveBeenCalled();
  });

  it('maps engine failures to ApplicationError', async () => {
    const engine = createEngineSpy();
    engine.retrieve = vi.fn().mockResolvedValue(
      memoryErr(createEngineError(ENGINE_RETRIEVAL, 'retrieve failed')),
    );
    const useCase = new RetrieveMemoryUseCase(engine);

    const result = await useCase.execute({ recordId: 'record.fact.1' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(MEMORY_RETRIEVAL_ERROR);
    }
  });
});
