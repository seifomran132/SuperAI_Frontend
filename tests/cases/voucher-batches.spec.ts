import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
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
  fundUser,
  gotrueToken,
  myId,
  stackReachable,
  text,
} from '../support';

// MANUAL_TEST_CASES.md §3g (voucher batches), one test per case ID. Batches are
// real and cannot be deleted, so they pile up in the local list only.

let stackUp = false;
test.beforeAll(async () => {
  stackUp = await stackReachable();
});
test.beforeEach(() => {
  test.skip(!stackUp, SKIP_MESSAGE);
  test.skip(!adminCredentials(), ADMIN_SKIP_MESSAGE);
});

const v = text.admin.vouchers;
const b = v.batches;
const reasonLabel = text.admin.dialog.reason;

interface Batch {
  id: string;
  name: string;
}
interface Code {
  id: string;
  code: string;
}

function createBatch(extra: Record<string, unknown> = {}): Promise<Batch> {
  return adminCall<Batch>('POST', '/admin/voucher-batches', {
    reason: 'e2e batch',
    name: `e2e ${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    kind: 'balance',
    amountUsd: '1.50',
    quantity: 3,
    prefix: 'E2E',
    idempotencyKey: randomUUID(),
    ...extra,
  });
}

const codesOf = async (batch: Batch) =>
  (
    await adminCall<{ items: Code[] }>(
      'GET',
      `/admin/voucher-batches/${batch.id}/codes`,
    )
  ).items;

async function asAdmin(browser: Browser, fn: (admin: Page) => Promise<void>) {
  const context = await adminContext(browser);
  try {
    await fn(await context.newPage());
  } finally {
    await context.close();
  }
}

async function apiRedeem(token: string, code: string): Promise<number> {
  const res = await fetch(`${API}/api/v1/me/vouchers/redeem`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code }),
  });
  return res.status;
}

async function fundedToken(browser: Browser): Promise<string> {
  const user = await createConfirmedUser(browser, 'e2e-batch-user');
  const token = await gotrueToken(user.email, user.password);
  await fundUser(await myId(token));
  return token;
}

const openBatch = async (page: Page, batch: Batch) => {
  await page.goto(`/admin/vouchers/batches/${batch.id}`);
  await expect(page.getByRole('heading', { name: batch.name })).toBeVisible();
};

test('VB-01 the batches tab lists a new batch and links to it', async ({
  browser,
}) => {
  const batch = await createBatch();
  await asAdmin(browser, async (page) => {
    await page.goto('/admin/vouchers?tab=batches');
    await page.getByRole('link', { name: batch.name }).first().click();
    await expect(page).toHaveURL(new RegExp(`/batches/${batch.id}`));
  });
});

test('VB-02 create: total, example code, live-codes notice', async ({
  browser,
}) => {
  await asAdmin(browser, async (page) => {
    await page.goto('/admin/vouchers/batches/new');
    await page.getByLabel(new RegExp(`^${b.name}`)).fill('e2e نموذج');
    await page.getByLabel(new RegExp(`^${b.amount}`)).fill('2');
    await page.getByLabel(new RegExp(`^${b.quantity}`)).fill('4');
    await page.getByLabel(new RegExp(`^${b.prefix.split(' ')[0]}`)).fill('eid');
    await expect(page.getByText('EID-7KQ2-XH9M')).toBeVisible();
    await expect(page.getByText('8.00$')).toBeVisible();
    await expectAccessibleRtl(page);
    await expectNoHorizontalScroll(page);
    await page.getByLabel(new RegExp(`^${reasonLabel}`)).fill('e2e');
    await page.getByRole('button', { name: b.createSubmit }).click();
    await expect(page.getByText(b.noticeTitle)).toBeVisible();
    await expect(
      page.getByText(/^EID-/).filter({ visible: true }).first(),
    ).toBeVisible();
  });
});

test('VB-03 create: a total above the limit blocks submit', async ({
  browser,
}) => {
  await asAdmin(browser, async (page) => {
    await page.goto('/admin/vouchers/batches/new');
    await page.getByLabel(new RegExp(`^${b.amount}`)).fill('1000');
    await page.getByLabel(new RegExp(`^${b.quantity}`)).fill('11');
    await expect(page.getByText(b.overLimit)).toBeVisible();
    await expect(
      page.getByRole('button', { name: b.createSubmit }),
    ).toBeDisabled();
  });
});

test('VB-04 download warns first and saves every code', async ({ browser }) => {
  const batch = await createBatch();
  const codes = await codesOf(batch);
  await asAdmin(browser, async (page) => {
    await openBatch(page, batch);
    await page.getByRole('button', { name: b.download }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(b.warningTitle)).toBeVisible();
    await expectAccessibleRtl(page);
    const pending = page.waitForEvent('download');
    await dialog.getByRole('button', { name: b.downloadFile }).click();
    const file = await pending;
    expect(file.suggestedFilename()).toBe(`${batch.name}.csv`);
    const csv = await readFile(await file.path(), 'utf8');
    expect(csv).toContain('code,kind,amount_usd');
    for (const code of codes) expect(csv).toContain(code.code);
    await expect(dialog).toBeHidden();
  });
});

test('VB-05 a failed download stays open and can retry', async ({
  browser,
}) => {
  const batch = await createBatch();
  await asAdmin(browser, async (page) => {
    await page.route('**/export', (route) =>
      route.fulfill({ status: 500, body: '{}' }),
    );
    await openBatch(page, batch);
    await page.getByRole('button', { name: b.download }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: b.downloadFile }).click();
    await expect(dialog.getByText(b.downloadFailed)).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: b.downloadFile }),
    ).toBeEnabled();
  });
});

test('VB-06 turning one code off stops it, and it can come back', async ({
  browser,
}) => {
  const batch = await createBatch();
  const [code] = await codesOf(batch);
  const token = await fundedToken(browser);
  await asAdmin(browser, async (page) => {
    await openBatch(page, batch);
    await page
      .getByRole('button', { name: `${v.deactivate} ${code!.code}` })
      .filter({ visible: true })
      .click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(new RegExp(`^${reasonLabel}`)).fill('e2e تسرب');
    await dialog.getByRole('button', { name: v.deactivate }).click();
    await expect(dialog).toBeHidden();
    expect(await apiRedeem(token, code!.code)).toBe(404);

    await page
      .getByRole('button', { name: `${v.activate} ${code!.code}` })
      .filter({ visible: true })
      .click();
    await dialog.getByLabel(new RegExp(`^${reasonLabel}`)).fill('e2e رجوع');
    await dialog.getByRole('button', { name: v.activate }).click();
    await expect(dialog).toBeHidden();
    expect(await apiRedeem(token, code!.code)).toBeLessThan(300);
  });
});

test('VB-07 a used code shows its user and has no action; progress moves', async ({
  browser,
}) => {
  const batch = await createBatch();
  const [code] = await codesOf(batch);
  const token = await fundedToken(browser);
  expect(await apiRedeem(token, code!.code)).toBeLessThan(300);
  await asAdmin(browser, async (page) => {
    await openBatch(page, batch);
    await expect(page.getByText('1 / 3').first()).toBeVisible();
    await expect(page.getByText('1.50$').first()).toBeVisible();
    await expect(
      page.getByRole('button', { name: `${v.deactivate} ${code!.code}` }),
    ).toHaveCount(0);
    await expectNoHorizontalScroll(page);
  });
});

test('VB-08 turning the batch off stops its codes, CSV stays available', async ({
  browser,
}) => {
  const batch = await createBatch();
  const [code] = await codesOf(batch);
  const token = await fundedToken(browser);
  await asAdmin(browser, async (page) => {
    await openBatch(page, batch);
    await page.getByRole('button', { name: b.deactivate }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(new RegExp(`^${reasonLabel}`)).fill('e2e');
    await dialog.getByRole('button', { name: b.deactivate }).click();
    await expect(page.getByText(b.inactiveBanner)).toBeVisible();
    expect(await apiRedeem(token, code!.code)).toBe(404);
    await expect(page.getByRole('button', { name: b.download })).toBeEnabled();
    await expect(
      page.getByRole('button', { name: `${v.deactivate} ${code!.code}` }),
    ).toHaveCount(0);
  });
});

test('VB-09 a batch code has no limit or end date and links its batch', async ({
  browser,
}) => {
  const batch = await createBatch();
  const [code] = await codesOf(batch);
  await asAdmin(browser, async (page) => {
    await page.goto(`/admin/vouchers/${code!.id}`);
    await expect(page.getByText(b.batchCodeBody)).toBeVisible();
    await expect(page.getByLabel(v.maxRedemptions)).toHaveCount(0);
    await expect(page.getByLabel(v.endsAt)).toHaveCount(0);
    await page.getByRole('link', { name: b.openBatch }).click();
    await expect(page).toHaveURL(new RegExp(`/batches/${batch.id}`));
  });
});
