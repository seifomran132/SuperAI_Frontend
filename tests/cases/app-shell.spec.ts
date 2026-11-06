import { expect, test, type Page } from '@playwright/test';
import errors from '../../src/i18n/errors.ar.json' with { type: 'json' };
import {
  SKIP_MESSAGE,
  apiCreateConversation,
  createChatUser,
  createConfirmedUser,
  expectNoHorizontalScroll,
  seedConversation,
  signIn,
  signOutViaUi,
  signedInContext,
  stackReachable,
  text,
} from '../support';

// MANUAL_TEST_CASES.md §2 (app shell, sidebar and menus), one test per case ID.
// Everything here uses the real stack; the conversation list is route-mocked
// only where the case needs 20+ rows (SH-15) or a failing API (SH-16).
// Left manual: none. Widths: phone-only cases (drawer) run on the two phone
// projects, desktop-only cases (sidebar, avatar menu) on the three desktop ones.

let stackUp = false;
test.beforeAll(async () => {
  stackUp = await stackReachable();
});
test.beforeEach(() => {
  test.skip(!stackUp, SKIP_MESSAGE);
});

const t = text.shell;

const drawer = (page: Page) =>
  page.getByRole('dialog', { name: t.sidebarTitle });
const opener = (page: Page) => page.getByRole('button', { name: t.openMenu });
const chip = (page: Page) => page.locator('[data-slot="balance-chip"]');

/** The element holding the conversation list: the drawer on phones, the sidebar otherwise. */
async function openSidebar(page: Page, isMobile: boolean) {
  if (isMobile) {
    await opener(page).click();
    const d = drawer(page);
    await expect(d).toBeVisible();
    return d;
  }
  return page.getByRole('complementary', { name: t.sidebarTitle });
}

const conversationsList = (url: URL) =>
  url.pathname === '/api/v1/conversations';

test.describe('2.1 layout', () => {
  test('SH-01 desktop: sidebar on the right (~280px), chat left, header with chip and avatar', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'The fixed sidebar is a desktop layout.');
    await createChatUser(page);
    await page.goto('/chat');
    const aside = page.getByRole('complementary', { name: t.sidebarTitle });
    await expect(aside).toBeVisible();
    const viewport = page.viewportSize()!;
    const a = (await aside.boundingBox())!;
    const m = (await page.getByRole('main').boundingBox())!;
    expect(a.x).toBeGreaterThan(m.x); // sidebar sits to the right of the chat
    expect(a.x + a.width).toBeGreaterThan(viewport.width - 2);
    expect(a.width).toBeGreaterThan(270);
    expect(a.width).toBeLessThan(290);

    const header = page.getByRole('banner');
    await expect(chip(page)).toBeVisible();
    await expect(
      header.getByRole('button', { name: t.accountMenu }),
    ).toBeVisible();
    // No title on a new chat.
    await expect(header.getByRole('heading')).toHaveCount(0);
  });

  test('SH-02 no sidebar below 1024px: a menu button at the top right, no horizontal scroll', async ({
    page,
    isMobile,
  }) => {
    await createChatUser(page);
    await page.goto('/chat');
    const widths = isMobile ? [null] : [800, 390];
    for (const width of widths) {
      if (width) await page.setViewportSize({ width, height: 800 });
      await expect(opener(page)).toBeVisible();
      await expect(
        page.getByRole('complementary', { name: t.sidebarTitle }),
      ).toBeHidden();
      const box = (await opener(page).boundingBox())!;
      const viewport = page.viewportSize()!;
      expect(box.x + box.width / 2).toBeGreaterThan(viewport.width / 2);
      await expectNoHorizontalScroll(page);
    }
  });

  test('SH-03 menu button opens a right-hand drawer with the full menu', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'The drawer is the phone layout.');
    await createChatUser(page);
    await page.goto('/chat');
    await opener(page).click();
    const d = drawer(page);
    await expect(d).toBeVisible();
    await expect(d.getByRole('link', { name: t.newChat })).toBeVisible();
    await expect(d.getByRole('navigation', { name: t.recent })).toBeVisible();
    await expect(d.getByRole('link', { name: t.balance })).toBeVisible();
    await expect(d.getByRole('link', { name: t.account })).toBeVisible();
    await expect(d.getByRole('button', { name: t.signOut })).toBeVisible();
    const box = (await d.boundingBox())!;
    expect(box.x + box.width).toBeGreaterThan(page.viewportSize()!.width - 2);
    // The page behind is dimmed by an overlay that covers the viewport.
    const overlay = page.locator('[data-state="open"].fixed.inset-0');
    await expect(overlay).toBeVisible();
  });

  test('SH-04 closing the drawer (button, Escape, tap outside) returns focus to the menu button', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'The drawer is the phone layout.');
    await createChatUser(page);
    await page.goto('/chat');
    const close = {
      button: () => page.getByRole('button', { name: t.closeMenu }).click(),
      escape: () => page.keyboard.press('Escape'),
      outside: () => page.mouse.click(8, 300),
    };
    for (const how of Object.values(close)) {
      await opener(page).click();
      await expect(drawer(page)).toBeVisible();
      await how();
      await expect(drawer(page)).toBeHidden();
      await expect(opener(page)).toBeFocused();
    }
  });

  test('SH-05 widening past 1024px closes the drawer and shows the fixed sidebar', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Needs a window that can be widened.');
    await createChatUser(page);
    await page.setViewportSize({ width: 800, height: 800 });
    await page.goto('/chat');
    await opener(page).click();
    await expect(drawer(page)).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(drawer(page)).toBeHidden();
    await expect(
      page.getByRole('complementary', { name: t.sidebarTitle }),
    ).toBeVisible();
  });

  test('SH-06 a conversation in the drawer opens and closes it; empty space and retry keep it open', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'The drawer is the phone layout.');
    const user = await createChatUser(page);
    const title = `سؤال الدرج ${Date.now()}`;
    const id = await seedConversation(user.token, title);

    // The list fails first, so the drawer shows the retry button.
    let failList = true;
    await page.route(
      (url) => conversationsList(url),
      (route) =>
        failList && route.request().method() === 'GET'
          ? route.abort('connectionreset')
          : route.fallback(),
    );
    await page.goto('/chat');
    await opener(page).click();
    const d = drawer(page);
    await expect(d.getByText(t.list.error)).toBeVisible();
    // Tapping empty space (the section heading) keeps it open.
    await d.getByRole('heading', { name: t.recent }).click();
    await expect(d).toBeVisible();
    // Retry keeps it open and loads the list.
    failList = false;
    await d.getByRole('button', { name: text.common.retry }).click();
    await expect(d).toBeVisible();
    const row = d.getByRole('link', { name: new RegExp(title) });
    await expect(row).toBeVisible();
    // Choosing a conversation opens it and closes the drawer.
    await row.click();
    await expect(page).toHaveURL(new RegExp(`/chat/${id}$`));
    await expect(d).toBeHidden();
  });
});

test.describe('2.2 account menu and balance chip', () => {
  test('SH-07 avatar initials: first letters of the first and last name', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'The avatar button is in the desktop header.');
    // «سيف عمران» → «سع»
    await createChatUser(page, { fullName: 'سيف عمران' });
    await page.goto('/chat');
    await expect(
      page.getByRole('button', { name: t.accountMenu }),
    ).toContainText('سع');
  });

  test('SH-08 account menu: contents, arrow keys, Escape returns focus; opens by click and Enter', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'The avatar menu is the desktop header.');
    const user = await createChatUser(page, { fullName: 'سيف عمران' });
    await page.goto('/chat');
    const trigger = page.getByRole('button', { name: t.accountMenu });
    await expect(chip(page)).toBeVisible();

    // By click.
    await trigger.click();
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await expect(menu.getByText('سيف عمران')).toBeVisible();
    await expect(menu.getByText(user.email)).toBeVisible();
    await expect(
      menu.getByRole('menuitem', { name: new RegExp(`${t.balance}.*0\\.50`) }),
    ).toBeVisible();
    await expect(menu.getByRole('menuitem', { name: t.account })).toBeVisible();
    await expect(menu.getByRole('menuitem', { name: t.signOut })).toBeVisible();
    // Arrow keys move between items.
    const items = menu.getByRole('menuitem');
    await page.keyboard.press('ArrowDown');
    const first = await page.evaluate(
      () => document.activeElement?.textContent,
    );
    await page.keyboard.press('ArrowDown');
    const second = await page.evaluate(
      () => document.activeElement?.textContent,
    );
    expect(second).not.toBe(first);
    expect(await items.count()).toBeGreaterThanOrEqual(3);
    // Escape closes and returns focus.
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();

    // By keyboard Enter.
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu')).toBeVisible();
  });

  test('SH-09 balance and account links (menu and sidebar) open their pages; the active link is marked', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'The avatar menu is the desktop header.');
    await createChatUser(page);
    await page.goto('/chat');
    const aside = page.getByRole('complementary', { name: t.sidebarTitle });

    // From the menu.
    await page.getByRole('button', { name: t.accountMenu }).click();
    await page.getByRole('menuitem', { name: new RegExp(t.balance) }).click();
    await expect(page).toHaveURL(/\/balance$/);
    await page.getByRole('button', { name: t.accountMenu }).click();
    await page.getByRole('menuitem', { name: t.account }).click();
    await expect(page).toHaveURL(/\/account$/);

    // From the sidebar, and the current page's link is marked.
    await aside.getByRole('link', { name: t.balance }).click();
    await expect(page).toHaveURL(/\/balance$/);
    const balanceLink = aside.getByRole('link', { name: t.balance });
    const accountLink = aside.getByRole('link', { name: t.account });
    await expect(balanceLink).toHaveAttribute('aria-current', 'page');
    await expect(accountLink).not.toHaveAttribute('aria-current', 'page');
    // "Highlighted" must be visible, not only exposed to assistive tech.
    const background = (l: typeof balanceLink) =>
      l.evaluate((el) => getComputedStyle(el).backgroundColor);
    const weight = (l: typeof balanceLink) =>
      l.evaluate((el) => getComputedStyle(el).fontWeight);
    const active = [await background(balanceLink), await weight(balanceLink)];
    const idle = [await background(accountLink), await weight(accountLink)];
    expect(active).not.toEqual(idle);

    await accountLink.click();
    await expect(page).toHaveURL(/\/account$/);
    await expect(accountLink).toHaveAttribute('aria-current', 'page');
  });

  test('SH-10 sign out (menu / drawer) lands on sign-in and shows nothing of the previous user', async ({
    page,
    browser,
    isMobile,
  }) => {
    const first = await createChatUser(page);
    const title = `محادثة سرية ${Date.now()}`;
    await seedConversation(first.token, title);
    const other = await createConfirmedUser(browser);

    await page.goto('/chat');
    await page
      .getByRole('textbox', { name: text.chat.composer.label })
      .fill('مسودة المستخدم الأول');
    await signOutViaUi(page);
    await expect(page).toHaveURL(/\/sign-in/);

    await signIn(page, other.email, other.password);
    const side = await openSidebar(page, isMobile);
    await expect(side.getByText(t.list.emptyTitle)).toBeVisible();
    await expect(side.getByText(title)).toHaveCount(0);
    if (isMobile) await page.keyboard.press('Escape');
    await expect(
      page.getByRole('textbox', { name: text.chat.composer.label }),
    ).toHaveValue('');
  });

  test('SH-11 balance chip: two decimals, dollar sign after the number', async ({
    page,
  }) => {
    await createChatUser(page); // $0.50
    await page.goto('/chat');
    await expect(chip(page)).toBeVisible();
    const label = ((await chip(page).textContent()) ?? '').replace(/\s+/g, ' ');
    expect(label).toMatch(/0\.50\$$/);
    // The amount is isolated (bdi) so the sign stays after the number in Arabic text.
    await expect(chip(page).locator('bdi')).toHaveText('0.50$');
  });
});

test.describe('2.3 conversation list', () => {
  test('SH-12 new account: empty list text', async ({ page, isMobile }) => {
    await createChatUser(page);
    await page.goto('/chat');
    const side = await openSidebar(page, isMobile);
    await expect(side.getByText(t.list.emptyTitle)).toBeVisible();
    await expect(side.getByText(t.list.emptyBody)).toBeVisible();
  });

  test('SH-13 untitled (empty) conversations are not listed', async ({
    page,
    isMobile,
  }) => {
    const user = await createChatUser(page);
    await apiCreateConversation(user.token);
    await apiCreateConversation(user.token);
    await page.goto('/chat');
    const side = await openSidebar(page, isMobile);
    await expect(side.getByText(t.list.emptyTitle)).toBeVisible();
    await expect(
      side.getByRole('navigation', { name: t.recent }).getByRole('link'),
    ).toHaveCount(0);
  });

  test('SH-14 newest first with relative time; the open one is marked with a bar on the right edge', async ({
    page,
    isMobile,
  }) => {
    const user = await createChatUser(page);
    const older = `الأقدم ${Date.now()}`;
    const newer = `الأحدث ${Date.now()}`;
    await seedConversation(user.token, older);
    const newerId = await seedConversation(user.token, newer);
    await page.goto(`/chat/${newerId}`);
    const side = await openSidebar(page, isMobile);
    const nav = side.getByRole('navigation', { name: t.recent });
    const rows = nav.getByRole('link');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText(newer);
    await expect(rows.nth(1)).toContainText(older);
    // Relative time: text after the title (not empty).
    const when = rows.nth(0).locator('span').last();
    await expect(when).toHaveText(/\S/);
    // Only the open one is the current page, with a bar at its right edge.
    await expect(rows.nth(0)).toHaveAttribute('aria-current', 'page');
    await expect(rows.nth(1)).not.toHaveAttribute('aria-current', 'page');
    const bar = rows.nth(0).locator('span[aria-hidden="true"]').first();
    const barBox = (await bar.boundingBox())!;
    const rowBox = (await rows.nth(0).boundingBox())!;
    expect(barBox.x + barBox.width).toBeGreaterThan(
      rowBox.x + rowBox.width - 4,
    );
  });

  test('SH-15 more than 20 conversations: older ones load at the bottom with skeleton rows', async ({
    page,
    isMobile,
  }) => {
    await createChatUser(page);
    const now = Date.now();
    const make = (from: number, to: number) =>
      Array.from({ length: to - from }, (_, i) => {
        const n = from + i;
        const at = new Date(now - n * 60_000).toISOString();
        return {
          id: `0190e0a0-0000-7000-8000-${String(n).padStart(12, '0')}`,
          title: `محادثة رقم ${n + 1}`,
          modeKey: null,
          lastMessageAt: at,
          createdAt: at,
        };
      });
    const requests: (string | null)[] = [];
    await page.route(
      (url) => conversationsList(url),
      async (route) => {
        if (route.request().method() !== 'GET') return route.fallback();
        const cursor = new URL(route.request().url()).searchParams.get(
          'cursor',
        );
        requests.push(cursor);
        if (!cursor) {
          return route.fulfill({
            json: { items: make(0, 20), nextCursor: 'page-2' },
          });
        }
        await new Promise((r) => setTimeout(r, 1500)); // a visible loading state
        return route.fulfill({
          json: { items: make(20, 25), nextCursor: null },
        });
      },
    );
    await page.goto('/chat');
    const side = await openSidebar(page, isMobile);
    const links = side
      .getByRole('navigation', { name: t.recent })
      .getByRole('link');
    await expect(links).toHaveCount(20);
    await links.last().scrollIntoViewIfNeeded();
    await expect(
      side.getByRole('status', { name: t.list.loadingMore }),
    ).toBeVisible();
    await expect(links).toHaveCount(25);
    await expect(links.last()).toContainText('محادثة رقم 25');
    expect(requests).toEqual([null, 'page-2']);
  });

  test('SH-16 list fails: error with retry, retry loads it', async ({
    page,
    isMobile,
  }) => {
    const user = await createChatUser(page);
    const title = `سؤال الخطأ ${Date.now()}`;
    await seedConversation(user.token, title);
    let down = true;
    await page.route(
      (url) => conversationsList(url),
      (route) =>
        down && route.request().method() === 'GET'
          ? route.abort('connectionrefused')
          : route.fallback(),
    );
    await page.goto('/chat');
    const side = await openSidebar(page, isMobile);
    await expect(side.getByText(t.list.error)).toBeVisible();
    down = false;
    await side.getByRole('button', { name: text.common.retry }).click();
    await expect(
      side.getByRole('link', { name: new RegExp(title) }),
    ).toBeVisible();
    await expect(side.getByText(t.list.error)).toHaveCount(0);
  });

  test('SH-17 unknown conversation id: not-found state with a way to start a new chat', async ({
    page,
  }) => {
    await createChatUser(page);
    await page.goto('/chat/00000000-0000-0000-0000-000000000000');
    await expect(page.getByText(errors.CONVERSATION_NOT_FOUND)).toBeVisible();
    await page.getByRole('link', { name: text.chat.notFound.action }).click();
    await expect(page).toHaveURL(/\/chat$/);
  });

  test("SH-18 another user's conversation id shows the same not-found state", async ({
    page,
    browser,
  }) => {
    const owner = await createChatUser(page);
    const secret = `سر المالك ${Date.now()}`;
    const id = await seedConversation(owner.token, secret);

    const stranger = await createConfirmedUser(browser, 'e2e-stranger');
    const context = await signedInContext(
      browser,
      stranger.email,
      stranger.password,
    );
    try {
      const other = await context.newPage();
      await other.goto(`/chat/${id}`);
      await expect(
        other.getByText(errors.CONVERSATION_NOT_FOUND),
      ).toBeVisible();
      await expect(other.getByText(secret)).toHaveCount(0);
    } finally {
      await context.close();
    }
  });
});
