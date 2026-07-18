import type { Publisher } from '../contracts/publisher.js';

export class PublisherRegistry {
  readonly #publishers = new Map<string, Publisher>();

  register(publisher: Publisher): void {
    if (this.#publishers.has(publisher.id)) {
      throw new Error(`Publisher already registered: ${publisher.id}`);
    }

    this.#publishers.set(publisher.id, publisher);
  }

  resolve(id: string): Publisher | undefined {
    return this.#publishers.get(id);
  }

  list(): readonly Publisher[] {
    return Object.freeze([...this.#publishers.values()]);
  }
}

export function createPublisherRegistry(publishers: readonly Publisher[] = []): PublisherRegistry {
  const registry = new PublisherRegistry();

  for (const publisher of publishers) {
    registry.register(publisher);
  }

  return registry;
}
