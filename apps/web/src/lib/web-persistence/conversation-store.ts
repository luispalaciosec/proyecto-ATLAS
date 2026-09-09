import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import type { LlmMessage } from '@atlas/sdk';

import type { UiHistoryMessage } from './types.js';
import { resolveConversationFilePath } from './workspace-storage-paths.js';

interface PersistedLastTurn {
  readonly goal: string;
  readonly output: string;
}

export interface PersistedHistoryMessage {
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly createdAt: string;
}

export interface PersistedConversationFile {
  readonly conversationId: string;
  readonly workspace: string;
  readonly brand?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly sessionId: string;
  readonly turnCount: number;
  readonly lastMemorySessionId?: string;
  readonly history: readonly LlmMessage[];
  readonly turnBoundaries: readonly number[];
  readonly lastTurn?: PersistedLastTurn;
  readonly deterministicHistory: readonly PersistedHistoryMessage[];
}

export interface ConversationPersistInput {
  readonly workspaceKey: string;
  readonly brand?: string;
  readonly conversationId: string;
  readonly createdAt: string;
  readonly sessionId: string;
  readonly turnCount: number;
  readonly lastMemorySessionId?: string;
  readonly history: readonly LlmMessage[];
  readonly turnBoundaries: readonly number[];
  readonly lastTurn?: PersistedLastTurn;
  readonly deterministicHistory: readonly UiHistoryMessage[];
  readonly historyTimestamps: ReadonlyMap<number, string>;
}

function normalizeWorkspaceKey(workspaceKey: string | undefined): string {
  return workspaceKey?.trim() || 'default';
}

function emptyConversation(workspaceKey: string | undefined): PersistedConversationFile {
  const workspace = normalizeWorkspaceKey(workspaceKey);
  const now = new Date().toISOString();

  return Object.freeze({
    conversationId: `conversation.${workspace}.${Date.now()}`,
    workspace,
    createdAt: now,
    updatedAt: now,
    sessionId: `chat.${Date.now()}`,
    turnCount: 0,
    history: Object.freeze([]),
    turnBoundaries: Object.freeze([]),
    deterministicHistory: Object.freeze([]),
  });
}

function toPersistedDeterministicHistory(
  messages: readonly UiHistoryMessage[],
  baseTime: string,
): readonly PersistedHistoryMessage[] {
  const baseMs = Date.parse(baseTime);

  return Object.freeze(
    messages.map((message, index) =>
      Object.freeze({
        role: message.role,
        content: message.content,
        createdAt: new Date(baseMs + index * 1000).toISOString(),
      }),
    ),
  );
}

function toPersistedLlmHistory(
  history: readonly LlmMessage[],
  historyTimestamps: ReadonlyMap<number, string>,
  updatedAt: string,
): readonly PersistedHistoryMessage[] {
  const visible: PersistedHistoryMessage[] = [];
  let fallbackIndex = 0;
  const baseMs = Date.parse(updatedAt);

  for (let index = 0; index < history.length; index += 1) {
    const message = history[index];

    if (message === undefined) {
      continue;
    }

    if (message.role !== 'user' && message.role !== 'assistant') {
      continue;
    }

    if (message.content.trim().length === 0) {
      continue;
    }

    const createdAt =
      historyTimestamps.get(index) ??
      new Date(baseMs - (history.length - fallbackIndex) * 1000).toISOString();

    visible.push(
      Object.freeze({
        role: message.role,
        content: message.content.trim(),
        createdAt,
      }),
    );
    fallbackIndex += 1;
  }

  return Object.freeze(visible);
}

export function readPersistedConversation(
  workspaceKey: string | undefined,
): PersistedConversationFile | undefined {
  const filePath = resolveConversationFilePath(workspaceKey);

  if (!existsSync(filePath)) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf8')) as PersistedConversationFile;

    if (
      typeof parsed.workspace !== 'string' ||
      parsed.workspace !== normalizeWorkspaceKey(workspaceKey)
    ) {
      return undefined;
    }

    return Object.freeze({
      ...parsed,
      history: Object.freeze(Array.isArray(parsed.history) ? [...parsed.history] : []),
      turnBoundaries: Object.freeze(
        Array.isArray(parsed.turnBoundaries) ? [...parsed.turnBoundaries] : [],
      ),
      deterministicHistory: Object.freeze(
        Array.isArray(parsed.deterministicHistory) ? [...parsed.deterministicHistory] : [],
      ),
    });
  } catch {
    return undefined;
  }
}

export function writePersistedConversation(
  input: ConversationPersistInput,
): PersistedConversationFile {
  const workspace = normalizeWorkspaceKey(input.workspaceKey);
  const filePath = resolveConversationFilePath(workspace);
  const existing = readPersistedConversation(workspace);
  const updatedAt = new Date().toISOString();
  const createdAt = existing?.createdAt ?? input.createdAt;
  const conversationId = existing?.conversationId ?? input.conversationId;

  const deterministicHistory =
    input.deterministicHistory.length > 0
      ? toPersistedDeterministicHistory(input.deterministicHistory, updatedAt)
      : (existing?.deterministicHistory ?? Object.freeze([]));

  const visibleHistory =
    input.history.some((message) => message.content.trim().length > 0) ||
    input.history.some((message) => message.role === 'user' || message.role === 'assistant')
      ? toPersistedLlmHistory(input.history, input.historyTimestamps, updatedAt)
      : deterministicHistory;

  const payload: PersistedConversationFile = Object.freeze({
    conversationId,
    workspace,
    ...(input.brand !== undefined ? { brand: input.brand } : {}),
    createdAt,
    updatedAt,
    sessionId: input.sessionId,
    turnCount: input.turnCount,
    ...(input.lastMemorySessionId !== undefined
      ? { lastMemorySessionId: input.lastMemorySessionId }
      : {}),
    history: Object.freeze([...input.history]),
    turnBoundaries: Object.freeze([...input.turnBoundaries]),
    ...(input.lastTurn !== undefined ? { lastTurn: input.lastTurn } : {}),
    deterministicHistory: visibleHistory,
  });

  try {
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  } catch {
    // Persistence failures must not corrupt in-memory state; caller keeps serving runtime data.
  }

  return payload;
}

export function createInitialConversationMetadata(workspaceKey: string | undefined): {
  readonly conversationId: string;
  readonly createdAt: string;
} {
  const workspace = normalizeWorkspaceKey(workspaceKey);
  const existing = readPersistedConversation(workspace);

  if (existing !== undefined) {
    return Object.freeze({
      conversationId: existing.conversationId,
      createdAt: existing.createdAt,
    });
  }

  const now = new Date().toISOString();

  return Object.freeze({
    conversationId: `conversation.${workspace}.${Date.now()}`,
    createdAt: now,
  });
}

export function readConversationForWorkspace(
  workspaceKey: string | undefined,
): PersistedConversationFile {
  return readPersistedConversation(workspaceKey) ?? emptyConversation(workspaceKey);
}
