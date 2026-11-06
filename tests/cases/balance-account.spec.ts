import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import Decimal from 'decimal.js';
import {
  API,
  CHAT_FAST_LABEL,
  CHAT_PRO_LABEL,
  SKIP_MESSAGE,
  apiBalance,
  createChatUser,
  createFundedUser,
  createNoPlanUser,
  expectNoHorizontalScroll,
  gotrueToken,
  seedConversation,
  signIn,
  signOutViaUi,
  stackReachable,
  text,
} from '../support';

// MANUAL_TEST_CASES.md §3b (balance, account, plans), one test per case ID.
// Real stack throughout; only the long activity histories (BA-03 labels that
// no API call can produce, BA-05 paging) are route-mocked.
// Left manual: none.

let stackUp = false;
test.beforeAll(async () => {
  stackUp = await stackReachable();
});
test.beforeEach(() => {
  test.skip(!stackUp, SKIP_MESSAGE);
});

const b = text.balance;
const a = text.account;
const chip = (page: Page) => page.locator('[data-slot="balance-chip"]');
const activityRows = (page: Page) =>
  page.getByRole('region', { name: b.activity.title }).getByRole('listitem');
const requestDialog = (page: Page) =>
  page.getByRole('dialog', { name: text.chat.requestBalance.title });

const entry = (
  n: number,
  type: string,
  amountUsd: string,
  createdAt = new Date().toISOString(),
) => ({
  id: `0190e0a0-0000-7000-8000-${String(n).padStart(12, '0')}`,
  type,
  amountUsd,
  balanceAfterUsd: '1.000000000',
  createdAt,
  conversationId: null,
  mode: null,
});

test.describe('balance', () => {
  test('BA-01 balance page: spendable balance equals the chip, request button, plan line and expiry', async ({
    page,
  }) => {
    await createChatUser(page);
    await page.goto('/balance');
    await expect(
      page.getByRole('heading', { name: b.title }).first(),
    ).toBeVisible();
    const big = page.locator('p.text-5xl');
    await expect(big).toHaveText('0.50$');
    await expect(page.getByRole('button', { name: b.request })).toBeVisible();
    await expect(page.getByText('باقتك: محادثة e2e')).toBeVisible();
    await expect(page.getByText(/ينتهي رصيدك بانتهاء الباقة في/)).toBeVisible();
    if (await chip(page).isVisible()) {
      await expect(chip(page)).toContainText('0.50$');
    }
  });

  test('BA-02 activity rows: newest first, type label, signed amount, balance after, today/yesterday date', async ({
    page,
    isMobile,
  }) => {
    const user = await createChatUser(page);
    await seedConversation(user.token, 'سؤال يسجل استخدامًا');
    await page.goto('/balance');
    const rows = activityRows(page);
    await expect(rows).toHaveCount(2);
    // Newest first: the chat use came after the team's funding.
    await expect(rows.nth(0)).toContainText(b.activity.types.usage_charge);
    await expect(rows.nth(1)).toContainText(b.activity.types.adjustment);
    await expect(rows.nth(1).locator('bdi').first()).toHaveText('+0.50$');
    // Charges are signed with a minus (U+2212) and neutral, credits green.
    const charge = rows.nth(0).locator('bdi').first();
    await expect(charge).toHaveText(/^−0\.\d+\$$/);
    await expect(
      rows.nth(1).locator('span.font-semibold.text-success'),
    ).toBeVisible();
    await expect(
      rows.nth(0).locator('span.font-semibold.text-success'),
    ).toHaveCount(0);
    // Each row has an icon, and a date like «اليوم 14:05».
    await expect(rows.nth(0).locator('svg').first()).toBeAttached();
    await expect(rows.nth(0)).toContainText(
      new RegExp(`${b.activity.today} \\d{2}:\\d{2}`),
    );
    if (!isMobile) {
      await expect(rows.nth(0)).toContainText(b.activity.balanceAfter);
    }
  });

  test('BA-03 every activity type has its label', async ({ page }) => {
    await createChatUser(page);
    const types = [
      'subscription_credit',
      'adjustment',
      'usage_charge',
      'purchase',
      'expiry',
      'refund',
      'voucher_credit',
    ] as const;
    await page.route(/\/me\/balance\/activity/, (route) =>
      route.fulfill({
        json: {
          items: types.map((type, i) =>
            entry(
              i + 1,
              type,
              type === 'usage_charge' || type === 'expiry'
                ? '-0.001500000'
                : '1.000000000',
            ),
          ),
          nextBefore: null,
        },
      }),
    );
    await page.goto('/balance');
    const rows = activityRows(page);
    await expect(rows).toHaveCount(types.length);
    for (const [i, type] of types.entries()) {
      await expect(rows.nth(i)).toContainText(b.activity.types[type]);
    }
    expect(b.activity.types.subscription_credit).toBe('رصيد الباقة');
    expect(b.activity.types.adjustment).toBe('تعديل من الفريق');
    expect(b.activity.types.usage_charge).toBe('استخدام المحادثة');
  });

  test('BA-04 after a chat message the balance page has a new usage row and the same amount as the chip', async ({
    page,
  }) => {
    const user = await createChatUser(page);
    await page.goto('/chat');
    await page
      .getByRole('textbox', { name: text.chat.composer.label })
      .fill('سؤال لتسجيل الاستخدام');
    await page.getByRole('button', { name: text.chat.composer.send }).click();
    await expect(page.getByRole('article').last()).toHaveAttribute(
      'data-state',
      'complete',
      { timeout: 30_000 },
    );
    await page.goto('/balance');
    await expect(
      activityRows(page).filter({ hasText: b.activity.types.usage_charge }),
    ).toHaveCount(1);
    // Same figure as the API (and so as the header chip).
    const api = await apiBalance(user.token);
    const shown = (await page.locator('p.text-5xl').textContent()) ?? '';
    // Same rule as the app: two decimals from 0.01 up, four below, rounded half up.
    const value = new Decimal(api);
    const places = value.abs().gte('0.01') ? 2 : 4;
    expect(shown).toBe(
      `${value.toDecimalPlaces(places, Decimal.ROUND_HALF_UP).toFixed(places)}$`,
    );
    if (await chip(page).isVisible()) {
      await expect(chip(page)).toContainText(shown);
    }
  });

  test('BA-05 more than 30 rows: older rows load while scrolling; a failed load has a retry button', async ({
    page,
  }) => {
    await createChatUser(page);
    const now = Date.now();
    const rows = (from: number, to: number) =>
      Array.from({ length: to - from }, (_, i) =>
        entry(
          from + i + 1,
          'usage_charge',
          '-0.001000000',
          new Date(now - (from + i) * 3_600_000).toISOString(),
        ),
      );
    const requested: (string | null)[] = [];
    let failNext = true;
    await page.route(/\/me\/balance\/activity/, async (route) => {
      const before = new URL(route.request().url()).searchParams.get('before');
      requested.push(before);
      if (!before) {
        return route.fulfill({
          json: { items: rows(0, 30), nextBefore: 30 },
        });
      }
      if (failNext) {
        failNext = false;
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            statusCode: 500,
            code: 'INTERNAL_ERROR',
            message: 'dev',
          }),
        });
      }
      return route.fulfill({ json: { items: rows(30, 36), nextBefore: null } });
    });
    await page.goto('/balance');
    await expect(activityRows(page)).toHaveCount(30);
    await activityRows(page).last().scrollIntoViewIfNeeded();
    await expect(page.getByText(b.activity.moreError)).toBeVisible();
    await expect(activityRows(page)).toHaveCount(30);
    await page.getByRole('button', { name: text.common.retry }).click();
    await expect(activityRows(page)).toHaveCount(36);
    expect(requested[0]).toBeNull();
    expect(requested.slice(1)).toEqual(['30', '30']);
  });

  test('BA-06 no plan: warning with contact button, empty activity', async ({
    page,
  }) => {
    await createNoPlanUser(page);
    await page.goto('/balance');
    await expect(page.getByText(b.noPlan)).toBeVisible();
    await expect(page.getByRole('button', { name: b.contactUs })).toBeVisible();
    await expect(page.getByText(b.activity.emptyTitle)).toBeVisible();
    await expect(page.getByText(b.activity.emptyBody)).toBeVisible();
  });

  test('BA-07 request-balance and contact buttons open the dialog; Escape returns focus', async ({
    page,
  }) => {
    await createChatUser(page);
    await page.goto('/balance');
    const request = page.getByRole('button', { name: b.request });
    // Keyboard open: Safari does not focus a button on click, so there is nothing to return to.
    await request.focus();
    await page.keyboard.press('Enter');
    await expect(requestDialog(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(requestDialog(page)).toBeHidden();
    await expect(request).toBeFocused();
  });

  test('BA-07 (no plan) the contact button opens the dialog; Escape returns focus', async ({
    page,
  }) => {
    await createNoPlanUser(page);
    await page.goto('/balance');
    const contact = page.getByRole('button', { name: b.contactUs });
    // Keyboard open: Safari does not focus a button on click, so there is nothing to return to.
    await contact.focus();
    await page.keyboard.press('Enter');
    await expect(requestDialog(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(contact).toBeFocused();
  });

  test('BA-08 phone width: amount and date only, no horizontal scroll', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'Phone-width layout.');
    const user = await createChatUser(page);
    await seedConversation(user.token, 'سؤال للجوال');
    await page.goto('/balance');
    await expect(activityRows(page)).toHaveCount(2);
    for (const row of await activityRows(page).all()) {
      await expect(row.getByText(b.activity.balanceAfter)).toBeHidden();
      await expect(row.locator('bdi').first()).toBeVisible();
    }
    await expectNoHorizontalScroll(page);
  });
});

test.describe('account', () => {
  test('AC-01 account page sections: profile, plan, password, session', async ({
    page,
  }) => {
    const user = await createChatUser(page, { fullName: 'سيف عمران' });
    await page.goto('/account');
    await expect(
      page.getByRole('heading', { name: a.title }).first(),
    ).toBeVisible();
    // Profile.
    await expect(
      page.getByRole('heading', { name: a.profile.title }),
    ).toBeVisible();
    await expect(
      page.getByLabel(text.auth.fields.fullName, { exact: true }),
    ).toHaveValue('سيف عمران');
    const phone = page.getByLabel(text.auth.fields.phone, { exact: true });
    await expect(phone).toHaveAttribute('dir', 'ltr');
    await expect(page.getByText(a.profile.optional)).toBeVisible();
    const email = page.locator('#account-email');
    await expect(email).toHaveValue(user.email);
    await expect(email).toHaveAttribute('readonly', '');
    await expect(page.getByText(a.profile.emailNote)).toBeVisible();
    // Plan.
    await expect(
      page.getByRole('heading', { name: a.plan.title }),
    ).toBeVisible();
    await expect(page.getByText('محادثة e2e', { exact: true })).toBeVisible();
    await expect(page.getByText(a.plan.start)).toBeVisible();
    await expect(page.getByText(a.plan.end)).toBeVisible();
    await expect(page.getByText(a.plan.free)).toBeVisible();
    const modes = page
      .getByRole('heading', { name: a.plan.modes })
      .locator('xpath=following-sibling::ul');
    await expect(modes).toContainText(CHAT_FAST_LABEL);
    await expect(modes).toContainText(CHAT_PRO_LABEL);
    // Password and session.
    await expect(
      page.getByRole('heading', { name: a.password.title }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: a.session.title }),
    ).toBeVisible();
  });

  test('AC-02 changing the name saves with a toast and updates the avatar initials without reload', async ({
    page,
    isMobile,
  }) => {
    await createChatUser(page, { fullName: 'سيف عمران' });
    await page.goto('/account');
    const name = page.getByLabel(text.auth.fields.fullName, { exact: true });
    await name.fill('خالد يوسف');
    await page
      .getByRole('button', { name: a.profile.save, exact: true })
      .click();
    await expect(page.getByText(a.profile.saved).last()).toBeVisible();
    if (!isMobile) {
      await expect(
        page.getByRole('button', { name: text.shell.accountMenu }),
      ).toContainText('خي');
    }
  });

  test('AC-03 an empty name is refused and nothing is saved', async ({
    page,
  }) => {
    await createChatUser(page, { fullName: 'سيف عمران' });
    const saves: string[] = [];
    page.on('request', (req) => {
      if (req.method() === 'PATCH' && req.url().endsWith('/api/v1/me'))
        saves.push(req.url());
    });
    await page.goto('/account');
    await page.getByLabel(text.auth.fields.fullName, { exact: true }).fill('');
    await page
      .getByRole('button', { name: a.profile.save, exact: true })
      .click();
    await expect(
      page.getByText(text.auth.validation.nameRequired),
    ).toBeVisible();
    await page.waitForTimeout(400);
    expect(saves).toEqual([]);
  });

  test('AC-04 an empty phone saves as empty; an invalid phone is a field error', async ({
    page,
  }) => {
    const user = await createChatUser(page);
    await page.goto('/account');
    const phone = page.getByLabel(text.auth.fields.phone, { exact: true });
    await phone.fill('+966501234567');
    await page
      .getByRole('button', { name: a.profile.save, exact: true })
      .click();
    await expect(page.getByText(a.profile.saved).last()).toBeVisible();

    await phone.fill('');
    await page
      .getByRole('button', { name: a.profile.save, exact: true })
      .click();
    await expect(page.getByText(a.profile.saved).last()).toBeVisible();
    const me = (await (
      await fetch(`${API}/api/v1/me`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
    ).json()) as { phoneNumber: string | null };
    expect(me.phoneNumber ?? '').toBe('');

    await phone.fill('abc');
    await page
      .getByRole('button', { name: a.profile.save, exact: true })
      .click();
    await expect(
      page.getByText(text.auth.validation.phoneInvalid),
    ).toBeVisible();
  });

  test('AC-05 password change: mismatch, too short and same-as-current are refused, nothing changes', async ({
    page,
  }) => {
    const user = await createChatUser(page);
    await page.goto('/account');
    const fresh = page.getByLabel(text.auth.fields.newPassword, {
      exact: true,
    });
    const confirm = page.getByLabel(text.auth.fields.confirmPassword, {
      exact: true,
    });
    const save = page.getByRole('button', {
      name: a.password.save,
      exact: true,
    });

    await fresh.fill('another-pass-1');
    await confirm.fill('different-pass-2');
    await save.click();
    await expect(
      page.getByText(text.auth.validation.passwordMismatch),
    ).toBeVisible();

    await fresh.fill('1234');
    await confirm.fill('1234');
    await save.click();
    await expect(
      page.getByText(text.auth.validation.passwordTooShort),
    ).toBeVisible();

    await fresh.fill(user.password);
    await confirm.fill(user.password);
    await save.click();
    await expect(page.getByText(text.authErrors.samePassword)).toBeVisible();

    // Still the old password.
    await expect(gotrueToken(user.email, user.password)).resolves.toBeTruthy();
  });

  test('AC-06 a valid password change keeps you signed in; only the new password signs in afterwards', async ({
    page,
  }) => {
    const user = await createChatUser(page);
    await page.goto('/account');
    const next = 'brand-new-pass-7';
    await page
      .getByLabel(text.auth.fields.newPassword, { exact: true })
      .fill(next);
    await page
      .getByLabel(text.auth.fields.confirmPassword, { exact: true })
      .fill(next);
    await page
      .getByRole('button', { name: a.password.save, exact: true })
      .click();
    await expect(page.getByText(a.password.saved)).toBeVisible();
    await expect(page).toHaveURL(/\/account$/);

    await signOutViaUi(page);
    await expect(gotrueToken(user.email, user.password)).rejects.toThrow();
    await signIn(page, user.email, next);
    await expect(page).toHaveURL(/\/chat/);
  });

  test('AC-07 the session card signs you out to the sign-in page', async ({
    page,
  }) => {
    await createChatUser(page);
    await page.goto('/account');
    await page.getByRole('button', { name: a.session.signOut }).click();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('AC-08 no plan: the plan card shows the notice and the contact dialog', async ({
    page,
  }) => {
    await createNoPlanUser(page);
    await page.goto('/account');
    await expect(page.getByText(a.plan.noPlan)).toBeVisible();
    await page.getByRole('button', { name: a.plan.contact }).click();
    await expect(requestDialog(page)).toBeVisible();
  });

  test('AC-09 phone width: profile, plan, password, session in that order', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'Phone-width layout.');
    await createChatUser(page);
    await page.goto('/account');
    const top = async (title: string) =>
      (await page.getByRole('heading', { name: title }).boundingBox())!.y;
    const ys = [
      await top(a.profile.title),
      await top(a.plan.title),
      await top(a.password.title),
      await top(a.session.title),
    ];
    expect(ys).toEqual([...ys].sort((x, y) => x - y));
    await expectNoHorizontalScroll(page);
  });
});

interface PublicPlan {
  key: string;
  nameAr: string;
  descriptionAr: string;
  monthlyPriceUsd: string;
  includedBalanceUsd: string;
  modes: { labelAr: string; descriptionAr: string }[];
}

async function publicPlans(): Promise<PublicPlan[]> {
  return (await (await fetch(`${API}/api/v1/plans`)).json()) as PublicPlan[];
}

const isZero = (v: string) => /^0+(\.0+)?$/.test(v);

test.describe('plans', () => {
  test('PL-01 signed out: public header, plan cards from the backend, expiry note, contact dialog', async ({
    page,
  }) => {
    const plans = await publicPlans();
    await page.goto('/plans');
    await expect(
      page.getByRole('heading', { name: text.plans.title, level: 1 }),
    ).toBeVisible();
    const header = page.getByRole('banner');
    await expect(
      header.getByRole('link', { name: text.auth.signIn.title }),
    ).toBeVisible();
    await expect(
      header.getByRole('link', { name: text.auth.signUp.title }),
    ).toBeVisible();
    const cards = page.getByRole('article');
    await expect(cards).toHaveCount(plans.length);
    for (const plan of plans) {
      const card = cards.filter({
        has: page.getByRole('heading', { name: plan.nameAr, exact: true }),
      });
      await expect(card).toBeVisible();
      await expect(card).toContainText(plan.descriptionAr);
      if (isZero(plan.monthlyPriceUsd)) {
        await expect(card).toContainText(text.plans.free);
      } else {
        await expect(card.locator('bdi').first()).toBeVisible();
      }
      for (const mode of plan.modes) {
        await expect(card).toContainText(mode.labelAr);
        await expect(card).toContainText(mode.descriptionAr);
      }
      await expect(card).toContainText(text.plans.duration);
    }
    await page
      .getByRole('button', { name: text.plans.subscribe })
      .first()
      .click();
    await expect(requestDialog(page)).toBeVisible();
  });

  test('PL-02 a plan with no included balance has no «الرصيد الحالي» line', async ({
    page,
  }) => {
    const plans = await publicPlans();
    await page.goto('/plans');
    const cards = page.getByRole('article');
    await expect(cards).toHaveCount(plans.length);
    for (const plan of plans) {
      const card = cards.filter({
        has: page.getByRole('heading', { name: plan.nameAr, exact: true }),
      });
      const line = card.getByText(text.plans.currentBalance);
      if (isZero(plan.includedBalanceUsd)) await expect(line).toHaveCount(0);
      else await expect(line).toBeVisible();
    }
    expect(plans.some((p) => isZero(p.includedBalanceUsd))).toBe(true);
  });

  test("PL-03 signed in: page inside the app shell and the user's plan is marked", async ({
    page,
    isMobile,
  }) => {
    // The default free plan is public, so it shows in the list.
    await createFundedUser(page, 'e2e-plans');
    const plans = await publicPlans();
    const free = plans.find((p) => isZero(p.monthlyPriceUsd))!;
    await page.goto('/plans');
    await expect(
      isMobile
        ? page.getByRole('button', { name: text.shell.openMenu })
        : page.getByRole('complementary', { name: text.shell.sidebarTitle }),
    ).toBeVisible();
    const marked = page.getByText(text.plans.current);
    await expect(marked).toHaveCount(1);
    const card = page.getByRole('article').filter({
      has: page.getByRole('heading', { name: free.nameAr, exact: true }),
    });
    await expect(card.getByText(text.plans.current)).toBeVisible();
  });

  test('PL-04 no subscription: no plan is marked as current', async ({
    page,
  }) => {
    await createNoPlanUser(page);
    await page.goto('/plans');
    await expect(page.getByRole('article').first()).toBeVisible();
    await expect(page.getByText(text.plans.current)).toHaveCount(0);
  });

  test('PL-05 the plans page is prerendered: its content is in the built HTML', async () => {
    const file = resolve(process.cwd(), 'dist/client/plans/index.html');
    test.skip(!existsSync(file), 'Needs `npm run build` (dist/client/plans).');
    const html = readFileSync(file, 'utf8');
    expect(html).toContain(text.plans.title);
    expect(html).toContain(text.plans.intro.slice(0, 20));
  });
});
