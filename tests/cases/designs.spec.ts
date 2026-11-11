import { expect, test } from '@playwright/test';
import {
  ADMIN_SKIP_MESSAGE,
  SKIP_MESSAGE,
  adminCall,
  adminContext,
  adminCredentials,
  createConfirmedUser,
  expectAccessibleRtl,
  expectNoHorizontalScroll,
  signedInContext,
  stackReachable,
  text,
} from '../support';

// MANUAL_TEST_CASES.md §3j, the parts that run without priced image models
// (making a design needs them, so DS-01 to DS-06 stay manual locally).

test.describe.configure({ mode: 'serial' });

const AGENT = 'graphic_designer';
interface AdminAgent {
  isEnabled: boolean;
  planKeys: string[];
  promptInstructions: string | null;
}
let original: AdminAgent | null = null;
let stackUp = false;

test.beforeAll(async () => {
  stackUp = await stackReachable();
  if (!stackUp || !adminCredentials()) return;
  const agents = await adminCall<(AdminAgent & { key: string })[]>(
    'GET',
    '/admin/agents',
  );
  original = agents.find((a) => a.key === AGENT) ?? null;
  const plans = await adminCall<{ key: string; isDefault: boolean }[]>(
    'GET',
    '/admin/plans',
  );
  const fallback = plans.find((p) => p.isDefault)?.key;
  if (!original || !fallback) return;
  await adminCall('PATCH', `/admin/agents/${AGENT}`, {
    reason: 'e2e designs',
    isEnabled: true,
    planKeys: [...new Set([...original.planKeys, fallback])],
  });
});

test.afterAll(async () => {
  if (!original) return;
  await adminCall('PATCH', `/admin/agents/${AGENT}`, {
    reason: 'e2e designs: restore',
    isEnabled: original.isEnabled,
    planKeys: original.planKeys,
    promptInstructions: original.promptInstructions,
  });
});

test.beforeEach(() => {
  test.skip(!stackUp, SKIP_MESSAGE);
  test.skip(!adminCredentials(), ADMIN_SKIP_MESSAGE);
  test.skip(!original, 'The backend has no graphic_designer agent.');
});

const d = text.designs;
const runs = text.admin.reports.runs;

test('DS-07 «تصاميمي» is linked and empty for a new user', async ({
  browser,
}) => {
  const user = await createConfirmedUser(browser, 'e2e-designs');
  const context = await signedInContext(browser, user.email, user.password);
  try {
    const page = await context.newPage();
    await page.goto('/chat');
    // Below 1024px the link is in the drawer.
    if ((page.viewportSize()?.width ?? 1280) < 1024) {
      await page.getByRole('button', { name: text.shell.openMenu }).click();
    }
    await page
      .getByRole('link', { name: text.shell.designs })
      .filter({ visible: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/designs$/);
    await expect(page.getByText(d.emptyTitle)).toBeVisible();
    await expectAccessibleRtl(page);
    await expectNoHorizontalScroll(page);
  } finally {
    await context.close();
  }
});

test('DS-09 the overview shows designs and leads to the runs page', async ({
  browser,
}) => {
  const context = await adminContext(browser);
  try {
    const page = await context.newPage();
    await page.goto('/admin/overview');
    await expect(
      page.getByRole('region', { name: text.admin.reports.designs.title }),
    ).toBeVisible();
    await page
      .getByRole('link', {
        name: new RegExp(text.admin.reports.designs.toReview),
      })
      .click();
    await expect(page).toHaveURL(/\/admin\/agent-runs$/);
    await expect(
      page.getByRole('button', { name: runs.chips.reconciliation_required }),
    ).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: runs.chips.all }).click();
    await expect(
      page
        .getByRole('table', { name: runs.tableLabel })
        .or(page.getByText(runs.empty)),
    ).toBeVisible();
    await expectAccessibleRtl(page);
  } finally {
    await context.close();
  }
});

test('DS-10 custom instructions show as «مخصّصة» and restore to the default', async ({
  browser,
}) => {
  const a = text.admin.agents;
  const context = await adminContext(browser);
  try {
    const page = await context.newPage();
    await page.goto('/admin/agents');
    await page
      .getByRole('button', {
        name: a.editLabel.replace('{{name}}', 'مصمم جرافيك'),
      })
      .click();
    const dialog = page.getByRole('dialog');
    await dialog.getByText(a.advanced).click();
    await dialog
      .getByLabel(new RegExp(a.promptInstructions))
      .fill('e2e: keep it short');
    await dialog.getByLabel(new RegExp(text.admin.dialog.reason)).fill('e2e');
    await dialog.getByRole('button', { name: a.save }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText(a.custom)).toBeVisible();
    const saved = await adminCall<(AdminAgent & { key: string })[]>(
      'GET',
      '/admin/agents',
    );
    expect(saved.find((x) => x.key === AGENT)?.promptInstructions).toBe(
      'e2e: keep it short',
    );

    await page
      .getByRole('button', {
        name: a.editLabel.replace('{{name}}', 'مصمم جرافيك'),
      })
      .click();
    await dialog.getByRole('button', { name: a.restoreDefault }).click();
    await dialog.getByLabel(new RegExp(text.admin.dialog.reason)).fill('e2e');
    await dialog.getByRole('button', { name: a.save }).click();
    await expect(dialog).toBeHidden();
    const restored = await adminCall<(AdminAgent & { key: string })[]>(
      'GET',
      '/admin/agents',
    );
    expect(
      restored.find((x) => x.key === AGENT)?.promptInstructions,
    ).toBeNull();
  } finally {
    await context.close();
  }
});
