import {
  expect,
  test,
  type BrowserContext,
  type Page,
  type Route,
} from '@playwright/test';
import errors from '../src/i18n/errors.ar.json' with { type: 'json' };
import {
  ADMIN_SKIP_MESSAGE,
  SKIP_MESSAGE,
  adminCredentials,
  createFundedUser,
  expectAccessibleRtl,
  stackReachable,
  text,
} from './support';

// The send endpoint is mocked with page.route (shapes per API_CONTRACT §6 and
// ERROR_CODES.md); everything else (sign-in, modes, conversation creation)
// is the real local stack. The funded user only exists to have a plan.
test.describe.configure({ mode: 'serial' });

let stackUp = false;
let context: BrowserContext;
let page: Page;
const prompt = 'سؤال تجريبي للاختبار';

const composer = () =>
  page.getByRole('textbox', { name: text.chat.composer.label });
const sendButton = () =>
  page.getByRole('button', { name: text.chat.composer.send });
const modeTrigger = () =>
  page.getByRole('button', { name: text.chat.composer.modeMenu });

const SEND_URL = /\/api\/v1\/conversations\/[^/]+\/messages$/;

interface SentBody {
  content: string;
  modeKey: string;
  clientRequestId: string;
}

/** Mocks POST sends only (GET /messages passes through) and records bodies. */
async function mockSend(
  handler: (route: Route, body: SentBody, n: number) => Promise<void> | void,
) {
  const sent: SentBody[] = [];
  await page.route(SEND_URL, async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    const body = route.request().postDataJSON() as SentBody;
    sent.push(body);
    await handler(route, body, sent.length);
  });
  return sent;
}

const apiError = (status: number, code: string, data?: unknown) => ({
  status,
  contentType: 'application/json',
  body: JSON.stringify({ statusCode: status, code, message: 'dev', data }),
});

const sse = (...events: [string, unknown][]) =>
  events
    .map(([e, d]) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`)
    .join('');

test.beforeAll(async ({ browser }) => {
  stackUp = await stackReachable();
  if (!stackUp || !adminCredentials()) return;
  context = await browser.newContext({
    locale: 'ar',
    baseURL: 'http://localhost:3001',
  });
  page = await context.newPage();
  await createFundedUser(page, 'e2e-errors');
});
test.afterAll(async () => {
  await context?.close();
});
test.beforeEach(async () => {
  test.skip(!stackUp, SKIP_MESSAGE);
  test.skip(!adminCredentials(), ADMIN_SKIP_MESSAGE);
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.goto('/chat');
  await expect(modeTrigger()).toBeEnabled();
});

test('INSUFFICIENT_BALANCE shows alternatives; switching mode never sends', async () => {
  const sent = await mockSend((route) =>
    route.fulfill(
      apiError(409, 'INSUFFICIENT_BALANCE', {
        estimatedCostUsd: '0.012000000',
        balanceUsd: '0.004000000',
        alternatives: [{ modeKey: 'professional', estimatedCostUsd: '0.003' }],
      }),
    ),
  );
  await composer().fill(prompt);
  await sendButton().click();

  const notice = page.locator('[data-slot="chat-notice"]');
  await expect(notice).toContainText('رصيدك غير كافٍ');
  await expect(notice.locator('bdi').first()).toBeVisible();
  const switchButton = notice.getByRole('button', { name: /التبديل إلى/ });
  await expect(switchButton).toBeVisible();
  await expectAccessibleRtl(page);
  // The draft is kept and nothing was sent a second time.
  await expect(composer()).toHaveValue(prompt);

  await switchButton.click();
  await expect(modeTrigger()).toContainText('احترافي');
  await expect(composer()).toHaveValue(prompt);
  // Give an auto-send a chance to (wrongly) happen.
  await page.waitForTimeout(500);
  expect(sent).toHaveLength(1);
});

test('INSUFFICIENT_BALANCE without alternatives offers the contact dialog', async () => {
  const sent = await mockSend((route) =>
    route.fulfill(
      apiError(409, 'INSUFFICIENT_BALANCE', {
        estimatedCostUsd: '0.012000000',
        balanceUsd: '0.004000000',
        alternatives: [],
      }),
    ),
  );
  await composer().fill(prompt);
  await sendButton().click();
  await page
    .getByRole('button', { name: text.chat.notice.requestBalance })
    .click();
  await expect(
    page.getByRole('dialog', { name: text.chat.requestBalance.title }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(composer()).toHaveValue(prompt);
  expect(sent).toHaveLength(1);
});

test('network failure before the stream: retry resends with the same request id, no auto-retry', async () => {
  const sent = await mockSend(async (route, _body, n) => {
    if (n === 1) return route.abort('connectionreset');
    return route.fulfill(apiError(409, 'DUPLICATE_REQUEST', {}));
  });
  await composer().fill(prompt);
  await sendButton().click();

  const notice = page.locator('[data-slot="chat-notice"]');
  await expect(notice).toContainText(text.common.networkError);
  await expect(composer()).toHaveValue(prompt);
  await page.waitForTimeout(1000);
  expect(sent).toHaveLength(1); // nothing reconnected by itself

  await notice.getByRole('button', { name: text.common.retry }).click();
  await expect.poll(() => sent.length).toBe(2);
  expect(sent[1]?.clientRequestId).toBe(sent[0]?.clientRequestId);
});

test('connection drop mid-stream: no reconnect; the settled answer offers retry', async () => {
  const messageId = (n: number) => `0190e0a0-0000-7000-8000-00000000000${n}`;
  const now = new Date().toISOString();
  const userMessage = {
    id: messageId(1),
    sequence: 1,
    role: 'user' as const,
    content: prompt,
    status: 'complete' as const,
    modeKey: null as string | null,
    finishReason: 'stop' as const,
    errorCode: null,
    createdAt: now,
    completedAt: now,
  };
  const assistant = {
    ...userMessage,
    id: messageId(2),
    sequence: 2,
    role: 'assistant' as const,
    content: '',
    status: 'streaming' as const,
  };

  let conversationId = '';
  const sent = await mockSend(async (route, body) => {
    const match = /conversations\/([^/]+)\/messages/.exec(
      route.request().url(),
    );
    conversationId = match?.[1] ?? '';
    userMessage.modeKey = body.modeKey;
    assistant.modeKey = body.modeKey;
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
      // `started` and one chunk, then the connection ends with no done/error.
      body: sse(
        [
          'started',
          {
            requestId: body.clientRequestId,
            conversation: { id: conversationId, title: prompt },
            userMessage,
            assistantMessage: assistant,
            modeKey: body.modeKey,
            reservedUsd: '0.004200000',
          },
        ],
        ['delta', { text: 'بداية ' }],
      ),
    });
  });
  // After the drop the server has settled the answer as failed.
  await page.route(
    /\/api\/v1\/conversations\/[^/]+\/messages\?/,
    async (route) => {
      if (route.request().method() !== 'GET') return route.fallback();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              ...assistant,
              status: 'failed',
              finishReason: 'other',
              errorCode: 'PROVIDER_UNAVAILABLE',
            },
            userMessage,
          ],
          nextBefore: null,
        }),
      });
    },
  );

  await composer().fill(prompt);
  await sendButton().click();

  const failed = page.getByRole('article');
  await expect(failed.getByRole('alert')).toHaveText(
    errors.PROVIDER_UNAVAILABLE,
  );
  const retry = failed.getByRole('button', { name: text.chat.message.retry });
  await expect(retry).toBeVisible();
  await page.waitForTimeout(1000);
  expect(sent).toHaveLength(1); // no automatic reconnect

  // Retry is the user's choice: it sends the same text as a new message.
  await retry.click();
  await expect.poll(() => sent.length).toBe(2);
  expect(sent[1]?.content).toBe(prompt);
  expect(sent[1]?.clientRequestId).not.toBe(sent[0]?.clientRequestId);
});

test('DUPLICATE_REQUEST refetches the messages instead of resending', async () => {
  let messageGets = 0;
  await page.route(
    /\/api\/v1\/conversations\/[^/]+\/messages\?/,
    async (route) => {
      if (route.request().method() === 'GET') messageGets += 1;
      await route.fallback();
    },
  );
  const sent = await mockSend((route) =>
    route.fulfill(
      apiError(409, 'DUPLICATE_REQUEST', {
        userMessageId: '0190e0a0-0000-7000-8000-000000000001',
        assistantMessageId: '0190e0a0-0000-7000-8000-000000000002',
      }),
    ),
  );
  await composer().fill(prompt);
  await sendButton().click();
  await expect.poll(() => messageGets).toBeGreaterThan(0);
  await page.waitForTimeout(500);
  expect(sent).toHaveLength(1);
  // Not shown as a refusal.
  await expect(page.locator('[data-slot="chat-notice"]')).toHaveCount(0);
});

// Last: the fake clock stays installed on the page.
test('RATE_LIMITED shows the countdown, keeps the draft, and re-enables on time', async () => {
  await page.clock.install({ time: new Date() });
  const sent = await mockSend((route) =>
    route.fulfill({
      ...apiError(429, 'RATE_LIMITED', { retryAfterSeconds: 30 }),
      headers: { 'Retry-After': '30' },
    }),
  );
  await page.goto('/chat');
  await expect(modeTrigger()).toBeEnabled();
  await composer().fill(prompt);
  await sendButton().click();

  const notice = page.locator('[data-slot="chat-notice"]');
  await expect(notice).toContainText('حاول بعد');
  await expect(composer()).toHaveValue(prompt);
  await expect(sendButton()).toBeDisabled();
  await expectAccessibleRtl(page);

  await page.clock.fastForward(31_000);
  await expect(notice).toBeHidden();
  await expect(sendButton()).toBeEnabled();
  expect(sent).toHaveLength(1);
});
