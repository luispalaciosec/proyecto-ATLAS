import type { Atlas } from '@atlas/sdk';

export interface LastTurn {
  readonly goal: string;
  readonly output: string;
}

export interface RecordFeedbackResult {
  readonly recordId: string;
}

export async function recordFeedback(
  client: Atlas,
  lastTurn: LastTurn,
  correction: string,
): Promise<RecordFeedbackResult> {
  const result = await client.memory.storeContent({
    content: correction,
    recordType: 'Feedback',
    metadata: Object.freeze({
      originalGoal: lastTurn.goal,
      originalOutput: lastTurn.output,
      source: 'atlas-correct',
    }),
  });

  return Object.freeze({ recordId: result.recordId });
}

export function parseCorrectCommand(line: string): string | null {
  const trimmed = line.trim();

  if (!trimmed.toLowerCase().startsWith('/correct')) {
    return null;
  }

  return trimmed.slice('/correct'.length).trim();
}
