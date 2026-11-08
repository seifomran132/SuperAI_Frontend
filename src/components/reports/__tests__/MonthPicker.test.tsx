import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '~/i18n';
import ar from '~/i18n/ar.json';
import { MonthPicker } from '..';

const now = new Date('2026-11-06T12:00:00Z');

function setup(month: string, firstMonth = '2026-08') {
  const onChange = vi.fn();
  render(
    <MonthPicker
      month={month}
      firstMonth={firstMonth}
      onChange={onChange}
      now={now}
    />,
  );
  return onChange;
}

describe('MonthPicker', () => {
  it('shows an Arabic month name with a Western-digit year', () => {
    setup('2026-10');
    expect(screen.getByText('أكتوبر 2026')).toBeInTheDocument();
  });

  it('cannot go past the current month', () => {
    setup('2026-11');
    expect(
      screen.getByRole('button', { name: ar.reports.month.next }),
    ).toBeDisabled();
  });

  it('cannot go before the first month', () => {
    setup('2026-08');
    expect(
      screen.getByRole('button', { name: ar.reports.month.previous }),
    ).toBeDisabled();
  });

  it('steps back and forward', () => {
    const onChange = setup('2026-10');
    fireEvent.click(
      screen.getByRole('button', { name: ar.reports.month.previous }),
    );
    expect(onChange).toHaveBeenLastCalledWith('2026-09');
    fireEvent.click(
      screen.getByRole('button', { name: ar.reports.month.next }),
    );
    expect(onChange).toHaveBeenLastCalledWith('2026-11');
  });

  it('returns focus to the trigger after choosing a month or pressing Escape', () => {
    setup('2026-11');
    const trigger = screen.getByRole('button', { name: /اختيار الشهر/ });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('option', { name: 'أكتوبر 2026' }));
    expect(trigger).toHaveFocus();
    fireEvent.click(trigger);
    screen.getByRole('option', { name: 'أغسطس 2026' }).focus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('lists only months from the first one to the current one', () => {
    const onChange = setup('2026-11');
    fireEvent.click(screen.getByRole('button', { name: /اختيار الشهر/ }));
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'نوفمبر 2026',
      'أكتوبر 2026',
      'سبتمبر 2026',
      'أغسطس 2026',
    ]);
    fireEvent.click(screen.getByText('أغسطس 2026'));
    expect(onChange).toHaveBeenCalledWith('2026-08');
  });
});
