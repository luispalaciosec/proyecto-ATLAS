import { describe, expect, it } from 'vitest';

import {
  assertMetamodelRegistryValid,
  validateMetamodelRegistry,
} from '../../src/validators/index.js';

describe('Knowledge validators', () => {
  it('runs metamodel validator successfully', () => {
    assertMetamodelRegistryValid();
    const result = validateMetamodelRegistry();
    expect(result.issues).toHaveLength(0);
  });
});
