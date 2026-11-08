import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ar from '~/test/ar';
import { adminCalls, adminMock } from '~/mocks/admin';
import { renderApp } from '~/test/render-app';
import { reasonField, useVoucherSession, v } from './harness';

useVoucherSession();

describe('VoucherDeactivate', () => {
  it('stops the code with a reason, keeps the dialog on an error, then shows the stopped state', async () => {
    await renderApp('/admin/vouchers/v1');
    await screen.findByRole('heading', { name: 'CODE-V1' });
    // Decision 17: no active toggle in the form.
    expect(screen.queryByRole('switch')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: v.deactivate }));
    expect(await screen.findByText(v.deactivateBody)).toBeInTheDocument();

    adminMock.fail = { status: 500, code: 'INTERNAL_ERROR' };
    fireEvent.change(reasonField(), { target: { value: 'إيقاف مؤقت' } });
    fireEvent.click(
      screen.getAllByRole('button', { name: v.deactivate }).at(-1)!,
    );
    expect(await screen.findByText(ar.admin.dialog.failed)).toBeInTheDocument();

    adminMock.fail = null;
    fireEvent.click(
      screen.getAllByRole('button', { name: v.deactivate }).at(-1)!,
    );
    await waitFor(() => expect(adminCalls('voucher:update')).toHaveLength(2));
    expect(adminCalls('voucher:update')[1]?.body).toEqual({
      reason: 'إيقاف مؤقت',
      isActive: false,
    });
    expect(await screen.findByText(v.inactiveBanner)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: v.activate }),
    ).toBeInTheDocument();
  });
});
