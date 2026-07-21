/**
 * @see ATLAS-RUNTIME-008 Error Model
 */
export const RUNTIME_ERROR_CATEGORIES = [
  'compilation',
  'knowledge',
  'context',
  'reasoning',
  'planning',
  'workflow',
  'task',
  'agent',
  'pipeline',
  'lifecycle',
  'state',
  'system',
] as const;

export type RuntimeErrorCategory = (typeof RUNTIME_ERROR_CATEGORIES)[number];

export interface RuntimeErrorRecord {
  readonly error_id: string;
  readonly category: RuntimeErrorCategory;
  readonly execution_id: string;
  readonly correlation_id: string;
  readonly message: string;
  readonly occurred_at: string;
  readonly recoverable: boolean;
}
