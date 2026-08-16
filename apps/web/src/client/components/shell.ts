import logoUrl from '../../../design-system/assets/logo.svg?url';
import { t } from '../../i18n/index.js';
import { getState, patchState, resolveBrandDisplayName, setRoute, type AppRoute } from '../state/app-state.js';
import { createNavIcon, createThemeIcon, type NavIconKey } from '../lib/icons.js';
import { getTheme, toggleTheme } from '../lib/theme.js';

const NAV_ITEMS: Array<{ route: AppRoute; labelKey: string; icon: NavIconKey }> = [
  { route: '/', labelKey: 'nav.home', icon: 'home' },
  { route: '/chat', labelKey: 'nav.chat', icon: 'chat' },
  { route: '/conocimiento', labelKey: 'nav.knowledge', icon: 'knowledge' },
  { route: '/actividad', labelKey: 'nav.activity', icon: 'activity' },
  { route: '/marcas', labelKey: 'nav.brands', icon: 'brands' },
  { route: '/configuracion', labelKey: 'nav.settings', icon: 'settings' },
];

const MOBILE_SHELL_QUERY = '(max-width: 899px)';

export interface ShellElements {
  readonly root: HTMLElement;
  readonly main: HTMLElement;
  readonly shellBody: HTMLElement;
  readonly sidebar: HTMLElement;
  readonly sidebarBackdrop: HTMLButtonElement;
  readonly menuToggle: HTMLButtonElement;
  readonly themeToggle: HTMLButtonElement;
  readonly statusBar: HTMLElement;
  readonly brandSwitcher: HTMLElement;
  readonly brandSwitcherTrigger: HTMLButtonElement;
  readonly brandSwitcherPanel: HTMLElement;
  readonly dialogRoot: HTMLElement;
}

let panelOpen = false;
let outsideClickHandler: ((event: MouseEvent) => void) | undefined;
let sidebarKeydownHandler: ((event: KeyboardEvent) => void) | undefined;
let lastSidebarOpen = false;
let statusClearTimer: ReturnType<typeof setTimeout> | undefined;
let lastRenderedStatusText = '';

function isMobileShell(): boolean {
  return window.matchMedia(MOBILE_SHELL_QUERY).matches;
}

export function renderShell(root: HTMLElement): ShellElements {
  root.innerHTML = `
    <div class="shell">
      <aside class="shell__sidebar" id="sidebar" aria-label="Navegación">
        <div class="shell__sidebar-head">
          <a class="shell__logo" href="/" data-route="/">
            <img
              class="shell__logo-mark"
              src="${logoUrl}"
              alt=""
              width="22"
              height="22"
              decoding="async"
            />
            <span class="shell__logo-text">${t('app.name')}</span>
          </a>
        </div>
        <nav class="shell__sidebar-nav"></nav>
      </aside>
      <button
        type="button"
        class="shell__sidebar-backdrop"
        id="sidebar-backdrop"
        hidden
        aria-label="${t('nav.closeMenu')}"
      ></button>
      <div class="shell__frame" id="shell-body">
        <header class="shell__header">
          <div class="shell__brand">
            <button type="button" class="shell__menu-toggle" id="menu-toggle" aria-label="${t('nav.openMenu')}"></button>
          </div>
          <div class="shell__header-actions">
            <button
              type="button"
              class="shell__theme-toggle"
              id="theme-toggle"
              aria-label="${t('nav.themeToLight')}"
            ></button>
            <div class="brand-switcher" id="header-brand-switcher">
            <span class="brand-switcher__label" id="brand-switcher-label">${t('workspace.brandLabel')}</span>
            <div class="brand-switcher__control">
              <button
                type="button"
                id="brand-switcher-trigger"
                class="brand-switcher__trigger"
                aria-haspopup="listbox"
                aria-expanded="false"
                aria-controls="brand-switcher-panel"
                aria-labelledby="brand-switcher-label brand-switcher-current"
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
          </div>
        </header>
        <main class="shell__main" id="main" tabindex="-1"></main>
      </div>
      <div id="shell-dialog-root"></div>
    </div>
  `;

  const sidebarNav = root.querySelector('.shell__sidebar-nav') as HTMLElement;
  const logoLink = root.querySelector('.shell__logo') as HTMLAnchorElement;

  logoLink.addEventListener('click', (event) => {
    event.preventDefault();
    setRoute('/');
  });

  for (const item of NAV_ITEMS) {
    sidebarNav.append(createNavLink(item.route, item.labelKey, 'shell__sidebar-link', item.icon));
  }

  const main = root.querySelector('#main') as HTMLElement;
  const status = document.createElement('div');
  status.id = 'status-bar';
  status.className = 'app-status-toast';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  status.hidden = true;
  root.append(status);

  const elements: ShellElements = {
    root,
    main,
    shellBody: root.querySelector('#shell-body') as HTMLElement,
    sidebar: root.querySelector('#sidebar') as HTMLElement,
    sidebarBackdrop: root.querySelector('#sidebar-backdrop') as HTMLButtonElement,
    menuToggle: root.querySelector('#menu-toggle') as HTMLButtonElement,
    themeToggle: root.querySelector('#theme-toggle') as HTMLButtonElement,
    statusBar: status,
    brandSwitcher: root.querySelector('#header-brand-switcher') as HTMLElement,
    brandSwitcherTrigger: root.querySelector('#brand-switcher-trigger') as HTMLButtonElement,
    brandSwitcherPanel: root.querySelector('#brand-switcher-panel') as HTMLElement,
    dialogRoot: root.querySelector('#shell-dialog-root') as HTMLElement,
  };

  lastSidebarOpen = false;
  syncThemeToggle(elements.themeToggle);
  return elements;
}

function syncThemeToggle(button: HTMLButtonElement): void {
  const theme = getTheme();
  button.replaceChildren(createThemeIcon(theme));
  button.setAttribute(
    'aria-label',
    theme === 'dark' ? t('nav.themeToLight') : t('nav.themeToDark'),
  );
  button.setAttribute('aria-pressed', String(theme === 'dark'));
  button.dataset.theme = theme;
}

function createNavLink(
  route: AppRoute,
  labelKey: string,
  className: string,
  iconKey: NavIconKey,
): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = route === '/' ? '/' : route;
  link.className = className;
  link.dataset.route = route;
  link.append(createNavIcon(iconKey));
  const label = document.createElement('span');
  label.textContent = t(labelKey);
  link.append(label);
  link.addEventListener('click', (event) => {
    event.preventDefault();
    setRoute(route);
  });
  return link;
}

function getListboxOptions(panel: HTMLElement): HTMLButtonElement[] {
  return [...panel.querySelectorAll<HTMLButtonElement>('.brand-switcher__option')];
}

function focusListboxOption(options: readonly HTMLButtonElement[], index: number): void {
  if (options.length === 0) {
    return;
  }

  const normalized = ((index % options.length) + options.length) % options.length;
  options[normalized]?.focus();
}

function handleListboxKeydown(event: KeyboardEvent, elements: ShellElements): void {
  if (!panelOpen) {
    return;
  }

  const options = getListboxOptions(elements.brandSwitcherPanel);

  if (options.length === 0) {
    return;
  }

  const activeIndex = options.findIndex((option) => option === document.activeElement);

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      focusListboxOption(options, activeIndex < 0 ? 0 : activeIndex + 1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      focusListboxOption(options, activeIndex < 0 ? options.length - 1 : activeIndex - 1);
      break;
    case 'Home':
      event.preventDefault();
      focusListboxOption(options, 0);
      break;
    case 'End':
      event.preventDefault();
      focusListboxOption(options, options.length - 1);
      break;
    case 'Enter':
    case ' ':
      if (document.activeElement instanceof HTMLButtonElement && document.activeElement.classList.contains('brand-switcher__option')) {
        event.preventDefault();
        document.activeElement.click();
      }
      break;
    case 'Escape':
      event.preventDefault();
      closeBrandSwitcherPanel(elements);
      elements.brandSwitcherTrigger.focus();
      break;
    default:
      break;
  }
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
    option.id = `brand-switcher-option-${brand.id}`;
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
        elements.brandSwitcherTrigger.focus();
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

function getSidebarFocusables(sidebar: HTMLElement): HTMLElement[] {
  return [...sidebar.querySelectorAll<HTMLElement>('a.shell__sidebar-link, button:not([hidden])')];
}

function releaseSidebarAccessibility(): void {
  if (sidebarKeydownHandler !== undefined) {
    document.removeEventListener('keydown', sidebarKeydownHandler);
    sidebarKeydownHandler = undefined;
  }
}

function syncMobileSidebarAccessibility(
  elements: ShellElements,
  sidebarOpen: boolean,
  onCloseSidebar: () => void,
): void {
  releaseSidebarAccessibility();

  const mobile = isMobileShell();
  elements.sidebarBackdrop.hidden = !(mobile && sidebarOpen);
  elements.main.inert = mobile && sidebarOpen;
  elements.shellBody.inert = false;

  if (!mobile || !sidebarOpen) {
    return;
  }

  const focusables = getSidebarFocusables(elements.sidebar);
  focusables[0]?.focus();

  sidebarKeydownHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onCloseSidebar();
      elements.menuToggle.focus();
      return;
    }

    if (event.key !== 'Tab' || focusables.length === 0) {
      return;
    }

    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  document.addEventListener('keydown', sidebarKeydownHandler);
}

export function updateShellChrome(
  elements: ShellElements,
  options?: { onCloseSidebar?: () => void },
): void {
  const state = getState();
  const sidebar = elements.sidebar;
  const menuToggle = elements.menuToggle;
  const currentLabel = elements.root.querySelector('#brand-switcher-current') as HTMLElement;
  const menuLabel = state.sidebarOpen ? t('nav.closeMenu') : t('nav.openMenu');

  menuToggle.textContent = menuLabel;
  menuToggle.setAttribute('aria-label', menuLabel);
  menuToggle.setAttribute('aria-expanded', String(state.sidebarOpen));
  sidebar.classList.toggle('is-open', state.sidebarOpen);
  elements.shellBody.classList.toggle('sidebar-open', state.sidebarOpen);

  if (options?.onCloseSidebar !== undefined) {
    if (state.sidebarOpen && !lastSidebarOpen && isMobileShell()) {
      syncMobileSidebarAccessibility(elements, true, options.onCloseSidebar);
    } else if (!state.sidebarOpen && lastSidebarOpen) {
      syncMobileSidebarAccessibility(elements, false, options.onCloseSidebar);
    } else if (state.sidebarOpen && isMobileShell()) {
      syncMobileSidebarAccessibility(elements, true, options.onCloseSidebar);
    } else if (!state.sidebarOpen) {
      syncMobileSidebarAccessibility(elements, false, options.onCloseSidebar);
    }
  }

  lastSidebarOpen = state.sidebarOpen;

  for (const link of elements.root.querySelectorAll<HTMLElement>('[data-route]')) {
    link.classList.toggle('is-active', link.dataset.route === state.route);
    if (link.classList.contains('is-active')) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  }

  const nextStatusText = state.statusText;

  elements.statusBar.textContent = nextStatusText;
  elements.statusBar.hidden = nextStatusText.length === 0;
  elements.statusBar.classList.toggle('app-status-toast--visible', nextStatusText.length > 0);

  if (nextStatusText !== lastRenderedStatusText) {
    lastRenderedStatusText = nextStatusText;

    if (statusClearTimer !== undefined) {
      clearTimeout(statusClearTimer);
      statusClearTimer = undefined;
    }

    if (
      nextStatusText.length > 0 &&
      !state.chatLoading &&
      !state.chatHistoryLoading
    ) {
      statusClearTimer = setTimeout(() => {
        const current = getState();

        if (
          current.statusText === nextStatusText &&
          !current.chatLoading &&
          !current.chatHistoryLoading
        ) {
          patchState({ statusText: '' });
        }
      }, 3200);
    }
  }

  currentLabel.textContent = state.brandsLoaded
    ? resolveBrandDisplayName(state.activeWorkspace)
    : t('brands.loadingName');

  elements.brandSwitcherTrigger.disabled = !state.brandsLoaded;

  syncThemeToggle(elements.themeToggle);

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
    onCloseSidebar: () => void;
    onBrandSelect: (brandId: string) => void;
    onManageBrands: () => void;
  },
): void {
  elements.menuToggle.addEventListener('click', handlers.onToggleSidebar);

  elements.themeToggle.addEventListener('click', () => {
    toggleTheme();
    syncThemeToggle(elements.themeToggle);
  });

  elements.sidebarBackdrop.addEventListener('click', () => {
    handlers.onCloseSidebar();
    elements.menuToggle.focus();
  });

  elements.brandSwitcherTrigger.addEventListener('click', () => {
    if (!getState().brandsLoaded) {
      return;
    }

    if (panelOpen) {
      closeBrandSwitcherPanel(elements);
      elements.brandSwitcherTrigger.focus();
      return;
    }

    openBrandSwitcherPanel(elements, handlers.onBrandSelect, () => {
      closeBrandSwitcherPanel(elements);
      handlers.onManageBrands();
    });
  });

  elements.brandSwitcherPanel.addEventListener('keydown', (event) => {
    handleListboxKeydown(event, elements);
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
  releaseSidebarAccessibility();

  if (outsideClickHandler !== undefined) {
    document.removeEventListener('click', outsideClickHandler);
    outsideClickHandler = undefined;
  }
}

export function getShellBodyElement(root: HTMLElement): HTMLElement | null {
  return root.querySelector('#shell-body');
}
