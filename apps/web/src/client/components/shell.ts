import { t } from '../../i18n/index.js';
import { type AppRoute, getState, resolveBrandDisplayName, setRoute } from '../state/app-state.js';

const NAV_ITEMS: Array<{ route: AppRoute; labelKey: string }> = [
  { route: '/', labelKey: 'nav.home' },
  { route: '/chat', labelKey: 'nav.chat' },
  { route: '/conocimiento', labelKey: 'nav.knowledge' },
  { route: '/actividad', labelKey: 'nav.activity' },
  { route: '/marcas', labelKey: 'nav.brands' },
  { route: '/configuracion', labelKey: 'nav.settings' },
];

export interface ShellElements {
  readonly root: HTMLElement;
  readonly main: HTMLElement;
  readonly statusBar: HTMLElement;
  readonly brandSwitcher: HTMLElement;
  readonly brandSwitcherTrigger: HTMLButtonElement;
  readonly brandSwitcherPanel: HTMLElement;
  readonly dialogRoot: HTMLElement;
}

let panelOpen = false;
let outsideClickHandler: ((event: MouseEvent) => void) | undefined;

export function renderShell(root: HTMLElement): ShellElements {
  root.innerHTML = `
    <div class="shell">
      <header class="shell__header">
        <div class="shell__brand">
          <button type="button" class="shell__menu-toggle" id="menu-toggle" aria-label="${t('nav.openMenu')}"></button>
          <div class="shell__logo">${t('app.name')}</div>
          <nav class="shell__nav-inline" aria-label="Principal"></nav>
        </div>
        <div class="brand-switcher" id="header-brand-switcher">
          <span class="brand-switcher__label">${t('workspace.brandLabel')}</span>
          <div class="brand-switcher__control">
            <button
              type="button"
              id="brand-switcher-trigger"
              class="brand-switcher__trigger"
              aria-haspopup="listbox"
              aria-expanded="false"
              aria-controls="brand-switcher-panel"
            >
              <span id="brand-switcher-current">${t('brands.loadingName')}</span>
            </button>
            <div
              id="brand-switcher-panel"
              class="brand-switcher__panel"
              role="listbox"
              aria-label="${t('workspace.switch')}"
              hidden
            ></div>
          </div>
        </div>
      </header>
      <div class="shell__body" id="shell-body">
        <aside class="shell__sidebar" id="sidebar" aria-label="Navegación"></aside>
        <main class="shell__main" id="main" tabindex="-1"></main>
      </div>
      <div id="shell-dialog-root"></div>
    </div>
  `;

  const inlineNav = root.querySelector('.shell__nav-inline') as HTMLElement;
  const sidebar = root.querySelector('#sidebar') as HTMLElement;

  for (const item of NAV_ITEMS) {
    inlineNav.append(createNavLink(item.route, item.labelKey, 'shell__nav-link'));
    sidebar.append(createNavLink(item.route, item.labelKey, 'shell__sidebar-link'));
  }

  const main = root.querySelector('#main') as HTMLElement;
  const status = document.createElement('p');
  status.id = 'status-bar';
  status.className = 'status-bar';
  status.setAttribute('role', 'status');
  main.after(status);

  return {
    root,
    main,
    statusBar: status,
    brandSwitcher: root.querySelector('#header-brand-switcher') as HTMLElement,
    brandSwitcherTrigger: root.querySelector('#brand-switcher-trigger') as HTMLButtonElement,
    brandSwitcherPanel: root.querySelector('#brand-switcher-panel') as HTMLElement,
    dialogRoot: root.querySelector('#shell-dialog-root') as HTMLElement,
  };
}

function createNavLink(route: AppRoute, labelKey: string, className: string): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = route === '/' ? '/' : route;
  link.className = className;
  link.dataset.route = route;
  link.textContent = t(labelKey);
  link.addEventListener('click', (event) => {
    event.preventDefault();
    setRoute(route);
  });
  return link;
}

function populateBrandSwitcherPanel(
  elements: ShellElements,
  onBrandSelect: (brandId: string) => void,
  onManageBrands: () => void,
): void {
  const state = getState();
  const panel = elements.brandSwitcherPanel;
  panel.replaceChildren();

  for (const brand of state.brands) {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'brand-switcher__option';
    option.setAttribute('role', 'option');
    option.dataset.brandId = brand.id;
    option.textContent = brand.name;
    option.setAttribute('aria-selected', String(brand.id === state.activeWorkspace));

    if (brand.id === state.activeWorkspace) {
      option.classList.add('is-active');
    }

    option.addEventListener('click', () => {
      if (brand.id !== getState().activeWorkspace) {
        onBrandSelect(brand.id);
      } else {
        closeBrandSwitcherPanel(elements);
      }
    });

    panel.append(option);
  }

  const divider = document.createElement('div');
  divider.className = 'brand-switcher__divider';
  divider.setAttribute('role', 'separator');

  const manage = document.createElement('button');
  manage.type = 'button';
  manage.className = 'brand-switcher__manage';
  manage.textContent = t('brands.shellManageLink');
  manage.addEventListener('click', () => {
    onManageBrands();
  });

  panel.append(divider, manage);
}

export function closeBrandSwitcherPanel(elements: Pick<ShellElements, 'brandSwitcherPanel' | 'brandSwitcherTrigger'>): void {
  panelOpen = false;
  elements.brandSwitcherPanel.hidden = true;
  elements.brandSwitcherTrigger.setAttribute('aria-expanded', 'false');
}

function openBrandSwitcherPanel(
  elements: ShellElements,
  onBrandSelect: (brandId: string) => void,
  onManageBrands: () => void,
): void {
  populateBrandSwitcherPanel(elements, onBrandSelect, onManageBrands);
  panelOpen = true;
  elements.brandSwitcherPanel.hidden = false;
  elements.brandSwitcherTrigger.setAttribute('aria-expanded', 'true');
  const firstOption = elements.brandSwitcherPanel.querySelector<HTMLElement>('.brand-switcher__option');
  firstOption?.focus();
}

export function updateShellChrome(elements: ShellElements): void {
  const state = getState();
  const body = elements.root.querySelector('#shell-body') as HTMLElement;
  const sidebar = elements.root.querySelector('#sidebar') as HTMLElement;
  const menuToggle = elements.root.querySelector('#menu-toggle') as HTMLButtonElement;
  const currentLabel = elements.root.querySelector('#brand-switcher-current') as HTMLElement;

  menuToggle.textContent = state.sidebarOpen ? t('nav.closeMenu') : t('nav.openMenu');
  menuToggle.setAttribute('aria-expanded', String(state.sidebarOpen));
  sidebar.classList.toggle('is-open', state.sidebarOpen);
  body.classList.toggle('sidebar-open', state.sidebarOpen);

  for (const link of elements.root.querySelectorAll<HTMLElement>('[data-route]')) {
    link.classList.toggle('is-active', link.dataset.route === state.route);
  }

  elements.statusBar.textContent = state.statusText;

  currentLabel.textContent = state.brandsLoaded
    ? resolveBrandDisplayName(state.activeWorkspace)
    : t('brands.loadingName');

  elements.brandSwitcherTrigger.disabled = !state.brandsLoaded;

  if (panelOpen) {
    for (const option of elements.brandSwitcherPanel.querySelectorAll<HTMLButtonElement>('.brand-switcher__option')) {
      const isActive = option.dataset.brandId === state.activeWorkspace;
      option.classList.toggle('is-active', isActive);
      option.setAttribute('aria-selected', String(isActive));
    }
  }
}

export function bindShellEvents(
  elements: ShellElements,
  handlers: {
    onToggleSidebar: () => void;
    onBrandSelect: (brandId: string) => void;
    onManageBrands: () => void;
  },
): void {
  const menuToggle = elements.root.querySelector('#menu-toggle') as HTMLButtonElement;
  menuToggle.addEventListener('click', handlers.onToggleSidebar);

  elements.brandSwitcherTrigger.addEventListener('click', () => {
    if (!getState().brandsLoaded) {
      return;
    }

    if (panelOpen) {
      closeBrandSwitcherPanel(elements);
      return;
    }

    openBrandSwitcherPanel(elements, handlers.onBrandSelect, () => {
      closeBrandSwitcherPanel(elements);
      handlers.onManageBrands();
    });
  });

  elements.brandSwitcherPanel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeBrandSwitcherPanel(elements);
      elements.brandSwitcherTrigger.focus();
    }
  });

  outsideClickHandler = (event: MouseEvent) => {
    if (!panelOpen) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Node)) {
      return;
    }

    if (!elements.brandSwitcher.contains(target)) {
      closeBrandSwitcherPanel(elements);
    }
  };

  document.addEventListener('click', outsideClickHandler);
}

export function teardownShellEvents(): void {
  if (outsideClickHandler !== undefined) {
    document.removeEventListener('click', outsideClickHandler);
    outsideClickHandler = undefined;
  }
}
