export const FEEDBACK_RECORD_TYPE = 'Feedback';
export const FEEDBACK_SOURCE_ATLAS_CORRECT = 'atlas-correct';

export const DEFAULT_WARRANTY_ENTITY_ID = 'record.policy.warranty.standard';
export const DEFAULT_WARRANTY_POLICY_CODE = 'WARRANTY-STD';

export interface FeedbackLastTurn {
  readonly goal: string;
  readonly output: string;
}

export interface RecordFeedbackCorrectionOptions {
  readonly workspace?: string;
  readonly conversationId?: string;
  readonly sessionId?: string;
}

export interface StructuredFeedbackCorrection {
  readonly correctionId: string;
  readonly workspace: string;
  readonly timestamp: string;
  readonly source: typeof FEEDBACK_SOURCE_ATLAS_CORRECT;
  readonly originalGoal: string;
  readonly originalOutput: string;
  readonly reason: string;
  readonly status: 'applied' | 'recorded';
  readonly targetType?: 'WarrantyPolicy';
  readonly targetEntityId?: string;
  readonly targetPolicyCode?: string;
  readonly previousValue?: Readonly<{ readonly warrantyDays: number }>;
  readonly correctedValue?: Readonly<{ readonly warrantyDays: number }>;
  readonly conversationId?: string;
  readonly sessionId?: string;
}

export interface RecordFeedbackCorrectionResult {
  readonly recordId: string;
  readonly correctionId: string;
  readonly applied: boolean;
  readonly correction: StructuredFeedbackCorrection;
}
