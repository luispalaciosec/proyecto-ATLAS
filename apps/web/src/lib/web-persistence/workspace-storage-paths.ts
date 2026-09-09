import { join } from 'node:path';

import { resolveWorkspacePaths } from '@atlas/cli';

export function resolveWebWorkspacesRoot(): string {
  const fromEnv = process.env.ATLAS_WORKSPACES_ROOT;

  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return fromEnv.trim();
  }

  return join(process.cwd(), '.atlas', 'workspaces');
}

export function resolveDefaultAtlasDirectory(): string {
  const memoryPath =
    typeof process.env.ATLAS_MEMORY_FILE === 'string' &&
    process.env.ATLAS_MEMORY_FILE.trim().length > 0
      ? process.env.ATLAS_MEMORY_FILE.trim()
      : join(process.cwd(), '.atlas', 'memory.json');

  return join(memoryPath, '..');
}

export function resolveWorkspaceStorageDirectory(workspaceKey: string | undefined): string {
  const key = workspaceKey?.trim() || 'default';

  if (key === 'default') {
    return resolveDefaultAtlasDirectory();
  }

  return resolveWorkspacePaths(key, resolveWebWorkspacesRoot()).directory;
}

export function resolveConversationFilePath(workspaceKey: string | undefined): string {
  return join(resolveWorkspaceStorageDirectory(workspaceKey), 'conversation.json');
}

export function resolveActivityFilePath(workspaceKey: string | undefined): string {
  return join(resolveWorkspaceStorageDirectory(workspaceKey), 'activity.json');
}
