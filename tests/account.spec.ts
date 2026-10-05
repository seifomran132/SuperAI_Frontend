import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import {
  ADMIN_SKIP_MESSAGE,
  API,
  SKIP_MESSAGE,
  accessToken,
  adminCredentials,
  createFundedUser,
  expectAccessibleRtl,
  stackReachable,
  text,
} from './support';

test.describe.configure({ mode: 'serial' });

let stackUp = false;
let context: BrowserContext;
let page: Page;

test.beforeAll(async ({ browser }) => {
  stackUp = await stackReachable();
  if (!stackUp || !adminCredentials()) return;
  context = await browser.newContext({
    locale: 'ar',
    baseURL: 'http://localhost:3001',
  });
  page = await context.newPage();
  await createFundedUser(page, 'e2e-account');
});
test.afterAll(async () => {
  await context?.close();
});
test.beforeEach(() => {
  test.skip(!stackUp, SKIP_MESSAGE);
});

test.describe('signed in', () => {
  test.beforeEach(() => {
    test.skip(!adminCredentials(), ADMIN_SKIP_MESSAGE);
  });

  test('balance page lists the funding entry with a formatted amount', async () => {
    await page.goto('/balance');
    await expect(
      page.getByRole('heading', { name: text.balance.title }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: text.balance.activity.title }),
    ).toBeVisible();
    const row = page
      .getByRole('listitem')
      .filter({ hasText: text.balance.activity.types.adjustment });
    await expect(row).toBeVisible();
    // Amounts render through <Money>: inside <bdi>, never a raw float.
    await expect(row.locator('bdi').first()).toHaveText(/^\+0\.50\$$/);
    await expect(
      page.getByRole('status', { name: text.balance.activity.loading }),
    ).toHaveCount(0);
    await expectAccessibleRtl(page);
  });

  test('activity loads the next page when the end is reached (mocked data)', async () => {
    const entry = (n: number) => ({
      id: `0190e0a0-0000-7000-8000-0000000000${n}`,
      type: 'usage_charge',
      amountUsd: '-0.010000000',
      balanceAfterUsd: '1.000000000',
      createdAt: new Date().toISOString(),
    });
    const befores: (string | null)[] = [];
    await page.route(/\/api\/v1\/me\/balance\/activity/, async (route) => {
      const before = new URL(route.request().url()).searchParams.get('before');
      befores.push(before);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          before === null
            ? { items: [entry(11), entry(12), entry(13)], nextBefore: 7 }
            : { items: [entry(14), entry(15)], nextBefore: null },
        ),
      });
    });
    await page.goto('/balance');
    const rows = page
      .getByRole('listitem')
      .filter({ hasText: text.balance.activity.types.usage_charge });
    await expect(rows).toHaveCount(5);
    expect(befores).toEqual([null, '7']);
    await page.unroute(/\/api\/v1\/me\/balance\/activity/);
  });

  test('activity error shows retry, then recovers', async () => {
    let fail = true;
    await page.route(/\/api\/v1\/me\/balance\/activity/, async (route) => {
      if (fail) return route.fulfill({ status: 500, body: '{}' });
      return route.fallback();
    });
    await page.goto('/balance');
    await expect(page.getByText(text.balance.activity.error)).toBeVisible();
    fail = false;
    await page.getByRole('button', { name: text.common.retry }).click();
    await expect(
      page
        .getByRole('listitem')
        .filter({ hasText: text.balance.activity.types.adjustment }),
    ).toBeVisible();
    await page.unroute(/\/api\/v1\/me\/balance\/activity/);
  });

  test('request-balance dialog explains the process, shows the channels the brand has', async () => {
    await page.goto('/balance');
    await page.getByRole('button', { name: text.balance.request }).click();
    const dialog = page.getByRole('dialog', {
      name: text.chat.requestBalance.title,
    });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(text.chat.requestBalance.body)).toBeVisible();
    // Channels come from the brand config: with none configured the block is
    // hidden; with some, each is a link.
    const links = dialog.getByRole('link');
    if ((await links.count()) === 0) {
      await expect(
        dialog.getByRole('heading', { name: text.contact.title }),
      ).toHaveCount(0);
    } else {
      await expect(
        dialog.getByRole('heading', { name: text.contact.title }),
      ).toBeVisible();
    }
    await expectAccessibleRtl(page);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
  test('request-balance dialog returns focus to its opener on close', async () => {
    await page.goto('/balance');
    const opener = page.getByRole('button', { name: text.balance.request });
    await opener.click();
    await page.keyboard.press('Escape');
    await expect(opener).toBeFocused({ timeout: 2000 });
  });

  test('profile: validation, edit and save persist', async () => {
    await page.goto('/account');
    await expect(
      page.getByRole('heading', { name: text.account.title }).first(),
    ).toBeVisible();
    const name = page.getByLabel(text.auth.fields.fullName, { exact: true });
    const phone = page.getByLabel(text.auth.fields.phone, { exact: true });
    await expect(name).not.toHaveValue('');
    await expectAccessibleRtl(page);

    // Required name, nothing saved.
    await name.fill('');
    await page
      .getByRole('button', { name: text.account.profile.save, exact: true })
      .click();
    await expect(
      page.getByText(text.auth.validation.nameRequired),
    ).toBeVisible();

    const newName = 'اسم معدّل';
    await name.fill(newName);
    await phone.fill('+966 50 765 4321');
    await page
      .getByRole('button', { name: text.account.profile.save, exact: true })
      .click();
    await expect(page.getByText(text.account.profile.saved)).toBeVisible();

    const me = await page.request.get(`${API}/api/v1/me`, {
      headers: { Authorization: `Bearer ${await accessToken(page)}` },
    });
    expect(await me.json()).toMatchObject({
      fullName: newName,
      phoneNumber: '+966507654321',
    });
    await page.reload();
    await expect(
      page.getByLabel(text.auth.fields.fullName, { exact: true }),
    ).toHaveValue(newName);
  });

  test('account: a failed save keeps what was typed', async () => {
    await page.goto('/account');
    await page.route(/\/api\/v1\/me$/, async (route) => {
      if (route.request().method() === 'PATCH') {
        return route.fulfill({ status: 500, body: '{}' });
      }
      return route.fallback();
    });
    const name = page.getByLabel(text.auth.fields.fullName, { exact: true });
    await name.fill('اسم لن يُحفظ');
    await page
      .getByRole('button', { name: text.account.profile.save, exact: true })
      .click();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(name).toHaveValue('اسم لن يُحفظ');
    await page.unroute(/\/api\/v1\/me$/);
  });
});

test('/plans renders signed out without reading a session', async ({
  browser,
}) => {
  const fresh = await browser.newContext({ locale: 'ar' });
  const p = await fresh.newPage();
  const authed: string[] = [];
  p.on('request', (req) => {
    if (req.headers()['authorization']) authed.push(req.url());
  });
  const apiCalls: string[] = [];
  p.on('request', (req) => {
    if (/\/api\/v1\/me(\/|$)/.test(req.url())) apiCalls.push(req.url());
  });
  await p.goto('http://localhost:3001/plans');
  await expect(p).toHaveURL(/\/plans$/);
  await expect(
    p.getByRole('heading', { name: text.plans.title }),
  ).toBeVisible();
  // At least one plan card with a price from the public endpoint.
  await expect(p.getByRole('main').locator('bdi').first()).toBeVisible();
  await expect(
    p.getByRole('link', { name: text.auth.signIn.title }).first(),
  ).toBeVisible();
  await expectAccessibleRtl(p);
  expect(authed).toEqual([]);
  expect(apiCalls).toEqual([]);
  await fresh.close();
});
