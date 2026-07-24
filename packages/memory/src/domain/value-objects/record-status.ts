export const RecordStatus = {
  Active: 'active',
  Archived: 'archived',
  Deleted: 'deleted',
  Locked: 'locked',
  Pending: 'pending',
} as const;

export type RecordStatus = (typeof RecordStatus)[keyof typeof RecordStatus];

export const RECORD_STATUSES: readonly RecordStatus[] = Object.freeze(Object.values(RecordStatus));

export function isRecordStatus(value: string): value is RecordStatus {
  return (RECORD_STATUSES as readonly string[]).includes(value);
}
