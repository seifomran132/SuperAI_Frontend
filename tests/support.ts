import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import AxeBuilder from '@axe-core/playwright';
import {
  expect,
  type Browser,
  type Locator,
  type BrowserContext,
  type Page,
} from '@playwright/test';
import adminAr from '../src/i18n/admin.ar.json' with { type: 'json' };
import ar from '../src/i18n/ar.json' with { type: 'json' };
import landingAr from '../src/i18n/landing.ar.json' with { type: 'json' };
import brandKitsAr from '../src/i18n/brand-kits.ar.json' with { type: 'json' };
import designsAr from '../src/i18n/designs.ar.json' with { type: 'json' };

export const text = {
  ...ar,
  ...adminAr,
  ...landingAr,
  ...brandKitsAr,
  ...designsAr,
};

export const API = 'http://localhost:3000';
export const GOTRUE = 'http://localhost:9999';
export const MAILPIT = 'http://localhost:8025';

/** True when the local backend stack (API, GoTrue, Mailpit) answers. */
export async function stackReachable(): Promise<boolean> {
  const probes = [
    `${GOTRUE}/health`,
    `${MAILPIT}/api/v1/info`,
    `${API}/api/v1/me`, // 401 without a token still proves the API is up
  ];
  try {
    const results = await Promise.all(
      probes.map((url) => fetch(url, { signal: AbortSignal.timeout(3000) })),
    );
    return results.every((r) => r.status < 500);
  } catch {
    return false;
  }
}

export const SKIP_MESSAGE =
  'Local stack not reachable: start the API (:3000), GoTrue (:9999) and Mailpit (:8025), then re-run.';

interface MailpitSummary {
  ID: string;
}

/** Polls Mailpit until a message to `email` has a link matching `linkType`. */
export async function waitForMailLink(
  email: string,
  linkType: 'signup' | 'recovery',
  ignoreLinks: string[] = [],
): Promise<string> {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const search = await fetch(
      `${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
    );
    const { messages } = (await search.json()) as {
      messages: MailpitSummary[];
    };
    for (const { ID } of messages ?? []) {
      const message = (await (
        await fetch(`${MAILPIT}/api/v1/message/${ID}`)
      ).json()) as { Text?: string; HTML?: string };
      const body = `${message.Text ?? ''}\n${message.HTML ?? ''}`;
      const links = [
        ...body.matchAll(/https?:\/\/[^\s"'<>)]+\/verify\?[^\s"'<>)]+/g),
      ]
        .map((m) => m[0].replace(/&amp;/g, '&'))
        .filter(
          (l) => l.includes(`type=${linkType}`) && !ignoreLinks.includes(l),
        );
      if (links[0]) return links[0];
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`No ${linkType} email for ${email} within 30s`);
}

/** RTL document and no serious/critical accessibility violations. */
export async function expectAccessibleRtl(page: Page) {
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  const { violations } = await new AxeBuilder({ page }).analyze();
  const blocking = violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  expect(
    blocking.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`),
  ).toEqual([]);
}

/** The signed-in user's access token, as stored by auth-js. */
export async function accessToken(page: Page): Promise<string> {
  const raw = await page.evaluate(() => localStorage.getItem('bayan.auth'));
  if (!raw) throw new Error('No stored session');
  return (JSON.parse(raw) as { access_token: string }).access_token;
}

// ---------------------------------------------------------------------------
// Shared e2e helpers (real local stack). Credentials are never logged.

function readEnvFile(path: string): Record<string, string> {
  try {
    const out: Record<string, string> = {};
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
      if (m?.[1] && !line.trim().startsWith('#')) {
        out[m[1]] = (m[2] ?? '').replace(/^(['"])(.*)\1$/, '$2');
      }
    }
    return out;
  } catch {
    return {};
  }
}

/** Admin test account from the environment, else ../SuperAI_Backend/bruno/.env. */
export function adminCredentials(): { email: string; password: string } | null {
  const file = readEnvFile(
    resolve(process.cwd(), '../SuperAI_Backend/bruno/.env'),
  );
  const email = process.env.ADMIN_EMAIL ?? file.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD ?? file.ADMIN_PASSWORD;
  return email && password ? { email, password } : null;
}

export const ADMIN_SKIP_MESSAGE =
  'Admin credentials missing: set ADMIN_EMAIL/ADMIN_PASSWORD or provide ../SuperAI_Backend/bruno/.env.';

/** Password-grant token straight from GoTrue. */
export async function gotrueToken(
  email: string,
  password: string,
): Promise<string> {
  const res = await fetch(`${GOTRUE}/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`GoTrue sign-in failed (${res.status})`);
  return ((await res.json()) as { access_token: string }).access_token;
}

export async function adminToken(): Promise<string> {
  const creds = adminCredentials();
  if (!creds) throw new Error(ADMIN_SKIP_MESSAGE);
  return gotrueToken(creds.email, creds.password);
}

export function freshEmail(prefix = 'e2e'): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.local`;
}

/**
 * Creates an account through GoTrue, confirms it from the Mailpit link in the
 * given page (which signs the page in and lands on /chat).
 */
export async function signUpConfirmed(
  page: Page,
  email: string,
  password: string,
  fullName = 'مستخدم تجريبي',
): Promise<void> {
  const res = await fetch(
    `${GOTRUE}/signup?redirect_to=${encodeURIComponent('http://localhost:3001/auth/callback')}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, data: { full_name: fullName } }),
    },
  );
  if (!res.ok) throw new Error(`Sign-up failed (${res.status})`);
  const link = await waitForMailLink(email, 'signup');
  await page.goto(link);
  await page.waitForURL(/\/chat/);
  // Firefox aborts a goto() issued while the landing page is still loading.
  await page.waitForLoadState('load');
  await page.waitForLoadState('networkidle').catch(() => undefined);
}

/** Signs in through the sign-in form and waits for /chat. */
export async function signIn(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  // After signing out the page is already there; a second goto() can be aborted.
  if (!page.url().includes('/sign-in')) await page.goto('/sign-in');
  await fillStable(
    page.getByLabel(text.auth.fields.email, { exact: true }),
    email,
  );
  await fillStable(
    page.getByLabel(text.auth.fields.password, { exact: true }),
    password,
  );
  await page.getByRole('button', { name: text.auth.signIn.submit }).click();
  await page.waitForURL(/\/chat/);
}

export async function myId(token: string): Promise<string> {
  const res = await fetch(`${API}/api/v1/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return ((await res.json()) as { id: string }).id;
}

/** Adds (or, with a negative amount, removes) balance as the test admin. */
export async function adjustBalance(
  userId: string,
  amountUsd: string,
  reason = 'e2e funding',
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(
    `${API}/api/v1/admin/users/${userId}/balance/adjustments`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await adminToken()}`,
      },
      body: JSON.stringify({ amountUsd, reason, idempotencyKey: randomUUID() }),
    },
  );
  return { status: res.status, body: await res.json().catch(() => null) };
}

/** Gives the user the cheapest plan (the zero-price default) so balance can exist. */
async function activateCheapestPlan(userId: string): Promise<void> {
  const plans = (await (await fetch(`${API}/api/v1/plans`)).json()) as {
    key: string;
    isDefault: boolean;
    monthlyPriceUsd: string;
  }[];
  const plan =
    plans.find((p) => p.isDefault && Number(p.monthlyPriceUsd) === 0) ??
    plans[0];
  if (!plan) throw new Error('No plan to activate');
  const res = await fetch(`${API}/api/v1/admin/users/${userId}/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await adminToken()}`,
    },
    body: JSON.stringify({
      planKey: plan.key,
      reason: 'e2e funding',
      idempotencyKey: randomUUID(),
    }),
  });
  if (res.status >= 300)
    throw new Error(`Plan activation failed (${res.status})`);
}

/** Funds a user ($0.50 by default) so it can chat. Throws with the API code on failure. */
export async function fundUser(
  userId: string,
  amountUsd = '0.50',
): Promise<void> {
  await activateCheapestPlan(userId);
  const { status, body } = await adjustBalance(userId, amountUsd);
  if (status >= 300) {
    throw new Error(
      `Funding failed (${status} ${(body as { code?: string } | null)?.code ?? ''})`,
    );
  }
}

/** Signs out from the page (works at any width: opens the drawer when needed). */
export async function signOutViaUi(page: Page): Promise<void> {
  const menu = page.getByRole('button', { name: text.shell.accountMenu });
  if (await menu.isVisible()) {
    await menu.click();
    await page.getByRole('menuitem', { name: text.shell.signOut }).click();
  } else {
    await page.getByRole('button', { name: text.shell.openMenu }).click();
    await page.getByRole('button', { name: text.shell.signOut }).click();
  }
  await page.waitForURL(/\/sign-in/);
}

/** No horizontal page scroll. */
export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => {
    const el = document.scrollingElement ?? document.documentElement;
    return el.scrollWidth - el.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(0);
}

export const E2E_PASSWORD = 'e2e-password-1';

/** A fresh confirmed user, signed in on `page`, with $0.50 so it can chat. */
export async function createFundedUser(
  page: Page,
  prefix = 'e2e-chat',
): Promise<{ email: string; password: string; userId: string; token: string }> {
  const email = freshEmail(prefix);
  await signUpConfirmed(page, email, E2E_PASSWORD);
  const token = await accessToken(page);
  const userId = await myId(token);
  await fundUser(userId, '0.50');
  return { email, password: E2E_PASSWORD, userId, token };
}

/** A confirmed user created without touching `page` (confirmed in a throwaway context). */
export async function createConfirmedUser(
  browser: Browser,
  prefix = 'e2e-other',
): Promise<{ email: string; password: string }> {
  const email = freshEmail(prefix);
  const context = await browser.newContext({
    locale: 'ar',
    baseURL: 'http://localhost:3001',
  });
  try {
    await signUpConfirmed(await context.newPage(), email, E2E_PASSWORD);
  } finally {
    await context.close();
  }
  return { email, password: E2E_PASSWORD };
}

/**
 * A browser context that is already signed in (session written to storage
 * before any page script runs), so credentials are never typed into a page
 * and so never reach a Playwright trace. Not for tests that sign out.
 */
export async function signedInContext(
  browser: Browser,
  email: string,
  password: string,
): Promise<BrowserContext> {
  const res = await fetch(`${GOTRUE}/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`GoTrue sign-in failed (${res.status})`);
  const session = (await res.json()) as { expires_in: number };
  const stored = JSON.stringify({
    ...session,
    expires_at: Math.floor(Date.now() / 1000) + session.expires_in,
  });
  const context = await browser.newContext({
    locale: 'ar',
    baseURL: 'http://localhost:3001',
  });
  await context.addInitScript((value) => {
    if (!localStorage.getItem('bayan.auth')) {
      localStorage.setItem('bayan.auth', value);
    }
  }, stored);
  return context;
}

export async function adminContext(browser: Browser): Promise<BrowserContext> {
  const creds = adminCredentials();
  if (!creds) throw new Error(ADMIN_SKIP_MESSAGE);
  return signedInContext(browser, creds.email, creds.password);
}

// ---------------------------------------------------------------------------
// Image-creation fixtures (F8): free `mock` provider, dedicated mode and plan.
// Everything is find-or-create; existing plans, modes and models are untouched.

export const IMAGE_MODE_KEY = 'e2e-design';
export const IMAGE_PLAN_KEY = 'e2e-images';

export async function adminCall<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'PUT',
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API}/api/v1${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await adminToken()}`,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (res.status >= 300) {
    const code = ((await res.json().catch(() => null)) as { code?: string })
      ?.code;
    throw new Error(`${method} ${path} failed (${res.status} ${code ?? ''})`);
  }
  return (await res.json().catch(() => null)) as T;
}

const REASON = 'e2e image fixtures';

/** Ensures the mock image model, the `e2e-design` mode and the `e2e-images` plan exist. */
export async function ensureImageFixtures(): Promise<void> {
  const providers = await adminCall<
    { code: string; kind: string; isEnabled: boolean }[]
  >('GET', '/admin/providers');
  const mock = providers.find((p) => p.kind === 'mock');
  if (!mock) throw new Error('No mock provider in the local catalog');
  if (!mock.isEnabled) {
    await adminCall('PATCH', `/admin/providers/${mock.code}`, {
      reason: REASON,
      isEnabled: true,
    });
  }

  const models = await adminCall<
    {
      id: string;
      providerCode: string;
      providerModelId: string;
      generatesImages: boolean;
      supportsImages: boolean;
      isEnabled: boolean;
      currentPrice: unknown;
    }[]
  >('GET', '/admin/models');
  let model = models.find(
    (m) => m.providerCode === mock.code && m.providerModelId === 'mock-image',
  );
  if (!model) {
    model = await adminCall('POST', '/admin/models', {
      reason: REASON,
      providerCode: mock.code,
      providerModelId: 'mock-image',
      displayName: 'Mock image e2e',
      contextWindow: 8000,
      maxOutputTokens: 4000,
      supportsImages: true,
      generatesImages: true,
      isEnabled: true,
      price: { inputPerMtok: '1.00', outputPerMtok: '10.00' },
    });
  } else {
    if (!model.generatesImages || !model.supportsImages || !model.isEnabled) {
      await adminCall('PATCH', `/admin/models/${model.id}`, {
        reason: REASON,
        supportsImages: true,
        generatesImages: true,
        isEnabled: true,
      });
    }
    if (!model.currentPrice) {
      await adminCall('POST', `/admin/models/${model.id}/prices`, {
        reason: REASON,
        inputPerMtok: '1.00',
        outputPerMtok: '10.00',
      });
    }
  }

  const modes = await adminCall<{ key: string; isEnabled: boolean }[]>(
    'GET',
    '/admin/modes',
  );
  const mode = modes.find((m) => m.key === IMAGE_MODE_KEY);
  if (!mode) {
    await adminCall('POST', '/admin/modes', {
      reason: REASON,
      key: IMAGE_MODE_KEY,
      labelAr: 'تصميم e2e',
      labelEn: 'Design e2e',
      descriptionAr: 'إنشاء صور للاختبار',
      descriptionEn: 'Image creation for tests',
      sortOrder: 900,
      modelId: model!.id,
    });
  }
  if (!mode || !mode.isEnabled) {
    await adminCall('PATCH', `/admin/modes/${IMAGE_MODE_KEY}`, {
      reason: REASON,
      modelId: model!.id,
      isEnabled: true,
    });
  }

  const plans = await adminCall<{ key: string }[]>('GET', '/admin/plans');
  if (!plans.some((p) => p.key === IMAGE_PLAN_KEY)) {
    await adminCall('POST', '/admin/plans', {
      reason: REASON,
      key: IMAGE_PLAN_KEY,
      nameAr: 'صور e2e',
      nameEn: 'Images e2e',
      descriptionAr: 'باقة اختبار الصور',
      descriptionEn: 'Image test plan',
      monthlyPriceUsd: '0',
      sortOrder: 900,
      isPublic: false,
      isActive: true,
      modeKeys: [IMAGE_MODE_KEY],
    });
  } else {
    await adminCall('PUT', `/admin/plans/${IMAGE_PLAN_KEY}/modes`, {
      reason: REASON,
      modeKeys: [IMAGE_MODE_KEY],
    });
  }
}

/** A fresh user on the `e2e-images` plan with balance; the page is left signed in. */
export async function createImageUser(
  page: Page,
  prefix = 'e2e-image',
): Promise<{ email: string; password: string; userId: string }> {
  await ensureImageFixtures();
  const email = freshEmail(prefix);
  await signUpConfirmed(page, email, E2E_PASSWORD);
  const userId = await myId(await accessToken(page));
  await adminCall('POST', `/admin/users/${userId}/subscriptions`, {
    planKey: IMAGE_PLAN_KEY,
    reason: REASON,
    idempotencyKey: randomUUID(),
  });
  const { status } = await adjustBalance(userId, '0.50');
  if (status >= 300) throw new Error(`Funding failed (${status})`);
  return { email, password: E2E_PASSWORD, userId };
}

// ---------------------------------------------------------------------------
// Text-chat fixtures: two free `mock` text modes ("echo" provider: answers
// "Echo: <your message>" word by word, no network, no cost to a real provider)
// on a dedicated plan. `e2e-fast` is cheap, `e2e-pro` about ten times dearer,
// so balance cases can sit between the two. Find-or-create; nothing existing
// is changed.

export const CHAT_FAST_KEY = 'e2e-fast';
export const CHAT_PRO_KEY = 'e2e-pro';
export const CHAT_PLAN_KEY = 'e2e-chat';
export const CHAT_FAST_LABEL = 'سريع e2e';
export const CHAT_PRO_LABEL = 'احترافي e2e';

interface CatalogModel {
  id: string;
  providerCode: string;
  providerModelId: string;
  isEnabled: boolean;
  currentPrice: unknown;
}

async function ensureMockTextMode(
  mockCode: string,
  key: string,
  label: string,
  descriptionAr: string,
  sortOrder: number,
  providerModelId: string,
  price: { inputPerMtok: string; outputPerMtok: string },
): Promise<void> {
  const models = await adminCall<CatalogModel[]>('GET', '/admin/models');
  let model = models.find(
    (m) => m.providerCode === mockCode && m.providerModelId === providerModelId,
  );
  if (!model) {
    model = await adminCall<CatalogModel>('POST', '/admin/models', {
      reason: REASON,
      providerCode: mockCode,
      providerModelId,
      displayName: `Mock ${key}`,
      contextWindow: 8000,
      maxOutputTokens: 4000,
      supportsImages: false,
      generatesImages: false,
      isEnabled: true,
      price,
    });
  } else {
    if (!model.isEnabled) {
      await adminCall('PATCH', `/admin/models/${model.id}`, {
        reason: REASON,
        isEnabled: true,
      });
    }
    if (!model.currentPrice) {
      await adminCall('POST', `/admin/models/${model.id}/prices`, {
        reason: REASON,
        ...price,
      });
    }
  }
  const modes = await adminCall<{ key: string; isEnabled: boolean }[]>(
    'GET',
    '/admin/modes',
  );
  const mode = modes.find((m) => m.key === key);
  if (!mode) {
    await adminCall('POST', '/admin/modes', {
      reason: REASON,
      key,
      labelAr: label,
      labelEn: `${key} e2e`,
      descriptionAr,
      descriptionEn: `${key} for tests`,
      sortOrder,
      modelId: model.id,
    });
  } else if (!mode.isEnabled) {
    await adminCall('PATCH', `/admin/modes/${key}`, {
      reason: REASON,
      modelId: model.id,
      isEnabled: true,
    });
  }
}

/** Ensures the two mock text modes and the `e2e-chat` plan that includes both. */
export async function ensureChatFixtures(): Promise<void> {
  const providers = await adminCall<
    { code: string; kind: string; isEnabled: boolean }[]
  >('GET', '/admin/providers');
  const mock = providers.find((p) => p.kind === 'mock');
  if (!mock) throw new Error('No mock provider in the local catalog');
  if (!mock.isEnabled) {
    await adminCall('PATCH', `/admin/providers/${mock.code}`, {
      reason: REASON,
      isEnabled: true,
    });
  }
  await ensureMockTextMode(
    mock.code,
    CHAT_FAST_KEY,
    CHAT_FAST_LABEL,
    'وصف الوضع السريع للاختبار',
    910,
    'mock-chat-fast',
    { inputPerMtok: '0.10', outputPerMtok: '1.00' },
  );
  await ensureMockTextMode(
    mock.code,
    CHAT_PRO_KEY,
    CHAT_PRO_LABEL,
    'وصف الوضع الاحترافي للاختبار',
    911,
    'mock-chat-pro',
    { inputPerMtok: '1.00', outputPerMtok: '10.00' },
  );
  const plans = await adminCall<{ key: string }[]>('GET', '/admin/plans');
  const modeKeys = [CHAT_FAST_KEY, CHAT_PRO_KEY];
  if (!plans.some((p) => p.key === CHAT_PLAN_KEY)) {
    await adminCall('POST', '/admin/plans', {
      reason: REASON,
      key: CHAT_PLAN_KEY,
      nameAr: 'محادثة e2e',
      nameEn: 'Chat e2e',
      descriptionAr: 'باقة اختبار المحادثة',
      descriptionEn: 'Chat test plan',
      monthlyPriceUsd: '0',
      sortOrder: 901,
      isPublic: false,
      isActive: true,
      modeKeys,
    });
  } else {
    await adminCall('PUT', `/admin/plans/${CHAT_PLAN_KEY}/modes`, {
      reason: REASON,
      modeKeys,
    });
  }
}

// A plan holding both text modes and three image modes (the usual
// `e2e-design`, a cheaper `e2e-design-lite` and a dearer `e2e-design-max`),
// for cases that switch between modes or need "another image mode" to offer.
// Find-or-create; nothing existing is changed.
export const MIXED_PLAN_KEY = 'e2e-mixed';
export const LITE_MODE_KEY = 'e2e-design-lite';
export const MAX_MODE_KEY = 'e2e-design-max';
export const IMAGE_MODE_LABEL = 'تصميم e2e';
export const LITE_MODE_LABEL = 'تصميم خفيف e2e';
export const MAX_MODE_LABEL = 'تصميم فاخر e2e';

async function ensureMockImageMode(
  mockCode: string,
  key: string,
  labelAr: string,
  sortOrder: number,
  providerModelId: string,
  price: { inputPerMtok: string; outputPerMtok: string },
): Promise<void> {
  const models = await adminCall<CatalogModel[]>('GET', '/admin/models');
  let model = models.find(
    (m) => m.providerCode === mockCode && m.providerModelId === providerModelId,
  );
  if (!model) {
    model = await adminCall<CatalogModel>('POST', '/admin/models', {
      reason: REASON,
      providerCode: mockCode,
      providerModelId,
      displayName: `Mock ${providerModelId} e2e`,
      contextWindow: 8000,
      maxOutputTokens: 4000,
      supportsImages: true,
      generatesImages: true,
      isEnabled: true,
      price,
    });
  }
  const modes = await adminCall<{ key: string; isEnabled: boolean }[]>(
    'GET',
    '/admin/modes',
  );
  const mode = modes.find((m) => m.key === key);
  if (!mode) {
    await adminCall('POST', '/admin/modes', {
      reason: REASON,
      key,
      labelAr,
      labelEn: `${key} e2e`,
      descriptionAr: 'إنشاء صور للاختبار',
      descriptionEn: 'Image creation for tests',
      sortOrder,
      modelId: model.id,
    });
  }
  if (!mode || !mode.isEnabled) {
    await adminCall('PATCH', `/admin/modes/${key}`, {
      reason: REASON,
      modelId: model.id,
      isEnabled: true,
    });
  }
}

export async function ensureMixedFixtures(): Promise<void> {
  await ensureChatFixtures();
  await ensureImageFixtures();
  const providers = await adminCall<{ code: string; kind: string }[]>(
    'GET',
    '/admin/providers',
  );
  const mock = providers.find((p) => p.kind === 'mock')!;
  await ensureMockImageMode(
    mock.code,
    LITE_MODE_KEY,
    LITE_MODE_LABEL,
    901,
    'mock-image-lite',
    { inputPerMtok: '0.10', outputPerMtok: '0.50' },
  );
  await ensureMockImageMode(
    mock.code,
    MAX_MODE_KEY,
    MAX_MODE_LABEL,
    902,
    'mock-image-max',
    { inputPerMtok: '1.00', outputPerMtok: '100.00' },
  );
  const modeKeys = [
    CHAT_FAST_KEY,
    CHAT_PRO_KEY,
    IMAGE_MODE_KEY,
    LITE_MODE_KEY,
    MAX_MODE_KEY,
  ];
  const plans = await adminCall<{ key: string }[]>('GET', '/admin/plans');
  if (!plans.some((p) => p.key === MIXED_PLAN_KEY)) {
    await adminCall('POST', '/admin/plans', {
      reason: REASON,
      key: MIXED_PLAN_KEY,
      nameAr: 'مختلط e2e',
      nameEn: 'Mixed e2e',
      descriptionAr: 'باقة اختبار بأوضاع نصية وصور',
      descriptionEn: 'Test plan with text and image modes',
      monthlyPriceUsd: '0',
      sortOrder: 903,
      isPublic: false,
      isActive: true,
      modeKeys,
    });
  } else {
    await adminCall('PUT', `/admin/plans/${MIXED_PLAN_KEY}/modes`, {
      reason: REASON,
      modeKeys,
    });
  }
}

/**
 * A fresh confirmed user on the `e2e-mixed` plan (both text modes and both
 * image modes, mock provider) with `balanceUsd`; the page is left signed in.
 */
export async function createMixedUser(
  page: Page,
  options: { prefix?: string; balanceUsd?: string } = {},
): Promise<{ email: string; password: string; userId: string; token: string }> {
  await ensureMixedFixtures();
  const email = freshEmail(options.prefix ?? 'e2e-mixed');
  await signUpConfirmed(page, email, E2E_PASSWORD);
  const token = await accessToken(page);
  const userId = await myId(token);
  await activatePlan(userId, MIXED_PLAN_KEY);
  const { status } = await adjustBalance(userId, options.balanceUsd ?? '0.50');
  if (status >= 300) throw new Error(`Funding failed (${status})`);
  return { email, password: E2E_PASSWORD, userId, token };
}

export const INCLUDED_PLAN_KEY = 'e2e-included';
export const INCLUDED_PLAN_BALANCE = '0.75';
export const INCLUDED_PLAN_NAME = 'مضمّن e2e';

/** A free `e2e-included` plan that credits $0.75 when activated (find-or-create). */
export async function ensureIncludedPlan(): Promise<void> {
  await ensureChatFixtures();
  const plans = await adminCall<{ key: string }[]>('GET', '/admin/plans');
  if (plans.some((p) => p.key === INCLUDED_PLAN_KEY)) return;
  await adminCall('POST', '/admin/plans', {
    reason: REASON,
    key: INCLUDED_PLAN_KEY,
    nameAr: INCLUDED_PLAN_NAME,
    nameEn: 'Included e2e',
    descriptionAr: 'باقة اختبار بها رصيد مضمّن',
    descriptionEn: 'Test plan with included balance',
    monthlyPriceUsd: '0',
    includedBalanceUsd: INCLUDED_PLAN_BALANCE,
    sortOrder: 902,
    isPublic: false,
    isActive: true,
    modeKeys: [CHAT_FAST_KEY],
  });
}

/** Puts the user on a plan by key (admin write). */
export async function activatePlan(
  userId: string,
  planKey: string,
): Promise<void> {
  await adminCall('POST', `/admin/users/${userId}/subscriptions`, {
    planKey,
    reason: REASON,
    idempotencyKey: randomUUID(),
  });
}

/**
 * A fresh confirmed user on the mock-mode `e2e-chat` plan with `balanceUsd`
 * (default $0.50); the page is left signed in on /chat. Pass `balanceUsd: null`
 * for a plan without balance.
 */
export async function createChatUser(
  page: Page,
  options: {
    prefix?: string;
    balanceUsd?: string | null;
    fullName?: string;
  } = {},
): Promise<{ email: string; password: string; userId: string; token: string }> {
  await ensureChatFixtures();
  const email = freshEmail(options.prefix ?? 'e2e-chat');
  await signUpConfirmed(page, email, E2E_PASSWORD, options.fullName);
  const token = await accessToken(page);
  const userId = await myId(token);
  await activatePlan(userId, CHAT_PLAN_KEY);
  const balance =
    options.balanceUsd === undefined ? '0.50' : options.balanceUsd;
  if (balance !== null) {
    const { status } = await adjustBalance(userId, balance);
    if (status >= 300) throw new Error(`Funding failed (${status})`);
  }
  return { email, password: E2E_PASSWORD, userId, token };
}

/** A confirmed user with no plan and no balance, signed in on `page`. */
export async function createNoPlanUser(
  page: Page,
  prefix = 'e2e-noplan',
): Promise<{ email: string; password: string; userId: string; token: string }> {
  const email = freshEmail(prefix);
  await signUpConfirmed(page, email, E2E_PASSWORD);
  const token = await accessToken(page);
  return { email, password: E2E_PASSWORD, userId: await myId(token), token };
}

/** Current balance as the API string, for the signed-in token. */
export async function apiBalance(token: string): Promise<string> {
  const res = await fetch(`${API}/api/v1/me/balance`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return ((await res.json()) as { balanceUsd: string }).balanceUsd;
}

// ---------------------------------------------------------------------------
// Chat over the API and a controllable stream (for cases about timing).

export async function apiCreateConversation(token: string): Promise<string> {
  const res = await fetch(`${API}/api/v1/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: '{}',
  });
  if (res.status >= 300)
    throw new Error(`Creating a conversation failed (${res.status})`);
  return ((await res.json()) as { id: string }).id;
}

/** Sends one message through the API and reads the stream to its end. */
export async function apiSend(
  token: string,
  conversationId: string,
  content: string,
  modeKey = CHAT_FAST_KEY,
): Promise<{ status: number; body: string }> {
  const res = await fetch(
    `${API}/api/v1/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, modeKey, clientRequestId: randomUUID() }),
    },
  );
  return { status: res.status, body: await res.text() };
}

/** A conversation with one answered message (title comes from the message). */
export async function seedConversation(
  token: string,
  content: string,
  modeKey = CHAT_FAST_KEY,
): Promise<string> {
  const id = await apiCreateConversation(token);
  const { status } = await apiSend(token, id, content, modeKey);
  if (status !== 200) throw new Error(`Seeding a message failed (${status})`);
  return id;
}

/**
 * Releases the chat stream one event at a time, `delayMs` apart, so a test can
 * act while an answer is "being written". The request still goes to the real
 * API (the `mock` echo model answers instantly there); only the browser's
 * view of the response is slowed. Install before the first navigation. The
 * delay can be changed later with `setStreamDelay`.
 */
export async function slowStreams(page: Page, delayMs: number): Promise<void> {
  await page.addInitScript((delay) => {
    const w = window as unknown as {
      __e2eStreamDelay: number;
      __e2eHoldAfter: number;
    } & Window;
    w.__e2eStreamDelay = delay;
    w.__e2eHoldAfter = Infinity;
    const real = w.fetch.bind(w);
    w.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      const res = await real(input, init);
      const isSend =
        init?.method === 'POST' &&
        /\/conversations\/[^/]+\/messages$/.test(url);
      const isStream = (res.headers.get('content-type') ?? '').startsWith(
        'text/event-stream',
      );
      if (!isSend || !isStream || !res.body) return res;
      const reader = res.body.getReader();
      const enc = new TextEncoder();
      const dec = new TextDecoder();
      let buffer = '';
      let released = 0;
      let cancelled: (() => void) | undefined;
      const cancelledPromise = new Promise<void>((r) => (cancelled = r));
      const abortedPromise = new Promise<void>((r) =>
        init?.signal?.addEventListener('abort', () => r()),
      );
      const body = new ReadableStream<Uint8Array>({
        async pull(controller) {
          // Held open (no more events, no end) until the client stops it.
          if (released >= w.__e2eHoldAfter) {
            await Promise.race([cancelledPromise, abortedPromise]);
          }
          if (init?.signal?.aborted) {
            throw new DOMException('The send was stopped.', 'AbortError');
          }
          for (;;) {
            const end = buffer.indexOf('\n\n');
            if (end >= 0) {
              const event = buffer.slice(0, end + 2);
              buffer = buffer.slice(end + 2);
              await new Promise((r) => setTimeout(r, w.__e2eStreamDelay));
              released += 1;
              controller.enqueue(enc.encode(event));
              return;
            }
            const { done, value } = await reader.read();
            if (done) {
              if (buffer) controller.enqueue(enc.encode(buffer));
              buffer = '';
              controller.close();
              return;
            }
            buffer += dec.decode(value, { stream: true });
          }
        },
        cancel: (reason) => {
          cancelled?.();
          return reader.cancel(reason);
        },
      });
      return new Response(body, { status: res.status, headers: res.headers });
    };
  }, delayMs);
}

/** Once a stream has released `events` events in total it stays open and silent until the client stops it. */
export async function holdStreamAfter(page: Page, events: number) {
  await page.evaluate((n) => {
    (window as unknown as { __e2eHoldAfter: number }).__e2eHoldAfter = n;
  }, events);
}

export async function setStreamDelay(page: Page, delayMs: number) {
  await page.evaluate((d) => {
    (window as unknown as { __e2eStreamDelay: number }).__e2eStreamDelay = d;
  }, delayMs);
}

/** A prompt of `words` words, so the echo answer has many deltas. */
export const longPrompt = (words = 60) =>
  Array.from({ length: words }, (_, i) => `كلمة${i}`).join(' ');

export const CHAT_FAST_DESCRIPTION = 'وصف الوضع السريع للاختبار';
export const CHAT_PRO_DESCRIPTION = 'وصف الوضع الاحترافي للاختبار';

/** The element holding the conversation list: the drawer on phones, the sidebar otherwise. */
export async function openSidebar(page: Page, isMobile: boolean) {
  if (isMobile) {
    await page.getByRole('button', { name: ar.shell.openMenu }).click();
    const drawer = page.getByRole('dialog', { name: ar.shell.sidebarTitle });
    await expect(drawer).toBeVisible();
    return drawer;
  }
  return page.getByRole('complementary', { name: ar.shell.sidebarTitle });
}

// ---------------------------------------------------------------------------
// A pretend chat server for cases the real `mock` model cannot produce:
// multi-line Markdown (the echo model collapses line breaks), stopped, cut or
// failed answers, dropped streams. Conversations are still created for real;
// only the send POST and the messages list after it are answered by the test.

export interface SentBody {
  content: string;
  modeKey: string;
  clientRequestId: string;
}

export type MockEnd =
  | { kind: 'done' }
  /** Cut by the length limit: a `partial` answer ended by `done`. */
  | { kind: 'cut' }
  /** An `error` event; the kept text (if any) makes it `partial`, else `failed`. */
  | { kind: 'error'; code: string }
  /** The connection ends with no terminal event; the server settled it as `settled`. */
  | { kind: 'drop'; settled?: 'complete' | 'partial' | 'failed' };

export interface MockChatOptions {
  answer?: string | ((body: SentBody, n: number) => string);
  end?: MockEnd;
  /** The response is held until this resolves (the POST stays pending). */
  hold?: Promise<unknown>;
}

const SEND_ROUTE = /\/api\/v1\/conversations\/[^/]+\/messages$/;
const LIST_ROUTE = /\/api\/v1\/conversations\/[^/]+\/messages\?/;

export async function mockChatServer(
  page: Page,
  options: MockChatOptions = {},
): Promise<{ sent: SentBody[] }> {
  const sent: SentBody[] = [];
  const stored: Record<string, unknown>[] = []; // oldest first
  let sequence = 0;
  const sse = (events: [string, unknown][]) =>
    events
      .map(([e, d]) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`)
      .join('');

  await page.route(SEND_ROUTE, async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    const body = route.request().postDataJSON() as SentBody;
    sent.push(body);
    await options.hold;
    const conversationId = /conversations\/([^/]+)\/messages/.exec(
      route.request().url(),
    )?.[1];
    const now = new Date().toISOString();
    const common = {
      modeKey: body.modeKey,
      errorCode: null as string | null,
      createdAt: now,
      completedAt: now as string | null,
      attachments: [],
      costUsd: null,
      usage: null,
    };
    const user = {
      ...common,
      id: randomUUID(),
      sequence: ++sequence,
      role: 'user',
      content: body.content,
      status: 'complete',
      finishReason: 'stop',
    };
    const content =
      typeof options.answer === 'function'
        ? options.answer(body, sent.length)
        : (options.answer ?? 'رد تجريبي قصير');
    const end = options.end ?? { kind: 'done' };
    const streaming = {
      ...common,
      id: randomUUID(),
      sequence: ++sequence,
      role: 'assistant',
      content: '',
      status: 'streaming',
      finishReason: 'stop',
      completedAt: null,
    };
    let final: Record<string, unknown> = {
      ...streaming,
      content,
      status: 'complete',
      completedAt: now,
    };
    let terminal: [string, unknown][] = [];
    if (end.kind === 'cut') {
      final = { ...final, status: 'partial', finishReason: 'length' };
    } else if (end.kind === 'error') {
      final = {
        ...final,
        status: content ? 'partial' : 'failed',
        finishReason: 'other',
        errorCode: end.code,
      };
    } else if (end.kind === 'drop') {
      final = { ...final, status: end.settled ?? 'complete' };
    }
    if (end.kind === 'done' || end.kind === 'cut') {
      terminal = [
        [
          'done',
          {
            status: final.status,
            finishReason: final.finishReason,
            message: final,
            chargeUsd: '0.000000000',
            balanceUsd: '0.500000000',
          },
        ],
      ];
    } else if (end.kind === 'error') {
      terminal = [
        [
          'error',
          {
            code: end.code,
            status: final.status,
            message: final,
            chargeUsd: '0.000000000',
            balanceUsd: '0.500000000',
          },
        ],
      ];
    }
    stored.push(user, final);
    const words = content.split(/(?<=\s)/).filter(Boolean);
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
      body: sse([
        [
          'started',
          {
            requestId: body.clientRequestId,
            conversation: {
              id: conversationId,
              title: body.content.slice(0, 40),
            },
            userMessage: user,
            assistantMessage: streaming,
            modeKey: body.modeKey,
            reservedUsd: '0.004000000',
          },
        ],
        ...words.map((w): [string, unknown] => ['delta', { text: w }]),
        ...terminal,
      ]),
    });
  });

  // After a send, reloading the list shows the pretend server's messages.
  await page.route(LIST_ROUTE, async (route) => {
    if (route.request().method() !== 'GET' || stored.length === 0) {
      return route.fallback();
    }
    await route.fulfill({
      json: { items: [...stored].reverse(), nextBefore: null },
    });
  });
  return { sent };
}

/**
 * Fills a field and makes sure the value stuck. A form that re-renders right
 * after the page loads (WebKit hydrates a beat later) can wipe an early fill.
 */
export async function fillStable(field: Locator, value: string): Promise<void> {
  await expect(async () => {
    await field.fill(value);
    await expect(field).toHaveValue(value, { timeout: 500 });
  }).toPass({ timeout: 10_000 });
}

/** A real PNG of one colour, so the server can suggest that colour. */
export function solidPng(rgb: [number, number, number], size = 64): Buffer {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf: Buffer) => {
    let c = 0xffffffff;
    for (const byte of buf) c = crcTable[(c ^ byte) & 0xff]! ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type: string, data: Buffer) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const sum = Buffer.alloc(4);
    sum.writeUInt32BE(crc(body));
    return Buffer.concat([length, body, sum]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // truecolour
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(size * 3)]);
  for (let x = 0; x < size; x++) row.set(rgb, 1 + x * 3);
  const pixels = Buffer.concat(Array.from({ length: size }, () => row));
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(pixels)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
