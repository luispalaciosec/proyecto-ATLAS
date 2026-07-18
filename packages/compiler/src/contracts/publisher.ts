import type { Artifact } from './artifact.js';
import type { CompilationContext } from './compilation-context.js';
import type { Diagnostic } from './diagnostic.js';

/**
 * @see ATLAS-ARCH-003 §27–28 Publisher Architecture / Registry
 */
export interface Publisher {
  readonly id: string;
  readonly supported_targets: readonly string[];
  publish(artifacts: readonly Artifact[], context: CompilationContext): readonly Diagnostic[];
}
