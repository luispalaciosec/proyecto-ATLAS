import type { ActivityItemProduct, ActivityItemType } from '../../presentation/map-activity.js';
import {
  formatActivityTime,
  groupActivityItemsByDate,
} from '../../presentation/map-activity.js';
import { formatWorkingContext } from '../lib/brand-context.js';
import { appendExpandableDetails } from '../lib/expandable-details.js';
import { t } from '../../i18n/index.js';
import { fetchActivity } from '../api/client.js';
import { getState, resolveBrandDisplayName, setPendingChatDraft, setPendingKnowledgeQuery, setRoute } from '../state/app-state.js';

type ActivityFilter = 'all' | ActivityItemType;

const FILTERS: Array<{ id: ActivityFilter; labelKey: string }> = [
  { id: 'all', labelKey: 'activity.filterAll' },
  { id: 'conversation', labelKey: 'activity.filterConversation' },
  { id: 'knowledge', labelKey: 'activity.filterKnowledge' },
  { id: 'correction', labelKey: 'activity.filterCorrection' },
  { id: 'error', labelKey: 'activity.filterError' },
];

interface ActivityPageState {
  loading: boolean;
  error?: string;
  errorTechnical?: string;
  filter: ActivityFilter;
  workspace: string;
  items: readonly ActivityItemProduct[];
  scopeNote: string;
}

let boundMain: HTMLElement | null = null;
let pageState: ActivityPageState = {
  loading: true,
  filter: 'all',
  workspace: 'default',
  items: [],
  scopeNote: '',
};

export function renderActivity(main: HTMLElement): void {
  boundMain = main;
  const state = getState();
  const workspaceName = resolveBrandDisplayName(state.activeWorkspace);
  const contextLine = formatWorkingContext(state.activeWorkspace, workspaceName);

  if (pageState.workspace !== state.activeWorkspace) {
    pageState = {
      loading: true,
      filter: 'all',
      workspace: state.activeWorkspace,
      items: [],
      scopeNote: '',
    };
  }

  main.innerHTML = `
    <section class="page activity-page">
      <header class="page__header">
        <h1 class="page__title">${t('pages.activityTitle')}</h1>
        <p class="page__subtitle">${t('activity.subtitle')}</p>
      </header>

      <div class="context-chip" aria-label="${contextLine}">
        <strong class="context-chip__value">${contextLine}</strong>
      </div>

      <div class="banner">${t('workspace.isolationBanner', { name: workspaceName })}</div>

      <div class="activity-filters" role="toolbar" aria-label="${t('pages.activityTitle')}">
        ${FILTERS.map(
          (filter) => `
            <button
              type="button"
              class="activity-filter"
              data-filter="${filter.id}"
              aria-pressed="${pageState.filter === filter.id ? 'true' : 'false'}"
            >
              ${t(filter.labelKey)}
            </button>
          `,
        ).join('')}
      </div>

      <section id="activity-content" class="activity-content" aria-live="polite" aria-busy="false"></section>
    </section>
  `;

  bindActivityEvents(main);

  if (pageState.loading) {
    void loadActivity();
  } else {
    paintActivityContent();
  }
}

function bindActivityEvents(main: HTMLElement): void {
  for (const button of main.querySelectorAll<HTMLButtonElement>('.activity-filter')) {
    button.addEventListener('click', () => {
      const nextFilter = button.dataset.filter as ActivityFilter | undefined;

      if (nextFilter === undefined || nextFilter === pageState.filter) {
        return;
      }

      pageState = { ...pageState, loading: true, filter: nextFilter };
      void loadActivity();
    });
  }
}

async function loadActivity(): Promise<void> {
  if (boundMain === null) {
    return;
  }

  pageState = { ...pageState, loading: true, error: undefined, workspace: getState().activeWorkspace };
  paintActivityContent();

  try {
    const payload = await fetchActivity(getState().activeWorkspace, {
      ...(pageState.filter === 'all' ? {} : { type: pageState.filter }),
    });

    pageState = {
      ...pageState,
      loading: false,
      items: payload.items,
      scopeNote: payload.scopeNote,
    };
  } catch (error) {
    pageState = {
      ...pageState,
      loading: false,
      items: [],
      error: t('activity.errorTitle'),
      errorTechnical: error instanceof Error ? error.message : String(error),
    };
  }

  paintActivityContent();
}

function paintActivityContent(): void {
  if (boundMain === null) {
    return;
  }

  const content = boundMain.querySelector('#activity-content') as HTMLElement;
  content.setAttribute('aria-busy', String(pageState.loading));

  for (const button of boundMain.querySelectorAll<HTMLButtonElement>('.activity-filter')) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === pageState.filter));
    button.classList.toggle('is-active', button.dataset.filter === pageState.filter);
  }

  if (pageState.loading) {
    content.innerHTML = `
      <div class="activity-loading">
        <p>${t('activity.loading')}</p>
      </div>
    `;
    return;
  }

  if (pageState.error !== undefined) {
    content.replaceChildren(renderErrorState());
    return;
  }

  if (pageState.items.length === 0) {
    content.replaceChildren(renderEmptyState());
    return;
  }

  content.replaceChildren(renderTimeline(pageState.items, pageState.scopeNote));
}

function renderEmptyState(): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const section = document.createElement('section');
  section.className = 'activity-empty';

  const title = document.createElement('h2');
  title.className = 'activity-empty__title';
  title.textContent = t('activity.emptyTitle');

  const body = document.createElement('p');
  body.className = 'activity-empty__body';
  body.textContent = t('activity.emptyBody');

  const actions = document.createElement('div');
  actions.className = 'activity-actions';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn--primary';
  button.textContent = t('activity.emptyAction');
  button.addEventListener('click', () => {
    setRoute('/chat');
  });

  actions.append(button);
  section.append(title, body, actions);
  fragment.append(section);
  return fragment;
}

function renderErrorState(): HTMLElement {
  const panel = document.createElement('section');
  panel.className = 'error-panel activity-error';

  const message = document.createElement('p');
  message.textContent = pageState.error ?? t('activity.errorTitle');

  const actions = document.createElement('div');
  actions.className = 'error-panel__actions';

  const retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'btn btn--primary';
  retry.textContent = t('common.retry');
  retry.addEventListener('click', () => {
    void loadActivity();
  });

  actions.append(retry);

  if (pageState.errorTechnical !== undefined) {
    panel.append(message, actions);
    appendExpandableDetails(panel, pageState.errorTechnical);
    return panel;
  }

  panel.append(message, actions);
  return panel;
}

function renderTimeline(
  items: readonly ActivityItemProduct[],
  scopeNote: string,
): DocumentFragment {
  const fragment = document.createDocumentFragment();

  const note = document.createElement('p');
  note.className = 'activity-scope-note';
  note.textContent = scopeNote;
  fragment.append(note);

  const groups = groupActivityItemsByDate(items);

  for (const group of groups) {
    const section = document.createElement('section');
    section.className = 'activity-group';

    const heading = document.createElement('h2');
    heading.className = 'activity-group__title';
    heading.textContent = group.label;

    const list = document.createElement('ol');
    list.className = 'activity-timeline';

    for (const item of group.items) {
      list.append(renderActivityCard(item));
    }

    section.append(heading, list);
    fragment.append(section);
  }

  return fragment;
}

function renderActivityCard(item: ActivityItemProduct): HTMLElement {
  const entry = document.createElement('li');
  entry.className = `activity-card activity-card--${item.status}`;

  const time = document.createElement('time');
  time.className = 'activity-card__time';
  time.dateTime = item.occurredAt;
  time.textContent = formatActivityTime(item.occurredAt);

  const body = document.createElement('article');
  body.className = 'card activity-card__body';

  const title = document.createElement('h3');
  title.className = 'activity-card__title';
  title.textContent = item.title;

  body.append(title);

  if (item.quote !== undefined) {
    const quote = document.createElement('blockquote');
    quote.className = 'activity-card__quote';
    quote.textContent = `“${item.quote}”`;
    body.append(quote);
  }

  if (item.description !== undefined) {
    const description = document.createElement('p');
    description.className = 'activity-card__description';
    description.textContent = item.description;
    body.append(description);
  }

  const context = document.createElement('p');
  context.className = 'activity-card__context';
  context.textContent = item.workspaceName;
  body.append(context);

  if (item.action !== undefined) {
    const actions = document.createElement('div');
    actions.className = 'activity-card__actions';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn--secondary';
    button.textContent = item.action.label;
    button.addEventListener('click', () => {
      handleActivityAction(item.action!);
    });

    actions.append(button);
    body.append(actions);
  }

  if (item.technicalDetails !== undefined) {
    appendExpandableDetails(body, item.technicalDetails);
  }

  entry.append(time, body);
  return entry;
}

function handleActivityAction(action: NonNullable<ActivityItemProduct['action']>): void {
  switch (action.kind) {
    case 'open-chat':
      if (action.draft !== undefined) {
        setPendingChatDraft(action.draft);
      }
      setRoute('/chat');
      return;
    case 'retry-chat':
      if (action.draft !== undefined) {
        setPendingChatDraft(action.draft);
      }
      setRoute('/chat');
      return;
    case 'open-knowledge':
      if (action.draft !== undefined) {
        setPendingKnowledgeQuery(action.draft);
      }
      setRoute('/conocimiento');
  }
}

export function refreshActivityView(): void {
  if (boundMain !== null) {
    paintActivityContent();
  }
}

export async function reloadActivity(): Promise<void> {
  pageState = { ...pageState, loading: true };
  if (boundMain !== null) {
    await loadActivity();
  }
}

export function renderActivityPreview(
  container: HTMLElement,
  items: readonly ActivityItemProduct[],
): void {
  container.replaceChildren();

  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'recent-list__empty';
    empty.textContent = t('activity.recentEmpty');
    container.append(empty);
    return;
  }

  const list = document.createElement('div');
  list.className = 'activity-preview-list';

  for (const item of items.slice(0, 3)) {
    const card = document.createElement('article');
    card.className = 'card activity-preview-card';

    const title = document.createElement('p');
    title.className = 'activity-preview-card__title';
    title.textContent = item.title;

    const meta = document.createElement('p');
    meta.className = 'activity-preview-card__meta';
    meta.textContent = item.quote ?? formatActivityTime(item.occurredAt);

    card.append(title, meta);
    list.append(card);
  }

  const actions = document.createElement('div');
  actions.className = 'activity-actions';

  const viewAll = document.createElement('button');
  viewAll.type = 'button';
  viewAll.className = 'btn btn--secondary';
  viewAll.textContent = t('activity.recentViewAll');
  viewAll.addEventListener('click', () => {
    setRoute('/actividad');
  });

  actions.append(viewAll);
  container.append(list, actions);
}
