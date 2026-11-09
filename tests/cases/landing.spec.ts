import { expect, test, type Page } from '@playwright/test';
import {
  expectAccessibleRtl,
  expectNoHorizontalScroll,
  text,
} from '../support';

// Mocked plans: these cases cover the public page, so they run without the API.
const plans = [
  {
    key: 'free',
    nameAr: 'مجانية',
    nameEn: 'Free',
    descriptionAr: 'وصف',
    descriptionEn: 'desc',
    monthlyPriceUsd: '0.000000000',
    includedBalanceUsd: '0.000000000',
    isDefault: true,
    modes: [],
  },
  {
    key: 'pro',
    nameAr: 'الباقة الاحترافية',
    nameEn: 'Pro',
    descriptionAr: 'كل الأوضاع',
    descriptionEn: 'All modes',
    monthlyPriceUsd: '20.000000000',
    includedBalanceUsd: '15.000000000',
    isDefault: false,
    modes: [
      {
        key: 'fast',
        labelAr: 'سريع',
        labelEn: 'Fast',
        descriptionAr: 'وصف',
        descriptionEn: 'desc',
      },
    ],
  },
];

async function openLanding(page: Page, body: unknown = plans, status = 200) {
  await page.route(/\/api\/v1\/plans$/, (route) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    }),
  );
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

test('LP-01 home stays public, right-to-left and accessible', async ({
  page,
}) => {
  await openLanding(page);
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole('heading', { name: 'الباقة الاحترافية' }),
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expectNoHorizontalScroll(page);
  await expectAccessibleRtl(page);
});

test('LP-02 shows all three modes, and paid plans only', async ({ page }) => {
  await openLanding(page);
  await expect(page.getByText(text.landing.modes.fastTitle)).toBeVisible();
  await expect(page.getByText(text.landing.modes.proTitle)).toBeVisible();
  await expect(page.getByText(text.landing.modes.imageTitle)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'مجانية' })).toHaveCount(0);
});

test('LP-03 subscribe scrolls to how to get a plan', async ({ page }) => {
  await openLanding(page);
  await page.getByRole('link', { name: text.plans.subscribe }).click();
  await expect(
    page.getByRole('heading', { name: text.landing.howTo.title }),
  ).toBeInViewport();
  await expect(page).toHaveURL(/#how-to-get-a-plan$/);
});

test('LP-04 sign-up and sign-in links open their pages', async ({ page }) => {
  await openLanding(page);
  await page
    .getByRole('link', { name: text.auth.signUp.title })
    .first()
    .click();
  await expect(page).toHaveURL(/\/sign-up$/);
  await page.goBack();
  await page
    .getByRole('link', { name: text.auth.signIn.title })
    .first()
    .click();
  await expect(page).toHaveURL(/\/sign-in$/);
});

test('LP-05 a plans error offers retry and keeps the page', async ({
  page,
}) => {
  await openLanding(page, {}, 500);
  await expect(page.getByText(text.plans.error)).toBeVisible();
  await expect(
    page.getByRole('link', { name: text.landing.plans.all }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: text.landing.closing.title }),
  ).toBeVisible();
});

test('LP-06 frequently asked questions open and close', async ({ page }) => {
  await openLanding(page);
  const answer = page.getByText(text.landing.faq.a5);
  await expect(answer).toBeHidden();
  await page.getByText(text.landing.faq.q5).click();
  await expect(answer).toBeVisible();
  await page.getByText(text.landing.faq.q5).click();
  await expect(answer).toBeHidden();
});
