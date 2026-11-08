import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { adminCalls } from '~/mocks/admin';
import { vouchersMock, voucher } from '~/mocks/admin-vouchers';
import { renderApp } from '~/test/render-app';
import { reasonField, useVoucherSession, v } from './harness';

useVoucherSession();

describe('VoucherActivate', () => {
  it('enables a stopped code with a reason', async () => {
    vouchersMock.vouchers = [voucher('v1', { isActive: false })];
    await renderApp('/admin/vouchers/v1');
    expect(await screen.findByText(v.inactiveBanner)).toBeInTheDocument();
    expect(screen.getAllByText(v.status.inactive).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: v.activate }));
    await screen.findByText(v.activateBody);
    fireEvent.change(reasonField(), { target: { value: 'عاد للعمل' } });
    fireEvent.click(
      screen.getAllByRole('button', { name: v.activate }).at(-1)!,
    );
    await waitFor(() => expect(adminCalls('voucher:update')).toHaveLength(1));
    expect(adminCalls('voucher:update')[0]?.body).toEqual({
      reason: 'عاد للعمل',
      isActive: true,
    });
    await waitFor(() =>
      expect(screen.queryByText(v.inactiveBanner)).toBeNull(),
    );
  });
});
