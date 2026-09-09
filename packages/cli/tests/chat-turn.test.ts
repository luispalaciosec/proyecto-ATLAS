import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { AtlasContextBuilder, createAtlas } from '@atlas/sdk';
import { describe, expect, it, vi } from 'vitest';

import {
  createChatSession,
  DEFAULT_HISTORY_WINDOW_TURNS,
  selectRecentTurns,
} from '../src/chat/chat-session.js';
import { applyCorrection, executeChatTurn } from '../src/chat/chat-turn.js';
import { AtlasService } from '../src/services/atlas-service.js';

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

describe('executeChatTurn history window', () => {
  it('keeps full session history while sending only recent turns to the LLM', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-chat-turn-window-'));
    const client = createAtlas({
      workspace: { name: 'test' },
      memory: { storageFilePath: join(dir, 'memory.json') },
      llm: { apiKey: 'test-key', model: 'claude-test' },
    });
    const session = createChatSession(client);
    const atlasService = new AtlasService();
    const askSpy = vi
      .spyOn(session.client.llm, 'ask')
      .mockImplementation(async (_goal, _options) => {
        const turn = askSpy.mock.calls.length;

        return Object.freeze({
          success: true,
          finalMessage: `Reply ${turn}`,
          transcript: Object.freeze([
            Object.freeze({ role: 'assistant' as const, content: `Reply ${turn}` }),
          ]),
          turns: 1,
          usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
          budgetExceeded: false,
        });
      });

    for (let turn = 1; turn <= 6; turn += 1) {
      await executeChatTurn(atlasService, session, `Goal ${turn}`);
    }

    expect(session.history.some((message) => message.content === 'Goal 1')).toBe(true);
    expect(session.history.some((message) => message.content === 'Reply 6')).toBe(true);
    expect(session.history.length).toBeGreaterThanOrEqual(12);

    const sixthCall = askSpy.mock.calls[5];
    expect(sixthCall).toBeDefined();

    const sentHistory = sixthCall?.[1]?.history ?? [];

    expect(sentHistory.some((message) => message.content === 'Goal 1')).toBe(false);
    expect(sentHistory.some((message) => message.content === 'Reply 1')).toBe(false);
    expect(sentHistory.some((message) => message.content === 'Goal 2')).toBe(true);
    expect(sentHistory.some((message) => message.content === 'Reply 5')).toBe(true);
    expect(sentHistory.find((message) => message.content === 'Goal 2')?.role).toBe('user');

    expect(
      selectRecentTurns(session, DEFAULT_HISTORY_WINDOW_TURNS).some(
        (message) => message.content === 'Goal 1',
      ),
    ).toBe(false);

    askSpy.mockRestore();
    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-004-G: executeChatTurn builds context through AtlasContextBuilder before llm.ask', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-chat-turn-context-'));
    const client = createAtlas({
      workspace: { name: 'brand-geeks' },
      memory: { storageFilePath: join(dir, 'memory.json') },
      llm: { apiKey: 'test-key', model: 'claude-test' },
    });
    const session = createChatSession(client);
    const atlasService = new AtlasService();
    const buildSpy = vi.spyOn(AtlasContextBuilder, 'build');
    const askSpy = vi.spyOn(session.client.llm, 'ask').mockResolvedValue(
      Object.freeze({
        success: true,
        finalMessage: 'Reply',
        transcript: Object.freeze([
          Object.freeze({ role: 'assistant' as const, content: 'Reply' }),
        ]),
        turns: 1,
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        budgetExceeded: false,
      }),
    );

    await executeChatTurn(atlasService, session, 'Goal with builder');

    expect(buildSpy).toHaveBeenCalledTimes(1);
    expect(askSpy).toHaveBeenCalledWith(
      'Goal with builder',
      expect.objectContaining({
        contextPackage: expect.objectContaining({
          goal: 'Goal with builder',
          workspace: 'brand-geeks',
        }),
      }),
    );

    buildSpy.mockRestore();
    askSpy.mockRestore();
    rmSync(dir, { recursive: true, force: true });
  });
});
