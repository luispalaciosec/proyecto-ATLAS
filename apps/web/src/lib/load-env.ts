import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function unquote(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

/**
 * Loads KEY=VALUE pairs from a .env file into process.env without overriding
 * variables already set in the shell.
 */
export function loadEnvFromFile(envPath = join(process.cwd(), '.env')): void {
  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, 'utf8');

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();

    if (line.length === 0 || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = unquote(line.slice(separatorIndex + 1).trim());

    if (key.length > 0 && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
