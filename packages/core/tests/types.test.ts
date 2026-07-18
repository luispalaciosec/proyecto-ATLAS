import { describe, expect, it } from 'vitest';

import { createAtlasError, isAtlasError } from '../src/errors/index.js';
import { Identifier, Metadata, Namespace, Version } from '../src/types/index.js';

describe('Identifier', () => {
  it('creates a valid identifier', () => {
    const id = Identifier.create('entity-123');
    expect(id.toJSON()).toBe('entity-123');
    expect(id.toString()).toBe('entity-123');
  });

  it('compares by value', () => {
    expect(Identifier.create('a.b').equals(Identifier.create('a.b'))).toBe(true);
    expect(Identifier.create('a.b').equals(Identifier.create('a.c'))).toBe(false);
  });

  it('rejects invalid identifiers with AtlasError', () => {
    expect(() => Identifier.create('')).toThrow(
      expect.objectContaining({ code: 'CORE_INVALID_IDENTIFIER' }),
    );
    expect(() => Identifier.create('123-invalid')).toThrow(
      expect.objectContaining({ code: 'CORE_INVALID_IDENTIFIER' }),
    );
  });
});

describe('Version', () => {
  it('parses semantic versions', () => {
    const version = Version.create('1.2.3');
    expect(version.toJSON()).toBe('1.2.3');
    expect(version.major).toBe(1);
    expect(version.minor).toBe(2);
    expect(version.patch).toBe(3);
  });

  it('compares by value', () => {
    expect(Version.create('1.0.0').equals(Version.create('1.0.0'))).toBe(true);
    expect(Version.create('1.0.0').equals(Version.create('2.0.0'))).toBe(false);
  });

  it('rejects invalid semver', () => {
    expect(() => Version.create('1.0')).toThrow(
      expect.objectContaining({ code: 'CORE_INVALID_VERSION' }),
    );
    expect(() => Version.create('01.0.0')).toThrow(
      expect.objectContaining({ code: 'CORE_INVALID_VERSION' }),
    );
  });
});

describe('Metadata', () => {
  it('creates immutable metadata', () => {
    const metadata = Metadata.create({ owner: 'atlas', level: 1 });
    expect(metadata.get('owner')).toBe('atlas');
    expect(metadata.toJSON()).toEqual({ owner: 'atlas', level: 1 });
  });

  it('supports empty metadata', () => {
    expect(Metadata.empty().toJSON()).toEqual({});
  });

  it('compares by value', () => {
    expect(Metadata.create({ a: 1 }).equals(Metadata.create({ a: 1 }))).toBe(true);
    expect(Metadata.create({ a: 1 }).equals(Metadata.create({ a: 2 }))).toBe(false);
  });

  it('rejects invalid metadata input', () => {
    expect(() => Metadata.create(null as unknown as Record<string, unknown>)).toThrow(
      expect.objectContaining({ code: 'CORE_INVALID_METADATA' }),
    );
  });
});

describe('Namespace', () => {
  it('creates normalized namespaces', () => {
    const namespace = Namespace.create('Atlas.Knowledge');
    expect(namespace.toJSON()).toBe('atlas.knowledge');
  });

  it('compares by value', () => {
    expect(Namespace.create('a.b').equals(Namespace.create('a.b'))).toBe(true);
    expect(Namespace.create('a.b').equals(Namespace.create('a.c'))).toBe(false);
  });

  it('rejects invalid namespaces', () => {
    expect(() => Namespace.create('')).toThrow(
      expect.objectContaining({ code: 'CORE_INVALID_NAMESPACE' }),
    );
    expect(() => Namespace.create('1invalid')).toThrow(
      expect.objectContaining({ code: 'CORE_INVALID_NAMESPACE' }),
    );
  });
});

describe('Value Object error shape', () => {
  it('throws structured AtlasError instances', () => {
    try {
      Identifier.create('');
    } catch (error) {
      expect(isAtlasError(error)).toBe(true);
      expect(createAtlasError).toBeTypeOf('function');
    }
  });
});
