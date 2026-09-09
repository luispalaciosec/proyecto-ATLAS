import { normalizeForSearch } from '@atlas/core';

import type { FeedbackLastTurn } from './feedback-types.js';

const WARRANTY_KEYWORDS = Object.freeze(['garantia', 'garantía', 'warranty']);

export interface ParsedWarrantyCorrection {
  readonly warrantyDays: number;
}

function mentionsWarranty(text: string): boolean {
  const normalized = normalizeForSearch(text);

  return WARRANTY_KEYWORDS.some((keyword) => normalized.includes(normalizeForSearch(keyword)));
}

export function parseWarrantyCorrectionDays(
  correctionText: string,
  lastTurn?: FeedbackLastTurn,
): ParsedWarrantyCorrection | undefined {
  const trimmed = correctionText.trim();

  if (trimmed.length === 0) {
    return undefined;
  }

  const context = [trimmed, lastTurn?.goal ?? '', lastTurn?.output ?? ''].join(' ');

  if (!mentionsWarranty(context)) {
    return undefined;
  }

  const match = trimmed.match(/(\d+)\s*d[ií]as?/i);

  if (match === null) {
    return undefined;
  }

  const warrantyDays = Number.parseInt(match[1] ?? '', 10);

  if (!Number.isFinite(warrantyDays) || warrantyDays < 0) {
    return undefined;
  }

  return Object.freeze({ warrantyDays });
}
