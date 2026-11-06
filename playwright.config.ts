import { defineConfig, devices } from '@playwright/test';

// e2e runs against the real local stack (API :3000, GoTrue :9999, Mailpit :8025).
// Vitest never picks these up: its include is src/**/*.test.ts(x).
// `npm run test:e2e` runs Chromium only; `npm run test:e2e:all` runs every project.
const local = { baseURL: 'http://localhost:3001', locale: 'ar' };

export default defineConfig({
  testDir: './tests',
  // Smoke tests have their own config (playwright.smoke.config.ts).
  testIgnore: ['smoke/**'],
  // The stack is shared (one GoTrue, one database): keep runs sequential.
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  forbidOnly: Boolean(process.env.CI),
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    ...local,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], ...local } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], ...local } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], ...local } },
    // Phone widths run the case suites; the older feature suites assume a desktop.
    {
      name: 'mobile-chrome',
      testMatch: 'cases/**/*.spec.ts',
      use: { ...devices['Pixel 7'], ...local },
    },
    {
      name: 'mobile-safari',
      testMatch: 'cases/**/*.spec.ts',
      use: { ...devices['iPhone 14'], ...local },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
