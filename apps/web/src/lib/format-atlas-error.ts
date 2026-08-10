interface AtlasStructuredError {
  readonly code?: string;
  readonly message?: string;
}

function readStructuredError(value: unknown): AtlasStructuredError | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }

  const candidate = value as AtlasStructuredError;

  if (typeof candidate.message !== 'string' || candidate.message.trim().length === 0) {
    return undefined;
  }

  return candidate;
}

export function formatAtlasError(error: unknown): string {
  if (error instanceof Error) {
    const structured = readStructuredError(error);

    if (structured !== undefined) {
      return formatStructuredMessage(structured);
    }

    return error.message;
  }

  const structured = readStructuredError(error);

  if (structured !== undefined) {
    return formatStructuredMessage(structured);
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function extractApiErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload !== 'object' || payload === null || !('error' in payload)) {
    return fallback;
  }

  const { error } = payload as { error: unknown };

  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  const structured = readStructuredError(error);

  if (structured !== undefined) {
    return formatStructuredMessage(structured);
  }

  return formatAtlasError(error);
}

function formatStructuredMessage(error: AtlasStructuredError): string {
  const message = error.message?.trim() ?? '';

  if (typeof error.code === 'string' && error.code.trim().length > 0) {
    return `${error.code}: ${message}`;
  }

  return message;
}
