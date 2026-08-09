import { describe, expect, it } from 'vitest';

import { createJsonFileMemoryEngine } from '@atlas/memory';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runRetrievalPipeline } from '../src/retrieval-pipeline.js';

describe('@atlas/retrieval pipeline', () => {
  it('ranks keyword matches ahead of unrelated memory', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-retrieval-'));
    const filePath = join(dir, 'memory.json');
    const engine = createJsonFileMemoryEngine(filePath);

    await engine.store({
      id: 'record.plan.a',
      type: 'PlanExecution',
      content: { text: 'procesar pedido cliente' },
      metadata: { namespaceId: 'cli.default' },
      timestamp: '2026-08-04T10:00:00.000Z',
    });
    await engine.store({
      id: 'record.plan.b',
      type: 'PlanExecution',
      content: { text: 'analizar dataset remoto' },
      metadata: { namespaceId: 'cli.default' },
      timestamp: '2026-08-04T11:00:00.000Z',
    });

    const result = await runRetrievalPipeline(engine, {
      query: 'procesar pedido urgente',
      namespaceId: 'cli.default',
      limit: 3,
    });

    expect(result.success).toBe(true);
    expect(result.context.items[0]?.recordId).toBe('record.plan.a');
    expect(result.context.items[0]?.score).toBeGreaterThan(0);

    rmSync(dir, { recursive: true, force: true });
  });

  it('matches keywords with or without accents', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-retrieval-accent-'));
    const filePath = join(dir, 'memory.json');
    const engine = createJsonFileMemoryEngine(filePath);

    await engine.store({
      id: 'record.accent',
      type: 'CliMemory',
      content: { text: 'Cliente VIP Ana García — pedido laptop' },
      metadata: { namespaceId: 'cli.default' },
      timestamp: '2026-08-04T10:00:00.000Z',
    });

    const result = await runRetrievalPipeline(engine, {
      query: 'Ana Garcia',
      namespaceId: 'cli.default',
      limit: 3,
    });

    expect(result.success).toBe(true);
    expect(result.context.items[0]?.recordId).toBe('record.accent');
    expect(result.context.items[0]?.score).toBeGreaterThan(0);

    rmSync(dir, { recursive: true, force: true });
  });

  it('returns an empty context when memory has no candidates', async () => {
    const engine = createJsonFileMemoryEngine(
      join(mkdtempSync(join(tmpdir(), 'atlas-retrieval-empty-')), 'memory.json'),
    );

    const result = await runRetrievalPipeline(engine, {
      query: 'goal inexistente',
      namespaceId: 'cli.default',
    });

    expect(result.success).toBe(true);
    expect(result.context.items).toHaveLength(0);
    expect(result.context.totalCandidates).toBe(0);
  });
});
