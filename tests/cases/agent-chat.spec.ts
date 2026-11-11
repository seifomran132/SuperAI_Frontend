import { expect, test, type Browser, type Page } from '@playwright/test';
import {
  ADMIN_SKIP_MESSAGE,
  API,
  SKIP_MESSAGE,
  adminCall,
  adminContext,
  adminCredentials,
  createConfirmedUser,
  expectAccessibleRtl,
  expectNoHorizontalScroll,
  gotrueToken,
  signedInContext,
  solidPng,
  stackReachable,
  text,
} from '../support';

// MANUAL_TEST_CASES.md §3i (graphic designer in the chat), one test per case
// ID. The agent is switched on for the local default plan for these tests and
// put back as it was afterwards. Serial: AG-05 switches it off for everyone.

test.describe.configure({ mode: 'serial' });

const g = text.chat.agent;
const AGENT = 'graphic_designer';

interface AdminAgent {
  key: string;
  isEnabled: boolean;
  planKeys: string[];
}
let original: AdminAgent | null = null;
let stackUp = false;

test.beforeAll(async () => {
  stackUp = await stackReachable();
  if (!stackUp || !adminCredentials()) return;
  const agents = await adminCall<AdminAgent[]>('GET', '/admin/agents');
  original = agents.find((a) => a.key === AGENT) ?? null;
  const plans = await adminCall<{ key: string; isDefault: boolean }[]>(
    'GET',
    '/admin/plans',
  );
  const fallback = plans.find((p) => p.isDefault)?.key;
  if (!original || !fallback) return;
  await adminCall('PATCH', `/admin/agents/${AGENT}`, {
    reason: 'e2e agent chat',
    isEnabled: true,
    planKeys: [...new Set([...original.planKeys, fallback])],
  });
});

test.afterAll(async () => {
  if (!original) return;
  await adminCall('PATCH', `/admin/agents/${AGENT}`, {
    reason: 'e2e agent chat: restore',
    isEnabled: original.isEnabled,
    planKeys: original.planKeys,
  });
});

test.beforeEach(() => {
  test.skip(!stackUp, SKIP_MESSAGE);
  test.skip(!adminCredentials(), ADMIN_SKIP_MESSAGE);
  test.skip(!original, 'The backend has no graphic_designer agent.');
});

// The backend's questions (graphic-designer-flow.ts PROMPTS), enough of each to find it.
const ask = {
  pick: 'لأي علامة تجارية نصمم اليوم؟',
  name: 'ما اسم العلامة التجارية؟',
  logo: 'ارفع شعار العلامة',
  colors: 'هذه ألوان علامتك؟',
  style: 'ما الطابع الذي يناسب علامتك؟',
  fonts: 'كيف تبدو خطوط علامتك؟',
  extras: 'هل لديك تصاميم سابقة',
  brandSummary: 'هذه هوية علامتك',
  format: 'رائع! ماذا نصمم؟',
  topic: 'عن ماذا التصميم؟',
  text: 'ما النص الذي يظهر على التصميم؟',
  media: 'هل لديك صورة منتج',
  summary: 'هذا طلبك. هل نبدأ؟',
};

interface Session {
  page: Page;
  token: string;
  close: () => Promise<void>;
}

async function asNewUser(browser: Browser): Promise<Session> {
  const user = await createConfirmedUser(browser, 'e2e-agent');
  const context = await signedInContext(browser, user.email, user.password);
  return {
    page: await context.newPage(),
    token: await gotrueToken(user.email, user.password),
    close: () => context.close(),
  };
}

/** The newest question is on screen (older ones may repeat the same text). */
const asked = (page: Page, question: string) =>
  expect(page.getByText(question, { exact: false }).last()).toBeVisible();

async function startDesigner(page: Page) {
  await page.goto('/chat');
  await page
    .getByRole('button', { name: new RegExp(text.chat.agent.cardAction) })
    .first()
    .click();
  await expect(page).toHaveURL(/\/chat\/[0-9a-f-]{36}$/);
}

const dockButton = (page: Page, name: string) =>
  page.locator('[data-agent-dock]').getByRole('button', { name, exact: true });

test('AG-01 a new user sets up a brand and saves a request, step by step', async ({
  browser,
}) => {
  const s = await asNewUser(browser);
  try {
    await startDesigner(s.page);
    await asked(s.page, ask.name);
    await expect(
      s.page.getByRole('textbox', { name: text.chat.composer.label }),
    ).toHaveCount(0);
    await expectAccessibleRtl(s.page);
    await s.page.getByLabel(g.inputLabel).fill('مقهى e2e');
    await dockButton(s.page, g.send).click();
    await asked(s.page, ask.logo);
    await expect(s.page.getByText('مقهى e2e').first()).toBeVisible();
    await dockButton(s.page, g.skip).click();
    await asked(s.page, ask.colors);
    await dockButton(s.page, g.send).click();
    await asked(s.page, ask.style);
    await dockButton(s.page, 'بسيط وهادئ').click();
    await asked(s.page, ask.fonts);
    await dockButton(s.page, 'حديث وبسيط').click();
    await asked(s.page, ask.extras);
    await dockButton(s.page, g.skip).click();
    await asked(s.page, ask.brandSummary);
    await dockButton(s.page, g.looksGood).click();
    await asked(s.page, ask.format);
    await dockButton(s.page, 'منشور إنستغرام').click();
    await asked(s.page, ask.topic);
    await s.page.getByLabel(g.inputLabel).fill('عرض العيد');
    await dockButton(s.page, g.send).click();
    await asked(s.page, ask.text);
    await dockButton(s.page, g.noText).click();
    await asked(s.page, ask.media);
    await dockButton(s.page, g.skip).click();
    await asked(s.page, ask.summary);
    await expectNoHorizontalScroll(s.page);
    // No prices ever. Locally the agent is usually not ready (no priced image
    // models) and a new user has no balance, so creating either can't start
    // or starts the run: each outcome must be shown.
    await expect(s.page.locator('[data-agent-dock]')).not.toContainText('$');
    const create = dockButton(s.page, g.create);
    if (await create.isEnabled()) {
      await create.click();
      await expect(
        s.page
          .getByText(g.notReady)
          .or(s.page.getByText(g.working))
          .or(s.page.getByText(g.fitsNone, { exact: false }))
          .first(),
      ).toBeVisible();
    } else {
      await expect(
        s.page.getByText(g.fitsNone, { exact: false }),
      ).toBeVisible();
    }
    // The kit is ready after its summary was confirmed.
    const kits = await fetch(`${API}/api/v1/me/brand-kits`, {
      headers: { Authorization: `Bearer ${s.token}` },
    }).then(
      (r) => r.json() as Promise<{ items: { name: string; status: string }[] }>,
    );
    expect(kits.items[0]).toMatchObject({ name: 'مقهى e2e', status: 'ready' });
  } finally {
    await s.close();
  }
});

test('AG-02 a logo uploaded in the chat offers its colour', async ({
  browser,
}) => {
  const s = await asNewUser(browser);
  try {
    await startDesigner(s.page);
    await s.page.getByLabel(g.inputLabel).fill('شعار e2e');
    await dockButton(s.page, g.send).click();
    await asked(s.page, ask.logo);
    await s.page
      .locator('[data-agent-dock] input[type=file]:not([capture])')
      .setInputFiles({
        name: 'logo.png',
        mimeType: 'image/png',
        buffer: solidPng([0x1a, 0x4b, 0x8c]),
      });
    await expect(s.page.locator('[data-agent-dock] img')).toHaveCount(1);
    await dockButton(s.page, g.send).click();
    await asked(s.page, ask.colors);
    await expect(
      s.page.getByText(text.brandKits.colors.suggestedTitle),
    ).toBeVisible();
  } finally {
    await s.close();
  }
});

test('AG-03 a user with a brand picks it and goes to the request', async ({
  browser,
}) => {
  const s = await asNewUser(browser);
  try {
    await fetch(`${API}/api/v1/me/brand-kits`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${s.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'هوية جاهزة' }),
    });
    await startDesigner(s.page);
    await asked(s.page, ask.pick);
    await s.page
      .locator('[data-agent-dock]')
      .getByRole('button', { name: /هوية جاهزة/ })
      .click();
    await asked(s.page, ask.format);
    // The title gains the brand name only when it is typed (backend gap, F13 plan §7).
  } finally {
    await s.close();
  }
});

test('AG-04 «تعديل» on the brand summary goes back to that question, then to the summary', async ({
  browser,
}) => {
  const s = await asNewUser(browser);
  try {
    await startDesigner(s.page);
    await s.page.getByLabel(g.inputLabel).fill('قبل');
    await dockButton(s.page, g.send).click();
    await dockButton(s.page, g.skip).click();
    await asked(s.page, ask.colors);
    await dockButton(s.page, g.send).click();
    await dockButton(s.page, 'جريء وملفت').click();
    await dockButton(s.page, 'كلاسيكي').click();
    await asked(s.page, ask.extras);
    await dockButton(s.page, g.skip).click();
    await asked(s.page, ask.brandSummary);
    await s.page
      .getByRole('button', { name: g.editLabel.replace('{{label}}', 'الاسم') })
      .click();
    await asked(s.page, ask.name);
    await s.page.getByLabel(g.inputLabel).fill('بعد');
    await dockButton(s.page, g.send).click();
    await asked(s.page, ask.brandSummary);
    await expect(s.page.locator('[data-agent-dock]')).toContainText('بعد');
  } finally {
    await s.close();
  }
});

test('AG-05 switched off by an admin, the next answer says it is not available', async ({
  browser,
}) => {
  const s = await asNewUser(browser);
  try {
    await startDesigner(s.page);
    await asked(s.page, ask.name);
    await adminCall('PATCH', `/admin/agents/${AGENT}`, {
      reason: 'e2e agent off',
      isEnabled: false,
    });
    await s.page.getByLabel(g.inputLabel).fill('اسم');
    await dockButton(s.page, g.send).click();
    await expect(s.page.getByText(g.notAvailable)).toBeVisible();
  } finally {
    await adminCall('PATCH', `/admin/agents/${AGENT}`, {
      reason: 'e2e agent on',
      isEnabled: true,
    });
    await s.close();
  }
});

test('AG-06 the admin agents page lists the agent and opens its dialog', async ({
  browser,
}) => {
  const context = await adminContext(browser);
  try {
    const page = await context.newPage();
    await page.goto('/admin/agents');
    await expect(page.getByRole('table')).toContainText(AGENT);
    await expectAccessibleRtl(page);
    await page
      .getByRole('button', {
        name: text.admin.agents.editLabel.replace('{{name}}', 'مصمم جرافيك'),
      })
      .click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(text.admin.agents.models)).toBeVisible();
    await expectAccessibleRtl(page);
  } finally {
    await context.close();
  }
});
