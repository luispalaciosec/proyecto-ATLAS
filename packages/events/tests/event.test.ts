import { describe, expect, it, beforeEach } from 'vitest';

import {
  createDomainEvent,
  createEventSource,
  createEventType,
  defineEvent,
  isDomainEvent,
  resetDomainEventCounter,
} from '../src/index.js';

interface DemoPayload {
  readonly value: string;
}

describe('defineEvent', () => {
  beforeEach(() => {
    resetDomainEventCounter();
  });

  it('creates strongly typed domain events', () => {
    const DemoEvent = defineEvent<DemoPayload>({
      type: createEventType('demo.created'),
      version: '1.0.0',
    });

    const event = DemoEvent.create(
      { value: 'atlas' },
      { source: createEventSource('@atlas/demo') },
    );

    expect(event.type).toBe('demo.created');
    expect(event.payload.value).toBe('atlas');
    expect(event.version.toJSON()).toBe('1.0.0');
    expect(isDomainEvent(event)).toBe(true);
    expect(Object.isFrozen(event)).toBe(true);
  });

  it('rejects invalid event type patterns', () => {
    expect(() => createEventType('InvalidEvent')).toThrow(/Resource.Action/);
  });
});

describe('createDomainEvent', () => {
  beforeEach(() => {
    resetDomainEventCounter();
  });

  it('assigns unique event ids', () => {
    const type = createEventType('demo.created');

    const first = createDomainEvent({
      type,
      version: '1.0.0',
      payload: {},
      source: createEventSource('@atlas/demo'),
    });
    const second = createDomainEvent({
      type,
      version: '1.0.0',
      payload: {},
      source: createEventSource('@atlas/demo'),
    });

    expect(first.id.toJSON()).not.toBe(second.id.toJSON());
  });
});
