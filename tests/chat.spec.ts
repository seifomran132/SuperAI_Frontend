import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import {
  ADMIN_SKIP_MESSAGE,
  SKIP_MESSAGE,
  adminCredentials,
  createConfirmedUser,
  createFundedUser,
  expectAccessibleRtl,
  signIn,
  signOutViaUi,
  stackReachable,
  text,
} from './support';

// Real stack: a fresh user is created, funded ($0.50) by the test admin and
// chats with the first mode. Tests share one page and run in order.
test.describe.configure({ mode: 'serial' });

let stackUp = false;
let context: BrowserContext;
let page: Page;
const marker = `سر${Date.now()}`;
const firstPrompt = `${marker} ما هي عاصمة فرنسا؟ أجب بجملة قصيرة.`;
const secondPrompt = 'وما عاصمة إسبانيا؟ أجب بجملة قصيرة.';
let conversationUrl = '';

const composer = () =>
  page.getByRole('textbox', { name: text.chat.composer.label });
const sendButton = () =>
  page.getByRole('button', { name: text.chat.composer.send });
const answers = () => page.getByRole('article');

test.beforeAll(async ({ browser }) => {
  stackUp = await stackReachable();
  if (!stackUp || !adminCredentials()) return;
  context = await browser.newContext({
    locale: 'ar',
    baseURL: 'http://localhost:3001',
  });
  page = await context.newPage();
  await createFundedUser(page);
});
test.afterAll(async () => {
  await context?.close();
});
test.beforeEach(() => {
  test.skip(!stackUp, SKIP_MESSAGE);
  test.skip(!adminCredentials(), ADMIN_SKIP_MESSAGE);
});

test('new chat: send in the first mode, streamed answer, then cost', async () => {
  await page.goto('/chat');
  await expect(
    page.getByRole('heading', { name: text.chat.empty.title }),
  ).toBeVisible();
  await expectAccessibleRtl(page);

  await expect(
    page.getByRole('button', { name: text.chat.composer.modeMenu }),
  ).toBeEnabled();
  await composer().fill(firstPrompt);
  await sendButton().click();

  // The user's message shows at once and the URL becomes /chat/<id>.
  await expect(page.getByRole('main').getByText(firstPrompt)).toBeVisible();
  await expect(page).toHaveURL(/\/chat\/[0-9a-f-]{36}$/);
  conversationUrl = page.url();

  const answer = answers().last();
  await expect(answer).toHaveAttribute('data-state', 'complete', {
    timeout: 45_000,
  });
  await expect(answer.getByText(/التكلفة/)).toBeVisible();
  await expect(answer.getByText(/الرصيد المتبقي/)).toBeVisible();
  // Money goes through the formatter: inside <bdi>.
  await expect(answer.locator('bdi').first()).toBeVisible();
  await expect(composer()).toHaveValue('');
});

test('the conversation appears in the list and opens from it', async () => {
  const nav = page.getByRole('navigation', { name: text.shell.recent });
  await page.goto('/chat');
  await nav.getByRole('link', { name: /سر\d+/ }).click();
  await expect(page).toHaveURL(conversationUrl);
  await expect(page.getByRole('main').getByText(firstPrompt)).toBeVisible();
  await expect(answers().last()).toHaveAttribute('data-state', 'complete');
});

test('second message in the same conversation', async () => {
  await composer().fill(secondPrompt);
  await sendButton().click();
  await expect(page.getByRole('main').getByText(secondPrompt)).toBeVisible();
  await expect(answers()).toHaveCount(2, { timeout: 45_000 });
  await expect(answers().last()).toHaveAttribute('data-state', 'complete', {
    timeout: 45_000,
  });
  await expect(page).toHaveURL(conversationUrl);
});

test('switching mode in the composer only selects it', async () => {
  const trigger = page.getByRole('button', {
    name: text.chat.composer.modeMenu,
  });
  const before = (await trigger.textContent()) ?? '';
  await trigger.click();
  const items = page.getByRole('menuitemradio');
  const count = await items.count();
  test.skip(count < 2, 'The plan has a single mode.');
  await items.nth(1).click();
  await expect(trigger).not.toHaveText(before);
  // Selecting never sends: still two answers.
  await expect(answers()).toHaveCount(2);
  // Back to the first mode: the next tests need a provider that answers.
  await trigger.click();
  await items.nth(0).click();
  await expect(trigger).toHaveText(before);
});

test('Stop during a stream leaves a stopped state', async () => {
  await composer().fill(
    'اكتب مقالًا طويلًا ومفصلًا عن تاريخ الحضارات القديمة في عشر فقرات.',
  );
  await sendButton().click();
  const stop = page.getByRole('button', { name: text.chat.composer.stop });
  await expect(stop).toBeVisible();
  const answer = answers().last();
  // Wait for some text so the stop leaves a partial answer.
  await expect
    .poll(async () => ((await answer.textContent()) ?? '').length, {
      timeout: 45_000,
    })
    .toBeGreaterThan(60);
  await stop.click();
  await expect(stop).toBeHidden();
  await expect(answers().last()).toHaveAttribute('data-state', 'stopped');
  await expect(page.getByText(text.chat.message.cut)).toBeVisible();
});

test('mobile (375px): the drawer opens, closes, and Escape returns focus', async () => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(conversationUrl);
  const opener = page.getByRole('button', { name: text.shell.openMenu });
  await opener.click();
  const drawer = page.getByRole('dialog', { name: text.shell.sidebarTitle });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('link', { name: /سر\d+/ })).toBeVisible();
  await expectAccessibleRtl(page);

  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(opener).toBeFocused();

  await opener.click();
  await drawer.getByRole('button', { name: text.shell.closeMenu }).click();
  await expect(drawer).toBeHidden();
  await expect(opener).toBeFocused();

  // Picking a conversation closes the drawer.
  await opener.click();
  await drawer.getByRole('link', { name: /سر\d+/ }).click();
  await expect(drawer).toBeHidden();
  await page.setViewportSize({ width: 1280, height: 800 });
});

test('sign out, sign in as another user: nothing of the first user is visible', async ({
  browser,
}) => {
  const other = await createConfirmedUser(browser);

  await page.goto(conversationUrl);
  await expect(page.getByRole('main').getByText(firstPrompt)).toBeVisible();
  await signOutViaUi(page);

  // From here on the first user's text must never reach the DOM again, even
  // for a frame (stale cache flash).
  // Persisted in sessionStorage so it survives a full reload as well.
  const watch = (m: string) => {
    sessionStorage.removeItem('leak');
    new MutationObserver(() => {
      if (document.body?.textContent?.includes(m)) {
        sessionStorage.setItem('leak', '1');
      }
    }).observe(document, {
      subtree: true,
      childList: true,
      characterData: true,
    });
  };
  await page.addInitScript((m) => {
    const keep = sessionStorage.getItem('leak');
    new MutationObserver(() => {
      if (document.body?.textContent?.includes(m)) {
        sessionStorage.setItem('leak', '1');
      }
    }).observe(document, {
      subtree: true,
      childList: true,
      characterData: true,
    });
    if (keep) sessionStorage.setItem('leak', keep);
  }, marker);
  await page.evaluate(watch, marker);

  await signIn(page, other.email, other.password);
  await expect(
    page.getByRole('heading', { name: text.chat.empty.title }),
  ).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: text.shell.recent })
      .getByText(text.shell.list.emptyTitle),
  ).toBeVisible();
  await expect(page.getByText(marker)).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem('leak'))).toBeNull();

  // The first user's conversation is not reachable for the new user.
  await page.goto(conversationUrl);
  await expect(page.getByText(marker)).toHaveCount(0);
  await expect(page.getByText(firstPrompt)).toHaveCount(0);
});
