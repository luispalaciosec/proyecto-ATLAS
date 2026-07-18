import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { CliExitError, EXIT_CONFIGURATION_ERROR } from '../output/exit-codes.js';
import { parseWorkspaceConfig, type WorkspaceConfig } from './workspace-config.js';

export const WORKSPACE_FILE_NAME = 'atlas.workspace.json';

export class WorkspaceLoader {
  resolvePath(workspacePath: string): string {
    return resolve(workspacePath);
  }

  configPath(workspacePath: string): string {
    return join(this.resolvePath(workspacePath), WORKSPACE_FILE_NAME);
  }

  load(workspacePath: string): WorkspaceConfig {
    const resolved = this.resolvePath(workspacePath);
    const configPath = join(resolved, WORKSPACE_FILE_NAME);

    if (!existsSync(configPath)) {
      throw new CliExitError(
        EXIT_CONFIGURATION_ERROR,
        `Missing ${WORKSPACE_FILE_NAME} in ${resolved}`,
      );
    }

    let raw: unknown;

    try {
      raw = JSON.parse(readFileSync(configPath, 'utf8')) as unknown;
    } catch {
      throw new CliExitError(EXIT_CONFIGURATION_ERROR, `Invalid JSON in ${configPath}`);
    }

    return parseWorkspaceConfig(raw);
  }
}
