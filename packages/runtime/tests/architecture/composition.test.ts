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
});
