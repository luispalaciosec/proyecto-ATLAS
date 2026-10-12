import { t } from '../../i18n/index.js';
import {
  LLM_DEFAULT_BASE_URLS,
  LLM_PROVIDER_KINDS,
  isLlmProviderKind,
  providerRequiresApiKey,
  providerUsesBaseUrl,
  type LlmConnectionTestResult,
  type LlmProviderKind,
  type LlmSettingsInput,
  type LlmSettingsView,
} from '../../presentation/llm-settings.js';
import {
  fetchLlmSettings,
  resetLlmSettings,
  saveLlmSettings,
  testLlmSettings,
} from '../api/client.js';

type BusyState = 'idle' | 'loading' | 'testing' | 'saving' | 'resetting';

interface SettingsElements {
  readonly form: HTMLFormElement;
  readonly provider: HTMLSelectElement;
  readonly baseUrlField: HTMLElement;
  readonly baseUrl: HTMLInputElement;
  readonly model: HTMLInputElement;
  readonly modelHint: HTMLElement;
  readonly apiKey: HTMLInputElement;
  readonly apiKeyHint: HTMLElement;
  readonly testButton: HTMLButtonElement;
  readonly saveButton: HTMLButtonElement;
  readonly resetButton: HTMLButtonElement;
  readonly result: HTMLElement;
  readonly status: HTMLElement;
  readonly statusSummary: HTMLElement;
  readonly statusDetails: HTMLElement;
}

let currentView: LlmSettingsView | undefined;
let busy: BusyState = 'idle';
let lastProvider: LlmProviderKind = 'anthropic';

function providerName(kind: LlmProviderKind): string {
  return t(`settings.providers.${kind}`);
}

function renderTemplate(): string {
  const providerOptions = LLM_PROVIDER_KINDS.map(
    (kind) => `<option value="${kind}">${providerName(kind)}</option>`,
  ).join('');
  const recommendations = LLM_PROVIDER_KINDS.map(
    (kind) => `
        <dt class="settings-recommendations__term">${providerName(kind)}</dt>
        <dd class="settings-recommendations__body">${t(`settings.recommendations.${kind}`)}</dd>`,
  ).join('');

  return `
    <section class="page settings-page">
      <header class="page__header">
        <h1 class="page__title">${t('pages.settingsTitle')}</h1>
        <p class="page__subtitle">${t('settings.subtitle')}</p>
      </header>

      <article class="card" id="settings-status" aria-live="polite" aria-busy="true">
        <h2 class="card__title">${t('settings.statusTitle')}</h2>
        <p class="card__body" id="settings-status-summary">${t('settings.loading')}</p>
        <ul class="settings-status__list" id="settings-status-details"></ul>
      </article>

      <article class="card">
        <h2 class="card__title">${t('settings.formTitle')}</h2>
        <form id="settings-form" class="settings-form" novalidate>
          <div class="form-field">
            <label class="form-field__label" for="settings-provider">${t('settings.providerLabel')}</label>
            <select id="settings-provider" class="form-field__input" name="provider">${providerOptions}</select>
          </div>

          <div class="form-field" id="settings-base-url-field">
            <label class="form-field__label" for="settings-base-url">${t('settings.baseUrlLabel')}</label>
            <input id="settings-base-url" name="baseUrl" type="url" class="form-field__input" autocomplete="off" spellcheck="false" />
            <p class="form-field__hint">${t('settings.baseUrlHint')}</p>
          </div>

          <div class="form-field">
            <label class="form-field__label" for="settings-model">${t('settings.modelLabel')}</label>
            <input id="settings-model" name="model" type="text" class="form-field__input" autocomplete="off" spellcheck="false" />
            <p class="form-field__hint" id="settings-model-hint"></p>
          </div>

          <div class="form-field">
            <label class="form-field__label" for="settings-api-key">${t('settings.apiKeyLabel')}</label>
            <input id="settings-api-key" name="apiKey" type="password" class="form-field__input" autocomplete="new-password" spellcheck="false" />
            <p class="form-field__hint" id="settings-api-key-hint"></p>
            <p class="form-field__hint">${t('settings.apiKeySecurityNote')}</p>
          </div>

          <div class="actions-row">
            <button type="button" class="btn btn--secondary" id="settings-test">${t('settings.testButton')}</button>
            <button type="submit" class="btn btn--primary" id="settings-save">${t('settings.saveButton')}</button>
            <button type="button" class="btn btn--ghost" id="settings-reset" hidden>${t('settings.resetButton')}</button>
          </div>

          <p id="settings-result" class="settings-result" role="status" aria-live="polite" hidden></p>
        </form>
      </article>

      <article class="card">
        <h2 class="card__title">${t('settings.recommendationsTitle')}</h2>
        <p class="banner settings-warning" role="note"><strong>${t('settings.freeTierWarning')}</strong></p>
        <dl class="settings-recommendations">${recommendations}
        </dl>
        <p class="form-field__hint">${t('settings.limitsNote')}</p>
      </article>
    </section>
  `;
}

function query<T extends Element>(main: HTMLElement, selector: string): T {
  const element = main.querySelector<T>(selector);

  if (element === null) {
    throw new Error(`Missing settings element ${selector}`);
  }

  return element;
}

function collectElements(main: HTMLElement): SettingsElements {
  return {
    form: query(main, '#settings-form'),
    provider: query(main, '#settings-provider'),
    baseUrlField: query(main, '#settings-base-url-field'),
    baseUrl: query(main, '#settings-base-url'),
    model: query(main, '#settings-model'),
    modelHint: query(main, '#settings-model-hint'),
    apiKey: query(main, '#settings-api-key'),
    apiKeyHint: query(main, '#settings-api-key-hint'),
    testButton: query(main, '#settings-test'),
    saveButton: query(main, '#settings-save'),
    resetButton: query(main, '#settings-reset'),
    result: query(main, '#settings-result'),
    status: query(main, '#settings-status'),
    statusSummary: query(main, '#settings-status-summary'),
    statusDetails: query(main, '#settings-status-details'),
  };
}

function selectedProvider(els: SettingsElements): LlmProviderKind {
  return isLlmProviderKind(els.provider.value) ? els.provider.value : 'anthropic';
}

/** The stored key is only reused for the same provider and base URL (enforced server-side too). */
function storedKeyApplies(els: SettingsElements): boolean {
  if (currentView?.hasApiKey !== true || currentView.provider !== selectedProvider(els)) {
    return false;
  }

  const normalize = (value: string | undefined) => (value ?? '').trim().replace(/\/+$/, '');

  return (
    !providerUsesBaseUrl(selectedProvider(els)) ||
    normalize(currentView.baseUrl) === normalize(els.baseUrl.value)
  );
}

function updateProviderDependentFields(els: SettingsElements): void {
  const kind = selectedProvider(els);

  els.baseUrlField.hidden = !providerUsesBaseUrl(kind);
  els.modelHint.textContent = t('settings.modelHint', {
    examples: t(`settings.modelExamples.${kind}`),
  });
  els.apiKey.placeholder = storedKeyApplies(els)
    ? t('settings.apiKeyPlaceholderKeep')
    : t('settings.apiKeyPlaceholderNew');
  els.apiKeyHint.textContent = providerRequiresApiKey(kind) ? '' : t('settings.apiKeyHintOllama');
  els.apiKeyHint.hidden = providerRequiresApiKey(kind);
}

function onProviderChange(els: SettingsElements): void {
  const next = selectedProvider(els);
  const previousDefault = LLM_DEFAULT_BASE_URLS[lastProvider] ?? '';
  const currentBaseUrl = els.baseUrl.value.trim();

  // Only replace the base URL when the user has not typed a custom one.
  if (currentBaseUrl.length === 0 || currentBaseUrl === previousDefault) {
    els.baseUrl.value = LLM_DEFAULT_BASE_URLS[next] ?? '';
  }

  lastProvider = next;
  updateProviderDependentFields(els);
}

function maskedKeyText(view: LlmSettingsView): string {
  if (!view.hasApiKey) {
    return t('settings.keyNone');
  }

  if (view.apiKeyMasked === undefined || view.apiKeyMasked === '…') {
    return t('settings.keyMaskedShort');
  }

  return t('settings.keyMasked', { last4: view.apiKeyMasked });
}

function renderStatus(els: SettingsElements, view: LlmSettingsView): void {
  els.status.setAttribute('aria-busy', 'false');
  els.statusSummary.textContent = view.configured
    ? t('settings.statusConfigured')
    : t('settings.statusNotConfigured');

  const lines: string[] = [
    view.source === 'saved'
      ? t('settings.sourceSaved')
      : view.source === 'env'
        ? t('settings.sourceEnv')
        : t('settings.sourceNone'),
  ];

  if (view.provider !== undefined) {
    lines.push(t('settings.statusProvider', { name: providerName(view.provider) }));
  }

  if (view.model !== undefined) {
    lines.push(t('settings.statusModel', { model: view.model }));
  }

  if (view.baseUrl !== undefined) {
    lines.push(t('settings.statusBaseUrl', { url: view.baseUrl }));
  }

  if (view.source !== 'none') {
    lines.push(t('settings.statusKey', { masked: maskedKeyText(view) }));
  }

  els.statusDetails.replaceChildren(
    ...lines.map((line) => {
      const item = document.createElement('li');
      item.textContent = line;
      return item;
    }),
  );
  els.resetButton.hidden = view.source !== 'saved';
}

function fillForm(els: SettingsElements, view: LlmSettingsView): void {
  const kind = view.provider ?? 'anthropic';

  els.provider.value = kind;
  lastProvider = kind;
  els.baseUrl.value = view.baseUrl ?? LLM_DEFAULT_BASE_URLS[kind] ?? '';
  els.model.value = view.model ?? '';
  // The key is never sent to the browser; the field always starts empty.
  els.apiKey.value = '';
  updateProviderDependentFields(els);
}

function showResult(els: SettingsElements, message: string, tone: 'ok' | 'error'): void {
  els.result.hidden = false;
  els.result.textContent = message;
  els.result.classList.toggle('settings-result--ok', tone === 'ok');
  els.result.classList.toggle('settings-result--error', tone === 'error');
}

function setBusy(els: SettingsElements, next: BusyState): void {
  busy = next;
  const disabled = next !== 'idle';

  els.testButton.disabled = disabled;
  els.saveButton.disabled = disabled;
  els.resetButton.disabled = disabled;
  els.testButton.textContent =
    next === 'testing' ? t('settings.testing') : t('settings.testButton');
  els.saveButton.textContent = next === 'saving' ? t('settings.saving') : t('settings.saveButton');
}

function readInput(els: SettingsElements): LlmSettingsInput {
  const kind = selectedProvider(els);
  const apiKey = els.apiKey.value.trim();
  const baseUrl = els.baseUrl.value.trim();

  return {
    provider: kind,
    model: els.model.value.trim(),
    ...(providerUsesBaseUrl(kind) && baseUrl.length > 0 ? { baseUrl } : {}),
    ...(apiKey.length > 0 ? { apiKey } : {}),
  };
}

function errorMessage(error: unknown, fallbackKey: string): string {
  return error instanceof Error && error.message.length > 0 ? error.message : t(fallbackKey);
}

function applyView(els: SettingsElements, view: LlmSettingsView): void {
  currentView = view;
  renderStatus(els, view);
  fillForm(els, view);
}

async function loadSettings(els: SettingsElements): Promise<void> {
  setBusy(els, 'loading');

  try {
    applyView(els, await fetchLlmSettings());
  } catch {
    els.status.setAttribute('aria-busy', 'false');
    els.statusSummary.textContent = t('settings.loadError');
  } finally {
    setBusy(els, 'idle');
  }
}

async function runTest(els: SettingsElements): Promise<void> {
  setBusy(els, 'testing');

  try {
    const result: LlmConnectionTestResult = await testLlmSettings(readInput(els));
    showResult(els, result.message, result.ok ? 'ok' : 'error');
  } catch (error) {
    showResult(els, errorMessage(error, 'settings.errors.unexpected'), 'error');
  } finally {
    setBusy(els, 'idle');
  }
}

async function runSave(els: SettingsElements): Promise<void> {
  setBusy(els, 'saving');

  try {
    applyView(els, await saveLlmSettings(readInput(els)));
    showResult(els, t('settings.saved'), 'ok');
  } catch (error) {
    showResult(els, errorMessage(error, 'settings.saveError'), 'error');
  } finally {
    setBusy(els, 'idle');
  }
}

async function runReset(els: SettingsElements): Promise<void> {
  setBusy(els, 'resetting');

  try {
    applyView(els, await resetLlmSettings());
    showResult(els, t('settings.resetDone'), 'ok');
  } catch (error) {
    showResult(els, errorMessage(error, 'settings.errors.unexpected'), 'error');
  } finally {
    setBusy(els, 'idle');
  }
}

export function renderSettings(main: HTMLElement): void {
  main.innerHTML = renderTemplate();
  currentView = undefined;
  busy = 'idle';

  const els = collectElements(main);

  els.provider.addEventListener('change', () => onProviderChange(els));
  els.baseUrl.addEventListener('input', () => updateProviderDependentFields(els));
  els.testButton.addEventListener('click', () => {
    if (busy === 'idle') {
      void runTest(els);
    }
  });
  els.form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (busy === 'idle') {
      void runSave(els);
    }
  });
  els.resetButton.addEventListener('click', () => {
    if (busy === 'idle') {
      void runReset(els);
    }
  });

  updateProviderDependentFields(els);
  void loadSettings(els);
}
