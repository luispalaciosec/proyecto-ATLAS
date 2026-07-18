import type { Artifact } from '@atlas/compiler';

import type { ArtifactExecutor } from '../contracts/artifact-executor.js';
import type { ExecutionContext } from '../contracts/execution-context.js';

/**
 * Default in-memory executor for summary artifacts produced by the compiler.
 */
export const summaryArtifactExecutor: ArtifactExecutor = {
  kind: 'summary',
  execute(artifact: Artifact, _context: ExecutionContext) {
    return Object.freeze({
      artifact_id: artifact.id,
      kind: artifact.kind,
      result: artifact.content,
      success: true,
    });
  },
};

export function createDefaultArtifactExecutors(): readonly ArtifactExecutor[] {
  return Object.freeze([summaryArtifactExecutor]);
}
