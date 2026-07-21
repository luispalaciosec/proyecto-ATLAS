import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    passWithNoTests: false,
    coverage: {
      provider: 'v8',
      include: [
        'src/engine/**',
        'src/lifecycle/**',
        'src/state/**',
        'src/events/**',
        'src/context/**',
        'src/compat/**',
        'src/composition/**',
        'src/runtime/**',
        'src/contracts/**',
        'src/definitions/**',
        'src/executors/**',
        'src/registries/**',
      ],
      exclude: ['src/**/*.d.ts'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85,
      },
    },
  },
});
