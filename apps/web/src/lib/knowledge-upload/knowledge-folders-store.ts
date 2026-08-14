import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { resolveWorkspacePaths } from '@atlas/cli';

import { KnowledgeUploadError } from './upload-errors.js';
import {
  DEFAULT_KNOWLEDGE_FOLDER,
  normalizeKnowledgeFolder,
  resolveKnowledgeFolder,
} from './folder.js';

interface KnowledgeFoldersFile {
  readonly folders: readonly string[];
}

function resolveKnowledgeFoldersPath(workspaceKey: string | undefined): string {
  const key = workspaceKey?.trim() || 'default';

  if (key === 'default') {
    const memoryPath =
      typeof process.env.ATLAS_MEMORY_FILE === 'string' &&
      process.env.ATLAS_MEMORY_FILE.trim().length > 0
        ? process.env.ATLAS_MEMORY_FILE.trim()
        : join(process.cwd(), '.atlas', 'memory.json');

    return join(dirname(memoryPath), 'knowledge-folders.json');
  }

  return join(resolveWorkspacePaths(key).directory, 'knowledge-folders.json');
}

function sortFolders(folders: Iterable<string>): readonly string[] {
  const unique = new Set<string>([DEFAULT_KNOWLEDGE_FOLDER]);

  for (const folder of folders) {
    unique.add(normalizeKnowledgeFolder(folder));
  }

  return Object.freeze(
    [...unique].sort((left, right) => {
      if (left === DEFAULT_KNOWLEDGE_FOLDER) {
        return -1;
      }

      if (right === DEFAULT_KNOWLEDGE_FOLDER) {
        return 1;
      }

      return left.localeCompare(right, 'es');
    }),
  );
}

function readFoldersFile(filePath: string): readonly string[] {
  if (!existsSync(filePath)) {
    return sortFolders([]);
  }

  try {
    const raw = JSON.parse(readFileSync(filePath, 'utf8')) as KnowledgeFoldersFile;
    return sortFolders(Array.isArray(raw.folders) ? raw.folders : []);
  } catch {
    return sortFolders([]);
  }
}

function writeFoldersFile(filePath: string, folders: readonly string[]): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(
    filePath,
    `${JSON.stringify({ folders: [...folders] }, null, 2)}\n`,
    'utf8',
  );
}

export function listStoredKnowledgeFolders(workspaceKey: string | undefined): readonly string[] {
  return readFoldersFile(resolveKnowledgeFoldersPath(workspaceKey));
}

export function mergeKnowledgeFolderLists(
  storedFolders: readonly string[],
  documentFolders: readonly string[],
): readonly string[] {
  return sortFolders([...storedFolders, ...documentFolders]);
}

export function createStoredKnowledgeFolder(
  workspaceKey: string | undefined,
  folderInput: string,
): readonly string[] {
  const folder = resolveKnowledgeFolder(folderInput);
  const filePath = resolveKnowledgeFoldersPath(workspaceKey);
  const existing = readFoldersFile(filePath);

  if (existing.includes(folder)) {
    throw new KnowledgeUploadError(409, `La carpeta «${folder}» ya existe.`);
  }

  const next = sortFolders([...existing, folder]);
  writeFoldersFile(filePath, next);
  return next;
}

export function registerKnowledgeFolderIfMissing(
  workspaceKey: string | undefined,
  folderInput: string,
): readonly string[] {
  const folder = normalizeKnowledgeFolder(folderInput);
  const filePath = resolveKnowledgeFoldersPath(workspaceKey);
  const existing = readFoldersFile(filePath);

  if (existing.includes(folder)) {
    return existing;
  }

  const next = sortFolders([...existing, folder]);
  writeFoldersFile(filePath, next);
  return next;
}
