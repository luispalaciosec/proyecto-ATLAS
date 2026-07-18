import { describe, expect, it } from 'vitest';

import { createGeneratorRegistry, createPublisherRegistry } from '../src/index.js';

describe('GeneratorRegistry', () => {
  it('registers and resolves generators', () => {
    const registry = createGeneratorRegistry([
      {
        id: 'json-generator',
        supported_formats: ['json'],
        generate: () => [],
      },
    ]);

    expect(registry.resolve('json-generator')?.id).toBe('json-generator');
    expect(registry.list()).toHaveLength(1);
  });

  it('rejects duplicate registrations', () => {
    const registry = createGeneratorRegistry();
    const generator = {
      id: 'dup',
      supported_formats: ['json'],
      generate: () => [],
    };

    registry.register(generator);
    expect(() => registry.register(generator)).toThrow('Generator already registered: dup');
  });
});

describe('PublisherRegistry', () => {
  it('registers and resolves publishers', () => {
    const registry = createPublisherRegistry([
      {
        id: 'filesystem-publisher',
        supported_targets: ['filesystem'],
        publish: () => [],
      },
    ]);

    expect(registry.resolve('filesystem-publisher')?.id).toBe('filesystem-publisher');
  });

  it('rejects duplicate registrations', () => {
    const registry = createPublisherRegistry();
    const publisher = {
      id: 'dup',
      supported_targets: ['filesystem'],
      publish: () => [],
    };

    registry.register(publisher);
    expect(() => registry.register(publisher)).toThrow('Publisher already registered: dup');
  });
});
