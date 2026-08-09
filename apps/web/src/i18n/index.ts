import { es } from './es.js';

type Params = Record<string, string | number>;

function resolvePath(path: string, params?: Params): string {
  const segments = path.split('.');
  let value: unknown = es;

  for (const segment of segments) {
    if (value === null || typeof value !== 'object' || !(segment in value)) {
      return path;
    }

    value = (value as Record<string, unknown>)[segment];
  }

  if (typeof value !== 'string') {
    return path;
  }

  if (params === undefined) {
    return value;
  }

  return value.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`));
}

export function t(path: string, params?: Params): string {
  return resolvePath(path, params);
}

export function workspaceDisplayName(slug: string): string {
  if (slug === 'default') {
    return t('workspace.general');
  }

  return slug.charAt(0).toUpperCase() + slug.slice(1);
}
