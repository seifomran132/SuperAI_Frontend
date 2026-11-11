import { expect, test, type Browser, type Page } from '@playwright/test';
import {
  API,
  SKIP_MESSAGE,
  createConfirmedUser,
  expectAccessibleRtl,
  expectNoHorizontalScroll,
  gotrueToken,
  signedInContext,
  solidPng,
  stackReachable,
  text,
} from '../support';

// MANUAL_TEST_CASES.md §3h (brand kits), one test per case ID. Each test
// uses a fresh user, so kits never collide.

let stackUp = false;
test.beforeAll(async () => {
  stackUp = await stackReachable();
});
test.beforeEach(() => test.skip(!stackUp, SKIP_MESSAGE));

const b = text.brandKits;

interface Session {
  page: Page;
  token: string;
  close: () => Promise<void>;
}

async function asNewUser(browser: Browser): Promise<Session> {
  const user = await createConfirmedUser(browser, 'e2e-brand');
  const context = await signedInContext(browser, user.email, user.password);
  return {
    page: await context.newPage(),
    token: await gotrueToken(user.email, user.password),
    close: () => context.close(),
  };
}

async function api<T>(
  token: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API}/api/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status}`);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

interface Kit {
  id: string;
  colors: string[];
  profile: { tone: string; dos: string[] };
  assets: { id: string; kind: string }[];
}

const createKit = (token: string, name = 'مقهى e2e') =>
  api<Kit>(token, 'POST', '/me/brand-kits', { name });

const group = (page: Page, kind: keyof typeof b.assets.kinds) =>
  page.getByRole('region', { name: b.assets.kinds[kind].title });

const fileInput = (page: Page, kind: keyof typeof b.assets.kinds) =>
  group(page, kind).locator('input[type=file]:not([capture])');

test('BK-01 create a kit from the empty list and open it', async ({
  browser,
}) => {
  const s = await asNewUser(browser);
  try {
    await s.page.goto('/brands');
    await expect(s.page.getByText(b.emptyTitle)).toBeVisible();
    await expectAccessibleRtl(s.page);
    await s.page.getByRole('button', { name: b.new }).click();
    const dialog = s.page.getByRole('dialog');
    await dialog.getByLabel(b.identity.label).fill('عيادة سنا');
    await dialog.getByRole('button', { name: b.newDialog.create }).click();
    await expect(
      s.page.getByRole('heading', { level: 1, name: 'عيادة سنا' }),
    ).toBeVisible();
    await expect(s.page).toHaveURL(/\/brands\/[0-9a-f-]{36}$/);
    await expect(s.page.getByText(b.draftNote.title)).toHaveCount(0);
    await expectAccessibleRtl(s.page);
    await expectNoHorizontalScroll(s.page);
  } finally {
    await s.close();
  }
});

test('BK-02 a logo upload offers its colour, added only on «إضافة»', async ({
  browser,
}) => {
  const s = await asNewUser(browser);
  try {
    const kit = await createKit(s.token);
    await s.page.goto(`/brands/${kit.id}`);
    await fileInput(s.page, 'logo').setInputFiles({
      name: 'logo.png',
      mimeType: 'image/png',
      buffer: solidPng([0x1a, 0x4b, 0x8c]),
    });
    await expect(s.page.getByText(b.colors.suggestedTitle)).toBeVisible();
    await expect(group(s.page, 'logo').locator('img')).toHaveCount(1);
    expect(
      (await api<Kit>(s.token, 'GET', `/me/brand-kits/${kit.id}`)).colors,
    ).toEqual([]);

    const chip = s.page.getByRole('button', {
      name: b.colors.addSuggestedLabel.replace('{{hex}}', '#1A4B8C'),
    });
    await chip.click();
    await s.page.getByRole('button', { name: b.colors.save }).click();
    await expect(s.page.getByText(b.unsaved.bar)).toHaveCount(0);
    expect(
      (await api<Kit>(s.token, 'GET', `/me/brand-kits/${kit.id}`)).colors,
    ).toEqual(['#1A4B8C']);
  } finally {
    await s.close();
  }
});

test('BK-03 the profile saves as one change', async ({ browser }) => {
  const s = await asNewUser(browser);
  try {
    const kit = await createKit(s.token);
    await s.page.goto(`/brands/${kit.id}`);
    const profile = s.page.getByRole('region', { name: b.profile.title });
    await profile.getByLabel(b.profile.tone).fill('ودّية ومباشرة');
    const dos = profile.getByRole('group', { name: b.profile.dos });
    await dos.getByRole('button', { name: b.profile.addRule }).click();
    await dos.getByRole('textbox').fill('اترك مساحة حول الشعار');
    await profile.getByRole('button', { name: b.profile.save }).click();
    await expect(s.page.getByText(b.unsaved.bar)).toHaveCount(0);
    const saved = await api<Kit>(s.token, 'GET', `/me/brand-kits/${kit.id}`);
    expect(saved.profile.tone).toBe('ودّية ومباشرة');
    expect(saved.profile.dos).toEqual(['اترك مساحة حول الشعار']);
  } finally {
    await s.close();
  }
});

test('BK-04 a PDF is refused outside guidelines, kept as a guideline', async ({
  browser,
}) => {
  const s = await asNewUser(browser);
  try {
    const kit = await createKit(s.token);
    await s.page.goto(`/brands/${kit.id}`);
    const pdf = {
      name: 'guide.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\n%%EOF\n'),
    };
    await fileInput(s.page, 'product').setInputFiles(pdf);
    await expect(group(s.page, 'product').getByRole('alert')).toBeVisible();
    await fileInput(s.page, 'guideline').setInputFiles(pdf);
    await expect(group(s.page, 'guideline').getByText(/PDF ·/)).toBeVisible();
    const saved = await api<Kit>(s.token, 'GET', `/me/brand-kits/${kit.id}`);
    expect(saved.assets.map((a) => a.kind)).toEqual(['guideline']);
  } finally {
    await s.close();
  }
});

test('BK-05 delete a file', async ({ browser }) => {
  const s = await asNewUser(browser);
  try {
    const kit = await createKit(s.token);
    await s.page.goto(`/brands/${kit.id}`);
    await fileInput(s.page, 'reference').setInputFiles({
      name: 'past.png',
      mimeType: 'image/png',
      buffer: solidPng([200, 160, 75]),
    });
    const remove = group(s.page, 'reference').getByRole('button', {
      name: b.assets.removeLabel
        .replace('{{position}}', '1')
        .replace('{{group}}', b.assets.kinds.reference.title),
    });
    await remove.click();
    await expect(remove).toHaveCount(0);
    expect(
      (await api<Kit>(s.token, 'GET', `/me/brand-kits/${kit.id}`)).assets,
    ).toEqual([]);
  } finally {
    await s.close();
  }
});

test('BK-06 leaving with unsaved changes asks first', async ({ browser }) => {
  const s = await asNewUser(browser);
  try {
    const kit = await createKit(s.token);
    await s.page.goto(`/brands/${kit.id}`);
    await s.page.getByLabel(b.identity.label).fill('اسم لم يُحفظ');
    await s.page.getByRole('link', { name: b.back }).first().click();
    const dialog = s.page.getByRole('dialog', { name: b.leave.title });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: b.leave.stay }).click();
    await expect(s.page).toHaveURL(new RegExp(kit.id));
    await s.page.getByRole('link', { name: b.back }).first().click();
    await s.page
      .getByRole('dialog', { name: b.leave.title })
      .getByRole('button', { name: b.leave.leave })
      .click();
    await expect(s.page).toHaveURL(/\/brands$/);
  } finally {
    await s.close();
  }
});

test('BK-07 delete a kit after confirming', async ({ browser }) => {
  const s = await asNewUser(browser);
  try {
    const kit = await createKit(s.token, 'هوية للحذف');
    await s.page.goto(`/brands/${kit.id}`);
    await s.page.getByRole('button', { name: b.delete.action }).click();
    const dialog = s.page.getByRole('dialog');
    await expectAccessibleRtl(s.page);
    await dialog.getByRole('button', { name: b.delete.confirm }).click();
    await expect(s.page).toHaveURL(/\/brands$/);
    await expect(s.page.getByText(b.emptyTitle)).toBeVisible();
  } finally {
    await s.close();
  }
});

test('BK-08 the plan limit disables «هوية جديدة»', async ({ browser }) => {
  const s = await asNewUser(browser);
  try {
    const { limit } = await api<{ limit: number }>(
      s.token,
      'GET',
      '/me/brand-kits',
    );
    for (let i = 0; i < limit; i++) await createKit(s.token, `هوية ${i + 1}`);
    await s.page.goto('/brands');
    await expect(s.page.getByRole('button', { name: b.new })).toBeDisabled();
    await expect(
      s.page.getByRole('link', { name: b.viewPlans }),
    ).toHaveAttribute('href', '/plans');
    await expectNoHorizontalScroll(s.page);
  } finally {
    await s.close();
  }
});
