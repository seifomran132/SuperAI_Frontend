import { expect, test, type BrowserContext } from '@playwright/test';
import {
  ADMIN_SKIP_MESSAGE,
  API,
  SKIP_MESSAGE,
  adminContext,
  adminCredentials,
  adminToken,
  expectAccessibleRtl,
  expectNoHorizontalScroll,
  stackReachable,
} from './support';

// Every route at phone, tablet and desktop width: RTL, no serious/critical
// axe violation, no horizontal page scroll. Signed-in routes use the test
// admin (who can see every area); guest routes use a clean context.
const WIDTHS = [
  { name: '375', width: 375, height: 800 },
  { name: '768', width: 768, height: 1024 },
  { name: '1280', width: 1280, height: 800 },
];

let stackUp = false;
let guest: BrowserContext;
let admin: BrowserContext | undefined;
let ids = {
  userId: '',
  conversationId: '',
  planKey: '',
  modelId: '',
  modeKey: '',
};

async function getJson<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API}/api/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
  return (await res.json()) as T;
}

test.beforeAll(async ({ browser }) => {
  stackUp = await stackReachable();
  if (!stackUp) return;
  guest = await browser.newContext({
    locale: 'ar',
    baseURL: 'http://localhost:3001',
  });
  if (!adminCredentials()) return;
  admin = await adminContext(browser);
  const token = await adminToken();
  const users = await getJson<{ items: { id: string }[] }>(
    '/admin/users?pageSize=1',
    token,
  );
  const plans = await getJson<{ key: string }[]>('/admin/plans', token);
  const models = await getJson<{ id: string }[]>('/admin/models', token);
  const modes = await getJson<{ key: string }[]>('/admin/modes', token);
  const created = await fetch(`${API}/api/v1/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ modeKey: modes[0]?.key }),
  });
  ids = {
    userId: users.items[0]?.id ?? '',
    conversationId: ((await created.json()) as { id: string }).id,
    planKey: plans[0]?.key ?? '',
    modelId: models[0]?.id ?? '',
    modeKey: modes[0]?.key ?? '',
  };
});
test.afterAll(async () => {
  await guest?.close();
  await admin?.close();
});
test.beforeEach(() => {
  test.skip(!stackUp, SKIP_MESSAGE);
});

const guestRoutes = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/check-email?reason=signup',
  '/check-email?reason=reset',
  '/reset-password',
  '/auth/callback',
  '/account-unavailable',
  '/plans',
];

// Known production bugs: these routes are expected to fail until fixed
// (test.fail turns green once the bug is gone, prompting removal of the entry).
const KNOWN_BUGS: Record<string, string> = {};

const signedInRoutes: [string, () => string][] = [
  ['/chat', () => '/chat'],
  ['/chat/<id>', () => `/chat/${ids.conversationId}`],
  ['/balance', () => '/balance'],
  ['/account', () => '/account'],
  ['/plans (signed in)', () => '/plans'],
  ['/complete-profile', () => '/complete-profile'],
  ['/admin/users', () => '/admin/users'],
  [
    '/admin/users/<id> overview',
    () => `/admin/users/${ids.userId}?tab=overview`,
  ],
  [
    '/admin/users/<id> subscription',
    () => `/admin/users/${ids.userId}?tab=subscription`,
  ],
  ['/admin/users/<id> balance', () => `/admin/users/${ids.userId}?tab=balance`],
  ['/admin/plans', () => '/admin/plans'],
  ['/admin/plans/new', () => '/admin/plans/new'],
  ['/admin/plans/<key>', () => `/admin/plans/${ids.planKey}`],
  ['/admin/providers', () => '/admin/providers'],
  ['/admin/models', () => '/admin/models'],
  ['/admin/models/new', () => '/admin/models/new'],
  ['/admin/models/<id>', () => `/admin/models/${ids.modelId}`],
  ['/admin/modes', () => '/admin/modes'],
  ['/admin/modes/new', () => '/admin/modes/new'],
  ['/admin/modes/<key>', () => `/admin/modes/${ids.modeKey}`],
  ['/admin/settings', () => '/admin/settings'],
];

async function sweep(
  context: BrowserContext,
  path: string,
  width: number,
  height: number,
) {
  const page = await context.newPage();
  try {
    await page.setViewportSize({ width, height });
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    // Skeletons and spinners are gone before the page is judged.
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
    await expect(page.locator('body')).not.toBeEmpty();
    await expectAccessibleRtl(page);
    await expectNoHorizontalScroll(page);
  } finally {
    await page.close();
  }
}

for (const path of guestRoutes) {
  for (const { name, width, height } of WIDTHS) {
    test(`guest ${path} @${name}`, async () => {
      await sweep(guest, path, width, height);
    });
  }
}

for (const [label, path] of signedInRoutes) {
  for (const { name, width, height } of WIDTHS) {
    test(`${label} @${name}`, async () => {
      test.skip(!admin, ADMIN_SKIP_MESSAGE);
      const bug = KNOWN_BUGS[`${label} @${name}`];
      if (bug) test.fail(true, bug);
      await sweep(admin!, path(), width, height);
    });
  }
}

// `/` is intentionally empty until the landing page (S13) exists.
test('guest / is an empty RTL document', async () => {
  const page = await guest.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expectNoHorizontalScroll(page);
  await page.close();
});
