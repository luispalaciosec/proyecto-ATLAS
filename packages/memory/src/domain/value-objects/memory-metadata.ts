import { createMemoryError, MEMORY_INVALID_ID } from '../errors/create-memory-error.js';
import type { Visibility } from './visibility.js';
import { isVisibility } from './visibility.js';

export interface MemoryMetadataData {
  readonly creator?: string;
  readonly labels?: readonly string[];
  readonly source?: string;
  readonly priority?: string;
  readonly classification?: string;
  readonly language?: string;
  readonly visibility?: Visibility;
  readonly custom?: Readonly<Record<string, unknown>>;
}

export class MemoryMetadata {
  readonly creator?: string;
  readonly labels: readonly string[];
  readonly source?: string;
  readonly priority?: string;
  readonly classification?: string;
  readonly language?: string;
  readonly visibility?: Visibility;
  readonly custom: Readonly<Record<string, unknown>>;

  private constructor(data: MemoryMetadataData) {
    if (data.visibility !== undefined && !isVisibility(data.visibility)) {
      throw createMemoryError(MEMORY_INVALID_ID, 'MemoryMetadata visibility is invalid');
    }

    this.creator = data.creator;
    this.labels = Object.freeze([...(data.labels ?? [])]);
    this.source = data.source;
    this.priority = data.priority;
    this.classification = data.classification;
    this.language = data.language;
    this.visibility = data.visibility;
    this.custom = Object.freeze({ ...(data.custom ?? {}) });
  }

  static create(data: MemoryMetadataData = {}): MemoryMetadata {
    return new MemoryMetadata(data);
  }
}
