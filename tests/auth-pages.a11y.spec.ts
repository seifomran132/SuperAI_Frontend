import { test } from '@playwright/test';
import { expectAccessibleRtl, text } from './support';

// Static auth pages: need only the dev server, not the backend.
const pages: [string, string, string][] = [
  ['sign-in', '/sign-in', text.auth.signIn.title],
  ['sign-up', '/sign-up', text.auth.signUp.title],
  ['forgot-password', '/forgot-password', text.auth.forgotPassword.title],
  [
    'check-email (signup)',
    '/check-email?reason=signup',
    text.auth.checkEmail.title,
  ],
  [
    'check-email (reset)',
    '/check-email?reason=reset',
    text.auth.checkEmail.title,
  ],
  [
    'account-unavailable (suspended)',
    '/account-unavailable?reason=suspended',
    text.auth.accountUnavailable.suspendedTitle,
  ],
  [
    'account-unavailable (deleted)',
    '/account-unavailable?reason=deleted',
    text.auth.accountUnavailable.deletedTitle,
  ],
  // No recovery session: the expired state.
  ['reset-password (expired)', '/reset-password', text.auth.linkExpired.title],
];

for (const [name, path, heading] of pages) {
  test(`${name}: RTL and no serious accessibility violations`, async ({
    page,
  }) => {
    await page.goto(path);
    await page.getByRole('heading', { name: heading }).waitFor();
    await expectAccessibleRtl(page);
  });
}

test('sign-in: keyboard path reaches the submit button in order', async ({
  page,
}) => {
  await page.goto('/sign-in');
  await page.getByLabel(text.auth.fields.email, { exact: true }).focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  // email -> forgot-password link -> password
  await test
    .expect(page.getByLabel(text.auth.fields.password, { exact: true }))
    .toBeFocused();
});
