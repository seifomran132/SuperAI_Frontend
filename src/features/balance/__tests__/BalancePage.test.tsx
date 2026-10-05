import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ActivityEntryDto } from '~/api/generated/types.gen';
import ar from '~/i18n/ar.json';
import { chatMock, resetChatMock } from '~/mocks/chat';
import { server } from '~/mocks/server';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';

useAuthMocks();
beforeEach(async () => {
  resetChatMock();
  await signInDirectly();
});

const types = ar.balance.activity.types;
const entry = (
  type: ActivityEntryDto['type'],
  amountUsd: string,
  id: string,
): ActivityEntryDto => ({
  id,
  type,
  amountUsd,
  balanceAfterUsd: '14.480000000',
  createdAt: '2026-01-02T10:30:00.000Z',
});

function activityReturns(items: ActivityEntryDto[]) {
  server.use(
    http.get('http://localhost:3000/api/v1/me/balance/activity', () =>
      HttpResponse.json({ items, nextBefore: null }),
    ),
  );
}

describe('balance page', () => {
  it('labels every entry type and signs the amounts', async () => {
    activityReturns([
      entry('subscription_credit', '10.000000000', '1'),
      entry('purchase', '5.000000000', '2'),
      entry('usage_charge', '-0.150000000', '3'),
      entry('voucher_credit', '2.000000000', '4'),
      entry('refund', '0.500000000', '5'),
      entry('adjustment', '-1.000000000', '6'),
      entry('expiry', '-3.000000000', '7'),
    ]);
    await renderApp('/balance');
    const rows = await screen.findAllByRole('listitem');
    const row = (label: string) =>
      rows.find((r) => within(r).queryByText(label))!;

    expect(row(types.subscription_credit)).toHaveTextContent('+10.00$');
    expect(row(types.purchase)).toHaveTextContent('+5.00$');
    expect(row(types.usage_charge)).toHaveTextContent('−0.15$');
    expect(row(types.voucher_credit)).toHaveTextContent('+2.00$');
    expect(row(types.refund)).toHaveTextContent('+0.50$');
    expect(row(types.adjustment)).toHaveTextContent('−1.00$');
    expect(row(types.expiry)).toHaveTextContent('−3.00$');
    // The minus is inside the amount's <bdi>, so it never detaches in RTL text.
    expect(
      within(row(types.usage_charge)).getAllByText(/^−0\.15\$$/),
    ).toHaveLength(1);
  });

  it('shows the balance and the empty state', async () => {
    activityReturns([]);
    await renderApp('/balance');
    expect(
      await screen.findByText(ar.balance.activity.emptyTitle),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: ar.balance.available }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('4.75$').length).toBeGreaterThan(0);
  });

  it('shows the no-plan variant with a contact action', async () => {
    chatMock.subscription = 'none';
    activityReturns([]);
    await renderApp('/balance');
    expect(await screen.findByText(ar.balance.noPlan)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: ar.balance.contactUs }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/ينتهي رصيدك بانتهاء الباقة في/)).toBeNull();
  });

  it('offers a retry when the activity fails to load', async () => {
    server.use(
      http.get('http://localhost:3000/api/v1/me/balance/activity', () =>
        HttpResponse.json(
          { statusCode: 500, code: 'INTERNAL_ERROR', message: 'dev' },
          { status: 500 },
        ),
      ),
    );
    await renderApp('/balance');
    expect(
      await screen.findByText(ar.balance.activity.error),
    ).toBeInTheDocument();
  });
});
