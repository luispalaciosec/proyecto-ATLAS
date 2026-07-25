import { describe, expect, it, vi } from 'vitest';

import { UpdateMemoryUseCase } from '../../src/application/use-cases/UpdateMemoryUseCase.js';
import {
  INVALID_MEMORY_RECORD,
  MEMORY_STORAGE_ERROR,
} from '../../src/domain/errors/memory-error-codes.js';
import { memoryErr } from '../../src/internal/result.js';
import { createEngineError, ENGINE_STORE } from '../../src/engine/engine-errors.js';
import { createEngineSpy, createMemoryRecord, createTestEngine } from './test-helpers.js';

describe('UpdateMemoryUseCase', () => {
  it('delegates update semantics through MemoryEngine.store', async () => {
    const engine = createTestEngine();
    const storeSpy = vi.spyOn(engine, 'store');
    const useCase = new UpdateMemoryUseCase(engine);
    const record = createMemoryRecord({ metadata: { version: 2 } });

    const result = await useCase.execute({
      record,
      metadata: { source: 'application-update' },
    });

    expect(storeSpy).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.updated).toBe(true);
      expect(result.value.version).toBe(3);
      expect(result.value.record.metadata.source).toBe('application-update');
    }
  });

  it('returns validation errors without calling the engine', async () => {
    const engine = createEngineSpy();
    const useCase = new UpdateMemoryUseCase(engine);

    const result = await useCase.execute({
      record: createMemoryRecord({ id: '' }),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(INVALID_MEMORY_RECORD);
    }
    expect(engine.store).not.toHaveBeenCalled();
  });

  it('maps engine failures to ApplicationError', async () => {
    const engine = createEngineSpy();
    engine.store = vi.fn().mockResolvedValue(
      memoryErr(createEngineError(ENGINE_STORE, 'update failed')),
    );
    const useCase = new UpdateMemoryUseCase(engine);

    const result = await useCase.execute({ record: createMemoryRecord() });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(MEMORY_STORAGE_ERROR);
    }
  });
});
