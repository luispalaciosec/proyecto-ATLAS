import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export interface WorkspaceProfile {
  readonly name: string;
  readonly purpose: string;
  readonly tone: string;
  readonly processes: readonly string[];
  readonly clients: readonly string[];
  readonly rules: readonly string[];
  readonly createdAt: string;
}

export interface WorkspacePaths {
  readonly slug: string;
  readonly directory: string;
  readonly profilePath: string;
  readonly memoryFilePath: string;
}

export function sanitizeBrandSlug(name: string): string {
  const trimmed = name.trim().toLowerCase();

  if (trimmed.length === 0) {
    throw new Error('Brand name must not be empty');
  }

  if (trimmed.includes('/') || trimmed.includes('..')) {
    throw new Error('Invalid brand name');
  }

  const slug = trimmed
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (slug.length === 0) {
    throw new Error('Brand name must contain valid characters');
  }

  return slug;
}

export function resolveWorkspacePaths(name: string, rootDir?: string): WorkspacePaths {
  const slug = sanitizeBrandSlug(name);
  const workspacesRoot = rootDir ?? join(process.cwd(), '.atlas', 'workspaces');
  const directory = join(workspacesRoot, slug);

  return Object.freeze({
    slug,
    directory,
    profilePath: join(directory, 'profile.json'),
    memoryFilePath: join(directory, 'memory.json'),
  });
}

function createDefaultProfile(displayName: string): WorkspaceProfile {
  return Object.freeze({
    name: displayName.trim(),
    purpose: '',
    tone: '',
    processes: Object.freeze([]),
    clients: Object.freeze([]),
    rules: Object.freeze([]),
    createdAt: new Date().toISOString(),
  });
}

export function loadOrCreateBrandProfile(
  paths: WorkspacePaths,
  displayName?: string,
): WorkspaceProfile {
  if (!existsSync(paths.directory)) {
    mkdirSync(paths.directory, { recursive: true });
  }

  if (!existsSync(paths.profilePath)) {
    const profile = createDefaultProfile(displayName ?? paths.slug);
    writeFileSync(paths.profilePath, `${JSON.stringify(profile, null, 2)}\n`, 'utf8');
    return profile;
  }

  return JSON.parse(readFileSync(paths.profilePath, 'utf8')) as WorkspaceProfile;
}

export function renderProfileAsContext(profile: WorkspaceProfile): string {
  const sections: string[] = [`Brand: ${profile.name}`];

  if (profile.purpose.trim().length > 0) {
    sections.push(`Purpose: ${profile.purpose}`);
  }

  if (profile.tone.trim().length > 0) {
    sections.push(`Tone: ${profile.tone}`);
  }

  if (profile.processes.length > 0) {
    sections.push(`Processes:\n${profile.processes.map((process) => `- ${process}`).join('\n')}`);
  }

  if (profile.clients.length > 0) {
    sections.push(`Clients:\n${profile.clients.map((client) => `- ${client}`).join('\n')}`);
  }

  if (profile.rules.length > 0) {
    sections.push(`Rules:\n${profile.rules.map((rule) => `- ${rule}`).join('\n')}`);
  }

  return sections.join('\n\n');
}

export function listWorkspaces(rootDir?: string): readonly string[] {
  const workspacesRoot = rootDir ?? join(process.cwd(), '.atlas', 'workspaces');

  if (!existsSync(workspacesRoot)) {
    return Object.freeze([]);
  }

  return Object.freeze(
    readdirSync(workspacesRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort(),
  );
}
