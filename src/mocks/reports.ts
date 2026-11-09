import Decimal from 'decimal.js';
import { http, HttpResponse } from 'msw';
import type {
  AdminChatRequestDto,
  AuditEntryDto,
  MyUsageDto,
  OverviewDayDto,
  OverviewDto,
  UsageByDayDto,
  UsageTotalsDto,
  UserUsageDto,
} from '~/api/generated/types.gen';
import { addDays, parseDay, utcDay } from '~/lib/period';
import { currentMonth } from '~/lib/months';

// F9 report endpoints (admin overview, user usage, chat requests, audit, my usage).
// `reportsMock.scenario` picks the data; reset it in beforeEach.
//   normal  a month of plausible activity, one day with a negative margin
//   zeros   a period with no activity
//   large   the same shape over whatever range is asked (use a 366-day range)
//   error   every report answers 500 INTERNAL_ERROR
// `reportsMock.calls` records the query of every request.

const API = 'http://localhost:3000/api/v1';

export type ReportsScenario = 'normal' | 'zeros' | 'large' | 'error';

export const reportsMock: {
  scenario: ReportsScenario;
  /** Overrides the status/code of the `error` scenario. */
  failure: { status: number; code: string } | null;
  calls: { name: string; query: Record<string, string> }[];
} = { scenario: 'normal', failure: null, calls: [] };

export function resetReportsMock() {
  reportsMock.scenario = 'normal';
  reportsMock.failure = null;
  reportsMock.calls = [];
}

const usd = (value: Decimal.Value) => new Decimal(value).toFixed(9);
const ZERO = usd(0);

/** Deterministic pseudo-activity for a day index: 0 on every 9th day, bigger on weekdays. */
function activity(index: number): number {
  if (index % 9 === 4) return 0;
  return 10 + ((index * 37) % 90);
}

function days(from: string, to: string): string[] {
  const out: string[] = [];
  const end = parseDay(to);
  for (let d = from; parseDay(d)! <= end!; d = addDays(d, 1)) out.push(d);
  return out;
}

function totals(
  rows: {
    requests: number;
    chargedUsd: string;
    providerCostUsd: string;
  }[],
): UsageTotalsDto {
  const charged = rows.reduce((a, r) => a.plus(r.chargedUsd), new Decimal(0));
  const cost = rows.reduce((a, r) => a.plus(r.providerCostUsd), new Decimal(0));
  const requests = rows.reduce((a, r) => a + r.requests, 0);
  return {
    requests,
    flaggedRequests: requests > 0 ? 2 : 0,
    inputTokens: requests * 1200,
    cachedInputTokens: requests * 300,
    outputTokens: requests * 800,
    chargedUsd: usd(charged),
    providerCostUsd: usd(cost),
    marginUsd: usd(charged.minus(cost)),
    absorbedUsd: requests > 0 ? usd('0.012') : ZERO,
  };
}

function overviewDay(
  date: string,
  index: number,
  zero: boolean,
): OverviewDayDto {
  const requests = zero ? 0 : activity(index);
  const charged = new Decimal(requests).times('0.0123');
  // Day 12 sells below cost so screens can show a negative margin.
  const cost = charged.times(index === 12 ? '1.4' : '0.6');
  return {
    date,
    requests,
    chargedUsd: usd(charged),
    providerCostUsd: usd(cost),
    newUsers: zero ? 0 : index % 4,
  };
}

function period(query: URLSearchParams) {
  const to = query.get('to') ?? utcDay(new Date());
  const from = query.get('from') ?? addDays(to, -29);
  return { from, to };
}

function overview(query: URLSearchParams): OverviewDto {
  const { from, to } = period(query);
  const zero = reportsMock.scenario === 'zeros';
  const byDay = days(from, to).map((d, i) => overviewDay(d, i, zero));
  const usage = totals(byDay);
  return {
    from,
    to,
    users: { total: 1284, new: zero ? 0 : 41, active: zero ? 0 : 212 },
    subscriptions: [
      { planKey: 'plus', nameAr: 'بلس', nameEn: 'Plus', active: 150 },
      { planKey: 'pro', nameAr: 'برو', nameEn: 'Pro', active: 61 },
    ],
    money: {
      purchasesUsd: ZERO,
      subscriptionCreditsUsd: usd(zero ? 0 : 1200),
      voucherCreditsUsd: usd(zero ? 0 : 50),
      adjustmentsUsd: ZERO,
      expiredUsd: ZERO,
    },
    usage,
    imagesCreated: zero ? 0 : 87,
    imagesUploaded: zero ? 0 : 23,
    openCatalogFindings: zero ? 0 : 3,
    requestsToReview: zero ? 0 : 5,
    topModes: zero
      ? []
      : [
          { key: 'fast', label: 'fast', requests: 640, chargedUsd: usd('7.9') },
          {
            key: 'professional',
            label: 'professional',
            requests: 210,
            chargedUsd: usd('12.4'),
          },
        ],
    topModels: zero
      ? []
      : [
          {
            key: 'google/gemini-2.5-flash',
            label: 'google/gemini-2.5-flash',
            requests: 700,
            chargedUsd: usd('9.1'),
          },
        ],
    byDay,
  };
}

function userUsage(userId: string, query: URLSearchParams): UserUsageDto {
  const { from, to } = period(query);
  const zero = reportsMock.scenario === 'zeros';
  const byDay: UsageByDayDto[] = days(from, to).map((date, i) => {
    const day = overviewDay(date, i, zero);
    const t = totals([day]);
    return { ...t, date };
  });
  const all = totals(byDay);
  return {
    userId,
    from,
    to,
    totals: all,
    byMode: zero ? [] : [{ ...all, modeKey: 'fast' }],
    byModel: zero
      ? []
      : [
          {
            ...all,
            modelId: '33333333-3333-4333-8333-333333333333',
            providerCode: 'google',
            providerModelId: 'gemini-2.5-flash',
            displayName: 'Gemini 2.5 Flash',
          },
        ],
    byDay,
  };
}

const requestRow = (i: number): AdminChatRequestDto => ({
  requestId: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
  createdAt: new Date(
    Date.UTC(2026, 9, 20, 10, 0) - i * 3_600_000,
  ).toISOString(),
  settledAt: null,
  userId: '22222222-2222-4222-8222-222222222222',
  userEmail: 'sara@example.com',
  conversationId: '44444444-4444-4444-8444-444444444444',
  modeKey: 'fast',
  modelId: '33333333-3333-4333-8333-333333333333',
  modelDisplayName: 'Gemini 2.5 Flash',
  providerCode: 'google',
  providerModelId: 'gemini-2.5-flash',
  status: 'reconciliation_required',
  usageSource: 'estimated',
  inputTokens: 1200,
  cachedInputTokens: 0,
  outputTokens: 800,
  reservedUsd: usd('0.05'),
  chargedUsd: usd('0.031'),
  providerCostUsd: usd('0.02'),
  absorbedUsd: usd('0.004'),
});

const auditRow = (id: number): AuditEntryDto => ({
  id: String(id),
  occurredAt: new Date(
    Date.UTC(2026, 9, 20, 10, 0) - id * 60_000,
  ).toISOString(),
  actorType: 'admin',
  actorId: '11111111-1111-4111-8111-111111111111',
  actorEmail: 'admin@example.com',
  actorLabel: null,
  action: 'user.status_changed',
  resourceType: 'user',
  resourceId: '22222222-2222-4222-8222-222222222222',
  oldValue: { status: 'active' },
  newValue: { status: 'suspended' },
  reason: 'اختبار',
});

function myUsage(query: URLSearchParams): MyUsageDto {
  const month = query.get('month') ?? currentMonth();
  const zero = reportsMock.scenario === 'zeros';
  const [y, m] = month.split('-').map(Number) as [number, number];
  const length = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const today = utcDay(new Date());
  const rows = days(
    `${month}-01`,
    `${month}-${String(length).padStart(2, '0')}`,
  )
    .filter((d) => d <= today)
    .map((date, i) => {
      const messages = zero ? 0 : activity(i);
      return {
        date,
        messages,
        chargedUsd: usd(new Decimal(messages).times('0.0123')),
      };
    });
  const messages = rows.reduce((a, r) => a + r.messages, 0);
  const charged = rows.reduce((a, r) => a.plus(r.chargedUsd), new Decimal(0));
  return {
    month,
    totals: {
      messages,
      chargedUsd: usd(charged),
      inputTokens: messages * 1200,
      outputTokens: messages * 800,
    },
    byMode: zero
      ? []
      : [
          {
            modeKey: 'professional',
            labelAr: 'احترافي',
            labelEn: 'Professional',
            messages: Math.floor(messages / 3),
            chargedUsd: usd(charged.times('0.7')),
          },
          {
            // A removed mode: labels are null.
            modeKey: 'old-mode',
            labelAr: null,
            labelEn: null,
            messages: messages - Math.floor(messages / 3),
            chargedUsd: usd(charged.times('0.3')),
          },
        ],
    byDay: rows,
  };
}

function track(name: string, request: Request) {
  const query = Object.fromEntries(new URL(request.url).searchParams);
  reportsMock.calls.push({ name, query });
}

const failing = () =>
  HttpResponse.json(
    {
      statusCode: reportsMock.failure?.status ?? 500,
      code: reportsMock.failure?.code ?? 'INTERNAL_ERROR',
      message: 'dev message',
    },
    { status: reportsMock.failure?.status ?? 500 },
  );

const isError = () => reportsMock.scenario === 'error';

export const reportsHandlers = [
  http.get(`${API}/admin/overview`, ({ request }) => {
    track('overview', request);
    if (isError()) return failing();
    return HttpResponse.json(overview(new URL(request.url).searchParams));
  }),
  http.get(`${API}/admin/users/:id/usage`, ({ request, params }) => {
    track('user-usage', request);
    if (isError()) return failing();
    return HttpResponse.json(
      userUsage(String(params.id), new URL(request.url).searchParams),
    );
  }),
  http.get(`${API}/admin/chat-requests`, ({ request }) => {
    track('chat-requests', request);
    if (isError()) return failing();
    const zero = reportsMock.scenario === 'zeros';
    const cursor = Number(new URL(request.url).searchParams.get('cursor') ?? 0);
    const size = 5;
    const total = reportsMock.scenario === 'large' ? 120 : 8;
    const items = zero
      ? []
      : Array.from(
          { length: Math.max(0, Math.min(size, total - cursor)) },
          (_, i) => requestRow(cursor + i + 1),
        );
    const next = cursor + size;
    return HttpResponse.json({
      items,
      nextCursor: !zero && next < total ? String(next) : null,
    });
  }),
  http.get(`${API}/admin/audit`, ({ request }) => {
    track('audit', request);
    if (isError()) return failing();
    const zero = reportsMock.scenario === 'zeros';
    const before = new URL(request.url).searchParams.get('before');
    const total = reportsMock.scenario === 'large' ? 100 : 12;
    const first = before ? Number(before) - 1 : total;
    const items = zero
      ? []
      : Array.from({ length: Math.max(0, Math.min(5, first)) }, (_, i) =>
          auditRow(first - i),
        );
    const last = items.at(-1);
    return HttpResponse.json({
      items,
      nextBefore: last && Number(last.id) > 1 ? Number(last.id) : null,
    });
  }),
  http.get(`${API}/me/usage`, ({ request }) => {
    track('my-usage', request);
    if (isError()) return failing();
    const month = new URL(request.url).searchParams.get('month');
    if (month && month > currentMonth())
      return HttpResponse.json(
        {
          statusCode: 400,
          code: 'VALIDATION_FAILED',
          message: 'dev message',
          details: [{ field: 'month', errors: ['future'] }],
        },
        { status: 400 },
      );
    return HttpResponse.json(myUsage(new URL(request.url).searchParams));
  }),
];
