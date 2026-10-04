import { expect, test } from '@playwright/test';
import {
  API,
  SKIP_MESSAGE,
  accessToken,
  expectAccessibleRtl,
  stackReachable,
  text,
  waitForMailLink,
} from './support';

// Real local stack: GoTrue sends the mail to Mailpit, the API serves /me.
// The tests share one account and run in order.
test.describe.configure({ mode: 'serial' });

const email = `e2e-${Date.now()}@test.local`;
const name = 'مستخدم تجريبي';
let password = 'e2e-password-1';
let signupLink = '';
let stackUp = false;

test.beforeAll(async () => {
  stackUp = await stackReachable();
});
test.beforeEach(() => {
  test.skip(!stackUp, SKIP_MESSAGE);
});

test('sign up, confirm by email link, land on /chat', async ({ page }) => {
  await page.goto('/sign-up');
  await page.getByLabel(text.auth.fields.fullName, { exact: true }).fill(name);
  await page.getByLabel(text.auth.fields.email, { exact: true }).fill(email);
  await page
    .getByLabel(text.auth.fields.password, { exact: true })
    .fill(password);
  await page.getByRole('button', { name: text.auth.signUp.submit }).click();

  await expect(page).toHaveURL(/\/check-email\?reason=signup$/);
  expect(page.url()).not.toContain('e2e-');
  await expect(page.getByText(email)).toBeVisible();
  await expectAccessibleRtl(page);

  signupLink = await waitForMailLink(email, 'signup');
  await page.goto(signupLink);
  await expect(page).toHaveURL(/\/chat$/);
});

test('missing name sends the user to complete-profile, then to /chat', async ({
  page,
}) => {
  await page.goto('/sign-in');
  await page.getByLabel(text.auth.fields.email, { exact: true }).fill(email);
  await page
    .getByLabel(text.auth.fields.password, { exact: true })
    .fill(password);
  await page.getByRole('button', { name: text.auth.signIn.submit }).click();
  await expect(page).toHaveURL(/\/chat$/);

  const token = await accessToken(page);
  const cleared = await page.request.patch(`${API}/api/v1/me`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { fullName: null },
  });
  expect(cleared.ok()).toBe(true);

  await page.goto('/chat');
  await expect(page).toHaveURL(/\/complete-profile$/);
  await expect(
    page.getByRole('heading', { name: text.auth.completeProfile.title }),
  ).toBeVisible();
  await expectAccessibleRtl(page);

  // Name is required.
  await page
    .getByRole('button', { name: text.auth.completeProfile.submit })
    .click();
  await expect(page.getByText(text.auth.validation.nameRequired)).toBeVisible();

  await page.getByLabel(text.auth.fields.fullName, { exact: true }).fill(name);
  await page
    .getByLabel(text.auth.fields.phone, { exact: true })
    .fill('+966 50 123 4567');
  await page
    .getByRole('button', { name: text.auth.completeProfile.submit })
    .click();
  await expect(page).toHaveURL(/\/chat$/);

  const me = await page.request.get(`${API}/api/v1/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(await me.json()).toMatchObject({
    fullName: name,
    phoneNumber: '+966501234567',
  });
});

test('wrong password shows the generic error, right password signs in', async ({
  page,
}) => {
  await page.goto('/sign-in');
  await page.getByLabel(text.auth.fields.email, { exact: true }).fill(email);
  await page
    .getByLabel(text.auth.fields.password, { exact: true })
    .fill('not-the-password');
  await page.getByRole('button', { name: text.auth.signIn.submit }).click();
  await expect(page.getByRole('alert')).toContainText(
    text.authErrors.invalidCredentials,
  );
  await expect(
    page.getByLabel(text.auth.fields.email, { exact: true }),
  ).toHaveValue(email);
  await expectAccessibleRtl(page);

  await page
    .getByLabel(text.auth.fields.password, { exact: true })
    .fill(password);
  await page.getByRole('button', { name: text.auth.signIn.submit }).click();
  await expect(page).toHaveURL(/\/chat$/);
});

test('?redirect= is followed after sign-in for internal paths only', async ({
  page,
}) => {
  await page.goto('/chat');
  await expect(page).toHaveURL(/\/sign-in\?redirect=%2Fchat$/);
  await page.goto('/sign-in?redirect=https%3A%2F%2Fevil.example');
  await page.getByLabel(text.auth.fields.email, { exact: true }).fill(email);
  await page
    .getByLabel(text.auth.fields.password, { exact: true })
    .fill(password);
  await page.getByRole('button', { name: text.auth.signIn.submit }).click();
  await expect(page).toHaveURL(/localhost:3001\/chat$/);
});

test('forgot password: recovery link, new password, expired on reuse', async ({
  page,
}) => {
  await page.goto('/forgot-password');
  await expectAccessibleRtl(page);
  await page.getByLabel(text.auth.fields.email, { exact: true }).fill(email);
  await page
    .getByRole('button', { name: text.auth.forgotPassword.submit })
    .click();
  await expect(page).toHaveURL(/\/check-email\?reason=reset$/);

  const link = await waitForMailLink(email, 'recovery');
  await page.goto(link);
  await expect(
    page.getByRole('heading', { name: text.auth.resetPassword.title }),
  ).toBeVisible();
  await expectAccessibleRtl(page);

  await page
    .getByLabel(text.auth.fields.newPassword, { exact: true })
    .fill('new-password-2');
  await page
    .getByLabel(text.auth.fields.confirmPassword, { exact: true })
    .fill('different-123');
  await page
    .getByRole('button', { name: text.auth.resetPassword.submit })
    .click();
  await expect(
    page.getByText(text.auth.validation.passwordMismatch),
  ).toBeVisible();

  await page
    .getByLabel(text.auth.fields.confirmPassword, { exact: true })
    .fill('new-password-2');
  await page
    .getByRole('button', { name: text.auth.resetPassword.submit })
    .click();
  await expect(page).toHaveURL(/\/chat$/);
  password = 'new-password-2';

  // The same link is single-use: a fresh browser context sees the expired state.
  const fresh = await page.context().browser()!.newContext({ locale: 'ar' });
  const reuse = await fresh.newPage();
  await reuse.goto(link);
  await expect(
    reuse.getByRole('heading', { name: text.auth.linkExpired.title }),
  ).toBeVisible();
  await expect(reuse.getByText(text.authErrors.otpExpired)).toBeVisible();
  await expectAccessibleRtl(reuse);
  await expect(
    reuse.getByRole('link', { name: text.auth.linkExpired.newLink }),
  ).toHaveAttribute('href', '/forgot-password');
  await fresh.close();
});

test('the confirmation link cannot be used twice', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'ar' });
  const page = await context.newPage();
  await page.goto(signupLink);
  await expect(
    page.getByRole('heading', { name: text.auth.linkExpired.title }),
  ).toBeVisible();
  await context.close();
});

test('the new password works', async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByLabel(text.auth.fields.email, { exact: true }).fill(email);
  await page
    .getByLabel(text.auth.fields.password, { exact: true })
    .fill(password);
  await page.getByRole('button', { name: text.auth.signIn.submit }).click();
  await expect(page).toHaveURL(/\/chat$/);
});
