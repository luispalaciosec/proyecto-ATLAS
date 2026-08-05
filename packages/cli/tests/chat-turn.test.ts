import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createAtlas } from '@atlas/sdk';
import { describe, expect, it } from 'vitest';

import { createChatSession } from '../src/chat/chat-session.js';
import { applyCorrection } from '../src/chat/chat-turn.js';

describe('applyCorrection', () => {
  it('returns usage when correction text is empty', async () => {
    const client = createAtlas({ workspace: { name: 'test' } });
    const session = createChatSession(client);

    const outcome = await applyCorrection(session, '');

    expect(outcome.status).toBe('usage');
    expect(outcome.message).toContain('Usage: /correct');
  });

  it('returns llm_required when LLM is not configured', async () => {
    const client = createAtlas({ workspace: { name: 'test' } });
    const session = createChatSession(client);
    session.lastTurn = Object.freeze({ goal: 'hello', output: 'world' });

    const outcome = await applyCorrection(session, 'shorter answer');

    expect(outcome.status).toBe('llm_required');
    expect(outcome.message).toContain('requires LLM mode');
  });

  it('returns no_prior_turn when there is nothing to correct', async () => {
    const client = createAtlas({
      workspace: { name: 'test' },
      llm: { apiKey: 'test-key', model: 'claude-test' },
    });
    const session = createChatSession(client);

    const outcome = await applyCorrection(session, 'shorter answer');

    expect(outcome.status).toBe('no_prior_turn');
    expect(outcome.message).toContain('Nothing to correct yet');
  });

  it('records feedback when LLM mode and a prior turn exist', async () => {
    const root = mkdtempSync(join(tmpdir(), 'atlas-apply-correction-'));
    const memoryFile = join(root, 'memory.json');
    const client = createAtlas({
      workspace: { name: 'test' },
      memory: { storageFilePath: memoryFile },
      llm: { apiKey: 'test-key', model: 'claude-test' },
    });
    const session = createChatSession(client);
    session.lastTurn = Object.freeze({
      goal: 'draft campaign',
      output: 'Draft campaign copy.',
    });

    const outcome = await applyCorrection(session, 'mention free shipping');

    expect(outcome.status).toBe('recorded');
    expect(outcome.recordId).toBeDefined();
    expect(outcome.message).toContain(outcome.recordId ?? '');

    const search = await client.memory.searchContent({
      query: 'free shipping',
      recordType: 'Feedback',
    });
    expect(search.total).toBe(1);

    rmSync(root, { recursive: true, force: true });
  });
});
