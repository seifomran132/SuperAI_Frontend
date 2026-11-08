import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import '~/i18n';
import ar from '~/i18n/ar.json';
import type { PeriodSearch } from '~/lib/period';
import { PeriodPicker } from '..';

const effective = { from: '2026-10-08', to: '2026-11-06' };

function setup(initial: PeriodSearch = {}) {
  const onChange = vi.fn();
  function Host() {
    const [value, set] = useState(initial);
    return (
      <PeriodPicker
        value={value}
        effective={effective}
        onChange={(p) => {
          onChange(p);
          set(p);
        }}
      />
    );
  }
  render(<Host />);
  return onChange;
}

const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

const openCustom = () =>
  fireEvent.click(
    screen.getByRole('button', { name: ar.reports.period.custom }),
  );

describe('PeriodPicker', () => {
  it('marks the default (30 days) and picks a preset', () => {
    const onChange = setup();
    expect(
      screen.getByRole('button', { name: ar.reports.period.last30 }),
    ).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(
      screen.getByRole('button', { name: ar.reports.period.last7 }),
    );
    expect(onChange).toHaveBeenCalledWith({ days: 7 });
  });

  it('says the days are UTC and summarises the period', () => {
    setup();
    expect(screen.getByText(ar.reports.period.utcNote)).toBeInTheDocument();
    expect(
      screen.getByText('من 8 أكتوبر 2026 إلى 6 نوفمبر 2026 · 30 يومًا'),
    ).toBeInTheDocument();
  });

  it('applies a valid custom range', () => {
    const onChange = setup();
    openCustom();
    type(ar.reports.period.from, '20261001');
    type(ar.reports.period.to, '20261015');
    expect(screen.getByLabelText(ar.reports.period.from)).toHaveValue(
      '2026-10-01',
    );
    fireEvent.click(
      screen.getByRole('button', { name: ar.reports.period.apply }),
    );
    expect(onChange).toHaveBeenCalledWith({
      from: '2026-10-01',
      to: '2026-10-15',
    });
  });

  it('writes Western digits even when Arabic-Indic digits are typed', () => {
    setup();
    openCustom();
    type(ar.reports.period.from, '٢٠٢٦١٠٠١');
    expect(screen.getByLabelText(ar.reports.period.from)).toHaveValue(
      '2026-10-01',
    );
  });

  it.each([
    ['2026-11-02', '2026-11-01', ar.reports.period.errors.startAfterEnd],
    ['2025-01-01', '2026-01-02', ar.reports.period.errors.tooLong],
    ['2099-01-01', '2099-01-02', ar.reports.period.errors.future],
  ])('refuses %s to %s', (from, to, message) => {
    const onChange = setup();
    openCustom();
    type(ar.reports.period.from, from);
    type(ar.reports.period.to, to);
    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(
      screen.getByRole('button', { name: ar.reports.period.apply }),
    ).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/آخر فترة صالحة/)).toBeInTheDocument();
  });
});
