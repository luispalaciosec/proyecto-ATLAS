import { describe, expect, it } from 'vitest';

import { createAtlas, matchesContentQuery } from '../src/index.js';
import type { MemoryRecord } from '@atlas/memory';

function createRecord(content: string): MemoryRecord {
  return {
    id: 'record.test',
    type: 'CliMemory',
    content: { text: content },
    metadata: {
      namespaceId: 'cli.default',
      revision: 1,
      version: '1',
      visibility: 'private',
    },
    timestamp: '2026-01-01T00:00:00.000Z',
  } as MemoryRecord;
}

describe('matchesContentQuery', () => {
  it('matches plural query tokens against singular stored text', () => {
    const record = createRecord('El cliente VIP Ana prefiere entrega los lunes.');

    expect(matchesContentQuery(record, 'Clientes VIP')).toBe(true);
    expect(matchesContentQuery(record, 'cliente VIP')).toBe(true);
  });

  it('matches single-token queries like VIP', () => {
    const record = createRecord('Pedido VIP #G-500 laptop gaming');

    expect(matchesContentQuery(record, 'VIP')).toBe(true);
  });

  it('does not match unrelated queries', () => {
    const record = createRecord('Política de devolución 30 días');

    expect(matchesContentQuery(record, 'Clientes VIP')).toBe(false);
  });

  it('does not match short prefix tokens that are unrelated to the query', () => {
    const record = createRecord(
      'Contexto institucional del banco. Productos crediticios y operaciones generales.',
    );

    expect(matchesContentQuery(record, 'descuento')).toBe(false);
  });

  it('matches descuento queries against stored discount policy text', () => {
    const record = createRecord(
      'Los ejecutivos comerciales pueden aplicar descuentos de hasta el 10%. Un descuento del 15% requiere aprobación escrita del Gerente Comercial.',
    );

    expect(matchesContentQuery(record, 'descuento')).toBe(true);
  });
});

describe('MemoryModule', () => {
  it('stores and searches content through the public memory facade', async () => {
    const atlas = createAtlas({ workspace: { name: 'memory-module-test' } });

    const stored = await atlas.memory.storeContent({ content: 'hola mundo' });

    expect(stored.recordId).toMatch(/^record\.cli\./);
    expect(stored.record.type).toBe('CliMemory');

    const search = await atlas.memory.searchContent({ query: 'hola' });

    expect(search.total).toBe(1);
    expect(search.records[0]?.id).toBe(stored.recordId);
  });

  it('returns empty results when query does not match stored content', async () => {
    const atlas = createAtlas();

    await atlas.memory.storeContent({ content: 'alpha content' });
    const search = await atlas.memory.searchContent({ query: 'beta' });

    expect(search.total).toBe(0);
    expect(search.records).toHaveLength(0);
  });

  it('matches queries with or without accents', async () => {
    const atlas = createAtlas();

    const stored = await atlas.memory.storeContent({
      content: 'Cliente VIP Ana García — pedido laptop',
    });

    const withAccent = await atlas.memory.searchContent({ query: 'García' });
    const withoutAccent = await atlas.memory.searchContent({ query: 'Garcia' });

    expect(withAccent.total).toBe(1);
    expect(withoutAccent.total).toBe(1);
    expect(withAccent.records[0]?.id).toBe(stored.recordId);
    expect(withoutAccent.records[0]?.id).toBe(stored.recordId);
  });
});
