import {
  buildKnowledgeConversationPrompt,
  buildKnowledgeSearchChatPrompt,
  type KnowledgeRecordProduct,
  type KnowledgeSearchResponseProduct,
} from '../../presentation/map-knowledge.js';
import { formatUserError } from '../../presentation/format-error.js';
import { formatWorkingContext } from '../lib/brand-context.js';
import { t } from '../../i18n/index.js';
import { searchKnowledge } from '../api/client.js';
import {
  getState,
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
    const detailsButton = document.createElement('button');
    detailsButton.type = 'button';
    detailsButton.className = 'btn btn--ghost';
    detailsButton.textContent = t('common.showDetails');

    const details = document.createElement('pre');
    details.className = 'error-panel__details';
    details.hidden = true;
    details.textContent = pageState.errorTechnical;

    detailsButton.addEventListener('click', () => {
      details.hidden = !details.hidden;
      detailsButton.textContent = details.hidden
        ? t('common.showDetails')
        : t('common.hideDetails');
    });

    panel.append(message, actions, detailsButton, details);
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
