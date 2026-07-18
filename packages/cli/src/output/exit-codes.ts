/**
 * Official CLI exit codes — SDK-201 §10
 */
export const EXIT_SUCCESS = 0;
export const EXIT_GENERAL_ERROR = 1;
export const EXIT_INVALID_ARGUMENTS = 2;
export const EXIT_VALIDATION_ERROR = 3;
export const EXIT_CONFIGURATION_ERROR = 4;
export const EXIT_COMPILATION_ERROR = 5;
export const EXIT_RUNTIME_ERROR = 6;

export class CliExitError extends Error {
  readonly code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = 'CliExitError';
    this.code = code;
  }
}
