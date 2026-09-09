/** Internal action executed after governance authorization. */
export const INTERNAL_ACTION_RECORD_APPROVED_DISCOUNT = 'record_approved_discount_request' as const;

export type InternalActionType = typeof INTERNAL_ACTION_RECORD_APPROVED_DISCOUNT;

/** Memory record type for a successfully executed approved discount action. */
export const GOVERNANCE_RECORD_TYPE_APPROVED_DISCOUNT = 'ApprovedDiscountRequest';

/** Canonical operational result persisted for governance closure (INT-007). */
export const GOVERNANCE_RECORD_TYPE_ACTION_OPERATIONAL_RESULT = 'ActionOperationalResult';
