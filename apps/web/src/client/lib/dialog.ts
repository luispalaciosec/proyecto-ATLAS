export interface DialogMountOptions {
  readonly onBackdropClick?: () => void;
  readonly onEscape?: () => void;
  readonly restoreFocusTo?: HTMLElement | null;
  readonly inertTarget?: HTMLElement | null;
  readonly initialFocus?: HTMLElement | null;
}

export function trapDialogFocus(root: HTMLElement): () => void {
  const focusable = root.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );

  if (focusable.length === 0) {
    return () => {};
  }

  const first = focusable[0]!;
  const last = focusable[focusable.length - 1]!;

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') {
      return;
    }

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

  root.addEventListener('keydown', onKeyDown);

  return () => {
    root.removeEventListener('keydown', onKeyDown);
  };
}

export function mountDialogRoot(
  root: HTMLElement,
  backdrop: HTMLElement,
  options: DialogMountOptions = {},
): () => void {
  root.replaceChildren(backdrop);

  const restoreFocusTarget =
    options.restoreFocusTo ??
    (document.activeElement instanceof HTMLElement ? document.activeElement : null);

  if (options.inertTarget !== undefined && options.inertTarget !== null) {
    options.inertTarget.inert = true;
  }

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      options.onEscape?.();
    }
  };

  const onBackdropClick = (event: MouseEvent): void => {
    if (event.target === backdrop) {
      options.onBackdropClick?.();
    }
  };

  root.addEventListener('keydown', onKeyDown);
  backdrop.addEventListener('click', onBackdropClick);
  const releaseTrap = trapDialogFocus(root);

  if (options.initialFocus !== undefined && options.initialFocus !== null) {
    window.setTimeout(() => {
      options.initialFocus?.focus();
    }, 0);
  }

  return () => {
    root.removeEventListener('keydown', onKeyDown);
    backdrop.removeEventListener('click', onBackdropClick);
    releaseTrap();

    if (options.inertTarget !== undefined && options.inertTarget !== null) {
      options.inertTarget.inert = false;
    }

    root.replaceChildren();

    if (restoreFocusTarget !== null) {
      window.setTimeout(() => {
        restoreFocusTarget.focus();
      }, 0);
    }
  };
}
