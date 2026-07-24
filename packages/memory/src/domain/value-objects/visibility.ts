export const Visibility = {
  Private: 'private',
  Shared: 'shared',
  Public: 'public',
  Restricted: 'restricted',
} as const;

export type Visibility = (typeof Visibility)[keyof typeof Visibility];

export const VISIBILITY_VALUES: readonly Visibility[] = Object.freeze(Object.values(Visibility));

export function isVisibility(value: string): value is Visibility {
  return (VISIBILITY_VALUES as readonly string[]).includes(value);
}
