import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import type { RawActivityEvent } from '../../presentation/map-activity.js';
import { resolveActivityFilePath } from './workspace-storage-paths.js';

interface ActivityFile {
  readonly events: readonly RawActivityEvent[];
}

const MAX_ACTIVITY_EVENTS = 200;

function normalizeWorkspaceKey(workspaceKey: string | undefined): string {
  return workspaceKey?.trim() || 'default';
}

function dedupeEvents(events: readonly RawActivityEvent[]): readonly RawActivityEvent[] {
  const byId = new Map<string, RawActivityEvent>();

  for (const event of events) {
    byId.set(event.id, event);
  }

  return Object.freeze(
    [...byId.values()].sort(
      (left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt),
    ),
  );
}

export function readPersistedActivity(
  workspaceKey: string | undefined,
): readonly RawActivityEvent[] {
  const filePath = resolveActivityFilePath(workspaceKey);

  if (!existsSync(filePath)) {
    return Object.freeze([]);
  }

  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf8')) as ActivityFile;
    const workspace = normalizeWorkspaceKey(workspaceKey);
    const events = Array.isArray(parsed.events) ? parsed.events : [];

    return dedupeEvents(
      events.filter((event) => event.workspace === workspace).slice(0, MAX_ACTIVITY_EVENTS),
    );
  } catch {
    return Object.freeze([]);
  }
}

export function writePersistedActivity(
  workspaceKey: string | undefined,
  events: readonly RawActivityEvent[],
): readonly RawActivityEvent[] {
  const workspace = normalizeWorkspaceKey(workspaceKey);
  const filePath = resolveActivityFilePath(workspace);
  const normalized = dedupeEvents(
    events.filter((event) => event.workspace === workspace).slice(0, MAX_ACTIVITY_EVENTS),
  );

  try {
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(
      filePath,
      `${JSON.stringify({ events: [...normalized] } satisfies ActivityFile, null, 2)}\n`,
      'utf8',
    );
  } catch {
    // Keep in-memory activity if disk write fails.
  }

  return normalized;
}
