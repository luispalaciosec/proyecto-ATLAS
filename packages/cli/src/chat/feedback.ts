import type { Atlas } from '@atlas/sdk';
import {
  recordFeedbackCorrection,
  type FeedbackLastTurn,
  type RecordFeedbackCorrectionOptions,
  type RecordFeedbackCorrectionResult,
} from '@atlas/sdk';

export type {
  FeedbackLastTurn as LastTurn,
  RecordFeedbackCorrectionResult as RecordFeedbackResult,
};

export async function recordFeedback(
  client: Atlas,
  lastTurn: FeedbackLastTurn,
  correction: string,
  options: RecordFeedbackCorrectionOptions = {},
): Promise<RecordFeedbackCorrectionResult> {
  return recordFeedbackCorrection(client, lastTurn, correction, options);
}

export function parseCorrectCommand(line: string): string | null {
  const trimmed = line.trim();

  if (!trimmed.toLowerCase().startsWith('/correct')) {
    return null;
  }

  return trimmed.slice('/correct'.length).trim();
}
