import type { EngineError } from './engine-errors.js';

export type EngineResult<T> =
  | {
      readonly success: true;
      readonly data: T;
    }
  | {
      readonly success: false;
      readonly error: EngineError;
    };

export function engineSuccess<T>(data: T): EngineResult<T> {
  return Object.freeze({
    success: true,
    data,
  });
}

export function engineFailure<T>(error: EngineError): EngineResult<T> {
  return Object.freeze({
    success: false,
    error,
  });
}

export function isEngineSuccess<T>(
  result: EngineResult<T>,
): result is Extract<EngineResult<T>, { success: true }> {
  return result.success;
}

export function isEngineFailure<T>(
  result: EngineResult<T>,
): result is Extract<EngineResult<T>, { success: false }> {
  return !result.success;
}
