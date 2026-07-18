import { Identifier, Metadata, Version } from '@atlas/core';

import type { CompilationUnit } from '../contracts/compilation-unit.js';

export interface CreateCompilationUnitParams {
  readonly id: string;
  readonly origin: string;
  readonly checksum: string;
  readonly version: string;
  readonly source: unknown;
  readonly metadata?: Record<string, unknown>;
}

export function createCompilationUnit(params: CreateCompilationUnitParams): CompilationUnit {
  return Object.freeze({
    id: Identifier.create(params.id),
    origin: params.origin,
    metadata: Metadata.create(params.metadata ?? {}),
    checksum: params.checksum,
    version: Version.create(params.version),
    source: params.source,
  });
}
