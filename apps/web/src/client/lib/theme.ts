export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'atlas.theme';

function readStoredTheme(): ThemeMode | undefined {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // ignore storage failures
  }

  return undefined;
}

export function resolveSystemTheme(): ThemeMode {
  if (typeof window.matchMedia !== 'function') {
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function getThemePreference(): ThemeMode {
  return readStoredTheme() ?? resolveSystemTheme();
}

export function applyTheme(theme: ThemeMode): void {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
}

export function initTheme(): ThemeMode {
  const theme = getThemePreference();
  applyTheme(theme);
  return theme;
}

export function setTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore storage failures
  }

  applyTheme(theme);
}

export function getTheme(): ThemeMode {
  const current = document.documentElement.getAttribute('data-theme');

  if (current === 'light' || current === 'dark') {
    return current;
  }

  return getThemePreference();
}

export function toggleTheme(): ThemeMode {
  const next: ThemeMode = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}
