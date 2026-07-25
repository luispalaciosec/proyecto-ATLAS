import type { Result } from '@atlas/core';

export function memoryOk<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function memoryErr<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function isMemoryOk<T, E>(
  result: Result<T, E>,
): result is { readonly ok: true; readonly value: T } {
  return result.ok;
}

export function isMemoryErr<T, E>(
  result: Result<T, E>,
): result is { readonly ok: false; readonly error: E } {
  return !result.ok;
}
