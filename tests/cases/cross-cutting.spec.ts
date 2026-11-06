import { expect, test, type Locator, type Page } from '@playwright/test';
import { lam7a as brand } from '../../src/brand/lam7a';
import {
  E2E_PASSWORD,
  SKIP_MESSAGE,
  accessToken,
  adminCredentials,
  createMixedUser,
  expectNoHorizontalScroll,
  fillStable,
  freshEmail,
  holdStreamAfter,
  myId,
  seedConversation,
  signOutViaUi,
  signUpConfirmed,
  slowStreams,
  stackReachable,
  text,
} from '../support';

// MANUAL_TEST_CASES.md §4 (cross-cutting checks), one test per case ID, run
// over the user-facing pages (guest pages, chat with its menus, balance,
// account, plans, the request-balance dialog) on the free mock modes.
//
// Left manual:
// - X-05 the actual screen-reader announcements (NVDA / VoiceOver). What can
//   be checked is automated: every icon button has an accessible name, errors
//   are in role="alert" regions.
// - X-08 "no overlapping text" is a visual judgement; the layout checks
//   (no sideways scroll, composer and Send reachable) at 200% are automated.
// - X-07 the OS setting itself: the same preference is emulated in the browser.
// The admin console is outside X-01..X-03 here (model ids, `USD` and provider
// codes are Latin by design); it is covered by admin.spec.ts.

let stackUp = false;
test.beforeAll(async () => {
  stackUp = await stackReachable();
});
test.beforeEach(() => {
  test.skip(!stackUp, SKIP_MESSAGE);
  test.skip(!adminCredentials(), 'Admin credentials missing (fixtures).');
});

const t = text.chat;
const composer = (page: Page) =>
  page.getByRole('textbox', { name: t.composer.label });
const sendButton = (page: Page) =>
  page.getByRole('button', { name: t.composer.send });
const modeTrigger = (page: Page) =>
  page.getByRole('button', { name: t.composer.modeMenu });

const visibleText = (page: Page) =>
  page.evaluate(() => document.body.innerText);

interface Snapshot {
  where: string;
  body: string;
}

/**
 * Visits the guest pages (signed out) and then the signed-in pages of a fresh
 * user, returning the text on screen for each, with menus and dialogs open.
 */
async function snapshots(page: Page, isMobile: boolean): Promise<Snapshot[]> {
  const out: Snapshot[] = [];
  const grab = async (where: string) =>
    out.push({ where, body: await visibleText(page) });
  for (const path of ['/sign-in', '/sign-up', '/forgot-password']) {
    await page.goto(path);
    await expect(page.getByRole('heading').first()).toBeVisible();
    await grab(path);
  }
  const user = await createMixedUser(page, { prefix: 'e2e-cross' });
  const conversationId = await seedConversation(
    user.token,
    'سؤال للتصفح العام',
  );
  await page.goto('/chat');
  await expect(modeTrigger(page)).toBeEnabled();
  await grab('/chat');
  await modeTrigger(page).click();
  await expect(page.getByRole('menuitemradio').first()).toBeVisible();
  await grab('/chat mode menu');
  await page.keyboard.press('Escape');
  if (!isMobile) {
    await page.getByRole('button', { name: text.shell.accountMenu }).click();
    await expect(page.getByRole('menu')).toBeVisible();
    await grab('/chat account menu');
    await page.keyboard.press('Escape');
  }
  await page.goto(`/chat/${conversationId}`);
  await expect(page.getByRole('article').last()).toHaveAttribute(
    'data-state',
    'complete',
  );
  await grab('/chat/<id>');
  await page.goto('/balance');
  await expect(
    page.getByRole('heading', { name: text.balance.title }).first(),
  ).toBeVisible();
  await expect(page.locator('p.text-5xl')).toHaveText(/\$$/);
  await grab('/balance');
  await page.getByRole('button', { name: text.balance.request }).click();
  await expect(
    page.getByRole('dialog', { name: t.requestBalance.title }),
  ).toBeVisible();
  await grab('/balance request dialog');
  await page.keyboard.press('Escape');
  await page.goto('/account');
  await expect(
    page.getByRole('heading', { name: text.account.title }).first(),
  ).toBeVisible();
  await grab('/account');
  await page.goto('/plans');
  await expect(page.getByRole('heading').first()).toBeVisible();
  await grab('/plans');
  return out;
}

test.describe('4 language, money and digits', () => {
  test('X-01 no English UI text and no model or provider names on any user page', async ({
    page,
    isMobile,
  }) => {
    test.setTimeout(120_000);
    const pages = await snapshots(page, isMobile);
    const names = /mock|gemini|gpt|openai|claude|anthropic|google|deepseek/i;
    // Latin words that are allowed: the brand's "AI", the e2e fixtures'
    // own mode labels ("e2e"), the mock model's reply ("Echo") and the
    // emails and URLs the pages show.
    const allowed = new Set(['AI', 'e2e', 'Echo']);
    for (const { where, body } of pages) {
      expect(body, `${where}: provider or model name`).not.toMatch(names);
      const stripped = body
        .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '')
        .replace(/https?:\/\/\S+/g, '');
      const english = (stripped.match(/[A-Za-z]{2,}/g) ?? []).filter(
        (word) => !allowed.has(word),
      );
      expect(english, `${where}: English words`).toEqual([]);
    }
  });

  test('X-02 money is always 0.0015$ / 14.48$: dollar after the number, Western digits, never $0.0015', async ({
    page,
    isMobile,
  }) => {
    test.setTimeout(120_000);
    const pages = await snapshots(page, isMobile);
    let seen = 0;
    for (const { where, body } of pages) {
      expect(body, `${where}: dollar before the number`).not.toMatch(/\$\s?\d/);
      expect(body, `${where}: Arabic currency word`).not.toMatch(
        /دولار|\bUSD\b/,
      );
      seen += (body.match(/\d+(\.\d+)?\$/g) ?? []).length;
    }
    expect(seen).toBeGreaterThan(0);
  });

  test('X-03 Western digits everywhere (times, counts, money)', async ({
    page,
    isMobile,
  }) => {
    test.setTimeout(120_000);
    const pages = await snapshots(page, isMobile);
    for (const { where, body } of pages) {
      expect(body, `${where}: Arabic-Indic digits`).not.toMatch(/[٠-٩۰-۹]/);
    }
    // The activity list has a dated row ("today 14:05"): digits are Western.
    await page.goto('/balance');
    await expect(page.getByText(/\d{2}:\d{2}/).first()).toBeVisible();
  });
});

test.describe('4 keyboard, names and touch', () => {
  /** The element has a real (not "none") focus outline of at least 2px. */
  async function expectRing(locator: Locator) {
    const ring = await locator.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        style: style.outlineStyle,
        width: parseFloat(style.outlineWidth),
        shadow: style.boxShadow,
      };
    });
    expect(
      (ring.style !== 'none' && ring.width >= 2) || ring.shadow !== 'none',
    ).toBe(true);
  }

  test('X-04 keyboard only: sign-in in order with a visible ring; chat controls reachable; Escape closes menus and dialogs', async ({
    page,
    isMobile,
    browserName,
  }) => {
    test.skip(isMobile, 'Keyboard navigation is a desktop case.');
    const user = await createMixedUser(page, { prefix: 'e2e-keys' });
    await signOutViaUi(page);

    // Sign-in: email, forgot-password link, password, eye, submit, in that order.
    const email = page.getByLabel(text.auth.fields.email, { exact: true });
    await email.focus();
    await expect(email).toBeFocused();
    await expectRing(email);
    await page.keyboard.type(user.email);
    await page.keyboard.press('Tab');
    const forgot = page.getByRole('link', {
      name: text.auth.signIn.forgotPassword,
    });
    if (browserName === 'webkit') {
      // Safari's Tab skips links (a browser setting), so only the fields and
      // buttons are in its order.
      await expect(forgot).not.toBeFocused();
    } else {
      await expect(forgot).toBeFocused();
      await expectRing(forgot);
      await page.keyboard.press('Tab');
    }
    const password = page.getByLabel(text.auth.fields.password, {
      exact: true,
    });
    await expect(password).toBeFocused();
    await expectRing(password);
    await page.keyboard.type(E2E_PASSWORD);
    await page.keyboard.press('Tab');
    const eye = page.getByRole('button', { name: text.common.showPassword });
    await expect(eye).toBeFocused();
    await expectRing(eye);
    await page.keyboard.press('Tab');
    const submit = page.getByRole('button', { name: text.auth.signIn.submit });
    await expect(submit).toBeFocused();
    await expectRing(submit);
    await page.keyboard.press('Enter');
    await page.waitForURL(/\/chat/);

    // Chat: the composer, the mode chip and Send are all in the Tab order.
    await expect(modeTrigger(page)).toBeEnabled();
    await composer(page).focus();
    await composer(page).fill('x');
    const reachable = new Set<string>();
    for (let i = 0; i < 12 && reachable.size < 3; i++) {
      await page.keyboard.press('Tab');
      const name = await page.evaluate(
        () =>
          document.activeElement?.getAttribute('aria-label') ??
          document.activeElement?.textContent ??
          '',
      );
      for (const wanted of [
        t.composer.modeMenu,
        t.composer.send,
        text.shell.accountMenu,
      ]) {
        if (name.includes(wanted)) reachable.add(wanted);
      }
    }
    // Shift+Tab goes back through the same controls.
    await composer(page).focus();
    for (let i = 0; i < 12 && reachable.size < 3; i++) {
      await page.keyboard.press('Shift+Tab');
      const name = await page.evaluate(
        () =>
          document.activeElement?.getAttribute('aria-label') ??
          document.activeElement?.textContent ??
          '',
      );
      if (name.includes(text.shell.accountMenu))
        reachable.add(text.shell.accountMenu);
    }
    expect([...reachable].sort()).toEqual(
      [t.composer.modeMenu, t.composer.send, text.shell.accountMenu].sort(),
    );

    // Menus: opened by keyboard, closed with Escape, focus back on the opener.
    await modeTrigger(page).focus();
    await expectRing(modeTrigger(page));
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toBeHidden();
    await expect(modeTrigger(page)).toBeFocused();

    const account = page.getByRole('button', { name: text.shell.accountMenu });
    await account.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toBeHidden();

    // A dialog: the request-balance dialog closes with Escape.
    await page.goto('/balance');
    const request = page.getByRole('button', { name: text.balance.request });
    await request.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: t.requestBalance.title });
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(request).toBeFocused();
  });

  test('X-04 phone: the drawer opens and closes by keyboard and traps focus', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'The drawer is a phone-width layout.');
    await createMixedUser(page, { prefix: 'e2e-keys' });
    await page.goto('/chat');
    const opener = page.getByRole('button', { name: text.shell.openMenu });
    await opener.focus();
    await page.keyboard.press('Enter');
    const drawer = page.getByRole('dialog', { name: text.shell.sidebarTitle });
    await expect(drawer).toBeVisible();
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      expect(
        await drawer.evaluate((d) => d.contains(document.activeElement)),
      ).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('X-05 icon buttons have names; errors are announced (role=alert). The screen-reader pass itself stays manual', async ({
    page,
    isMobile,
  }) => {
    // Sign-in: the eye button and an error in an alert region.
    await page.goto('/sign-in');
    await expect(
      page.getByRole('button', { name: text.common.showPassword }),
    ).toBeVisible();
    // A field error is read through the field itself: it takes focus, is
    // marked invalid and points at its message.
    await page.getByRole('button', { name: text.auth.signIn.submit }).click();
    const email = page.getByLabel(text.auth.fields.email, { exact: true });
    await expect(email).toBeFocused();
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    const described = await email.getAttribute('aria-describedby');
    expect(described).toBeTruthy();
    await expect(
      page.locator(`[id="${described!.split(' ').pop()}"]`),
    ).not.toBeEmpty();
    // A refused sign-in is announced in an alert region.
    await email.fill(freshEmail('e2e-nobody'));
    await page
      .getByLabel(text.auth.fields.password, { exact: true })
      .fill(E2E_PASSWORD);
    await page.getByRole('button', { name: text.auth.signIn.submit }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();

    await createMixedUser(page, { prefix: 'e2e-names' });
    await page.goto('/chat');
    await expect(modeTrigger(page)).toBeEnabled();
    if (isMobile) {
      await expect(
        page.getByRole('button', { name: text.shell.openMenu }),
      ).toBeVisible();
    } else {
      await expect(
        page.getByRole('button', { name: text.shell.accountMenu }),
      ).toBeVisible();
    }
    // Send (an icon only) and, while an answer is written, Stop.
    await expect(
      page.getByRole('button', { name: t.composer.send }),
    ).toBeVisible();
    await slowStreams(page, 60);
    await page.goto('/chat');
    await holdStreamAfter(page, 2);
    await composer(page).fill('كلمة واحدة');
    await sendButton(page).click();
    await expect(
      page.getByRole('button', { name: t.composer.stop }),
    ).toBeVisible();
    // Copy on a finished answer.
    await holdStreamAfter(page, 1_000);
    await expect(page.getByRole('article').last()).toHaveAttribute(
      'data-state',
      'complete',
      { timeout: 30_000 },
    );
    await expect(
      page.getByRole('button', { name: t.message.copy }).first(),
    ).toBeVisible();

    // Every visible button on the page has a name.
    const unnamed = await page.evaluate(() =>
      [...document.querySelectorAll('button')]
        .filter((b) => b.offsetParent !== null)
        .filter(
          (b) =>
            !(b.getAttribute('aria-label') ?? '').trim() &&
            !(b.textContent ?? '').trim() &&
            !b.getAttribute('aria-labelledby'),
        )
        .map((b) => b.outerHTML.slice(0, 80)),
    );
    expect(unnamed).toEqual([]);
  });

  test('X-06 phone: buttons and links are at least 44px to tap', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'Touch targets are a phone case.');
    const measure = async (where: string) => {
      const small = await page.evaluate(() => {
        const interactive = document.querySelectorAll<HTMLElement>(
          'button, a[href], [role="menuitem"], [role="menuitemradio"], input:not([type="hidden"]):not([type="file"]), select, textarea',
        );
        return [...interactive]
          .filter((el) => el.offsetParent !== null || el.closest('dialog'))
          .map((el) => {
            const r = el.getBoundingClientRect();
            return {
              label: (
                el.getAttribute('aria-label') ??
                el.textContent ??
                el.tagName
              )
                .trim()
                .slice(0, 30),
              w: Math.round(r.width),
              h: Math.round(r.height),
              inline:
                el.tagName === 'A' &&
                getComputedStyle(el).display === 'inline' &&
                !!el.closest('p, li, span'),
            };
          })
          .filter((m) => m.w > 0 && m.h > 0 && !m.inline)
          .filter((m) => m.h < 44 || m.w < 44);
      });
      return small.map((m) => `${where}: ${m.label} ${m.w}x${m.h}`);
    };
    const problems: string[] = [];
    await page.goto('/sign-in');
    problems.push(...(await measure('/sign-in')));
    await createMixedUser(page, { prefix: 'e2e-touch' });
    await page.goto('/chat');
    await expect(modeTrigger(page)).toBeEnabled();
    problems.push(...(await measure('/chat')));
    await page.getByRole('button', { name: text.shell.openMenu }).click();
    await expect(
      page.getByRole('dialog', { name: text.shell.sidebarTitle }),
    ).toBeVisible();
    problems.push(...(await measure('drawer')));
    await page.keyboard.press('Escape');
    await modeTrigger(page).click();
    await expect(page.getByRole('menuitemradio').first()).toBeVisible();
    problems.push(...(await measure('mode menu')));
    await page.keyboard.press('Escape');
    for (const path of ['/balance', '/account', '/plans']) {
      await page.goto(path);
      await expect(page.getByRole('heading').first()).toBeVisible();
      problems.push(...(await measure(path)));
    }
    expect(problems).toEqual([]);
  });
});

test.describe('4 motion, zoom and cursor', () => {
  test('X-07 reduced motion: nothing animates while an answer is written or an image is created', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await createMixedUser(page, { prefix: 'e2e-motion' });
    await slowStreams(page, 80);
    const running = async () =>
      page.evaluate(() =>
        document
          .getAnimations()
          .filter((a) => a.playState === 'running')
          .filter((a) => {
            const target = (a.effect as KeyframeEffect | null)?.target;
            return !(target instanceof Element) || target.isConnected;
          })
          .map((a) => {
            const target = (a.effect as KeyframeEffect | null)?.target;
            return `${(a as CSSAnimation).animationName ?? a.constructor.name} on ${target instanceof Element ? target.className : '?'} (${a.effect?.getComputedTiming().iterations}x ${a.effect?.getComputedTiming().duration})`;
          }),
      );
    // Held after the first event: the "preparing" dots. Held after three:
    // text is on screen, so the streaming caret is too.
    for (const events of [1, 3]) {
      await page.goto('/chat');
      await expect(modeTrigger(page)).toBeEnabled();
      await holdStreamAfter(page, events);
      await composer(page).fill('رد بطيء');
      await sendButton(page).click();
      await expect(
        page.getByRole('button', { name: t.composer.stop }),
      ).toBeVisible();
      if (events === 3) {
        await expect(page.getByRole('article').last()).toContainText('Echo');
      }
      // Past the longest animation delay, nothing may still be running.
      await page.waitForTimeout(2000);
      expect(await running()).toEqual([]);
    }
  });

  test('X-08 zoom 200%: the layout stays usable with no sideways scroll', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, '200% zoom is a desktop case (a 640px-wide viewport).');
    await page.setViewportSize({ width: 640, height: 400 });
    await page.goto('/sign-in');
    await expect(
      page.getByRole('button', { name: text.auth.signIn.submit }),
    ).toBeVisible();
    await expectNoHorizontalScroll(page);
    await createMixedUser(page, { prefix: 'e2e-zoom' });
    for (const path of ['/chat', '/balance', '/account', '/plans']) {
      await page.goto(path);
      await expect(page.locator('main, h1').first()).toBeVisible();
      await expectNoHorizontalScroll(page);
    }
    await page.goto('/chat');
    await expect(composer(page)).toBeVisible();
    await composer(page).fill('x');
    await expect(sendButton(page)).toBeVisible();
    await expect(sendButton(page)).toBeEnabled();
    const box = (await sendButton(page).boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(640);
    expect(box.y + box.height).toBeLessThanOrEqual(400);
  });

  test('X-09 cursor: pointer on enabled buttons and links, default on disabled ones', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'There is no mouse cursor on a phone.');
    const cursorOf = (locator: Locator) =>
      locator.evaluate((el) => getComputedStyle(el).cursor);
    await page.goto('/sign-in');
    await expect(
      await cursorOf(
        page.getByRole('button', { name: text.auth.signIn.submit }),
      ),
    ).toBe('pointer');
    expect(['pointer', 'auto']).toContain(
      await cursorOf(
        page.getByRole('link', { name: text.auth.signIn.forgotPassword }),
      ),
    );
    expect(
      await cursorOf(
        page.getByRole('button', { name: text.common.showPassword }),
      ),
    ).toBe('pointer');

    await createMixedUser(page, { prefix: 'e2e-cursor' });
    await page.goto('/chat');
    await expect(modeTrigger(page)).toBeEnabled();
    // Send is disabled with an empty box: default cursor; with text: pointer.
    const send = sendButton(page);
    await expect(send).toBeDisabled();
    expect(await cursorOf(send)).not.toBe('pointer');
    await composer(page).fill('x');
    await expect(send).toBeEnabled();
    expect(await cursorOf(send)).toBe('pointer');
    expect(await cursorOf(modeTrigger(page))).toBe('pointer');
    expect(
      await cursorOf(
        page.getByRole('button', { name: text.shell.accountMenu }),
      ),
    ).toBe('pointer');
    // Every enabled button and link of the page.
    const wrong = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('button, a[href]')]
        .filter((el) => el.offsetParent !== null)
        .filter((el) => {
          const disabled =
            (el as HTMLButtonElement).disabled ||
            el.getAttribute('aria-disabled') === 'true';
          const cursor = getComputedStyle(el).cursor;
          // A link's "auto" is the browser's own hand (WebKit reports it so).
          const link = el.tagName === 'A';
          return disabled
            ? cursor === 'pointer'
            : cursor !== 'pointer' && !(link && cursor === 'auto');
        })
        .map(
          (el) =>
            `${el.tagName} ${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30)}: ${getComputedStyle(el).cursor}`,
        ),
    );
    expect(wrong).toEqual([]);
  });
});

test.describe('4 brand, console and privacy', () => {
  test('X-10 brand: the name and monogram appear on the pages and the tab title is the brand name', async ({
    page,
    isMobile,
  }) => {
    for (const path of ['/sign-in', '/sign-up', '/forgot-password']) {
      await page.goto(path);
      await expect(page).toHaveTitle(brand.name.ar);
      await expect(
        page.getByText(brand.monogram, { exact: true }),
      ).toBeVisible();
      await expect(page.getByText(brand.name.ar).first()).toBeVisible();
    }
    await createMixedUser(page, { prefix: 'e2e-brand' });
    for (const path of ['/chat', '/balance', '/account', '/plans']) {
      await page.goto(path);
      await expect(page.locator('main, h1').first()).toBeVisible();
      await expect(page).toHaveTitle(brand.name.ar);
    }
    await page.goto('/chat');
    if (isMobile) {
      await page.getByRole('button', { name: text.shell.openMenu }).click();
    }
    // The signed-in shell (the drawer on a phone) shows the brand too; the
    // first match can be the hidden desktop copy, so only visible ones count.
    await expect(
      page.getByText(brand.name.ar).locator('visible=true').first(),
    ).toBeVisible();
    await expect(
      page
        .getByText(brand.monogram, { exact: true })
        .locator('visible=true')
        .first(),
    ).toBeVisible();
  });

  test('X-11 console: no errors during sign-up, chat, balance, account, plans and sign-out', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const problems: string[] = [];
    page.on('console', (message) => {
      // Google Fonts cannot be fetched on an offline machine: not the app's error.
      if (
        message.type() === 'error' &&
        !/downloadable font|fonts.g/i.test(message.text())
      )
        problems.push(`console: ${message.text().slice(0, 200)}`);
    });
    page.on('pageerror', (error) =>
      problems.push(`pageerror: ${error.message.slice(0, 200)}`),
    );
    await page.goto('/sign-in');
    await expect(page.getByRole('heading').first()).toBeVisible();
    await page.goto('/sign-up');
    await expect(page.getByRole('heading').first()).toBeVisible();
    await createMixedUser(page, { prefix: 'e2e-console' });
    await page.goto('/chat'); // the plan was added after the first load
    await expect(modeTrigger(page)).toBeEnabled();
    await fillStable(composer(page), 'سؤال لاختبار الكونسول');
    await sendButton(page).click();
    await expect(page.getByRole('article').last()).toHaveAttribute(
      'data-state',
      'complete',
      { timeout: 30_000 },
    );
    for (const path of ['/balance', '/account', '/plans', '/chat']) {
      await page.goto(path);
      await expect(page.locator('main, h1').first()).toBeVisible();
    }
    await signOutViaUi(page);
    expect(problems).toEqual([]);
  });

  test('X-12 privacy: the address bar never holds an email or token; requests go only to the API, auth and the app itself', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const urls: string[] = [];
    await page.exposeFunction('__e2eUrl', (url: string) => urls.push(url));
    await page.addInitScript(() => {
      const w = window as unknown as { __e2eUrl: (u: string) => void };
      const log = () => w.__e2eUrl(location.href);
      log();
      for (const method of ['pushState', 'replaceState'] as const) {
        const original = history[method].bind(history);
        history[method] = (...args: Parameters<History['pushState']>) => {
          original(...args);
          log();
        };
      }
      window.addEventListener('hashchange', log);
      window.addEventListener('popstate', log);
      setInterval(log, 25);
    });
    const hosts = new Set<string>();
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.protocol === 'http:' || url.protocol === 'https:')
        hosts.add(url.host);
    });

    // Sign-up (confirmation link carries the token), chat, the other pages.
    const email = freshEmail('e2e-privacy');
    await page.goto('/sign-up');
    await expect(page.getByRole('heading').first()).toBeVisible();
    await signUpConfirmed(page, email, E2E_PASSWORD);
    const token = await accessToken(page);
    const id = await myId(token);
    expect(id).toBeTruthy();
    for (const path of ['/balance', '/account', '/plans', '/chat']) {
      await page.goto(path, { waitUntil: 'commit' });
      await page.waitForURL((url) => url.pathname === path);
      await expect(page.locator('main, h1').first()).toBeVisible();
    }
    await signOutViaUi(page);
    // By the link (the app is still settling on /sign-in; a goto can be cut).
    await page
      .getByRole('link', { name: text.auth.signIn.forgotPassword })
      .click();
    await page.waitForURL(/forgot-password/);
    await expect(page.getByRole('heading').first()).toBeVisible();

    const local = urls.filter((u) => u.startsWith('http://localhost:3001'));
    expect(local.length).toBeGreaterThan(0);
    // The confirmation link lands on /auth/callback with the session in the
    // hash (GoTrue's implicit flow) and the app replaces it at once. Anywhere
    // else a token is a leak. (The sign-up page's own URL is AU-06.)
    const tokenPattern =
      /access_token|refresh_token|token=|id_token|eyJ[0-9A-Za-z_-]{10,}/;
    for (const url of local) {
      expect(url, 'email in the address bar').not.toMatch(/@|%40/);
      if (!url.startsWith('http://localhost:3001/auth/callback')) {
        expect(url, 'token in the address bar').not.toMatch(tokenPattern);
      }
    }
    // After the callback the address bar is clean again for good.
    expect(local.at(-1)!).not.toMatch(tokenPattern);
    const allowed = new Set([
      'localhost:3000',
      'localhost:9999',
      'localhost:3001',
      'fonts.googleapis.com',
      'fonts.gstatic.com',
    ]);
    // The mail link itself points at the auth server and is opened on purpose
    // by signUpConfirmed; only what the app requested is judged.
    expect([...hosts].filter((h) => !allowed.has(h))).toEqual([]);
    expect(await adminCredentialsAreNotInUrls(urls)).toBe(true);
  });
});

/** Admin and user passwords are never in a URL either. */
async function adminCredentialsAreNotInUrls(urls: string[]): Promise<boolean> {
  const creds = adminCredentials();
  return urls.every(
    (url) =>
      !url.includes(E2E_PASSWORD) &&
      (!creds || !url.includes(encodeURIComponent(creds.email))),
  );
}
