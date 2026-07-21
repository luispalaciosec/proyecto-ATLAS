import { describe, expect, it } from 'vitest';

import {
  createRuntimeComposition,
  RUNTIME_COMPONENT_IDS,
} from '../../src/index.js';

describe('Runtime architecture (Sprint 10A)', () => {
  it('exposes all runtime components through the composition root', () => {
    const composition = createRuntimeComposition();

    for (const componentId of RUNTIME_COMPONENT_IDS) {
      const component = composition.registry.getComponent(componentId);
      expect(component.component).toBe(componentId);
    }
  });

  it('exposes the public API groups defined by ATLAS-RUNTIME-100', () => {
    const composition = createRuntimeComposition();

    expect(composition.api.execution).toBeDefined();
    expect(composition.api.lifecycle).toBeDefined();
    expect(composition.api.tasks).toBeDefined();
    expect(composition.api.workflows).toBeDefined();
    expect(composition.api.events).toBeDefined();
    expect(composition.api.diagnostics).toBeDefined();
  });

  it('routes public API queries through wired runtime components', () => {
    const composition = createRuntimeComposition();

    expect(composition.api.lifecycle.getCurrentStage('missing')).toBeNull();
    expect(composition.api.tasks.listTasks('missing')).toEqual([]);
    expect(composition.api.workflows.listWorkflows('missing')).toEqual([]);
    expect(composition.api.events.query({ execution_id: 'missing' })).toEqual([]);
    expect(composition.api.diagnostics.getSnapshot('missing').execution_id).toBe('missing');

    const subscription = composition.api.events.subscribe(() => undefined);
    expect(subscription.subscription_id).toBeTruthy();
    subscription.unsubscribe();
  });
});
