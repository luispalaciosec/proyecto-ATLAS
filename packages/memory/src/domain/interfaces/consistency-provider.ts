import type {
  MemoryRecord,
  RepairOptions,
  RepairResult,
  ValidationResult,
} from '../types/memory-types.js';

/**
 * ATLAS-MEMORY-CONTRACT-006
 */
export interface ConsistencyProvider {
  validateRecord(record: MemoryRecord): Promise<ValidationResult>;
  validateStore(): Promise<ValidationResult>;
  validateIndexes(): Promise<ValidationResult>;
  validateSessions(): Promise<ValidationResult>;
  repair(options?: RepairOptions): Promise<RepairResult>;
}
