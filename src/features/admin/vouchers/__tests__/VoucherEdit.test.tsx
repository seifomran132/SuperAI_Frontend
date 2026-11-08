import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ar from '~/test/ar';
import { adminCalls } from '~/mocks/admin';
import { vouchersMock, voucher } from '~/mocks/admin-vouchers';
import { renderApp } from '~/test/render-app';
import { reasonField, type, useVoucherSession, v } from './harness';

useVoucherSession();

const save = ar.admin.catalog.save;

describe('VoucherEdit', () => {
  it('keeps save off until something changes, then sends only the changes with a reason', async () => {
    vouchersMock.vouchers = [
      voucher('v1', { endsAt: '2099-01-01T00:00:00.000Z', note: 'قديمة' }),
    ];
    await renderApp('/admin/vouchers/v1');
    await screen.findByRole('heading', { name: 'CODE-V1' });
    expect(screen.getByRole('button', { name: save })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: v.removeEnd }));
    type(v.maxRedemptions, '200');
    fireEvent.click(screen.getByRole('button', { name: save }));

    // The dialog lists what changes and asks for the reason.
    expect(await screen.findByText(v.changeEndRemoved)).toBeInTheDocument();
    expect(
      screen.getAllByRole('listitem').map((li) => li.textContent),
    ).toContain(v.changeLimit);
    fireEvent.click(screen.getAllByRole('button', { name: save }).at(-1)!);
    expect(
      await screen.findByText(ar.admin.dialog.reasonRequired),
    ).toBeInTheDocument();
    expect(adminCalls('voucher:update')).toHaveLength(0);

    fireEvent.change(reasonField(), { target: { value: 'تغيير الحد' } });
    fireEvent.click(screen.getAllByRole('button', { name: save }).at(-1)!);
    await waitFor(() => expect(adminCalls('voucher:update')).toHaveLength(1));
    expect(adminCalls('voucher:update')[0]?.body).toEqual({
      reason: 'تغيير الحد',
      endsAt: null,
      maxRedemptions: 200,
    });
  });
});
