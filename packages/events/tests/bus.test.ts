import { describe, expect, it } from 'vitest';

import {
  CompilerCompletedEvent,
  createEventPublisher,
  createEventType,
  createInMemoryEventBus,
  defineEvent,
  type CompilerCompletedPayload,
} from '../src/index.js';

describe('InMemoryEventBus', () => {
  it('delivers events synchronously to subscribers', () => {
    const bus = createInMemoryEventBus();
    const received: string[] = [];

    const DemoEvent = defineEvent<{ message: string }>({
      type: createEventType('demo.delivered'),
      version: '1.0.0',
    });

    bus.subscribe(DemoEvent, (event) => {
      received.push(event.payload.message);
    });

    const publisher = createEventPublisher(bus, '@atlas/demo');
    publisher.publish(DemoEvent, { message: 'hello' });

    expect(received).toEqual(['hello']);
  });

  it('preserves publish order for multiple handlers', () => {
    const bus = createInMemoryEventBus();
    const order: number[] = [];

    const DemoEvent = defineEvent<{ step: number }>({
      type: createEventType('demo.ordered'),
      version: '1.0.0',
    });

    bus.subscribe(DemoEvent, (event) => {
      order.push(event.payload.step * 10 + 1);
    });
    bus.subscribe(DemoEvent, (event) => {
      order.push(event.payload.step * 10 + 2);
    });

    const publisher = createEventPublisher(bus, '@atlas/demo');
    publisher.publish(DemoEvent, { step: 1 });
    publisher.publish(DemoEvent, { step: 2 });

    expect(order).toEqual([11, 12, 21, 22]);
  });

  it('unsubscribes handlers', () => {
    const bus = createInMemoryEventBus();
    let count = 0;

    const DemoEvent = defineEvent<Record<string, never>>({
      type: createEventType('demo.unsubscribe'),
      version: '1.0.0',
    });

    const unsubscribe = bus.subscribe(DemoEvent, () => {
      count += 1;
    });

    createEventPublisher(bus, '@atlas/demo').publish(DemoEvent, {});
    unsubscribe();
    createEventPublisher(bus, '@atlas/demo').publish(DemoEvent, {});

    expect(count).toBe(1);
  });
});

describe('CompilerCompletedEvent', () => {
  it('uses the official compiler.completed event type', () => {
    expect(String(CompilerCompletedEvent.type)).toBe('compiler.completed');
    expect(CompilerCompletedEvent.version).toBe('1.0.0');
  });

  it('supports typed subscription', () => {
    const bus = createInMemoryEventBus();
    const payloads: CompilerCompletedPayload[] = [];

    bus.subscribe(CompilerCompletedEvent, (event) => {
      payloads.push(event.payload);
    });

    createEventPublisher(bus, '@atlas/compiler').publish(CompilerCompletedEvent, {
      success: true,
      lifecycle: 'complete',
      artifact_count: 1,
      unit_count: 2,
      graph_id: 'mir.workspace',
    });

    expect(payloads).toHaveLength(1);
    expect(payloads[0]?.success).toBe(true);
  });
});
