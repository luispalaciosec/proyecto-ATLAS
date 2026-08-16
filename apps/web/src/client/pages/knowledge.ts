import {
  buildKnowledgeConversationPrompt,
  buildKnowledgeSearchChatPrompt,
  type KnowledgeRecordProduct,
  type KnowledgeSearchResponseProduct,
} from '../../presentation/map-knowledge.js';
import {
  buildKnowledgeDocumentSearchPrompt,
  formatKnowledgeDocumentDate,
  type KnowledgeDocumentProduct,
  type KnowledgeDocumentsResponseProduct,
} from '../../presentation/map-knowledge-documents.js';
import { DEFAULT_KNOWLEDGE_FOLDER } from '../../lib/knowledge-upload/folder.js';
import { partitionUploadFiles } from '../../lib/knowledge-upload/partition-upload-files.js';
import { formatUserError } from '../../presentation/format-error.js';
import { formatWorkingContext } from '../lib/brand-context.js';
import { mountDialogRoot } from '../lib/dialog.js';
import {
  findKnowledgeDuplicateMatch,
  type KnowledgeDuplicateMatch,
} from '../lib/knowledge-duplicate-file-name.js';
import { getShellBodyElement } from '../components/shell.js';
import { appendExpandableDetails } from '../lib/expandable-details.js';
import {
  createFileTypeIcon,
  createUploadIdleIcon,
  createUploadSuccessIcon,
} from '../lib/icons.js';
import { t } from '../../i18n/index.js';
import {
  createKnowledgeFolder,
  fetchKnowledgeDocuments,
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

const SUPPORTED_UPLOAD_EXTENSIONS = ['pdf', 'docx', 'pptx', 'txt', 'md', 'xls', 'xlsx'] as const;
const SUPPORTED_UPLOAD_ACCEPT = SUPPORTED_UPLOAD_EXTENSIONS.map((ext) => `.${ext}`).join(',');

let currentUploadExtension: string | undefined;
const NEW_FOLDER_OPTION_VALUE = '__new__';

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

interface KnowledgeLibraryState {
  loading: boolean;
  workspace: string;
  activeFolder: string;
  payload?: KnowledgeDocumentsResponseProduct;
  errorMessage?: string;
}

let boundMain: HTMLElement | null = null;
let uploadInProgress = false;
let uploadResetTimer: ReturnType<typeof setTimeout> | undefined;
let dialogRootRef: HTMLElement | undefined;
let unmountDuplicateDialog: (() => void) | undefined;
let duplicateDialogRestoreFocus: HTMLElement | null = null;
let pageState: KnowledgePageState = {
  view: 'idle',
  query: '',
  workspace: 'default',
};
let libraryState: KnowledgeLibraryState = {
  loading: true,
  workspace: 'default',
  activeFolder: 'all',
};

export function bindKnowledgeDialogRoot(root: HTMLElement): void {
  dialogRootRef = root;
}

function closeDuplicateUploadDialog(): void {
  unmountDuplicateDialog?.();
  unmountDuplicateDialog = undefined;
  dialogRootRef?.replaceChildren();

  if (duplicateDialogRestoreFocus !== null) {
    duplicateDialogRestoreFocus.focus();
    duplicateDialogRestoreFocus = null;
  }
}

function confirmDuplicateUploadDialog(
  entries: ReadonlyArray<{ file: File; match: KnowledgeDuplicateMatch }>,
): Promise<boolean> {
  if (dialogRootRef === undefined || entries.length === 0) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const root = dialogRootRef;

    if (root === undefined) {
      resolve(true);
      return;
    }

    closeDuplicateUploadDialog();

    duplicateDialogRestoreFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const backdrop = document.createElement('div');
    backdrop.className = 'dialog-backdrop';

    const dialog = document.createElement('div');
    dialog.className = 'dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'knowledge-duplicate-dialog-title');

    const listItems = entries
      .map((entry) => {
        const label =
          entry.match.kind === 'exact'
            ? t('knowledge.uploadDuplicateDialogExactItem', {
                fileName: entry.file.name,
                existingFileName: entry.match.existingFileName,
                chunks: entry.match.chunks,
              })
            : t('knowledge.uploadDuplicateDialogSimilarItem', {
                fileName: entry.file.name,
                existingFileName: entry.match.existingFileName,
                chunks: entry.match.chunks,
              });

        return `<li>${escapeHtml(label)}</li>`;
      })
      .join('');

    dialog.innerHTML = `
      <header class="dialog__header">
        <h2 id="knowledge-duplicate-dialog-title" class="dialog__title">${t('knowledge.uploadDuplicateDialogTitle')}</h2>
        <p class="dialog__subtitle">${t('knowledge.uploadDuplicateDialogBody')}</p>
      </header>
      <ul class="knowledge-upload-notice__list">${listItems}</ul>
      <p class="dialog__note">${t('knowledge.uploadDuplicateNoticeBody', {
        existingFileName: entries[0]?.match.existingFileName ?? '',
        chunks: entries[0]?.match.chunks ?? 0,
      })}</p>
      <div class="dialog__actions">
        <button type="button" class="btn btn--ghost" id="knowledge-duplicate-cancel">${t('common.cancel')}</button>
        <button type="button" class="btn btn--primary" id="knowledge-duplicate-continue">${t('knowledge.uploadDuplicateDialogContinue')}</button>
      </div>
    `;

    backdrop.append(dialog);

    const cancelButton = dialog.querySelector('#knowledge-duplicate-cancel') as HTMLButtonElement;
    const continueButton = dialog.querySelector('#knowledge-duplicate-continue') as HTMLButtonElement;

    const finish = (accepted: boolean): void => {
      closeDuplicateUploadDialog();
      resolve(accepted);
    };

    cancelButton.addEventListener('click', () => {
      finish(false);
    });

    continueButton.addEventListener('click', () => {
      finish(true);
    });

    const shellRoot = root.parentElement ?? root;
    const shellBody = getShellBodyElement(shellRoot);

    unmountDuplicateDialog = mountDialogRoot(root, backdrop, {
      restoreFocusTo: duplicateDialogRestoreFocus,
      inertTarget: shellBody,
      initialFocus: continueButton,
      onBackdropClick: () => {
        finish(false);
      },
      onEscape: () => {
        finish(false);
      },
    });
  });
}

function hideUploadDuplicateNotice(): void {
  if (boundMain === null) {
    return;
  }

  const notice = boundMain.querySelector('#knowledge-upload-notice') as HTMLElement | null;
  if (notice !== null) {
    notice.hidden = true;
  }
}

function showUploadDuplicateNotice(match: KnowledgeDuplicateMatch): void {
  if (boundMain === null) {
    return;
  }

  const notice = boundMain.querySelector('#knowledge-upload-notice') as HTMLElement | null;
  const title = boundMain.querySelector('#knowledge-upload-notice-title') as HTMLElement | null;
  const body = boundMain.querySelector('#knowledge-upload-notice-body') as HTMLElement | null;

  if (notice === null || title === null || body === null) {
    return;
  }

  title.textContent = t('knowledge.uploadDuplicateNoticeTitle');
  body.textContent = t('knowledge.uploadDuplicateNoticeBody', {
    existingFileName: match.existingFileName,
    chunks: match.chunks,
  });
  notice.hidden = false;
  notice.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

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

  if (libraryState.workspace !== state.activeWorkspace) {
    libraryState = {
      loading: true,
      workspace: state.activeWorkspace,
      activeFolder: 'all',
    };
  } else {
    libraryState = { ...libraryState, workspace: state.activeWorkspace };
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
        <div class="knowledge-upload__folder">
          <label class="knowledge-upload__folder-label" for="knowledge-upload-folder-select">${t('knowledge.uploadFolderLabel')}</label>
          <select
            id="knowledge-upload-folder-select"
            class="knowledge-upload__folder-select"
          ></select>
          <div class="knowledge-upload__folder-custom" id="knowledge-upload-folder-custom-wrap" hidden>
            <label class="knowledge-upload__folder-custom-label" for="knowledge-upload-folder-custom">${t('knowledge.uploadFolderCustomLabel')}</label>
            <input
              id="knowledge-upload-folder-custom"
              class="knowledge-upload__folder-input"
              type="text"
              autocomplete="off"
            />
          </div>
          <p class="knowledge-upload__folder-hint">${t('knowledge.uploadFolderHint')}</p>
        </div>
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
                <p class="knowledge-upload__batch" id="knowledge-upload-batch" hidden></p>
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
            accept="${SUPPORTED_UPLOAD_ACCEPT}"
            multiple
            hidden
          />
        </div>
        <p class="knowledge-upload__status" id="knowledge-upload-status" hidden aria-live="polite"></p>
        <section
          class="knowledge-upload-notice"
          id="knowledge-upload-notice"
          hidden
          role="alert"
          aria-live="assertive"
        >
          <h3 class="knowledge-upload-notice__title" id="knowledge-upload-notice-title"></h3>
          <p class="knowledge-upload-notice__body" id="knowledge-upload-notice-body"></p>
          <button type="button" class="btn btn--secondary" id="knowledge-upload-notice-dismiss">
            ${t('knowledge.uploadDuplicateNoticeDismiss')}
          </button>
        </section>
      </section>

      <section class="knowledge-library" id="knowledge-library">
        <div class="knowledge-library__header">
          <h2 class="knowledge-section__title">${t('knowledge.libraryTitle')}</h2>
          <p class="knowledge-library__subtitle">${t('knowledge.librarySubtitle')}</p>
        </div>
        <form id="knowledge-create-folder-form" class="knowledge-library__create-folder">
          <label class="knowledge-library__create-folder-label" for="knowledge-create-folder-input">${t('knowledge.createFolderTitle')}</label>
          <div class="knowledge-library__create-folder-row">
            <input
              id="knowledge-create-folder-input"
              class="knowledge-library__create-folder-input"
              type="text"
              placeholder="${t('knowledge.createFolderPlaceholder')}"
              autocomplete="off"
            />
            <button type="submit" class="btn btn--secondary">${t('knowledge.createFolderButton')}</button>
          </div>
          <p class="knowledge-library__create-folder-status" id="knowledge-create-folder-status" hidden aria-live="polite"></p>
        </form>
        <p class="knowledge-library__folders-hint">${t('knowledge.libraryFoldersHint')}</p>
        <div class="knowledge-library__folders" id="knowledge-library-folders"></div>
        <div
          class="knowledge-library__content"
          id="knowledge-library-content"
          aria-live="polite"
          aria-busy="${libraryState.loading ? 'true' : 'false'}"
        ></div>
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
  bindCreateFolderForm(main);
  bindUploadFolderSelect(main);
  syncUploadFolderSelect([DEFAULT_KNOWLEDGE_FOLDER]);
  mountUploadIdleIcon(main);
  renderExamples(main);
  paintKnowledgeLibrary();
  void loadKnowledgeLibrary();

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

function bindCreateFolderForm(main: HTMLElement): void {
  const form = main.querySelector('#knowledge-create-folder-form') as HTMLFormElement | null;
  const input = main.querySelector('#knowledge-create-folder-input') as HTMLInputElement | null;

  if (form === null || input === null) {
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void handleCreateFolder(input.value);
  });
}

function bindUploadFolderSelect(main: HTMLElement): void {
  const select = main.querySelector('#knowledge-upload-folder-select') as HTMLSelectElement | null;
  const customWrap = main.querySelector('#knowledge-upload-folder-custom-wrap') as HTMLElement | null;

  if (select === null || customWrap === null) {
    return;
  }

  select.addEventListener('change', () => {
    const isNew = select.value === NEW_FOLDER_OPTION_VALUE;
    customWrap.hidden = !isNew;

    if (isNew) {
      const customInput = main.querySelector('#knowledge-upload-folder-custom') as HTMLInputElement | null;
      customInput?.focus();
    }
  });
}

function setCreateFolderStatus(message: string | undefined, isError = false): void {
  if (boundMain === null) {
    return;
  }

  const status = boundMain.querySelector('#knowledge-create-folder-status') as HTMLElement | null;

  if (status === null) {
    return;
  }

  if (message === undefined || message.length === 0) {
    status.hidden = true;
    status.textContent = '';
    status.classList.remove('knowledge-library__create-folder-status--error');
    return;
  }

  status.hidden = false;
  status.textContent = message;
  status.classList.toggle('knowledge-library__create-folder-status--error', isError);
}

async function handleCreateFolder(rawName: string): Promise<void> {
  const name = rawName.trim();

  if (name.length === 0) {
    setCreateFolderStatus(t('knowledge.createFolderError'), true);
    return;
  }

  const workspace = getState().activeWorkspace;

  try {
    const payload = await createKnowledgeFolder(workspace, name);
    const input = boundMain?.querySelector('#knowledge-create-folder-input') as HTMLInputElement | null;

    if (input !== null) {
      input.value = '';
    }

    setCreateFolderStatus(t('knowledge.createFolderSuccess', { name }));
    syncUploadFolderSelect(payload.folders, name);
    libraryState = {
      ...libraryState,
      activeFolder: name,
    };
    void loadKnowledgeLibrary();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setCreateFolderStatus(
      message.includes('ya existe') ? t('knowledge.createFolderDuplicate') : t('knowledge.createFolderError'),
      true,
    );
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

function collectUploadFiles(fileList: FileList | null | undefined): readonly File[] {
  if (fileList === null || fileList === undefined || fileList.length === 0) {
    return [];
  }

  return Object.freeze([...fileList]);
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
    const files = collectUploadFiles(fileInput.files);

    if (files.length > 0) {
      void handleUploadFiles(files);
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

    const files = collectUploadFiles(event.dataTransfer?.files);

    if (files.length > 0) {
      void handleUploadFiles(files);
    }
  });

  const duplicateDismiss = main.querySelector('#knowledge-upload-notice-dismiss') as HTMLButtonElement | null;
  duplicateDismiss?.addEventListener('click', () => {
    hideUploadDuplicateNotice();
  });
}

function mountUploadIdleIcon(main: HTMLElement): void {
  const container = main.querySelector('#knowledge-upload-idle-icon') as HTMLElement | null;

  if (container === null) {
    return;
  }

  container.replaceChildren(createUploadIdleIcon());
}

function resolveUploadFolderValue(): string {
  if (boundMain === null) {
    return DEFAULT_KNOWLEDGE_FOLDER;
  }

  const select = boundMain.querySelector('#knowledge-upload-folder-select') as HTMLSelectElement | null;

  if (select?.value === NEW_FOLDER_OPTION_VALUE) {
    const custom = boundMain.querySelector('#knowledge-upload-folder-custom') as HTMLInputElement | null;
    const value = custom?.value.trim() ?? '';
    return value.length > 0 ? value : DEFAULT_KNOWLEDGE_FOLDER;
  }

  const selected = select?.value.trim() ?? '';
  return selected.length > 0 ? selected : DEFAULT_KNOWLEDGE_FOLDER;
}

function syncUploadFolderSelect(folders: readonly string[], selectedFolder?: string): void {
  if (boundMain === null) {
    return;
  }

  const select = boundMain.querySelector('#knowledge-upload-folder-select') as HTMLSelectElement | null;
  const customWrap = boundMain.querySelector('#knowledge-upload-folder-custom-wrap') as HTMLElement | null;

  if (select === null) {
    return;
  }

  const previous = selectedFolder ?? resolveUploadFolderValue();
  select.replaceChildren();

  for (const folder of folders) {
    const option = document.createElement('option');
    option.value = folder;
    option.textContent = folder;
    select.append(option);
  }

  const newOption = document.createElement('option');
  newOption.value = NEW_FOLDER_OPTION_VALUE;
  newOption.textContent = t('knowledge.uploadFolderNewOption');
  select.append(newOption);

  if (folders.includes(previous)) {
    select.value = previous;
    if (customWrap !== null) {
      customWrap.hidden = true;
    }
    return;
  }

  select.value = NEW_FOLDER_OPTION_VALUE;
  if (customWrap !== null) {
    customWrap.hidden = false;
  }

  const customInput = boundMain.querySelector('#knowledge-upload-folder-custom') as HTMLInputElement | null;
  if (customInput !== null) {
    customInput.value = previous === DEFAULT_KNOWLEDGE_FOLDER ? '' : previous;
  }
}

async function loadKnowledgeLibrary(): Promise<void> {
  const workspace = getState().activeWorkspace;

  libraryState = {
    ...libraryState,
    loading: true,
    workspace,
    errorMessage: undefined,
  };
  paintKnowledgeLibrary();

  try {
    const payload = await fetchKnowledgeDocuments(
      workspace,
      libraryState.activeFolder === 'all' ? undefined : libraryState.activeFolder,
    );

    libraryState = {
      loading: false,
      workspace,
      activeFolder: libraryState.activeFolder,
      payload,
    };
    syncUploadFolderSelect(payload.folders);
  } catch {
    libraryState = {
      loading: false,
      workspace,
      activeFolder: libraryState.activeFolder,
      errorMessage: t('knowledge.libraryError'),
    };
  }

  paintKnowledgeLibrary();
}

function setLibraryFolder(folder: string): void {
  if (libraryState.activeFolder === folder) {
    return;
  }

  libraryState = {
    ...libraryState,
    activeFolder: folder,
  };
  void loadKnowledgeLibrary();
}

function renderLibraryFolderFilters(payload: KnowledgeDocumentsResponseProduct): HTMLElement {
  const container = document.createElement('div');
  container.className = 'knowledge-library__folder-list';
  container.setAttribute('role', 'tablist');
  container.setAttribute('aria-label', t('knowledge.uploadFolderLabel'));

  const folders = ['all', ...payload.folders.filter((folder) => folder !== 'all')];

  for (const folder of folders) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'knowledge-folder-chip';
    button.dataset.folder = folder;
    button.setAttribute('role', 'tab');
    button.setAttribute(
      'aria-selected',
      String(libraryState.activeFolder === folder),
    );
    button.textContent =
      folder === 'all'
        ? t('knowledge.libraryAllFolders')
        : folder;
    button.classList.toggle(
      'knowledge-folder-chip--active',
      libraryState.activeFolder === folder,
    );
    button.addEventListener('click', () => {
      setLibraryFolder(folder);
    });
    container.append(button);
  }

  return container;
}

function renderLibraryDocumentCard(entry: KnowledgeDocumentProduct): HTMLElement {
  const card = document.createElement('article');
  card.className = 'card knowledge-doc-card';

  const iconWrap = document.createElement('span');
  iconWrap.className = 'knowledge-doc-card__icon';
  iconWrap.append(createFileTypeIcon(entry.fileType));

  const body = document.createElement('div');
  body.className = 'knowledge-doc-card__body';

  const title = document.createElement('h3');
  title.className = 'knowledge-doc-card__title';
  title.textContent = entry.fileName;

  const meta = document.createElement('p');
  meta.className = 'knowledge-doc-card__meta';
  meta.textContent = [
    entry.fileType.toUpperCase(),
    entry.chunks === 1
      ? t('knowledge.libraryChunksOne')
      : t('knowledge.libraryChunksMany', { count: entry.chunks }),
    t('knowledge.libraryUploadedAt', {
      date: formatKnowledgeDocumentDate(entry.uploadedAt),
    }),
  ].join(' · ');

  const folder = document.createElement('p');
  folder.className = 'knowledge-doc-card__folder';
  folder.textContent = t('knowledge.libraryFolderLabel', { name: entry.folder });

  body.append(title, meta, folder);

  const actions = document.createElement('div');
  actions.className = 'knowledge-doc-card__actions';

  const searchButton = document.createElement('button');
  searchButton.type = 'button';
  searchButton.className = 'btn btn--secondary';
  searchButton.textContent = t('knowledge.librarySearchAction');
  searchButton.addEventListener('click', () => {
    void runSearch(entry.fileName.replace(/\.[^.]+$/, '').trim());
  });

  const chatButton = document.createElement('button');
  chatButton.type = 'button';
  chatButton.className = 'btn btn--secondary';
  chatButton.textContent = t('knowledge.useInConversation');
  chatButton.addEventListener('click', () => {
    setPendingChatDraft(buildKnowledgeDocumentSearchPrompt(entry.fileName));
    setRoute('/chat');
  });

  actions.append(searchButton, chatButton);
  card.append(iconWrap, body, actions);
  return card;
}

function paintKnowledgeLibrary(): void {
  if (boundMain === null) {
    return;
  }

  const foldersHost = boundMain.querySelector('#knowledge-library-folders') as HTMLElement | null;
  const content = boundMain.querySelector('#knowledge-library-content') as HTMLElement | null;

  if (foldersHost === null || content === null) {
    return;
  }

  content.setAttribute('aria-busy', String(libraryState.loading));

  if (libraryState.loading) {
    foldersHost.replaceChildren();
    content.innerHTML = `<div class="knowledge-library__loading"><p>${t('knowledge.libraryLoading')}</p></div>`;
    return;
  }

  if (libraryState.errorMessage !== undefined) {
    foldersHost.replaceChildren();
    content.innerHTML = `<div class="knowledge-library__error"><p>${escapeHtml(libraryState.errorMessage)}</p></div>`;
    return;
  }

  const payload = libraryState.payload;
  const folders = payload?.folders ?? [DEFAULT_KNOWLEDGE_FOLDER];

  foldersHost.replaceChildren(
    renderLibraryFolderFilters({
      workspace: libraryState.workspace,
      folders,
      total: payload?.total ?? 0,
      documents: payload?.documents ?? [],
    }),
  );

  if (payload === undefined || payload.documents.length === 0) {
    content.innerHTML = `
      <div class="knowledge-library__empty">
        <h3 class="knowledge-library__empty-title">${t('knowledge.libraryEmptyTitle')}</h3>
        <p class="knowledge-library__empty-body">${t('knowledge.libraryEmptyBody')}</p>
      </div>
    `;
    syncUploadFolderSelect(folders);
    return;
  }

  const list = document.createElement('div');
  list.className = 'knowledge-library__list';

  for (const document of payload.documents) {
    list.append(renderLibraryDocumentCard(document));
  }

  content.replaceChildren(list);
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
      return currentUploadExtension === 'xls' || currentUploadExtension === 'xlsx'
        ? t('knowledge.uploadPhaseReadingExcel')
        : t('knowledge.uploadPhaseReading');
    case 'indexing':
      return t('knowledge.uploadPhaseIndexing');
    case 'available':
      return t('knowledge.uploadPhaseAvailable');
    case 'error':
      return t('knowledge.uploadPhaseError');
  }
}

function showUploadProgressPanel(
  fileName: string,
  extension: string | undefined,
  batch?: { current: number; total: number },
): void {
  if (boundMain === null) {
    return;
  }

  const dropzone = boundMain.querySelector('#knowledge-upload-dropzone') as HTMLElement | null;
  const idle = boundMain.querySelector('#knowledge-upload-idle') as HTMLElement | null;
  const progress = boundMain.querySelector('#knowledge-upload-progress') as HTMLElement | null;
  const batchEl = boundMain.querySelector('#knowledge-upload-batch') as HTMLElement | null;
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

  if (batchEl !== null) {
    if (batch !== undefined && batch.total > 1) {
      batchEl.hidden = false;
      batchEl.textContent = t('knowledge.uploadBatchProgress', {
        current: batch.current,
        total: batch.total,
      });
    } else {
      batchEl.hidden = true;
      batchEl.textContent = '';
    }
  }

  currentUploadExtension = extension;
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

function showUploadSuccess(
  fileName: string,
  workspaceName: string,
  searchQuery: string,
  options?: { sheetCount?: number; chunks?: number },
): void {
  if (boundMain === null) {
    return;
  }

  const detail = boundMain.querySelector('#knowledge-upload-detail') as HTMLElement | null;
  const searchBtn = boundMain.querySelector('#knowledge-upload-search-btn') as HTMLButtonElement | null;

  updateUploadProgress({ phase: 'available', progress: 100, fileName });

  if (detail !== null) {
    detail.hidden = false;
    if (options?.sheetCount !== undefined && options.chunks !== undefined) {
      detail.textContent = t('knowledge.uploadSuccessExcelDetail', {
        fileName,
        workspace: workspaceName,
        sheetCount: options.sheetCount,
        count: options.chunks,
      });
    } else {
      detail.textContent = t('knowledge.uploadSuccessDetail', {
        fileName,
        workspace: workspaceName,
      });
    }
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

function buildBatchUploadSummaryMessage(options: {
  succeeded: readonly string[];
  failed: readonly string[];
  skipped: readonly string[];
}): string {
  if (options.succeeded.length > 0 && options.failed.length > 0) {
    return t('knowledge.uploadBatchPartial', {
      success: options.succeeded.length,
      total: options.succeeded.length + options.failed.length,
    });
  }

  const parts: string[] = [];

  if (options.succeeded.length === 1) {
    parts.push(t('knowledge.uploadBatchSuccessOne'));
  } else if (options.succeeded.length > 1) {
    parts.push(t('knowledge.uploadBatchSuccess', { count: options.succeeded.length }));
  }

  if (options.failed.length === 1) {
    parts.push(t('knowledge.uploadBatchFailedOne', { fileName: options.failed[0] ?? '' }));
  } else if (options.failed.length > 1) {
    parts.push(t('knowledge.uploadBatchFailedMany', { count: options.failed.length }));
  }

  if (options.skipped.length > 0) {
    parts.push(t('knowledge.uploadBatchSkipped', { count: options.skipped.length }));
  }

  return parts.join(' ');
}

async function handleUploadFiles(files: readonly File[]): Promise<void> {
  if (uploadInProgress || files.length === 0) {
    return;
  }

  const { supported, unsupported } = partitionUploadFiles(files, isSupportedUploadFile);

  if (supported.length === 0) {
    setUploadStatus(t('knowledge.uploadErrorInvalidType'), true);
    patchState({ statusText: t('knowledge.uploadErrorInvalidType') });
    return;
  }

  const workspace = getState().activeWorkspace;
  const workspaceName = resolveBrandDisplayName(workspace);
  const folder = resolveUploadFolderValue();

  let existingDocuments: readonly KnowledgeDocumentProduct[] = [];

  try {
    const documentsPayload = await fetchKnowledgeDocuments(workspace, folder);
    existingDocuments = [...documentsPayload.documents];
  } catch {
    existingDocuments = libraryState.payload?.documents ?? [];
  }

  const duplicateEntries = supported.flatMap((file) => {
    const match = findKnowledgeDuplicateMatch(file.name, existingDocuments, folder);

    if (match === undefined) {
      return [];
    }

    return [{ file, match }];
  });

  if (duplicateEntries.length > 0) {
    const confirmed = await confirmDuplicateUploadDialog(duplicateEntries);

    if (!confirmed) {
      return;
    }
  }

  const duplicateMatchesByFileName = new Map(
    duplicateEntries.map((entry) => [entry.file.name.toLowerCase(), entry.match]),
  );

  if (uploadResetTimer !== undefined) {
    clearTimeout(uploadResetTimer);
    uploadResetTimer = undefined;
  }

  uploadInProgress = true;
  const chooseButton = boundMain?.querySelector('#knowledge-upload-button') as HTMLButtonElement | null;

  setSearchDisabled(true);
  if (chooseButton !== null) {
    chooseButton.disabled = true;
  }

  const succeeded: string[] = [];
  const failed: string[] = [];
  let lastFolder = folder;

  for (let index = 0; index < supported.length; index += 1) {
    const file = supported[index];

    if (file === undefined) {
      continue;
    }

    const extension = resolveUploadExtension(file.name);
    showUploadProgressPanel(file.name, extension, {
      current: index + 1,
      total: supported.length,
    });

    try {
      const payload = await uploadKnowledgeDocument(
        workspace,
        file,
        updateUploadProgress,
        folder,
      );
      succeeded.push(payload.fileName);
      lastFolder = payload.folder;

      const duplicateMatch = duplicateMatchesByFileName.get(file.name.toLowerCase());

      if (supported.length === 1) {
        const successMessage =
          payload.sheetCount !== undefined
            ? t('knowledge.uploadSuccessExcel', {
                fileName: payload.fileName,
                sheetCount: payload.sheetCount,
                count: payload.chunks,
              })
            : payload.chunks === 1
              ? t('knowledge.uploadSuccessOne', { fileName: payload.fileName })
              : t('knowledge.uploadSuccess', { fileName: payload.fileName, count: payload.chunks });

        showUploadSuccess(
          payload.fileName,
          workspaceName,
          file.name.replace(/\.[^.]+$/, '').trim(),
          payload.sheetCount !== undefined
            ? { sheetCount: payload.sheetCount, chunks: payload.chunks }
            : undefined,
        );

        if (duplicateMatch !== undefined) {
          showUploadDuplicateNotice(duplicateMatch);
        } else {
          hideUploadDuplicateNotice();
          patchState({ statusText: successMessage });
        }
      } else if (duplicateMatch !== undefined) {
        showUploadDuplicateNotice(duplicateMatch);
      }
    } catch (error) {
      failed.push(file.name);
      const formatted = formatUserError(error instanceof Error ? error.message : String(error));

      if (supported.length === 1) {
        updateUploadProgress({ phase: 'error', progress: 0, fileName: file.name });
        setUploadStatus(formatted.message, true);
        patchState({ statusText: formatted.message });
      }
    }
  }

  if (supported.length > 1) {
    const summary = buildBatchUploadSummaryMessage({
      succeeded,
      failed,
      skipped: unsupported,
    });

    if (succeeded.length > 0) {
      const lastFile = succeeded[succeeded.length - 1] ?? '';
      showUploadSuccess(lastFile, workspaceName, '');

      const hadDuplicate = succeeded.some((fileName) =>
        duplicateMatchesByFileName.has(fileName.toLowerCase()),
      );

      if (hadDuplicate) {
        const lastDuplicateName = [...duplicateMatchesByFileName.keys()].find((fileName) =>
          succeeded.some((uploaded) => uploaded.toLowerCase() === fileName),
        );
        const lastDuplicateMatch =
          lastDuplicateName !== undefined
            ? duplicateMatchesByFileName.get(lastDuplicateName)
            : undefined;

        if (lastDuplicateMatch !== undefined) {
          showUploadDuplicateNotice(lastDuplicateMatch);
        }
      } else {
        hideUploadDuplicateNotice();
        patchState({ statusText: summary });
      }

      setUploadStatus(summary, failed.length > 0);
    } else {
      updateUploadProgress({
        phase: 'error',
        progress: 0,
        fileName: failed[0] ?? t('knowledge.uploadErrorGeneric'),
      });
      patchState({ statusText: summary });
      setUploadStatus(summary, true);
    }
  } else if (unsupported.length > 0 && succeeded.length === 1) {
    setUploadStatus(t('knowledge.uploadBatchSkipped', { count: unsupported.length }), true);
  }

  if (succeeded.length > 0) {
    libraryState = {
      ...libraryState,
      activeFolder: lastFolder,
    };
    void loadKnowledgeLibrary();

    if (pageState.query.trim().length > 0) {
      await runSearch(pageState.query);
    }
  }

  scheduleUploadPanelReset(succeeded.length > 0 ? 12000 : 8000);
  uploadInProgress = false;
  setSearchDisabled(false);

  if (chooseButton !== null) {
    chooseButton.disabled = false;
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
  closeDuplicateUploadDialog();
  pageState = {
    view: 'idle',
    query: '',
    workspace: getState().activeWorkspace,
  };
  libraryState = {
    loading: true,
    workspace: getState().activeWorkspace,
    activeFolder: 'all',
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
