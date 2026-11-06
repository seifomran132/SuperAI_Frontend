import {
  expect,
  test,
  type Browser,
  type Locator,
  type Page,
} from '@playwright/test';
import { randomUUID } from 'node:crypto';
import Decimal from 'decimal.js';
import errors from '../../src/i18n/errors.ar.json' with { type: 'json' };
import {
  ADMIN_SKIP_MESSAGE,
  API,
  CHAT_FAST_KEY,
  CHAT_FAST_LABEL,
  CHAT_PLAN_KEY,
  CHAT_PRO_KEY,
  INCLUDED_PLAN_KEY,
  INCLUDED_PLAN_NAME,
  SKIP_MESSAGE,
  adminCall,
  adminContext,
  adminCredentials,
  adjustBalance,
  adminToken,
  apiBalance,
  createChatUser,
  ensureChatFixtures,
  ensureIncludedPlan,
  myId,
  signedInContext,
  stackReachable,
  text,
} from '../support';

// MANUAL_TEST_CASES.md §3c (admin console), one test per case ID. Users are
// fresh `e2e-*` accounts on the free mock-mode plan; the admin is the account
// from adminCredentials() (signed in through storage, never typed into a page,
// so its password never reaches a trace). Catalog writes only touch `e2e-*`
// fixtures, and the global settings case restores what it changes.
//
// Left manual: none outright. Differences from the manual wording:
// - AD-07 LAST_ADMIN: the real API answers CANNOT_MODIFY_SELF whenever the only
//   admin acts on themself, so «لا يمكن إزالة آخر مسؤول.» is checked with a
//   mocked 409 answer (the screen's handling of it, not the rule itself).
// - AD-18: the screen has no way to un-default the default plan (the box is
//   locked), so the lock is checked in the UI and DEFAULT_PLAN_REQUIRED on the API.
// - AD-20: the provider's rejection of a bad key is mocked (a real call would
//   leave the machine); the clearing of the field is real.
// - AD-24: runs on the free mock model, not a paid one (the dialog is the same).

let stackUp = false;
test.beforeAll(async () => {
  stackUp = await stackReachable();
});
test.beforeEach(() => {
  test.skip(!stackUp, SKIP_MESSAGE);
  test.skip(!adminCredentials(), ADMIN_SKIP_MESSAGE);
});

const a = text.admin;

/** Runs `fn` on a page of a fresh admin context, then closes it. */
async function asAdmin<T>(
  browser: Browser,
  fn: (admin: Page) => Promise<T>,
): Promise<T> {
  const context = await adminContext(browser);
  try {
    return await fn(await context.newPage());
  } finally {
    await context.close();
  }
}

/** Fills the required reason and presses the dialog's submit button. */
async function confirm(dialog: Locator, submit: string, reason = 'e2e admin') {
  await dialog.getByLabel(a.dialog.reason).fill(reason);
  await dialog.getByRole('button', { name: submit, exact: true }).click();
}

const userUrl = (id: string, tab = 'overview') =>
  `/admin/users/${id}?tab=${tab}`;

const dialogOf = (page: Page, name: string) =>
  page.getByRole('dialog', { name, exact: true });

const tabs = (page: Page) =>
  page.getByRole('navigation', { name: a.detail.tabsLabel });

/** Same long date as the app («2 أكتوبر 2026»). */
const longDate = (date: Date) =>
  new Intl.DateTimeFormat('ar-u-nu-latn-ca-gregory', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

/** A field by the start of its label (required fields add a marker after it). */
const starts = (page: Page | Locator, label: string) =>
  page.getByLabel(new RegExp(`^${label.replace(/[()]/g, '.')}`));

const available = (page: Page) =>
  page.getByText(a.balance.available).locator('xpath=following-sibling::p[1]');

const ledgerRows = (page: Page) =>
  page.getByRole('table', { name: a.balance.ledger }).getByRole('row');

async function mine() {
  return myId(await adminToken());
}

test.describe('3c access and users', () => {
  test('AD-01 a normal user gets not-found on /admin/users and no admin link in the menu', async ({
    page,
    isMobile,
  }) => {
    await createChatUser(page);
    await page.goto('/admin/users');
    await expect(page.getByText(text.common.notFound).first()).toBeVisible();
    await page.goto('/chat');
    if (isMobile) {
      await page.getByRole('button', { name: text.shell.openMenu }).click();
      await expect(
        page.getByRole('dialog', { name: text.shell.sidebarTitle }),
      ).toBeVisible();
    } else {
      await page.getByRole('button', { name: text.shell.accountMenu }).click();
      await expect(page.getByRole('menu')).toBeVisible();
    }
    await expect(page.getByText(a.entry, { exact: true })).toHaveCount(0);
  });

  test('AD-02 admin entry opens the admin shell with its own right-side sidebar; back goes to /chat', async ({
    browser,
    isMobile,
  }) => {
    await asAdmin(browser, async (admin) => {
      await admin.goto('/chat');
      if (isMobile) {
        await admin.getByRole('button', { name: text.shell.openMenu }).click();
        await admin.getByRole('link', { name: a.entry }).click();
      } else {
        await admin
          .getByRole('button', { name: text.shell.accountMenu })
          .click();
        await admin.getByRole('menuitem', { name: a.entry }).click();
      }
      await expect(admin).toHaveURL(/\/admin/);
      await expect(
        admin.getByRole('heading', { name: a.titles.users, level: 1 }),
      ).toBeVisible();
      let backToApp: Locator;
      if (isMobile) {
        await admin.getByRole('button', { name: a.nav.openMenu }).click();
        backToApp = admin
          .getByRole('dialog', { name: a.nav.panel })
          .getByRole('link', { name: a.nav.backToApp });
      } else {
        const aside = admin.getByRole('complementary', { name: a.nav.panel });
        await expect(aside).toBeVisible();
        const side = (await aside.boundingBox())!;
        const main = (await admin.getByRole('main').boundingBox())!;
        expect(side.x).toBeGreaterThan(main.x); // sidebar on the right (RTL)
        expect(side.x + side.width).toBeGreaterThan(
          admin.viewportSize()!.width - 2,
        );
        backToApp = aside.getByRole('link', { name: a.nav.backToApp });
      }
      await backToApp.click();
      await expect(admin).toHaveURL(/\/chat/);
    });
  });

  test('AD-03 users: search, filters and paging stay in the URL and survive a reload', async ({
    page,
    browser,
  }) => {
    const stamp = Date.now();
    const user = await createChatUser(page, {
      prefix: 'e2e-adsearch',
      fullName: `Zed${stamp}`,
    });
    await adminCall('PATCH', `/admin/users/${user.userId}/status`, {
      reason: 'e2e filter case',
      status: 'suspended',
    });
    await asAdmin(browser, async (admin) => {
      await admin.goto('/admin/users');
      const table = admin.getByRole('table', { name: a.users.tableLabel });
      const search = admin.getByRole('searchbox', {
        name: a.users.searchLabel,
      });
      // By part of the name.
      await search.fill(`Zed${stamp}`);
      await expect(table.getByRole('link', { name: user.email })).toBeVisible();
      await expect(table.getByRole('row')).toHaveCount(2);
      // By part of the email.
      const fragment = user.email.split('@')[0]!.slice(3);
      await search.fill(fragment);
      await expect(admin).toHaveURL(new RegExp(`q=${fragment}`));
      await expect(table.getByRole('link', { name: user.email })).toBeVisible();

      // Status and role filters.
      await admin
        .getByRole('combobox', { name: a.users.statusFilter })
        .selectOption('suspended');
      await expect(admin).toHaveURL(/status=suspended/);
      await expect(table.getByRole('link', { name: user.email })).toBeVisible();
      await expect(table.getByText(a.users.status.suspended)).toHaveCount(1);
      await admin
        .getByRole('combobox', { name: a.users.roleFilter })
        .selectOption('admin');
      await expect(admin).toHaveURL(/isAdmin=true/);
      await expect(
        admin.getByText(a.users.emptyTitle, { exact: true }),
      ).toBeVisible();
      await admin
        .getByRole('combobox', { name: a.users.roleFilter })
        .selectOption('user');
      await expect(table.getByRole('link', { name: user.email })).toBeVisible();

      // A reload keeps every filter.
      await admin.reload();
      await expect(search).toHaveValue(fragment);
      await expect(
        admin.getByRole('combobox', { name: a.users.statusFilter }),
      ).toHaveValue('suspended');
      await expect(
        admin.getByRole('combobox', { name: a.users.roleFilter }),
      ).toHaveValue('user');
      await expect(table.getByRole('link', { name: user.email })).toBeVisible();

      // Paging: without filters there are many e2e users.
      await admin.goto('/admin/users');
      const range = admin
        .getByRole('navigation', { name: a.users.tableLabel })
        .locator('span:has(> bdi)')
        .first();
      await expect(range).toHaveText(/^1–20\s+من\s+\d+$/);
      await admin.getByRole('button', { name: a.users.next }).click();
      await expect(admin).toHaveURL(/page=2/);
      await expect(range).toHaveText(/^21–\d+\s+من\s+\d+$/);
      await admin.reload();
      await expect(range).toHaveText(/^21–\d+\s+من\s+\d+$/);
      await expect(
        admin.getByRole('button', { name: a.users.prev }),
      ).toBeEnabled();
    });
  });

  test('AD-04 the row menu opens the user with the plan or balance dialog already open', async ({
    page,
    browser,
  }) => {
    const user = await createChatUser(page, { prefix: 'e2e-adrow' });
    await asAdmin(browser, async (admin) => {
      await admin.goto(`/admin/users?q=${encodeURIComponent(user.email)}`);
      const rowMenu = () =>
        admin.getByRole('button', {
          name: `${a.users.rowActions}: ${user.email}`,
        });
      await rowMenu().click();
      await admin.getByRole('menuitem', { name: a.users.activatePlan }).click();
      await expect(admin).toHaveURL(new RegExp(`/admin/users/${user.userId}`));
      await expect(dialogOf(admin, a.subscription.activateTitle)).toBeVisible();

      await admin.goto(`/admin/users?q=${encodeURIComponent(user.email)}`);
      await rowMenu().click();
      await admin.getByRole('menuitem', { name: a.users.addFunds }).click();
      await expect(admin).toHaveURL(new RegExp(`/admin/users/${user.userId}`));
      await expect(dialogOf(admin, a.balance.adjustTitle)).toBeVisible();
    });
  });

  test('AD-05 an unknown user id shows the not-found state', async ({
    browser,
  }) => {
    await asAdmin(browser, async (admin) => {
      await admin.goto(`/admin/users/${randomUUID()}`);
      await expect(
        admin.getByText(a.detail.notFoundTitle, { exact: true }),
      ).toBeVisible();
      await admin.getByRole('link', { name: a.detail.backToUsers }).click();
      await expect(admin).toHaveURL(/\/admin\/users/);
    });
  });
});

test.describe('3c user detail', () => {
  test('AD-06 suspend with a reason signs the user out on the next request; reactivate restores it', async ({
    page,
    browser,
  }) => {
    const user = await createChatUser(page, { prefix: 'e2e-adsuspend' });
    await page.goto('/chat');
    await asAdmin(browser, async (admin) => {
      await admin.goto(userUrl(user.userId));
      const row = admin.getByText(a.overview.status).locator('xpath=..');
      await admin
        .getByRole('button', { name: a.overview.suspend, exact: true })
        .click();
      const dialog = dialogOf(admin, a.overview.suspendTitle);
      // The reason is required.
      await dialog
        .getByRole('button', { name: a.overview.suspend, exact: true })
        .click();
      await expect(dialog.getByText(a.dialog.reasonRequired)).toBeVisible();
      await confirm(dialog, a.overview.suspend, 'e2e suspend check');
      await expect(dialog).toBeHidden();
      await expect(row).toContainText(a.users.status.suspended);

      // The user's next request ends the session.
      await page.goto('/balance');
      await expect(page).toHaveURL(/\/account-unavailable\?reason=suspended/);

      await admin
        .getByRole('button', { name: a.overview.reactivate, exact: true })
        .click();
      await confirm(
        dialogOf(admin, a.overview.reactivateTitle),
        a.overview.reactivate,
        'e2e reactivate check',
      );
      await expect(row).toContainText(a.users.status.active);
    });
    // Signing in works again.
    const context = await signedInContext(browser, user.email, user.password);
    const back = await context.newPage();
    await back.goto('/chat');
    await expect(back).toHaveURL(/\/chat/);
    await expect(
      back.getByRole('textbox', { name: text.chat.composer.label }),
    ).toBeVisible();
    await context.close();
  });

  test('AD-07 acting on your own account is refused; the last-admin refusal is shown', async ({
    browser,
  }) => {
    await asAdmin(browser, async (admin) => {
      const id = await mine();
      await admin.goto(userUrl(id));
      // Suspend myself: the real API refuses.
      await admin
        .getByRole('button', { name: a.overview.suspend, exact: true })
        .click();
      let dialog = dialogOf(admin, a.overview.suspendTitle);
      await confirm(dialog, a.overview.suspend, 'e2e self check');
      await expect(
        dialog
          .getByRole('alert')
          .filter({ hasText: errors.CANNOT_MODIFY_SELF }),
      ).toBeVisible();
      await dialog.getByRole('button', { name: a.common.cancel }).click();
      await expect(admin.getByText(a.users.status.suspended)).toHaveCount(0);

      // Remove my own admin role: also refused.
      await admin.getByRole('button', { name: a.overview.removeAdmin }).click();
      dialog = dialogOf(admin, a.overview.removeTitle);
      await confirm(dialog, a.overview.removeAdmin, 'e2e self role check');
      await expect(
        dialog
          .getByRole('alert')
          .filter({ hasText: errors.CANNOT_MODIFY_SELF }),
      ).toBeVisible();
      await dialog.getByRole('button', { name: a.common.cancel }).click();

      // The last-admin answer (an actor other than the last admin cannot exist,
      // so the server's answer is simulated).
      await admin.route(/\/admin\/users\/[^/]+\/admin-role$/, (route) =>
        route.fulfill({
          status: 409,
          json: { statusCode: 409, code: 'LAST_ADMIN', message: 'last admin' },
        }),
      );
      await admin.getByRole('button', { name: a.overview.removeAdmin }).click();
      dialog = dialogOf(admin, a.overview.removeTitle);
      await confirm(dialog, a.overview.removeAdmin, 'e2e last admin check');
      await expect(
        dialog.getByRole('alert').filter({ hasText: errors.LAST_ADMIN }),
      ).toBeVisible();
    });
  });

  test('AD-08 AD-09 activate a plan: one month by default with the included balance; a custom end date is shown', async ({
    page,
    browser,
  }) => {
    await ensureIncludedPlan();
    const user = await createChatUser(page, {
      prefix: 'e2e-adplan',
      balanceUsd: null,
    });
    await asAdmin(browser, async (admin) => {
      await admin.goto(userUrl(user.userId, 'subscription'));
      await admin
        .getByRole('button', { name: a.subscription.activate, exact: true })
        .click();
      let dialog = dialogOf(admin, a.subscription.activateTitle);
      // A plan is required.
      await dialog.getByLabel(a.dialog.reason).fill('e2e plan check');
      await dialog
        .getByRole('button', { name: a.subscription.activateSubmit })
        .click();
      await expect(
        dialog
          .getByRole('alert')
          .filter({ hasText: a.subscription.planRequired }),
      ).toBeVisible();
      await dialog
        .getByLabel(a.subscription.planLabel)
        .selectOption({ label: INCLUDED_PLAN_NAME });
      await dialog
        .getByRole('button', { name: a.subscription.activateSubmit })
        .click();
      await expect(dialog).toBeHidden();

      // AD-08: active, ends about one month from now.
      const current = admin
        .getByText(a.subscription.periodEnd)
        .locator('xpath=following-sibling::dd[1]');
      const subs = await adminCall<
        { status: string; currentPeriodEnd: string }[]
      >('GET', `/admin/users/${user.userId}/subscriptions`);
      const end = new Date(
        subs.find((s) => s.status === 'active')!.currentPeriodEnd,
      );
      const days = (end.getTime() - Date.now()) / 86_400_000;
      expect(days).toBeGreaterThan(27);
      expect(days).toBeLessThan(32);
      await expect(current).toHaveText(longDate(end));
      await expect(
        admin.getByText(a.subscription.status.active, { exact: true }),
      ).toBeVisible();
      await tabs(admin)
        .getByRole('link', { name: a.detail.tabs.balance })
        .click();
      await expect(available(admin)).toContainText('0.75$');
      await expect(
        ledgerRows(admin).filter({
          hasText: a.balance.types.subscription_credit,
        }),
      ).toHaveCount(1);

      // AD-09: replace it with a custom end date.
      await tabs(admin)
        .getByRole('link', { name: a.detail.tabs.subscription })
        .click();
      await admin
        .getByRole('button', { name: a.subscription.activate, exact: true })
        .click();
      dialog = dialogOf(admin, a.subscription.activateTitle);
      const target = new Date();
      target.setDate(target.getDate() + 10);
      const iso = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
      await dialog
        .getByLabel(a.subscription.planLabel)
        .selectOption({ label: INCLUDED_PLAN_NAME });
      // A past date is refused.
      await dialog.getByLabel(a.subscription.endDateLabel).fill('2020-01-01');
      await confirm(dialog, a.subscription.activateSubmit, 'e2e custom end');
      await expect(
        dialog.getByText(a.subscription.endDatePast, { exact: true }),
      ).toBeVisible();
      await dialog.getByLabel(a.subscription.endDateLabel).fill(iso);
      await dialog
        .getByRole('button', { name: a.subscription.activateSubmit })
        .click();
      await expect(dialog).toBeHidden();
      await expect(current).toHaveText(longDate(new Date(`${iso}T23:59:59`)));
    });
  });

  test('AD-10 ending the plan warns, then zeroes the balance and the ledger shows the expiry', async ({
    page,
    browser,
  }) => {
    const user = await createChatUser(page, { prefix: 'e2e-adend' });
    await asAdmin(browser, async (admin) => {
      await admin.goto(userUrl(user.userId, 'subscription'));
      await admin
        .getByRole('button', { name: a.subscription.end, exact: true })
        .click();
      const dialog = dialogOf(admin, a.subscription.endTitle);
      await expect(dialog).toContainText(a.subscription.endWarning);
      await confirm(dialog, a.subscription.endSubmit, 'e2e end plan check');
      await expect(dialog).toBeHidden();
      await expect(
        admin.getByText(a.subscription.none, { exact: true }),
      ).toBeVisible();
      expect(Number(await apiBalance(user.token))).toBe(0);
      await tabs(admin)
        .getByRole('link', { name: a.detail.tabs.balance })
        .click();
      await expect(
        ledgerRows(admin).filter({ hasText: a.balance.types.expiry }),
      ).toHaveCount(1);
      await expect(available(admin)).toContainText('0.00$');
    });
  });

  test('AD-11 AD-14 adjust balance +0.5 then -0.2: ledger rows, short ids with a working copy button, matching customer balance', async ({
    page,
    browser,
  }) => {
    const user = await createChatUser(page, { prefix: 'e2e-adbal' });
    await asAdmin(browser, async (admin) => {
      await admin
        .context()
        .grantPermissions(['clipboard-read', 'clipboard-write'])
        .catch(() => undefined);
      await admin.goto(userUrl(user.userId, 'balance'));
      await expect(available(admin)).toContainText('0.50$');
      const adjust = async (amount: string, reason: string) => {
        await admin.getByRole('button', { name: a.balance.adjust }).click();
        const dialog = dialogOf(admin, a.balance.adjustTitle);
        await dialog.getByLabel(a.balance.amountLabel).fill(amount);
        await confirm(dialog, a.balance.adjustSubmit, reason);
        await expect(dialog).toBeHidden();
      };
      await adjust('0.5', 'e2e plus half');
      await expect(available(admin)).toContainText('1.00$');
      await adjust('-0.2', 'e2e minus fifth');
      await expect(available(admin)).toContainText('0.80$');

      const plus = ledgerRows(admin).filter({ hasText: 'e2e plus half' });
      const minus = ledgerRows(admin).filter({ hasText: 'e2e minus fifth' });
      await expect(plus).toHaveCount(1);
      await expect(minus).toHaveCount(1);
      await expect(plus).toContainText(a.balance.types.adjustment);
      await expect(plus.locator('bdi').first()).toHaveText(/^\+0\.50\d*\$$/);
      await expect(minus.locator('bdi').first()).toHaveText(/^[−-]0\.20\d*\$$/);
      // The actor is the admin (a short id), not "system".
      await expect(plus).toContainText(a.balance.actor.admin);

      // AD-14: ids are shortened to 8 characters with the full value on hover.
      const actorId = plus.locator('bdi[title]').first();
      const full = (await actorId.getAttribute('title'))!;
      expect(full.length).toBeGreaterThan(8);
      await expect(actorId).toHaveText(full.slice(0, 8));
      await plus
        .getByRole('button', {
          name: new RegExp(`${a.common.copy}: ${full.slice(0, 8)}`),
        })
        .click();
      await expect(
        plus.getByRole('button', {
          name: new RegExp(`${a.common.copied}: ${full.slice(0, 8)}`),
        }),
      ).toBeVisible();
      const clipboard = await admin
        .evaluate(() => navigator.clipboard.readText())
        .catch(() => null);
      if (clipboard !== null) expect(clipboard).toBe(full);
    });
    // The customer's own page matches.
    await page.goto('/balance');
    await expect(page.locator('p.text-5xl')).toHaveText('0.80$');
  });

  test('AD-12 invalid amounts and an empty reason give field errors and send nothing', async ({
    page,
    browser,
  }) => {
    const user = await createChatUser(page, { prefix: 'e2e-adinvalid' });
    await asAdmin(browser, async (admin) => {
      const sent: string[] = [];
      admin.on('request', (req) => {
        if (req.method() === 'POST' && /balance\/adjustments/.test(req.url()))
          sent.push(req.url());
      });
      await admin.goto(userUrl(user.userId, 'balance'));
      await admin.getByRole('button', { name: a.balance.adjust }).click();
      const dialog = dialogOf(admin, a.balance.adjustTitle);
      const submit = dialog.getByRole('button', {
        name: a.balance.adjustSubmit,
        exact: true,
      });
      await dialog.getByLabel(a.balance.amountLabel).fill('abc');
      await submit.click();
      await expect(
        dialog.getByText(a.balance.amountInvalidSigned, { exact: true }),
      ).toBeVisible();
      await expect(dialog.getByText(a.dialog.reasonRequired)).toBeVisible();
      await dialog.getByLabel(a.balance.amountLabel).fill('1.2.3');
      await submit.click();
      await expect(
        dialog.getByText(a.balance.amountInvalidSigned, { exact: true }),
      ).toBeVisible();
      await dialog.getByLabel(a.balance.amountLabel).fill('');
      await submit.click();
      await expect(dialog).toBeVisible();
      await admin.waitForTimeout(400);
      expect(sent).toEqual([]);
      await expect(available(admin)).toContainText('0.50$');
    });
  });

  test('AD-13 record a payment: ledger row; the same reference with another amount is refused', async ({
    page,
    browser,
  }) => {
    const user = await createChatUser(page, { prefix: 'e2e-adpay' });
    const reference = `INV-E2E-${Date.now()}`;
    await asAdmin(browser, async (admin) => {
      await admin.goto(userUrl(user.userId, 'balance'));
      const pay = async (amount: string) => {
        await admin
          .getByRole('button', { name: a.balance.recordPayment })
          .click();
        const dialog = dialogOf(admin, a.balance.paymentTitle);
        await dialog.getByLabel(a.balance.amountLabel).fill(amount);
        await dialog.getByLabel(a.balance.referenceLabel).fill(reference);
        await confirm(dialog, a.balance.paymentSubmit, 'e2e payment check');
        return dialog;
      };
      let dialog = await pay('0.25');
      await expect(dialog).toBeHidden();
      await expect(available(admin)).toContainText('0.75$');
      await expect(
        ledgerRows(admin).filter({ hasText: a.balance.types.purchase }),
      ).toHaveCount(1);
      await expect(
        ledgerRows(admin).filter({ hasText: reference.slice(0, 8) }),
      ).toHaveCount(1);

      dialog = await pay('0.40');
      await expect(
        dialog
          .getByRole('alert')
          .filter({ hasText: errors.PAYMENT_REFERENCE_REUSED }),
      ).toBeVisible();
      await dialog.getByRole('button', { name: a.common.cancel }).click();
      await expect(available(admin)).toContainText('0.75$');
    });
  });

  test('AD-15 adjusting your own balance shows on /balance without a reload', async ({
    browser,
    isMobile,
  }) => {
    await ensureChatFixtures();
    const creds = adminCredentials()!;
    const context = await signedInContext(browser, creds.email, creds.password);
    try {
      const page = await context.newPage();
      // The customer balance is loaded (and cached) first.
      await page.goto('/balance');
      const big = page.locator('p.text-5xl');
      await expect(big).toHaveText(/\$$/);
      const before = (await big.textContent())!;
      // From there, by in-app links only (no page load), to the admin console.
      if (isMobile) {
        await page.getByRole('button', { name: text.shell.openMenu }).click();
        await page.getByRole('link', { name: a.entry }).click();
      } else {
        await page
          .getByRole('button', { name: text.shell.accountMenu })
          .click();
        await page.getByRole('menuitem', { name: a.entry }).click();
      }
      await page
        .getByRole('searchbox', { name: a.users.searchLabel })
        .fill(creds.email);
      await page
        .getByRole('table', { name: a.users.tableLabel })
        .getByRole('link', { name: creds.email, exact: true })
        .click();
      await tabs(page)
        .getByRole('link', { name: a.detail.tabs.balance })
        .click();
      await page.getByRole('button', { name: a.balance.adjust }).click();
      const dialog = dialogOf(page, a.balance.adjustTitle);
      await dialog.getByLabel(a.balance.amountLabel).fill('0.01');
      await confirm(dialog, a.balance.adjustSubmit, 'e2e own balance plus');
      await expect(dialog).toBeHidden();
      // Back to the app and to the balance page by links: already fresh.
      if (isMobile) {
        await page.getByRole('button', { name: a.nav.openMenu }).click();
        await page
          .getByRole('dialog', { name: a.nav.panel })
          .getByRole('link', { name: a.nav.backToApp })
          .click();
        await page.getByRole('button', { name: text.shell.openMenu }).click();
        await page
          .getByRole('dialog', { name: text.shell.sidebarTitle })
          .getByRole('link', { name: text.shell.balance })
          .click();
      } else {
        await page
          .getByRole('complementary', { name: a.nav.panel })
          .getByRole('link', { name: a.nav.backToApp })
          .click();
        await page
          .getByRole('complementary', { name: text.shell.sidebarTitle })
          .getByRole('link', { name: text.shell.balance })
          .click();
      }
      await expect(page).toHaveURL(/\/balance/);
      await expect(big).not.toHaveText(before, { timeout: 3000 });
    } finally {
      await adjustBalance(
        await myId(await adminToken()),
        '-0.01',
        'e2e restore',
      );
      await context.close();
    }
  });
});

// ---------------------------------------------------------------------------
// Catalog and settings

interface PlanRow {
  key: string;
  isDefault: boolean;
  activeSubscriptions: number;
}

const planRow = (page: Page, key: string) =>
  page
    .getByRole('table', { name: a.plans.tableLabel })
    .getByRole('row')
    .filter({ has: page.getByText(key, { exact: true }) });

async function openPlans(admin: Page) {
  await admin.goto('/admin/plans');
  await expect(
    admin.getByRole('table', { name: a.plans.tableLabel }),
  ).toBeVisible();
}

test.describe('3c catalog and settings', () => {
  test('AD-16 plans list: price, included balance, mode labels, flags and subscriber count', async ({
    browser,
  }) => {
    await ensureIncludedPlan();
    const plans = await adminCall<PlanRow[]>('GET', '/admin/plans');
    const chat = plans.find((p) => p.key === CHAT_PLAN_KEY)!;
    await asAdmin(browser, async (admin) => {
      await openPlans(admin);
      const row = planRow(admin, CHAT_PLAN_KEY);
      await expect(row).toHaveCount(1);
      await expect(row).toContainText(CHAT_FAST_LABEL);
      // Labels, never model names.
      await expect(row).not.toContainText(/mock|gpt|gemini|claude/i);
      await expect(row).toContainText(a.catalog.active);
      await expect(row).toContainText(a.plans.hidden);
      await expect(row.getByRole('cell').nth(1).locator('bdi')).toHaveText(
        /^0(\.0+)?\$$/,
      );
      await expect(row.getByRole('cell').nth(5)).toHaveText(
        String(chat.activeSubscriptions),
      );

      const included = planRow(admin, INCLUDED_PLAN_KEY);
      await expect(included.getByRole('cell').nth(2).locator('bdi')).toHaveText(
        '0.75$',
      );

      // Exactly one default plan, marked.
      await expect(
        admin
          .getByRole('table', { name: a.plans.tableLabel })
          .getByText(a.plans.default, { exact: true }),
      ).toHaveCount(1);
      const defaultKey = plans.find((p) => p.isDefault)!.key;
      await expect(planRow(admin, defaultKey)).toContainText(a.plans.default);
    });
  });

  test('AD-17 create a plan: listed and public for customers; key "new" and a duplicate key are rejected', async ({
    page,
    browser,
  }) => {
    await createChatUser(page, { prefix: 'e2e-adplans' });
    const key = `e2e-qa-${Date.now().toString(36)}`;
    const nameAr = `باقة اختبار ${key}`;
    await asAdmin(browser, async (admin) => {
      try {
        const fill = async (planKey: string) => {
          await admin.goto('/admin/plans/new');
          await starts(admin, a.plans.key).fill(planKey);
          await starts(admin, a.catalog.nameAr).fill(nameAr);
          await starts(admin, a.catalog.nameEn).fill(`QA ${planKey}`);
          await starts(admin, a.catalog.descriptionAr).fill('وصف الباقة');
          await starts(admin, a.catalog.descriptionEn).fill('Plan description');
          await starts(admin, a.plans.monthlyPrice).fill('0');
          await starts(admin, a.plans.includedBalance).fill('0');
          await starts(admin, a.catalog.sortOrder).fill('905');
          await starts(admin, a.plans.isPublic).check();
          await starts(admin, CHAT_FAST_LABEL).check();
          await admin
            .getByRole('button', { name: a.plans.createSubmit, exact: true })
            .click();
        };
        // The reserved key.
        await fill('new');
        await expect(
          admin.getByText(a.catalog.keyReserved, { exact: true }),
        ).toBeVisible();
        await expect(admin.getByRole('dialog')).toHaveCount(0);

        // A good key.
        await fill(key);
        await confirm(
          dialogOf(admin, a.plans.createTitle),
          a.plans.createSubmit,
          'e2e create plan',
        );
        await expect(admin).toHaveURL(new RegExp(`/admin/plans/${key}$`));
        await openPlans(admin);
        const row = planRow(admin, key);
        await expect(row).toHaveCount(1);
        await expect(row).toContainText(CHAT_FAST_LABEL);
        await expect(row).toContainText(a.plans.public);

        // Customers see it on /plans.
        await page.goto('/plans');
        await expect(page.getByText(nameAr, { exact: true })).toBeVisible();

        // A duplicate key is refused by the server.
        await fill(key);
        const dialog = dialogOf(admin, a.plans.createTitle);
        await confirm(dialog, a.plans.createSubmit, 'e2e duplicate plan');
        await expect(
          dialog
            .getByRole('alert')
            .filter({ hasText: errors.PLAN_ALREADY_EXISTS }),
        ).toBeVisible();
      } finally {
        // Plans cannot be deleted: take the test plan off the customer list.
        await adminCall('PATCH', `/admin/plans/${key}`, {
          reason: 'e2e cleanup',
          isPublic: false,
          isActive: false,
        }).catch(() => undefined);
      }
    });
  });

  test('AD-18 the default plan cannot be made non-default', async ({
    browser,
  }) => {
    const plans = await adminCall<PlanRow[]>('GET', '/admin/plans');
    const current = plans.find((p) => p.isDefault)!;
    await asAdmin(browser, async (admin) => {
      await admin.goto(`/admin/plans/${current.key}`);
      const box = admin.getByRole('checkbox', {
        name: new RegExp(a.plans.isDefault),
      });
      await expect(box).toBeChecked();
      await expect(box).toBeDisabled();
      await expect(admin.getByText(a.plans.isDefaultCurrent)).toBeVisible();
      await expect(
        admin.getByRole('checkbox', { name: new RegExp(a.plans.isActive) }),
      ).toBeDisabled();
    });
    // The API holds the same rule.
    const res = await fetch(`${API}/api/v1/admin/plans/${current.key}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await adminToken()}`,
      },
      body: JSON.stringify({
        reason: 'e2e default plan rule',
        isDefault: false,
      }),
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(((await res.json()) as { code?: string }).code).toBe(
      'DEFAULT_PLAN_REQUIRED',
    );
    const after = await adminCall<PlanRow[]>('GET', '/admin/plans');
    expect(after.filter((p) => p.isDefault).map((p) => p.key)).toEqual([
      current.key,
    ]);
  });

  test('AD-19 providers: keys only as last four digits or "no key"; the mock provider is for admins only', async ({
    page,
    browser,
  }) => {
    const user = await createChatUser(page, { prefix: 'e2e-adprov' });
    await asAdmin(browser, async (admin) => {
      await admin.goto('/admin/providers');
      const table = admin.getByRole('table', { name: a.providers.tableLabel });
      const rows = table.getByRole('row');
      await expect(rows.nth(1)).toBeVisible();
      const count = await rows.count();
      expect(count).toBeGreaterThan(2);
      for (let i = 1; i < count; i++) {
        const key = (await rows.nth(i).getByRole('cell').nth(4).textContent())!;
        expect(key.trim()).toMatch(
          new RegExp(`^(••••.{0,4}|${a.providers.noKey})$`),
        );
      }
      // The development provider is listed for the admin.
      await expect(
        table.getByText('mock', { exact: true }).first(),
      ).toBeVisible();
    });
    // A normal user can neither list providers nor see them in /modes.
    const res = await fetch(`${API}/api/v1/admin/providers`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    expect(res.status).toBe(403);
    const modes = await fetch(`${API}/api/v1/modes`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    expect(JSON.stringify(await modes.json())).not.toMatch(/mock|provider/i);
  });

  test('AD-20 an invalid provider key is rejected, the field is cleared and the key never comes back', async ({
    browser,
  }) => {
    const bad = 'invalid-key-123';
    await asAdmin(browser, async (admin) => {
      const bodies: string[] = [];
      await admin.route(/\/admin\/providers\/[^/]+\/api-key$/, (route) => {
        bodies.push(route.request().postData() ?? '');
        return route.fulfill({
          status: 422,
          json: {
            statusCode: 422,
            code: 'PROVIDER_KEY_INVALID',
            message: 'rejected',
          },
        });
      });
      await admin.goto('/admin/providers');
      const row = admin
        .getByRole('table', { name: a.providers.tableLabel })
        .getByRole('row')
        .filter({ has: admin.getByText('mock', { exact: true }) });
      const open = () =>
        row
          .getByRole('button', {
            name: new RegExp(`${a.providers.setKey}|${a.providers.replaceKey}`),
          })
          .click();
      await open();
      const dialog = dialogOf(admin, a.providers.setKeyTitle);
      const field = dialog.getByLabel(a.providers.keyLabel);
      await field.fill(bad);
      await confirm(dialog, a.providers.setKeySubmit, 'e2e bad key');
      await expect(
        dialog
          .getByRole('alert')
          .filter({ hasText: errors.PROVIDER_KEY_INVALID }),
      ).toBeVisible();
      expect(bodies).toHaveLength(1);
      expect(bodies[0]).toContain(bad);
      await expect(field).toHaveValue('');
      expect(await admin.content()).not.toContain(bad);
      await dialog.getByRole('button', { name: a.common.cancel }).click();
      await open();
      await expect(
        dialogOf(admin, a.providers.setKeyTitle).getByLabel(
          a.providers.keyLabel,
        ),
      ).toHaveValue('');
      expect(await admin.content()).not.toContain(bad);
    });
  });

  test('AD-21 models list at 1440px: every column, current price, margin and mode labels', async ({
    browser,
    isMobile,
  }) => {
    test.skip(isMobile, 'The 1440px table layout is a desktop case.');
    await ensureChatFixtures();
    await asAdmin(browser, async (admin) => {
      await admin.setViewportSize({ width: 1440, height: 900 });
      await admin.goto('/admin/models');
      const table = admin.getByRole('table', { name: a.models.tableLabel });
      for (const column of [
        'model',
        'provider',
        'context',
        'margin',
        'status',
        'modes',
        'price',
      ] as const) {
        await expect(
          table.getByRole('columnheader', { name: a.models.columns[column] }),
        ).toBeVisible();
      }
      // The whole table fits: no sideways scroll inside its card.
      const overflow = await table.evaluate((el) => {
        const box = el.parentElement!;
        return box.scrollWidth - box.clientWidth;
      });
      expect(overflow).toBeLessThanOrEqual(0);
      const row = table
        .getByRole('row')
        .filter({ has: admin.getByText('mock-chat-fast', { exact: true }) });
      await expect(row).toContainText(CHAT_FAST_LABEL);
      await expect(row.getByRole('cell').nth(3)).toContainText(/^\d+(\.\d+)?%/);
      const price = row.getByRole('cell').nth(6);
      await expect(price).toContainText(a.models.inShort);
      await expect(price).toContainText(a.models.outShort);
      await expect(price.locator('bdi').first()).toHaveText(/^\d+(\.\d+)?\$$/);
    });
  });
});

// ---------------------------------------------------------------------------
// Models, modes and settings

interface ModelRow {
  id: string;
  providerCode: string;
  providerModelId: string;
}

async function modelByProviderId(providerModelId: string): Promise<ModelRow> {
  const models = await adminCall<ModelRow[]>('GET', '/admin/models');
  return models.find((m) => m.providerModelId === providerModelId)!;
}

/** A free mock model with no mode, used only to schedule prices on. */
async function ensurePriceModel(): Promise<ModelRow> {
  await ensureChatFixtures();
  const found = await modelByProviderId('mock-price-e2e').catch(
    () => undefined,
  );
  if (found) return found;
  const providers = await adminCall<{ code: string; kind: string }[]>(
    'GET',
    '/admin/providers',
  );
  return adminCall<ModelRow>('POST', '/admin/models', {
    reason: 'e2e price fixture',
    providerCode: providers.find((p) => p.kind === 'mock')!.code,
    providerModelId: 'mock-price-e2e',
    displayName: 'Mock price e2e',
    contextWindow: 8000,
    maxOutputTokens: 4000,
    supportsImages: false,
    generatesImages: false,
    isEnabled: true,
    price: { inputPerMtok: '0.10', outputPerMtok: '1.00' },
  });
}

/** «2026-10-06T09:00» in the machine's own time zone, as a datetime-local value. */
function localInput(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
}

const clock = (date: Date) =>
  new Intl.DateTimeFormat('ar-u-nu-latn-ca-gregory', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);

test.describe('3c models, modes and settings', () => {
  test('AD-22 schedule a future price: listed with date and time; an overlapping one is refused', async ({
    browser,
  }) => {
    const model = await ensurePriceModel();
    const prices = await adminCall<{ effectiveFrom: string }[]>(
      'GET',
      `/admin/models/${model.id}/prices`,
    );
    // After the latest price of this model, so every run schedules cleanly.
    const latest = Math.max(
      Date.now(),
      ...prices.map((p) => new Date(p.effectiveFrom).getTime()),
    );
    const start = new Date(latest + 86_400_000);
    start.setSeconds(0, 0);
    await asAdmin(browser, async (admin) => {
      await admin.goto(`/admin/models/${model.id}`);
      const schedule = async (from: Date) => {
        await admin
          .getByRole('button', { name: a.models.priceSchedule })
          .click();
        const dialog = dialogOf(admin, a.models.priceTitle);
        const decimals = dialog.locator('input[inputmode="decimal"]');
        await decimals.nth(0).fill('1.2345');
        await decimals.nth(1).fill('2.5');
        await dialog
          .locator('input[type="datetime-local"]')
          .fill(localInput(from));
        await confirm(dialog, a.models.priceSubmit, 'e2e schedule price');
        return dialog;
      };
      let dialog = await schedule(start);
      await expect(dialog).toBeHidden();
      const history = admin.getByRole('table', { name: a.models.pricesTitle });
      const row = history
        .getByRole('row')
        .filter({ hasText: longDate(start) })
        .filter({ hasText: clock(start) });
      // Newest first: the new price starts at that time; the one before it
      // (if any) ends there, so it matches too.
      await expect(row.first()).toBeVisible();
      await expect(row.first().getByRole('cell').first()).toContainText(
        longDate(start),
      );
      await expect(row.first().getByRole('cell').first()).toContainText(
        clock(start),
      );
      await expect(row.first()).toContainText('1.2345$');

      // Before the scheduled price (still in the future): overlaps it.
      dialog = await schedule(new Date(Date.now() + 2 * 3_600_000));
      await expect(
        dialog
          .getByRole('alert')
          .filter({ hasText: errors.PRICE_PERIOD_CONFLICT }),
      ).toBeVisible();
    });
  });

  test('AD-23 a prompt over 500 characters or more than 256 tokens is blocked before the paid request', async ({
    browser,
  }) => {
    await ensureChatFixtures();
    const model = await modelByProviderId('mock-chat-fast');
    await asAdmin(browser, async (admin) => {
      const sent: string[] = [];
      admin.on('request', (req) => {
        if (req.method() === 'POST' && /\/models\/[^/]+\/test$/.test(req.url()))
          sent.push(req.url());
      });
      await admin.goto(`/admin/models/${model.id}`);
      await admin.getByRole('button', { name: a.models.test.open }).click();
      const dialog = dialogOf(admin, a.models.test.confirmTitle);
      await expect(dialog).toContainText(a.models.test.paidWarning);
      await dialog.getByLabel(a.models.test.prompt).fill('ن'.repeat(501));
      await expect(dialog).toContainText('501 / 500');
      await confirm(dialog, a.models.test.confirmSubmit, 'e2e too long');
      await expect(
        dialog.getByText(a.models.test.promptTooLong, { exact: true }),
      ).toBeVisible();

      await dialog.getByLabel(a.models.test.prompt).fill('قصير');
      await dialog.getByLabel(a.models.test.maxOutput).fill('257');
      await dialog
        .getByRole('button', { name: a.models.test.confirmSubmit })
        .click();
      await expect(
        dialog.getByText(a.models.test.maxOutputInvalid, { exact: true }),
      ).toBeVisible();
      await admin.waitForTimeout(400);
      expect(sent).toEqual([]);
    });
  });

  test('AD-24 a model test shows the reply, finish reason, usage, timings and exact costs (free mock model)', async ({
    browser,
  }) => {
    await ensureChatFixtures();
    const model = await modelByProviderId('mock-chat-fast');
    await asAdmin(browser, async (admin) => {
      await admin.goto(`/admin/models/${model.id}`);
      await admin.getByRole('button', { name: a.models.test.open }).click();
      const dialog = dialogOf(admin, a.models.test.confirmTitle);
      await dialog.getByLabel(a.models.test.prompt).fill('hello world');
      await confirm(dialog, a.models.test.confirmSubmit, 'e2e model test');
      await expect(dialog).toBeHidden();
      await expect(admin.getByText(a.models.test.ok)).toBeVisible();
      const stat = (label: string) =>
        admin
          .getByText(label, { exact: true })
          .locator('xpath=following-sibling::dd[1]');
      const reply = admin
        .getByRole('heading', { name: a.models.test.reply })
        .locator('xpath=following-sibling::p[1]');
      await expect(reply).toContainText('Echo: hello world');
      await expect(stat(a.models.test.finishReason)).toHaveText(/\S/);
      for (const label of [
        a.models.test.inputTokens,
        a.models.test.outputTokens,
      ]) {
        await expect(stat(label)).toHaveText(/^\d+$/);
      }
      await expect(stat(a.models.test.duration)).toHaveText(/^[\d,]+ ms$/);
      // Full precision, dollar after the number.
      for (const label of [
        a.models.test.providerCost,
        a.models.test.customerCharge,
      ]) {
        await expect(stat(label).locator('bdi')).toHaveText(/^\d+\.\d{4,}\$$/);
      }
    });
  });

  test('AD-25 modes list shows readiness and the reason; disabling a mode removes it for customers until re-enabled', async ({
    page,
    browser,
  }) => {
    await createChatUser(page, { prefix: 'e2e-admodes' });
    // A mode with no model is not ready.
    const modes = await adminCall<{ key: string }[]>('GET', '/admin/modes');
    if (!modes.some((m) => m.key === 'e2e-nomodel')) {
      await adminCall('POST', '/admin/modes', {
        reason: 'e2e not-ready fixture',
        key: 'e2e-nomodel',
        labelAr: 'بلا نموذج e2e',
        labelEn: 'No model e2e',
        descriptionAr: 'وضع بلا نموذج للاختبار',
        descriptionEn: 'Mode without a model',
        sortOrder: 920,
      });
    }
    const pro = (
      await adminCall<{ key: string; model: { id: string } }[]>(
        'GET',
        '/admin/modes',
      )
    ).find((m) => m.key === CHAT_PRO_KEY)!;
    const modeRow = (admin: Page, key: string) =>
      admin
        .getByRole('table', { name: a.modes.tableLabel })
        .getByRole('row')
        .filter({ has: admin.getByText(key, { exact: true }) });
    const menuItems = async () => {
      await page.goto('/chat');
      await page
        .getByRole('button', { name: text.chat.composer.modeMenu })
        .click();
      return page.getByRole('menuitemradio');
    };
    try {
      await asAdmin(browser, async (admin) => {
        await admin.goto('/admin/modes');
        await expect(modeRow(admin, CHAT_FAST_KEY)).toContainText(
          a.modes.ready,
        );
        const bad = modeRow(admin, 'e2e-nomodel');
        await expect(bad).toContainText(a.modes.notReady);
        await expect(bad).toContainText(a.modes.reasons.NO_MODEL);

        // Customers have both modes.
        let items = await menuItems();
        await expect(items).toHaveCount(2);
        await page.keyboard.press('Escape');

        // Disable the second one.
        await admin.goto(`/admin/modes/${CHAT_PRO_KEY}`);
        await starts(admin, a.catalog.enabled).uncheck();
        await admin
          .getByRole('button', { name: a.catalog.save, exact: true })
          .click();
        await confirm(
          dialogOf(admin, a.modes.saveTitle),
          a.catalog.save,
          'e2e disable mode',
        );
        await expect(admin.getByRole('dialog')).toHaveCount(0);
        await admin.goto('/admin/modes');
        await expect(modeRow(admin, CHAT_PRO_KEY)).toContainText(
          a.catalog.disabled,
        );

        items = await menuItems();
        await expect(items).toHaveCount(1);
        await expect(items.first()).toContainText(CHAT_FAST_LABEL);
        await page.keyboard.press('Escape');

        // Enable it again.
        await admin.goto(`/admin/modes/${CHAT_PRO_KEY}`);
        await starts(admin, a.catalog.enabled).check();
        await admin
          .getByRole('button', { name: a.catalog.save, exact: true })
          .click();
        await confirm(
          dialogOf(admin, a.modes.saveTitle),
          a.catalog.save,
          'e2e enable mode',
        );
        await expect(admin.getByRole('dialog')).toHaveCount(0);
        items = await menuItems();
        await expect(items).toHaveCount(2);
      });
    } finally {
      await adminCall('PATCH', `/admin/modes/${CHAT_PRO_KEY}`, {
        reason: 'e2e restore',
        modelId: pro.model.id,
        isEnabled: true,
      }).catch(() => undefined);
    }
  });

  test('AD-26 system prompts: counter, a 10,000 limit, an empty default is refused, text direction follows the content', async ({
    browser,
  }) => {
    await ensureChatFixtures();
    await asAdmin(browser, async (admin) => {
      // The mode's own prompt.
      await admin.goto(`/admin/modes/${CHAT_FAST_KEY}`);
      const own = starts(admin, a.modes.systemPrompt);
      await expect(own).toHaveAttribute('dir', 'auto');
      await own.fill('x'.repeat(10_001));
      await expect(admin.getByText('10001 / 10000')).toBeVisible();
      await admin
        .getByRole('button', { name: a.catalog.save, exact: true })
        .click();
      await expect(
        admin.getByText(a.settings.promptTooLong, { exact: true }),
      ).toBeVisible();
      await expect(admin.getByRole('dialog')).toHaveCount(0);

      // The default prompt in settings.
      await admin.goto('/admin/settings');
      const prompt = admin.getByRole('textbox', {
        name: a.settings.promptLabel,
      });
      await expect(prompt).toHaveAttribute('dir', 'auto');
      await expect(prompt).toHaveAttribute('maxlength', '10000');
      await expect(admin.getByText(/^\d+ \/ 10000$/)).toBeVisible();
      await prompt.fill('');
      await prompt
        .locator('xpath=ancestor::form')
        .evaluate((f) => (f as HTMLFormElement).requestSubmit());
      await expect(
        admin.getByText(a.settings.promptRequired, { exact: true }),
      ).toBeVisible();
      await expect(admin.getByRole('dialog')).toHaveCount(0);
    });
  });

  test('AD-27 default margin 35 is saved and shows in the models list and customer prices; restored afterwards', async ({
    page,
    browser,
  }) => {
    const user = await createChatUser(page, { prefix: 'e2e-admargin' });
    const before = await adminCall<{ defaultMarginPct: string }>(
      'GET',
      '/admin/pricing-settings',
    );
    const price = async () => {
      const res = await fetch(`${API}/api/v1/modes`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const list = (await res.json()) as {
        key: string;
        pricing: { inputPerMtok: string };
      }[];
      return new Decimal(
        list.find((m) => m.key === CHAT_FAST_KEY)!.pricing.inputPerMtok,
      );
    };
    const original = await price();
    try {
      await asAdmin(browser, async (admin) => {
        await admin.goto('/admin/settings');
        const field = starts(admin, a.settings.marginLabel);
        await field.fill('35');
        await admin
          .getByRole('button', { name: a.catalog.save, exact: true })
          .first()
          .click();
        await confirm(
          dialogOf(admin, a.settings.marginConfirm),
          a.catalog.save,
          'e2e margin check',
        );
        await expect(admin.getByRole('dialog')).toHaveCount(0);

        const row = async () => {
          await admin.goto('/admin/models');
          return admin
            .getByRole('table', { name: a.models.tableLabel })
            .getByRole('row')
            .filter({
              has: admin.getByText('mock-chat-fast', { exact: true }),
            });
        };
        await expect((await row()).getByRole('cell').nth(3)).toContainText(
          '35%',
        );
      });
      // Customer prices follow: cost + 35% instead of the old margin.
      const base = original
        .div(new Decimal(100).add(before.defaultMarginPct))
        .mul(100);
      expect((await price()).toFixed(6)).toBe(base.mul('1.35').toFixed(6));
    } finally {
      await adminCall('PUT', '/admin/pricing-settings', {
        reason: 'e2e restore margin',
        defaultMarginPct: before.defaultMarginPct,
      });
    }
    expect((await price()).toFixed(6)).toBe(original.toFixed(6));
  });
});
