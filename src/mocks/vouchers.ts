import { http, HttpResponse } from 'msw';
import type { RedeemResultDto } from '~/api/generated/types.gen';

// POST /me/vouchers/redeem. Set `voucherMock.outcome` per test (reset in beforeEach).

const API = 'http://localhost:3000/api/v1';

export type VoucherOutcome =
  | { kind: 'balance'; creditedUsd?: string }
  | { kind: 'trial'; periodEnd?: string }
  | { kind: 'error'; status: number; code: string; data?: object }
  | { kind: 'network-error' };

export const voucherMock: {
  outcome: VoucherOutcome;
  /** Bodies of every redeem request. */
  calls: { code: string }[];
  /** Milliseconds the handler waits before answering. */
  delayMs: number;
} = { outcome: { kind: 'balance' }, calls: [], delayMs: 0 };

export function resetVoucherMock() {
  voucherMock.outcome = { kind: 'balance' };
  voucherMock.calls = [];
  voucherMock.delayMs = 0;
}

export const voucherErrors = {
  VOUCHER_NOT_FOUND: { kind: 'error', status: 404, code: 'VOUCHER_NOT_FOUND' },
  VOUCHER_EXPIRED: { kind: 'error', status: 409, code: 'VOUCHER_EXPIRED' },
  VOUCHER_USED_UP: { kind: 'error', status: 409, code: 'VOUCHER_USED_UP' },
  VOUCHER_ALREADY_REDEEMED: {
    kind: 'error',
    status: 409,
    code: 'VOUCHER_ALREADY_REDEEMED',
  },
  VOUCHER_NOT_ELIGIBLE: {
    kind: 'error',
    status: 409,
    code: 'VOUCHER_NOT_ELIGIBLE',
  },
  NO_ACTIVE_SUBSCRIPTION: {
    kind: 'error',
    status: 409,
    code: 'NO_ACTIVE_SUBSCRIPTION',
  },
  RATE_LIMITED: {
    kind: 'error',
    status: 429,
    code: 'RATE_LIMITED',
    data: { retryAfterSeconds: 42 },
  },
  INTERNAL_ERROR: { kind: 'error', status: 500, code: 'INTERNAL_ERROR' },
} satisfies Record<string, VoucherOutcome>;

export const voucherHandlers = [
  http.post(`${API}/me/vouchers/redeem`, async ({ request }) => {
    voucherMock.calls.push((await request.json()) as { code: string });
    if (voucherMock.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, voucherMock.delayMs));
    }
    const outcome = voucherMock.outcome;
    switch (outcome.kind) {
      case 'network-error':
        return HttpResponse.error();
      case 'error':
        return HttpResponse.json(
          {
            statusCode: outcome.status,
            code: outcome.code,
            message: 'dev message',
            ...(outcome.data ? { data: outcome.data } : {}),
          },
          { status: outcome.status },
        );
      case 'trial': {
        const body: RedeemResultDto = {
          kind: 'trial',
          creditedUsd: '6.200000000',
          balanceUsd: '11.200000000',
          plan: {
            key: 'pro',
            nameAr: 'احترافي',
            nameEn: 'Professional',
            currentPeriodEnd: outcome.periodEnd ?? '2026-11-20T12:00:00.000Z',
          },
        };
        return HttpResponse.json(body);
      }
      case 'balance': {
        const credited = outcome.creditedUsd ?? '5.000000000';
        const body: RedeemResultDto = {
          kind: 'balance',
          creditedUsd: credited,
          balanceUsd: '9.750000000',
          plan: null,
        };
        return HttpResponse.json(body);
      }
    }
  }),
];
