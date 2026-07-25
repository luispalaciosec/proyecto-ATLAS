import { describe, expect, it, vi } from 'vitest';

import { RetrieveMemoryUseCase } from '../../src/application/use-cases/RetrieveMemoryUseCase.js';
import {
  INVALID_QUERY,
  MEMORY_NOT_FOUND,
  MEMORY_STORAGE_ERROR,
} from '../../src/domain/errors/memory-error-codes.js';
import { memoryErr } from '../../src/internal/result.js';
import { createEngineError, ENGINE_STORE } from '../../src/engine/engine-errors.js';
import { createEngineSpy, createMemoryRecord, createTestEngine } from './test-helpers.js';

describe('RetrieveMemoryUseCase', () => {
  it('delegates to MemoryEngine.retrieve and returns found records', async () => {
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

  it('returns MemoryNotFoundError when recordId does not match', async () => {
    const engine = createTestEngine({
      get: vi.fn().mockResolvedValue(createMemoryRecord({ id: 'record.other' })),
    });
    const useCase = new RetrieveMemoryUseCase(engine);

    const result = await useCase.execute({ recordId: 'record.fact.1' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(MEMORY_NOT_FOUND);
    }
  });

  it('returns found=false when no recordId is provided and store is empty', async () => {
    const engine = createTestEngine({
      get: vi.fn().mockResolvedValue(undefined),
    });
    const useCase = new RetrieveMemoryUseCase(engine);

    const result = await useCase.execute({});

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.found).toBe(false);
      expect(result.value.record).toBeUndefined();
    }
  });

  it('rejects invalid requests before calling the engine', async () => {
    const engine = createEngineSpy();
    const useCase = new RetrieveMemoryUseCase(engine);

    const result = await useCase.execute({ recordId: '   ' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(INVALID_QUERY);
    }
    expect(engine.retrieve).not.toHaveBeenCalled();
  });

  it('maps engine failures to ApplicationError', async () => {
    const engine = createEngineSpy();
    engine.retrieve = vi.fn().mockResolvedValue(
      memoryErr(createEngineError(ENGINE_STORE, 'retrieve failed')),
    );
    const useCase = new RetrieveMemoryUseCase(engine);

    const result = await useCase.execute({});

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(MEMORY_STORAGE_ERROR);
    }
  });
});
