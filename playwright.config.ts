import { defineConfig, devices } from '@playwright/test';

// e2e runs against the real local stack (API :3000, GoTrue :9999, Mailpit :8025).
// Vitest never picks these up: its include is src/**/*.test.ts(x).
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3001',
    locale: 'ar',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
