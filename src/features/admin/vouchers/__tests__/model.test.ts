import { describe, expect, it } from 'vitest';
import i18n from 'i18next';
import '~/i18n';
import {
  amountError,
  codeError,
  daysError,
  limitError,
  windowError,
} from '../model/form';
import { voucherStatus } from '../model/status';

const base = {
  isActive: true,
  redemptionCount: 1,
  maxRedemptions: 10,
  startsAt: null,
  endsAt: null,
};
const now = new Date('2026-11-06T12:00:00.000Z');

describe('voucher model', () => {
  it('derives the display status in priority order', () => {
    expect(voucherStatus(base, now)).toBe('active');
    expect(
      voucherStatus({ ...base, isActive: false, redemptionCount: 10 }, now),
    ).toBe('inactive');
    expect(
      voucherStatus(
        { ...base, redemptionCount: 10, endsAt: '2020-01-01T00:00:00Z' },
        now,
      ),
    ).toBe('usedUp');
    expect(
      voucherStatus({ ...base, endsAt: '2026-11-06T11:00:00Z' }, now),
    ).toBe('expired');
    expect(
      voucherStatus({ ...base, startsAt: '2026-11-07T00:00:00Z' }, now),
    ).toBe('notStarted');
  });

  it('asks for a future end without mentioning a start when there is none', () => {
    expect(windowError('', '2026-11-06T10:00', now)).toBe(
      'vouchers.errors.endInPast',
    );
    expect(windowError('', '2026-12-06T10:00', now)).toBeNull();
    expect(windowError('2026-12-01T10:00', '2026-11-30T10:00', now)).toBe(
      'vouchers.errors.endBeforeStart',
    );
  });

  it('validates amount, days, limit and code', () => {
    expect(amountError('1000')).toBeNull();
    expect(amountError('1000.000000001')).not.toBeNull();
    expect(amountError('0.000000000')).not.toBeNull();
    expect(amountError('-1')).not.toBeNull();
    expect(daysError('365')).toBeNull();
    expect(daysError('0')).not.toBeNull();
    expect(daysError('1.5')).not.toBeNull();
    expect(limitError('5', 5)).toBeNull();
    expect(limitError('4', 5)).toBe('vouchers.errors.limitBelowUsed');
    expect(limitError('1000000')).toBeNull();
    expect(limitError('1000001')).toBe('vouchers.errors.limitInvalid');
    expect(codeError('')).toBeNull();
    expect(codeError('AB-12')).toBeNull();
    expect(codeError('ab c')).not.toBeNull();
    expect(codeError('abc')).not.toBeNull();
  });

  it('uses the Arabic plural forms for day counts', async () => {
    await i18n.changeLanguage('ar');
    const days = (count: number) => i18n.t('admin.vouchers.days', { count });
    expect(days(1)).toBe('يوم واحد');
    expect(days(2)).toBe('يومان');
    expect(days(3)).toBe('3 أيام');
    expect(days(11)).toBe('11 يومًا');
    expect(days(100)).toBe('100 يوم');
  });
});
