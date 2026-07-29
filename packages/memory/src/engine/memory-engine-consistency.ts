import type { ConsistencyProvider } from '../domain/interfaces/consistency-provider.js';
import type { MemoryRecord, RepairOptions } from '../domain/types/memory-types.js';

import { validateRegisteredMemorySessions } from './memory-engine-session-validation.js';
import type { MemoryEngineSessionRegistry } from './memory-engine-session-registry.js';

export function wrapConsistencyProviderWithSessionValidation(
  provider: ConsistencyProvider,
  registry: MemoryEngineSessionRegistry,
): ConsistencyProvider {
  return Object.freeze({
    validateRecord: (record: MemoryRecord) => provider.validateRecord(record),
    validateStore: () => provider.validateStore(),
    validateIndexes: () => provider.validateIndexes(),
    validateSessions: async () =>
      validateRegisteredMemorySessions(registry.getSessionsForValidation()),
    repair: (options?: RepairOptions) => provider.repair(options),
  });
}
