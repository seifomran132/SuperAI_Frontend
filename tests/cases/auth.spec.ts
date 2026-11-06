import { expect, test, type Page } from '@playwright/test';
import { randomInt } from 'node:crypto';
import { lam7a as brand } from '../../src/brand/lam7a';
import {
  API,
  E2E_PASSWORD,
  GOTRUE,
  SKIP_MESSAGE,
  ADMIN_SKIP_MESSAGE,
  accessToken,
  adminCredentials,
  adminToken,
  createConfirmedUser,
  expectAccessibleRtl,
  fillStable,
  freshEmail,
  myId,
  signIn,
  signedInContext,
  stackReachable,
  text,
  waitForMailLink,
} from '../support';

// MANUAL_TEST_CASES.md §1 (auth), one test per case ID.
// Left manual:
// - AU-44 (two tabs, switch user): cross-tab behaviour; chat.spec covers the same-tab switch.
// - AU-45 (app open over an hour): needs a real token expiry.

const t = text.auth;
const fields = {
  name: (page: Page) => page.getByLabel(t.fields.fullName, { exact: true }),
  email: (page: Page) => page.getByLabel(t.fields.email, { exact: true }),
  password: (page: Page) => page.getByLabel(t.fields.password, { exact: true }),
};

let stackUp = false;
test.beforeAll(async () => {
  stackUp = await stackReachable();
});
test.beforeEach(() => {
  test.skip(!stackUp, SKIP_MESSAGE);
});

/** Creates an account through GoTrue without confirming it. */
async function signUpUnconfirmed(email: string) {
  const res = await fetch(
    `${GOTRUE}/signup?redirect_to=${encodeURIComponent('http://localhost:3001/auth/callback')}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: E2E_PASSWORD,
        data: { full_name: 'مستخدم تجريبي' },
      }),
    },
  );
  expect(res.ok).toBe(true);
}

async function mailCount(email: string): Promise<number> {
  const res = await fetch(
    `http://localhost:8025/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
  );
  return (
    ((await res.json()) as { messages_count?: number }).messages_count ?? 0
  );
}

/** The app strips auth tokens from the address bar once it has read them. */
const noTokensInUrl = (page: Page) =>
  expect(page).not.toHaveURL(/access_token|refresh_token|token_hash|code=/);

test.describe('1.1 sign up', () => {
  test('AU-01 sign-up page: Arabic, RTL, brand, fields, hint, no terms box', async ({
    page,
  }) => {
    await page.goto('/sign-up');
    await expectAccessibleRtl(page);
    await expect(page.getByText(brand.monogram, { exact: true })).toBeVisible();
    await expect(page.getByText(brand.name.ar, { exact: true })).toBeVisible();
    await expect(fields.name(page)).toBeVisible();
    await expect(fields.email(page)).toBeVisible();
    await expect(fields.password(page)).toBeVisible();
    await expect(page.getByText(t.fields.passwordHint)).toBeVisible();
    await expect(page.getByRole('checkbox')).toHaveCount(0);
  });

  test('AU-02 empty submit: every field error, focus on name, nothing sent', async ({
    page,
  }) => {
    const signups: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/signup')) signups.push(req.url());
    });
    await page.goto('/sign-up');
    await page.getByRole('button', { name: t.signUp.submit }).click();
    await expect(page.getByText(t.validation.nameRequired)).toBeVisible();
    await expect(page.getByText(t.validation.emailInvalid)).toBeVisible();
    await expect(
      page.getByText(
        new RegExp(
          `${t.validation.passwordRequired}|${t.validation.passwordTooShort}`,
        ),
      ),
    ).toBeVisible();
    await expect(fields.name(page)).toBeFocused();
    expect(signups).toEqual([]);
  });

  test('AU-03 invalid email and short password', async ({ page }) => {
    await page.goto('/sign-up');
    await fields.name(page).fill('مستخدم');
    await fields.email(page).fill('abc');
    await fields.password(page).fill('1234');
    await page.getByRole('button', { name: t.signUp.submit }).click();
    await expect(page.getByText(t.validation.emailInvalid)).toBeVisible();
    await expect(page.getByText(t.validation.passwordTooShort)).toBeVisible();
  });

  test('AU-04 name over 100 characters', async ({ page }) => {
    await page.goto('/sign-up');
    await fields.name(page).fill('ا'.repeat(101));
    await page.getByRole('button', { name: t.signUp.submit }).click();
    await expect(page.getByText(t.validation.nameTooLong)).toBeVisible();
  });

  test('AU-05 email and password run LTR; the eye button shows and hides', async ({
    page,
  }) => {
    await page.goto('/sign-up');
    await expect(fields.email(page)).toHaveAttribute('dir', 'ltr');
    await expect(fields.password(page)).toHaveAttribute('dir', 'ltr');
    await expect(fields.password(page)).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: text.common.showPassword }).click();
    await expect(fields.password(page)).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: text.common.hidePassword }).click();
    await expect(fields.password(page)).toHaveAttribute('type', 'password');
  });

  test('AU-06 AU-08 AU-10 AU-11 sign up, check-email page, reload, back', async ({
    page,
  }) => {
    const email = freshEmail('e2e-au06');
    let signups = 0;
    page.on('request', (req) => {
      if (req.method() === 'POST' && req.url().includes('/signup')) signups++;
    });
    await page.goto('/sign-up');
    await fields.name(page).fill('مستخدم تجريبي');
    await fields.email(page).fill(email);
    await fields.password(page).fill(E2E_PASSWORD);
    // A double click must still send one sign-up.
    await page.getByRole('button', { name: t.signUp.submit }).dblclick();

    // AU-06
    await expect(page).toHaveURL(/\/check-email\?reason=signup$/);
    expect(page.url()).not.toContain(encodeURIComponent(email));
    expect(page.url()).not.toContain('e2e-au06');
    expect(signups).toBe(1);

    // AU-08: the address, resend waiting on a countdown.
    await expect(page.getByText(email)).toBeVisible();
    const resend = page.getByRole('button', {
      name: new RegExp(t.checkEmail.resendIn.replace('{{seconds}}', '\\d+')),
    });
    await expect(resend).toBeDisabled();

    // AU-10: after a reload the address is gone, and so is resend.
    await page.reload();
    await expect(page.getByText(t.checkEmail.signupSent)).toBeVisible();
    await expect(page.getByText(email)).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: new RegExp(t.checkEmail.resend) }),
    ).toHaveCount(0);

    // AU-11
    await page.getByRole('link', { name: t.backToSignIn }).click();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('AU-07 signing up again with an existing email says it is registered', async ({
    page,
    browser,
  }) => {
    const user = await createConfirmedUser(browser, 'e2e-au07');
    await page.goto('/sign-up');
    await fillStable(fields.name(page), 'مستخدم تجريبي');
    await fields.email(page).fill(user.email);
    await fields.password(page).fill(E2E_PASSWORD);
    await page.getByRole('button', { name: t.signUp.submit }).click();
    await expect(page.getByText(text.authErrors.emailExists)).toBeVisible();
    await expect(fields.email(page)).toHaveAttribute('aria-invalid', 'true');
    await expect(fields.email(page)).toHaveValue(user.email);
    await expect(page).toHaveURL(/\/sign-up$/);
  });

  test('AU-09 resend after the countdown sends a second email', async ({
    page,
  }) => {
    test.slow(); // waits out the real 60 s cooldown (GoTrue limits resends too)
    const email = freshEmail('e2e-au09');
    await page.goto('/sign-up');
    await fields.name(page).fill('مستخدم تجريبي');
    await fields.email(page).fill(email);
    await fields.password(page).fill(E2E_PASSWORD);
    await page.getByRole('button', { name: t.signUp.submit }).click();
    await expect(page).toHaveURL(/\/check-email/);
    await waitForMailLink(email, 'signup');

    const resend = page.getByRole('button', {
      name: t.checkEmail.resend,
      exact: true,
    });
    await expect(resend).toBeEnabled({ timeout: 75_000 });
    await resend.click();
    await expect(page.getByText(t.checkEmail.resent)).toBeVisible();
    await expect(resend).toHaveCount(0); // the countdown restarted
    await expect.poll(() => mailCount(email), { timeout: 30_000 }).toBe(2);
  });
});

test.describe('1.3 email confirmation', () => {
  test('AU-12 AU-14 the link signs in another browser, with no tokens left in the URL', async ({
    browser,
  }) => {
    // Signed up through GoTrue (not this browser): opening the link here is the other device.
    const email = freshEmail('e2e-au12');
    await signUpUnconfirmed(email);
    const link = await waitForMailLink(email, 'signup');
    const context = await browser.newContext({
      locale: 'ar',
      baseURL: 'http://localhost:3001',
    });
    const page = await context.newPage();
    await page.goto(link);
    await expect(page).toHaveURL(/\/chat$/);
    await noTokensInUrl(page);
    expect(await accessToken(page)).toBeTruthy();

    // AU-13: the same link again, signed out (fresh context).
    const again = await browser.newContext({
      locale: 'ar',
      baseURL: 'http://localhost:3001',
    });
    const second = await again.newPage();
    await second.goto(link);
    await expect(
      second.getByRole('heading', { name: t.linkExpired.title }),
    ).toBeVisible();
    await expect(
      second.getByRole('link', { name: t.linkExpired.newLink }),
    ).toBeVisible();
    await expect(second.getByText(t.linkExpired.signupHint)).toBeVisible();
    await context.close();
    await again.close();
  });
});

test.describe('1.4 sign in', () => {
  test('AU-15 AU-16 AU-19 wrong password and unknown email get one generic error; right password signs in', async ({
    page,
    browser,
  }) => {
    const user = await createConfirmedUser(browser, 'e2e-au15');
    await page.goto('/sign-in');

    // AU-15
    await fields.email(page).fill(user.email);
    await fields.password(page).fill('wrong-password-1');
    await page.getByRole('button', { name: t.signIn.submit }).click();
    await expect(
      page.getByText(text.authErrors.invalidCredentials),
    ).toBeVisible();
    await expect(fields.email(page)).toHaveValue(user.email);
    await expect(fields.password(page)).toHaveValue('wrong-password-1');

    // AU-16
    await fillStable(fields.email(page), freshEmail('e2e-nobody'));
    await page.getByRole('button', { name: t.signIn.submit }).click();
    await expect(
      page.getByText(text.authErrors.invalidCredentials),
    ).toBeVisible();

    // AU-19
    await fields.email(page).fill(user.email);
    await fields.password(page).fill(user.password);
    await page.getByRole('button', { name: t.signIn.submit }).click();
    await expect(page).toHaveURL(/\/chat$/);
  });

  test('AU-17 unconfirmed account: notice and resend button', async ({
    page,
  }) => {
    const email = freshEmail('e2e-au17');
    await signUpUnconfirmed(email);
    await page.goto('/sign-in');
    await fields.email(page).fill(email);
    await fields.password(page).fill(E2E_PASSWORD);
    await page.getByRole('button', { name: t.signIn.submit }).click();
    await expect(
      page.getByText(text.authErrors.emailNotConfirmed),
    ).toBeVisible();
    const resend = page.getByRole('button', {
      name: t.signIn.resendConfirmation,
    });
    await expect(resend).toBeVisible();
    await resend.click();
    // The resend is accepted (no error); GoTrue may hold the email itself for 60 s.
    await expect(
      page.getByRole('alert').filter({ hasText: text.common.networkError }),
    ).toHaveCount(0);
  });

  test('AU-18 many wrong passwords hit the rate limit', async ({
    page,
    request,
  }) => {
    // GoTrue limits per client IP from X-Real-IP (GOTRUE_RATE_LIMIT_HEADER; Caddy
    // sets it in production). Browsers don't send it locally, so this test gives
    // itself its own address and the rest of the suite stays unlimited.
    const ip = `10.${randomInt(256)}.${randomInt(256)}.${1 + randomInt(254)}`;
    const email = freshEmail('e2e-au18');
    await page.route(/:9999\/token/, (route) =>
      route.continue({
        headers: { ...route.request().headers(), 'x-real-ip': ip },
      }),
    );
    await page.goto('/sign-in');
    await fillStable(fields.email(page), email);
    await fields.password(page).fill('wrong-password-1');
    // Use up the burst (30, refilling about one every 2 s) directly until GoTrue
    // refuses, then send the next attempt from the page straight away.
    let limited = false;
    for (let i = 0; i < 60 && !limited; i++) {
      const res = await request.post(`${GOTRUE}/token?grant_type=password`, {
        headers: { 'x-real-ip': ip },
        data: { email, password: 'wrong-password-1' },
      });
      limited = res.status() === 429;
    }
    expect(limited, 'GoTrue sign-in rate limit is configured').toBe(true);
    await page.getByRole('button', { name: t.signIn.submit }).click();
    await expect(page.getByText(text.authErrors.rateLimited)).toBeVisible();
    await expect(fields.email(page)).toHaveValue(email);
    await expect(fields.password(page)).toHaveValue('wrong-password-1');
  });

  test('AU-20 a protected path is kept through sign-in', async ({
    page,
    browser,
  }) => {
    const user = await createConfirmedUser(browser, 'e2e-au20');
    await page.goto('/account');
    await expect(page).toHaveURL(/\/sign-in\?redirect=/);
    await fields.email(page).fill(user.email);
    await fields.password(page).fill(user.password);
    await page.getByRole('button', { name: t.signIn.submit }).click();
    await expect(page).toHaveURL(/\/account$/);
  });

  for (const target of ['https://example.com', '//example.com']) {
    test(`AU-21 external redirect ${target} is ignored`, async ({
      page,
      browser,
    }) => {
      const user = await createConfirmedUser(browser, 'e2e-au21');
      await page.goto(`/sign-in?redirect=${encodeURIComponent(target)}`);
      await fields.email(page).fill(user.email);
      await fields.password(page).fill(user.password);
      await page.getByRole('button', { name: t.signIn.submit }).click();
      await expect(page).toHaveURL(/localhost:3001\/chat$/);
    });
  }

  test('AU-22 signed in, guest pages redirect to /chat', async ({
    browser,
  }) => {
    const user = await createConfirmedUser(browser, 'e2e-au22');
    const context = await signedInContext(browser, user.email, user.password);
    const page = await context.newPage();
    for (const path of ['/sign-in', '/sign-up', '/forgot-password']) {
      // The guard redirects while the page is still loading: Firefox and WebKit
      // report the interrupted navigation as an error, so only wait for the commit.
      await page.goto(path, { waitUntil: 'commit' }).catch(() => undefined);
      await expect(page).toHaveURL(/\/chat$/);
      await page.waitForLoadState('load');
    }
    await context.close();
  });

  test('AU-23 offline submit shows the network error; back online, retry works', async ({
    page,
    context,
    browser,
  }) => {
    const user = await createConfirmedUser(browser, 'e2e-au23');
    await page.goto('/sign-in');
    await fields.email(page).fill(user.email);
    await fields.password(page).fill(user.password);
    await context.setOffline(true);
    await page.getByRole('button', { name: t.signIn.submit }).click();
    await expect(page.getByText(text.common.networkError)).toBeVisible();
    await context.setOffline(false);
    const retry = page.getByRole('button', { name: text.common.retry });
    if (await retry.isVisible()) await retry.click();
    else await page.getByRole('button', { name: t.signIn.submit }).click();
    await expect(page).toHaveURL(/\/chat$/);
  });
});

test.describe('1.5 forgot and reset password', () => {
  test('AU-24 invalid email', async ({ page }) => {
    await page.goto('/forgot-password');
    await fields.email(page).fill('abc');
    await page.getByRole('button', { name: t.forgotPassword.submit }).click();
    await expect(page.getByText(t.validation.emailInvalid)).toBeVisible();
  });

  test('AU-26 an email with no account gets the same reset page', async ({
    page,
  }) => {
    await page.goto('/forgot-password');
    await fillStable(fields.email(page), freshEmail('e2e-nobody'));
    await page.getByRole('button', { name: t.forgotPassword.submit }).click();
    await expect(page).toHaveURL(/\/check-email\?reason=reset$/);
    await expect(page.getByText(t.checkEmail.resetSentTo)).toBeVisible();
  });

  test.describe.serial('reset flow', () => {
    let email = '';
    let link = '';
    const newPassword = 'e2e-password-2';

    test('AU-25 AU-27 to AU-32 reset request, link, validation, save, reuse', async ({
      page,
      browser,
    }) => {
      ({ email } = await createConfirmedUser(browser, 'e2e-au25'));
      await page.goto('/forgot-password');
      await fields.email(page).fill(email);
      await page.getByRole('button', { name: t.forgotPassword.submit }).click();
      await expect(page).toHaveURL(/\/check-email\?reason=reset$/);
      await expect(page.getByText(t.checkEmail.resetNext)).toBeVisible();

      link = await waitForMailLink(email, 'recovery');
      await page.goto(link);
      await expect(page).toHaveURL(/\/reset-password/);
      await noTokensInUrl(page);
      await expect(
        page.getByLabel(t.fields.newPassword, { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByLabel(t.fields.confirmPassword, { exact: true }),
      ).toBeVisible();

      // The link is single-use, so the form cases run on this page.
      const next = page.getByLabel(t.fields.newPassword, { exact: true });
      const confirm = page.getByLabel(t.fields.confirmPassword, {
        exact: true,
      });
      const save = page.getByRole('button', { name: t.resetPassword.submit });

      // AU-28
      await next.fill(newPassword);
      await confirm.fill('something-else-1');
      await save.click();
      await expect(page.getByText(t.validation.passwordMismatch)).toBeVisible();

      // AU-29
      await next.fill('1234');
      await confirm.fill('1234');
      await save.click();
      await expect(page.getByText(t.validation.passwordTooShort)).toBeVisible();

      // AU-30
      await next.fill(E2E_PASSWORD);
      await confirm.fill(E2E_PASSWORD);
      await save.click();
      await expect(page.getByText(text.authErrors.samePassword)).toBeVisible();

      // AU-31
      await next.fill(newPassword);
      await confirm.fill(newPassword);
      await save.click();
      await expect(page.getByText(t.resetPassword.saved)).toBeVisible();
      await expect(page).toHaveURL(/\/chat$/);

      // AU-32: the link is spent.
      const fresh = await page.context().browser()!.newContext({
        locale: 'ar',
        baseURL: 'http://localhost:3001',
      });
      const reuse = await fresh.newPage();
      await reuse.goto(link);
      await expect(
        reuse.getByRole('heading', { name: t.linkExpired.title }),
      ).toBeVisible();
      await reuse.getByRole('link', { name: t.linkExpired.newLink }).click();
      await expect(reuse).toHaveURL(/\/forgot-password/);
      await fresh.close();
    });

    test('AU-31 only the new password signs in', async ({ page }) => {
      test.skip(!email, 'AU-25 did not create the user');
      await page.goto('/sign-in');
      await fields.email(page).fill(email);
      await fields.password(page).fill(E2E_PASSWORD);
      await page.getByRole('button', { name: t.signIn.submit }).click();
      await expect(
        page.getByText(text.authErrors.invalidCredentials),
      ).toBeVisible();
      await signIn(page, email, newPassword);
    });
  });

  test('AU-33 signed in, /reset-password?type=recovery shows the expired state', async ({
    browser,
  }) => {
    const user = await createConfirmedUser(browser, 'e2e-au33');
    const context = await signedInContext(browser, user.email, user.password);
    const page = await context.newPage();
    await page.goto('/reset-password?type=recovery');
    await expect(
      page.getByRole('heading', { name: t.linkExpired.title }),
    ).toBeVisible();
    await expect(
      page.getByLabel(t.fields.newPassword, { exact: true }),
    ).toHaveCount(0);
    await context.close();
  });
});

test.describe('1.7 suspended account', () => {
  test.beforeEach(() => {
    test.skip(!adminCredentials(), ADMIN_SKIP_MESSAGE);
  });

  async function setStatus(userId: string, status: 'active' | 'suspended') {
    const res = await fetch(`${API}/api/v1/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await adminToken()}`,
      },
      body: JSON.stringify({ status, reason: 'e2e AU-40' }),
    });
    expect(res.status).toBeLessThan(300);
  }

  test('AU-40 AU-43 suspended: account-unavailable and signed out; reactivated: signs in', async ({
    browser,
  }) => {
    const user = await createConfirmedUser(browser, 'e2e-au40');
    const context = await signedInContext(browser, user.email, user.password);
    const page = await context.newPage();
    await page.goto('/chat');
    await expect(page).toHaveURL(/\/chat$/);
    const userId = await myId(await accessToken(page));

    // AU-40
    await setStatus(userId, 'suspended');
    // The app redirects while the reload is still loading; Firefox aborts that navigation.
    await page.evaluate(() => location.reload());
    await expect(page).toHaveURL(/\/account-unavailable\?reason=suspended/);
    await expect(
      page.getByText(text.auth.accountUnavailable.suspendedTitle),
    ).toBeVisible();
    expect(
      await page.evaluate(() => localStorage.getItem('bayan.auth')),
    ).toBeNull();
    await context.close();

    // AU-43
    await setStatus(userId, 'active');
    const again = await browser.newContext({
      locale: 'ar',
      baseURL: 'http://localhost:3001',
    });
    const page2 = await again.newPage();
    await signIn(page2, user.email, user.password);
    await expect(page2).toHaveURL(/\/chat$/);
    await again.close();
  });
});
