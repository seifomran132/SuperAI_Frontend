import { expect, test, type Page } from '@playwright/test';
import { lam7a as brand } from '../../src/brand/lam7a';
import errors from '../../src/i18n/errors.ar.json' with { type: 'json' };
import {
  API,
  CHAT_FAST_DESCRIPTION,
  CHAT_FAST_KEY,
  CHAT_FAST_LABEL,
  CHAT_PRO_DESCRIPTION,
  CHAT_PRO_LABEL,
  SKIP_MESSAGE,
  activatePlan,
  apiBalance,
  apiCreateConversation,
  apiSend,
  createChatUser,
  createNoPlanUser,
  ensureChatFixtures,
  holdStreamAfter,
  longPrompt,
  mockChatServer,
  openSidebar,
  seedConversation,
  setStreamDelay,
  slowStreams,
  stackReachable,
  text,
  fillStable,
} from '../support';

// MANUAL_TEST_CASES.md §3 (chat), one test per case ID, on the free `mock`
// echo model ("Echo: <your message>") through two e2e modes; see
// ensureChatFixtures in support.ts. Where the echo model cannot produce the
// situation (multi-line Markdown, stopped or failed answers, a held stream) the
// send POST and the message list after it are route-mocked (mockChatServer).
//
// Left manual (human or real-provider judgement):
// - MD-02 colour of the highlighted code: visual; the structure is automated.
// - CH-12: only the "no jump" mechanics are automated, with a mocked history.
// - CH-18..CH-21, CH-23: automated where the stream can be controlled; the
//   exact "go Offline in DevTools mid-stream" of CH-21 is emulated by a stream
//   that ends without a terminal event.
// - CH-24: a real provider's content-policy block cannot be provoked on
//   demand; the failed card for CONTENT_BLOCKED is automated with a mock.

let stackUp = false;
test.beforeAll(async () => {
  stackUp = await stackReachable();
});
test.beforeEach(() => {
  test.skip(!stackUp, SKIP_MESSAGE);
});

const t = text.chat;
const composer = (page: Page) =>
  page.getByRole('textbox', { name: t.composer.label });
const sendButton = (page: Page) =>
  page.getByRole('button', { name: t.composer.send });
const stopButton = (page: Page) =>
  page.getByRole('button', { name: t.composer.stop });
const modeTrigger = (page: Page) =>
  page.getByRole('button', { name: t.composer.modeMenu });
const answers = (page: Page) => page.getByRole('article');
const notice = (page: Page) => page.locator('[data-slot="chat-notice"]');
const scroller = (page: Page) => page.locator('main .overscroll-contain');

/** Requests that send a message (the stream POST). */
function trackSends(page: Page): string[] {
  const urls: string[] = [];
  page.on('request', (req) => {
    if (
      req.method() === 'POST' &&
      /\/conversations\/[^/]+\/messages$/.test(req.url())
    )
      urls.push(req.url());
  });
  return urls;
}

async function openNewChat(page: Page) {
  await page.goto('/chat');
  await expect(modeTrigger(page)).toBeEnabled();
}

async function sendAndWait(page: Page, prompt: string) {
  await composer(page).fill(prompt);
  await sendButton(page).click();
  await expect(answers(page).last()).toHaveAttribute('data-state', 'complete', {
    timeout: 30_000,
  });
}

test.describe('3.1 new chat and modes', () => {
  test('CH-01 new chat: monogram, heading, 4 example chips, mode chip', async ({
    page,
  }) => {
    await createChatUser(page);
    await openNewChat(page);
    const main = page.getByRole('main');
    await expect(main.getByText(brand.monogram, { exact: true })).toBeVisible();
    await expect(
      main.getByRole('heading', { name: t.empty.title }),
    ).toBeVisible();
    const chips = main.getByRole('list').getByRole('button');
    await expect(chips).toHaveCount(4);
    for (const key of ['chip1', 'chip2', 'chip3', 'chip4'] as const) {
      await expect(chips.filter({ hasText: t.empty[key] })).toHaveCount(1);
    }
    await expect(modeTrigger(page)).toContainText(CHAT_FAST_LABEL);
  });

  test('CH-02 an example chip fills the box and sends nothing', async ({
    page,
  }) => {
    await createChatUser(page);
    const sends = trackSends(page);
    await openNewChat(page);
    await page.getByRole('button', { name: t.empty.chip2 }).click();
    await expect(composer(page)).toHaveValue(t.empty.chip2);
    await page.waitForTimeout(500);
    expect(sends).toEqual([]);
    await expect(page).toHaveURL(/\/chat$/);
  });

  test('CH-03 mode menu: both modes with descriptions, current one checked, keyboard works', async ({
    page,
  }) => {
    await createChatUser(page);
    await openNewChat(page);
    await modeTrigger(page).click();
    const items = page.getByRole('menuitemradio');
    await expect(items).toHaveCount(2);
    await expect(items.nth(0)).toContainText(CHAT_FAST_LABEL);
    await expect(items.nth(0)).toContainText(CHAT_FAST_DESCRIPTION);
    await expect(items.nth(1)).toContainText(CHAT_PRO_LABEL);
    await expect(items.nth(1)).toContainText(CHAT_PRO_DESCRIPTION);
    await expect(items.nth(0)).toHaveAttribute('aria-checked', 'true');
    await expect(items.nth(1)).toHaveAttribute('aria-checked', 'false');
    // Colour dot: one per mode.
    await expect(
      items.nth(0).locator('span[aria-hidden="true"]').first(),
    ).toBeVisible();
    // Arrow keys move through the items; Enter picks the focused one.
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowDown');
      const onSecond = await page.evaluate(
        (label) =>
          document.activeElement?.getAttribute('role') === 'menuitemradio' &&
          (document.activeElement.textContent ?? '').includes(label),
        CHAT_PRO_LABEL,
      );
      if (onSecond) break;
    }
    await page.keyboard.press('Enter');
    await expect(modeTrigger(page)).toContainText(CHAT_PRO_LABEL);
    await expect(items).toHaveCount(0);
  });

  test('CH-04 picking the second mode only selects it (second palette colour, nothing sent)', async ({
    page,
  }) => {
    await createChatUser(page);
    const sends = trackSends(page);
    await openNewChat(page);
    await expect(modeTrigger(page)).toHaveAttribute('data-mode-position', '1');
    await modeTrigger(page).click();
    await page
      .getByRole('menuitemradio', { name: new RegExp(CHAT_PRO_LABEL) })
      .click();
    await expect(modeTrigger(page)).toContainText(CHAT_PRO_LABEL);
    // Colours are assigned by position (second mode = second palette colour).
    await expect(modeTrigger(page)).toHaveAttribute('data-mode-position', '2');
    await page.waitForTimeout(500);
    expect(sends).toEqual([]);
  });

  test('CH-05 Enter sends, Shift+Enter adds a line, the box grows', async ({
    page,
    isMobile,
  }) => {
    // Touch keyboards have no Shift+Enter; the key handling is the same code path.
    test.skip(
      isMobile,
      'Hardware Enter / Shift+Enter is a desktop interaction.',
    );
    await createChatUser(page);
    const sends = trackSends(page);
    await openNewChat(page);
    const box = composer(page);
    const before = (await box.boundingBox())!.height;
    await box.fill('سطر أول');
    await page.keyboard.press('Shift+Enter');
    await page.keyboard.type('سطر ثان');
    await page.keyboard.press('Shift+Enter');
    await page.keyboard.type('سطر ثالث');
    await expect(box).toHaveValue('سطر أول\nسطر ثان\nسطر ثالث');
    expect(sends).toEqual([]);
    expect((await box.boundingBox())!.height).toBeGreaterThan(before);
    await page.keyboard.press('Enter');
    await expect.poll(() => sends.length).toBe(1);
    await expect(box).toHaveValue('');
  });

  test('CH-06 the draft is kept per conversation', async ({
    page,
    isMobile,
  }) => {
    const user = await createChatUser(page);
    const first = `أولى ${Date.now()}`;
    const second = `ثانية ${Date.now()}`;
    const firstId = await seedConversation(user.token, first);
    await seedConversation(user.token, second);
    await page.goto(`/chat/${firstId}`);
    await expect(composer(page)).toBeVisible();
    await composer(page).fill('مسودة المحادثة الأولى');

    const goTo = async (title: string) => {
      const side = await openSidebar(page, isMobile);
      await side.getByRole('link', { name: new RegExp(title) }).click();
    };
    await goTo(second);
    await expect(composer(page)).toHaveValue('');
    await goTo(first);
    await expect(composer(page)).toHaveValue('مسودة المحادثة الأولى');
  });
});

test.describe('3.2 sending and streaming', () => {
  test('CH-07 send from a new chat: instant message, preparing then streaming text, Stop, URL and title', async ({
    page,
    isMobile,
  }) => {
    await createChatUser(page);
    await slowStreams(page, 400);
    await openNewChat(page);
    const prompt = 'اشرح لي الفرق بين الإيجار التمليكي والإيجار العادي';
    await composer(page).fill(prompt);
    await sendButton(page).click();
    // Your message at once; the answer card prepares, then text streams in.
    await expect(page.getByRole('main').getByText(prompt)).toBeVisible();
    await expect(stopButton(page)).toBeVisible();
    await expect(page.getByText(t.message.preparing)).toBeVisible();
    await expect(page).toHaveURL(/\/chat\/[0-9a-f-]{36}$/);
    const answer = answers(page).last();
    await expect(answer).toContainText('Echo');
    // While streaming: the streaming mark (caret) is on the text and Stop shows.
    await expect(answer).toHaveAttribute('data-state', 'streaming');
    await expect(answer.locator('.md-streaming')).toBeVisible();
    await expect(stopButton(page)).toBeVisible();
    await expect(answer).toHaveAttribute('data-state', 'complete', {
      timeout: 30_000,
    });
    await expect(stopButton(page)).toHaveCount(0);
    // The conversation is at the top of the list with a title.
    const side = await openSidebar(page, isMobile);
    await expect(
      side
        .getByRole('navigation', { name: text.shell.recent })
        .getByRole('link')
        .first(),
    ).toContainText('اشرح لي');
  });

  test('CH-09 copying the answer copies its original Markdown', async ({
    page,
  }) => {
    await createChatUser(page);
    // The clipboard API needs permissions that differ per browser: record the call instead.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: async (value: string) => {
            (window as unknown as { __copied: string }).__copied = value;
          },
        },
        configurable: true,
      });
    });
    await openNewChat(page);
    await sendAndWait(page, 'اكتب **نصًا عريضًا** و `كودًا` هنا');
    const answer = answers(page).last();
    // Rendered as bold, but the copy keeps the source text.
    await expect(answer.locator('strong')).toHaveText('نصًا عريضًا');
    await answer.getByRole('button', { name: t.message.copy }).click();
    await expect(
      answer.getByRole('button', { name: t.message.copied }),
    ).toBeVisible();
    const copied = await page.evaluate(
      () => (window as unknown as { __copied: string }).__copied,
    );
    expect(copied).toBe('Echo: اكتب **نصًا عريضًا** و `كودًا` هنا');
  });

  test('CH-10 reload keeps the messages; no cost line anywhere', async ({
    page,
  }) => {
    await createChatUser(page);
    await openNewChat(page);
    const prompt = `بعد التحديث ${Date.now()}`;
    await sendAndWait(page, prompt);
    await expect(page.getByText(/التكلفة/)).toHaveCount(0);
    await page.reload();
    await expect(
      page.getByRole('main').getByText(prompt, { exact: true }),
    ).toBeVisible();
    await expect(answers(page).last()).toContainText('Echo');
    // Per-answer cost is hidden (decision 2026-10-15).
    await expect(page.getByText(/التكلفة/)).toHaveCount(0);
  });

  test('CH-11 sending in the second mode: answer card shows its chip, and it costs more', async ({
    page,
  }) => {
    const user = await createChatUser(page);
    await openNewChat(page);
    const prompt = 'سؤال للمقارنة بين التكلفتين';

    const b0 = await apiBalance(user.token);
    await sendAndWait(page, prompt);
    const b1 = await apiBalance(user.token);
    await expect(answers(page).last()).toContainText(CHAT_FAST_LABEL);

    await modeTrigger(page).click();
    await page
      .getByRole('menuitemradio', { name: new RegExp(CHAT_PRO_LABEL) })
      .click();
    await sendAndWait(page, prompt);
    const b2 = await apiBalance(user.token);
    await expect(answers(page).last()).toContainText(CHAT_PRO_LABEL);

    // Compare as integers (9-decimal strings), never as floats.
    const units = (v: string) => BigInt(v.replace('.', ''));
    expect(units(b0) - units(b1)).toBeGreaterThan(0n);
    expect(units(b1) - units(b2)).toBeGreaterThan(units(b0) - units(b1));
  });

  test('CH-12 scrolling up in a long conversation loads older messages without the view jumping', async ({
    page,
  }) => {
    const user = await createChatUser(page);
    const id = await seedConversation(user.token, 'بداية قصيرة');
    const at = new Date().toISOString();
    const message = (n: number) => ({
      id: `0190e0a0-0000-7000-8000-${String(n).padStart(12, '0')}`,
      sequence: n,
      role: n % 2 === 1 ? 'user' : 'assistant',
      content: `رسالة رقم ${n} ` + 'نص '.repeat(30),
      status: 'complete',
      modeKey: CHAT_FAST_KEY,
      finishReason: 'stop',
      errorCode: null,
      createdAt: at,
      completedAt: at,
      attachments: [],
      costUsd: null,
      usage: null,
    });
    // 120 messages, newest first, 50 per page: 120..71, 70..21, 20..1.
    const pages = new Map<
      string | null,
      { items: unknown[]; nextBefore: number | null }
    >([
      [null, { items: range(120, 71).map(message), nextBefore: 71 }],
      ['71', { items: range(70, 21).map(message), nextBefore: 21 }],
      ['21', { items: range(20, 1).map(message), nextBefore: null }],
    ]);
    const requested: (string | null)[] = [];
    await page.route(/\/messages\?/, async (route) => {
      if (route.request().method() !== 'GET') return route.fallback();
      const before = new URL(route.request().url()).searchParams.get('before');
      requested.push(before);
      await new Promise((r) => setTimeout(r, 300));
      await route.fulfill({ json: pages.get(before) ?? pages.get(null) });
    });
    await page.goto(`/chat/${id}`);
    await expect(page.getByText('رسالة رقم 120 ')).toBeVisible();
    const view = scroller(page);
    await view.evaluate((el) => (el.scrollTop = 0));
    await expect(page.getByText('رسالة رقم 70 ')).toBeAttached();
    // The message that was first before loading stays where it was under the finger.
    const anchor = page.getByText('رسالة رقم 71 ');
    await expect.poll(async () => requested.length).toBeGreaterThanOrEqual(2);
    const top = async () => (await anchor.boundingBox())!.y;
    const after = await top();
    const viewBox = (await view.boundingBox())!;
    expect(after).toBeGreaterThan(viewBox.y - 5);
    expect(after).toBeLessThan(viewBox.y + 120);
    expect(requested.slice(0, 2)).toEqual([null, '71']);
  });

  test('CH-13 scrolling up while streaming stops auto-scroll; back near the bottom it follows again', async ({
    page,
  }) => {
    const user = await createChatUser(page);
    // A long history so the page can scroll.
    const id = await seedConversation(user.token, longPrompt(600));
    await slowStreams(page, 90);
    await page.goto(`/chat/${id}`);
    await expect(answers(page).first()).toBeVisible();
    const view = scroller(page);
    const fromBottom = () =>
      view.evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight);

    await composer(page).fill(longPrompt(120));
    await sendButton(page).click();
    await expect(stopButton(page)).toBeVisible();
    await expect(answers(page).last()).toContainText('Echo');
    // Scroll up: the position stays put while text keeps arriving.
    await view.evaluate(
      (el) => (el.scrollTop = Math.max(0, el.scrollTop - 600)),
    );
    const distance = await fromBottom();
    expect(distance).toBeGreaterThan(300);
    await page.waitForTimeout(1200);
    expect(await fromBottom()).toBeGreaterThanOrEqual(distance - 5);
    // Back near the bottom: it follows the text again.
    await view.evaluate((el) => (el.scrollTop = el.scrollHeight));
    await expect
      .poll(async () => fromBottom(), { timeout: 8000 })
      .toBeLessThan(120);
    await setStreamDelay(page, 0);
    await expect(answers(page).last()).toHaveAttribute(
      'data-state',
      'complete',
      {
        timeout: 30_000,
      },
    );
  });

  test('CH-14 scrolled up, sending a new message jumps to it', async ({
    page,
  }) => {
    const user = await createChatUser(page);
    const id = await seedConversation(user.token, longPrompt(600));
    await page.goto(`/chat/${id}`);
    await expect(answers(page).first()).toBeVisible();
    const view = scroller(page);
    await view.evaluate((el) => (el.scrollTop = 0));
    const prompt = `رسالة جديدة ${Date.now()}`;
    await composer(page).fill(prompt);
    await sendButton(page).click();
    const mine = page.getByRole('main').getByText(prompt, { exact: true });
    await expect(mine).toBeVisible();
    await expect
      .poll(() =>
        view.evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight),
      )
      .toBeLessThan(150);
    await expect(mine).toBeInViewport();
  });
});

const range = (from: number, to: number) =>
  Array.from({ length: from - to + 1 }, (_, i) => from - i);

test.describe('3.3 answer formatting (Markdown)', () => {
  const markdownUser = async (page: Page, answer: string) => {
    await createChatUser(page);
    await mockChatServer(page, { answer });
    await openNewChat(page);
    await sendAndWait(page, 'سؤال عن التنسيق');
    return answers(page).last();
  };

  test('MD-01 a real table whose columns follow Arabic direction', async ({
    page,
  }) => {
    const answer = await markdownUser(
      page,
      '| المدينة | البلد |\n|---|---|\n| الرياض | السعودية |\n| القاهرة | مصر |\n| عمّان | الأردن |\n',
    );
    const table = answer.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.getByRole('row')).toHaveCount(4);
    const first = (await table.getByRole('columnheader').nth(0).boundingBox())!;
    const second = (await table
      .getByRole('columnheader')
      .nth(1)
      .boundingBox())!;
    expect(first.x).toBeGreaterThan(second.x); // first column on the right
  });

  test('MD-02 code block: left-to-right, monospace, language label, copy button at the top left', async ({
    page,
  }) => {
    const answer = await markdownUser(
      page,
      'هذه الدالة:\n\n```python\ndef total(items):\n    return sum(items)\n```\n',
    );
    const code = answer.locator('pre code').first();
    await expect(code).toContainText('def total(items):');
    const block = code.locator('xpath=ancestor::*[@dir="ltr"][1]');
    await expect(block).toBeVisible();
    await expect(answer.getByText('python', { exact: true })).toBeVisible();
    const family = await code.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(family.toLowerCase()).toMatch(/mono|consolas|courier/);
    const copy = answer.getByRole('button', { name: t.message.copyCode });
    const copyBox = (await copy.boundingBox())!;
    const codeBox = (await code.boundingBox())!;
    expect(copyBox.x).toBeLessThan(codeBox.x + codeBox.width / 2);
    expect(copyBox.y).toBeLessThan(codeBox.y);
  });

  test('MD-03 Arabic paragraph right-to-left, English paragraph left-to-right', async ({
    page,
  }) => {
    const answer = await markdownUser(
      page,
      'هذه فقرة بالعربية.\n\nThis is an English paragraph.\n',
    );
    const direction = (needle: string) =>
      answer
        .locator('p', { hasText: needle })
        .evaluate((el) => getComputedStyle(el).direction);
    expect(await direction('فقرة بالعربية')).toBe('rtl');
    expect(await direction('English paragraph')).toBe('ltr');
  });

  test('MD-04 lists render, bold works, Arabic emphasis is not italic', async ({
    page,
  }) => {
    const answer = await markdownUser(
      page,
      '- **مهم** أول\n- ثاني *تأكيد*\n- third *emphasis*\n',
    );
    await expect(answer.getByRole('listitem')).toHaveCount(3);
    const weight = await answer
      .locator('strong')
      .evaluate((el) => Number(getComputedStyle(el).fontWeight));
    expect(weight).toBeGreaterThanOrEqual(600);
    const style = await answer
      .locator('em', { hasText: 'تأكيد' })
      .evaluate((el) => getComputedStyle(el).fontStyle);
    expect(style).not.toBe('italic');
  });

  test('MD-05 links open in a new tab', async ({ page }) => {
    const answer = await markdownUser(
      page,
      'زر [ويكيبيديا](https://ar.wikipedia.org) للمزيد.',
    );
    const link = answer.getByRole('link', { name: 'ويكيبيديا' });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAttribute('href', 'https://ar.wikipedia.org');
  });

  test('MD-06 a Markdown image is never loaded; its alt text shows as a link', async ({
    page,
  }) => {
    await createChatUser(page);
    const external: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('example.com')) external.push(req.url());
    });
    await openNewChat(page);
    // The real echo model repeats the text, so the whole path is real.
    await sendAndWait(page, '![x](https://example.com/a.png)');
    const answer = answers(page).last();
    await expect(answer.getByRole('link', { name: 'x' })).toBeVisible();
    await expect(answer.locator('img')).toHaveCount(0);
    await page.waitForTimeout(500);
    expect(external).toEqual([]);
  });

  test('MD-07 HTML in the answer is shown as text: no bold, no script', async ({
    page,
  }) => {
    await createChatUser(page);
    let dialogs = 0;
    page.on('dialog', async (d) => {
      dialogs += 1;
      await d.dismiss();
    });
    await openNewChat(page);
    await sendAndWait(page, '<b>نص</b> <script>alert(1)</script>');
    const answer = answers(page).last();
    await expect(answer).toContainText('<b>نص</b>');
    await expect(answer).toContainText('<script>alert(1)</script>');
    await expect(answer.locator('b, script')).toHaveCount(0);
    expect(dialogs).toBe(0);
  });

  test('MD-08 while streaming, no raw Markdown markers flash on screen', async ({
    page,
  }) => {
    await createChatUser(page);
    await slowStreams(page, 120);
    await openNewChat(page);
    await composer(page).fill(
      'هذا **نص عريض طويل جدا** ثم `رمز برمجي داخل السطر` وبعده **عريض آخر هنا** وانتهى',
    );
    await sendButton(page).click();
    const answer = answers(page).last();
    await expect(answer).toContainText('Echo');
    const seen: string[] = [];
    while (await stopButton(page).isVisible()) {
      seen.push((await answer.innerText().catch(() => '')) ?? '');
      await page.waitForTimeout(40);
    }
    expect(seen.length).toBeGreaterThan(3);
    for (const snapshot of seen) {
      expect(snapshot).not.toContain('**');
      expect(snapshot).not.toContain('`');
    }
    await expect(answer).toHaveAttribute('data-state', 'complete');
  });

  test('MD-09 your own message is plain text, exactly as typed', async ({
    page,
  }) => {
    await createChatUser(page);
    await openNewChat(page);
    await sendAndWait(page, 'اكتب **نص** هنا');
    const mine = page
      .getByRole('main')
      .getByText('اكتب **نص** هنا', { exact: true });
    await expect(mine).toBeVisible();
    await expect(mine.locator('strong')).toHaveCount(0);
  });
});

test.describe('3.4 stop, failures and background streams', () => {
  test('CH-15 Stop mid-way keeps the text so far with the "cut short" note', async ({
    page,
  }) => {
    await createChatUser(page);
    // The real echo answer, but the stream stays open after 8 events (started
    // + 7 words) until the user presses Stop.
    await slowStreams(page, 80);
    await openNewChat(page);
    await holdStreamAfter(page, 8);
    let stopped = false;
    // After Stop the app reads the server's final state: the answer the server
    // kept as a partial one (the echo model finishes instantly, so the test
    // plays the server's part by cutting the stored answer short).
    await page.route(/\/messages\?/, async (route) => {
      if (route.request().method() !== 'GET' || !stopped)
        return route.fallback();
      const response = await route.fetch();
      const body = (await response.json()) as {
        items: {
          role: string;
          content: string;
          status: string;
          finishReason: string;
        }[];
      };
      body.items = body.items.map((m) =>
        m.role === 'assistant'
          ? {
              ...m,
              status: 'partial',
              finishReason: 'aborted',
              content: m.content.split(' ').slice(0, 6).join(' '),
            }
          : m,
      );
      await route.fulfill({ response, json: body });
    });
    await composer(page).fill(longPrompt(80));
    await sendButton(page).click();
    const answer = answers(page).last();
    await expect(answer).toContainText('كلمة3');
    await expect(answer).toHaveAttribute('data-state', 'streaming');
    stopped = true;
    await stopButton(page).click();
    await expect(stopButton(page)).toBeHidden();
    await expect(answer).toHaveAttribute('data-state', 'stopped');
    await expect(answer).toContainText('Echo');
    await expect(answer.getByText(t.message.cut)).toBeVisible();
    await expect(sendButton(page)).toBeVisible();
  });

  test('CH-16 Stop before any text: your message leaves the list and returns to the box', async ({
    page,
  }) => {
    await createChatUser(page);
    // The request is accepted but nothing is answered yet.
    let release: () => void = () => undefined;
    const held = new Promise<void>((resolve) => (release = resolve));
    let seen: () => void = () => undefined;
    const requested = new Promise<void>((resolve) => (seen = resolve));
    await page.route(
      /\/api\/v1\/conversations\/[^/]+\/messages$/,
      async (route) => {
        if (route.request().method() !== 'POST') return route.fallback();
        seen();
        await held;
        await route.abort().catch(() => undefined);
      },
    );
    await openNewChat(page);
    const prompt = 'رسالة ستتوقف قبل الرد';
    await composer(page).fill(prompt);
    await sendButton(page).click();
    await expect(stopButton(page)).toBeVisible();
    // Stop only has a request to cancel once the send was issued.
    await requested;
    await stopButton(page).click();
    // The composer's textarea holds the same text, so look outside it.
    await expect(
      page
        .getByRole('main')
        .getByText(prompt, { exact: true })
        .and(page.locator(':not(textarea)')),
    ).toHaveCount(0);
    await expect(composer(page)).toHaveValue(prompt);
    await expect(sendButton(page)).toBeVisible();
    release();
  });

  test('CH-17 an answer cut by the length limit keeps its text with the "cut short" note', async ({
    page,
  }) => {
    await createChatUser(page);
    await mockChatServer(page, {
      answer: 'نص طويل قُطع عند الحد الأقصى',
      end: { kind: 'cut' },
    });
    await openNewChat(page);
    await composer(page).fill('اكتب نصًا طويلًا جدًا');
    await sendButton(page).click();
    const answer = answers(page).last();
    await expect(answer).toHaveAttribute('data-state', 'cut');
    await expect(answer).toContainText('نص طويل قُطع');
    await expect(answer.getByText(t.message.cut)).toBeVisible();
  });

  test('CH-18 an answer in another conversation shows "writing…" in the list and completes in the background', async ({
    page,
    isMobile,
  }) => {
    const user = await createChatUser(page);
    const otherTitle = `محادثة أخرى ${Date.now()}`;
    await seedConversation(user.token, otherTitle);
    await slowStreams(page, 400);
    await openNewChat(page);
    const prompt = 'سؤال طويل بما يكفي ليظهر المؤشر في القائمة بوضوح تام';
    await composer(page).fill(prompt);
    await sendButton(page).click();
    await expect(page).toHaveURL(/\/chat\/[0-9a-f-]{36}$/);
    const streamingUrl = page.url();
    await expect(stopButton(page)).toBeVisible();

    // Leave for the other conversation while it is being written.
    let side = await openSidebar(page, isMobile);
    await side.getByRole('link', { name: new RegExp(otherTitle) }).click();
    await expect(page).not.toHaveURL(streamingUrl);
    side = await openSidebar(page, isMobile);
    const writing = side
      .getByRole('navigation', { name: text.shell.recent })
      .getByRole('link')
      .filter({ hasText: text.shell.writing });
    await expect(writing).toHaveCount(1);
    if (isMobile) await page.keyboard.press('Escape');

    // It finishes by itself; opening it again shows the complete answer.
    side = await openSidebar(page, isMobile);
    await side
      .getByRole('navigation', { name: text.shell.recent })
      .getByRole('link')
      .filter({ hasNotText: otherTitle })
      .first()
      .click();
    await expect(page).toHaveURL(streamingUrl);
    await expect(answers(page).last()).toHaveAttribute(
      'data-state',
      'complete',
      {
        timeout: 30_000,
      },
    );
    await expect(answers(page).last()).toContainText('Echo');
  });

  test('CH-19 reloading while the answer is being written shows "writing…" and settles', async ({
    page,
  }) => {
    const user = await createChatUser(page);
    const id = await seedConversation(user.token, 'سؤال سابق');
    const at = new Date().toISOString();
    const base = {
      modeKey: CHAT_FAST_KEY,
      errorCode: null,
      createdAt: at,
      attachments: [],
      costUsd: null,
      usage: null,
      finishReason: 'stop',
    };
    const userMessage = {
      ...base,
      id: '0190e0a0-0000-7000-8000-0000000000a1',
      sequence: 1,
      role: 'user',
      content: 'سؤال قيد الكتابة',
      status: 'complete',
      completedAt: at,
    };
    const assistant = (status: string, content: string) => ({
      ...base,
      id: '0190e0a0-0000-7000-8000-0000000000a2',
      sequence: 2,
      role: 'assistant',
      content,
      status,
      completedAt: status === 'streaming' ? null : at,
    });
    let settled = false;
    await page.route(/\/messages\?/, async (route) => {
      if (route.request().method() !== 'GET') return route.fallback();
      await route.fulfill({
        json: {
          items: [
            settled
              ? assistant('complete', 'اكتمل الرد')
              : assistant('streaming', ''),
            userMessage,
          ],
          nextBefore: null,
        },
      });
    });
    await page.goto(`/chat/${id}`);
    await expect(page.getByText(t.message.writing)).toBeVisible();
    settled = true;
    await expect(answers(page).last()).toHaveAttribute(
      'data-state',
      'complete',
      {
        timeout: 20_000,
      },
    );
    await expect(answers(page).last()).toContainText('اكتمل الرد');
  });

  test('CH-20 a send while the previous answer is still being written: busy notice, draft kept', async ({
    page,
  }) => {
    const user = await createChatUser(page);
    const id = await seedConversation(user.token, 'سؤال أول');
    await page.route(/\/api\/v1\/conversations\/[^/]+\/messages$/, (route) =>
      route.request().method() === 'POST'
        ? route.fulfill({
            status: 409,
            contentType: 'application/json',
            body: JSON.stringify({
              statusCode: 409,
              code: 'CONVERSATION_BUSY',
              message: 'dev',
            }),
          })
        : route.fallback(),
    );
    await page.goto(`/chat/${id}`);
    const draft = 'رسالة من التبويب الثاني';
    await composer(page).fill(draft);
    await sendButton(page).click();
    await expect(notice(page)).toContainText(t.notice.busy);
    await expect(composer(page)).toHaveValue(draft);
  });

  test('CH-21 a stream that ends without a result: the answer is reloaded from the server, nothing is sent twice', async ({
    page,
  }) => {
    await createChatUser(page);
    const { sent } = await mockChatServer(page, {
      answer: 'رد استقر على الخادم كاملًا',
      end: { kind: 'drop', settled: 'complete' },
    });
    await openNewChat(page);
    await composer(page).fill('سؤال ينقطع اتصاله');
    await sendButton(page).click();
    const answer = answers(page).last();
    await expect(answer).toHaveAttribute('data-state', 'complete', {
      timeout: 15_000,
    });
    await expect(answer).toContainText('رد استقر على الخادم كاملًا');
    await page.waitForTimeout(800);
    expect(sent).toHaveLength(1);
  });

  test('CH-22 send fails on the network: notice with retry, draft kept, retry sends exactly once; offline disables Send', async ({
    page,
    context,
  }) => {
    const user = await createChatUser(page);
    let fail = true;
    const sentIds: string[] = [];
    await page.route(
      /\/api\/v1\/conversations\/[^/]+\/messages$/,
      async (route) => {
        if (route.request().method() !== 'POST') return route.fallback();
        sentIds.push(
          (route.request().postDataJSON() as { clientRequestId: string })
            .clientRequestId,
        );
        if (fail) return route.abort('connectionreset');
        return route.fallback();
      },
    );
    await openNewChat(page);
    const prompt = 'رسالة تحتاج إعادة المحاولة';
    await composer(page).fill(prompt);
    await sendButton(page).click();
    await expect(notice(page)).toContainText(text.common.networkError);
    await expect(composer(page)).toHaveValue(prompt);
    fail = false;
    await notice(page).getByRole('button', { name: text.common.retry }).click();
    await expect(answers(page).last()).toHaveAttribute(
      'data-state',
      'complete',
      {
        timeout: 20_000,
      },
    );
    expect(sentIds).toHaveLength(2);
    expect(sentIds[1]).toBe(sentIds[0]);
    // One user message on the server.
    const list = await fetch(`${API}/api/v1/conversations?limit=5`, {
      headers: { Authorization: `Bearer ${user.token}` },
    }).then((r) => r.json() as Promise<{ items: { id: string }[] }>);
    const messages = await fetch(
      `${API}/api/v1/conversations/${list.items[0]!.id}/messages`,
      { headers: { Authorization: `Bearer ${user.token}` } },
    ).then((r) => r.json() as Promise<{ items: { role: string }[] }>);
    expect(messages.items.filter((m) => m.role === 'user')).toHaveLength(1);

    // Truly offline: Send is disabled (with its reason) and the draft stays.
    await composer(page).fill('رسالة بلا اتصال');
    await context.setOffline(true);
    await expect(sendButton(page)).toBeDisabled();
    await expect(sendButton(page)).toHaveAttribute(
      'title',
      t.composer.sendOffline,
    );
    await expect(composer(page)).toHaveValue('رسالة بلا اتصال');
    await context.setOffline(false);
    await expect(sendButton(page)).toBeEnabled();
  });

  test('CH-23 coming back to the tab brings the conversation and balance up to date', async ({
    page,
  }) => {
    const user = await createChatUser(page);
    const id = await seedConversation(user.token, 'سؤال قبل المغادرة');
    await page.goto(`/chat/${id}`);
    await expect(answers(page)).toHaveCount(1);
    const chip = page.locator('[data-slot="balance-chip"]');
    // While the user is away, another device sends a message in this conversation.
    const sent = await apiSend(user.token, id, 'رسالة من جهاز آخر');
    expect(sent.status).toBe(200);
    // Coming back reloads the messages and the balance.
    const balanceReloaded = page.waitForResponse(
      (r) => r.url().endsWith('/api/v1/me/balance') && r.status() === 200,
    );
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await balanceReloaded;
    await expect(answers(page)).toHaveCount(2);
    await expect(
      page.getByRole('main').getByText('رسالة من جهاز آخر', { exact: true }),
    ).toBeVisible();
    await expect(chip).toBeVisible();
  });

  test('CH-24 a blocked answer: failed card with the policy message; retry re-sends as a new message', async ({
    page,
  }) => {
    await createChatUser(page);
    const { sent } = await mockChatServer(page, {
      answer: '',
      end: { kind: 'error', code: 'CONTENT_BLOCKED' },
    });
    await openNewChat(page);
    const prompt = 'طلب يرفضه المزود';
    await composer(page).fill(prompt);
    await sendButton(page).click();
    const card = answers(page).last();
    await expect(card).toHaveAttribute('data-state', 'failed');
    await expect(card.getByRole('alert')).toHaveText(errors.CONTENT_BLOCKED);
    await card.getByRole('button', { name: t.message.retry }).click();
    await expect.poll(() => sent.length).toBe(2);
    expect(sent[1]?.content).toBe(prompt);
    expect(sent[1]?.clientRequestId).not.toBe(sent[0]?.clientRequestId);
  });
});

test.describe('3.5 refusals', () => {
  test('RF-01 no plan: warning from the start, Send disabled, Enter sends nothing and creates no conversation', async ({
    page,
  }) => {
    await createNoPlanUser(page);
    const posts: string[] = [];
    page.on('request', (req) => {
      if (req.method() === 'POST' && /\/api\/v1\/conversations/.test(req.url()))
        posts.push(req.url());
    });
    await page.goto('/chat');
    await expect(page.getByText(text.balance.noPlan).first()).toBeVisible();
    await expect(
      page.getByRole('button', { name: t.notice.contactUs }),
    ).toBeVisible();
    await expect(sendButton(page)).toBeDisabled();
    await composer(page).fill('هل يصل هذا؟');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    expect(posts).toEqual([]);
    await expect(page).toHaveURL(/\/chat$/);
  });

  test('RF-02 the contact button opens the request-balance dialog; Escape returns focus; draft kept', async ({
    page,
  }) => {
    await createNoPlanUser(page);
    await page.goto('/chat');
    const draft = 'مسودة تبقى';
    await composer(page).fill(draft);
    const contact = page.getByRole('button', { name: t.notice.contactUs });
    // Keyboard open: Safari does not focus a button on click, so there is nothing to return to.
    await contact.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: t.requestBalance.title });
    await expect(dialog).toBeVisible();
    // Contact channels come from the brand config (today: the email only).
    const links = dialog.getByRole('link');
    await expect(links).toHaveCount(1);
    await expect(links.first()).toHaveAttribute(
      'href',
      `mailto:${brand.contact.email}`,
    );
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(contact).toBeFocused();
    await expect(composer(page)).toHaveValue(draft);
  });

  test('RF-03 RF-04 RF-05 insufficient for the second mode: switch offered, switching sends nothing, then send works', async ({
    page,
  }) => {
    // $0.02 is above the first mode's reservation and below the second's.
    await createChatUser(page, { balanceUsd: '0.02' });
    const sends = trackSends(page);
    await openNewChat(page);
    await modeTrigger(page).click();
    await page
      .getByRole('menuitemradio', { name: new RegExp(CHAT_PRO_LABEL) })
      .click();
    const prompt = 'سؤال أغلى من الرصيد';
    await composer(page).fill(prompt);
    await sendButton(page).click();

    // RF-03
    const n = notice(page);
    await expect(n).toContainText('رصيدك غير كافٍ');
    await expect(n).toContainText(CHAT_PRO_LABEL);
    await expect(n.locator('bdi', { hasText: /^0\.02(00)?\$$/ })).toBeVisible();
    const switchButton = n.getByRole('button', {
      name: new RegExp(`التبديل إلى.*${CHAT_FAST_LABEL}`),
    });
    await expect(switchButton).toBeVisible();
    await expect(composer(page)).toHaveValue(prompt);
    expect(sends).toHaveLength(1);

    // RF-04
    await switchButton.click();
    await expect(modeTrigger(page)).toContainText(CHAT_FAST_LABEL);
    await page.waitForTimeout(600);
    expect(sends).toHaveLength(1); // nothing sent by switching
    await expect(n).toContainText(CHAT_PRO_LABEL);
    await expect(n.getByRole('button', { name: /التبديل إلى/ })).toHaveCount(0);

    // RF-05
    await sendButton(page).click();
    await expect(answers(page).last()).toHaveAttribute(
      'data-state',
      'complete',
      {
        timeout: 20_000,
      },
    );
    await expect(answers(page).last()).toContainText('Echo');
    expect(sends).toHaveLength(2);
  });

  test('RF-06 not enough for any mode: no switch, contact option opens the dialog', async ({
    page,
  }) => {
    await createChatUser(page, { balanceUsd: '0.001' });
    await openNewChat(page);
    await composer(page).fill('سؤال بلا رصيد');
    await sendButton(page).click();
    const n = notice(page);
    await expect(n).toContainText('رصيدك غير كافٍ');
    await expect(n.getByRole('button', { name: /التبديل إلى/ })).toHaveCount(0);
    await n.getByRole('button', { name: t.notice.requestBalance }).click();
    await expect(
      page.getByRole('dialog', { name: t.requestBalance.title }),
    ).toBeVisible();
  });

  test('RF-07 more than 20 messages in a minute: countdown, Send disabled, draft kept', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const user = await createChatUser(page, { balanceUsd: '1.00' });
    const id = await apiCreateConversation(user.token);
    // 20 short messages use up the per-minute allowance (real rate limiter).
    for (let i = 0; i < 20; i++) {
      const { status } = await apiSend(user.token, id, `رسالة ${i}`);
      expect(status).toBe(200);
    }
    await page.clock.install({ time: new Date() });
    await page.goto(`/chat/${id}`);
    await expect(modeTrigger(page)).toBeEnabled();
    const draft = 'الرسالة الحادية والعشرون';
    await composer(page).fill(draft);
    await sendButton(page).click();
    const n = notice(page);
    await expect(n).toContainText('أرسلت رسائل كثيرة');
    await expect(n).toContainText('حاول بعد');
    await expect(sendButton(page)).toBeDisabled();
    await expect(composer(page)).toHaveValue(draft);
    // The countdown is live.
    // The live badge (the visible number); the screen-reader text keeps the full wait.
    const read = async () =>
      Number(await n.locator('span.tabular-nums').textContent());
    const start = await read();
    await page.clock.runFor(5_000);
    await expect.poll(read).toBeLessThan(start);
    await page.clock.runFor(70_000);
    await expect(n).toBeHidden();
    await expect(sendButton(page)).toBeEnabled();
    await expect(composer(page)).toHaveValue(draft);
  });

  test('RF-08 more than 20,000 characters: validation error under the box, draft kept', async ({
    page,
  }) => {
    await createChatUser(page);
    await openNewChat(page);
    const huge = 'ب'.repeat(20_001);
    await composer(page).fill(huge);
    await sendButton(page).click();
    await expect(composer(page)).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#composer-error')).toBeVisible();
    await expect(composer(page)).toHaveValue(huge);
  });

  test('RF-09 a mode removed from the plan while selected: not-available notice, selection falls back, nothing sent automatically', async ({
    page,
  }) => {
    // The case disables the mode; here the mode leaves the user's own plan so
    // other tests that share the e2e modes are not affected (same API error).
    await ensureChatFixtures();
    const user = await createChatUser(page);
    const sends = trackSends(page);
    await openNewChat(page);
    await modeTrigger(page).click();
    await page
      .getByRole('menuitemradio', { name: new RegExp(CHAT_PRO_LABEL) })
      .click();
    await expect(modeTrigger(page)).toContainText(CHAT_PRO_LABEL);
    // Admin takes the second mode off the user's plan: a plan of their own.
    await moveToFastOnlyPlan(user.userId);
    const prompt = 'رسالة في وضع لم يعد متاحًا';
    await composer(page).fill(prompt);
    await sendButton(page).click();
    await expect(notice(page)).toContainText(errors.MODE_NOT_AVAILABLE);
    await expect(modeTrigger(page)).toContainText(CHAT_FAST_LABEL);
    await expect(composer(page)).toHaveValue(prompt);
    await page.waitForTimeout(600);
    // The app may refuse before sending or after one refused send; never a second send.
    expect(sends.length).toBeLessThanOrEqual(1);
  });

  test('RF-10 clearing the name while the chat is open: the next send goes to the complete-profile page', async ({
    page,
  }) => {
    const user = await createChatUser(page);
    await openNewChat(page);
    // §1.6: a blank name clears it on the server.
    const res = await fetch(`${API}/api/v1/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ fullName: '   ' }),
    });
    expect(res.status).toBeLessThan(300);
    await composer(page).fill('رسالة بلا اسم');
    await sendButton(page).click();
    await expect(page).toHaveURL(/\/complete-profile/);
    // It stays there (it used to bounce straight back to /chat).
    await expect(
      page.getByRole('heading', { name: text.auth.completeProfile.title }),
    ).toBeVisible();
    await page.waitForTimeout(800);
    await expect(page).toHaveURL(/\/complete-profile/);
    await fillStable(
      page.getByLabel(text.auth.fields.fullName),
      'مستخدم عاد اسمه',
    );
    await page
      .getByRole('button', { name: text.auth.completeProfile.submit })
      .click();
    await expect(page).toHaveURL(/\/chat$/);
  });
});

/** A one-off plan with only the first mode, for the user to be moved onto. */
async function moveToFastOnlyPlan(userId: string) {
  const { adminToken } = await import('../support');
  const token = await adminToken();
  const call = async (method: string, path: string, body: unknown) => {
    const res = await fetch(`${API}/api/v1${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (res.status >= 300) throw new Error(`${method} ${path} ${res.status}`);
  };
  const key = `e2e-fast-only`;
  const plans = (await (
    await fetch(`${API}/api/v1/admin/plans`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).json()) as { key: string }[];
  if (!plans.some((p) => p.key === key)) {
    await call('POST', '/admin/plans', {
      reason: 'e2e RF-09',
      key,
      nameAr: 'سريع فقط e2e',
      nameEn: 'Fast only e2e',
      descriptionAr: 'باقة اختبار',
      descriptionEn: 'Test plan',
      monthlyPriceUsd: '0',
      sortOrder: 902,
      isPublic: false,
      isActive: true,
      modeKeys: [CHAT_FAST_KEY],
    });
  }
  await activatePlan(userId, key);
}
