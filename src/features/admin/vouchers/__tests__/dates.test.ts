import { describe, expect, it } from 'vitest';
import { fromLocalInput, maskDateTime, toLocalInput } from '../model/dates';

describe('voucher date-time field', () => {
  it('shapes typing and converts Arabic digits', () => {
    expect(maskDateTime('2026')).toBe('2026');
    expect(maskDateTime('20261225')).toBe('2026-12-25');
    expect(maskDateTime('202612251')).toBe('2026-12-25 1');
    expect(maskDateTime('٢٠٢٦١٢٢٥١٤٣٠')).toBe('2026-12-25 14:30');
    expect(maskDateTime('2026-12-25T14:30')).toBe('2026-12-25 14:30');
  });

  it('rejects incomplete or impossible times', () => {
    expect(fromLocalInput('')).toBeNull();
    expect(fromLocalInput('2026-12')).toBeNull();
    expect(fromLocalInput('2026-12-25 1')).toBeNull();
    expect(fromLocalInput('2026-02-31 10:00')).toBeNull();
    expect(fromLocalInput('2026-12-25 25:00')).toBeNull();
  });

  it('round-trips through the field text', () => {
    const iso = new Date(2030, 5, 1, 12, 5).toISOString();
    expect(toLocalInput(iso)).toBe('2030-06-01 12:05');
    expect(fromLocalInput('2030-06-01 12:05')).toBe(iso);
  });
});
