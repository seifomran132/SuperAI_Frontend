import { http, HttpResponse } from 'msw';
import type {
  AdminLedgerEntryDto,
  AdminUserDto,
  PlanDto,
  SubscriptionDto,
} from '~/api/generated/types.gen';

// Admin API handlers (users, subscriptions, balance, ledger). Behaviour is
// switched through `adminMock` (reset it in beforeEach). `fail` makes the next
// write answer with an API error; `calls` records every request for assertions.

const API = 'http://localhost:3000/api/v1/admin';

export interface AdminFailure {
  status: number;
  code: string;
  details?: { field: string; errors: string[] }[];
}

export interface AdminMockState {
  users: AdminUserDto[];
  plans: PlanDto[];
  subscriptions: SubscriptionDto[];
  /** Newest first. */
  ledger: AdminLedgerEntryDto[];
  /** Answer for write requests until cleared. */
  fail: AdminFailure | null;
  calls: { name: string; body?: unknown; query?: Record<string, string> }[];
}

export const sara: AdminUserDto = {
  id: '22222222-2222-4222-8222-222222222222',
  email: 'sara@example.com',
  fullName: 'سارة الحربي',
  phoneNumber: null,
  accountStatus: 'active',
  isAdmin: false,
  emailConfirmedAt: '2026-01-02T00:00:00.000Z',
  lastSignInAt: '2026-10-03T10:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const plan = (key: string, active = true): PlanDto => ({
  id: `plan-${key}`,
  key,
  nameAr: `باقة ${key}`,
  nameEn: `Plan ${key}`,
  descriptionAr: '',
  descriptionEn: '',
  monthlyPriceUsd: '10.000000000',
  includedBalanceUsd: '8.000000000',
  isDefault: false,
  isActive: active,
  isPublic: true,
  sortOrder: 1,
  modeKeys: [],
  activeSubscriptions: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

export const ledgerEntry = (
  sequence: number,
  type: AdminLedgerEntryDto['type'],
  amountUsd: string,
): AdminLedgerEntryDto => ({
  id: `entry-${sequence}`,
  sequence,
  type,
  amountUsd,
  balanceAfterUsd: '14.500000000',
  idempotencyKey: `key-${sequence}`,
  referenceType: null,
  referenceId: null,
  actorType: type === 'adjustment' ? 'admin' : 'system',
  actorId:
    type === 'adjustment' ? 'aaaaaaaa-1111-4111-8111-111111111111' : null,
  reason: null,
  createdAt: '2026-10-02T10:00:00.000Z',
});

const initial = (): AdminMockState => ({
  users: [sara],
  plans: [plan('basic'), plan('pro'), plan('old', false)],
  subscriptions: [],
  ledger: [],
  fail: null,
  calls: [],
});

export const adminMock: AdminMockState = initial();

export function resetAdminMock() {
  Object.assign(adminMock, initial());
}

export const adminCalls = (name: string) =>
  adminMock.calls.filter((c) => c.name === name);

const failure = (f: AdminFailure) =>
  HttpResponse.json(
    {
      statusCode: f.status,
      code: f.code,
      message: 'dev message',
      ...(f.details ? { details: f.details } : {}),
    },
    { status: f.status },
  );

const notFound = () => failure({ status: 404, code: 'USER_NOT_FOUND' });

const subscriptionState = (subscription: SubscriptionDto | null) => ({
  changed: true,
  effectivePlanKey: subscription?.planKey ?? 'free',
  subscription,
  creditedUsd: '0.000000000',
  expiredUsd: '0.000000000',
});

export const adminHandlers = [
  http.get(`${API}/users`, ({ request }) => {
    const query = Object.fromEntries(new URL(request.url).searchParams);
    adminMock.calls.push({ name: 'users:list', query });
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 20);
    const q = query.q?.toLowerCase();
    const items = adminMock.users.filter(
      (u) =>
        (!q ||
          u.email?.toLowerCase().includes(q) ||
          u.fullName?.toLowerCase().includes(q)) &&
        (!query.status || u.accountStatus === query.status) &&
        (query.isAdmin === undefined || String(u.isAdmin) === query.isAdmin),
    );
    return HttpResponse.json({
      items: items.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      total: items.length,
    });
  }),
  http.get(`${API}/users/:id`, ({ params }) => {
    const user = adminMock.users.find((u) => u.id === params.id);
    return user ? HttpResponse.json(user) : notFound();
  }),
  http.patch(`${API}/users/:id/status`, async ({ request, params }) => {
    const body = await request.json();
    adminMock.calls.push({ name: 'status', body });
    if (adminMock.fail) return failure(adminMock.fail);
    const user = adminMock.users.find((u) => u.id === params.id);
    if (!user) return notFound();
    user.accountStatus = (body as { status: 'active' | 'suspended' }).status;
    return HttpResponse.json({ changed: true, user });
  }),
  http.put(`${API}/users/:id/admin-role`, async ({ request, params }) => {
    const body = await request.json();
    adminMock.calls.push({ name: 'admin-role', body });
    if (adminMock.fail) return failure(adminMock.fail);
    const user = adminMock.users.find((u) => u.id === params.id);
    if (!user) return notFound();
    user.isAdmin = (body as { isAdmin: boolean }).isAdmin;
    return HttpResponse.json({ changed: true, user });
  }),
  http.get(`${API}/users/:id/subscriptions`, () =>
    HttpResponse.json(adminMock.subscriptions),
  ),
  http.post(`${API}/users/:id/subscriptions`, async ({ request }) => {
    const body = await request.json();
    adminMock.calls.push({ name: 'subscriptions:assign', body });
    if (adminMock.fail) return failure(adminMock.fail);
    return HttpResponse.json(subscriptionState(null));
  }),
  http.post(`${API}/users/:id/subscriptions/end`, async ({ request }) => {
    const body = await request.json();
    adminMock.calls.push({ name: 'subscriptions:end', body });
    if (adminMock.fail) return failure(adminMock.fail);
    adminMock.subscriptions = [];
    return HttpResponse.json(subscriptionState(null));
  }),
  http.get(`${API}/users/:id/balance`, () =>
    HttpResponse.json({
      balanceUsd: '14.500000000',
      reservedUsd: '0.020000000',
      spendableUsd: '14.480000000',
    }),
  ),
  http.get(`${API}/users/:id/ledger`, ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? 30);
    const before = url.searchParams.get('before');
    adminMock.calls.push({
      name: 'ledger',
      query: Object.fromEntries(url.searchParams),
    });
    const older = adminMock.ledger.filter(
      (e) => before === null || e.sequence < Number(before),
    );
    const items = older.slice(0, limit);
    const more = older.length > items.length;
    return HttpResponse.json({
      items,
      nextBefore: more ? (items[items.length - 1]?.sequence ?? null) : null,
    });
  }),
  http.post(`${API}/users/:id/balance/adjustments`, async ({ request }) => {
    const body = await request.json();
    adminMock.calls.push({ name: 'adjustments', body });
    if (adminMock.fail) return failure(adminMock.fail);
    return HttpResponse.json({
      replayed: false,
      balanceUsd: '14.500000000',
      entry: ledgerEntry(99, 'adjustment', '5.000000000'),
    });
  }),
  http.post(`${API}/users/:id/balance/purchases`, async ({ request }) => {
    const body = await request.json();
    adminMock.calls.push({ name: 'purchases', body });
    if (adminMock.fail) return failure(adminMock.fail);
    return HttpResponse.json({
      replayed: false,
      balanceUsd: '14.500000000',
      entry: ledgerEntry(100, 'purchase', '10.000000000'),
    });
  }),
  http.get(`${API}/plans`, () => HttpResponse.json(adminMock.plans)),
];
