import { http, HttpResponse } from 'msw';
import type {
  CreateVoucherDto,
  UpdateVoucherDto,
  VoucherDto,
  VoucherRedemptionDto,
} from '~/api/generated/types.gen';
import { adminMock } from './admin';

// Admin voucher handlers. Writes answer with `adminMock.fail` while it is set
// and record into `adminMock.calls` (voucher:create, voucher:update). The list
// and redemptions page with an offset cursor.

const API = 'http://localhost:3000/api/v1/admin/vouchers';

export interface VouchersMockState {
  /** Newest first. */
  vouchers: VoucherDto[];
  redemptions: Record<string, VoucherRedemptionDto[]>;
  /** Fail the list/detail/redemptions reads with this status/code. */
  failReads: { status: number; code: string } | null;
  /** Generated code for creates without one. */
  nextCode: string;
}

export const voucher = (
  id: string,
  patch: Partial<VoucherDto> = {},
): VoucherDto => ({
  id,
  code: `CODE-${id.toUpperCase()}`,
  batchId: null,
  kind: 'balance',
  amountUsd: '5.000000000',
  plan: null,
  trialDays: null,
  maxRedemptions: 100,
  redemptionCount: 3,
  startsAt: null,
  endsAt: null,
  newUsersOnly: false,
  isActive: true,
  note: null,
  createdBy: 'aaaaaaaa-1111-4111-8111-111111111111',
  createdAt: '2026-10-01T10:00:00.000Z',
  updatedAt: '2026-10-01T10:00:00.000Z',
  ...patch,
});

export const redemption = (
  id: string,
  patch: Partial<VoucherRedemptionDto> = {},
): VoucherRedemptionDto => ({
  id,
  userId: `user-${id}-0000-4000-8000-000000000000`,
  userEmail: `${id}@example.com`,
  redeemedAt: '2026-10-02T10:00:00.000Z',
  creditedUsd: '5.000000000',
  subscriptionId: null,
  ...patch,
});

const initial = (): VouchersMockState => ({
  vouchers: [voucher('v1')],
  redemptions: {},
  failReads: null,
  nextCode: 'LAM7A-7KQ2-XH9M',
});

export const vouchersMock: VouchersMockState = initial();

export function resetVouchersMock() {
  Object.assign(vouchersMock, initial());
}

const failure = (f: { status: number; code: string; details?: unknown }) =>
  HttpResponse.json(
    {
      statusCode: f.status,
      code: f.code,
      message: 'dev message',
      ...(f.details ? { details: f.details } : {}),
    },
    { status: f.status },
  );

function page<T>(items: T[], url: URL) {
  const limit = Number(url.searchParams.get('limit') ?? 20);
  const start = Number(url.searchParams.get('cursor') ?? 0);
  const end = start + limit;
  return {
    items: items.slice(start, end),
    nextCursor: end < items.length ? String(end) : null,
  };
}

export const adminVoucherHandlers = [
  http.get(API, ({ request }) => {
    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams);
    adminMock.calls.push({ name: 'voucher:list', query });
    if (vouchersMock.failReads) return failure(vouchersMock.failReads);
    const status = url.searchParams.get('status');
    return HttpResponse.json(
      page(
        vouchersMock.vouchers.filter(
          (v) => !status || (status === 'active' ? v.isActive : !v.isActive),
        ),
        url,
      ),
    );
  }),
  http.post(API, async ({ request }) => {
    const body = (await request.json()) as CreateVoucherDto;
    adminMock.calls.push({ name: 'voucher:create', body });
    if (adminMock.fail) return failure(adminMock.fail);
    const created = voucher(`n${vouchersMock.vouchers.length + 1}`, {
      code: body.code?.toUpperCase() ?? vouchersMock.nextCode,
      kind: body.kind,
      amountUsd: body.amountUsd ?? null,
      trialDays: body.trialDays ?? null,
      plan: body.planKey
        ? {
            key: body.planKey,
            nameAr: `باقة ${body.planKey}`,
            nameEn: body.planKey,
          }
        : null,
      maxRedemptions: body.maxRedemptions,
      redemptionCount: 0,
    });
    vouchersMock.vouchers.unshift(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.get(`${API}/:id/redemptions`, ({ request, params }) => {
    const url = new URL(request.url);
    adminMock.calls.push({
      name: 'voucher:redemptions',
      query: Object.fromEntries(url.searchParams),
    });
    if (vouchersMock.failReads) return failure(vouchersMock.failReads);
    return HttpResponse.json(
      page(vouchersMock.redemptions[String(params.id)] ?? [], url),
    );
  }),
  http.get(`${API}/:id`, ({ params }) => {
    if (vouchersMock.failReads) return failure(vouchersMock.failReads);
    const found = vouchersMock.vouchers.find((v) => v.id === params.id);
    return found
      ? HttpResponse.json(found)
      : failure({ status: 404, code: 'VOUCHER_NOT_FOUND' });
  }),
  http.patch(`${API}/:id`, async ({ request, params }) => {
    const body = (await request.json()) as UpdateVoucherDto;
    adminMock.calls.push({ name: 'voucher:update', body });
    if (adminMock.fail) return failure(adminMock.fail);
    const index = vouchersMock.vouchers.findIndex((v) => v.id === params.id);
    if (index < 0) return failure({ status: 404, code: 'VOUCHER_NOT_FOUND' });
    const { reason: _reason, ...changes } = body;
    const next = {
      ...vouchersMock.vouchers[index]!,
      ...changes,
      updatedAt: new Date().toISOString(),
    };
    vouchersMock.vouchers[index] = next;
    return HttpResponse.json(next);
  }),
];
