import type { Identifier, Metadata, Version } from '@atlas/core';

/**
 * @see ATLAS-ARCH-003 §8 Compilation Units
 * @see ATLAS-ARCH-006 §8 Compilation Units
 */
export interface CompilationUnit {
  readonly id: Identifier;
  readonly origin: string;
  readonly metadata: Metadata;
  readonly checksum: string;
  readonly version: Version;
  readonly source: unknown;
}
