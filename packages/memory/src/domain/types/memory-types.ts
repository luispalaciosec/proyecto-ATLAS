/**
 * Public API projection — ATLAS-MEMORY-008 §12
 */
export interface MemoryRecord {
  readonly id: string;
  readonly type: string;
  readonly content: unknown;
  readonly embedding?: readonly number[];
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly timestamp: string;
}

/**
 * Frozen state — ATLAS-MEMORY-008 §13
 */
export interface MemorySnapshot {
  readonly id: string;
  readonly created_at: string;
  readonly records: readonly MemoryRecord[];
  readonly checksum: string;
}

export interface MemoryStatistics {
  readonly entries: number;
  readonly indexes: number;
  readonly size_bytes: number;
}

export interface MemoryQuery {
  readonly namespaceId?: string;
  readonly collectionId?: string;
  readonly recordType?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface RetrievalResult {
  readonly records: readonly MemoryRecord[];
  readonly total: number;
}

export interface SearchResult {
  readonly records: readonly MemoryRecord[];
  readonly total: number;
}

export interface SimilarityResult {
  readonly records: readonly MemoryRecord[];
  readonly scores: readonly number[];
}

export interface ValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly path?: string;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
}

export interface RepairOptions {
  readonly dryRun?: boolean;
}

export interface RepairResult {
  readonly repaired: number;
  readonly skipped: number;
  readonly failed: number;
}
