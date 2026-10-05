import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';
import {
  expect,
  type Browser,
  type BrowserContext,
  type Page,
} from '@playwright/test';
import ar from '../src/i18n/ar.json' with { type: 'json' };

export const text = ar;

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
}

/** Signs in through the sign-in form and waits for /chat. */
export async function signIn(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/sign-in');
  await page.getByLabel(text.auth.fields.email, { exact: true }).fill(email);
  await page
    .getByLabel(text.auth.fields.password, { exact: true })
    .fill(password);
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
