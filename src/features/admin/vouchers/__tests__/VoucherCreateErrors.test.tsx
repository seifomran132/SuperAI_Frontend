import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import errors from '~/i18n/errors.ar.json';
import { adminMock } from '~/mocks/admin';
import { renderApp } from '~/test/render-app';
import { click, reasonField, type, useVoucherSession, v } from './harness';

useVoucherSession();

async function fillTrial() {
  await renderApp('/admin/vouchers/new');
  fireEvent.click(
    await screen.findByRole('radio', { name: new RegExp(v.kind.trial) }),
  );
  fireEvent.change(await screen.findByLabelText(new RegExp(`^${v.plan}`)), {
    target: { value: 'basic' },
  });
  type(v.trialDays, '7');
  type(v.maxRedemptions, '2');
  fireEvent.change(reasonField(), { target: { value: 'تجربة' } });
}

describe('VoucherCreate errors', () => {
  it.each(['PLAN_NOT_ACTIVE', 'PLAN_NOT_FOUND'] as const)(
    'puts %s under the plan field',
    async (code) => {
      adminMock.fail = { status: code === 'PLAN_NOT_FOUND' ? 404 : 409, code };
      await fillTrial();
      click(v.createSubmit);
      expect(await screen.findByText(errors[code])).toBeInTheDocument();
      expect(screen.getByLabelText(new RegExp(`^${v.plan}`))).toHaveAttribute(
        'aria-invalid',
        'true',
      );
      expect(screen.getByLabelText(new RegExp(`^${v.plan}`))).toHaveValue(
        'basic',
      );
    },
  );

  it('marks fields named in VALIDATION_FAILED details', async () => {
    adminMock.fail = {
      status: 400,
      code: 'VALIDATION_FAILED',
      details: [{ field: 'trialDays', errors: ['too big'] }],
    };
    await fillTrial();
    click(v.createSubmit);
    expect(
      await screen.findByLabelText(new RegExp(`^${v.trialDays}`)),
    ).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows other errors by code in the form and keeps the input', async () => {
    adminMock.fail = { status: 403, code: 'FORBIDDEN' };
    await fillTrial();
    click(v.createSubmit);
    expect(await screen.findByText(errors.FORBIDDEN)).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(`^${v.trialDays}`))).toHaveValue(
      '7',
    );
  });
});
