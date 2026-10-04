import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ar from '~/i18n/errors.ar.json';
import { authMock, callsTo, defaultProfile, firstCallBody } from '~/mocks/auth';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';
import { button, fill, t } from '~/test/helpers';

useAuthMocks();

async function open() {
  await signInDirectly();
  authMock.me = { kind: 'ok', profile: { ...defaultProfile, fullName: null } };
  const app = await renderApp('/complete-profile');
  await screen.findByRole('heading', { name: t.auth.completeProfile.title });
  return app;
}

const submit = () => fireEvent.click(button(t.auth.completeProfile.submit));

describe('complete-profile page', () => {
  it('requires the name', async () => {
    await open();
    submit();
    expect(
      await screen.findByText(t.auth.validation.nameRequired),
    ).toBeInTheDocument();
    expect(callsTo('updateMe')).toHaveLength(0);
  });

  it('marks the phone as optional and sends null when it is empty', async () => {
    const { here } = await open();
    expect(screen.getByText(t.auth.fields.optional)).toBeInTheDocument();
    fill(t.auth.fields.fullName, '  سارة أحمد  ');
    submit();
    await waitFor(() => expect(here()).toBe('/chat'));
    expect(firstCallBody('updateMe')).toEqual({
      fullName: 'سارة أحمد',
      phoneNumber: null,
    });
  });

  it('sends the phone when given', async () => {
    const { here } = await open();
    fill(t.auth.fields.fullName, 'سارة');
    fill(t.auth.fields.phone, '+966501234567');
    submit();
    await waitFor(() => expect(here()).toBe('/chat'));
    expect(firstCallBody('updateMe')).toEqual({
      fullName: 'سارة',
      phoneNumber: '+966501234567',
    });
  });

  it('maps VALIDATION_FAILED details onto the phone field and keeps the input', async () => {
    authMock.updateMe = {
      status: 400,
      code: 'VALIDATION_FAILED',
      details: [{ field: 'phoneNumber', message: 'must be a valid phone' }],
    };
    const { here } = await open();
    fill(t.auth.fields.fullName, 'سارة');
    fill(t.auth.fields.phone, '12');
    submit();
    expect(
      await screen.findByText(t.auth.validation.phoneInvalid),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(t.auth.fields.phone)).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByLabelText(t.auth.fields.phone)).toHaveValue('12');
    expect(screen.getByLabelText(t.auth.fields.fullName)).toHaveValue('سارة');
    expect(here()).toBe('/complete-profile');
  });

  it('maps VALIDATION_FAILED details onto the name field', async () => {
    authMock.updateMe = {
      status: 400,
      code: 'VALIDATION_FAILED',
      details: [{ field: 'fullName', message: 'too long' }],
    };
    await open();
    fill(t.auth.fields.fullName, 'سارة');
    submit();
    expect(
      await screen.findByText(t.auth.validation.nameRequired),
    ).toBeInTheDocument();
  });

  it('shows the catalog message for other API errors and keeps the draft', async () => {
    authMock.updateMe = { status: 400, code: 'VALIDATION_FAILED' };
    await open();
    fill(t.auth.fields.fullName, 'سارة');
    submit();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      ar.VALIDATION_FAILED,
    );
    expect(screen.getByLabelText(t.auth.fields.fullName)).toHaveValue('سارة');
  });

  it('sends a suspended account to /account-unavailable', async () => {
    authMock.updateMe = { status: 403, code: 'ACCOUNT_SUSPENDED' };
    const { here } = await open();
    fill(t.auth.fields.fullName, 'سارة');
    submit();
    await waitFor(() =>
      expect(here()).toBe('/account-unavailable?reason=suspended'),
    );
  });
});
