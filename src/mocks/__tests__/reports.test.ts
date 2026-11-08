import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { server } from '../server';
import { reportsMock, resetReportsMock } from '../reports';
import type { OverviewDto, MyUsageDto } from '~/api/generated/types.gen';

const API = 'http://localhost:3000/api/v1';
const get = async <T>(path: string) => {
  const response = await fetch(`${API}${path}`);
  return { status: response.status, body: (await response.json()) as T };
};

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterAll(() => server.close());
beforeEach(resetReportsMock);

describe('report mocks', () => {
  it('normal: a month of days, oldest first, with a negative-margin day', async () => {
    const { body } = await get<OverviewDto>('/admin/overview');
    expect(body.byDay).toHaveLength(30);
    expect(body.byDay[0]!.date < body.byDay[29]!.date).toBe(true);
    expect(body.usage.marginUsd).toMatch(/^-?\d+\.\d{9}$/);
  });

  it('zeros: no activity, but users.total stays', async () => {
    reportsMock.scenario = 'zeros';
    const { body } = await get<OverviewDto>(
      '/admin/overview?from=2026-10-01&to=2026-10-05',
    );
    expect(body.byDay).toHaveLength(5);
    expect(body.byDay.every((d) => d.requests === 0)).toBe(true);
    expect(body.users.total).toBeGreaterThan(0);
    expect(body.topModes).toEqual([]);
  });

  it('large: 366 days', async () => {
    reportsMock.scenario = 'large';
    const { body } = await get<OverviewDto>(
      '/admin/overview?from=2025-11-06&to=2026-11-06',
    );
    expect(body.byDay).toHaveLength(366);
  });

  it('error: every report answers with a code', async () => {
    reportsMock.scenario = 'error';
    const { status, body } = await get<{ code: string }>('/me/usage');
    expect(status).toBe(500);
    expect(body.code).toBe('INTERNAL_ERROR');
  });

  it('my usage: a removed mode has null labels; a future month is refused', async () => {
    const ok = await get<MyUsageDto>('/me/usage?month=2026-10');
    expect(ok.body.byDay).toHaveLength(31);
    expect(ok.body.byMode.some((m) => m.labelAr === null)).toBe(true);
    const future = await get<{ code: string }>('/me/usage?month=2099-01');
    expect(future.status).toBe(400);
    expect(reportsMock.calls.map((c) => c.name)).toEqual([
      'my-usage',
      'my-usage',
    ]);
  });
});
