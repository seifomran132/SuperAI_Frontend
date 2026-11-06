import { defineConfig, devices } from '@playwright/test';

// Read-only checks against a deployed site: SMOKE_BASE_URL=https://lam7ai.com npm run test:smoke
// No sign-up, no sending, no admin writes: it may run against production.
const baseURL = process.env.SMOKE_BASE_URL ?? 'https://lam7ai.com';

export default defineConfig({
  testDir: './tests/smoke',
  testMatch: '**/*.smoke.ts',
  timeout: 30_000,
  retries: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report/smoke' }],
  ],
  use: {
    baseURL,
    locale: 'ar',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], baseURL, locale: 'ar' },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'], baseURL, locale: 'ar' },
    },
  ],
});
