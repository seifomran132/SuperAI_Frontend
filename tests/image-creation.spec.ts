import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import {
  ADMIN_SKIP_MESSAGE,
  SKIP_MESSAGE,
  adminCredentials,
  createImageUser,
  expectAccessibleRtl,
  expectNoHorizontalScroll,
  stackReachable,
  text,
} from './support';

// Real stack, free `mock` provider: a fresh user on the dedicated `e2e-images`
// plan creates images in the `e2e-design` mode. Tests share one page, in order.
test.describe.configure({ mode: 'serial' });

let stackUp = false;
let context: BrowserContext;
let page: Page;
let conversationUrl = '';
const sentBodies: { imageOptions?: unknown; content?: string }[] = [];

const composer = () =>
  page.getByRole('textbox', { name: text.chat.composer.label });
const sendButton = () =>
  page.getByRole('button', { name: text.chat.composer.send });
const createdImage = () =>
  page.getByRole('article').last().getByRole('img').first();

async function pickDesignMode() {
  await page
    .getByRole('button', { name: text.chat.composer.modeMenu })
    .click();
  await page.getByRole('menuitemradio', { name: /تصميم e2e/ }).click();
}

test.beforeAll(async ({ browser }) => {
  stackUp = await stackReachable();
  if (!stackUp || !adminCredentials()) return;
  context = await browser.newContext({
    locale: 'ar',
    baseURL: 'http://localhost:3001',
    acceptDownloads: true,
  });
  page = await context.newPage();
  page.on('request', (req) => {
    if (req.method() === 'POST' && /\/messages$/.test(req.url())) {
      sentBodies.push(req.postDataJSON());
    }
  });
  await createImageUser(page);
});
test.afterAll(async () => {
  await context?.close();
});
test.beforeEach(() => {
  test.skip(!stackUp, SKIP_MESSAGE);
  test.skip(!adminCredentials(), ADMIN_SKIP_MESSAGE);
});

test('image mode shows the image empty state and the ratio menu', async () => {
  await page.goto('/chat');
  await pickDesignMode();
  await expect(
    page.getByRole('heading', { name: text.chat.emptyImage.title }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: new RegExp(text.chat.image.ratio) }),
  ).toBeVisible();
});

test('16:9 is sent as imageOptions and the created image renders', async () => {
  await page
    .getByRole('button', { name: new RegExp(text.chat.image.ratio) })
    .click();
  await page.getByRole('menuitemradio', { name: /16:9/ }).click();

  await composer().fill('قطة تجلس على نافذة');
  await sendButton().click();

  await expect(page).toHaveURL(/\/chat\/[0-9a-f-]{36}$/);
  conversationUrl = page.url();
  expect(sentBodies.at(-1)?.imageOptions).toEqual({ aspectRatio: '16:9' });

  await expect(createdImage()).toBeVisible({ timeout: 45_000 });
  await expect(createdImage()).toHaveAttribute('src', /^blob:/);
  await expect(page.getByRole('article').last()).toHaveAttribute(
    'data-state',
    'complete',
  );
});

test('full size opens the viewer and download saves lam7a-<id>.webp', async () => {
  await page
    .getByRole('button', { name: text.chat.image.openFull })
    .last()
    .click();
  const viewer = page.getByRole('dialog');
  await expect(viewer).toBeVisible();

  const downloading = page.waitForEvent('download');
  await viewer.getByRole('button', { name: text.chat.image.download }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toMatch(/^lam7a-.+\.webp$/);

  await page.keyboard.press('Escape');
  await expect(viewer).toBeHidden();
});

test('reload keeps the image', async () => {
  await page.reload();
  await expect(createdImage()).toBeVisible({ timeout: 30_000 });
  await expect(createdImage()).toHaveAttribute('src', /^blob:/);
});

test('automatic ratio sends no imageOptions', async () => {
  const before = sentBodies.length;
  await composer().fill('شعار بسيط');
  await sendButton().click();
  await expect.poll(() => sentBodies.length).toBe(before + 1);
  expect('imageOptions' in sentBodies.at(-1)!).toBe(false);
  await expect(page.getByRole('article')).toHaveCount(2, { timeout: 45_000 });
  await expect(page.getByRole('article').last()).toHaveAttribute(
    'data-state',
    'complete',
    { timeout: 45_000 },
  );
});

test('image conversation: accessible RTL, no horizontal scroll at 375px', async () => {
  await page.goto(conversationUrl);
  await expect(createdImage()).toBeVisible({ timeout: 30_000 });
  await expectAccessibleRtl(page);

  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(conversationUrl);
  await expect(createdImage()).toBeVisible({ timeout: 30_000 });
  await expectAccessibleRtl(page);
  await expectNoHorizontalScroll(page);
  await page.setViewportSize({ width: 1280, height: 800 });
});
