import {
  expect,
  test,
  type Browser,
  type Locator,
  type Page,
} from '@playwright/test';
import Decimal from 'decimal.js';
import errors from '../../src/i18n/errors.ar.json' with { type: 'json' };
import {
  ADMIN_SKIP_MESSAGE,
  API,
  CHAT_PLAN_KEY,
  SKIP_MESSAGE,
  adminCall,
  adminContext,
  adminCredentials,
  apiBalance,
  createChatUser,
  createConfirmedUser,
  createFundedUser,
  createNoPlanUser,
  ensureChatFixtures,
  expectAccessibleRtl,
  expectNoHorizontalScroll,
  fillStable,
  fundUser,
  gotrueToken,
  myId,
  stackReachable,
  text,
} from '../support';

// MANUAL_TEST_CASES.md §3f (F10 vouchers), one test per case ID. Codes are real,
// made through the admin API with an `E2E` prefix. They can't be deleted, so each
// test makes its own and they pile up in the local list only.
//
// Left manual: VC-21 (pasting a copied code into another browser).

let stackUp = false;
test.beforeAll(async () => {
  stackUp = await stackReachable();
});
test.beforeEach(() => {
  test.skip(!stackUp, SKIP_MESSAGE);
  test.skip(!adminCredentials(), ADMIN_SKIP_MESSAGE);
});

const b = text.balance.redeem;
const v = text.admin.vouchers;
const reasonLabel = text.admin.dialog.reason;

const freshCode = () => `E2E${Date.now()}${Math.floor(Math.random() * 1000)}`;

interface Voucher {
  id: string;
  code: string;
}

function createVoucher(extra: Record<string, unknown> = {}): Promise<Voucher> {
  return adminCall<Voucher>('POST', '/admin/vouchers', {
    reason: 'e2e voucher',
    kind: 'balance',
    amountUsd: '2.50',
    maxRedemptions: 5,
    code: freshCode(),
    ...extra,
  });
}

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

const toggle = (page: Page) =>
  page.getByRole('button', { name: b.open, exact: true });
const field = (page: Page) => page.getByLabel(b.label, { exact: true });
const submit = (page: Page) =>
  page.getByRole('button', { name: b.submit, exact: true });

async function openBox(page: Page, path = '/balance') {
  await page.goto(path);
  await toggle(page).click();
  await expect(field(page)).toBeVisible();
}

async function redeem(page: Page, code: string) {
  await fillStable(field(page), code);
  await submit(page).click();
}

async function apiRedeem(token: string, code: string): Promise<number> {
  const res = await fetch(`${API}/api/v1/me/vouchers/redeem`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code }),
  });
  return res.status;
}

/** A second funded user who is not signed in on `page`; returns their token. */
async function otherUserToken(browser: Browser): Promise<string> {
  const other = await createConfirmedUser(browser, 'e2e-voucher-other');
  const token = await gotrueToken(other.email, other.password);
  await fundUser(await myId(token));
  return token;
}

async function expectPageFits(page: Page) {
  await expectNoHorizontalScroll(page);
  const over = await page.evaluate(() =>
    [
      document.querySelector('main'),
      ...document.querySelectorAll('main > *'),
    ].map((n) => (n ? n.scrollWidth - n.clientWidth : 0)),
  );
  expect(Math.max(...over)).toBeLessThanOrEqual(1);
}

async function confirmDialog(
  dialog: Locator,
  submitName: string,
  reason: string,
) {
  await dialog.getByLabel(reasonLabel).fill(reason);
  await dialog.getByRole('button', { name: submitName, exact: true }).click();
}

const formField = (page: Page, label: string) =>
  page.getByLabel(label, { exact: false });

test.describe('redeeming', () => {
  test('VC-01 the box is collapsed, opens with focus in an LTR field, and closes back to the button', async ({
    page,
  }) => {
    await createFundedUser(page, 'e2e-voucher-box');
    await page.goto('/balance');
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(field(page)).toHaveCount(0);
    await toggle(page).click();
    await expect(field(page)).toBeFocused();
    await expect(field(page)).toHaveAttribute('dir', 'ltr');
    await page.getByRole('button', { name: b.close, exact: true }).click();
    await expect(toggle(page)).toBeFocused();
  });

  test('VC-02 the code shows in capitals and an empty code asks for one without sending', async ({
    page,
  }) => {
    await createFundedUser(page, 'e2e-voucher-empty');
    await openBox(page);
    let sent = 0;
    await page.route('**/api/v1/me/vouchers/redeem', (route) => {
      sent += 1;
      return route.abort();
    });
    await submit(page).click();
    await expect(page.getByText(b.empty)).toBeVisible();
    expect(sent).toBe(0);
    await field(page).pressSequentially('abc123');
    await expect(field(page)).toHaveValue('ABC123');
    await expect(page.getByText(b.empty)).toHaveCount(0);
  });

  test('VC-03 a balance code adds the amount, updates the balance and lists «رصيد كود»', async ({
    page,
  }) => {
    const user = await createFundedUser(page, 'e2e-voucher-balance');
    const before = new Decimal(await apiBalance(user.token));
    const voucher = await createVoucher();
    await openBox(page);
    await redeem(page, voucher.code);
    await expect(
      page.getByText(b.balanceAdded.split('<money/>')[0]!),
    ).toBeVisible();
    await expect(page.getByText('+2.50$').first()).toBeVisible();
    expect(
      new Decimal(await apiBalance(user.token)).minus(before).toString(),
    ).toBe('2.5');
    await expect(
      page.getByText(text.balance.activity.types.voucher_credit).first(),
    ).toBeVisible();
    // «استخدام كود آخر» reopens an empty field.
    await page.getByRole('button', { name: b.another }).click();
    await expect(field(page)).toHaveValue('');
  });

  test('VC-04 a trial code activates the plan until a date', async ({
    page,
  }) => {
    await createFundedUser(page, 'e2e-voucher-trial');
    await ensureChatFixtures();
    const voucher = await createVoucher({
      kind: 'trial',
      amountUsd: undefined,
      planKey: CHAT_PLAN_KEY,
      trialDays: 7,
    });
    await openBox(page);
    await redeem(page, voucher.code);
    const success = b.trialActivated
      .split('{{date}}')[0]!
      .replace('{{plan}}', 'محادثة e2e');
    await expect(page.getByText(success)).toBeVisible();
    await page.reload();
    await expect(page.getByText('محادثة e2e').first()).toBeVisible();
  });

  test('VC-05 reuse by the same account is refused and the code stays in the field', async ({
    page,
  }) => {
    const user = await createFundedUser(page, 'e2e-voucher-reuse');
    const voucher = await createVoucher();
    expect(await apiRedeem(user.token, voucher.code)).toBeLessThan(300);
    await openBox(page);
    await redeem(page, voucher.code);
    await expect(page.getByText(errors.VOUCHER_ALREADY_REDEEMED)).toBeVisible();
    await expect(field(page)).toHaveValue(voucher.code);
    await expect(field(page)).toHaveAttribute('aria-invalid', 'true');
  });

  test('VC-06 a wrong code, a code not started and a used-up code each say so', async ({
    browser,
    page,
  }) => {
    await createFundedUser(page, 'e2e-voucher-errors');
    const later = await createVoucher({
      startsAt: new Date(Date.now() + 86_400_000).toISOString(),
    });
    const single = await createVoucher({ maxRedemptions: 1 });
    expect(
      await apiRedeem(await otherUserToken(browser), single.code),
    ).toBeLessThan(300);
    await openBox(page);
    await redeem(page, `NOPE${Date.now()}`);
    await expect(page.getByText(errors.VOUCHER_NOT_FOUND)).toBeVisible();
    await redeem(page, later.code);
    await expect(page.getByText(errors.VOUCHER_EXPIRED)).toBeVisible();
    await redeem(page, single.code);
    await expect(page.getByText(errors.VOUCHER_USED_UP)).toBeVisible();
  });

  test('VC-07 a new-users-only code is refused for a user who had a paid-style plan', async ({
    page,
  }) => {
    await createChatUser(page, { prefix: 'e2e-voucher-notnew' });
    const voucher = await createVoucher({ newUsersOnly: true });
    await openBox(page);
    await redeem(page, voucher.code);
    await expect(page.getByText(errors.VOUCHER_NOT_ELIGIBLE)).toBeVisible();
  });

  test('VC-08 a balance code without a plan explains it, offers plans and contact', async ({
    page,
  }) => {
    await createNoPlanUser(page, 'e2e-voucher-noplan');
    const voucher = await createVoucher();
    await openBox(page);
    await redeem(page, voucher.code);
    await expect(page.getByText(b.needsPlanExtra)).toBeVisible();
    const box = page.getByRole('region', { name: b.title });
    await expect(box.getByRole('link', { name: b.viewPlans })).toBeVisible();
    await box
      .getByRole('button', { name: text.chat.requestBalance.title })
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('VC-09 on /plans the needs-a-plan notice hides «عرض الباقات»', async ({
    page,
  }) => {
    await createNoPlanUser(page, 'e2e-voucher-plans');
    const voucher = await createVoucher();
    await openBox(page, '/plans');
    await redeem(page, voucher.code);
    await expect(page.getByText(b.needsPlanExtra)).toBeVisible();
    await expect(
      page
        .getByRole('region', { name: b.title })
        .getByRole('link', { name: b.viewPlans }),
    ).toHaveCount(0);
  });

  test('VC-10 too many wrong codes start a countdown that disables the button', async ({
    page,
  }) => {
    await createFundedUser(page, 'e2e-voucher-limit');
    await openBox(page);
    await expect(async () => {
      await field(page).fill(`NOPE${Date.now()}`);
      if (await submit(page).isEnabled()) await submit(page).click();
      await expect(page.getByText(b.rateLimited)).toBeVisible({ timeout: 800 });
    }).toPass({ timeout: 30_000 });
    await expect(submit(page)).toBeDisabled();
    await expect(
      page.getByRole('status').filter({ hasText: b.rateLimited }),
    ).toBeVisible();
  });

  test('VC-11 a network failure keeps the code and retry succeeds', async ({
    page,
  }) => {
    const user = await createFundedUser(page, 'e2e-voucher-net');
    const voucher = await createVoucher();
    const before = new Decimal(await apiBalance(user.token));
    await openBox(page);
    await page.route('**/api/v1/me/vouchers/redeem', (route) => route.abort());
    await redeem(page, voucher.code);
    await expect(page.getByText(text.common.networkError)).toBeVisible();
    await expect(field(page)).toHaveValue(voucher.code);
    await page.unroute('**/api/v1/me/vouchers/redeem');
    await page.getByRole('button', { name: text.common.retry }).click();
    await expect(page.getByText('+2.50$').first()).toBeVisible();
    expect(
      new Decimal(await apiBalance(user.token)).minus(before).toString(),
    ).toBe('2.5');
  });
});

test.describe('admin', () => {
  test('VC-12 create with a generated code shows the result view with the code', async ({
    browser,
  }) => {
    await asAdmin(browser, async (admin) => {
      await admin.goto('/admin/vouchers/new');
      await fillStable(formField(admin, v.amount), '1.25');
      await fillStable(formField(admin, v.maxRedemptions), '3');
      await admin.getByLabel(reasonLabel).fill('e2e generated');
      await admin
        .getByRole('button', { name: v.createSubmit, exact: true })
        .click();

      await expect(
        admin.getByRole('heading', { name: v.createdTitle }),
      ).toBeVisible();
      const code = await admin.getByTestId('voucher-code').innerText();
      expect(code.length).toBeGreaterThanOrEqual(4);
      await expect(
        admin.getByRole('button', { name: v.copyCode }),
      ).toBeVisible();

      await admin.getByRole('link', { name: v.backToList }).last().click();
      await expect(admin).toHaveURL(/\/admin\/vouchers$/);
      await expect(
        admin.getByText(code).locator('visible=true').first(),
      ).toBeVisible();
    });
  });

  test('VC-13 the form refuses bad values and sends nothing', async ({
    browser,
  }) => {
    await asAdmin(browser, async (admin) => {
      await admin.goto('/admin/vouchers/new');
      let sent = 0;
      await admin.route('**/api/v1/admin/vouchers', (route) => {
        if (route.request().method() === 'POST') sent += 1;
        return route.fallback();
      });
      await fillStable(formField(admin, v.amount), '1001');
      await fillStable(formField(admin, v.maxRedemptions), '2000000');
      await fillStable(formField(admin, v.code), 'a b');
      await admin
        .getByRole('button', { name: v.createSubmit, exact: true })
        .click();
      await expect(admin.getByText(v.errors.amountTooLarge)).toBeVisible();
      await expect(admin.getByText(v.errors.limitInvalid)).toBeVisible();
      await expect(admin.getByText(v.errors.codeInvalid)).toBeVisible();
      await expect(
        admin.getByText(text.admin.dialog.reasonRequired),
      ).toBeVisible();
      expect(sent).toBe(0);
    });
  });

  test('VC-14 date fields keep Western digits and catch impossible or crossed dates', async ({
    browser,
  }) => {
    await asAdmin(browser, async (admin) => {
      await admin.goto('/admin/vouchers/new');
      const starts = admin.getByLabel(v.startsAt);
      const ends = admin.getByLabel(v.endsAt);
      await expect(starts).not.toHaveAttribute('type', 'datetime-local');
      await starts.pressSequentially('٢٠٣٠١٢٢٥١٤٣٠');
      await expect(starts).toHaveValue('2030-12-25 14:30');

      await ends.pressSequentially('203002311000');
      await fillStable(formField(admin, v.amount), '1');
      await admin
        .getByRole('button', { name: v.createSubmit, exact: true })
        .click();
      await expect(admin.getByText(v.errors.dateInvalid)).toBeVisible();

      await ends.fill('');
      await ends.pressSequentially('203001011000');
      await admin
        .getByRole('button', { name: v.createSubmit, exact: true })
        .click();
      await expect(admin.getByText(v.errors.endBeforeStart)).toBeVisible();
    });
  });

  test('VC-15 a taken code is shown on the code field', async ({ browser }) => {
    const existing = await createVoucher();
    await asAdmin(browser, async (admin) => {
      await admin.goto('/admin/vouchers/new');
      await fillStable(formField(admin, v.amount), '1');
      await fillStable(formField(admin, v.code), existing.code);
      await admin.getByLabel(reasonLabel).fill('e2e taken');
      await admin
        .getByRole('button', { name: v.createSubmit, exact: true })
        .click();
      await expect(
        admin.getByText(errors.VOUCHER_CODE_TAKEN).first(),
      ).toBeVisible();
    });
  });

  test('VC-16 a trial code is created from the form with an active plan', async ({
    browser,
  }) => {
    await ensureChatFixtures();
    await asAdmin(browser, async (admin) => {
      await admin.goto('/admin/vouchers/new');
      await admin.getByRole('radio', { name: v.kind.trial }).check();
      await expect(formField(admin, v.amount)).toHaveCount(0);
      await admin
        .getByRole('combobox', { name: v.plan })
        .selectOption(CHAT_PLAN_KEY);
      await fillStable(formField(admin, v.trialDays), '7');
      await admin.getByLabel(reasonLabel).fill('e2e trial');
      await admin
        .getByRole('button', { name: v.createSubmit, exact: true })
        .click();
      await expect(
        admin.getByRole('heading', { name: v.createdTitle }),
      ).toBeVisible();
      await expect(admin.getByText(v.kind.trial).first()).toBeVisible();
    });
  });

  test('VC-17 editing refuses a limit below used, then saves with a reason', async ({
    browser,
  }) => {
    const voucher = await createVoucher({ maxRedemptions: 3 });
    expect(
      await apiRedeem(await otherUserToken(browser), voucher.code),
    ).toBeLessThan(300);
    await asAdmin(browser, async (admin) => {
      await admin.goto(`/admin/vouchers/${voucher.id}`);
      await expect(
        admin.getByRole('heading', { name: voucher.code }),
      ).toBeVisible();
      const limit = formField(admin, v.maxRedemptions);
      await limit.fill('0');
      const save = admin.getByRole('button', {
        name: text.admin.catalog.save,
        exact: true,
      });
      await save.click();
      await expect(admin.getByText(v.errors.limitInvalid)).toBeVisible();

      await limit.fill('9');
      await formField(admin, v.note).fill('e2e note');
      await save.click();
      const dialog = admin.getByRole('dialog', { name: v.saveTitle });
      await expect(dialog.getByText(v.changeLimit)).toBeVisible();
      await confirmDialog(dialog, text.admin.catalog.save, 'e2e edit');
      await expect(admin.getByText(v.saved)).toBeVisible();
      await admin.reload();
      await expect(formField(admin, v.maxRedemptions)).toHaveValue('9');
    });
  });

  test('VC-18 stopping a code makes it not found for users; activating brings it back', async ({
    browser,
    page,
  }) => {
    const user = await createFundedUser(page, 'e2e-voucher-stop');
    const voucher = await createVoucher();
    await asAdmin(browser, async (admin) => {
      await admin.goto(`/admin/vouchers/${voucher.id}`);
      await admin
        .getByRole('button', { name: v.deactivate, exact: true })
        .click();
      await confirmDialog(
        admin.getByRole('dialog', { name: v.deactivate }),
        v.deactivate,
        'e2e stop',
      );
      await expect(admin.getByText(v.inactiveBanner)).toBeVisible();

      await openBox(page);
      await redeem(page, voucher.code);
      await expect(page.getByText(errors.VOUCHER_NOT_FOUND)).toBeVisible();

      await admin
        .getByRole('button', { name: v.activate, exact: true })
        .click();
      await confirmDialog(
        admin.getByRole('dialog', { name: v.activate }),
        v.activate,
        'e2e start',
      );
      await expect(admin.getByText(v.inactiveBanner)).toHaveCount(0);
    });
    expect(await apiRedeem(user.token, voucher.code)).toBeLessThan(300);
  });

  test('VC-19 the list filters by state in the URL; detail lists who redeemed', async ({
    browser,
  }) => {
    const voucher = await createVoucher();
    const other = await createConfirmedUser(browser, 'e2e-voucher-who');
    const token = await gotrueToken(other.email, other.password);
    await fundUser(await myId(token));
    expect(await apiRedeem(token, voucher.code)).toBeLessThan(300);
    await asAdmin(browser, async (admin) => {
      await admin.goto('/admin/vouchers');
      await admin
        .getByRole('combobox', { name: v.filter.label })
        .selectOption('inactive');
      await expect(admin).toHaveURL(/status=inactive/);
      await admin
        .getByRole('combobox', { name: v.filter.label })
        .selectOption('active');
      await expect(admin).toHaveURL(/status=active/);
      await expect(
        admin.getByText(voucher.code).locator('visible=true').first(),
      ).toBeVisible();
      await expectPageFits(admin);

      await admin.goto(`/admin/vouchers/${voucher.id}`);
      await expect(
        admin.getByText(other.email).locator('visible=true').first(),
      ).toBeVisible();
      await expectPageFits(admin);
    });
  });

  test('VC-20 voucher screens and the redeem box are RTL with no serious axe violations', async ({
    browser,
    page,
  }) => {
    await createFundedUser(page, 'e2e-voucher-axe');
    await openBox(page);
    await expectAccessibleRtl(page);
    await expectPageFits(page);
    const voucher = await createVoucher();
    await asAdmin(browser, async (admin) => {
      for (const path of [
        '/admin/vouchers',
        '/admin/vouchers/new',
        `/admin/vouchers/${voucher.id}`,
      ]) {
        await admin.goto(path);
        await admin.waitForLoadState('networkidle');
        await expectAccessibleRtl(admin);
        await expectPageFits(admin);
      }
    });
  });
});
