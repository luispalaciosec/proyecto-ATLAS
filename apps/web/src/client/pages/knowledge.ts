import {
  buildKnowledgeConversationPrompt,
  buildKnowledgeSearchChatPrompt,
  type KnowledgeRecordProduct,
  type KnowledgeSearchResponseProduct,
} from '../../presentation/map-knowledge.js';
import { formatUserError } from '../../presentation/format-error.js';
import { formatWorkingContext } from '../lib/brand-context.js';
import { appendExpandableDetails } from '../lib/expandable-details.js';
import {
  createFileTypeIcon,
  createUploadIdleIcon,
  createUploadSuccessIcon,
} from '../lib/icons.js';
import { t } from '../../i18n/index.js';
import {
  searchKnowledge,
  uploadKnowledgeDocument,
  type KnowledgeUploadPhase,
  type KnowledgeUploadProgress,
} from '../api/client.js';
import {
  getState,
  patchState,
  resolveBrandDisplayName,
  setPendingChatDraft,
  setRoute,
  consumePendingChatDraft,
  consumePendingKnowledgeQuery,
} from '../state/app-state.js';

const EXAMPLE_KEYS = [
  'knowledge.example1',
  'knowledge.example2',
  'knowledge.example3',
  'knowledge.example4',
] as const;

const SUPPORTED_UPLOAD_EXTENSIONS = ['pdf', 'docx', 'pptx', 'txt', 'md'] as const;

type KnowledgeViewState =
  | 'idle'
  | 'loading'
  | 'results'
  | 'empty-results'
  | 'error';

interface KnowledgePageState {
  view: KnowledgeViewState;
  query: string;
  workspace: string;
  payload?: KnowledgeSearchResponseProduct;
  errorMessage?: string;
  errorTechnical?: string;
}

let boundMain: HTMLElement | null = null;
let uploadInProgress = false;
let uploadResetTimer: ReturnType<typeof setTimeout> | undefined;
let pageState: KnowledgePageState = {
  view: 'idle',
  query: '',
  workspace: 'default',
};

export function renderKnowledge(main: HTMLElement): void {
  boundMain = main;
  const state = getState();
  const workspaceName = resolveBrandDisplayName(state.activeWorkspace);
  const contextLine = formatWorkingContext(state.activeWorkspace, workspaceName);

  if (pageState.workspace !== state.activeWorkspace && pageState.view !== 'idle') {
    pageState = {
      view: 'idle',
      query: '',
      workspace: state.activeWorkspace,
    };
  } else {
    pageState = { ...pageState, workspace: state.activeWorkspace };
  }

  main.innerHTML = `
    <section class="page knowledge-page">
      <header class="page__header">
        <h1 class="page__title">${t('pages.knowledgeTitle')}</h1>
        <p class="page__subtitle">${t('knowledge.subtitle')}</p>
      </header>

      <div class="context-chip" aria-label="${contextLine}">
        <strong class="context-chip__value">${contextLine}</strong>
      </div>

      <div class="banner">${t('workspace.isolationBanner', { name: workspaceName })}</div>

      <section class="knowledge-upload" id="knowledge-upload">
        <h2 class="knowledge-section__title">${t('knowledge.uploadTitle')}</h2>
        <p class="knowledge-upload__formats">${t('knowledge.uploadSupported')}</p>
        <div
          class="knowledge-upload__dropzone"
          id="knowledge-upload-dropzone"
          tabindex="0"
          role="button"
          aria-label="${t('knowledge.uploadButton')}"
        >
          <div class="knowledge-upload__idle" id="knowledge-upload-idle">
            <span class="knowledge-upload__idle-icon-wrap" id="knowledge-upload-idle-icon"></span>
            <p class="knowledge-upload__hint" id="knowledge-upload-hint">${t('knowledge.uploadHint')}</p>
            <button type="button" class="btn btn--secondary" id="knowledge-upload-button">${t('knowledge.uploadButton')}</button>
          </div>
          <div class="knowledge-upload__progress" id="knowledge-upload-progress" hidden>
            <div class="knowledge-upload__file">
              <span class="knowledge-upload__file-icon-wrap" id="knowledge-upload-file-icon"></span>
              <div class="knowledge-upload__file-meta">
                <p class="knowledge-upload__file-name" id="knowledge-upload-file-name"></p>
                <p class="knowledge-upload__phase" id="knowledge-upload-phase"></p>
              </div>
            </div>
            <div
              class="knowledge-upload__progress-track"
              role="progressbar"
              id="knowledge-upload-progress-track"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow="0"
            >
              <div class="knowledge-upload__progress-bar" id="knowledge-upload-progress-bar"></div>
            </div>
            <p class="knowledge-upload__detail" id="knowledge-upload-detail" hidden></p>
            <button
              type="button"
              class="btn btn--secondary knowledge-upload__search-btn"
              id="knowledge-upload-search-btn"
              hidden
            >
              ${t('knowledge.uploadSearchDocument')}
            </button>
          </div>
          <input
            type="file"
            id="knowledge-upload-input"
            class="knowledge-upload__input"
            accept=".pdf,.docx,.pptx,.txt,.md"
            hidden
          />
        </div>
        <p class="knowledge-upload__status" id="knowledge-upload-status" hidden aria-live="polite"></p>
      </section>

      <form id="knowledge-search-form" class="knowledge-search" role="search">
        <label class="knowledge-search__label" for="knowledge-search-input">${t('knowledge.searchLabel')}</label>
        <div class="knowledge-search__row">
          <input
            id="knowledge-search-input"
            class="knowledge-search__input"
            type="search"
            name="query"
            autocomplete="off"
            placeholder="${t('knowledge.searchPlaceholder')}"
            value="${escapeHtml(pageState.query)}"
          />
          <button type="submit" class="btn btn--primary" id="knowledge-search-submit">${t('knowledge.searchSubmit')}</button>
        </div>
      </form>

      <section class="knowledge-section" id="knowledge-examples-section" ${pageState.view === 'idle' ? '' : 'hidden'}>
        <h2 class="knowledge-section__title">${t('knowledge.examplesTitle')}</h2>
        <div class="example-list" id="knowledge-examples"></div>
      </section>

      <section class="knowledge-section" id="knowledge-content" aria-live="polite" aria-busy="false"></section>
    </section>
  `;

  bindKnowledgeEvents(main);
  bindUploadEvents(main);
  mountUploadIdleIcon(main);
  renderExamples(main);

  const pendingQuery = consumePendingKnowledgeQuery();

  if (pendingQuery !== undefined && pendingQuery.trim().length > 0) {
    void runSearch(pendingQuery);
    return;
  }

  paintKnowledgeContent();
}

function renderExamples(main: HTMLElement): void {
  const container = main.querySelector('#knowledge-examples') as HTMLElement | null;

  if (container === null) {
    return;
  }

  container.replaceChildren();

  for (const key of EXAMPLE_KEYS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'example-chip';
    button.textContent = t(key);
    button.addEventListener('click', () => {
      void runSearch(t(key));
    });
    container.append(button);
  }
}

function bindKnowledgeEvents(main: HTMLElement): void {
  const form = main.querySelector('#knowledge-search-form') as HTMLFormElement;
  const input = main.querySelector('#knowledge-search-input') as HTMLInputElement;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void runSearch(input.value);
  });
}

function resolveUploadExtension(fileName: string): string | undefined {
  const trimmed = fileName.trim();
  const dotIndex = trimmed.lastIndexOf('.');

  if (dotIndex <= 0) {
    return undefined;
  }

  return trimmed.slice(dotIndex + 1).toLowerCase();
}

function isSupportedUploadFile(fileName: string): boolean {
  const extension = resolveUploadExtension(fileName);
  return extension !== undefined && SUPPORTED_UPLOAD_EXTENSIONS.includes(extension as (typeof SUPPORTED_UPLOAD_EXTENSIONS)[number]);
}

function bindUploadEvents(main: HTMLElement): void {
  const dropzone = main.querySelector('#knowledge-upload-dropzone') as HTMLElement;
  const fileInput = main.querySelector('#knowledge-upload-input') as HTMLInputElement;
  const chooseButton = main.querySelector('#knowledge-upload-button') as HTMLButtonElement;

  chooseButton.addEventListener('click', (event) => {
    event.stopPropagation();
    fileInput.click();
  });

  dropzone.addEventListener('click', () => {
    if (!uploadInProgress) {
      fileInput.click();
    }
  });

  dropzone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!uploadInProgress) {
        fileInput.click();
      }
    }
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];

    if (file !== undefined) {
      void handleUploadFile(file);
    }

    fileInput.value = '';
  });

  dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    if (!uploadInProgress) {
      dropzone.classList.add('knowledge-upload__dropzone--active');
      setUploadHint(t('knowledge.uploadDropActive'));
    }
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('knowledge-upload__dropzone--active');
    if (!uploadInProgress) {
      setUploadHint(t('knowledge.uploadHint'));
    }
  });

  dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropzone.classList.remove('knowledge-upload__dropzone--active');
    setUploadHint(t('knowledge.uploadHint'));

    const file = event.dataTransfer?.files?.[0];

    if (file !== undefined) {
      void handleUploadFile(file);
    }
  });
}

function mountUploadIdleIcon(main: HTMLElement): void {
  const container = main.querySelector('#knowledge-upload-idle-icon') as HTMLElement | null;

  if (container === null) {
    return;
  }

  container.replaceChildren(createUploadIdleIcon());
}

function setUploadHint(message: string): void {
  if (boundMain === null) {
    return;
  }

  const hint = boundMain.querySelector('#knowledge-upload-hint') as HTMLElement | null;

  if (hint !== null) {
    hint.textContent = message;
  }
}

function uploadPhaseLabel(phase: KnowledgeUploadPhase): string {
  switch (phase) {
    case 'uploading':
      return t('knowledge.uploadPhaseUploading');
    case 'reading':
      return t('knowledge.uploadPhaseReading');
    case 'indexing':
      return t('knowledge.uploadPhaseIndexing');
    case 'available':
      return t('knowledge.uploadPhaseAvailable');
    case 'error':
      return t('knowledge.uploadPhaseError');
  }
}

function showUploadProgressPanel(fileName: string, extension: string | undefined): void {
  if (boundMain === null) {
    return;
  }

  const dropzone = boundMain.querySelector('#knowledge-upload-dropzone') as HTMLElement | null;
  const idle = boundMain.querySelector('#knowledge-upload-idle') as HTMLElement | null;
  const progress = boundMain.querySelector('#knowledge-upload-progress') as HTMLElement | null;
  const fileNameEl = boundMain.querySelector('#knowledge-upload-file-name') as HTMLElement | null;
  const fileIconWrap = boundMain.querySelector('#knowledge-upload-file-icon') as HTMLElement | null;
  const detail = boundMain.querySelector('#knowledge-upload-detail') as HTMLElement | null;
  const searchBtn = boundMain.querySelector('#knowledge-upload-search-btn') as HTMLButtonElement | null;

  if (
    dropzone === null ||
    idle === null ||
    progress === null ||
    fileNameEl === null ||
    fileIconWrap === null
  ) {
    return;
  }

  dropzone.classList.add('knowledge-upload__dropzone--busy');
  dropzone.setAttribute('aria-busy', 'true');
  idle.hidden = true;
  progress.hidden = false;
  progress.classList.remove('knowledge-upload__progress--success', 'knowledge-upload__progress--error');
  fileNameEl.textContent = fileName;
  fileIconWrap.replaceChildren(createFileTypeIcon(extension ?? 'txt'));
  if (detail !== null) {
    detail.hidden = true;
    detail.textContent = '';
  }
  if (searchBtn !== null) {
    searchBtn.hidden = true;
  }

  updateUploadProgress({ phase: 'uploading', progress: 0, fileName });
}

function updateUploadProgress(state: KnowledgeUploadProgress): void {
  if (boundMain === null) {
    return;
  }

  const phaseEl = boundMain.querySelector('#knowledge-upload-phase') as HTMLElement | null;
  const progressBar = boundMain.querySelector('#knowledge-upload-progress-bar') as HTMLElement | null;
  const progressTrack = boundMain.querySelector('#knowledge-upload-progress-track') as HTMLElement | null;
  const progressPanel = boundMain.querySelector('#knowledge-upload-progress') as HTMLElement | null;
  const fileIconWrap = boundMain.querySelector('#knowledge-upload-file-icon') as HTMLElement | null;

  if (phaseEl === null || progressBar === null || progressTrack === null || progressPanel === null) {
    return;
  }

  phaseEl.textContent = uploadPhaseLabel(state.phase);
  progressBar.style.width = `${state.progress}%`;
  progressTrack.setAttribute('aria-valuenow', String(state.progress));
  progressTrack.setAttribute('aria-label', uploadPhaseLabel(state.phase));
  progressPanel.classList.toggle('knowledge-upload__progress--indeterminate', state.phase === 'indexing');
  progressPanel.classList.toggle('knowledge-upload__progress--success', state.phase === 'available');
  progressPanel.classList.toggle('knowledge-upload__progress--error', state.phase === 'error');

  if (state.phase === 'available' && fileIconWrap !== null) {
    fileIconWrap.replaceChildren(createUploadSuccessIcon());
  }
}

function showUploadSuccess(fileName: string, workspaceName: string, searchQuery: string): void {
  if (boundMain === null) {
    return;
  }

  const detail = boundMain.querySelector('#knowledge-upload-detail') as HTMLElement | null;
  const searchBtn = boundMain.querySelector('#knowledge-upload-search-btn') as HTMLButtonElement | null;

  updateUploadProgress({ phase: 'available', progress: 100, fileName });

  if (detail !== null) {
    detail.hidden = false;
    detail.textContent = t('knowledge.uploadSuccessDetail', {
      fileName,
      workspace: workspaceName,
    });
  }

  if (searchBtn !== null && searchQuery.trim().length > 0) {
    searchBtn.hidden = false;
    searchBtn.onclick = () => {
      void runSearch(searchQuery);
    };
  }
}

function resetUploadPanel(): void {
  if (boundMain === null) {
    return;
  }

  const dropzone = boundMain.querySelector('#knowledge-upload-dropzone') as HTMLElement | null;
  const idle = boundMain.querySelector('#knowledge-upload-idle') as HTMLElement | null;
  const progress = boundMain.querySelector('#knowledge-upload-progress') as HTMLElement | null;
  const progressBar = boundMain.querySelector('#knowledge-upload-progress-bar') as HTMLElement | null;
  const chooseButton = boundMain.querySelector('#knowledge-upload-button') as HTMLButtonElement | null;

  if (dropzone !== null) {
    dropzone.classList.remove('knowledge-upload__dropzone--busy');
    dropzone.removeAttribute('aria-busy');
  }

  if (idle !== null) {
    idle.hidden = false;
  }

  if (progress !== null) {
    progress.hidden = true;
    progress.classList.remove(
      'knowledge-upload__progress--success',
      'knowledge-upload__progress--error',
      'knowledge-upload__progress--indeterminate',
    );
  }

  if (progressBar !== null) {
    progressBar.style.width = '0%';
  }

  if (chooseButton !== null) {
    chooseButton.disabled = false;
  }

  setUploadHint(t('knowledge.uploadHint'));
}

function scheduleUploadPanelReset(delayMs = 12000): void {
  if (uploadResetTimer !== undefined) {
    clearTimeout(uploadResetTimer);
  }

  uploadResetTimer = setTimeout(() => {
    uploadResetTimer = undefined;
    if (!uploadInProgress) {
      resetUploadPanel();
    }
  }, delayMs);
}

function setUploadStatus(message: string | undefined, isError = false): void {
  if (boundMain === null) {
    return;
  }

  const status = boundMain.querySelector('#knowledge-upload-status') as HTMLElement | null;
  const dropzone = boundMain.querySelector('#knowledge-upload-dropzone') as HTMLElement | null;
  const chooseButton = boundMain.querySelector('#knowledge-upload-button') as HTMLButtonElement | null;

  if (status === null) {
    return;
  }

  if (message === undefined || message.length === 0) {
    status.hidden = true;
    status.textContent = '';
    status.classList.remove('knowledge-upload__status--error');
    return;
  }

  status.hidden = false;
  status.textContent = message;
  status.classList.toggle('knowledge-upload__status--error', isError);

  if (dropzone !== null) {
    dropzone.toggleAttribute('aria-busy', uploadInProgress);
  }

  if (chooseButton !== null) {
    chooseButton.disabled = uploadInProgress;
  }
}

async function handleUploadFile(file: File): Promise<void> {
  if (uploadInProgress) {
    return;
  }

  if (!isSupportedUploadFile(file.name)) {
    setUploadStatus(t('knowledge.uploadErrorInvalidType'), true);
    patchState({ statusText: t('knowledge.uploadErrorInvalidType') });
    return;
  }

  if (uploadResetTimer !== undefined) {
    clearTimeout(uploadResetTimer);
    uploadResetTimer = undefined;
  }

  uploadInProgress = true;
  const extension = resolveUploadExtension(file.name);
  const workspace = getState().activeWorkspace;
  const workspaceName = resolveBrandDisplayName(workspace);
  const searchQuery = file.name.replace(/\.[^.]+$/, '').trim();

  showUploadProgressPanel(file.name, extension);
  setSearchDisabled(true);

  const chooseButton = boundMain?.querySelector('#knowledge-upload-button') as HTMLButtonElement | null;
  if (chooseButton !== null) {
    chooseButton.disabled = true;
  }

  try {
    const payload = await uploadKnowledgeDocument(workspace, file, updateUploadProgress);
    const successMessage =
      payload.chunks === 1
        ? t('knowledge.uploadSuccessOne', { fileName: payload.fileName })
        : t('knowledge.uploadSuccess', { fileName: payload.fileName, count: payload.chunks });

    showUploadSuccess(payload.fileName, workspaceName, searchQuery);
    patchState({ statusText: successMessage });
    scheduleUploadPanelReset();

    if (pageState.query.trim().length > 0) {
      await runSearch(pageState.query);
    }
  } catch (error) {
    const formatted = formatUserError(error instanceof Error ? error.message : String(error));
    updateUploadProgress({ phase: 'error', progress: 0, fileName: file.name });
    setUploadStatus(formatted.message, true);
    patchState({ statusText: formatted.message });
    scheduleUploadPanelReset(8000);
  } finally {
    uploadInProgress = false;
    setSearchDisabled(false);
    if (chooseButton !== null) {
      chooseButton.disabled = false;
    }
  }
}

async function runSearch(rawQuery: string): Promise<void> {
  const query = rawQuery.trim();
  const workspace = getState().activeWorkspace;

  pageState = {
    view: 'loading',
    query,
    workspace,
  };

  syncSearchInput(query);
  setSearchDisabled(true);
  paintKnowledgeContent();

  try {
    const payload = await searchKnowledge(workspace, query);
    pageState = {
      view: payload.total > 0 ? 'results' : 'empty-results',
      query,
      workspace,
      payload,
    };
  } catch (error) {
    const formatted = formatUserError(error instanceof Error ? error.message : String(error));
    pageState = {
      view: 'error',
      query,
      workspace,
      errorMessage: t('knowledge.errorTitle'),
      errorTechnical: formatted.technical,
    };
  } finally {
    setSearchDisabled(false);
    paintKnowledgeContent();
  }
}

function retrySearch(): void {
  if (pageState.query.trim().length === 0) {
    return;
  }

  void runSearch(pageState.query);
}

function syncSearchInput(query: string): void {
  if (boundMain === null) {
    return;
  }

  const input = boundMain.querySelector('#knowledge-search-input') as HTMLInputElement | null;
  if (input) {
    input.value = query;
  }
}

function setSearchDisabled(disabled: boolean): void {
  if (boundMain === null) {
    return;
  }

  const input = boundMain.querySelector('#knowledge-search-input') as HTMLInputElement | null;
  const submit = boundMain.querySelector('#knowledge-search-submit') as HTMLButtonElement | null;
  if (input) input.disabled = disabled;
  if (submit) submit.disabled = disabled;
}

function paintKnowledgeContent(): void {
  if (boundMain === null) {
    return;
  }

  const content = boundMain.querySelector('#knowledge-content') as HTMLElement;
  const examplesSection = boundMain.querySelector('#knowledge-examples-section') as HTMLElement;
  content.setAttribute('aria-busy', String(pageState.view === 'loading'));
  examplesSection.hidden = pageState.view !== 'idle';

  switch (pageState.view) {
    case 'idle':
      content.innerHTML = `
        <div class="knowledge-empty">
          <h2 class="knowledge-empty__title">${t('knowledge.emptyTitle')}</h2>
          <p class="knowledge-empty__body">${t('knowledge.emptyBody')}</p>
        </div>
      `;
      return;
    case 'loading':
      content.innerHTML = `
        <div class="knowledge-loading">
          <p>${t('knowledge.loading', { name: resolveBrandDisplayName(pageState.workspace) })}</p>
        </div>
      `;
      return;
    case 'results':
      content.replaceChildren(renderResultsSection(pageState.payload!));
      return;
    case 'empty-results':
      content.replaceChildren(renderNoResultsSection());
      return;
    case 'error':
      content.replaceChildren(renderErrorSection());
      return;
  }
}

function renderResultsSection(payload: KnowledgeSearchResponseProduct): HTMLElement {
  const section = document.createElement('section');
  section.className = 'knowledge-results';

  const heading = document.createElement('h2');
  heading.className = 'knowledge-section__title';
  heading.textContent = t('knowledge.resultsTitle');

  const summary = document.createElement('p');
  summary.className = 'knowledge-results__summary';
  summary.textContent =
    payload.total === 1
      ? t('knowledge.resultsCountOne')
      : t('knowledge.resultsCount', { count: payload.total });

  section.append(heading, summary);

  const list = document.createElement('div');
  list.className = 'knowledge-results__list';

  for (const record of payload.records) {
    list.append(renderResultCard(record, payload.query));
  }

  section.append(list);
  section.append(renderAskAtlasFromSearch(payload.query));
  return section;
}

function renderResultCard(record: KnowledgeRecordProduct, query: string): HTMLElement {
  const card = document.createElement('article');
  card.className = 'card knowledge-card';

  const type = document.createElement('p');
  type.className = 'knowledge-card__type';
  type.textContent = record.typeLabel;

  const title = document.createElement('h3');
  title.className = 'knowledge-card__title';
  title.textContent = record.title;

  const snippet = document.createElement('p');
  snippet.className = 'knowledge-card__snippet';
  snippet.textContent = record.snippet;

  const meta = document.createElement('dl');
  meta.className = 'knowledge-card__meta';

  const contextRow = document.createElement('div');
  contextRow.className = 'knowledge-card__meta-row';
  contextRow.innerHTML = `
    <dt>${t('knowledge.contextLabel')}</dt>
    <dd>${escapeHtml(record.contextLabel)}</dd>
  `;

  const sourceRow = document.createElement('div');
  sourceRow.className = 'knowledge-card__meta-row';
  sourceRow.innerHTML = `
    <dt>${t('knowledge.sourceLabel')}</dt>
    <dd>${escapeHtml(record.sourceLabel)}</dd>
  `;

  meta.append(contextRow, sourceRow);

  const actions = document.createElement('div');
  actions.className = 'knowledge-card__actions';

  const useButton = document.createElement('button');
  useButton.type = 'button';
  useButton.className = 'btn btn--secondary';
  useButton.textContent = t('knowledge.useInConversation');
  useButton.addEventListener('click', () => {
    openChatWithPrompt(buildKnowledgeConversationPrompt(record, query));
  });

  actions.append(useButton);
  card.append(type, title, snippet, meta, actions);
  return card;
}

function renderNoResultsSection(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'knowledge-empty knowledge-empty--results';

  const title = document.createElement('h2');
  title.className = 'knowledge-empty__title';
  title.textContent = t('knowledge.noResultsTitle');

  const body = document.createElement('p');
  body.className = 'knowledge-empty__body';
  body.textContent = t('knowledge.noResultsBody');

  section.append(title, body, renderAskAtlasFromSearch(pageState.query));
  return section;
}

function renderAskAtlasFromSearch(query: string): HTMLElement {
  const actions = document.createElement('div');
  actions.className = 'knowledge-actions';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn--primary';
  button.textContent =
    query.trim().length > 0 ? t('knowledge.notFoundAsk') : t('knowledge.askAtlas');
  button.addEventListener('click', () => {
    const prompt =
      query.trim().length > 0
        ? buildKnowledgeSearchChatPrompt(query)
        : t('chat.placeholder');
    openChatWithPrompt(prompt);
  });

  actions.append(button);
  return actions;
}

function renderErrorSection(): HTMLElement {
  const panel = document.createElement('section');
  panel.className = 'error-panel knowledge-error';

  const message = document.createElement('p');
  message.className = 'knowledge-error__message';
  message.textContent = pageState.errorMessage ?? t('knowledge.errorTitle');

  const actions = document.createElement('div');
  actions.className = 'error-panel__actions';

  const retryButton = document.createElement('button');
  retryButton.type = 'button';
  retryButton.className = 'btn btn--primary';
  retryButton.textContent = t('common.retry');
  retryButton.addEventListener('click', () => {
    retrySearch();
  });

  actions.append(retryButton);

  if (pageState.errorTechnical !== undefined) {
    panel.append(message, actions);
    appendExpandableDetails(panel, pageState.errorTechnical);
    return panel;
  }

  panel.append(message, actions);
  return panel;
}

function openChatWithPrompt(prompt: string): void {
  setPendingChatDraft(prompt);
  setRoute('/chat');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function refreshKnowledgeView(): void {
  if (boundMain !== null) {
    paintKnowledgeContent();
  }
}

/** Resets module state between tests. */
export function resetKnowledgePageStateForTests(): void {
  pageState = {
    view: 'idle',
    query: '',
    workspace: getState().activeWorkspace,
  };
  uploadInProgress = false;
  if (uploadResetTimer !== undefined) {
    clearTimeout(uploadResetTimer);
    uploadResetTimer = undefined;
  }
}

export function applyPendingChatDraftToComposer(): void {
  const draft = consumePendingChatDraft();

  if (draft === undefined) {
    return;
  }

  window.setTimeout(() => {
    const input = document.querySelector('#chat-input') as HTMLTextAreaElement | null;
    if (input !== null) {
      input.value = draft;
      input.focus();
    }
  }, 0);
}
