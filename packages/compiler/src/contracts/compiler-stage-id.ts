/**
 * @see ATLAS-ARCH-003 §17–18 Compiler Pipeline Architecture
 * @see ATLAS-ARCH-006 §6 Pipeline Stages
 */
export const COMPILER_STAGE_IDS = [
  'discovery',
  'ingestion',
  'lowering',
  'resolution',
  'graph_construction',
  'validation',
  'generation',
  'publishing',
] as const;

export type CompilerStageId = (typeof COMPILER_STAGE_IDS)[number];

export function isCompilerStageId(value: unknown): value is CompilerStageId {
  return typeof value === 'string' && (COMPILER_STAGE_IDS as readonly string[]).includes(value);
}
