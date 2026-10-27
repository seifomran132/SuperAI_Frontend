import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import ar from '~/i18n/ar.json';
import { authMock, callsTo, firstCallBody } from '~/mocks/auth';
import { resetChatMock } from '~/mocks/chat';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';
import { button, fill, t } from '~/test/helpers';

useAuthMocks();
beforeEach(async () => {
  resetChatMock();
  await signInDirectly();
});

async function open() {
  await renderApp('/account');
  await screen.findByDisplayValue('سارة');
}

describe('account page: profile', () => {
  it('saves the name, sends an empty phone as null and confirms', async () => {
    await open();
    fill(t.auth.fields.fullName, 'سارة أحمد');
    fireEvent.click(button(ar.account.profile.save));
    expect(
      await screen.findByText(ar.account.profile.saved),
    ).toBeInTheDocument();
    expect(firstCallBody('updateMe')).toEqual({
      fullName: 'سارة أحمد',
      phoneNumber: null,
    });
  });

  it('requires a name without calling the API', async () => {
    await open();
    fill(t.auth.fields.fullName, '   ');
    fireEvent.click(button(ar.account.profile.save));
    expect(
      await screen.findByText(t.auth.validation.nameRequired),
    ).toBeInTheDocument();
    expect(callsTo('updateMe')).toHaveLength(0);
  });

  it('puts the server field error on the phone and keeps what was typed', async () => {
    authMock.updateMe = {
      status: 400,
      code: 'VALIDATION_FAILED',
      details: [{ field: 'phoneNumber', message: 'invalid' }],
    };
    await open();
    fill(t.auth.fields.phone, '123');
    fireEvent.click(button(ar.account.profile.save));
    expect(
      await screen.findByText(t.auth.validation.phoneInvalid),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(t.auth.fields.phone)).toHaveValue('123');
  });

  it('shows the email read-only', async () => {
    await open();
    expect(screen.getByLabelText(t.auth.fields.email)).toHaveAttribute(
      'readonly',
    );
  });
});

describe('account page: change password', () => {
  const submit = () => fireEvent.click(button(ar.account.password.save));

  it('rejects mismatched passwords', async () => {
    await open();
    fill(t.auth.fields.newPassword, 'password123');
    fill(t.auth.fields.confirmPassword, 'password124');
    submit();
    expect(
      await screen.findByText(t.auth.validation.passwordMismatch),
    ).toBeInTheDocument();
    expect(callsTo('updateUser')).toHaveLength(0);
  });

  it('changes the password and clears the fields', async () => {
    await open();
    fill(t.auth.fields.newPassword, 'password123');
    fill(t.auth.fields.confirmPassword, 'password123');
    submit();
    expect(
      await screen.findByText(ar.account.password.saved),
    ).toBeInTheDocument();
    expect(firstCallBody('updateUser')).toMatchObject({
      password: 'password123',
    });
    await waitFor(() =>
      expect(screen.getByLabelText(t.auth.fields.newPassword)).toHaveValue(''),
    );
  });

  it('maps the same-password error onto the field', async () => {
    authMock.updateUser = 'same_password';
    await open();
    fill(t.auth.fields.newPassword, 'password123');
    fill(t.auth.fields.confirmPassword, 'password123');
    submit();
    expect(
      await screen.findByText(t.authErrors.samePassword),
    ).toBeInTheDocument();
  });
});
