import { http, HttpResponse } from 'msw';
import type {
  CreateVoucherBatchDto,
  UpdateVoucherBatchDto,
  VoucherBatchCodeDto,
  VoucherBatchDto,
} from '~/api/generated/types.gen';
import { adminMock } from './admin';

// Admin voucher batch handlers. Writes answer with `adminMock.fail` while it is
// set and record into `adminMock.calls` (batch:create, batch:update, batch:export).

const API = 'http://localhost:3000/api/v1/admin/voucher-batches';

export const batch = (
  id: string,
  patch: Partial<VoucherBatchDto> = {},
): VoucherBatchDto => ({
  id,
  name: `حملة ${id}`,
  kind: 'balance',
  amountUsd: '5.000000000',
  plan: null,
  trialDays: null,
  quantity: 10,
  prefix: 'EID',
  startsAt: null,
  endsAt: null,
  newUsersOnly: false,
  isActive: true,
  note: null,
  createdBy: null,
  createdAt: '2026-10-01T10:00:00.000Z',
  updatedAt: '2026-10-01T10:00:00.000Z',
  redeemedCount: 2,
  totalValueUsd: '50.000000000',
  creditedUsd: '10.000000000',
  ...patch,
});

export const batchCode = (
  id: string,
  patch: Partial<VoucherBatchCodeDto> = {},
): VoucherBatchCodeDto => ({
  id,
  code: `EID-${id.toUpperCase()}`,
  isActive: true,
  redeemedAt: null,
  redeemedByUserId: null,
  redeemedByEmail: null,
  ...patch,
});

interface BatchesMockState {
  batches: VoucherBatchDto[];
  codes: VoucherBatchCodeDto[];
  failReads: { status: number; code: string } | null;
  failExport: boolean;
}

const initial = (): BatchesMockState => ({
  batches: [batch('b1')],
  codes: [
    batchCode('c1'),
    batchCode('c2', {
      redeemedAt: '2026-10-02T10:00:00.000Z',
      redeemedByUserId: 'user-1',
      redeemedByEmail: 'reader@example.com',
    }),
    batchCode('c3', { isActive: false }),
  ],
  failReads: null,
  failExport: false,
});

export const batchesMock: BatchesMockState = initial();

export function resetBatchesMock() {
  Object.assign(batchesMock, initial());
}

const failure = (f: { status: number; code: string }) =>
  HttpResponse.json(
    { statusCode: f.status, code: f.code, message: 'dev message' },
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

export const adminVoucherBatchHandlers = [
  http.get(API, ({ request }) => {
    if (batchesMock.failReads) return failure(batchesMock.failReads);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    return HttpResponse.json(
      page(
        batchesMock.batches.filter(
          (b) => !status || (status === 'active' ? b.isActive : !b.isActive),
        ),
        url,
      ),
    );
  }),
  http.post(API, async ({ request }) => {
    const body = (await request.json()) as CreateVoucherBatchDto;
    adminMock.calls.push({ name: 'batch:create', body });
    if (adminMock.fail) return failure(adminMock.fail);
    const created = batch(`n${batchesMock.batches.length + 1}`, {
      name: body.name,
      kind: body.kind,
      amountUsd: body.amountUsd ?? null,
      quantity: body.quantity ?? 10,
      prefix: body.prefix?.toUpperCase() ?? null,
      redeemedCount: 0,
      creditedUsd: '0.000000000',
    });
    batchesMock.batches.unshift(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.get(`${API}/:id/codes`, ({ request }) => {
    if (batchesMock.failReads) return failure(batchesMock.failReads);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    return HttpResponse.json(
      page(
        batchesMock.codes.filter(
          (c) => !status || (status === 'used' ? c.redeemedAt : !c.redeemedAt),
        ),
        url,
      ),
    );
  }),
  http.get(`${API}/:id/export`, () => {
    adminMock.calls.push({ name: 'batch:export' });
    if (batchesMock.failExport) {
      return failure({ status: 500, code: 'INTERNAL_ERROR' });
    }
    return new HttpResponse('code,kind\nEID-C1,balance\n', {
      headers: { 'Content-Type': 'text/csv' },
    });
  }),
  http.get(`${API}/:id`, ({ params }) => {
    if (batchesMock.failReads) return failure(batchesMock.failReads);
    const found = batchesMock.batches.find((b) => b.id === params.id);
    return found
      ? HttpResponse.json(found)
      : failure({ status: 404, code: 'VOUCHER_BATCH_NOT_FOUND' });
  }),
  http.patch(`${API}/:id`, async ({ request, params }) => {
    const body = (await request.json()) as UpdateVoucherBatchDto;
    adminMock.calls.push({ name: 'batch:update', body });
    if (adminMock.fail) return failure(adminMock.fail);
    const index = batchesMock.batches.findIndex((b) => b.id === params.id);
    if (index < 0) {
      return failure({ status: 404, code: 'VOUCHER_BATCH_NOT_FOUND' });
    }
    const { reason: _reason, ...changes } = body;
    const next = { ...batchesMock.batches[index]!, ...changes };
    batchesMock.batches[index] = next;
    return HttpResponse.json(next);
  }),
];
