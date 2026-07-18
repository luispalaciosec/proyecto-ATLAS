import { describe, expect, it } from 'vitest';

import { parseWorkspaceConfig } from '../src/configuration/workspace-config.js';
import { CliExitError, EXIT_VALIDATION_ERROR } from '../src/output/exit-codes.js';

describe('parseWorkspaceConfig', () => {
  it('parses a valid workspace definition', () => {
    const workspace = parseWorkspaceConfig({
      name: 'valid',
      units: [
        {
          id: 'doc.valid',
          origin: 'memory://doc.valid',
          checksum: 'sha256:valid',
          version: '1.0.0',
          source: { ok: true },
        },
      ],
    });

    expect(workspace.name).toBe('valid');
    expect(workspace.units).toHaveLength(1);
  });

  it('rejects non-object configs', () => {
    try {
      parseWorkspaceConfig(null);
      expect.fail('expected validation error');
    } catch (error) {
      expect(error).toBeInstanceOf(CliExitError);
      expect((error as CliExitError).code).toBe(EXIT_VALIDATION_ERROR);
    }
  });

  it('rejects configs without name', () => {
    try {
      parseWorkspaceConfig({ units: [] });
      expect.fail('expected validation error');
    } catch (error) {
      expect((error as CliExitError).code).toBe(EXIT_VALIDATION_ERROR);
    }
  });

  it('rejects configs without units array', () => {
    try {
      parseWorkspaceConfig({ name: 'missing-units' });
      expect.fail('expected validation error');
    } catch (error) {
      expect((error as CliExitError).code).toBe(EXIT_VALIDATION_ERROR);
    }
  });

  it('rejects units without source', () => {
    try {
      parseWorkspaceConfig({
        name: 'bad-unit',
        units: [
          {
            id: 'doc.bad',
            origin: 'memory://doc.bad',
            checksum: 'sha256:bad',
            version: '1.0.0',
          },
        ],
      });
      expect.fail('expected validation error');
    } catch (error) {
      expect((error as CliExitError).code).toBe(EXIT_VALIDATION_ERROR);
    }
  });
});
