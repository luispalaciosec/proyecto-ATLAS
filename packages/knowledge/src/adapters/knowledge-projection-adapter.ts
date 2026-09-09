import type { CreateCompilationUnitParams } from '@atlas/compiler';

import { MetaConceptId } from '../metamodel/meta-concept-id.js';
import type { KnowledgeObject } from '../domain/aggregates/knowledge-object.js';
import { LifecycleState } from '../domain/value-objects/lifecycle-state.js';
import { computeSourceChecksum, serializeKnowledgeCanonicalSource } from './canonical-source.js';
import { KnowledgeProjectionError } from './knowledge-projection-error.js';
import type {
  ProjectionBatchResult,
  ProjectionDiagnostic,
  ProjectionOptions,
  ProjectionResult,
} from './projection-types.js';

const COMPILABLE_LIFECYCLE_STATES: ReadonlySet<string> = new Set([
  LifecycleState.Operational,
  LifecycleState.Observed,
]);

export class KnowledgeProjectionAdapter {
  readonly #requireCompilableLifecycle: boolean;

  constructor(options: ProjectionOptions = {}) {
    this.#requireCompilableLifecycle = options.requireCompilableLifecycle ?? true;
  }

  isProjectable(object: KnowledgeObject): boolean {
    if (object.metaConcept !== MetaConceptId.Object) {
      return false;
    }

    if (!this.#requireCompilableLifecycle) {
      return true;
    }

    return COMPILABLE_LIFECYCLE_STATES.has(object.governance.lifecycleState);
  }

  project(object: KnowledgeObject): ProjectionResult {
    const objectId = object.id.toString();

    if (object.metaConcept !== MetaConceptId.Object) {
      return this.#failure(objectId, 'PROJECTION_INVALID_OBJECT', 'Value is not a KnowledgeObject');
    }

    if (this.#requireCompilableLifecycle && !this.isProjectable(object)) {
      return this.#failure(
        objectId,
        'PROJECTION_LIFECYCLE_NOT_COMPILABLE',
        `KnowledgeObject "${objectId}" lifecycle "${object.governance.lifecycleState}" is not compilable`,
      );
    }

    const source = serializeKnowledgeCanonicalSource(object);
    const version = object.currentVersion.version.toString();

    const unit: CreateCompilationUnitParams = Object.freeze({
      id: objectId,
      origin: `knowledge://${objectId}@${version}`,
      checksum: computeSourceChecksum(source),
      version,
      source,
      metadata: Object.freeze({
        kind: object.kind.name,
        knowledgeObjectId: objectId,
        lifecycleState: object.governance.lifecycleState,
        projection: 'knowledge-projection-adapter',
      }),
    });

    return Object.freeze({
      success: true,
      unit,
      diagnostics: Object.freeze([]),
    });
  }

  projectAll(objects: readonly KnowledgeObject[]): ProjectionBatchResult {
    const results = objects.map((object) => this.project(object));
    const diagnostics = results.flatMap((result) => result.diagnostics);
    const failures = results.filter((result) => !result.success);

    if (failures.length > 0) {
      throw new KnowledgeProjectionError(
        'One or more KnowledgeObjects could not be projected',
        diagnostics,
      );
    }

    return Object.freeze({
      units: Object.freeze(results.map((result) => result.unit!)),
      diagnostics: Object.freeze(diagnostics),
    });
  }

  #failure(objectId: string, code: string, message: string): ProjectionResult {
    const diagnostic: ProjectionDiagnostic = Object.freeze({
      code,
      message,
      objectId,
    });

    return Object.freeze({
      success: false,
      diagnostics: Object.freeze([diagnostic]),
    });
  }
}

export function isKnowledgeObject(value: unknown): value is KnowledgeObject {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<KnowledgeObject>;
  return candidate.metaConcept === MetaConceptId.Object && candidate.id !== undefined;
}
