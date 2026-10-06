import { defineConfig } from 'vitest/config';
import viteReact from '@vitejs/plugin-react';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [viteReact()],
  test: {
    environment: 'jsdom',
    // Fixed so tests do not depend on a local .env (gitignored).
    env: {
      VITE_API_ORIGIN: 'http://localhost:3000',
      VITE_GOTRUE_URL: 'http://localhost:9999',
      VITE_BRAND: 'lam7a',
    },
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
