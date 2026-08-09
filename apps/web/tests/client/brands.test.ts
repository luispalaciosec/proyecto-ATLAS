/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BrandApiError } from '../../src/client/api/client.js';
import { renderBrands } from '../../src/client/pages/brands.js';
import { getState, setActiveWorkspace, setRoute } from '../../src/client/state/app-state.js';

const fetchBrands = vi.fn();
const createBrand = vi.fn();
const switchWorkspaceMock = vi.fn<(slug: string) => Promise<void>>(async () => {});

vi.mock('../../src/client/api/client.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/client/api/client.js')>();
  return {
    ...actual,
    fetchBrands: (...args: unknown[]) => fetchBrands(...args),
    createBrand: (...args: unknown[]) => createBrand(...args),
  };
});

vi.mock('../../src/client/lib/workspace-switch.js', () => ({
  switchWorkspace: (slug: string) => switchWorkspaceMock(slug),
}));

async function flushUi(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

const generalBrand = {
  id: 'default',
  name: 'General',
  description: 'Información que no pertenece a una marca específica.',
  isGeneral: true,
  isActive: true,
};

const geeksBrand = {
  id: 'geeks',
  name: 'Geeks',
  description: 'Agencia de marketing y publicidad',
  isGeneral: false,
  isActive: false,
  knowledgeCount: 12,
  recentActivity: [
    {
      id: 'activity.1',
      title: 'ATLAS respondió una consulta',
      occurredAt: new Date().toISOString(),
    },
  ],
};

describe('renderBrands', () => {
  beforeEach(() => {
    document.body.innerHTML = '<main id="main"></main>';
    setActiveWorkspace('default', { resetChat: true });
    setRoute('/marcas');
    fetchBrands.mockReset();
    createBrand.mockReset();
    switchWorkspaceMock.mockClear();
  });

  it('renders loading skeletons while fetching brands', () => {
    fetchBrands.mockReturnValue(new Promise(() => {}));

    const main = document.querySelector('#main') as HTMLElement;
    renderBrands(main);

    expect(main.textContent).toContain('Estamos cargando tus marcas');
    expect(main.querySelectorAll('.brand-card--skeleton').length).toBeGreaterThan(0);
  });

  it('renders General and multiple brands without technical jargon', async () => {
    fetchBrands.mockResolvedValue({
      activeBrandId: 'default',
      brands: [generalBrand, geeksBrand],
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderBrands(main);
    await flushUi();

    expect(main.textContent).toContain('Organiza el trabajo de ATLAS');
    expect(main.textContent).toContain('General');
    expect(main.textContent).toContain('Geeks');
    expect(main.textContent).toContain('12 elementos');
    expect(main.textContent).not.toMatch(/workspace|slug|memory\.json|SessionStore|SDK|Kernel/i);
  });

  it('marks the active brand clearly', async () => {
    fetchBrands.mockResolvedValue({
      activeBrandId: 'geeks',
      brands: [
        { ...generalBrand, isActive: false },
        { ...geeksBrand, isActive: true },
      ],
    });

    setActiveWorkspace('geeks', { resetChat: true });
    const main = document.querySelector('#main') as HTMLElement;
    renderBrands(main);
    await flushUi();

    expect(main.textContent).toContain('Activa');
    expect(main.textContent).toContain('Estás trabajando aquí');
    expect(main.querySelector('.brand-card--active')?.textContent).toContain('Geeks');
  });

  it('shows inactive brand CTA to switch context', async () => {
    fetchBrands.mockResolvedValue({
      activeBrandId: 'default',
      brands: [generalBrand, geeksBrand],
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderBrands(main);
    await flushUi();

    const workButton = [...main.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Trabajar con Geeks'),
    );

    expect(workButton).toBeDefined();
    workButton?.click();
    await flushUi();
    expect(switchWorkspaceMock).toHaveBeenCalledWith('geeks');
  });

  it('opens create modal from header CTA', async () => {
    fetchBrands.mockResolvedValue({
      activeBrandId: 'default',
      brands: [generalBrand],
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderBrands(main);
    await flushUi();

    (main.querySelector('#brands-create-open') as HTMLButtonElement).click();

    expect(main.querySelector('[role="dialog"]')).not.toBeNull();
    expect(main.textContent).toContain('Crear una marca');
    expect(main.textContent).toContain('Nombre de la marca');
  });

  it('validates empty brand name before submit', async () => {
    fetchBrands.mockResolvedValue({
      activeBrandId: 'default',
      brands: [generalBrand],
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderBrands(main);
    await flushUi();

    (main.querySelector('#brands-create-open') as HTMLButtonElement).click();
    (main.querySelector('#brands-create-form') as HTMLFormElement).requestSubmit();
    await flushUi();

    expect(createBrand).not.toHaveBeenCalled();
    expect(main.textContent).toContain('Escribe un nombre para la marca');
  });

  it('creates a brand successfully and shows success feedback', async () => {
    fetchBrands.mockResolvedValue({
      activeBrandId: 'default',
      brands: [generalBrand],
    });
    createBrand.mockResolvedValue({
      brand: {
        id: 'revital',
        name: 'Revital',
        description: 'Marketing para centros',
        isGeneral: false,
        isActive: false,
      },
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderBrands(main);
    await flushUi();

    (main.querySelector('#brands-create-open') as HTMLButtonElement).click();
    const nameInput = main.querySelector('#brands-create-name') as HTMLInputElement;
    nameInput.value = 'Revital';
    (main.querySelector('#brands-create-form') as HTMLFormElement).requestSubmit();
    await flushUi();
    await flushUi();

    expect(createBrand).toHaveBeenCalledWith('Revital', undefined);
    expect(main.querySelector('[role="dialog"]')).toBeNull();
    expect(main.textContent).toContain('Marca creada correctamente');
    expect(main.textContent).toContain('Trabajar con Revital');
  });

  it('shows duplicate error in human language', async () => {
    fetchBrands.mockResolvedValue({
      activeBrandId: 'default',
      brands: [generalBrand, geeksBrand],
    });
    createBrand.mockRejectedValue(
      new BrandApiError('Ya existe una marca con ese nombre.', 409, 'BrandDuplicateError'),
    );

    const main = document.querySelector('#main') as HTMLElement;
    renderBrands(main);
    await flushUi();

    (main.querySelector('#brands-create-open') as HTMLButtonElement).click();
    (main.querySelector('#brands-create-name') as HTMLInputElement).value = 'Geeks';
    (main.querySelector('#brands-create-form') as HTMLFormElement).requestSubmit();
    await flushUi();

    expect(main.textContent).toContain('Ya existe una marca con ese nombre');
    expect(main.textContent).toContain('Puedes trabajar con ella desde esta página');
  });

  it('shows generic create error with technical details hidden by default', async () => {
    fetchBrands.mockResolvedValue({
      activeBrandId: 'default',
      brands: [generalBrand],
    });
    createBrand.mockRejectedValue(
      new BrandApiError('No pudimos crear la marca.', 400, 'BrandValidationError'),
    );

    const main = document.querySelector('#main') as HTMLElement;
    renderBrands(main);
    await flushUi();

    (main.querySelector('#brands-create-open') as HTMLButtonElement).click();
    (main.querySelector('#brands-create-name') as HTMLInputElement).value = '!!!';
    (main.querySelector('#brands-create-form') as HTMLFormElement).requestSubmit();
    await flushUi();

    expect(main.textContent).toContain('No pudimos crear la marca');
    expect(main.textContent).toContain('Ver detalles');
    const details = main.querySelector('.error-panel__details') as HTMLElement | null;
    expect(details?.hidden).toBe(true);
  });

  it('renders empty state when only General exists', async () => {
    fetchBrands.mockResolvedValue({
      activeBrandId: 'default',
      brands: [generalBrand],
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderBrands(main);
    await flushUi();

    expect(main.textContent).toContain('Trabaja con el contexto correcto');
    expect(main.textContent).toContain('Crear mi primera marca');
    expect(main.textContent).toContain('General');
  });

  it('shows load error with retry', async () => {
    fetchBrands.mockRejectedValueOnce(new Error('brands unavailable'));

    const main = document.querySelector('#main') as HTMLElement;
    renderBrands(main);
    await flushUi();

    expect(main.textContent).toContain('No pudimos cargar tus marcas');
    expect(main.textContent).toContain('Intentar de nuevo');

    fetchBrands.mockResolvedValueOnce({
      activeBrandId: 'default',
      brands: [generalBrand],
    });

    (main.querySelector('.brands-error .btn--primary') as HTMLButtonElement).click();
    await flushUi();

    expect(fetchBrands).toHaveBeenCalledTimes(2);
    expect(getState().route).toBe('/marcas');
  });

  it('uses responsive grid container for brand cards', async () => {
    fetchBrands.mockResolvedValue({
      activeBrandId: 'default',
      brands: [generalBrand, geeksBrand],
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderBrands(main);
    await flushUi();

    expect(main.querySelector('.brands-grid')).not.toBeNull();
    expect(main.querySelectorAll('.brand-card').length).toBe(2);
  });
});
