import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import {
  ADMIN_SKIP_MESSAGE,
  SKIP_MESSAGE,
  adminContext,
  adminCredentials,
  createFundedUser,
  expectAccessibleRtl,
  stackReachable,
  text,
} from './support';

test.describe.configure({ mode: 'serial' });

let stackUp = false;
let userContext: BrowserContext;
let userPage: Page;
let adminCtx: BrowserContext;
let admin: Page;
let target: Awaited<ReturnType<typeof createFundedUser>>;

test.beforeAll(async ({ browser }) => {
  stackUp = await stackReachable();
  if (!stackUp || !adminCredentials()) return;
  userContext = await browser.newContext({
    locale: 'ar',
    baseURL: 'http://localhost:3001',
  });
  userPage = await userContext.newPage();
  // Funded with $0.50; this is the user the admin edits and restores.
  target = await createFundedUser(userPage, 'e2e-admin-target');
  adminCtx = await adminContext(browser);
  admin = await adminCtx.newPage();
});
test.afterAll(async () => {
  await userContext?.close();
  await adminCtx?.close();
});
test.beforeEach(() => {
  test.skip(!stackUp, SKIP_MESSAGE);
  test.skip(!adminCredentials(), ADMIN_SKIP_MESSAGE);
});

const available = () =>
  admin
    .getByText(text.admin.balance.available)
    .locator('xpath=following-sibling::p[1]');

test('users list: search finds the test user and opens its balance tab', async () => {
  await admin.goto('/admin/users');
  await expect(
    admin.getByRole('heading', { name: text.admin.titles.users }).first(),
  ).toBeVisible();
  await admin
    .getByRole('searchbox', { name: text.admin.users.searchLabel })
    .fill(target.email);
  const table = admin.getByRole('table', { name: text.admin.users.tableLabel });
  const link = table.getByRole('link', { name: target.email });
  await expect(link).toBeVisible();
  await expect(table.getByRole('row')).toHaveCount(2); // header + the match
  await expectAccessibleRtl(admin);

  await link.click();
  await expect(admin).toHaveURL(/\/admin\/users\/[0-9a-f-]{36}/);
  await admin
    .getByRole('navigation', { name: text.admin.detail.tabsLabel })
    .getByRole('link', { name: text.admin.detail.tabs.balance })
    .click();
  await expect(available()).toContainText('0.50$');
});

test('add funds with a reason: the ledger shows the amount', async () => {
  await admin.getByRole('button', { name: text.admin.balance.adjust }).click();
  const dialog = admin.getByRole('dialog', {
    name: text.admin.balance.adjustTitle,
  });
  await expect(dialog).toBeVisible();

  // Reason is required.
  await dialog.getByLabel(text.admin.balance.amountLabel).fill('0.25');
  await dialog
    .getByRole('button', { name: text.admin.balance.adjustSubmit })
    .click();
  await expect(
    dialog.getByText(text.admin.dialog.reasonRequired),
  ).toBeVisible();

  await dialog.getByLabel(text.admin.dialog.reason).fill('e2e admin check');
  await dialog
    .getByRole('button', { name: text.admin.balance.adjustSubmit })
    .click();
  await expect(dialog).toBeHidden();

  const ledger = admin.getByRole('table', { name: text.admin.balance.ledger });
  const row = ledger.getByRole('row').filter({ hasText: 'e2e admin check' });
  await expect(row).toHaveCount(1);
  await expect(row.getByRole('cell').nth(1).locator('bdi')).toHaveText(
    /^\+0\.25\d*\$$/,
  );
  await expect(available()).toContainText('0.75$');
});

test('deduct the same amount to restore the balance', async () => {
  await admin.getByRole('button', { name: text.admin.balance.adjust }).click();
  const dialog = admin.getByRole('dialog', {
    name: text.admin.balance.adjustTitle,
  });
  await dialog.getByLabel(text.admin.balance.amountLabel).fill('-0.25');
  await dialog.getByLabel(text.admin.dialog.reason).fill('e2e admin restore');
  await dialog
    .getByRole('button', { name: text.admin.balance.adjustSubmit })
    .click();
  await expect(dialog).toBeHidden();

  const ledger = admin.getByRole('table', { name: text.admin.balance.ledger });
  const row = ledger.getByRole('row').filter({ hasText: 'e2e admin restore' });
  await expect(row).toHaveCount(1);
  await expect(row.getByRole('cell').nth(1).locator('bdi')).toHaveText(
    /^[−-]0\.25\d*\$$/,
  );
  await expect(available()).toContainText('0.50$');
});

test('a non-admin visiting /admin gets not-found', async () => {
  await userPage.goto('/admin');
  await expect(userPage.getByText(text.common.notFound).first()).toBeVisible();
  await expect(userPage).toHaveURL(/\/admin/);
  await expectAccessibleRtl(userPage);
  await userPage.goto('/admin/users');
  await expect(userPage.getByText(text.common.notFound).first()).toBeVisible();
});
