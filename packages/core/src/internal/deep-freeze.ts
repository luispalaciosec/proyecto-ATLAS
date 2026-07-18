/**
 * @internal — not part of the public API.
 */
export function deepFreeze<T extends Record<string, unknown>>(value: T): Readonly<T> {
  for (const key of Object.keys(value)) {
    const property = value[key];
    if (property !== null && typeof property === 'object' && !Object.isFrozen(property)) {
      deepFreeze(property as Record<string, unknown>);
    }
  }

  return Object.freeze(value);
}
