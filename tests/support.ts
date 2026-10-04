import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';
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
