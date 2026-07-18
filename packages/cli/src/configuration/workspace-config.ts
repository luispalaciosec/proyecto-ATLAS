import type { CreateCompilationUnitParams } from '@atlas/sdk';

import { CliExitError, EXIT_VALIDATION_ERROR } from '../output/exit-codes.js';

export interface WorkspaceConfig {
  readonly name: string;
  readonly environment?: string;
  readonly units: readonly CreateCompilationUnitParams[];
}

export function parseWorkspaceConfig(raw: unknown): WorkspaceConfig {
  if (raw === null || typeof raw !== 'object') {
    throw new CliExitError(EXIT_VALIDATION_ERROR, 'Workspace config must be a JSON object');
  }

  const candidate = raw as Record<string, unknown>;

  if (typeof candidate.name !== 'string' || candidate.name.trim() === '') {
    throw new CliExitError(EXIT_VALIDATION_ERROR, 'Workspace config requires a non-empty "name"');
  }

  if (!Array.isArray(candidate.units)) {
    throw new CliExitError(EXIT_VALIDATION_ERROR, 'Workspace config requires a "units" array');
  }

  const units: CreateCompilationUnitParams[] = [];

  for (const [index, unit] of candidate.units.entries()) {
    if (unit === null || typeof unit !== 'object') {
      throw new CliExitError(
        EXIT_VALIDATION_ERROR,
        `Workspace unit at index ${index} must be an object`,
      );
    }

    const value = unit as Record<string, unknown>;

    for (const field of ['id', 'origin', 'checksum', 'version'] as const) {
      if (typeof value[field] !== 'string' || value[field].trim() === '') {
        throw new CliExitError(
          EXIT_VALIDATION_ERROR,
          `Workspace unit at index ${index} requires string field "${field}"`,
        );
      }
    }

    if (!('source' in value)) {
      throw new CliExitError(
        EXIT_VALIDATION_ERROR,
        `Workspace unit at index ${index} requires field "source"`,
      );
    }

    units.push({
      id: value.id as string,
      origin: value.origin as string,
      checksum: value.checksum as string,
      version: value.version as string,
      source: value.source,
      metadata:
        value.metadata && typeof value.metadata === 'object'
          ? (value.metadata as Record<string, unknown>)
          : undefined,
    });
  }

  return Object.freeze({
    name: candidate.name,
    environment: typeof candidate.environment === 'string' ? candidate.environment : undefined,
    units: Object.freeze(units),
  });
}
