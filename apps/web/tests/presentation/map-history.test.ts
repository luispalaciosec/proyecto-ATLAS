import { describe, expect, it } from 'vitest';

import { mapSessionHistoryToProduct } from '../../src/presentation/map-history.js';

describe('mapSessionHistoryToProduct', () => {
  it('maps user and assistant messages for UI', () => {
    const result = mapSessionHistoryToProduct(
      'geeks',
      [
        { role: 'user', content: 'Hola' },
        { role: 'assistant', content: 'Respuesta' },
      ],
      true,
    );

    expect(result.workspace).toBe('geeks');
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0]?.role).toBe('user');
    expect(result.messages[1]?.content).toBe('Respuesta');
    expect(result.canCorrect).toBe(true);
  });

  it('returns empty history without canCorrect', () => {
    const result = mapSessionHistoryToProduct('default', [], false);

    expect(result.messages).toHaveLength(0);
    expect(result.canCorrect).toBe(false);
  });
});
