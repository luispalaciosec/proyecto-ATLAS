import { Version } from '@atlas/core';

import { MetaConceptId } from '../../metamodel/meta-concept-id.js';

export class KnowledgeVersion {
  readonly metaConcept = MetaConceptId.Version;

  readonly version: Version;
  readonly label?: string;

  private constructor(version: Version, label?: string) {
    this.version = version;
    this.label = label;
  }

  static create(value: string, label?: string): KnowledgeVersion {
    return new KnowledgeVersion(Version.create(value), label?.trim() || undefined);
  }

  static initial(): KnowledgeVersion {
    return KnowledgeVersion.create('1.0.0');
  }

  equals(other: KnowledgeVersion): boolean {
    return this.version.equals(other.version) && this.label === other.label;
  }
}
