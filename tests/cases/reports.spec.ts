import { expect, test, type Browser, type Page } from '@playwright/test';
import {
  ADMIN_SKIP_MESSAGE,
  CHAT_FAST_LABEL,
  SKIP_MESSAGE,
  adjustBalance,
  adminContext,
  adminCredentials,
  createChatUser,
  createFundedUser,
  expectAccessibleRtl,
  expectNoHorizontalScroll,
  fillStable,
  seedConversation,
  stackReachable,
  text,
} from '../support';

// MANUAL_TEST_CASES.md §3e (F9 reports), one test per case ID. Usage comes from
// real messages on the backend's free mock model; the admin is the account from
// adminCredentials(), signed in through storage so its password never reaches a trace.
//
// Left manual: RP-20 (the numbers in the chart match the database, a judgement
// over shared local data) and RP-21 (screen reader).

let stackUp = false;
test.beforeAll(async () => {
  stackUp = await stackReachable();
});
test.beforeEach(() => {
  test.skip(!stackUp, SKIP_MESSAGE);
  test.skip(!adminCredentials(), ADMIN_SKIP_MESSAGE);
});

const r = text.admin.reports;
const p = text.reports;
const u = text.usage;

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

/** A user with one real answered message, so every report has data for today. */
async function userWithUsage(page: Page) {
  const user = await createChatUser(page, { prefix: 'e2e-report' });
  await seedConversation(user.token, 'رسالة لتقرير الاستهلاك');
  return user;
}

/** The app scrolls inside `main`, so the document check alone misses a wide page. */
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

const plot = (page: Page) => page.getByTestId('daily-chart-plot').first();
const scroller = (page: Page) =>
  page.getByTestId('daily-chart-scroller').first();
const preset = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true });
const visible = (page: Page, name: string) =>
  page.getByRole('button', { name }).locator('visible=true').first();

test.describe('admin overview', () => {
  test('RP-01 /admin opens the overview with its cards and attention links', async ({
    browser,
  }) => {
    await asAdmin(browser, async (admin) => {
      await admin.goto('/admin');
      await expect(admin).toHaveURL(/\/admin\/overview/);
      await expect(
        admin.getByRole('heading', { name: r.overview.attention.title }),
      ).toBeVisible();
      for (const title of [
        r.overview.money.charged,
        r.overview.money.cost,
        r.overview.money.absorbed,
        r.overview.users.title,
        r.overview.plans.title,
        r.overview.images.title,
      ]) {
        await expect(
          admin.getByRole('heading', { name: title, exact: true }),
        ).toBeVisible();
      }
      await admin
        .getByRole('link', { name: r.overview.attention.flaggedLink })
        .click();
      await expect(admin).toHaveURL(/\/admin\/requests/);
    });
  });

  test('RP-02 presets and a custom range live in the URL and survive a reload', async ({
    browser,
  }) => {
    await asAdmin(browser, async (admin) => {
      await admin.goto('/admin/overview');
      await expect(preset(admin, p.period.last30)).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await preset(admin, p.period.last7).click();
      await expect(admin).toHaveURL(/days=7/);
      await expect(
        admin.locator('p', {
          hasText: p.period.days_few.replace('{{count}}', '7'),
        }),
      ).toBeVisible();

      await preset(admin, p.period.custom).click();
      const from = admin.getByLabel(p.period.from, { exact: true });
      const to = admin.getByLabel(p.period.to, { exact: true });
      // Refilled from the 7 days just shown, not empty.
      await expect(from).toHaveValue(/^\d{4}-\d{2}-\d{2}$/);
      const end = await to.inputValue();
      await expect(from).toHaveAttribute('dir', 'ltr');

      await fillStable(from, end);
      await admin.getByRole('button', { name: p.period.apply }).click();
      await expect(admin).toHaveURL(new RegExp(`from=${end}&to=${end}`));
      await admin.reload();
      await expect(
        admin.getByLabel(p.period.from, { exact: true }),
      ).toHaveValue(end);
      await expect(
        admin.getByText(p.period.days_one, { exact: false }),
      ).toBeVisible();
    });
  });

  test('RP-03 a bad range shows its error, keeps Apply off and converts Arabic digits', async ({
    browser,
  }) => {
    await asAdmin(browser, async (admin) => {
      await admin.goto('/admin/overview');
      await preset(admin, p.period.custom).click();
      const from = admin.getByLabel(p.period.from, { exact: true });
      const to = admin.getByLabel(p.period.to, { exact: true });
      const apply = admin.getByRole('button', { name: p.period.apply });

      await fillStable(to, '2026-01-01');
      await from.fill('2026-02-01');
      await expect(
        admin.getByText(p.period.errors.startAfterEnd),
      ).toBeVisible();
      await expect(apply).toBeDisabled();

      await from.fill('2024-01-01');
      await expect(admin.getByText(p.period.errors.tooLong)).toBeVisible();
      await expect(apply).toBeDisabled();

      await from.fill('٢٠٢٥-١٢-٣١');
      await expect(from).toHaveValue('2025-12-31');
      await expect(apply).toBeEnabled();
    });
  });

  test('RP-04 the chart runs right to left, shows its axis, switches view and opens as a table', async ({
    browser,
    page,
  }) => {
    await userWithUsage(page);
    await asAdmin(browser, async (admin) => {
      await admin.goto('/admin/overview?days=30');
      await expect(plot(admin)).toBeVisible();

      // First day on the right: ticks are drawn oldest first, so x falls.
      const xs = await plot(admin)
        .locator('.recharts-xAxis-tick-labels text')
        .evaluateAll((nodes) =>
          nodes.map((n) => n.getBoundingClientRect().left),
        );
      expect(xs.length).toBeGreaterThan(2);
      expect(xs).toEqual([...xs].sort((a, b) => b - a));

      // Y axis numbers exist and stay inside their column.
      const axis = admin.getByTestId('daily-chart-axis').first();
      const inside = await axis.evaluate((box) => {
        const edge = box.getBoundingClientRect();
        const ticks = [
          ...box.querySelectorAll('.recharts-yAxis-tick-labels text'),
        ];
        return {
          count: ticks.length,
          fits: ticks.every((t) => {
            const b = t.getBoundingClientRect();
            return (
              b.width > 0 &&
              b.left >= edge.left - 1 &&
              b.right <= edge.right + 1
            );
          }),
        };
      });
      expect(inside.count).toBeGreaterThan(1);
      expect(inside.fits).toBe(true);

      await admin
        .getByRole('button', {
          name: r.overview.chart.views.requests,
          exact: true,
        })
        .click();
      await expect(
        admin.getByRole('heading', { name: r.overview.chart.titles.requests }),
      ).toBeVisible();

      await admin
        .getByRole('button', { name: p.chart.showTable })
        .first()
        .click();
      await expect(
        admin
          .getByRole('region', { name: r.overview.chart.titles.requests })
          .getByRole('columnheader', {
            name: r.overview.chart.series.requests,
          }),
      ).toBeVisible();
      await expect(plot(admin)).toHaveCount(0);
      await admin
        .getByRole('button', { name: p.chart.showChart })
        .first()
        .click();
      await expect(plot(admin)).toBeVisible();
    });
  });

  test('RP-05 the margin percent reads left to right, number before the sign', async ({
    browser,
    page,
  }) => {
    await userWithUsage(page);
    await asAdmin(browser, async (admin) => {
      await admin.goto('/admin/overview?days=30');
      const line = admin
        .locator('p', { hasText: r.overview.money.marginPercent })
        .first();
      await expect(line).toBeVisible();
      await expect(line.locator('bdi[dir="ltr"]')).toHaveText(
        /^−?\d+(\.\d+)?%$/,
      );
    });
  });

  test('RP-06 no sideways page scroll, and a phone chart opens at today', async ({
    browser,
    isMobile,
    page,
  }) => {
    await userWithUsage(page);
    await asAdmin(browser, async (admin) => {
      await admin.goto('/admin/overview?days=30');
      await expect(plot(admin)).toBeVisible();
      await expectPageFits(admin);
      if (isMobile) {
        await expect
          .poll(() =>
            scroller(admin).evaluate(
              (n) => n.scrollWidth + n.scrollLeft - n.clientWidth,
            ),
          )
          .toBeLessThanOrEqual(1);
        expect(
          await scroller(admin).evaluate((n) => n.scrollWidth > n.clientWidth),
        ).toBe(true);
      }
    });
  });
});

test.describe('flagged requests and audit', () => {
  test('RP-07 requests open on flagged; the filter is in the URL; «الكل» shows the user', async ({
    browser,
    page,
  }) => {
    await userWithUsage(page);
    await asAdmin(browser, async (admin) => {
      await admin.goto('/admin/requests');
      await expect(admin.getByText(r.requests.note)).toBeVisible();
      await expect(
        preset(admin, r.requests.chips.reconciliation_required),
      ).toHaveAttribute('aria-pressed', 'true');

      await preset(admin, r.requests.chips.settled).click();
      await expect(admin).toHaveURL(/status=settled/);
      await expect(
        admin
          .getByText(r.requests.status.settled, { exact: true })
          .locator('visible=true')
          .nth(1),
      ).toBeVisible();

      await preset(admin, r.requests.chips.all).click();
      await expect(preset(admin, r.requests.chips.all)).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await expectPageFits(admin);
    });
  });

  test('RP-08 audit filters by URL, a row expands to LTR values, and clear resets', async ({
    browser,
    page,
  }) => {
    const user = await createChatUser(page, { prefix: 'e2e-audit' });
    const reason = `e2e audit ${Date.now()}`;
    expect(
      (await adjustBalance(user.userId, '0.25', reason)).status,
    ).toBeLessThan(300);
    await asAdmin(browser, async (admin) => {
      await admin.goto('/admin/audit');
      const filters = admin.getByRole('form', { name: r.audit.filters.label });
      await filters
        .getByLabel(r.audit.filters.resourceId, { exact: true })
        .fill(user.userId);
      await filters
        .getByLabel(r.audit.filters.action, { exact: true })
        .fill('balance.adjusted');
      await filters
        .getByRole('button', { name: r.audit.filters.apply })
        .click();
      await expect(admin).toHaveURL(new RegExp(`resourceId=${user.userId}`));

      await expect(admin.getByText(reason).locator('visible=true')).toHaveCount(
        1,
      );
      const expand = visible(admin, `${r.audit.expand}: balance.adjusted`);
      await expand.click();
      await expect(
        admin.getByText(r.audit.newValue).locator('visible=true').first(),
      ).toBeVisible();
      await expect(
        admin.locator('pre[dir="ltr"]').locator('visible=true').first(),
      ).toBeVisible();

      await filters
        .getByRole('button', { name: r.audit.filters.clear })
        .click();
      await expect(admin).not.toHaveURL(/resourceId=/);
    });
  });

  test('RP-09 audit refuses a bad admin id and a bad date, and sends nothing', async ({
    browser,
  }) => {
    await asAdmin(browser, async (admin) => {
      await admin.goto('/admin/audit');
      const filters = admin.getByRole('form', { name: r.audit.filters.label });
      await expect(filters.getByText(r.audit.filters.datesHint)).toBeVisible();
      await filters
        .getByLabel(r.audit.filters.actorId, { exact: true })
        .fill('not-a-uuid');
      const from = filters.getByLabel(p.period.from, { exact: true });
      await from.fill('٢٠٢٦');
      await expect(from).toHaveValue('2026');
      await filters
        .getByRole('button', { name: r.audit.filters.apply })
        .click();
      await expect(admin.getByText(r.audit.errors.actorId)).toBeVisible();
      await expect(admin.getByText(p.period.errors.invalid)).toBeVisible();
      await expect(admin).not.toHaveURL(/actorId=/);
    });
  });

  test('RP-10 the user Usage tab shows totals, the mode and the recent request', async ({
    browser,
    page,
  }) => {
    const user = await userWithUsage(page);
    await asAdmin(browser, async (admin) => {
      await admin.goto(`/admin/users/${user.userId}?tab=usage`);
      await expect(
        admin.getByText(r.usage.totals.charged, { exact: true }).first(),
      ).toBeVisible();
      await expect(
        admin.getByText(CHAT_FAST_LABEL).locator('visible=true').first(),
      ).toBeVisible();
      await expect(admin.getByText(r.usage.recent)).toBeVisible();
      await expect(admin.getByText(r.usage.recentNote)).toBeVisible();
      await expect(
        admin
          .getByText(r.requests.status.settled, { exact: true })
          .locator('visible=true')
          .first(),
      ).toBeVisible();
      await expectPageFits(admin);
    });
  });

  test('RP-11 a normal user gets not-found on every report page', async ({
    page,
  }) => {
    await createChatUser(page, { prefix: 'e2e-report-denied' });
    for (const path of ['/admin/overview', '/admin/requests', '/admin/audit']) {
      await page.goto(path);
      await expect(page.getByText(text.common.notFound).first()).toBeVisible();
    }
  });
});

test.describe('my usage', () => {
  test('RP-12 shows the month, by-mode label and chart, and never a provider or model name', async ({
    page,
  }) => {
    await userWithUsage(page);
    await page.goto('/usage');
    await expect(page.getByRole('heading', { name: u.title })).toBeVisible();
    await expect(page.getByText(u.utcNote)).toBeVisible();
    await expect(page.locator('dd').first()).toHaveText('1');
    await expect(
      page.getByRole('heading', { name: u.byMode.title }),
    ).toBeVisible();
    await expect(page.getByText(CHAT_FAST_LABEL).first()).toBeVisible();
    await expect(plot(page)).toBeVisible();
    await expect(page.locator('main')).not.toContainText(
      /mock|gemini|openai|anthropic/i,
    );
    await expectPageFits(page);
  });

  test('RP-13 the phone chart opens at today', async ({ isMobile, page }) => {
    test.skip(!isMobile, 'Phone-width behaviour');
    await userWithUsage(page);
    // A full month's width: a real user early in a month would not scroll at all.
    await page.route('**/api/v1/me/usage*', async (route) => {
      const response = await route.fetch();
      const body = (await response.json()) as {
        month: string;
        byDay: { date: string; messages: number; chargedUsd: string }[];
      };
      const byDay = Array.from({ length: 28 }, (_, i) => ({
        date: `${body.month}-${String(i + 1).padStart(2, '0')}`,
        messages: (i % 5) + 1,
        chargedUsd: `0.${String((i % 9) + 1).padStart(2, '0')}0000000`,
      }));
      await route.fulfill({ response, json: { ...body, byDay } });
    });
    await page.goto('/usage');
    await expect(plot(page)).toBeVisible();
    await expectPageFits(page);
    await expect
      .poll(() =>
        scroller(page).evaluate(
          (n) => n.scrollWidth + n.scrollLeft - n.clientWidth,
        ),
      )
      .toBeLessThanOrEqual(1);
  });

  test('RP-14 an empty current month offers a new chat', async ({ page }) => {
    await createFundedUser(page, 'e2e-usage-empty');
    await page.goto('/usage');
    await expect(page.getByText(u.empty.title)).toBeVisible();
    await page
      .locator('main')
      .getByRole('link', { name: text.shell.newChat })
      .click();
    await expect(page).toHaveURL(/\/chat/);
  });

  test('RP-15 an empty past month offers no action', async ({ page }) => {
    await createFundedUser(page, 'e2e-usage-past');
    await page.goto('/usage?month=2026-01');
    await expect(page.getByText(u.empty.title)).toBeVisible();
    await expect(
      page.locator('main').getByRole('link', { name: text.shell.newChat }),
    ).toHaveCount(0);
  });

  test('RP-16 the month picker stops at the account month and today, and returns focus', async ({
    page,
  }) => {
    await createFundedUser(page, 'e2e-usage-month');
    await page.goto('/usage');
    await expect(
      page.getByRole('button', { name: p.month.previous }),
    ).toBeDisabled();
    await expect(
      page.getByRole('button', { name: p.month.next }),
    ).toBeDisabled();
    const trigger = page.locator('button[aria-haspopup="listbox"]');
    await trigger.click();
    await expect(page.getByRole('option')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('RP-17 a failed load offers retry and recovers', async ({ page }) => {
    await createFundedUser(page, 'e2e-usage-error');
    await page.route('**/api/v1/me/usage*', (route) => route.abort());
    await page.goto('/usage');
    await expect(page.getByText(u.error)).toBeVisible({ timeout: 30_000 });
    await page.unroute('**/api/v1/me/usage*');
    await page.getByRole('button', { name: text.common.retry }).click();
    await expect(page.getByText(u.empty.title)).toBeVisible();
  });

  test('RP-18 reached from the balance page and the account menu, not the chat sidebar list', async ({
    isMobile,
    page,
  }) => {
    await createFundedUser(page, 'e2e-usage-links');
    await page.goto('/balance');
    await page.getByRole('link', { name: text.balance.viewUsage }).click();
    await expect(page).toHaveURL(/\/usage/);
    await expect(page.getByRole('heading', { name: u.title })).toBeVisible();
    // Firefox aborts a goto() issued while the previous page is still loading.
    await page.waitForLoadState('networkidle').catch(() => undefined);

    await page.goto('/chat');
    if (isMobile) {
      await page.getByRole('button', { name: text.shell.openMenu }).click();
      await page.getByRole('link', { name: text.shell.usage }).click();
    } else {
      await page.getByRole('button', { name: text.shell.accountMenu }).click();
      await page.getByRole('menuitem', { name: text.shell.usage }).click();
    }
    await expect(page).toHaveURL(/\/usage/);
  });
});

test.describe('accessibility', () => {
  test('RP-19 report pages are RTL with no serious axe violations', async ({
    browser,
    page,
  }) => {
    await userWithUsage(page);
    await page.goto('/usage');
    await expect(plot(page)).toBeVisible();
    await expectAccessibleRtl(page);
    await asAdmin(browser, async (admin) => {
      for (const path of [
        '/admin/overview?days=30',
        '/admin/requests',
        '/admin/audit',
      ]) {
        await admin.goto(path);
        await admin.waitForLoadState('networkidle');
        await expectAccessibleRtl(admin);
      }
    });
  });
});
