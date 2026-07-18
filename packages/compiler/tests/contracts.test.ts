import { describe, expect, it } from 'vitest';

import {
  COMPILATION_LIFECYCLE_STATES,
  COMPILER_STAGE_IDS,
  DIAGNOSTIC_SEVERITIES,
  isCompilationLifecycle,
  isCompilerStageId,
  isDiagnosticSeverity,
} from '../src/contracts/index.js';

describe('Compiler contract constants', () => {
  it('defines the official pipeline stage ids', () => {
    expect(COMPILER_STAGE_IDS).toEqual([
      'discovery',
      'ingestion',
      'lowering',
      'resolution',
      'graph_construction',
      'validation',
      'generation',
      'publishing',
    ]);
    expect(isCompilerStageId('lowering')).toBe(true);
    expect(isCompilerStageId('invalid')).toBe(false);
  });

  it('defines lifecycle states including cancelled', () => {
    expect(COMPILATION_LIFECYCLE_STATES).toContain('complete');
    expect(COMPILATION_LIFECYCLE_STATES).toContain('cancelled');
    expect(isCompilationLifecycle('publish')).toBe(true);
  });

  it('defines diagnostic severities from ARCH-003 §24', () => {
    expect(DIAGNOSTIC_SEVERITIES).toEqual(['error', 'warning', 'information', 'suggestion']);
    expect(isDiagnosticSeverity('information')).toBe(true);
    expect(isDiagnosticSeverity('info')).toBe(false);
  });
});
