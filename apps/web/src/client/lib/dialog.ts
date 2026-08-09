export interface DialogMountOptions {
  readonly onBackdropClick?: () => void;
  readonly onEscape?: () => void;
}

export function trapDialogFocus(root: HTMLElement): void {
  const focusable = root.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );

  if (focusable.length === 0) {
    return;
  }

  const first = focusable[0]!;
  const last = focusable[focusable.length - 1]!;

  root.addEventListener('keydown', (event) => {
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
  });
}

export function mountDialogRoot(
  root: HTMLElement,
  backdrop: HTMLElement,
  options: DialogMountOptions = {},
): () => void {
  root.replaceChildren(backdrop);

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
  trapDialogFocus(root);

  return () => {
    root.removeEventListener('keydown', onKeyDown);
    backdrop.removeEventListener('click', onBackdropClick);
    root.replaceChildren();
  };
}
