import { t } from '../i18n/index.js';
import { loadBrandCatalog } from './lib/brand-catalog.js';
import { bindWorkspaceSwitch, switchWorkspace } from './lib/workspace-switch.js';
import { bindShellEvents, renderShell, updateShellChrome, type ShellElements } from './components/shell.js';
import { renderChat, refreshChatView } from './pages/chat.js';
import { renderHome } from './pages/home.js';
import {
  applyPendingChatDraftToComposer,
  renderKnowledge,
  refreshKnowledgeView,
} from './pages/knowledge.js';
import { renderActivity, refreshActivityView } from './pages/activity.js';
import { renderBrands, refreshBrandsView } from './pages/brands.js';
import {
  getState,
  initRouter,
  patchState,
  setRoute,
  subscribe,
} from './state/app-state.js';

import './styles/app.css';

let shellElements: ShellElements | undefined;

export async function mountApp(root: HTMLElement): Promise<void> {
  shellElements = renderShell(root);

  bindWorkspaceSwitch(shellElements, renderCurrentRoute);

  bindShellEvents(shellElements, {
    onToggleSidebar: () => {
      patchState({ sidebarOpen: !getState().sidebarOpen });
    },
    onBrandSelect: (brandId) => {
      void switchWorkspace(brandId);
    },
    onManageBrands: () => {
      setRoute('/marcas');
    },
  });

  subscribe(() => {
    renderCurrentRoute();
    if (shellElements) {
      updateShellChrome(shellElements);
    }
  });

  initRouter(() => {
    renderCurrentRoute();
  });

  try {
    await loadBrandCatalog();
  } catch {
    patchState({ statusText: t('workspace.loadError') });
  }

  renderCurrentRoute();
  updateShellChrome(shellElements);
}

function renderCurrentRoute(): void {
  if (shellElements === undefined) {
    return;
  }

  const route = getState().route;

  switch (route) {
    case '/chat':
      renderChat(shellElements.main);
      refreshChatView();
      applyPendingChatDraftToComposer();
      break;
    case '/conocimiento':
      renderKnowledge(shellElements.main);
      refreshKnowledgeView();
      break;
    case '/actividad':
      renderActivity(shellElements.main);
      refreshActivityView();
      break;
    case '/marcas':
      renderBrands(shellElements.main);
      refreshBrandsView();
      break;
    case '/configuracion':
      renderSettingsPlaceholder(shellElements.main);
      break;
    default:
      renderHome(shellElements.main);
      break;
  }

  updateShellChrome(shellElements);
}

function renderSettingsPlaceholder(main: HTMLElement): void {
  main.innerHTML = `
    <section class="page">
      <header class="page__header">
        <h1 class="page__title">${t('pages.settingsTitle')}</h1>
      </header>
      <article class="card">
        <h2 class="card__title">${t('common.comingSoon')}</h2>
        <p class="card__body">${t('common.comingSoonBody')}</p>
        <div class="actions-row">
          <button type="button" class="btn btn--primary" id="placeholder-go-chat">${t('home.startChat')}</button>
        </div>
      </article>
    </section>
  `;

  main.querySelector('#placeholder-go-chat')?.addEventListener('click', () => {
    setRoute('/chat');
  });
}

export { switchWorkspace };
