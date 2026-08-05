import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    passWithNoTests: false,
    pool: 'forks',
    server: {
      deps: {
        external: ['@atlas/cli', '@atlas/sdk', 'express'],
      },
    },
  },
});
