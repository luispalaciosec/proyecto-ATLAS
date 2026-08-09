import { describe, expect, it } from 'vitest';

import {
  mapBrandToProduct,
  mapBrandsToProduct,
  mapBrandRequestError,
  type RawBrandRecord,
} from '../../src/presentation/map-brand.js';

function createRecord(overrides: Partial<RawBrandRecord> = {}): RawBrandRecord {
  return {
    id: 'geeks',
    profile: {
      name: 'Geeks',
      purpose: 'Agencia de marketing y publicidad',
      tone: '',
      processes: [],
      clients: [],
      rules: [],
    },
    ...overrides,
  };
}

describe('mapBrandToProduct', () => {
  it('maps complete brand data without inventing metrics', () => {
    const record = createRecord({
      knowledgeCount: 12,
      recentActivity: [
        {
          id: 'activity.1',
          type: 'conversation',
          title: 'ATLAS respondió una consulta',
          description: 'Consulta reciente',
          occurredAt: '2026-08-09T15:32:00.000Z',
          status: 'success',
          workspace: 'geeks',
          workspaceName: 'Geeks',
        },
      ],
    });

    const brand = mapBrandToProduct(record, 'geeks');

    expect(brand.id).toBe('geeks');
    expect(brand.name).toBe('Geeks');
    expect(brand.description).toBe('Agencia de marketing y publicidad');
    expect(brand.isGeneral).toBe(false);
    expect(brand.isActive).toBe(true);
    expect(brand.knowledgeCount).toBe(12);
    expect(brand.recentActivity).toHaveLength(1);
    expect(brand.hasConfiguredContext).toBe(true);
  });

  it('maps incomplete brand data without inventing optional fields', () => {
    const record = createRecord({
      profile: {
        name: 'Revital',
        purpose: '',
        tone: '',
        processes: [],
        clients: [],
        rules: [],
      },
    });

    const brand = mapBrandToProduct(record, 'default');

    expect(brand.name).toBe('Revital');
    expect(brand.description).toBeUndefined();
    expect(brand.knowledgeCount).toBeUndefined();
    expect(brand.recentActivity).toBeUndefined();
    expect(brand.isActive).toBe(false);
    expect(brand.hasConfiguredContext).toBe(false);
  });

  it('maps General with product copy and without configured context flag', () => {
    const record = createRecord({
      id: 'default',
      profile: {
        name: 'General',
        purpose: '',
        tone: '',
        processes: [],
        clients: [],
        rules: [],
      },
    });

    const brand = mapBrandToProduct(record, 'default');

    expect(brand.id).toBe('default');
    expect(brand.name).toBe('General');
    expect(brand.description).toContain('no pertenece a una marca específica');
    expect(brand.isGeneral).toBe(true);
    expect(brand.isActive).toBe(true);
    expect(brand.hasConfiguredContext).toBeUndefined();
  });
});

describe('mapBrandsToProduct', () => {
  it('orders General first and marks active brand', () => {
    const records: RawBrandRecord[] = [
      createRecord({ id: 'revital', profile: { ...createRecord().profile, name: 'Revital' } }),
      createRecord({
        id: 'default',
        profile: { ...createRecord().profile, name: 'General', purpose: '' },
      }),
      createRecord({ id: 'geeks' }),
    ];

    const payload = mapBrandsToProduct(records, 'geeks');

    expect(payload.activeBrandId).toBe('geeks');
    expect(payload.brands[0]?.id).toBe('default');
    expect(payload.brands[1]?.name).toBe('Geeks');
    expect(payload.brands[2]?.name).toBe('Revital');
    expect(payload.brands.find((brand) => brand.id === 'geeks')?.isActive).toBe(true);
  });
});

describe('mapBrandRequestError', () => {
  it('maps duplicate and invalid names to product copy', () => {
    expect(mapBrandRequestError('Ya existe una marca con ese nombre.')).toContain('Ya existe');
    expect(mapBrandRequestError('Brand name must not be empty')).toContain('obligatorio');
    expect(mapBrandRequestError('Brand name must contain valid characters')).toContain('Revisa');
  });
});
