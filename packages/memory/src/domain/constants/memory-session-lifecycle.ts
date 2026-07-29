import { MemorySessionStatus } from '../value-objects/memory-session-status.js';

/**
 * CONTRACT-005 §6 — deterministic lifecycle transitions.
 *
 * From Running there are two alternative terminal branches:
 *   Running → Completed → Disposed
 *   Running → Failed    → Disposed
 */
export const MEMORY_SESSION_TRANSITIONS: Readonly<
  Record<MemorySessionStatus, readonly MemorySessionStatus[]>
> = Object.freeze({
  [MemorySessionStatus.Created]: Object.freeze([MemorySessionStatus.Initialized]),
  [MemorySessionStatus.Initialized]: Object.freeze([MemorySessionStatus.Running]),
  [MemorySessionStatus.Running]: Object.freeze([
    MemorySessionStatus.Completed,
    MemorySessionStatus.Failed,
  ]),
  [MemorySessionStatus.Completed]: Object.freeze([MemorySessionStatus.Disposed]),
  [MemorySessionStatus.Failed]: Object.freeze([MemorySessionStatus.Disposed]),
  [MemorySessionStatus.Disposed]: Object.freeze([]),
});

export function isAllowedMemorySessionTransition(
  from: MemorySessionStatus,
  to: MemorySessionStatus,
): boolean {
  return MEMORY_SESSION_TRANSITIONS[from].includes(to);
}

export const MEMORY_SESSION_TERMINAL_STATUSES: readonly MemorySessionStatus[] = Object.freeze([
  MemorySessionStatus.Disposed,
]);

export function isTerminalMemorySessionStatus(status: MemorySessionStatus): boolean {
  return status === MemorySessionStatus.Disposed;
}
