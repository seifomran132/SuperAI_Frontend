import { describe, expect, it } from 'vitest';
import {
  batchCodeStatus,
  batchStatus,
  batchTotal,
  csvFileName,
  exampleCode,
  overBatchLimit,
  percentOf,
  prefixError,
  quantityError,
} from '../model/batches';
import { validateBatchSearch, validateVouchersSearch } from '../model/search';

const base = {
  isActive: true,
  redeemedCount: 1,
  quantity: 10,
  startsAt: null,
  endsAt: null,
};
const now = new Date('2026-11-09T10:00:00Z');

describe('batch rules', () => {
  it('accepts whole quantities from 3 to 100 only', () => {
    for (const good of ['3', '10', '100']) {
      expect(quantityError(good)).toBeNull();
    }
    for (const bad of ['2', '101', '1.5', '', 'x']) {
      expect(quantityError(bad)).not.toBeNull();
    }
  });

  it('accepts an empty prefix or 2-12 letters and digits', () => {
    expect(prefixError('')).toBeNull();
    expect(prefixError('eid26')).toBeNull();
    for (const bad of ['E', 'A-B', 'ABCDEFGHIJKLM']) {
      expect(prefixError(bad)).not.toBeNull();
    }
  });

  it('computes the total without float errors', () => {
    expect(batchTotal('3', '0.1')?.toFixed()).toBe('0.3');
    expect(batchTotal('2', 'x')).toBeNull();
  });

  it('blocks only above 10,000', () => {
    expect(overBatchLimit(batchTotal('10', '1000'))).toBe(false);
    expect(overBatchLimit(batchTotal('11', '1000'))).toBe(true);
    expect(overBatchLimit(null)).toBe(false);
  });

  it('shows the example in capitals, or the default while invalid', () => {
    expect(exampleCode('eid')).toBe('EID-7KQ2-XH9M');
    expect(exampleCode('')).toBe('LAM7A-7KQ2-XH9M');
    expect(exampleCode('E')).toBe('LAM7A-7KQ2-XH9M');
  });

  it('orders the batch status: off, used up, then the period', () => {
    expect(batchStatus({ ...base, isActive: false }, now)).toBe('inactive');
    expect(batchStatus({ ...base, redeemedCount: 10 }, now)).toBe('usedUp');
    expect(batchStatus({ ...base, endsAt: '2026-01-01T00:00:00Z' }, now)).toBe(
      'expired',
    );
    expect(
      batchStatus({ ...base, startsAt: '2027-01-01T00:00:00Z' }, now),
    ).toBe('notStarted');
    expect(batchStatus(base, now)).toBe('active');
  });

  it('a used code stays used even if it was turned off', () => {
    expect(batchCodeStatus({ isActive: false, redeemedAt: 'x' })).toBe('used');
    expect(batchCodeStatus({ isActive: false, redeemedAt: null })).toBe('off');
    expect(batchCodeStatus({ isActive: true, redeemedAt: null })).toBe(
      'unused',
    );
  });

  it('caps a bar at 100 and survives a zero total', () => {
    expect(percentOf(5, 10)).toBe(50);
    expect(percentOf(20, 10)).toBe(100);
    expect(percentOf('1', '0')).toBe(0);
  });

  it('makes a safe file name', () => {
    expect(csvFileName('حملة/العيد: 2026')).toBe('حملة-العيد- 2026.csv');
    expect(csvFileName('  ')).toBe('codes.csv');
  });

  it('reads the URL search', () => {
    expect(validateVouchersSearch({ tab: 'batches' })).toEqual({
      tab: 'batches',
    });
    expect(validateVouchersSearch({ tab: 'x', status: 'y' })).toEqual({});
    expect(validateBatchSearch({ created: true })).toEqual({ created: true });
    expect(validateBatchSearch({ created: 'no' })).toEqual({});
  });
});
