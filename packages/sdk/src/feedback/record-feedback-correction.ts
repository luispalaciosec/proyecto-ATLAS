import type { Atlas } from '../atlas/atlas.js';
import { ORG_RECORD_TYPE_WARRANTY_POLICY } from '../org/constants.js';
import { readEntityPayload } from '../org/entity-resolver.js';
import { parseWarrantyPolicy } from '../org/schemas/warranty-policy.js';
import { resolveCurrentWarrantyByCode, resolvePolicyHistory } from '../org/version-resolver.js';
import {
  DEFAULT_WARRANTY_ENTITY_ID,
  DEFAULT_WARRANTY_POLICY_CODE,
  FEEDBACK_RECORD_TYPE,
  FEEDBACK_SOURCE_ATLAS_CORRECT,
  type FeedbackLastTurn,
  type RecordFeedbackCorrectionOptions,
  type RecordFeedbackCorrectionResult,
  type StructuredFeedbackCorrection,
} from './feedback-types.js';
import { parseWarrantyCorrectionDays } from './parse-warranty-correction.js';

function resolveWorkspace(atlas: Atlas, workspace?: string): string {
  const explicit = workspace?.trim();

  if (explicit !== undefined && explicit.length > 0) {
    return explicit;
  }

  return atlas.llm.getWorkspaceName();
}

function buildFeedbackSearchText(correction: StructuredFeedbackCorrection): string {
  const lines = [
    `User explicit correction (${correction.status})`,
    `Workspace: ${correction.workspace}`,
    `Original question: ${correction.originalGoal}`,
    `Correction: ${correction.reason}`,
  ];

  if (correction.targetType === 'WarrantyPolicy' && correction.correctedValue !== undefined) {
    lines.push(
      `WarrantyPolicy ${correction.targetPolicyCode ?? DEFAULT_WARRANTY_POLICY_CODE}: ${correction.correctedValue.warrantyDays} días`,
    );

    if (correction.previousValue !== undefined) {
      lines.push(`Previous warranty: ${correction.previousValue.warrantyDays} días`);
    }
  }

  return lines.join('\n');
}

async function applyWarrantyCorrection(
  atlas: Atlas,
  warrantyDays: number,
): Promise<{
  readonly applied: boolean;
  readonly targetEntityId: string;
  readonly targetPolicyCode: string;
  readonly previousValue?: Readonly<{ readonly warrantyDays: number }>;
  readonly correctedValue: Readonly<{ readonly warrantyDays: number }>;
}> {
  let current: Awaited<ReturnType<typeof resolveCurrentWarrantyByCode>> | undefined;

  try {
    current = await resolveCurrentWarrantyByCode(atlas, DEFAULT_WARRANTY_POLICY_CODE);
  } catch {
    current = undefined;
  }

  const correctedValue = Object.freeze({ warrantyDays });
  const targetEntityId = current?.entityId ?? DEFAULT_WARRANTY_ENTITY_ID;
  const targetPolicyCode = current?.content.policyCode ?? DEFAULT_WARRANTY_POLICY_CODE;
  const previousValue =
    current !== undefined
      ? Object.freeze({ warrantyDays: current.content.warrantyDays })
      : undefined;

  if (current !== undefined && current.content.warrantyDays === warrantyDays) {
    return Object.freeze({
      applied: false,
      targetEntityId,
      targetPolicyCode,
      ...(previousValue !== undefined ? { previousValue } : {}),
      correctedValue,
    });
  }

  const effectiveFrom = new Date().toISOString().slice(0, 10);

  await atlas.org.upsertEntity(
    ORG_RECORD_TYPE_WARRANTY_POLICY,
    targetEntityId,
    Object.freeze({
      policyCode: targetPolicyCode,
      warrantyDays,
      effectiveFrom,
    }),
    'user-feedback',
  );

  return Object.freeze({
    applied: true,
    targetEntityId,
    targetPolicyCode,
    ...(previousValue !== undefined ? { previousValue } : {}),
    correctedValue,
  });
}

export async function recordFeedbackCorrection(
  atlas: Atlas,
  lastTurn: FeedbackLastTurn,
  correctionText: string,
  options: RecordFeedbackCorrectionOptions = {},
): Promise<RecordFeedbackCorrectionResult> {
  const trimmedCorrection = correctionText.trim();
  const workspace = resolveWorkspace(atlas, options.workspace);
  const timestamp = new Date().toISOString();
  const parsedWarranty = parseWarrantyCorrectionDays(trimmedCorrection, lastTurn);

  let applied = false;
  let targetType: StructuredFeedbackCorrection['targetType'];
  let targetEntityId: string | undefined;
  let targetPolicyCode: string | undefined;
  let previousValue: StructuredFeedbackCorrection['previousValue'];
  let correctedValue: StructuredFeedbackCorrection['correctedValue'];

  if (parsedWarranty !== undefined) {
    const warrantyUpdate = await applyWarrantyCorrection(atlas, parsedWarranty.warrantyDays);
    applied = warrantyUpdate.applied;
    targetType = 'WarrantyPolicy';
    targetEntityId = warrantyUpdate.targetEntityId;
    targetPolicyCode = warrantyUpdate.targetPolicyCode;
    previousValue = warrantyUpdate.previousValue;
    correctedValue = warrantyUpdate.correctedValue;
  }

  const correctionId = `correction.${Date.now()}.${Math.random().toString(36).slice(2, 10)}`;

  const correction = Object.freeze({
    correctionId,
    workspace,
    timestamp,
    source: FEEDBACK_SOURCE_ATLAS_CORRECT,
    originalGoal: lastTurn.goal,
    originalOutput: lastTurn.output,
    reason: trimmedCorrection,
    status: applied ? ('applied' as const) : ('recorded' as const),
    ...(targetType !== undefined ? { targetType } : {}),
    ...(targetEntityId !== undefined ? { targetEntityId } : {}),
    ...(targetPolicyCode !== undefined ? { targetPolicyCode } : {}),
    ...(previousValue !== undefined ? { previousValue } : {}),
    ...(correctedValue !== undefined ? { correctedValue } : {}),
    ...(options.conversationId !== undefined ? { conversationId: options.conversationId } : {}),
    ...(options.sessionId !== undefined ? { sessionId: options.sessionId } : {}),
  });

  const stored = await atlas.memory.storeStructuredRecord({
    recordType: FEEDBACK_RECORD_TYPE,
    content: Object.freeze({
      text: buildFeedbackSearchText(correction),
      correction,
    }),
    metadata: Object.freeze({
      source: FEEDBACK_SOURCE_ATLAS_CORRECT,
      workspace,
      correctionId,
      originalGoal: lastTurn.goal,
      originalOutput: lastTurn.output,
      ...(targetType !== undefined ? { targetType } : {}),
      ...(targetEntityId !== undefined ? { targetEntityId } : {}),
      ...(targetPolicyCode !== undefined ? { targetPolicyCode } : {}),
      ...(previousValue !== undefined ? { previousWarrantyDays: previousValue.warrantyDays } : {}),
      ...(correctedValue !== undefined
        ? { correctedWarrantyDays: correctedValue.warrantyDays }
        : {}),
      status: correction.status,
    }),
  });

  return Object.freeze({
    recordId: stored.recordId,
    correctionId,
    applied,
    correction,
  });
}

export async function readCurrentWarrantyDays(
  atlas: Atlas,
  policyCode: string = DEFAULT_WARRANTY_POLICY_CODE,
): Promise<number | undefined> {
  try {
    const current = await resolveCurrentWarrantyByCode(atlas, policyCode);
    return current.content.warrantyDays;
  } catch {
    return undefined;
  }
}

export async function readHistoricalWarrantyDays(
  atlas: Atlas,
  entityId: string = DEFAULT_WARRANTY_ENTITY_ID,
): Promise<readonly number[]> {
  try {
    const current = await resolveCurrentWarrantyByCode(atlas, DEFAULT_WARRANTY_POLICY_CODE);
    const history = await resolvePolicyHistory(atlas, entityId);

    return Object.freeze([
      ...history.map((entry) => parseWarrantyPolicy(entry.content).warrantyDays),
      parseWarrantyPolicy(readEntityPayload(current.record)).warrantyDays,
    ]);
  } catch {
    return Object.freeze([]);
  }
}
