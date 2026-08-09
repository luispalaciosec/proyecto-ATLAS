import { t } from '../../i18n/index.js';
import type { ShellElements } from '../components/shell.js';
import { closeBrandSwitcherPanel } from '../components/shell.js';
import { mountDialogRoot } from './dialog.js';
import { reloadChatHistory, renderChat } from '../pages/chat.js';
import {
  getState,
  patchState,
  resolveBrandDisplayName,
  setActiveWorkspace,
  setPendingChatDraft,
  setWorkspaces,
} from '../state/app-state.js';

let shellElementsRef: ShellElements | undefined;
let renderCurrentRouteRef: (() => void) | undefined;

export function bindWorkspaceSwitch(
  shellElements: ShellElements,
  renderCurrentRoute: () => void,
): void {
  shellElementsRef = shellElements;
  renderCurrentRouteRef = renderCurrentRoute;
}

function readComposerDraft(): string {
  const input = document.querySelector('#chat-input') as HTMLTextAreaElement | null;
  return input?.value.trim() ?? '';
}

function hasUnsavedDraft(): boolean {
  const pending = getState().pendingChatDraft?.trim() ?? '';
  const composer = readComposerDraft();
  return pending.length > 0 || composer.length > 0;
}

function clearUnsavedDraft(): void {
  setPendingChatDraft(undefined);
  const input = document.querySelector('#chat-input') as HTMLTextAreaElement | null;

  if (input !== null) {
    input.value = '';
  }
}

function requestSwitchConfirmation(targetBrandId: string): Promise<boolean> {
  if (shellElementsRef === undefined) {
    return Promise.resolve(true);
  }

  const state = getState();
  const currentName = resolveBrandDisplayName(state.activeWorkspace);
  const targetName = resolveBrandDisplayName(targetBrandId);
  const draftNotice = hasUnsavedDraft() ? t('brands.switchDialogDraft') : undefined;

  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'dialog-backdrop';

    const dialog = document.createElement('div');
    dialog.className = 'dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'brand-switch-title');

    const title = document.createElement('h2');
    title.id = 'brand-switch-title';
    title.className = 'dialog__title';
    title.textContent = t('brands.switchDialogTitle');

    const body = document.createElement('p');
    body.className = 'dialog__subtitle';
    body.textContent = t('brands.switchDialogBody', {
      current: currentName,
      target: targetName,
    });

    dialog.append(title, body);

    if (draftNotice !== undefined) {
      const draft = document.createElement('p');
      draft.className = 'dialog__note';
      draft.textContent = draftNotice;
      dialog.append(draft);
    }

    const actions = document.createElement('div');
    actions.className = 'dialog__actions';

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'btn btn--ghost';
    cancel.textContent = t('common.cancel');

    const confirm = document.createElement('button');
    confirm.type = 'button';
    confirm.className = 'btn btn--primary';
    confirm.textContent = t('brands.switchDialogConfirm', { name: targetName });

    actions.append(cancel, confirm);
    dialog.append(actions);
    backdrop.append(dialog);

    const close = (accepted: boolean): void => {
      unmount();
      resolve(accepted);
    };

    cancel.addEventListener('click', () => {
      close(false);
    });

    confirm.addEventListener('click', () => {
      close(true);
    });

    const unmount = mountDialogRoot(shellElementsRef!.dialogRoot, backdrop, {
      onEscape: () => {
        close(false);
      },
      onBackdropClick: () => {
        close(false);
      },
    });

    window.setTimeout(() => {
      confirm.focus();
    }, 0);
  });
}

export async function switchWorkspace(
  brandId: string,
  options?: { skipConfirm?: boolean },
): Promise<void> {
  const trimmed = brandId.trim();

  if (trimmed.length === 0) {
    patchState({ statusText: t('errors.emptyWorkspace') });
    return;
  }

  const state = getState();
  const knownBrand = state.brands.some((brand) => brand.id === trimmed);

  if (state.brandsLoaded && !knownBrand) {
    patchState({ statusText: t('brands.errorGeneric') });
    return;
  }

  if (trimmed === state.activeWorkspace) {
    if (shellElementsRef !== undefined) {
      closeBrandSwitcherPanel(shellElementsRef);
    }
    return;
  }

  const needsConfirm = options?.skipConfirm !== true && hasUnsavedDraft();

  if (needsConfirm) {
    const confirmed = await requestSwitchConfirmation(trimmed);

    if (!confirmed) {
      if (shellElementsRef !== undefined) {
        closeBrandSwitcherPanel(shellElementsRef);
      }
      return;
    }
  }

  if (hasUnsavedDraft()) {
    clearUnsavedDraft();
  }

  setActiveWorkspace(trimmed, { resetChat: true });
  patchState({
    statusText:
      trimmed === 'default'
        ? t('brands.switchSuccessGeneral')
        : t('brands.switchSuccess', { name: resolveBrandDisplayName(trimmed) }),
  });

  if (!state.workspaces.includes(trimmed)) {
    setWorkspaces([...state.workspaces, trimmed]);
  }

  if (shellElementsRef !== undefined) {
    closeBrandSwitcherPanel(shellElementsRef);
  }

  if (getState().route === '/chat') {
    if (shellElementsRef !== undefined) {
      renderChat(shellElementsRef.main);
    }
    await reloadChatHistory();
  } else {
    renderCurrentRouteRef?.();
  }
}
