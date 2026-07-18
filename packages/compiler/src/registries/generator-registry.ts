import type { Generator } from '../contracts/generator.js';

export class GeneratorRegistry {
  readonly #generators = new Map<string, Generator>();

  register(generator: Generator): void {
    if (this.#generators.has(generator.id)) {
      throw new Error(`Generator already registered: ${generator.id}`);
    }

    this.#generators.set(generator.id, generator);
  }

  resolve(id: string): Generator | undefined {
    return this.#generators.get(id);
  }

  list(): readonly Generator[] {
    return Object.freeze([...this.#generators.values()]);
  }
}

export function createGeneratorRegistry(generators: readonly Generator[] = []): GeneratorRegistry {
  const registry = new GeneratorRegistry();

  for (const generator of generators) {
    registry.register(generator);
  }

  return registry;
}
