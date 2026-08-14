import type { BrandProduct } from '../../presentation/map-brand.js';
import { t } from '../../i18n/index.js';
import { createBrand, fetchBrands, BrandApiError } from '../api/client.js';
import { refreshBrandCatalog } from '../lib/brand-catalog.js';
import { mountDialogRoot } from '../lib/dialog.js';
import { appendExpandableDetails } from '../lib/expandable-details.js';
import { renderBrandCard, renderBrandCardSkeleton } from '../components/brand-card.js';
import { switchWorkspace } from '../lib/workspace-switch.js';
import { applyBrandCatalog, getState, resolveBrandDisplayName } from '../state/app-state.js';

interface BrandsPageState {
  loading: boolean;
  error?: string;
  errorTechnical?: string;
  brands: readonly BrandProduct[];
  activeBrandId: string;
  createOpen: boolean;
  createSubmitting: boolean;
  createError?: string;
  createErrorTechnical?: string;
  successBrand?: BrandProduct;
}

let boundMain: HTMLElement | null = null;
let lastFocusedElement: HTMLElement | null = null;
let unmountCreateDialog: (() => void) | undefined;

let pageState: BrandsPageState = {
  loading: true,
  brands: [],
  activeBrandId: 'default',
  createOpen: false,
  createSubmitting: false,
};

export function renderBrands(main: HTMLElement): void {
  if (boundMain !== main) {
    pageState = {
      loading: true,
      brands: [],
      activeBrandId: getState().activeWorkspace,
      createOpen: false,
      createSubmitting: false,
    };
  }

  boundMain = main;
  const state = getState();
  const activeName = resolveBrandDisplayName(state.activeWorkspace);

  if (pageState.activeBrandId !== state.activeWorkspace && !pageState.loading) {
    pageState = {
      ...pageState,
      loading: true,
      activeBrandId: state.activeWorkspace,
    };
  }

  main.innerHTML = `
    <section class="page brands-page">
      <header class="page__header brands-page__header">
        <div class="brands-page__intro">
          <h1 class="page__title">${t('pages.brandsTitle')}</h1>
          <p class="page__subtitle">${t('brands.pageSubtitle')}</p>
        </div>
        <button type="button" class="btn btn--primary brands-page__create" id="brands-create-open">
          ${t('brands.createButton')}
        </button>
      </header>

      <div class="brands-active-context" aria-live="polite">
        <p class="brands-active-context__label">${t('brands.activeContext')}</p>
        <p class="brands-active-context__value">
          <strong id="brands-active-name">${activeName}</strong>
        </p>
      </div>

      <p class="brands-trust-note">${t('brands.isolationNote')}</p>

      <div id="brands-success" class="brands-success" hidden aria-live="polite"></div>

      <section
        id="brands-content"
        class="brands-content"
        aria-live="polite"
        aria-busy="true"
      ></section>
    </section>

  `;

  main.querySelector('#brands-create-open')?.addEventListener('click', () => {
    openCreateDialog(main.querySelector('#brands-create-open') as HTMLButtonElement);
  });

  if (pageState.loading) {
    void loadBrands();
  } else {
    paintBrandsContent();
  }
}

export function refreshBrandsView(): void {
  if (boundMain === null) {
    return;
  }

  const active = getState().activeWorkspace;
  const activeName = resolveBrandDisplayName(active);
  const nameEl = boundMain.querySelector('#brands-active-name');

  if (nameEl !== null) {
    nameEl.textContent = activeName;
  }

  if (pageState.activeBrandId !== active) {
    pageState = { ...pageState, loading: true, activeBrandId: active };
    void loadBrands();
    return;
  }

  paintBrandsContent();
}

async function loadBrands(): Promise<void> {
  if (boundMain === null) {
    return;
  }

  const activeWorkspace = getState().activeWorkspace;
  pageState = {
    ...pageState,
    loading: true,
    error: undefined,
    errorTechnical: undefined,
    activeBrandId: activeWorkspace,
  };
  paintBrandsContent();

  try {
    const payload = await fetchBrands(activeWorkspace);
    applyBrandCatalog(payload);
    pageState = {
      ...pageState,
      loading: false,
      brands: payload.brands,
      activeBrandId: payload.activeBrandId,
    };
  } catch (error) {
    pageState = {
      ...pageState,
      loading: false,
      brands: [],
      error: t('brands.loadErrorTitle'),
      errorTechnical: error instanceof Error ? error.message : String(error),
    };
  }

  paintBrandsContent();
}

function paintBrandsContent(): void {
  if (boundMain === null) {
    return;
  }

  const content = boundMain.querySelector('#brands-content') as HTMLElement;
  content.setAttribute('aria-busy', String(pageState.loading));
  paintSuccessBanner();

  if (pageState.loading) {
    content.replaceChildren(renderLoadingState());
    return;
  }

  if (pageState.error !== undefined) {
    content.replaceChildren(renderErrorState());
    return;
  }

  const realBrands = pageState.brands.filter((brand) => !brand.isGeneral);

  if (realBrands.length === 0) {
    content.replaceChildren(renderEmptyState(), renderBrandGrid(pageState.brands));
    return;
  }

  content.replaceChildren(renderBrandGrid(pageState.brands));
}

function renderLoadingState(): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const grid = document.createElement('div');
  grid.className = 'brands-grid';

  for (let index = 0; index < 3; index += 1) {
    grid.append(renderBrandCardSkeleton());
  }

  const message = document.createElement('p');
  message.className = 'brands-loading__message';
  message.textContent = t('brands.loading');

  fragment.append(message, grid);
  return fragment;
}

function renderErrorState(): HTMLElement {
  const panel = document.createElement('section');
  panel.className = 'error-panel brands-error';

  const title = document.createElement('h2');
  title.className = 'brands-error__title';
  title.textContent = pageState.error ?? t('brands.loadErrorTitle');

  const body = document.createElement('p');
  body.className = 'brands-error__body';
  body.textContent = t('brands.loadErrorBody');

  const actions = document.createElement('div');
  actions.className = 'error-panel__actions';

  const retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'btn btn--primary';
  retry.textContent = t('common.retry');
  retry.addEventListener('click', () => {
    void loadBrands();
  });

  actions.append(retry);

  if (pageState.errorTechnical !== undefined) {
    panel.append(title, body, actions);
    appendExpandableDetails(panel, pageState.errorTechnical);
    return panel;
  }

  panel.append(title, body, actions);
  return panel;
}

function renderEmptyState(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'brands-empty';

  const title = document.createElement('h2');
  title.className = 'brands-empty__title';
  title.textContent = t('brands.emptyTitle');

  const body = document.createElement('p');
  body.className = 'brands-empty__body';
  body.textContent = t('brands.emptyBody');

  const examples = document.createElement('ul');
  examples.className = 'brands-empty__examples';
  for (const key of ['brands.emptyExample1', 'brands.emptyExample2', 'brands.emptyExample3'] as const) {
    const item = document.createElement('li');
    item.textContent = t(key);
    examples.append(item);
  }

  const actions = document.createElement('div');
  actions.className = 'brands-empty__actions';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn--primary';
  button.textContent = t('brands.emptyCta');
  button.addEventListener('click', () => {
    openCreateDialog(button);
  });

  actions.append(button);
  section.append(title, body, examples, actions);
  return section;
}

function renderBrandGrid(brands: readonly BrandProduct[]): HTMLElement {
  const grid = document.createElement('div');
  grid.className = 'brands-grid';

  for (const brand of brands) {
    grid.append(
      renderBrandCard(brand, {
        onSelect: (brandId) => {
          void switchWorkspace(brandId);
        },
      }),
    );
  }

  return grid;
}

function paintSuccessBanner(): void {
  if (boundMain === null) {
    return;
  }

  const banner = boundMain.querySelector('#brands-success') as HTMLElement;
  banner.replaceChildren();
  banner.hidden = pageState.successBrand === undefined;

  if (pageState.successBrand === undefined) {
    return;
  }

  const brand = pageState.successBrand;
  const message = document.createElement('p');
  message.className = 'brands-success__message';
  message.textContent = t('brands.createSuccess', { name: brand.name });

  const actions = document.createElement('div');
  actions.className = 'brands-success__actions';

  const workButton = document.createElement('button');
  workButton.type = 'button';
  workButton.className = 'btn btn--primary';
  workButton.textContent = t('brands.createSuccessCta', { name: brand.name });
  workButton.addEventListener('click', () => {
    pageState = { ...pageState, successBrand: undefined };
    paintSuccessBanner();
    void switchWorkspace(brand.id, { skipConfirm: true });
  });

  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'btn btn--ghost';
  dismiss.textContent = t('common.cancel');
  dismiss.addEventListener('click', () => {
    pageState = { ...pageState, successBrand: undefined };
    paintSuccessBanner();
  });

  actions.append(workButton, dismiss);
  banner.append(message, actions);
}

function resolveShellDialogRoot(): HTMLElement | null {
  return document.querySelector('#shell-dialog-root');
}

function openCreateDialog(trigger: HTMLButtonElement): void {
  if (boundMain === null || pageState.createOpen) {
    return;
  }

  const root = resolveShellDialogRoot();

  if (root === null) {
    return;
  }

  lastFocusedElement = trigger;
  pageState = {
    ...pageState,
    createOpen: true,
    createError: undefined,
    createErrorTechnical: undefined,
  };

  const backdrop = renderCreateDialog();
  const shellBody = document.querySelector('#shell-body') as HTMLElement | null;

  unmountCreateDialog = mountDialogRoot(root, backdrop, {
    onEscape: () => {
      if (!pageState.createSubmitting) {
        closeCreateDialog();
      }
    },
    onBackdropClick: () => {
      if (!pageState.createSubmitting) {
        closeCreateDialog();
      }
    },
    restoreFocusTo: trigger,
    inertTarget: shellBody,
    initialFocus: backdrop.querySelector('#brands-create-name') as HTMLInputElement,
  });
}

function closeCreateDialog(): void {
  if (boundMain === null) {
    return;
  }

  pageState = {
    ...pageState,
    createOpen: false,
    createSubmitting: false,
    createError: undefined,
    createErrorTechnical: undefined,
  };

  unmountCreateDialog?.();
  unmountCreateDialog = undefined;

  resolveShellDialogRoot()?.replaceChildren();

  if (lastFocusedElement !== null) {
    lastFocusedElement.focus();
  }
}

function renderCreateDialog(): HTMLElement {
  const backdrop = document.createElement('div');
  backdrop.className = 'dialog-backdrop';

  const dialog = document.createElement('div');
  dialog.className = 'dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'brands-create-title');

  dialog.innerHTML = `
    <header class="dialog__header">
      <h2 id="brands-create-title" class="dialog__title">${t('brands.createTitle')}</h2>
      <p class="dialog__subtitle">${t('brands.createBody')}</p>
    </header>

    <form id="brands-create-form" class="dialog__form" novalidate>
      <div class="form-field">
        <label class="form-field__label" for="brands-create-name">${t('brands.nameLabel')}</label>
        <input
          id="brands-create-name"
          class="form-field__input"
          name="name"
          type="text"
          autocomplete="organization"
          placeholder="${t('brands.namePlaceholder')}"
          required
        />
      </div>

      <div class="form-field">
        <label class="form-field__label" for="brands-create-purpose">${t('brands.purposeLabel')}</label>
        <input
          id="brands-create-purpose"
          class="form-field__input"
          name="purpose"
          type="text"
          placeholder="${t('brands.purposePlaceholder')}"
        />
        <p class="form-field__hint">${t('brands.purposeHint')}</p>
      </div>

      <div id="brands-create-error" class="form-error" hidden role="alert"></div>

      <div class="dialog__actions">
        <button type="button" class="btn btn--ghost" id="brands-create-cancel">${t('common.cancel')}</button>
        <button type="submit" class="btn btn--primary" id="brands-create-submit">${t('brands.createSubmit')}</button>
      </div>
    </form>
  `;

  backdrop.append(dialog);

  const form = dialog.querySelector('#brands-create-form') as HTMLFormElement;
  const cancelButton = dialog.querySelector('#brands-create-cancel') as HTMLButtonElement;

  cancelButton.addEventListener('click', () => {
    if (!pageState.createSubmitting) {
      closeCreateDialog();
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void submitCreateForm(form);
  });

  return backdrop;
}

async function submitCreateForm(form: HTMLFormElement): Promise<void> {
  const nameInput = form.querySelector('#brands-create-name') as HTMLInputElement;
  const purposeInput = form.querySelector('#brands-create-purpose') as HTMLInputElement;
  const errorPanel = form.querySelector('#brands-create-error') as HTMLElement;
  const submitButton = form.querySelector('#brands-create-submit') as HTMLButtonElement;
  const cancelButton = form.querySelector('#brands-create-cancel') as HTMLButtonElement;

  const name = nameInput.value.trim();
  const purpose = purposeInput.value.trim();

  if (name.length === 0) {
    showCreateError(errorPanel, t('brands.validationNameRequired'));
    nameInput.focus();
    return;
  }

  pageState = { ...pageState, createSubmitting: true, createError: undefined };
  submitButton.disabled = true;
  cancelButton.disabled = true;
  submitButton.textContent = t('brands.createSubmitting');
  errorPanel.hidden = true;

  try {
    const payload = await createBrand(name, purpose.length > 0 ? purpose : undefined);
    await refreshBrandCatalog();
    closeCreateDialog();
    pageState = {
      ...pageState,
      successBrand: payload.brand,
      loading: true,
    };
    await loadBrands();
  } catch (error) {
    const message =
      error instanceof BrandApiError && error.status === 409
        ? t('brands.errorDuplicateUi')
        : error instanceof BrandApiError
          ? error.message
          : t('brands.errorGeneric');
    const technical = error instanceof BrandApiError ? error.technical : undefined;

    showCreateError(errorPanel, message, technical);
    pageState = { ...pageState, createSubmitting: false };
    submitButton.disabled = false;
    cancelButton.disabled = false;
    submitButton.textContent = t('brands.createSubmit');
    nameInput.focus();
  }
}

function showCreateError(panel: HTMLElement, message: string, technical?: string): void {
  panel.hidden = false;
  panel.replaceChildren();

  const text = document.createElement('p');
  text.className = 'form-error__message';
  text.textContent = message;
  panel.append(text);

  if (technical !== undefined) {
    appendExpandableDetails(panel, technical);
  }
}

export async function reloadBrands(): Promise<void> {
  pageState = { ...pageState, loading: true };
  if (boundMain !== null) {
    await loadBrands();
  }
}
