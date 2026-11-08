import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import ar from '~/test/ar';
import errors from '~/i18n/errors.ar.json';
import { adminCalls } from '~/mocks/admin';
import { redemption, vouchersMock, voucher } from '~/mocks/admin-vouchers';
import { server } from '~/mocks/server';
import { renderApp } from '~/test/render-app';
import { useVoucherSession, v } from './harness';

useVoucherSession();

describe('VoucherDetail', () => {
  it('shows the summary, a used-up banner and the redemptions with user links and paging', async () => {
    vouchersMock.vouchers = [
      voucher('v1', {
        kind: 'trial',
        amountUsd: null,
        trialDays: 11,
        plan: { key: 'pro', nameAr: 'احترافي', nameEn: 'Pro' },
        maxRedemptions: 25,
        redemptionCount: 25,
      }),
    ];
    vouchersMock.redemptions.v1 = Array.from({ length: 25 }, (_, i) =>
      redemption(`r${i}`, {
        userEmail: i === 0 ? null : `r${i}@example.com`,
        userId: `0000000${i}-0000-4000-8000-000000000000`.slice(0, 36),
        subscriptionId: 'abcdef12-0000-4000-8000-000000000000',
      }),
    );
    await renderApp('/admin/vouchers/v1');
    expect(
      await screen.findByText(
        'تم استخدام الكود بالكامل (25 / 25). ارفع الحد الأقصى من الإعدادات إن أردت السماح بمزيد من الاستخدام.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('احترافي · 11 يومًا')).toBeInTheDocument();

    const table = await screen.findByRole('table', { name: v.redemptions });
    expect(
      within(table).getByRole('link', { name: 'r1@example.com' }),
    ).toHaveAttribute(
      'href',
      '/admin/users/00000001-0000-4000-8000-000000000000',
    );
    // A missing email falls back to the short user id.
    expect(within(table).getByText('00000000')).toBeInTheDocument();
    // The endpoint ignores `status`: it is never sent.
    expect(adminCalls('voucher:redemptions')[0]?.query).not.toHaveProperty(
      'status',
    );

    fireEvent.click(screen.getByRole('button', { name: v.loadMore }));
    await waitFor(() =>
      expect(adminCalls('voucher:redemptions')).toHaveLength(2),
    );
    expect(adminCalls('voucher:redemptions')[1]?.query?.cursor).toBe('20');
    expect(
      await within(table).findByRole('link', { name: 'r24@example.com' }),
    ).toBeInTheDocument();
  });

  it('shows the empty redemptions note', async () => {
    await renderApp('/admin/vouchers/v1');
    expect(await screen.findByText(v.redemptionsEmpty)).toBeInTheDocument();
  });

  it('shows the not-found card by code', async () => {
    await renderApp('/admin/vouchers/missing');
    expect(await screen.findByText(v.notFoundTitle)).toBeInTheDocument();
    expect(screen.getByText(errors.VOUCHER_NOT_FOUND)).toBeInTheDocument();
  });

  it('shows a loading state, then the error with retry', async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    server.use(
      http.get(
        'http://localhost:3000/api/v1/admin/vouchers/v1',
        async () => {
          await gate;
          return HttpResponse.json(
            { statusCode: 500, code: 'INTERNAL_ERROR', message: 'dev' },
            { status: 500 },
          );
        },
        { once: true },
      ),
    );
    await renderApp('/admin/vouchers/v1');
    expect(await screen.findByRole('status')).toHaveTextContent(
      ar.admin.common.loading,
    );
    release();
    expect(await screen.findByText(v.detailError)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: ar.common.retry }));
    expect(
      await screen.findByRole('heading', { name: 'CODE-V1' }),
    ).toBeInTheDocument();
  });
});
