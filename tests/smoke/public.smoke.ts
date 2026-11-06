import { expect, test, type Page } from '@playwright/test';
import ar from '../../src/i18n/ar.json' with { type: 'json' };

// Read-only smoke checks for a deployed site (production or staging):
// pages load under the CSP, in Arabic and right-to-left, and the API is ready.
// Nothing here signs up, signs in, sends or writes.
const API_URL = process.env.SMOKE_API_URL ?? 'https://api.lam7ai.com';

/** Console errors and CSP violations raised while `run` executes. */
async function collectErrors(page: Page, run: () => Promise<void>) {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await run();
  return errors;
}

test('API is ready', async ({ request }) => {
  const live = await request.get(`${API_URL}/health/live`);
  expect(live.status()).toBe(200);
  const ready = await request.get(`${API_URL}/health/ready`);
  expect(ready.status()).toBe(200);
});

test('/ goes to sign-in, in Arabic and right-to-left', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/sign-in/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(
    page.getByRole('button', { name: ar.auth.signIn.submit }),
  ).toBeVisible();
});

for (const path of ['/sign-in', '/sign-up', '/forgot-password', '/plans']) {
  test(`${path} loads without console errors`, async ({ page }) => {
    const errors = await collectErrors(page, async () => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('main, [role="main"]').first()).toBeVisible();
    });
    expect(errors).toEqual([]);
  });
}

test('signed out, /chat redirects to sign-in with the path kept', async ({
  page,
}) => {
  await page.goto('/chat');
  await expect(page).toHaveURL(/\/sign-in\?redirect=/);
});

test('the site is served over HTTPS with a CSP header', async ({ request }) => {
  const res = await request.get('/sign-in');
  expect(res.url()).toMatch(/^https:/);
  expect(res.headers()['content-security-policy']).toBeTruthy();
});
