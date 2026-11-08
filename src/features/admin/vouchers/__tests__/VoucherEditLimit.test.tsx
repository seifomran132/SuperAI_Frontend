import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ar from '~/test/ar';
import { adminCalls } from '~/mocks/admin';
import { vouchersMock, voucher } from '~/mocks/admin-vouchers';
import { renderApp } from '~/test/render-app';
import { type, useVoucherSession, v } from './harness';

useVoucherSession();

describe('VoucherEdit limit', () => {
  it('refuses a limit below the redemptions made, before any request', async () => {
    vouchersMock.vouchers = [voucher('v1', { redemptionCount: 12 })];
    await renderApp('/admin/vouchers/v1');
    await screen.findByRole('heading', { name: 'CODE-V1' });
    type(v.maxRedemptions, '11');
    fireEvent.click(
      screen.getByRole('button', { name: ar.admin.catalog.save }),
    );
    expect(
      await screen.findByText(
        'لا يمكن أن يكون الحد أقل من عدد الاستخدامات الحالية (12).',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/^السبب/)).toBeNull();
    expect(adminCalls('voucher:update')).toHaveLength(0);

    // Typing again clears the error.
    type(v.maxRedemptions, '12');
    expect(screen.queryByText(/لا يمكن أن يكون الحد أقل/)).toBeNull();
  });
});
