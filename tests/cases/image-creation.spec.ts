import { expect, test, type Page } from '@playwright/test';
import { deflateSync, crc32 } from 'node:zlib';
import Decimal from 'decimal.js';
import { lam7a as brand } from '../../src/brand/lam7a';
import errors from '../../src/i18n/errors.ar.json' with { type: 'json' };
import {
  ADMIN_SKIP_MESSAGE,
  API,
  CHAT_FAST_LABEL,
  CHAT_PRO_LABEL,
  IMAGE_MODE_KEY,
  IMAGE_MODE_LABEL,
  LITE_MODE_LABEL,
  MAX_MODE_LABEL,
  SKIP_MESSAGE,
  adminCall,
  adminCredentials,
  adminContext,
  apiBalance,
  apiCreateConversation,
  apiSend,
  createMixedUser,
  ensureImageFixtures,
  expectNoHorizontalScroll,
  holdStreamAfter,
  mockChatServer,
  openSidebar,
  signIn,
  signOutViaUi,
  slowStreams,
  stackReachable,
  text,
} from '../support';

// MANUAL_TEST_CASES.md §3d (image creation), one test per case ID. Free and
// offline: the backend's `mock` provider answers an image mode with
// "Echo: ..." plus a small red square (ensureMixedFixtures in support.ts adds
// the `e2e-design` / `e2e-design-lite` image modes beside the two text modes).
// Where the mock cannot produce the situation (a refusal, an answer without
// text, a text-only answer) the send POST is route-mocked or rewritten.
//
// Left manual:
// - IC-03, IC-04: need a real image model (an edit that follows the photo's
//   shape / the previous image); the mock always returns a red square.
// - IC-25: screen reader announcements.
// - The part of IC-02 / IC-09 that says "the image comes back in that shape"
//   (real model); the mock's fixed square cannot show it. The placeholder shape
//   and the stored-image behaviour are automated.
// Differences from the manual wording:
// - IC-28: the real rule needs a keyed non-Gemini provider (a real key), so
//   the modes list answer is simulated; the screen's rendering of the reason
//   is what is checked.

let stackUp = false;
test.beforeAll(async () => {
  stackUp = await stackReachable();
});
test.beforeEach(() => {
  test.skip(!stackUp, SKIP_MESSAGE);
  test.skip(!adminCredentials(), ADMIN_SKIP_MESSAGE);
});

const t = text.chat;
const img = t.image;
const a = text.admin;

const composer = (page: Page) =>
  page.getByRole('textbox', { name: t.composer.label });
const sendButton = (page: Page) =>
  page.getByRole('button', { name: t.composer.send });
const stopButton = (page: Page) =>
  page.getByRole('button', { name: t.composer.stop });
const modeTrigger = (page: Page) =>
  page.getByRole('button', { name: t.composer.modeMenu });
const ratioButton = (page: Page) =>
  page.getByRole('button', { name: new RegExp(img.ratio) });
const answers = (page: Page) => page.getByRole('article');
const notice = (page: Page) => page.locator('[data-slot="chat-notice"]');
const creating = (page: Page) =>
  page.getByRole('status', { name: img.creating });
const chip = (page: Page) => page.locator('[data-slot="balance-chip"]');
const createdImage = (page: Page) =>
  answers(page).last().getByRole('img', { name: img.generatedAlt });

/** Requests that send a message (the stream POST), with their JSON bodies. */
function trackSends(page: Page): Record<string, unknown>[] {
  const bodies: Record<string, unknown>[] = [];
  page.on('request', (req) => {
    if (
      req.method() === 'POST' &&
      /\/conversations\/[^/]+\/messages$/.test(req.url())
    )
      bodies.push(req.postDataJSON() as Record<string, unknown>);
  });
  return bodies;
}

async function openNewChat(page: Page) {
  await page.goto('/chat');
  await expect(modeTrigger(page)).toBeEnabled();
}

async function pickMode(page: Page, label: string) {
  await modeTrigger(page).click();
  await page.getByRole('menuitemradio', { name: new RegExp(label) }).click();
  await expect(modeTrigger(page)).toContainText(label);
}

async function pickRatio(page: Page, ratio: string | null) {
  await ratioButton(page).click();
  await page
    .getByRole('menuitemradio', {
      name: ratio === null ? img.ratioAuto : new RegExp(ratio),
    })
    .click();
  await expect(ratioButton(page)).toContainText(ratio ?? img.ratioAuto);
}

/** New chat in the image mode, send, wait for the picture. Returns the conversation URL. */
async function createImage(
  page: Page,
  prompt: string,
  ratio: string | null = null,
): Promise<string> {
  await openNewChat(page);
  await pickMode(page, IMAGE_MODE_LABEL);
  if (ratio) await pickRatio(page, ratio);
  await composer(page).fill(prompt);
  await sendButton(page).click();
  await expect(page).toHaveURL(/\/chat\/[0-9a-f-]{36}$/);
  await expect(answers(page).last()).toHaveAttribute('data-state', 'complete', {
    timeout: 45_000,
  });
  await expect(createdImage(page)).toBeVisible({ timeout: 30_000 });
  return page.url();
}

/** A valid solid-colour PNG (no files to ship). */
function makePng(width: number, height: number): Buffer {
  const chunk = (type: string, data: Buffer) => {
    const body = Buffer.concat([Buffer.from(type), data]);
    const out = Buffer.alloc(body.length + 8);
    out.writeUInt32BE(data.length, 0);
    body.copy(out, 4);
    out.writeUInt32BE(crc32(body), body.length + 4);
    return out;
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // RGB
  const row = Buffer.concat([
    Buffer.from([0]),
    Buffer.from(Array.from({ length: width }, () => [200, 60, 40]).flat()),
  ]);
  const raw = Buffer.concat(Array.from({ length: height }, () => row));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** The text of an answer card without its action buttons. */
const SEND_URL = /\/api\/v1\/conversations\/[^/]+\/messages$/;

/** Rewrites the real stream: no text deltas and an empty answer text. */
async function dropAnswerText(page: Page) {
  await page.route(SEND_URL, async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    const response = await route.fetch();
    const raw = await response.text();
    const body = raw
      .split('\n\n')
      .filter(Boolean)
      .flatMap((block) => {
        const event = /^event: (.*)$/m.exec(block)?.[1];
        const data = /^data: (.*)$/m.exec(block)?.[1];
        if (event === 'delta' || !event || !data) return [];
        const parsed = JSON.parse(data) as Record<string, unknown>;
        for (const key of ['message', 'assistantMessage']) {
          const message = parsed[key] as { content?: string } | undefined;
          if (message) message.content = '';
        }
        return [`event: ${event}\ndata: ${JSON.stringify(parsed)}\n\n`];
      })
      .join('');
    await route.fulfill({
      status: response.status(),
      headers: response.headers(),
      body,
    });
  });
  await page.route(/\/messages\?/, async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    const response = await route.fetch();
    const json = (await response.json()) as {
      items: { role: string; content: string }[];
    };
    json.items = json.items.map((m) =>
      m.role === 'assistant' ? { ...m, content: '' } : m,
    );
    await route.fulfill({ response, json });
  });
}

test.describe('3d creating images', () => {
  test('IC-01 image mode: badge in the menu, image empty state, idea chips fill the box and never send', async ({
    page,
  }) => {
    await createMixedUser(page);
    const sends = trackSends(page);
    await openNewChat(page);
    await modeTrigger(page).click();
    const items = page.getByRole('menuitemradio');
    await expect(items).toHaveCount(5);
    for (const label of [IMAGE_MODE_LABEL, LITE_MODE_LABEL, MAX_MODE_LABEL]) {
      await expect(
        items.filter({ hasText: new RegExp(label) }).first(),
      ).toContainText(img.imageBadge);
    }
    await expect(items.filter({ hasText: CHAT_FAST_LABEL })).not.toContainText(
      img.imageBadge,
    );
    await items.filter({ hasText: new RegExp(IMAGE_MODE_LABEL) }).click();

    const main = page.getByRole('main');
    await expect(
      main.getByRole('heading', { name: t.emptyImage.title }),
    ).toBeVisible();
    await expect(main.getByText(t.emptyImage.hint)).toBeVisible();
    const chips = main.getByRole('list').getByRole('button');
    await expect(chips).toHaveCount(4);
    for (const key of ['chip1', 'chip2', 'chip3', 'chip4'] as const) {
      await expect(chips.filter({ hasText: t.emptyImage[key] })).toHaveCount(1);
    }
    await chips.filter({ hasText: t.emptyImage.chip3 }).click();
    await expect(composer(page)).toHaveValue(t.emptyImage.chip3);
    await page.waitForTimeout(500);
    expect(sends).toEqual([]);
  });

  test('IC-02 each ratio: while creating, the placeholder has that shape', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await createMixedUser(page);
    await slowStreams(page, 50);
    for (const ratio of ['1:1', '3:4', '4:3', '9:16', '16:9']) {
      await openNewChat(page);
      await holdStreamAfter(page, 1); // "started", then silence: still creating
      await pickMode(page, IMAGE_MODE_LABEL);
      await pickRatio(page, ratio);
      await composer(page).fill(`صورة بنسبة ${ratio}`);
      await sendButton(page).click();
      await expect(creating(page)).toBeVisible();
      await expect(creating(page)).toHaveCSS(
        'aspect-ratio',
        ratio.replace(':', ' / '),
      );
    }
  });

  test('IC-05 an answer with an image and no text shows only the image and its actions', async ({
    page,
  }) => {
    await createMixedUser(page);
    await dropAnswerText(page);
    await openNewChat(page);
    await pickMode(page, IMAGE_MODE_LABEL);
    await composer(page).fill('صورة بلا نص');
    await sendButton(page).click();
    const card = answers(page).last();
    await expect(card).toHaveAttribute('data-state', 'complete', {
      timeout: 45_000,
    });
    await expect(createdImage(page)).toBeVisible({ timeout: 30_000 });
    await expect(card.getByText('Echo')).toHaveCount(0);
    await expect(card.getByText(t.message.writing)).toHaveCount(0);
    await expect(card.getByText(t.message.preparing)).toHaveCount(0);
    await expect(card.getByText(text.shell.writing)).toHaveCount(0);
    // Nothing but the two actions around the picture: no empty text block.
    const words = ((await card.innerText()) ?? '')
      .replace(img.openFull, '')
      .replace(img.download, '')
      .replace(t.message.copy, '')
      .replace(brand.monogram, '')
      .replace(brand.name.ar, '')
      .replace(IMAGE_MODE_LABEL, '')
      .trim();
    expect(words).toBe('');
  });

  test('IC-06 a text-only answer in the image mode is a normal answer card; the placeholder goes away', async ({
    page,
  }) => {
    await createMixedUser(page);
    await mockChatServer(page, { answer: 'لا أستطيع إنشاء هذه الصورة' });
    await openNewChat(page);
    await pickMode(page, IMAGE_MODE_LABEL);
    await composer(page).fill('طلب يرد عليه النموذج بنص');
    await sendButton(page).click();
    const card = answers(page).last();
    await expect(card).toHaveAttribute('data-state', 'complete');
    await expect(card).toContainText('لا أستطيع إنشاء هذه الصورة');
    await expect(creating(page)).toHaveCount(0);
    await expect(card.getByRole('img')).toHaveCount(0);
  });

  test('IC-07 IC-10 a blocked request: red card with the policy text; retry sends again with the same ratio', async ({
    page,
  }) => {
    await createMixedUser(page);
    const { sent } = await mockChatServer(page, {
      answer: '',
      end: { kind: 'error', code: 'CONTENT_BLOCKED' },
    });
    await openNewChat(page);
    await pickMode(page, IMAGE_MODE_LABEL);
    await pickRatio(page, '16:9');
    const prompt = 'طلب غير مسموح';
    await composer(page).fill(prompt);
    await sendButton(page).click();
    const card = answers(page).last();
    await expect(card).toHaveAttribute('data-state', 'failed');
    await expect(card.getByRole('alert')).toHaveText(errors.CONTENT_BLOCKED);
    await expect(creating(page)).toHaveCount(0);
    expect(sent[0]).toMatchObject({ imageOptions: { aspectRatio: '16:9' } });

    // IC-10: the retry keeps the ratio and the mode.
    await card.getByRole('button', { name: t.message.retry }).click();
    await expect.poll(() => sent.length).toBe(2);
    expect(sent[1]?.content).toBe(prompt);
    expect(sent[1]).toMatchObject({
      modeKey: IMAGE_MODE_KEY,
      imageOptions: { aspectRatio: '16:9' },
    });
    await expect(ratioButton(page)).toContainText('16:9');
  });

  test('IC-08 Stop before the image arrives: the message returns to the box, as in CH-16', async ({
    page,
  }) => {
    await createMixedUser(page);
    await openNewChat(page);
    // Hold the send so Stop lands before any stream event (once `started`
    // arrives the app keeps a card instead, which IC-09 covers).
    let sends = 0;
    let release: () => void = () => undefined;
    const held = new Promise<void>((resolve) => (release = resolve));
    let seen: () => void = () => undefined;
    const requested = new Promise<void>((resolve) => (seen = resolve));
    await page.route(
      /\/api\/v1\/conversations\/[^/]+\/messages$/,
      async (route) => {
        if (route.request().method() !== 'POST') return route.fallback();
        sends++;
        seen();
        await held;
        await route.abort().catch(() => undefined);
      },
    );
    await pickMode(page, IMAGE_MODE_LABEL);
    const prompt = 'صورة سيتم إيقافها';
    await composer(page).fill(prompt);
    await sendButton(page).click();
    await expect(stopButton(page)).toBeVisible();
    await requested;
    await stopButton(page).click();
    await expect(stopButton(page)).toBeHidden();
    await expect(sendButton(page)).toBeVisible();
    await expect(creating(page)).toHaveCount(0);
    await expect(answers(page)).toHaveCount(0);
    // The composer's textarea holds the same text, so look outside it.
    await expect(
      page
        .getByRole('main')
        .getByText(prompt, { exact: true })
        .and(page.locator(':not(textarea)')),
    ).toHaveCount(0);
    await expect(composer(page)).toHaveValue(prompt);
    // Stop is not taken as a second Send.
    await page.waitForTimeout(600);
    expect(sends).toBe(1);
    release();
  });

  test('IC-09 Stop after the image arrived: the image stays with the cut-short note', async ({
    page,
  }) => {
    await createMixedUser(page);
    await slowStreams(page, 30);
    await openNewChat(page);
    // started + two text pieces + the picture, then silence until Stop.
    await holdStreamAfter(page, 4);
    let stopped = false;
    await page.route(/\/messages\?/, async (route) => {
      if (route.request().method() !== 'GET' || !stopped)
        return route.fallback();
      const response = await route.fetch();
      const json = (await response.json()) as {
        items: Record<string, unknown>[];
      };
      json.items = json.items.map((m) =>
        m.role === 'assistant'
          ? { ...m, status: 'partial', finishReason: 'aborted' }
          : m,
      );
      await route.fulfill({ response, json });
    });
    await pickMode(page, IMAGE_MODE_LABEL);
    await composer(page).fill('x'); // answer "Echo: x": two text pieces
    await sendButton(page).click();
    await expect(createdImage(page)).toBeVisible({ timeout: 30_000 });
    await expect(stopButton(page)).toBeVisible();
    stopped = true;
    await stopButton(page).click();
    await expect(stopButton(page)).toBeHidden();
    await expect(createdImage(page)).toBeVisible();
    await expect(answers(page).last().getByText(t.message.cut)).toBeVisible();
  });
});

test.describe('3d mode and composer', () => {
  test("IC-11 the ratio chip hides in a text mode and returns with this conversation's last choice", async ({
    page,
  }) => {
    await createMixedUser(page);
    await openNewChat(page);
    await pickMode(page, IMAGE_MODE_LABEL);
    await pickRatio(page, '16:9');
    await pickMode(page, CHAT_FAST_LABEL);
    await expect(ratioButton(page)).toHaveCount(0);
    await pickMode(page, IMAGE_MODE_LABEL);
    await expect(ratioButton(page)).toContainText('16:9');
  });

  test('IC-12 IC-13 each conversation keeps its own ratio; a new chat keeps the chosen one after sending', async ({
    page,
    isMobile,
  }) => {
    test.setTimeout(120_000);
    await createMixedUser(page);
    const sends = trackSends(page);
    // A: 16:9 chosen in a new chat (IC-13).
    await createImage(page, 'محادثة أولى بنسبة عريضة', '16:9');
    expect(sends[0]).toMatchObject({ imageOptions: { aspectRatio: '16:9' } });
    await expect(ratioButton(page)).toContainText('16:9');
    // B: automatic.
    const sidebar = await openSidebar(page, isMobile);
    await sidebar.getByRole('link', { name: text.shell.newChat }).click();
    await expect(page).toHaveURL(/\/chat$/);
    await pickMode(page, IMAGE_MODE_LABEL);
    await pickRatio(page, null);
    await composer(page).fill('محادثة ثانية تلقائية');
    await sendButton(page).click();
    await expect(answers(page).last()).toHaveAttribute(
      'data-state',
      'complete',
      { timeout: 45_000 },
    );
    expect('imageOptions' in sends[1]!).toBe(false);
    await expect(ratioButton(page)).toContainText(img.ratioAuto);
    // Switch between them (in the app, no reload).
    const a1 = await openSidebar(page, isMobile);
    await a1.getByRole('link', { name: /محادثة أولى/ }).click();
    await expect(ratioButton(page)).toContainText('16:9');
    const b1 = await openSidebar(page, isMobile);
    await b1.getByRole('link', { name: /محادثة ثانية/ }).click();
    await expect(ratioButton(page)).toContainText(img.ratioAuto);
  });

  // App deviation (see the report): the mode chip stays enabled while an
  // answer is being written; only the ratio chip and Send are locked.
  test.fixme('IC-14 while an image is being created the mode chip is disabled too', async ({
    page,
  }) => {
    await createMixedUser(page);
    await slowStreams(page, 50);
    await openNewChat(page);
    await holdStreamAfter(page, 1);
    await pickMode(page, IMAGE_MODE_LABEL);
    await composer(page).fill('صورة قيد الإنشاء');
    await sendButton(page).click();
    await expect(creating(page)).toBeVisible();
    await expect(modeTrigger(page)).toBeDisabled();
  });

  test('IC-14 while an image is being created: ratio chip and Send are disabled; Stop is available', async ({
    page,
  }) => {
    await createMixedUser(page);
    await slowStreams(page, 50);
    await openNewChat(page);
    await holdStreamAfter(page, 1);
    await pickMode(page, IMAGE_MODE_LABEL);
    await composer(page).fill('صورة قيد الإنشاء');
    await sendButton(page).click();
    await expect(creating(page)).toBeVisible();
    await expect(stopButton(page)).toBeEnabled();
    await expect(sendButton(page)).toHaveCount(0);
    await expect(ratioButton(page)).toBeDisabled();
  });

  test('IC-15 in the image mode a photo can be attached as in the other modes that read images', async ({
    page,
  }) => {
    await createMixedUser(page);
    await openNewChat(page);
    await pickMode(page, IMAGE_MODE_LABEL);
    await page.getByTestId('image-input').setInputFiles({
      name: 'photo.png',
      mimeType: 'image/png',
      buffer: makePng(48, 64),
    });
    await expect(
      page.getByRole('list', { name: img.attachedList }),
    ).toBeVisible();
    await expect(page.getByText(img.uploaded)).toBeAttached();
    await expect(page.getByText(img.modeNotice)).toHaveCount(0);
    await composer(page).fill('اجعلها بأسلوب كرتوني');
    await expect(sendButton(page)).toBeEnabled();
    await sendButton(page).click();
    await expect(answers(page).last()).toHaveAttribute(
      'data-state',
      'complete',
      { timeout: 45_000 },
    );
    await expect(createdImage(page)).toBeVisible({ timeout: 30_000 });
  });
});

test.describe('3d viewing and download', () => {
  test('IC-16 the full-size viewer closes with Escape and with the close button, and focus returns to its opener', async ({
    page,
  }) => {
    await createMixedUser(page);
    await createImage(page, 'صورة للعرض الكامل');
    const opener = page.getByRole('button', { name: img.openFull });
    const viewer = page.getByRole('dialog', { name: img.view });
    // Opened by keyboard: WebKit does not focus a button on click.
    await opener.focus();
    await page.keyboard.press('Enter');
    await expect(viewer).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(viewer).toBeHidden();
    await expect(opener).toBeFocused();

    await opener.focus();
    await page.keyboard.press('Enter');
    await expect(viewer).toBeVisible();
    await viewer.getByRole('button', { name: img.close }).click();
    await expect(viewer).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('IC-17 download from the card and from the viewer saves lam7a-<id>.webp once per click', async ({
    page,
  }) => {
    await createMixedUser(page);
    await createImage(page, 'صورة للتنزيل');
    const downloads: string[] = [];
    page.on('download', (d) => downloads.push(d.suggestedFilename()));
    // Hold the file a moment so the "disabled while saving" state is visible.
    await page.route(/\/attachments\/[^/?]+\?.*download=1/, async (route) => {
      await new Promise((r) => setTimeout(r, 1200));
      await route.fallback();
    });
    const card = answers(page)
      .last()
      .getByRole('button', { name: img.download });
    const first = page.waitForEvent('download');
    await card.click();
    await expect(card).toBeDisabled();
    // Fast extra clicks while it saves do nothing.
    await card.click({ force: true });
    await card.click({ force: true });
    expect((await first).suggestedFilename()).toMatch(/^lam7a-.+\.webp$/);
    await expect(card).toBeEnabled();
    expect(downloads).toHaveLength(1);

    // From the viewer.
    const opener = page.getByRole('button', { name: img.openFull });
    await opener.focus();
    await page.keyboard.press('Enter');
    const viewer = page.getByRole('dialog', { name: img.view });
    const second = page.waitForEvent('download');
    await viewer.getByRole('button', { name: img.download }).click();
    expect((await second).suggestedFilename()).toMatch(/^lam7a-.+\.webp$/);
    expect(downloads).toHaveLength(2);
  });

  test('IC-18 images load after a reload, from the sidebar, and after signing out and in (placeholder first)', async ({
    page,
    isMobile,
  }) => {
    const user = await createMixedUser(page);
    const url = await createImage(page, 'صورة تبقى بعد التحديث');
    // Slow the picture so the placeholder is visible.
    await page.route(/\/attachments\/[^/?]+$/, async (route) => {
      await new Promise((r) => setTimeout(r, 600));
      await route.fallback();
    });
    const loading = page.getByRole('status', { name: img.loading });
    await page.reload();
    await expect(loading.first()).toBeVisible();
    await expect(createdImage(page)).toBeVisible({ timeout: 30_000 });

    await page.goto('/chat');
    const sidebar = await openSidebar(page, isMobile);
    await sidebar.getByRole('link', { name: /صورة تبقى بعد التحديث/ }).click();
    await expect(page).toHaveURL(url);
    await expect(createdImage(page)).toBeVisible({ timeout: 30_000 });

    await signOutViaUi(page);
    await signIn(page, user.email, user.password);
    const again = await openSidebar(page, isMobile);
    await again.getByRole('link', { name: /صورة تبقى بعد التحديث/ }).click();
    await expect(loading.first()).toBeVisible();
    await expect(createdImage(page)).toBeVisible({ timeout: 30_000 });
  });

  test('IC-19 another user opening the conversation gets not-found; the image cannot be fetched', async ({
    page,
    browser,
  }) => {
    const owner = await createMixedUser(page, { prefix: 'e2e-imgowner' });
    const url = await createImage(page, 'صورة خاصة');
    const id = url.split('/').pop()!;
    const messages = (await (
      await fetch(`${API}/api/v1/conversations/${id}/messages`, {
        headers: { Authorization: `Bearer ${owner.token}` },
      })
    ).json()) as { items: { attachments: { id: string }[] }[] };
    const attachmentId = messages.items.flatMap((m) => m.attachments)[0]!.id;

    const other = await browser.newContext({
      locale: 'ar',
      baseURL: 'http://localhost:3001',
    });
    try {
      const otherPage = await other.newPage();
      const stranger = await createMixedUser(otherPage, {
        prefix: 'e2e-imgother',
      });
      await otherPage.goto(url);
      await expect(
        otherPage.getByText(errors.CONVERSATION_NOT_FOUND),
      ).toBeVisible();
      await expect(
        otherPage.getByRole('link', { name: t.notFound.action }),
      ).toBeVisible();
      await expect(
        otherPage.getByRole('img', { name: img.generatedAlt }),
      ).toHaveCount(0);
      const res = await fetch(`${API}/api/v1/attachments/${attachmentId}`, {
        headers: { Authorization: `Bearer ${stranger.token}` },
      });
      expect(res.status).toBe(404);
    } finally {
      await other.close();
    }
  });
});

test.describe('3d balance and limits', () => {
  test('IC-20 the balance drops after an image and no per-answer price is shown', async ({
    page,
  }) => {
    const user = await createMixedUser(page);
    await openNewChat(page);
    await expect(page.getByRole('main')).toBeVisible();
    if (await chip(page).isVisible()) {
      await expect(chip(page)).toContainText('$');
    }
    const before = await apiBalance(user.token);
    const chipBefore = (await chip(page).isVisible())
      ? await chip(page).textContent()
      : null;
    await createImage(page, 'صورة تخصم من الرصيد');
    const after = await apiBalance(user.token);
    expect(Number(after)).toBeLessThan(Number(before));
    if (chipBefore !== null) {
      // The chip shows the new balance (rounded like the app: two decimals
      // from 0.01 up; the mock's charge is too small to change the figure).
      const value = new Decimal(after);
      const places = value.abs().gte('0.01') ? 2 : 4;
      await expect(chip(page)).toContainText(
        `${value.toDecimalPlaces(places, Decimal.ROUND_HALF_UP).toFixed(places)}$`,
      );
    }
    await expect(
      answers(page)
        .last()
        .getByText(/التكلفة|\$/),
    ).toHaveCount(0);
  });

  test('IC-21 balance near zero: only image modes are offered from an image mode and only text modes from a text mode; nothing sends or switches by itself', async ({
    page,
  }) => {
    // $0.02 is above the reservation of the fast, standard and cheap image modes
    // and below that of the dear image mode and of the pro text mode.
    await createMixedUser(page, { balanceUsd: '0.02' });
    const sends = trackSends(page);
    await openNewChat(page);
    await pickMode(page, MAX_MODE_LABEL);
    await composer(page).fill('صورة أغلى من الرصيد');
    await sendButton(page).click();
    const n = notice(page);
    await expect(n).toContainText('رصيدك غير كافٍ');
    await expect(n).toContainText(MAX_MODE_LABEL);
    const switches = n.getByRole('button', { name: /التبديل إلى/ });
    await expect(switches).toHaveCount(2);
    await expect(switches.filter({ hasText: IMAGE_MODE_LABEL })).toHaveCount(1);
    await expect(switches.filter({ hasText: LITE_MODE_LABEL })).toHaveCount(1);
    await expect(n).not.toContainText(CHAT_FAST_LABEL);
    expect(sends).toHaveLength(1);
    await page.waitForTimeout(500);
    expect(sends).toHaveLength(1);
    await expect(modeTrigger(page)).toContainText(MAX_MODE_LABEL);

    // The same from a text mode: only text modes.
    await pickMode(page, CHAT_PRO_LABEL);
    await sendButton(page).click();
    await expect(n).toContainText(CHAT_PRO_LABEL);
    await expect(switches).toHaveCount(1);
    await expect(switches).toContainText(CHAT_FAST_LABEL);
    await expect(n).not.toContainText(LITE_MODE_LABEL);
    await expect(n).not.toContainText(IMAGE_MODE_LABEL);
    await expect(modeTrigger(page)).toContainText(CHAT_PRO_LABEL);
    expect(sends).toHaveLength(2);
  });

  test('IC-22 many messages quickly in the image mode: rate-limit countdown, draft kept', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const user = await createMixedUser(page, { balanceUsd: '1.00' });
    const id = await apiCreateConversation(user.token);
    for (let i = 0; i < 20; i++) {
      const { status } = await apiSend(user.token, id, `رسالة ${i}`);
      expect(status).toBe(200);
    }
    await page.clock.install({ time: new Date() });
    await page.goto(`/chat/${id}`);
    await expect(modeTrigger(page)).toBeEnabled();
    await pickMode(page, IMAGE_MODE_LABEL);
    const draft = 'صورة بعد الحد';
    await composer(page).fill(draft);
    await sendButton(page).click();
    const n = notice(page);
    await expect(n).toContainText('أرسلت رسائل كثيرة');
    await expect(sendButton(page)).toBeDisabled();
    await expect(composer(page)).toHaveValue(draft);
    const read = async () =>
      Number(await n.locator('span.tabular-nums').textContent());
    const start = await read();
    await page.clock.runFor(5_000);
    await expect.poll(read).toBeLessThan(start);
    await page.clock.runFor(70_000);
    await expect(n).toBeHidden();
    await expect(composer(page)).toHaveValue(draft);
  });
});

test.describe('3d mobile and keyboard', () => {
  test('IC-23 phone width: the ratio menu is fully visible and a 9:16 image fits the screen', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'The 375px layout is a phone case.');
    await createMixedUser(page);
    await openNewChat(page);
    await pickMode(page, IMAGE_MODE_LABEL);
    await ratioButton(page).click();
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    const viewport = page.viewportSize()!;
    const box = (await menu.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
    await page.getByRole('menuitemradio', { name: /9:16/ }).click();
    await composer(page).fill('صورة طولية');
    await sendButton(page).click();
    await expect(createdImage(page)).toBeVisible({ timeout: 45_000 });
    await expectNoHorizontalScroll(page);
    const image = (await createdImage(page).boundingBox())!;
    expect(image.height).toBeLessThanOrEqual(520);
    expect(image.height).toBeLessThanOrEqual(viewport.height);
    expect(image.width).toBeLessThanOrEqual(viewport.width);
  });

  test('IC-24 keyboard only: ratio menu with the arrows, then open and download, with a visible focus ring', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'A physical keyboard is a desktop case.');
    await createMixedUser(page);
    await openNewChat(page);
    await pickMode(page, IMAGE_MODE_LABEL);
    const ring = async (locator: ReturnType<typeof ratioButton>) => {
      const style = await locator.evaluate((el) => {
        const s = getComputedStyle(el);
        return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
      });
      expect(style.style).not.toBe('none');
      expect(style.width).toBeGreaterThanOrEqual(2);
    };
    // Focused by keyboard (WebKit does not focus a button on click).
    await ratioButton(page).focus();
    await expect(ratioButton(page)).toBeFocused();
    await ring(ratioButton(page));
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu')).toBeVisible();
    // The menu opens on its first item (automatic); the arrows go on from it.
    const items = page.getByRole('menuitemradio');
    await expect(items.nth(0)).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(1)).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(2)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(ratioButton(page)).not.toContainText(img.ratioAuto);

    await composer(page).fill('صورة بلوحة المفاتيح');
    await composer(page).press('Enter');
    await expect(createdImage(page)).toBeVisible({ timeout: 45_000 });
    const open = page.getByRole('button', { name: img.openFull });
    await open.focus();
    await ring(open);
    await page.keyboard.press('Enter');
    const viewer = page.getByRole('dialog', { name: img.view });
    await expect(viewer).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(open).toBeFocused();
    const download = answers(page)
      .last()
      .getByRole('button', { name: img.download });
    await download.focus();
    await ring(download);
    const saved = page.waitForEvent('download');
    await page.keyboard.press('Enter');
    expect((await saved).suggestedFilename()).toMatch(/^lam7a-.+\.webp$/);
  });
});

test.describe('3d admin', () => {
  test('IC-26 a new image model reads images by force and needs at least 2,500 output tokens', async ({
    browser,
  }) => {
    await ensureImageFixtures();
    const providers = await adminCall<{ code: string; kind: string }[]>(
      'GET',
      '/admin/providers',
    );
    const mock = providers.find((p) => p.kind === 'mock')!;
    const context = await adminContext(browser);
    try {
      const admin = await context.newPage();
      const posts: string[] = [];
      admin.on('request', (req) => {
        if (req.method() === 'POST' && req.url().endsWith('/admin/models'))
          posts.push(req.url());
      });
      await admin.goto(`/admin/models/new?manual=true&provider=${mock.code}`);
      const field = (label: string) =>
        admin.getByLabel(new RegExp(`^${label.replace(/[()]/g, '.')}`));
      const reads = admin.getByRole('checkbox', {
        name: new RegExp(`^${a.models.supportsImages}`),
      });
      await expect(reads).not.toBeChecked();
      await expect(reads).toBeEnabled();
      await admin
        .getByRole('checkbox', {
          name: new RegExp(`^${a.models.generatesImages}`),
        })
        .check();
      await expect(reads).toBeChecked();
      await expect(reads).toBeDisabled();
      await expect(
        admin.getByText(a.models.supportsImagesLocked),
      ).toBeVisible();
      await expect(admin.getByText(a.models.generatesImagesHint)).toBeVisible();

      await field(a.models.providerModelId).fill(`mock-ic26-${Date.now()}`);
      await field(a.models.displayName).fill('Mock ic26');
      await field(a.models.contextWindow).fill('8000');
      await field(a.models.maxOutput).fill('2000');
      await admin
        .getByRole('button', { name: a.models.createSubmit, exact: true })
        .click();
      await expect(field(a.models.maxOutput)).toHaveAttribute(
        'aria-invalid',
        'true',
      );
      await expect(
        admin
          .getByRole('alert')
          .filter({ hasText: a.models.maxOutputImageMin }),
      ).toBeVisible();
      await expect(admin.getByRole('dialog')).toHaveCount(0);
      expect(posts).toEqual([]);
    } finally {
      await context.close();
    }
  });

  test('IC-27 a model test on the image model shows the picture and its size; a model that returns none says so', async ({
    browser,
  }) => {
    await ensureImageFixtures();
    const models = await adminCall<{ id: string; providerModelId: string }[]>(
      'GET',
      '/admin/models',
    );
    const model = models.find((m) => m.providerModelId === 'mock-image')!;
    const context = await adminContext(browser);
    try {
      const admin = await context.newPage();
      const run = async () => {
        await admin.goto(`/admin/models/${model.id}`);
        await admin.getByRole('button', { name: a.models.test.open }).click();
        const dialog = admin.getByRole('dialog', {
          name: a.models.test.confirmTitle,
          exact: true,
        });
        await dialog.getByLabel(a.dialog.reason).fill('e2e image test');
        await dialog
          .getByRole('button', {
            name: a.models.test.confirmSubmit,
            exact: true,
          })
          .click();
        await expect(dialog).toBeHidden();
      };
      await run();
      await expect(
        admin.getByRole('img', { name: a.models.test.imageAlt }),
      ).toBeVisible();
      const bytes = a.models.test.imageBytes.replace('{{bytes}}', '[\\d,]+');
      await expect(
        admin.getByText(new RegExp(`^${a.models.test.imageSize}\\s+${bytes}$`)),
      ).toBeVisible();

      // The same model, answered without a picture.
      await admin.route(/\/models\/[^/]+\/test$/, async (route) => {
        const response = await route.fetch();
        const json = (await response.json()) as Record<string, unknown>;
        delete json.imageCreated;
        json.imageCreated = null;
        await route.fulfill({ response, json });
      });
      await run();
      await expect(
        admin.getByText(a.models.test.noImage, { exact: true }),
      ).toBeVisible();
      await expect(
        admin.getByRole('img', { name: a.models.test.imageAlt }),
      ).toHaveCount(0);
    } finally {
      await context.close();
    }
  });

  test('IC-28 an image mode on a provider without an image path shows its reason in the modes list', async ({
    browser,
  }) => {
    await ensureImageFixtures();
    const context = await adminContext(browser);
    try {
      const admin = await context.newPage();
      await admin.route(/\/api\/v1\/admin\/modes$/, async (route) => {
        if (route.request().method() !== 'GET') return route.fallback();
        const response = await route.fetch();
        const modes = (await response.json()) as {
          key: string;
          ready: boolean;
          notReadyReason: string | null;
        }[];
        await route.fulfill({
          response,
          json: modes.map((m) =>
            m.key === IMAGE_MODE_KEY
              ? {
                  ...m,
                  ready: false,
                  notReadyReason: 'IMAGE_GENERATION_UNSUPPORTED',
                }
              : m,
          ),
        });
      });
      await admin.goto('/admin/modes');
      const row = admin
        .getByRole('table', { name: a.modes.tableLabel })
        .getByRole('row')
        .filter({ has: admin.getByText(IMAGE_MODE_KEY, { exact: true }) });
      await expect(row).toContainText(a.modes.notReady);
      await expect(row).toContainText(
        a.modes.reasons.IMAGE_GENERATION_UNSUPPORTED,
      );
    } finally {
      await context.close();
    }
  });
});

test.describe('3d no provider or model names', () => {
  test('IC-29 the mode menu, empty state, image card and error cards show no provider or model name', async ({
    page,
  }) => {
    await createMixedUser(page);
    const names = /mock|gemini|gpt|openai|claude|anthropic|google|deepseek/i;
    const everything = () => page.evaluate(() => document.body.innerText);
    await openNewChat(page);
    await modeTrigger(page).click();
    expect(await everything()).not.toMatch(names);
    await page
      .getByRole('menuitemradio', { name: new RegExp(IMAGE_MODE_LABEL) })
      .click();
    expect(await everything()).not.toMatch(names);
    await createImage(page, 'صورة بلا أسماء');
    expect(await everything()).not.toMatch(names);
    // The same for a blocked answer.
    await mockChatServer(page, {
      answer: '',
      end: { kind: 'error', code: 'CONTENT_BLOCKED' },
    });
    await composer(page).fill('طلب مرفوض');
    await sendButton(page).click();
    await expect(answers(page).last()).toHaveAttribute('data-state', 'failed');
    expect(await everything()).not.toMatch(names);
  });
});
