import { describe, expect, it } from 'vitest';
import { validateUserDetailSearch } from '../../users/model/search';
import {
  requestsFilterOf,
  validateAuditSearch,
  validateRequestsSearch,
} from '../model/search';

describe('requests search', () => {
  it('defaults to flagged and keeps the other statuses and «all»', () => {
    expect(requestsFilterOf(validateRequestsSearch({}))).toBe(
      'reconciliation_required',
    );
    expect(validateRequestsSearch({ status: 'all' })).toEqual({
      status: 'all',
    });
    expect(validateRequestsSearch({ status: 'settled' })).toEqual({
      status: 'settled',
    });
    expect(validateRequestsSearch({ status: 'bogus' })).toEqual({});
  });
});

describe('audit search', () => {
  it('keeps valid filters and drops the rest', () => {
    const id = '11111111-1111-4111-8111-111111111111';
    expect(
      validateAuditSearch({
        action: ' user.x ',
        resourceId: 123,
        actorId: id,
        from: '2026-10-01',
        to: '2026-10-05',
      }),
    ).toEqual({
      action: 'user.x',
      resourceId: '123',
      actorId: id,
      from: '2026-10-01',
      to: '2026-10-05',
    });
    expect(validateAuditSearch({ actorId: 'x', from: '2026-02-31' })).toEqual(
      {},
    );
    expect(
      validateAuditSearch({ from: '2026-10-05', to: '2026-10-01' }),
    ).toEqual({});
  });
});

describe('user detail search', () => {
  it('keeps the period only on the usage tab', () => {
    expect(validateUserDetailSearch({ tab: 'usage', days: 7 })).toEqual({
      tab: 'usage',
      days: 7,
    });
    expect(validateUserDetailSearch({ tab: 'balance', days: 7 })).toEqual({
      tab: 'balance',
    });
    expect(
      validateUserDetailSearch({ tab: 'usage', from: 'x', to: 'y' }),
    ).toEqual({ tab: 'usage' });
  });
});
