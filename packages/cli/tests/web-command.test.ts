import { describe, expect, it } from 'vitest';

import { createContainer } from '../src/application/container.js';
import { resolveWebServerPath } from '../src/commands/web-command.js';

describe('atlas web command', () => {
  it('registers web in the CLI command list', () => {
    const container = createContainer();
    const names = container.commandRegistry.list().map((command) => command.name);

    expect(names).toContain('web');
  });

  it('resolves the @atlas/web server entrypoint', () => {
    const serverPath = resolveWebServerPath();

    expect(serverPath).toContain('apps/web/dist/server.js');
  });
});
