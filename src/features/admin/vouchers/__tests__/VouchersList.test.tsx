import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import ar from '~/test/ar';
import { adminCalls } from '~/mocks/admin';
import { vouchersMock, voucher } from '~/mocks/admin-vouchers';
import { server } from '~/mocks/server';
import { renderApp } from '~/test/render-app';
import { useVoucherSession, v } from './harness';

useVoucherSession();

const LIST = 'http://localhost:3000/api/v1/admin/vouchers';
const future = '2099-01-01T00:00:00.000Z';
const past = '2020-01-01T00:00:00.000Z';

describe('VouchersList', () => {
  it('shows the five derived statuses, kinds and values', async () => {
    vouchersMock.vouchers = [
      voucher('a1'),
      voucher('a2', { startsAt: future }),
      voucher('a3', { endsAt: past }),
      voucher('a4', { maxRedemptions: 3, redemptionCount: 3 }),
      voucher('a5', { isActive: false }),
      voucher('a6', {
        kind: 'trial',
        amountUsd: null,
        trialDays: 2,
        plan: { key: 'pro', nameAr: 'احترافي', nameEn: 'Pro' },
      }),
    ];
    await renderApp('/admin/vouchers');
    const table = await screen.findByRole('table', { name: v.tableLabel });
    for (const label of Object.values(v.status)) {
      expect(within(table).getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(within(table).getByText('احترافي · يومان')).toBeInTheDocument();
    expect(within(table).getAllByText('5.00$').length).toBeGreaterThan(0);
    expect(within(table).getAllByText('3 / 100').length).toBeGreaterThan(0);
    expect(
      within(table).getByRole('link', { name: 'CODE-A1' }),
    ).toHaveAttribute('href', '/admin/vouchers/a1');
  });

  it('sends the filter as status and pages with the cursor', async () => {
    vouchersMock.vouchers = Array.from({ length: 25 }, (_, i) =>
      voucher(`p${i}`, { isActive: i % 2 === 0 }),
    );
    await renderApp('/admin/vouchers');
    await screen.findByRole('table', { name: v.tableLabel });
    fireEvent.click(screen.getByRole('button', { name: v.loadMore }));
    await waitFor(() => expect(adminCalls('voucher:list')).toHaveLength(2));
    expect(adminCalls('voucher:list')[1]?.query?.cursor).toBe('20');
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: v.loadMore })).toBeNull(),
    );

    fireEvent.change(screen.getByLabelText(v.filter.label), {
      target: { value: 'inactive' },
    });
    await waitFor(() =>
      expect(adminCalls('voucher:list').at(-1)?.query?.status).toBe('inactive'),
    );
  });

  it('shows the empty state, then the filtered-empty state with «عرض الكل»', async () => {
    vouchersMock.vouchers = [];
    await renderApp('/admin/vouchers');
    expect(await screen.findByText(v.emptyTitle)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: v.showAll })).toBeNull();
  });

  it('shows the filtered-empty state', async () => {
    vouchersMock.vouchers = [voucher('only')];
    await renderApp('/admin/vouchers?status=inactive');
    expect(
      await screen.findByText(v.emptyFiltered.inactive),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: v.showAll }));
    expect(
      await screen.findByRole('table', { name: v.tableLabel }),
    ).toBeInTheDocument();
  });

  it('shows a loading state, then the error with retry', async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    server.use(
      http.get(
        LIST,
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
    await renderApp('/admin/vouchers');
    expect(await screen.findByRole('status')).toHaveTextContent(
      ar.admin.common.loading,
    );
    release();
    expect(await screen.findByText(v.error)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: ar.common.retry }));
    expect(
      await screen.findByRole('table', { name: v.tableLabel }),
    ).toBeInTheDocument();
  });
});
