export function resolveWebHost(): string {
  const fromEnv = process.env.ATLAS_WEB_HOST;

  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return fromEnv.trim();
  }

  return '127.0.0.1';
}

export function resolveWebPort(): number {
  const fromEnv = process.env.ATLAS_WEB_PORT;

  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    const parsed = Number.parseInt(fromEnv, 10);

    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 4173;
}

export function formatWebUrl(host: string, port: number): string {
  const displayHost = host === '0.0.0.0' || host === '::' ? '127.0.0.1' : host;

  return `http://${displayHost}:${port}`;
}
