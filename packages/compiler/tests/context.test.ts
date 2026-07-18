import { Metadata } from '@atlas/core';
import { describe, expect, it } from 'vitest';

import {
  appendDiagnostics,
  createArtifact,
  createCompilationContext,
  createCompilationUnit,
  createDiagnostic,
  createKnowledgeGraph,
  createKnowledgeNode,
  updateCompilationContext,
} from '../src/index.js';

describe('Compilation context factories', () => {
  it('creates an immutable initial context', () => {
    const context = createCompilationContext({
      workspace: { name: 'atlas' },
      metadata: Metadata.create({ trace: 'abc' }),
    });

    expect(context.lifecycle).toBe('initialize');
    expect(context.workspace.name).toBe('atlas');
    expect(Object.isFrozen(context)).toBe(true);
  });

  it('updates context immutably', () => {
    const initial = createCompilationContext();
    const updated = updateCompilationContext(initial, { lifecycle: 'discover' });

    expect(initial.lifecycle).toBe('initialize');
    expect(updated.lifecycle).toBe('discover');
  });

  it('creates compilation units with core value objects', () => {
    const unit = createCompilationUnit({
      id: 'doc.readme',
      origin: 'workspace://docs/readme.md',
      checksum: 'sha256:abc',
      version: '1.0.0',
      source: { text: '# Atlas' },
      metadata: { kind: 'DocumentNode' },
    });

    expect(unit.id.toJSON()).toBe('doc.readme');
    expect(unit.version.toJSON()).toBe('1.0.0');
  });

  it('creates diagnostics with required fields', () => {
    const diagnostic = createDiagnostic({
      severity: 'error',
      message: 'Structural validation failed',
      location: { path: 'unit-1' },
      cause: 'Missing kind',
    });

    expect(diagnostic.severity).toBe('error');
    expect(diagnostic.location.path).toBe('unit-1');
  });

  it('creates knowledge graph structures', () => {
    const unit = createCompilationUnit({
      id: 'doc.one',
      origin: 'memory://doc.one',
      checksum: 'sha256:1',
      version: '1.0.0',
      source: {},
    });
    const node = createKnowledgeNode({
      id: 'hir.doc.one',
      kind: 'DocumentNode',
      unit_id: unit.id,
    });
    const graph = createKnowledgeGraph({
      id: 'mir.workspace',
      nodes: [node],
    });

    expect(graph.nodes).toHaveLength(1);
    expect(graph.edges).toHaveLength(0);
  });

  it('creates artifacts', () => {
    const artifact = createArtifact({
      id: 'artifact.docs',
      kind: 'markdown',
      content: '# Output',
      source_graph_id: undefined,
    });

    expect(artifact.kind).toBe('markdown');
  });

  it('appends diagnostics without mutating prior context', () => {
    const initial = createCompilationContext();
    const diagnostic = createDiagnostic({ severity: 'warning', message: 'warn' });
    const next = appendDiagnostics(initial, [diagnostic]);

    expect(initial.diagnostics).toHaveLength(0);
    expect(next.diagnostics).toHaveLength(1);
  });
});
