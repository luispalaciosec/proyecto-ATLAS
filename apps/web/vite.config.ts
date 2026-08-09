import { defineConfig } from 'vite';

export default defineConfig({
  root: import.meta.dirname,
  publicDir: false,
  build: {
    outDir: 'dist/public',
    emptyOutDir: true,
    sourcemap: true,
  },
});
