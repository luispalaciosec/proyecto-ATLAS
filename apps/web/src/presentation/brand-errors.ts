export class BrandValidationError extends Error {
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = 'BrandValidationError';
  }
}

export class BrandDuplicateError extends Error {
  readonly statusCode = 409;

  constructor() {
    super('Ya existe una marca con ese nombre.');
    this.name = 'BrandDuplicateError';
  }
}

export class BrandReservedError extends Error {
  readonly statusCode = 400;

  constructor() {
    super('Ese nombre está reservado.');
    this.name = 'BrandReservedError';
  }
}
