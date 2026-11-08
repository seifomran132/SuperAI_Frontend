import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ar from '~/test/ar';
import { vouchersMock, voucher } from '~/mocks/admin-vouchers';
import { renderApp } from '~/test/render-app';
import { type, useVoucherSession, v } from './harness';

useVoucherSession();

describe('VoucherEdit expired code', () => {
  it('lets the limit change while the untouched end is already past', async () => {
    vouchersMock.vouchers = [
      voucher('v1', { endsAt: '2020-01-01T10:00:00.000Z', startsAt: null }),
    ];
    await renderApp('/admin/vouchers/v1');
    await screen.findByRole('heading', { name: 'CODE-V1' });
    type(v.maxRedemptions, '200');
    fireEvent.click(
      screen.getByRole('button', { name: ar.admin.catalog.save }),
    );
    expect(await screen.findByLabelText(/^السبب/)).toBeInTheDocument();
    expect(screen.queryByText(v.errors.endBeforeStart)).toBeNull();
    expect(screen.queryByText(v.errors.endInPast)).toBeNull();
  });
});
