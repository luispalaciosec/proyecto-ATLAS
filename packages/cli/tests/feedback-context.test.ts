import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createAtlas } from '@atlas/sdk';
import { describe, expect, it } from 'vitest';

import { recordFeedback } from '../src/chat/feedback.js';
import { loadRecentFeedbackContext } from '../src/workspace/feedback-context.js';

describe('loadRecentFeedbackContext', () => {
  it('returns an empty string when no feedback exists', async () => {
    const root = mkdtempSync(join(tmpdir(), 'atlas-feedback-empty-'));
    const memoryFilePath = join(root, 'memory.json');

    await expect(loadRecentFeedbackContext(memoryFilePath)).resolves.toBe('');

    rmSync(root, { recursive: true, force: true });
  });

  it('returns recent feedback records newest first', async () => {
    const root = mkdtempSync(join(tmpdir(), 'atlas-feedback-records-'));
    const memoryFilePath = join(root, 'memory.json');
    const client = createAtlas({
      workspace: { name: 'feedback-test' },
      memory: { storageFilePath: memoryFilePath },
    });

    await recordFeedback(
      client,
      { goal: 'first goal', output: 'first output' },
      'first correction',
    );
    await recordFeedback(
      client,
      { goal: 'second goal', output: 'second output' },
      'second correction',
    );

    const context = await loadRecentFeedbackContext(memoryFilePath, 5);

    expect(context).toContain('Known corrections from previous sessions');
    expect(context).toContain('first correction');
    expect(context).toContain('second correction');
    expect(context.indexOf('second correction')).toBeLessThan(context.indexOf('first correction'));

    rmSync(root, { recursive: true, force: true });
  });
});
