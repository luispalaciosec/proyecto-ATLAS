import type { MemorySession } from '../domain/types/memory-session-types.js';

/**
 * Internal registry for MemorySession instances created exclusively by MemoryEngine.
 * No persistence — in-memory only for validateSessions() and integration diagnostics.
 */
export class MemoryEngineSessionRegistry {
  private activeSession: MemorySession | undefined;
  private readonly completedSessions: MemorySession[] = [];

  beginActiveSession(session: MemorySession): void {
    if (this.activeSession !== undefined) {
      throw new Error('MemoryEngine already has an active MemorySession for this execution');
    }

    this.activeSession = session;
  }

  updateActiveSession(session: MemorySession): void {
    if (this.activeSession === undefined) {
      throw new Error('MemoryEngine has no active MemorySession to update');
    }

    this.activeSession = session;
  }

  clearActiveSession(): void {
    this.activeSession = undefined;
  }

  getActiveSession(): MemorySession | undefined {
    return this.activeSession;
  }

  registerCompletedSession(session: MemorySession): void {
    this.completedSessions.push(session);
    this.activeSession = undefined;
  }

  getCompletedSessions(): readonly MemorySession[] {
    return Object.freeze([...this.completedSessions]);
  }

  getSessionsForValidation(): readonly MemorySession[] {
    const sessions = [...this.completedSessions];
    if (this.activeSession !== undefined) {
      sessions.push(this.activeSession);
    }

    return Object.freeze(sessions);
  }
}
